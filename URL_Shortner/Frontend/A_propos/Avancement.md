🔗 Qu'est-ce qu'un URL Shortner exactement ?
C'est un service qui transforme une longue URL en une version courte et facile à partager. Par exemple :

Longue URL : https://www.example.com/blog/2024/comment-devenir-developpeur-freelance

Courte URL : https://ton-domaine.com/abc123

Quand quelqu'un clique sur la version courte, il est redirigé vers l'URL originale.

🎯 Fonctionnalités à implémenter (niveau Beginner)
1. Fonctionnalités de base (obligatoires)
✅ Interface utilisateur : Un champ de saisie pour l'URL longue et un bouton "Raccourcir"

✅ Génération de code : Créer un identifiant unique (ex: 6-8 caractères alphanumériques)

✅ Redirection : Quand on accède à ton-site.com/abc123, rediriger vers l'URL originale

✅ Stockage : Sauvegarder la correspondance (URL longue ↔ code court)

✅ Affichage du résultat : Montrer l'URL courte générée avec un bouton "Copier"

2. Fonctionnalités bonus (pour se démarquer)
🔄 Statistiques basiques : Nombre de clics sur chaque lien (compteur simple)

📋 Gestion des erreurs :

Validation du format URL

Message si l'URL est invalide

Gestion des doublons (si même URL → retourner le même code)

🎨 Interface responsive : qui fonctionne sur mobile/tablette

⏰ Expiration des liens (optionnel) : Supprimer les liens après X jours

🔒 Protection : Empêcher les redirections vers des sites malveillants (optionnel)

 Prompt pour Lovable
 Je veux créer une maquette d'application web pour un service de raccourcissement d'URL (URL Shortner) avec un design moderne, épuré et professionnel. Voici les spécifications détaillées :

## CONTEXTE
C'est une application web SaaS minimaliste qui permet aux utilisateurs de transformer des URLs longues en liens courts et partageables. Le public cible est composé de professionnels, marketeurs et utilisateurs quotidiens d'internet.

## STRUCTURE DE LA PAGE (Single Page Application)

### 1. EN-TÊTE (Header)
- Logo à gauche : "🔗 LinkShort" avec une typographie moderne
- Menu de navigation à droite : "Accueil", "À propos", "Contact"
- Bouton "Se connecter" (vide, juste pour le design)
- Fond blanc avec une ombre légère en bas

### 2. SECTION HERO (Zone principale)
- Grand titre : "Raccourcissez vos liens en un clic"
- Sous-titre : "Transformez vos longues URLs en liens courts, esthétiques et traçables"
- Zone de saisie centrale :
  - Un grand champ de texte avec un placeholder : "Collez votre long URL ici..."
  - Un bouton "Raccourcir" de couleur primaire (bleu vif #2563EB ou dégradé)
  - Les deux éléments doivent être dans un conteneur arrondi avec une ombre portée
- Sous la zone de saisie, afficher un exemple : "Exemple : https://exemple.com/page-tres-longue → linkshort.xyz/abc123"

### 3. SECTION RÉSULTAT (Apparaît après soumission)
- Apparaît en dessous de la zone de saisie avec une animation de transition
- Design : carte blanche avec bordure verte (#10B981) sur le côté gauche
- Affiche :
  - L'URL courte générée (en bleu, cliquable) : "linkshort.xyz/xyz789"
  - Bouton "Copier" (icône de presse-papier)
  - Bouton "Partager" (optionnel, icône de partage)
  - "Voir les statistiques" en petit lien en bas

### 4. SECTION STATISTIQUES (Bonus)
- Titre : "Suivez vos liens en temps réel"
- Affichage de 3 métriques principales sous forme de cartes :
  - Carte 1 : "Liens créés" avec un nombre (ex: 1,247)
  - Carte 2 : "Clics totaux" avec un nombre (ex: 8,493)
  - Carte 3 : "Taux de conversion" avec un pourcentage (ex: 23.7%)
- Icônes minimalistes pour chaque métrique

### 5. SECTION COMMENT ÇA MARCHE (3 étapes)
- Titre : "Comment ça fonctionne ?"
- 3 étapes en ligne horizontale :
  - Étape 1 : "📝 Collez votre lien" - Description courte
  - Étape 2 : "⚡ Générez le lien court" - Description courte  
  - Étape 3 : "📤 Partagez-le" - Description courte
- Chaque étape doit être dans une carte avec une icône

### 6. PIED DE PAGE (Footer)
- Fond gris foncé (#1F2937) ou noir
- 4 colonnes : 
  - "LinkShort" avec description
  - "Produit" (Fonctionnalités, Tarifs, API)
  - "Ressources" (Blog, Aide, Documentation)
  - "Légal" (Confidentialité, Conditions, Cookies)
- Copyright en bas : "© 2026 LinkShort. Tous droits réservés."

## DESIGN GUIDELINES

### Palette de couleurs
- Primaire : #2563EB (Bleu vif)
- Secondaire : #7C3AED (Violet) - pour accents
- Succès : #10B981 (Vert)
- Fond principal : #F8FAFC (Gris très clair)
- Blanc : #FFFFFF
- Texte principal : #1E293B (Bleu foncé)
- Texte secondaire : #64748B (Gris)

### Typographie
- Police : Inter ou Poppins (modernes)
- Titres : Gras, taille 48px pour le hero
- Sous-titres : Semi-gras, taille 24px
- Corps de texte : Regular, taille 16px

### Éléments UI
- Boutons : Coins arrondis (border-radius: 12px), padding généreux
- Cartes : Ombre légère (box-shadow: 0 4px 6px -1px rgba(0,0,0,0.1))
- Transitions : Douces (0.3s ease) pour les interactions
- Espacement : Utiliser des marges généreuses (gap de 24px)

### Responsive
- Desktop : Layout largeur max 1200px centré
- Tablet : Réduction des marges, texte plus petit
- Mobile : 
  - Hero : Titre plus petit (32px)
  - Zone de saisie : Champ + bouton en colonne
  - 3 étapes : En colonne
  - Footer : 2 colonnes au lieu de 4

## INTERACTIONS (Prototype cliquable)
1. Le champ de saisie doit avoir un focus state (bordure bleue)
2. Le bouton "Raccourcir" doit avoir un hover state (couleur plus foncée)
3. Le résultat doit apparaître avec une animation (slide down ou fade in)
4. Le bouton "Copier" doit changer d'état au survol

## PAGES SUPPLÉMENTAIRES (Pour navigation)
1. Page "À propos" : Simple avec une photo de couverture et du texte
2. Page "Contact" : Formulaire simple (nom, email, message)

## INSTRUCTIONS SPÉCIFIQUES POUR LOVABLE
- Générer un design UI/UX moderne et minimaliste inspiré des outils comme Bitly ou Rebrandly
- Utiliser des composants réutilisables
- Ne pas générer de code fonctionnel, juste la maquette design
- Mettre l'accent sur l'expérience utilisateur et la clarté du layout
- S'assurer que tous les éléments sont bien alignés et espacés

Je veux une maquette qui inspire confiance et professionnalisme, avec une hiérarchie visuelle claire et un parcours utilisateur fluide.