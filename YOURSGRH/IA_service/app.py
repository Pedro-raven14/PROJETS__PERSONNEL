"""
Service IA - YOURSGRH
Serveur Flask qui expose les modèles de prédiction RH

Endpoints :
  POST /predict/formation      → recommandations de formations
  POST /predict/depart         → risque de départ volontaire
  POST /predict/licenciement   → suggestion de licenciement
  POST /predict/promotion      → suggestion de promotion
  GET  /health                 → vérification que le service tourne
"""

import os
import json
import numpy as np
import pandas as pd
import joblib
import tensorflow as tf
from flask import Flask, request, jsonify
from flask_cors import CORS

app = Flask(__name__)
CORS(app)

BASE_DIR   = os.path.dirname(os.path.abspath(__file__))
MODELS_DIR = os.path.join(BASE_DIR, "models")

# ============================================================
# CHARGEMENT DES MODÈLES AU DÉMARRAGE
# ============================================================
print("🔄 Chargement des modèles...")

try:
    # Essayer d'abord le format natif Keras (.keras), puis fallback sur .h5
    keras_path = os.path.join(MODELS_DIR, "modele_recommandation_multi.keras")
    h5_path    = os.path.join(MODELS_DIR, "modele_recommandation_multi.h5")
    model_path = keras_path if os.path.exists(keras_path) else h5_path
    modele_formation = tf.keras.models.load_model(model_path)
    with open(os.path.join(MODELS_DIR, "metadonnees.json"), encoding="utf-8") as f:
        meta_formation = json.load(f)
    COMPETENCES = meta_formation["competences"]
    FORMATIONS  = meta_formation["formations"]
    print(f"   ✅ Formation ({len(FORMATIONS)} formations, {len(COMPETENCES)} compétences)")
except Exception as e:
    modele_formation = None
    print(f"   ❌ Formation non disponible : {e}")

try:
    modele_depart = joblib.load(os.path.join(MODELS_DIR, "modele_depart.pkl"))
    with open(os.path.join(MODELS_DIR, "meta_depart.json"), encoding="utf-8") as f:
        FEATURES_DEPART = json.load(f)["features"]
    print(f"   ✅ Départ ({len(FEATURES_DEPART)} features)")
except Exception as e:
    modele_depart = None
    print(f"   ❌ Départ non disponible : {e}")

try:
    modele_licenciement = joblib.load(os.path.join(MODELS_DIR, "modele_licenciement.pkl"))
    with open(os.path.join(MODELS_DIR, "meta_licenciement.json"), encoding="utf-8") as f:
        FEATURES_LICENCIEMENT = json.load(f)["features"]
    print(f"   ✅ Licenciement ({len(FEATURES_LICENCIEMENT)} features)")
except Exception as e:
    modele_licenciement = None
    print(f"   ❌ Licenciement non disponible : {e}")

try:
    modele_promotion = joblib.load(os.path.join(MODELS_DIR, "modele_promotion.pkl"))
    with open(os.path.join(MODELS_DIR, "meta_promotion.json"), encoding="utf-8") as f:
        FEATURES_PROMOTION = json.load(f)["features"]
    print(f"   ✅ Promotion ({len(FEATURES_PROMOTION)} features)")
except Exception as e:
    modele_promotion = None
    print(f"   ❌ Promotion non disponible : {e}")

print("✅ Service prêt\n")

# ============================================================
# HELPERS
# ============================================================

def erreur(message: str, code: int = 400):
    return jsonify({"success": False, "error": message}), code

def niveau_risque(probabilite: float) -> str:
    if probabilite >= 70: return "ÉLEVÉ"
    if probabilite >= 45: return "MODÉRÉ"
    return "FAIBLE"

