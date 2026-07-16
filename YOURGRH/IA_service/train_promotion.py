# train_promotion.py - Modèle de suggestion de promotion
# Algorithme : Random Forest (scikit-learn)
#
# IMPORTANT : Toutes les features sont INDIVIDUELLES — aucune feature collective
# Le rendement_equipe est gardé comme contexte uniquement (poids faible)
# Les objectifs d'équipe ont été retirés car ils ne reflètent pas la contribution individuelle
#
# Features basées sur les données réelles du backend :
# - anciennete_mois          : calculé depuis Employee.date_embauche
# - salaire                  : Contrat actif (statut='ACTIF').salaire
# - note_moyenne             : moyenne(Evaluation.note_globale) pour cet employé
# - nb_evaluations           : count(Evaluation) pour cet employé — régularité du suivi
# - nb_formations            : count(Inscription) pour cet employé — investissement personnel
# - nb_promotions            : nombre de fois où le salaire a augmenté entre contrats successifs
# - nb_competences           : count(EmployeCompetence) pour cet employé
# - niveau_moyen_competences : moyenne(EmployeCompetence.niveau) pour cet employé
# - score_performance        : (note_moyenne/5)*0.6 + (rendement_equipe/100)*0.4
# - rendement_equipe         : Equipe.rendement (0-100), 50 si pas d'équipe — contexte uniquement
# - nb_conges_refuses        : count(Conge) où statut='REFUSE' — indicateur de tension

import numpy as np
import pandas as pd
from sklearn.ensemble import RandomForestClassifier
from sklearn.model_selection import train_test_split
from sklearn.metrics import classification_report, accuracy_score
import joblib
import os
import json

print("=" * 60)
print("ENTRAÎNEMENT - MODÈLE SUGGESTION DE PROMOTION")
print("=" * 60)

# ============================================================
# 1. FEATURES — 100% individuelles
# ============================================================
FEATURES = [
    "anciennete_mois",
    "salaire",
    "note_moyenne",
    "nb_evaluations",
    "nb_formations",
    "nb_promotions",
    "nb_competences",
    "niveau_moyen_competences",
    "score_performance",
    "rendement_equipe",       # contexte d'équipe — poids faible
    "nb_conges_refuses",      # indicateur de tension individuelle
]

print(f"\n📋 {len(FEATURES)} features — toutes individuelles (objectifs collectifs retirés)")

# ============================================================
# 2. GÉNÉRATION DES DONNÉES SYNTHÉTIQUES
# ============================================================
print("\n Génération des données synthétiques...")

np.random.seed(42)
n = 10000

anciennete               = np.random.randint(6, 240, n)
salaire                  = np.random.randint(150000, 1500000, n)
note_moyenne             = np.round(np.random.uniform(1.0, 5.0, n), 1)
nb_evaluations           = np.random.randint(1, 15, n)
nb_formations            = np.random.randint(0, 20, n)
nb_promotions            = np.random.randint(0, 5, n)
nb_competences           = np.random.randint(1, 15, n)
niveau_moyen_competences = np.round(np.random.uniform(1.0, 5.0, n), 1)
rendement_equipe         = np.random.randint(20, 100, n)
nb_conges_refuses        = np.random.randint(0, 10, n)

score_performance = np.round(
    (note_moyenne / 5.0) * 0.6 + (rendement_equipe / 100.0) * 0.4, 3
)

df = pd.DataFrame({
    "anciennete_mois":           anciennete,
    "salaire":                   salaire,
    "note_moyenne":              note_moyenne,
    "nb_evaluations":            nb_evaluations,
    "nb_formations":             nb_formations,
    "nb_promotions":             nb_promotions,
    "nb_competences":            nb_competences,
    "niveau_moyen_competences":  niveau_moyen_competences,
    "score_performance":         score_performance,
    "rendement_equipe":          rendement_equipe,
    "nb_conges_refuses":         nb_conges_refuses,
})

