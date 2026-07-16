# test_ia.py - Premier test TensorFlow
import tensorflow as tf
import numpy as np

print("🎉 TensorFlow version:", tf.__version__)

# Créer des données simples pour tester
print("\n📊 Création de données factices...")

# On va créer un petit modèle qui apprend à prédire le salaire idéal
# basé sur l'ancienneté (en années) et le niveau de compétence (1-5)

# Données d'entraînement
anciennete = np.array([1, 2, 3, 4, 5, 6, 7, 8, 9, 10], dtype=float)
competence = np.array([2, 3, 4, 3, 5, 4, 5, 5, 4, 5], dtype=float)
salaire_ideal = np.array([2500, 2800, 3200, 3100, 3800, 3600, 4200, 4500, 4300, 5000], dtype=float)

# Normaliser les données pour faciliter l'apprentissage
anciennete_norm = anciennete / 10
competence_norm = competence / 5
salaire_norm = salaire_ideal / 5000

# Combiner les features
X = np.column_stack([anciennete_norm, competence_norm])
y = salaire_norm

print(f"📈 Données prêtes : {len(X)} exemples")

# Construire un petit modèle (réseau de neurones simple)
print("\n🏗️ Construction du modèle...")

modele = tf.keras.Sequential([
    tf.keras.layers.Dense(16, activation='relu', input_shape=(2,)),
    tf.keras.layers.Dense(8, activation='relu'),
    tf.keras.layers.Dense(1)  # Sortie : salaire prédit
])

modele.compile(optimizer='adam', loss='mse', metrics=['mae'])

print("✅ Modèle créé avec succès")

# Entraîner le modèle
print("\n🏋️ Entraînement du modèle...")
historique = modele.fit(
    X, y,
    epochs=500,           # 500 passages sur les données
    verbose=0,            # Silencieux (on met 0 pour ne pas spam)
    validation_split=0.2  # 20% des données pour validation
)

# Évaluer le modèle
print("\n📊 Évaluation du modèle...")
loss, mae = modele.evaluate(X, y, verbose=0)
print(f"Loss (erreur): {loss:.4f}")
print(f"MAE (erreur moyenne absolue): {mae:.4f}")

# Faire une prédiction pour un nouvel employé
print("\n🔮 Test sur un nouvel employé...")
# Employé : ancienneté 3 ans, niveau compétence 4
nouveau_employe = np.array([[3/10, 4/5]])  # Normalisation
prediction_norm = modele.predict(nouveau_employe, verbose=0)
prediction = prediction_norm[0][0] * 5000  # Dénormalisation

print(f"Pour un employé avec 3 ans d'ancienneté et niveau 4/5 de compétence :")
print(f"Salaire prédit : {prediction:.0f} €")

# Afficher un graphique des résultats
try:
    import matplotlib.pyplot as plt
    
    plt.figure(figsize=(10, 5))
    
    # Graphique des prédictions vs réalité
    predictions = modele.predict(X, verbose=0) * 5000
    realites = y * 5000
    
    plt.subplot(1, 2, 1)
    plt.scatter(realites, predictions, alpha=0.6)
    plt.plot([2000, 5500], [2000, 5500], 'r--')
    plt.xlabel('Salaire réel (€)')
    plt.ylabel('Salaire prédit (€)')
    plt.title('Prédictions vs Réalité')
    
    # Graphique de l'historique d'entraînement
    plt.subplot(1, 2, 2)
    plt.plot(historique.history['loss'], label='Entraînement')
    plt.plot(historique.history['val_loss'], label='Validation')
    plt.xlabel('Époque')
    plt.ylabel('Loss')
    plt.title('Courbe d\'apprentissage')
    plt.legend()
    
    plt.tight_layout()
    plt.savefig('resultats_test.png')
    print("\n📊 Graphique sauvegardé dans 'resultats_test.png'")
except:
    print("\n⚠️ Matplotlib non disponible, graphique ignoré")

print("\n🎉 Test terminé avec succès !")