def construire_analyse_depart(emp: dict, probabilite: float) -> dict:
    """Analyse détaillée du risque de départ VOLONTAIRE."""
    anciennete       = emp.get("anciennete_mois", 0)
    salaire          = emp.get("salaire", 0)
    conges_refuses   = emp.get("nb_conges_refuses", 0)
    nb_formations    = emp.get("nb_formations_suivies", 0)
    a_equipe         = emp.get("a_equipe", 1)
    note_moyenne     = emp.get("note_moyenne", 3.0)
    rendement_equipe = emp.get("rendement_equipe", 50)
    nb_promotions    = emp.get("nb_promotions", 0)
    mois_formation   = emp.get("mois_depuis_formation", 0)
    solde_conges     = emp.get("solde_conges", 0)

    salaire_attendu = 180000 + (anciennete * 2500)
    ratio_salaire   = salaire / salaire_attendu if salaire_attendu > 0 else 1.0

    facteurs_risque    = []
    facteurs_retention = []
    actions            = []

    if ratio_salaire < 0.75:
        facteurs_risque.append("Rémunération significativement en dessous du marché")
        actions.append({"categorie": "Revoir la rémunération", "action": "Discuter prime ou augmentation salariale"})
    elif ratio_salaire < 0.90:
        facteurs_risque.append("Faible augmentation récente")
        actions.append({"categorie": "Revoir la rémunération", "action": "Envisager une révision salariale"})

    if conges_refuses >= 3:
        facteurs_risque.append(f"{conges_refuses} demandes de congés refusées")
        actions.append({"categorie": "Gestion des congés", "action": "Revoir la politique de validation des congés"})
    elif conges_refuses >= 1:
        facteurs_risque.append("Congés refusés récemment")

    if nb_promotions == 0 and anciennete >= 24:
        facteurs_risque.append("Aucune évolution de carrière depuis 2 ans ou plus")
        actions.append({"categorie": "Évolution de carrière", "action": "Planifier un entretien de carrière"})
    elif nb_promotions == 0 and anciennete >= 12:
        facteurs_risque.append("Pas encore de promotion après 1 an")
        actions.append({"categorie": "Entretien de carrière", "action": "Planifier un 1:1 dédié"})

    if mois_formation >= 18 and anciennete >= 12:
        facteurs_risque.append(f"Aucune formation depuis {mois_formation} mois")
        actions.append({"categorie": "Proposer une formation", "action": "Développer les compétences"})

    if a_equipe == 0 and anciennete >= 6:
        facteurs_risque.append("Non assigné à une équipe — sentiment d'isolement")
        actions.append({"categorie": "Intégration", "action": "Assigner à une équipe adaptée"})

    if anciennete < 12:
        facteurs_risque.append("Ancienneté courte — période d'intégration critique")
        actions.append({"categorie": "Onboarding", "action": "Renforcer l'accompagnement en période d'essai"})

    if solde_conges >= 20:
        facteurs_risque.append("Solde de congés très élevé — signe de désengagement")

    if note_moyenne >= 4.0:
        facteurs_retention.append("Bonnes évaluations — employé reconnu pour ses performances")
    if rendement_equipe >= 70 and a_equipe == 1:
        facteurs_retention.append("Équipe performante — environnement de travail stimulant")
    if nb_formations >= 3:
        facteurs_retention.append("Plusieurs formations suivies — investissement dans le développement")
    if nb_promotions >= 1:
        facteurs_retention.append("A déjà bénéficié d'une promotion — sentiment de progression")
    if conges_refuses == 0:
        facteurs_retention.append("Aucun congé refusé — bonne qualité de vie au travail")
    if ratio_salaire >= 0.95:
        facteurs_retention.append("Rémunération alignée avec l'ancienneté")

    if not actions:
        actions.append({"categorie": "Suivi général", "action": "Maintenir le suivi régulier"})

    return {
        "userId":               emp.get("userId"),
        "nom":                  emp.get("nom", ""),
        "prenom":               emp.get("prenom", ""),
        "poste":                emp.get("poste", ""),
        "probabilite_depart":   probabilite,
        "niveau_risque":        niveau_risque(probabilite),
        "facteurs_risque":      facteurs_risque,
        "facteurs_retention":   facteurs_retention,
        "actions_recommandees": actions,
    }