# ============================================================
# 3. RÈGLES MÉTIER — PROMOTION INDIVIDUELLE
#
# Un employé mérite une promotion si, INDIVIDUELLEMENT :
# - Il a de bonnes évaluations personnelles (note_moyenne)
# - Il a de l'ancienneté suffisante
# - Il investit dans son développement (formations, compétences)
# - Il n'a pas encore été promu récemment (ou mérite une nouvelle promotion)
# - Son salaire est sous-évalué par rapport à son ancienneté
# ============================================================
def calculer_promotion(row):
    score = 0

    # 1. Évaluations individuelles — critère PRINCIPAL
    # C'est la mesure la plus directe de la performance individuelle
    if row["note_moyenne"] >= 4.5:
        score += 4
    elif row["note_moyenne"] >= 4.0:
        score += 3
    elif row["note_moyenne"] >= 3.5:
        score += 2
    elif row["note_moyenne"] >= 3.0:
        score += 1
    else:
        score -= 2  # mauvaises évaluations → pas de promotion

    # 2. Ancienneté suffisante
    if row["anciennete_mois"] >= 36:
        score += 2
    elif row["anciennete_mois"] >= 18:
        score += 1
    # Moins de 12 mois → trop tôt
    elif row["anciennete_mois"] < 12:
        score -= 1

    # 3. Régularité des évaluations (suivi individuel sérieux)
    if row["nb_evaluations"] >= 6:
        score += 1

    # 4. Investissement personnel en formations
    if row["nb_formations"] >= 5:
        score += 2
    elif row["nb_formations"] >= 2:
        score += 1

    # 5. Expertise individuelle (compétences)
    if row["niveau_moyen_competences"] >= 4.0:
        score += 2
    elif row["niveau_moyen_competences"] >= 3.0:
        score += 1

    if row["nb_competences"] >= 8:
        score += 1

    # 6. Pas encore promu malgré bonne ancienneté → mérite une promotion
    if row["nb_promotions"] == 0 and row["anciennete_mois"] >= 24:
        score += 2
    elif row["nb_promotions"] == 0 and row["anciennete_mois"] >= 12:
        score += 1
    # Déjà promu plusieurs fois → moins urgent
    elif row["nb_promotions"] >= 3:
        score -= 1

    # 7. Salaire sous-évalué par rapport à l'ancienneté
    salaire_attendu = 200000 + (row["anciennete_mois"] * 2500)
    ratio_salaire = row["salaire"] / salaire_attendu
    if ratio_salaire < 0.70:
        score += 2  # très sous-payé → promotion urgente
    elif ratio_salaire < 0.85:
        score += 1

    # 8. Pénalités individuelles
    if row["nb_conges_refuses"] >= 5:
        score -= 1  # tension avec la hiérarchie

    # Bruit réaliste
    score += np.random.randint(-1, 2)

    return 1 if score >= 7 else 0

df["merite_promotion"] = df.apply(calculer_promotion, axis=1)

taux_promotion = df["merite_promotion"].mean() * 100
print(f"   {n} employés générés")
print(f"    Taux de promotion suggérée : {taux_promotion:.1f}%")

# ============================================================
# 4. ENTRAÎNEMENT
# ============================================================
print("\n🏋️ Entraînement du modèle Random Forest...")

X = df[FEATURES]
y = df["merite_promotion"]

X_train, X_test, y_train, y_test = train_test_split(X, y, test_size=0.2, random_state=42)

modele = RandomForestClassifier(
    n_estimators=200,
    max_depth=12,
    min_samples_split=5,
    random_state=42,
    class_weight="balanced",
)
modele.fit(X_train, y_train)

# ============================================================
# 5. ÉVALUATION
# ============================================================
print("\nÉvaluation...")
y_pred = modele.predict(X_test)
accuracy = accuracy_score(y_test, y_pred)
print(f"   Précision : {accuracy * 100:.1f}%")
print("\n   Rapport détaillé :")
print(classification_report(y_test, y_pred, target_names=["Pas de promotion", "Promotion suggérée"]))

print("   📌 Importance des features :")
importances = sorted(
    zip(FEATURES, modele.feature_importances_),
    key=lambda x: x[1],
    reverse=True
)
for feat, imp in importances:
    print(f"      {feat:<35} {imp:.3f}")

