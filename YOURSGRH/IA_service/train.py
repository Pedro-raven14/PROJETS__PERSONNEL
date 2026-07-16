# train.py - Version avancée avec recommandations multiples et scores

import tensorflow as tf
import numpy as np
import pandas as pd
import os
import json

print("=" * 60)
print("🚀 ENTRAÎNEMENT IA - RECOMMANDATIONS MULTIPLES AVEC SCORES")
print("=" * 60)

# ============================================================
# 1. DÉFINIR LE RÉFÉRENTIEL DE COMPÉTENCES
# ============================================================
# ⚠️ IMPORTANT : Cet ordre DOIT être le même que dans ta base de données
# Plus tard, ces données viendront de ta table "skills"

COMPETENCES_REFERENTIEL = [
    "JavaScript",
    "PHP", 
    "Excel",
    "Word",
    "Python",
    "Leadership",
    "Gestion de projet",
    "Communication",
    "SQL",
    "React",
    "Design UX",
    "DevOps",
    "Marketing",
    "Vente",
    "Comptabilité"
]

n_competences = len(COMPETENCES_REFERENTIEL)
print(f"\n📋 Référentiel de {n_competences} compétences")

# ============================================================
# 2. DÉFINIR LES FORMATIONS AVEC LEURS COMPÉTENCES CIBLES
# ============================================================
# Chaque formation peut cibler plusieurs compétences
# Plus une formation cible une compétence, plus elle est pertinente pour celle-ci

formations = [
    {
        "name": "Formation JavaScript Avancé",
        "cibles": {0: 1.0},  # Compétence 0 (JavaScript) avec poids 1.0
        "description": "Maîtrisez JavaScript moderne"
    },
    {
        "name": "Formation PHP Expert",
        "cibles": {1: 1.0},  # Compétence 1 (PHP)
        "description": "Développement backend avec PHP"
    },
    {
        "name": "Formation Excel Pro",
        "cibles": {2: 1.0},  # Compétence 2 (Excel)
        "description": "Maîtrisez les fonctions avancées Excel"
    },
    {
        "name": "Formation Word Perfectionnement",
        "cibles": {3: 1.0},  # Compétence 3 (Word)
        "description": "Créez des documents professionnels"
    },
    {
        "name": "Formation Python Data Science",
        "cibles": {4: 1.0},  # Compétence 4 (Python)
        "description": "Analyse de données avec Python"
    },
    {
        "name": "Formation Leadership & Management",
        "cibles": {5: 1.0, 6: 0.5},  # Leadership + Gestion projet (poids 0.5)
        "description": "Devenez un leader d'équipe"
    },
    {
        "name": "Formation Communication & Soft Skills",
        "cibles": {7: 1.0},  # Communication
        "description": "Améliorez vos compétences relationnelles"
    },
    {
        "name": "Formation SQL Optimisation",
        "cibles": {8: 1.0},  # SQL
        "description": "Optimisez vos requêtes SQL"
    },
    {
        "name": "Formation React Moderne",
        "cibles": {9: 1.0},  # React
        "description": "Créez des interfaces modernes"
    },
    {
        "name": "Formation UX Design",
        "cibles": {10: 1.0},  # Design UX
        "description": "Concevez des expériences utilisateur"
    },
    {
        "name": "Formation DevOps & CI/CD",
        "cibles": {11: 1.0},  # DevOps
        "description": "Automatisez vos déploiements"
    },
    {
        "name": "Formation Marketing Digital",
        "cibles": {12: 1.0},  # Marketing
        "description": "Stratégies marketing modernes"
    },
    {
        "name": "Formation Techniques de Vente",
        "cibles": {13: 1.0},  # Vente
        "description": "Améliorez vos performances commerciales"
    },
    {
        "name": "Formation Comptabilité",
        "cibles": {14: 1.0},  # Comptabilité
        "description": "Maîtrisez les bases comptables"
    }
]

print(f"📚 {len(formations)} formations disponibles")

# ============================================================
# 3. GÉNÉRER DES DONNÉES SYNTHÉTIQUES (plus réalistes)
# ============================================================
print("\n📊 Génération des données synthétiques...")

np.random.seed(42)
n_employes = 5000  # Plus d'employés = meilleur apprentissage

# Créer des vecteurs de compétences pour chaque employé
competences_vecteur = np.zeros((n_employes, n_competences))

for i in range(n_employes):
    # Chaque employé maîtrise entre 3 et 12 compétences
    nb_competences = np.random.randint(3, 13)
    indices = np.random.choice(n_competences, nb_competences, replace=False)
    
    # Niveaux : certains sont faibles, d'autres forts
    # Distribution réaliste : plus de niveaux moyens (2-4)
    niveaux = []
    for _ in range(nb_competences):
        # 20% de chances d'avoir un niveau expert (5)
        # 30% de chances d'avoir un niveau avancé (4)
        # 30% de chances d'avoir un niveau intermédiaire (3)
        # 15% de chances d'avoir un niveau débutant (2)
        # 5% de chances d'avoir un niveau très faible (1)
        r = np.random.random()
        if r < 0.05:
            niveaux.append(1)      # Très faible
        elif r < 0.20:
            niveaux.append(2)      # Débutant
        elif r < 0.50:
            niveaux.append(3)      # Intermédiaire
        elif r < 0.80:
            niveaux.append(4)      # Avancé
        else:
            niveaux.append(5)      # Expert
    
    competences_vecteur[i, indices] = niveaux