def construire_analyse_licenciement(emp: dict, probabilite: float) -> dict:
    """Analyse détaillée de la suggestion de licenciement."""
    note_moyenne             = emp.get("note_moyenne", 3.0)
    score_performance        = emp.get("score_performance", 0.5)
    nb_formations            = emp.get("nb_formations_suivies", 0)
    nb_competences           = emp.get("nb_competences", 0)
    niveau_moyen_competences = emp.get("niveau_moyen_competences", 3.0)
    anciennete               = emp.get("anciennete_mois", 0)
    nb_absences              = emp.get("nb_absences_non_justif", 0)
    mois_formation           = emp.get("mois_depuis_formation", 0)

    motifs          = []
    points_positifs = []
    actions         = []

    if note_moyenne < 2.0:
        motifs.append("Évaluations très insuffisantes (note < 2/5)")
        actions.append({"categorie": "Plan d'amélioration", "action": "Mettre en place un plan de performance immédiat"})
    elif note_moyenne < 2.5:
        motifs.append("Évaluations insuffisantes")
        actions.append({"categorie": "Plan d'amélioration", "action": "Définir des objectifs clairs et mesurables"})

    if score_performance < 0.40:
        motifs.append("Score de performance global très faible")
    elif score_performance < 0.55:
        motifs.append("Performance en dessous des attentes")

    if nb_absences >= 5:
        motifs.append(f"{nb_absences} absences non justifiées")
        actions.append({"categorie": "Gestion des absences", "action": "Entretien disciplinaire et avertissement formel"})
    elif nb_absences >= 3:
        motifs.append("Absences répétées non justifiées")
        actions.append({"categorie": "Gestion des absences", "action": "Entretien de recadrage"})

    if nb_competences <= 2 and anciennete >= 12:
        motifs.append("Compétences insuffisantes pour le poste")
        actions.append({"categorie": "Formation obligatoire", "action": "Plan de formation intensif ou reconversion"})

    if niveau_moyen_competences < 2.0 and anciennete >= 12:
        motifs.append("Niveaux de compétences très faibles")

    if mois_formation >= 36 and anciennete >= 24:
        motifs.append("Aucune formation suivie depuis 3 ans — stagnation totale")
        actions.append({"categorie": "Développement", "action": "Proposer un plan de développement ou envisager une reconversion"})

    if note_moyenne >= 3.5:
        points_positifs.append("Évaluations correctes malgré les difficultés")
    if nb_formations >= 2:
        points_positifs.append("A suivi des formations — volonté de progresser")
    if anciennete >= 36:
        points_positifs.append(f"Ancienneté de {anciennete} mois — expérience à valoriser")
    if nb_absences == 0:
        points_positifs.append("Aucune absence non justifiée — présence régulière")

    if not actions:
        actions.append({"categorie": "Évaluation RH", "action": "Entretien individuel approfondi avant toute décision"})

    return {
        "userId":               emp.get("userId"),
        "nom":                  emp.get("nom", ""),
        "prenom":               emp.get("prenom", ""),
        "poste":                emp.get("poste", ""),
        "probabilite_licenciement": probabilite,
        "niveau_risque":        niveau_risque(probabilite),
        "motifs":               motifs,
        "points_positifs":      points_positifs,
        "actions_recommandees": actions,
    }

def construire_message_promotion(employes_promus: list) -> str:
    if not employes_promus:
        return "Aucun employé ne remplit actuellement les critères pour une promotion."
    noms = [f"{e.get('prenom', '')} {e.get('nom', '')}".strip() for e in employes_promus]
    if len(noms) == 1:
        return f"{noms[0]} mérite une promotion selon les critères de performance, d'ancienneté et d'engagement."
    liste = ", ".join(noms[:-1]) + f" et {noms[-1]}"
    return f"{liste} méritent une promotion selon les critères de performance, d'ancienneté et d'engagement."

