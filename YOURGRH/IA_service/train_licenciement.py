# train_licenciement.py - Modèle de suggestion de licenciement
#
# IMPORTANT : Ce modèle prédit uniquement le risque de licenciement
# (décision de l'entreprise, pas de l'employé)
#
# Features basées sur les données réelles du backend :
# - note_moyenne            : moyenne(Evaluation.note) pour cet employé
# - nb_evaluations          : count(Evaluation) pour cet employé
# - score_performance       : (note_moyenne/5)*0.6 + (rendement_equipe/100)*0.4
# - rendement_equipe        : Equipe.rendement, 50 si pas d'équipe
# - nb_objectifs_atteints   : calculé via rendement équipe + évaluations
# - nb_formations_suivies   : count(Inscription) pour cet employé
# - nb_competences          : count(EmployeCompetence) pour cet employé
# - niveau_moyen_competences: moyenne(EmployeCompetence.niveau)
# - anciennete_mois         : calculé depuis Employee.date_embauche
# - nb_absences_non_justif  : congés avec statut REFUSE ou absences non déclarées
# - mois_depuis_formation   : mois depuis la dernière formation suivie
# - a_equipe                : 1 si Employee.equipe != null

import numpy as np
import pandas as pd
from sklearn.ensemble import RandomForestClassifier
from sklearn.model_selection import train_test_split
from sklearn.metrics import classification_report, accuracy_score
import joblib
import os
import json

print("=" * 60)
print("🚀 ENTRAÎNEMENT - SUGGESTION DE LICENCIEMENT")
print("=" * 60)

FEATURES = [
    "note_moyenne",
    "nb_evaluations",
    "score_performance",
    "rendement_equipe",
    "nb_formations_suivies",
    "nb_competences",
    "niveau_moyen_competences",
    "anciennete_mois",
    "nb_absences_non_justif",
    "mois_depuis_formation",
    "a_equipe",
]

print(f"\n📋 {len(FEATURES)} features — toutes calculables depuis le backend")

# ============================================================
# GÉNÉRATION DES DONNÉES SYNTHÉTIQUES
# ============================================================
np.random.seed(42)
n = 10000

note_moyenne             = np.round(np.random.uniform(1.0, 5.0, n), 1)
nb_evaluations           = np.random.randint(1, 15, n)
a_equipe                 = np.random.randint(0, 2, n)
rendement_equipe         = np.where(a_equipe == 1, np.random.randint(10, 100, n), 50)
nb_formations            = np.random.randint(0, 20, n)
nb_competences           = np.random.randint(0, 15, n)
niveau_moyen_competences = np.round(np.random.uniform(1.0, 5.0, n), 1)
anciennete               = np.random.randint(1, 240, n)
nb_absences              = np.random.randint(0, 15, n)
mois_depuis_formation    = np.random.randint(0, 60, n)

score_performance = np.round(
    (note_moyenne / 5.0) * 0.6 + (rendement_equipe / 100.0) * 0.4, 3
)

df = pd.DataFrame({
    "note_moyenne":             note_moyenne,
    "nb_evaluations":           nb_evaluations,
    "score_performance":        score_performance,
    "rendement_equipe":         rendement_equipe,
    "nb_formations_suivies":    nb_formations,
    "nb_competences":           nb_competences,
    "niveau_moyen_competences": niveau_moyen_competences,
    "anciennete_mois":          anciennete,
    "nb_absences_non_justif":   nb_absences,
    "mois_depuis_formation":    mois_depuis_formation,
    "a_equipe":                 a_equipe,
})

