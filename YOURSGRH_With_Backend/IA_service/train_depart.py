# train_depart.py - Modèle de prédiction du risque de départ VOLONTAIRE
#
# IMPORTANT : Ce modèle prédit uniquement le départ VOLONTAIRE (démission)
# Le licenciement est un modèle séparé (train_licenciement.py)
#
# Features basées sur les données réelles du backend :
# - anciennete_mois       : calculé depuis Employee.date_embauche
# - salaire               : Contrat actif (statut='ACTIF').salaire
# - nb_conges_refuses     : count(Conge) où statut='REFUSE' pour cet employé
# - nb_formations_suivies : count(Inscription) pour cet employé
# - a_equipe              : 1 si Employee.equipe != null, sinon 0
# - solde_conges          : Employee.soldeConges
# - note_moyenne          : moyenne(Evaluation.note) pour cet employé
# - rendement_equipe      : Equipe.rendement (0-100), 50 si pas d'équipe
# - score_performance     : calculé = (note_moyenne/5)*0.6 + (rendement_equipe/100)*0.4
# - nb_promotions         : nombre de fois où le salaire a augmenté entre contrats successifs
# - mois_depuis_formation : mois depuis la dernière formation suivie

import numpy as np
import pandas as pd
from sklearn.ensemble import RandomForestClassifier
from sklearn.model_selection import train_test_split
from sklearn.metrics import classification_report, accuracy_score
import joblib
import os
import json

print("=" * 60)
print("🚀 ENTRAÎNEMENT - RISQUE DE DÉPART VOLONTAIRE")
print("=" * 60)

FEATURES = [
    "anciennete_mois",
    "salaire",
    "nb_conges_refuses",
    "nb_formations_suivies",
    "a_equipe",
    "solde_conges",
    "note_moyenne",
    "rendement_equipe",
    "score_performance",
    "nb_promotions",
    "mois_depuis_formation",
]

print(f"\n📋 {len(FEATURES)} features — toutes calculables depuis le backend")

# ============================================================
# GÉNÉRATION DES DONNÉES SYNTHÉTIQUES
# ============================================================
np.random.seed(42)
n = 10000

anciennete      = np.random.randint(1, 240, n)
salaire         = np.random.randint(150000, 1500000, n)
conges_refuses  = np.random.randint(0, 10, n)
nb_formations   = np.random.randint(0, 20, n)
a_equipe        = np.random.randint(0, 2, n)
solde_conges    = np.random.randint(0, 30, n)
note_moyenne    = np.round(np.random.uniform(1.5, 5.0, n), 1)
rendement_equipe = np.where(a_equipe == 1, np.random.randint(20, 100, n), 50)
nb_promotions   = np.random.randint(0, 5, n)
mois_depuis_formation = np.random.randint(0, 60, n)

# Score de performance composite (calculé côté backend avant envoi à l'IA)
score_performance = np.round(
    (note_moyenne / 5.0) * 0.6 + (rendement_equipe / 100.0) * 0.4, 3
)

df = pd.DataFrame({
    "anciennete_mois":       anciennete,
    "salaire":               salaire,
    "nb_conges_refuses":     conges_refuses,
    "nb_formations_suivies": nb_formations,
    "a_equipe":              a_equipe,
    "solde_conges":          solde_conges,
    "note_moyenne":          note_moyenne,
    "rendement_equipe":      rendement_equipe,
    "score_performance":     score_performance,
    "nb_promotions":         nb_promotions,
    "mois_depuis_formation": mois_depuis_formation,
})