# ============================================================
# ENDPOINTS
# ============================================================

@app.route("/health", methods=["GET"])
def health():
    return jsonify({
        "success": True,
        "service": "YOURSGRH IA Service",
        "modeles": {
            "formation":    modele_formation    is not None,
            "depart":       modele_depart       is not None,
            "licenciement": modele_licenciement is not None,
            "promotion":    modele_promotion    is not None,
        }
    })


@app.route("/predict/formation", methods=["POST"])
def predict_formation():
    """
    Recommande des formations à un employé basé sur :
    1. Ses compétences réelles et leurs niveaux
    2. Les compétences ciblées par chaque formation
    3. Son niveau moyen global
    4. Son historique de formations
    5. Ses évaluations
    """
    data = request.get_json()
    if not data or "employe" not in data or "formations" not in data:
        return erreur("Champs 'employe' et 'formations' requis")

    employe   = data["employe"]
    formations = data["formations"]
    top_n     = int(data.get("top_n", 3))

    if not formations:
        return jsonify({
            "success": True,
            "type": "RECOMMANDATION_FORMATION",
            "message": "Aucune formation disponible.",
            "recommandations": [],
            "employes_concernes": [employe],
        })

    competences_employe      = employe.get("competences", {})          # { "JavaScript": 3, "SQL": 2, ... }
    niveau_moyen             = float(employe.get("niveau_moyen_competences", 2.5))
    nb_formations_suivies    = int(employe.get("nb_formations_suivies", 0))
    note_moyenne             = float(employe.get("note_moyenne", 3.0))

    scores = []

    for f in formations:
        score = 0.0
        competences_cibles = f.get("competences", [])
        inscrits  = int(f.get("inscrits", 0))
        capacite  = int(f.get("capacite", 1))
        niveau_f  = f.get("niveau", "DÉBUTANT")

        niveau_map = {"DÉBUTANT": 1, "INTERMÉDIAIRE": 2, "AVANCÉ": 3, "EXPERT": 4}
        val_f = niveau_map.get(niveau_f, 1)

        # ── Critère 1 : correspondance compétences ciblées ──
        # C'est le critère PRINCIPAL — si la formation cible une compétence
        # que l'employé a à un niveau faible/moyen, c'est très pertinent
        if competences_cibles:
            bonus_comp = 0.0
            nb_correspondances = 0
            for nom_comp in competences_cibles:
                if nom_comp in competences_employe:
                    niveau_emp = competences_employe[nom_comp]
                    # Niveau 1 → 30 pts (très faible, besoin urgent)
                    # Niveau 2 → 25 pts
                    # Niveau 3 → 20 pts (intermédiaire, peut progresser)
                    # Niveau 4 → 10 pts (avancé, peu de marge)
                    # Niveau 5 → 0 pts  (expert, inutile)
                    pts = max(0, (6 - niveau_emp) * 6)
                    bonus_comp += pts
                    nb_correspondances += 1
                else:
                    # Compétence absente → très utile pour l'acquérir
                    bonus_comp += 25
                    nb_correspondances += 1

            # Bonus si plusieurs compétences correspondent
            if nb_correspondances > 0:
                score += min(50, bonus_comp)  # plafonné à 50 pts
        else:
            # Pas de compétences liées → score de base faible
            score += 5

        # ── Critère 2 : adéquation niveau formation / niveau moyen employé ──
        # Critère secondaire — moins important que la correspondance compétences
        if niveau_moyen <= 2.0:
            attendu = 1
        elif niveau_moyen <= 3.5:
            attendu = 2
        elif niveau_moyen <= 4.5:
            attendu = 3
        else:
            attendu = 4

        diff = abs(val_f - attendu)
        if diff == 0:
            score += 20
        elif diff == 1:
            score += 10
        else:
            score += 2

        # ── Critère 3 : peu de formations suivies → boost ──
        if nb_formations_suivies == 0:
            score += 10
        elif nb_formations_suivies <= 2:
            score += 5

        # ── Critère 4 : mauvaises évaluations → favoriser les formations de base ──
        if note_moyenne < 3.0 and val_f == 1:
            score += 8

        # ── Critère 5 : places disponibles ──
        if capacite > 0 and inscrits < capacite:
            score += 3

        scores.append({
            "formationId": f.get("formationId"),
            "formation":   f.get("titre", ""),
            "niveau":      niveau_f,
            "score":       round(score, 2),
            "competences_cibles": competences_cibles,
        })

    # Trier par score décroissant, prendre le top N
    scores.sort(key=lambda x: x["score"], reverse=True)
    recommandations = [
        {
            "rang":              i + 1,
            "formationId":       r["formationId"],
            "formation":         r["formation"],
            "niveau":            r["niveau"],
            "score":             r["score"],
            "competences_cibles": r["competences_cibles"],
        }
        for i, r in enumerate(scores[:top_n])
    ]

    nom_complet = f"{employe.get('prenom', '')} {employe.get('nom', '')}".strip()
    noms = [r["formation"] for r in recommandations]
    if noms:
        message = f"Pour {nom_complet}, les formations recommandées sont : {', '.join(noms)}."
    else:
        message = f"Aucune formation pertinente trouvée pour {nom_complet}."

    return jsonify({
        "success":            True,
        "type":               "RECOMMANDATION_FORMATION",
        "message":            message,
        "recommandations":    recommandations,
        "employes_concernes": [employe],
    })


