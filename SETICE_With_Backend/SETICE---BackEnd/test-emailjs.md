# Test EmailJS

## 1. Test via API (après déploiement)

```bash
# Test avec Postman ou curl
POST https://ton-backend.render.com/email/test-send
Content-Type: application/json

{
  "email": "ton-email@gmail.com",
  "nom": "Test",
  "prenom": "User"
}
```

## 2. Test lors de création d'étudiant

```bash
POST https://ton-backend.render.com/etudiant
Content-Type: application/json

{
  "nom": "Dupont",
  "prenom": "Jean",
  "email": "jean.dupont@gmail.com",
  "telephone": "0123456789",
  "promotion_id": 1
}
```

## 3. Vérification des logs

Dans les logs Render, tu verras :
- ✅ `EmailJS activé (priorité 1)`
- ✅ `Email envoyé via EmailJS à jean.dupont@gmail.com`
- ✅ `EmailJS Response: 200 - OK`

## 4. En cas d'échec

Les identifiants apparaîtront dans les logs :
```
📧 EMAILJS FALLBACK - 18/01/2026 15:30:00
======================================================================
👤 ÉTUDIANT: Jean Dupont
📧 EMAIL: jean.dupont@gmail.com
🔑 MOT DE PASSE: TempPass123!
🔗 CONNEXION: https://ton-frontend.vercel.app/login
======================================================================
```