print(f"   ✅ {n_employes} employés générés")

# ============================================================
# 4. CALCULER LES RECOMMANDATIONS AVEC SCORES DE PRIORITÉ
# ============================================================
# Pour chaque employé, on va générer un classement des formations
# La priorité est plus élevée quand la compétence ciblée est faible

print("\n🎯 Calcul des recommandations avec scores de priorité...")

# Structure : pour chaque employé, une liste de (formation_index, priorité)
toutes_recommandations = []

for emp in competences_vecteur:
    # Calculer un score de priorité pour chaque formation
    scores_formation = []
    
    for f_idx, formation in enumerate(formations):
        score_total = 0
        poids_total = 0
        
        # Pour chaque compétence ciblée par la formation
        for comp_idx, poids in formation["cibles"].items():
            niveau = emp[comp_idx]
            if niveau > 0:  # L'employé a cette compétence
                # Plus le niveau est faible, plus la priorité est élevée
                # Formule : priorité = (6 - niveau) * poids
                # Niveau 1 → priorité 5 * poids
                # Niveau 2 → priorité 4 * poids
                # Niveau 3 → priorité 3 * poids
                # Niveau 4 → priorité 2 * poids
                # Niveau 5 → priorité 1 * poids
                priorite = (6 - niveau) * poids
                score_total += priorite
                poids_total += poids
        
        # Normaliser le score
        if poids_total > 0:
            score = score_total / poids_total
        else:
            score = 0  # L'employé n'a aucune compétence ciblée
        
        scores_formation.append((f_idx, score))
    
    # Trier par score décroissant (plus prioritaire en premier)
    scores_formation.sort(key=lambda x: x[1], reverse=True)
    toutes_recommandations.append(scores_formation)

print(f"   ✅ {len(toutes_recommandations)} employés traités")

# ============================================================
# 5. PRÉPARER LES DONNÉES POUR L'ENTRAÎNEMENT
# ============================================================
# On va entraîner le modèle à prédire le TOP 3 des formations
# avec leurs scores associés

print("\n🏗️ Préparation des données pour l'entraînement...")

# On crée un vecteur de sortie de taille (n_formations * 3) pour le TOP 3
# Chaque formation a une probabilité associée
n_formations = len(formations)
y_multi = np.zeros((n_employes, n_formations))

for i, recommandations in enumerate(toutes_recommandations):
    # Pour les 3 premières formations recommandées
    for rank, (f_idx, score) in enumerate(recommandations[:3]):
        # Plus le rang est élevé, plus le score est important
        # 1er : 0.7, 2ème : 0.2, 3ème : 0.1
        if rank == 0:
            y_multi[i, f_idx] = 0.7
        elif rank == 1:
            y_multi[i, f_idx] = 0.2
        elif rank == 2:
            y_multi[i, f_idx] = 0.1

print(f"   ✅ Données prêtes : X={competences_vecteur.shape}, y={y_multi.shape}")

# ============================================================
# 6. DIVISER LES DONNÉES
# ============================================================
print("\n✂️ Division train/test...")
split = int(0.8 * n_employes)
X_train = competences_vecteur[:split]
X_test = competences_vecteur[split:]
y_train = y_multi[:split]
y_test = y_multi[split:]

print(f"   ✅ Entraînement : {len(X_train)} employés")
print(f"   ✅ Test : {len(X_test)} employés")

# ============================================================
# 7. CONSTRUIRE LE MODÈLE (Réseau de neurones)
# ============================================================
print("\n🏗️ Construction du modèle...")

modele = tf.keras.Sequential([
    # Couche d'entrée : prend les compétences de l'employé
    tf.keras.layers.Dense(128, activation='relu', input_shape=(n_competences,)),
    tf.keras.layers.BatchNormalization(),
    tf.keras.layers.Dropout(0.3),
    
    # Couche cachée 1
    tf.keras.layers.Dense(64, activation='relu'),
    tf.keras.layers.Dropout(0.3),
    
    # Couche cachée 2
    tf.keras.layers.Dense(32, activation='relu'),
    tf.keras.layers.Dropout(0.2),
    
    # Couche de sortie : probabilité pour chaque formation
    tf.keras.layers.Dense(n_formations, activation='sigmoid')
])

modele.compile(
    optimizer='adam',
    loss='mse',  # Mean Squared Error pour les scores continus
    metrics=['mae']  # Mean Absolute Error
)

print("   ✅ Modèle créé")
modele.summary()