@app.route("/predict/depart", methods=["POST"])
def predict_depart():
    if modele_depart is None:
        return erreur("Modèle départ non disponible", 503)

    data = request.get_json()
    if not data or "employes" not in data:
        return erreur("Champ 'employes' manquant")

    employes = data["employes"]
    if not employes:
        return jsonify({
            "success": True,
            "type": "RISQUE_DEPART",
            "message": "Aucun employé à analyser.",
            "resultats": [],
            "nb_a_risque": 0,
            "employes_concernes": [],
        })

    resultats         = []
    employes_a_risque = []

    for emp in employes:
        try:
            X          = pd.DataFrame([{f: emp.get(f, 0) or 0 for f in FEATURES_DEPART}])
            proba      = modele_depart.predict_proba(X)[0]
            risque     = bool(modele_depart.predict(X)[0])
            probabilite = round(float(proba[1]) * 100, 1)

            analyse = construire_analyse_depart(emp, probabilite)
            analyse["risque_depart"] = risque
            resultats.append(analyse)

            if risque:
                employes_a_risque.append(emp)
        except Exception as e:
            print(f"   ⚠️ Erreur analyse départ pour userId={emp.get('userId')}: {e}")

    if employes_a_risque:
        noms = [f"{e.get('prenom', '')} {e.get('nom', '')}".strip() for e in employes_a_risque]
        liste = ", ".join(noms[:-1]) + f" et {noms[-1]}" if len(noms) > 1 else noms[0]
        message = f"{liste} présente(nt) un risque de départ. Des actions sont recommandées."
    else:
        message = "Aucun employé ne présente de risque de départ significatif actuellement."

    return jsonify({
        "success":            True,
        "type":               "RISQUE_DEPART",
        "message":            message,
        "resultats":          resultats,
        "nb_a_risque":        len(employes_a_risque),
        "employes_concernes": employes_a_risque,
    })