# ============================================================
# 6. SAUVEGARDE
# ============================================================
print("\n💾 Sauvegarde...")
os.makedirs(os.path.join(os.path.dirname(os.path.abspath(__file__)), "models"), exist_ok=True)
joblib.dump(modele, os.path.join(os.path.dirname(os.path.abspath(__file__)), "models", "modele_promotion.pkl"))

meta_promotion = {"features": FEATURES}
with open(os.path.join(os.path.dirname(os.path.abspath(__file__)), "models", "meta_promotion.json"), "w", encoding="utf-8") as f:
    json.dump(meta_promotion, f, ensure_ascii=False, indent=2)

print("   ✅ Modèle sauvegardé : models/modele_promotion.pkl")
print("   ✅ Métadonnées : models/meta_promotion.json")

# ============================================================
# 7. TESTS CONCRETS
# ============================================================
print("\n" + "=" * 60)
print("🔮 TESTS CONCRETS")
print("=" * 60)

def predire_promotion(employe: dict, modele, features: list):
    X = pd.DataFrame([{f: employe.get(f, 0) for f in features}])
    proba = modele.predict_proba(X)[0]
    promotion = modele.predict(X)[0]
    return {
        "promotion_suggeree":        bool(promotion),
        "probabilite_promotion":     round(float(proba[1]) * 100, 1),
        "probabilite_non_promotion": round(float(proba[0]) * 100, 1),
    }

# Employé qui mérite une promotion — bonnes évaluations, ancienneté, pas encore promu
print("\n📌 Employé méritant promotion (bonnes perfs individuelles, jamais promu) :")
print(predire_promotion({
    "anciennete_mois": 36, "salaire": 280000,
    "note_moyenne": 4.6, "nb_evaluations": 8,
    "nb_formations": 6, "nb_promotions": 0,
    "nb_competences": 9, "niveau_moyen_competences": 4.1,
    "score_performance": round((4.6/5)*0.6 + (75/100)*0.4, 3),
    "rendement_equipe": 75, "nb_conges_refuses": 0,
}, modele, FEATURES))

# Employé dans une bonne équipe mais mauvaises évaluations personnelles
# → ne doit PAS être promu (profiteur du collectif)
print("\n📌 Profiteur du collectif (bonne équipe, mauvaises évaluations perso) :")
print(predire_promotion({
    "anciennete_mois": 24, "salaire": 350000,
    "note_moyenne": 2.2, "nb_evaluations": 3,
    "nb_formations": 1, "nb_promotions": 0,
    "nb_competences": 3, "niveau_moyen_competences": 2.0,
    "score_performance": round((2.2/5)*0.6 + (90/100)*0.4, 3),
    "rendement_equipe": 90, "nb_conges_refuses": 4,
}, modele, FEATURES))

# Employé déjà bien promu, bien payé → pas urgent
print("\n📌 Employé déjà bien promu :")
print(predire_promotion({
    "anciennete_mois": 60, "salaire": 900000,
    "note_moyenne": 4.0, "nb_evaluations": 10,
    "nb_formations": 8, "nb_promotions": 4,
    "nb_competences": 12, "niveau_moyen_competences": 4.3,
    "score_performance": round((4.0/5)*0.6 + (80/100)*0.4, 3),
    "rendement_equipe": 80, "nb_conges_refuses": 0,
}, modele, FEATURES))

# Employé récent avec bonnes notes → pas encore
print("\n📌 Employé récent (8 mois) bonnes notes mais trop tôt :")
print(predire_promotion({
    "anciennete_mois": 8, "salaire": 200000,
    "note_moyenne": 4.8, "nb_evaluations": 2,
    "nb_formations": 2, "nb_promotions": 0,
    "nb_competences": 4, "niveau_moyen_competences": 3.5,
    "score_performance": round((4.8/5)*0.6 + (70/100)*0.4, 3),
    "rendement_equipe": 70, "nb_conges_refuses": 0,
}, modele, FEATURES))

print("\n✅ ENTRAÎNEMENT TERMINÉ !")