# ============================================================
# 8. ENTRAÎNER LE MODÈLE
# ============================================================
print("\n🏋️ Entraînement...")

historique = modele.fit(
    X_train, y_train,
    epochs=100,
    validation_split=0.2,
    batch_size=32,
    verbose=1
)

# ============================================================
# 9. ÉVALUER
# ============================================================
print("\n📊 Évaluation...")
test_loss, test_mae = modele.evaluate(X_test, y_test, verbose=0)
print(f"   ✅ Erreur moyenne (MAE): {test_mae:.4f}")
print(f"   ✅ Meilleur MAE possible: 0")

# ============================================================
# 10. SAUVEGARDER
# ============================================================
print("\n💾 Sauvegarde...")
os.makedirs('models', exist_ok=True)

# Sauvegarder le modèle
modele.save('models/modele_recommandation_multi.h5')

# Sauvegarder aussi les métadonnées (formations, compétences)
metadonnees = {
    "competences": COMPETENCES_REFERENTIEL,
    "formations": [
        {"name": f["name"], "description": f["description"]}
        for f in formations
    ]
}
with open('models/metadonnees.json', 'w', encoding='utf-8') as f:
    json.dump(metadonnees, f, ensure_ascii=False, indent=2)

print("   ✅ Modèle sauvegardé dans 'models/modele_recommandation_multi.h5'")
print("   ✅ Métadonnées sauvegardées dans 'models/metadonnees.json'")

# ============================================================
# 11. TEST AVEC DES EXEMPLES CONCRETS
# ============================================================
print("\n" + "=" * 60)
print("🔮 TESTS AVEC DES EXEMPLES CONCRETS")
print("=" * 60)

def analyser_recommandations(competences_reelles, modele, formations):
    """Fonction pour analyser les recommandations d'un employé"""
    
    # Préparer le vecteur d'entrée
    X = np.array([competences_reelles])
    
    # Prédire les scores
    scores = modele.predict(X, verbose=0)[0]
    
    # Créer la liste des formations avec leurs scores
    recommandations = []
    for i, formation in enumerate(formations):
        recommandations.append({
            "name": formation["name"],
            "score": scores[i],
            "description": formation["description"]
        })
    
    # Trier par score décroissant
    recommandations.sort(key=lambda x: x["score"], reverse=True)
    
    return recommandations

# Test 1 : Employé junior qui a besoin de formation
print("\n📌 TEST 1 : Employé Junior (JavaScript niveau 2)")
test1 = np.zeros(n_competences)
test1[0] = 2  # JavaScript niveau 2 (faible)
recos1 = analyser_recommandations(test1, modele, formations)
print("   Top 3 recommandations :")
for i, rec in enumerate(recos1[:3]):
    print(f"   {i+1}. {rec['name']} (score: {rec['score']:.3f})")
    print(f"      → {rec['description']}")

# Test 2 : Employé avec plusieurs compétences faibles
print("\n📌 TEST 2 : Employé avec plusieurs lacunes")
test2 = np.zeros(n_competences)
test2[2] = 2  # Excel niveau 2
test2[5] = 1  # Leadership niveau 1 (très faible)
test2[7] = 3  # Communication niveau 3
recos2 = analyser_recommandations(test2, modele, formations)
print("   Top 5 recommandations :")
for i, rec in enumerate(recos2[:5]):
    print(f"   {i+1}. {rec['name']} (score: {rec['score']:.3f})")

# Test 3 : Employé expert
print("\n📌 TEST 3 : Employé Expert (tous niveaux 5)")
test3 = np.ones(n_competences) * 5
recos3 = analyser_recommandations(test3, modele, formations)
print("   Top 3 recommandations :")
for i, rec in enumerate(recos3[:3]):
    print(f"   {i+1}. {rec['name']} (score: {rec['score']:.3f})")

# Test 4 : Employé avec des compétences variées
print("\n📌 TEST 4 : Employé avec compétences variées")
test4 = np.zeros(n_competences)
test4[0] = 4  # JavaScript: avancé
test4[1] = 5  # PHP: expert
test4[2] = 2  # Excel: faible
test4[8] = 3  # SQL: intermédiaire
test4[9] = 1  # React: très faible
recos4 = analyser_recommandations(test4, modele, formations)
print("   Top 5 recommandations :")
for i, rec in enumerate(recos4[:5]):
    print(f"   {i+1}. {rec['name']} (score: {rec['score']:.3f})")

print("\n" + "=" * 60)
print("✅ ENTRAÎNEMENT TERMINÉ !")
print("=" * 60)
print("\n💡 COMMENT UTILISER LE MODÈLE PLUS TARD :")
print("   1. Charger le modèle: model = tf.keras.models.load_model('models/modele_recommandation_multi.h5')")
print("   2. Charger les métadonnées pour avoir les noms des formations")
print("   3. Préparer le vecteur de compétences de l'employé (même ordre que le référentiel)")
print("   4. Faire la prédiction: scores = model.predict(vecteur)[0]")
print("   5. Trier les formations par score pour obtenir le classement")