# ============================================================
# RÈGLES MÉTIER — DÉPART VOLONTAIRE UNIQUEMENT
# Causes : insatisfaction salariale, manque de reconnaissance,
#          congés refusés, stagnation de carrière, isolement
# ============================================================
def risque_depart_volontaire(row):
    score = 0

    # 1. Salaire trop bas par rapport à l'ancienneté → frustration principale
    salaire_attendu = 180000 + (row["anciennete_mois"] * 2500)
    ratio_salaire = row["salaire"] / salaire_attendu
    if ratio_salaire < 0.60:
        score += 4
    elif ratio_salaire < 0.75:
        score += 3
    elif ratio_salaire < 0.90:
        score += 1

    # 2. Congés refusés → insatisfaction directe
    if row["nb_conges_refuses"] >= 5:
        score += 3
    elif row["nb_conges_refuses"] >= 3:
        score += 2
    elif row["nb_conges_refuses"] >= 1:
        score += 1

    # 3. Aucune promotion depuis longtemps → sentiment de stagnation de carrière
    if row["nb_promotions"] == 0 and row["anciennete_mois"] >= 24:
        score += 2
    elif row["nb_promotions"] == 0 and row["anciennete_mois"] >= 12:
        score += 1

    # 4. Pas de formation depuis longtemps → sentiment d'abandon
    if row["mois_depuis_formation"] >= 24 and row["anciennete_mois"] >= 12:
        score += 2
    elif row["mois_depuis_formation"] >= 12:
        score += 1

    # 5. Pas d'équipe → isolement
    if row["a_equipe"] == 0 and row["anciennete_mois"] >= 6:
        score += 2

    # 6. Solde de congés très élevé → n'utilise pas ses congés = désengagement
    if row["solde_conges"] >= 25:
        score += 1

    # NOTE : on ne pénalise PAS les mauvaises notes ici
    # (mauvaises notes → risque de licenciement, pas de départ volontaire)
    # Au contraire, un bon employé bien noté mais mal payé part plus facilement
    if row["note_moyenne"] >= 4.0 and ratio_salaire < 0.80:
        score += 1  # bon employé sous-payé → risque accru

    # Bruit réaliste
    score += np.random.randint(-1, 2)

    return 1 if score >= 6 else 0

df["risque_depart"] = df.apply(risque_depart_volontaire, axis=1)

taux = df["risque_depart"].mean() * 100
print(f"\n   ✅ {n} employés générés")
print(f"   📊 Taux de risque de départ : {taux:.1f}%")

# ============================================================
# ENTRAÎNEMENT
# ============================================================
print("\n🏋️ Entraînement Random Forest...")

X = df[FEATURES]
y = df["risque_depart"]
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
print(classification_report(y_test, y_pred, target_names=["Stable", "Risque départ"]))

print("   📌 Importance des features :")
for feat, imp in sorted(zip(FEATURES, modele.feature_importances_), key=lambda x: x[1], reverse=True):
    print(f"      {feat:<30} {imp:.3f}")

# ============================================================
# SAUVEGARDE
# ============================================================
os.makedirs(os.path.join(os.path.dirname(os.path.abspath(__file__)), "models"), exist_ok=True)
joblib.dump(modele, os.path.join(os.path.dirname(os.path.abspath(__file__)), "models", "modele_depart.pkl"))
with open(os.path.join(os.path.dirname(os.path.abspath(__file__)), "models", "meta_depart.json"), "w", encoding="utf-8") as f:
    json.dump({"features": FEATURES}, f, ensure_ascii=False, indent=2)

print("\n   ✅ models/modele_depart.pkl")
print("   ✅ models/meta_depart.json")

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
        "risque_depart": bool(modele.predict(X)[0]),
        "probabilite":   round(float(proba[1]) * 100, 1),
    }

# Bon employé sous-payé avec congés refusés → risque élevé
print("\n📌 Bon employé sous-payé :")
print(predire({
    "anciennete_mois": 36, "salaire": 200000, "nb_conges_refuses": 4,
    "nb_formations_suivies": 2, "a_equipe": 1, "solde_conges": 22,
    "note_moyenne": 4.5, "rendement_equipe": 75,
    "score_performance": round((4.5/5)*0.6 + (75/100)*0.4, 3),
    "nb_promotions": 0, "mois_depuis_formation": 18,
}, modele, FEATURES))

# Employé bien payé, promu, formations récentes → stable
print("\n📌 Employé épanoui :")
print(predire({
    "anciennete_mois": 24, "salaire": 800000, "nb_conges_refuses": 0,
    "nb_formations_suivies": 6, "a_equipe": 1, "solde_conges": 5,
    "note_moyenne": 4.2, "rendement_equipe": 85,
    "score_performance": round((4.2/5)*0.6 + (85/100)*0.4, 3),
    "nb_promotions": 2, "mois_depuis_formation": 4,
}, modele, FEATURES))

print("\n✅ TERMINÉ !")