# ============================================================
# RÈGLES MÉTIER — LICENCIEMENT
# Causes : mauvaises performances, stagnation, absences, incompétence
# ============================================================
def risque_licenciement(row):
    score = 0

    # 1. Mauvaises évaluations → signal principal
    if row["note_moyenne"] < 2.0:
        score += 5
    elif row["note_moyenne"] < 2.5:
        score += 4
    elif row["note_moyenne"] < 3.0:
        score += 2

    # 2. Score de performance global faible
    if row["score_performance"] < 0.35:
        score += 3
    elif row["score_performance"] < 0.50:
        score += 2
    elif row["score_performance"] < 0.60:
        score += 1

    # 3. Absences non justifiées
    if row["nb_absences_non_justif"] >= 8:
        score += 3
    elif row["nb_absences_non_justif"] >= 5:
        score += 2
    elif row["nb_absences_non_justif"] >= 3:
        score += 1

    # 4. Stagnation des compétences (peu de compétences ET niveaux faibles)
    if row["nb_competences"] <= 2 and row["anciennete_mois"] >= 12:
        score += 2
    if row["niveau_moyen_competences"] < 2.0 and row["anciennete_mois"] >= 12:
        score += 2
    elif row["niveau_moyen_competences"] < 2.5:
        score += 1

    # 5. Aucune formation depuis très longtemps malgré ancienneté
    if row["mois_depuis_formation"] >= 36 and row["anciennete_mois"] >= 24:
        score += 2
    elif row["mois_depuis_formation"] >= 24 and row["anciennete_mois"] >= 12:
        score += 1

    # 6. Peu d'évaluations (employé non suivi = problème de management ou d'engagement)
    if row["nb_evaluations"] == 0 and row["anciennete_mois"] >= 12:
        score += 1

    # NOTE : on ne pénalise PAS le salaire ici
    # (salaire élevé avec mauvaises perfs → licenciement plus probable)

    # Bruit réaliste
    score += np.random.randint(-1, 2)

    return 1 if score >= 7 else 0

df["risque_licenciement"] = df.apply(risque_licenciement, axis=1)

taux = df["risque_licenciement"].mean() * 100
print(f"\n   ✅ {n} employés générés")
print(f"   📊 Taux de suggestion de licenciement : {taux:.1f}%")

# ============================================================
# ENTRAÎNEMENT
# ============================================================
print("\n🏋️ Entraînement Random Forest...")

X = df[FEATURES]
y = df["risque_licenciement"]
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
# ÉVALUATION
# ============================================================
y_pred = modele.predict(X_test)
accuracy = accuracy_score(y_test, y_pred)
print(f"\n   ✅ Précision : {accuracy * 100:.1f}%")
print(classification_report(y_test, y_pred, target_names=["Pas de risque", "Licenciement suggéré"]))

print("   📌 Importance des features :")
for feat, imp in sorted(zip(FEATURES, modele.feature_importances_), key=lambda x: x[1], reverse=True):
    print(f"      {feat:<35} {imp:.3f}")

# ============================================================
# SAUVEGARDE
# ============================================================
os.makedirs(os.path.join(os.path.dirname(os.path.abspath(__file__)), "models"), exist_ok=True)
joblib.dump(modele, os.path.join(os.path.dirname(os.path.abspath(__file__)), "models", "modele_licenciement.pkl"))
with open(os.path.join(os.path.dirname(os.path.abspath(__file__)), "models", "meta_licenciement.json"), "w", encoding="utf-8") as f:
    json.dump({"features": FEATURES}, f, ensure_ascii=False, indent=2)

print("\n   ✅ models/modele_licenciement.pkl")
print("   ✅ models/meta_licenciement.json")

# ============================================================
# TESTS CONCRETS
# ============================================================
print("\n" + "=" * 60)
print("🔮 TESTS")
print("=" * 60)

def predire(emp, modele, features):
    X = pd.DataFrame([{f: emp.get(f, 0) for f in features}])
    proba = modele.predict_proba(X)[0]
    return {
        "licenciement_suggere": bool(modele.predict(X)[0]),
        "probabilite":          round(float(proba[1]) * 100, 1),
    }

# Employé avec mauvaises performances
print("\n📌 Employé sous-performant :")
print(predire({
    "note_moyenne": 1.8, "nb_evaluations": 5,
    "score_performance": round((1.8/5)*0.6 + (30/100)*0.4, 3),
    "rendement_equipe": 30, "nb_formations_suivies": 0,
    "nb_competences": 1, "niveau_moyen_competences": 1.5,
    "anciennete_mois": 18, "nb_absences_non_justif": 7,
    "mois_depuis_formation": 18, "a_equipe": 1,
}, modele, FEATURES))

# Bon employé
print("\n📌 Bon employé :")
print(predire({
    "note_moyenne": 4.5, "nb_evaluations": 8,
    "score_performance": round((4.5/5)*0.6 + (85/100)*0.4, 3),
    "rendement_equipe": 85, "nb_formations_suivies": 6,
    "nb_competences": 10, "niveau_moyen_competences": 4.2,
    "anciennete_mois": 36, "nb_absences_non_justif": 0,
    "mois_depuis_formation": 3, "a_equipe": 1,
}, modele, FEATURES))

print("\n✅ TERMINÉ !")