@app.route("/predict/licenciement", methods=["POST"])
def predict_licenciement():
    if modele_licenciement is None:
        return erreur("Modèle licenciement non disponible", 503)

    data = request.get_json()
    if not data or "employes" not in data:
        return erreur("Champ 'employes' manquant")

    employes = data["employes"]
    if not employes:
        return jsonify({
            "success": True,
            "type": "SUGGESTION_LICENCIEMENT",
            "message": "Aucun employé à analyser.",
            "resultats": [],
            "nb_concernes": 0,
            "employes_concernes": [],
        })

    resultats              = []
    employes_concernes     = []

    for emp in employes:
        try:
            X           = pd.DataFrame([{f: emp.get(f, 0) or 0 for f in FEATURES_LICENCIEMENT}])
            proba       = modele_licenciement.predict_proba(X)[0]
            suggere     = bool(modele_licenciement.predict(X)[0])
            probabilite = round(float(proba[1]) * 100, 1)

            analyse = construire_analyse_licenciement(emp, probabilite)
            analyse["licenciement_suggere"] = suggere
            resultats.append(analyse)

            if suggere:
                employes_concernes.append(emp)
        except Exception as e:
            print(f"   ⚠️ Erreur analyse licenciement pour userId={emp.get('userId')}: {e}")

    if employes_concernes:
        noms = [f"{e.get('prenom', '')} {e.get('nom', '')}".strip() for e in employes_concernes]
        liste = ", ".join(noms[:-1]) + f" et {noms[-1]}" if len(noms) > 1 else noms[0]
        message = (
            f"Attention : {liste} présente(nt) des indicateurs préoccupants. "
            f"Une évaluation RH approfondie est recommandée avant toute décision."
        )
    else:
        message = "Aucun employé ne présente d'indicateurs justifiant une procédure de licenciement."

    return jsonify({
        "success":            True,
        "type":               "SUGGESTION_LICENCIEMENT",
        "message":            message,
        "resultats":          resultats,
        "nb_concernes":       len(employes_concernes),
        "employes_concernes": employes_concernes,
    })


@app.route("/predict/promotion", methods=["POST"])
def predict_promotion():
    if modele_promotion is None:
        return erreur("Modèle promotion non disponible", 503)

    data = request.get_json()
    if not data or "employes" not in data:
        return erreur("Champ 'employes' manquant")

    employes = data["employes"]
    if not employes:
        return jsonify({
            "success": True,
            "type": "SUGGESTION_PROMOTION",
            "message": "Aucun employé à analyser.",
            "resultats": [],
            "nb_promotions": 0,
            "employes_concernes": [],
        })

    resultats       = []
    employes_promus = []

    for emp in employes:
        try:
            X           = pd.DataFrame([{f: emp.get(f, 0) or 0 for f in FEATURES_PROMOTION}])
            proba       = modele_promotion.predict_proba(X)[0]
            promotion   = bool(modele_promotion.predict(X)[0])
            probabilite = round(float(proba[1]) * 100, 1)

            resultats.append({
                "userId":                emp.get("userId"),
                "nom":                   emp.get("nom", ""),
                "prenom":                emp.get("prenom", ""),
                "poste":                 emp.get("poste", ""),
                "promotion_suggeree":    promotion,
                "probabilite_promotion": probabilite,
                "niveau_risque":         niveau_risque(probabilite),
            })

            if promotion:
                employes_promus.append(emp)
        except Exception as e:
            print(f"   ⚠️ Erreur analyse promotion pour userId={emp.get('userId')}: {e}")

    return jsonify({
        "success":            True,
        "type":               "SUGGESTION_PROMOTION",
        "message":            construire_message_promotion(employes_promus),
        "resultats":          resultats,
        "nb_promotions":      len(employes_promus),
        "employes_concernes": employes_promus,
    })


# ============================================================
# DÉMARRAGE
# ============================================================
if __name__ == "__main__":
    port = int(os.environ.get("PORT", 5000))
    print(f"🚀 Démarrage du service IA sur le port {port}")
    app.run(host="0.0.0.0", port=port, debug=False)
