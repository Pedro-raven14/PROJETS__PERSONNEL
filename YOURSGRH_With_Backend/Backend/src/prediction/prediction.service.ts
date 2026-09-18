import { Injectable, NotFoundException, InternalServerErrorException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Prediction } from 'src/entities/prediction.entity';
import { Employee } from 'src/entities/employee.entity';
import { Formation } from 'src/entities/formation.entity';
import { CreatePredictionDto } from 'src/dto/predictionDTO';
import { paginate, buildResult } from 'src/common/pagination';

const IA_SERVICE_URL = process.env.IA_SERVICE_URL || 'http://localhost:5000';

@Injectable()
export class PredictionService {
  constructor(
    @InjectRepository(Prediction)
    private readonly predictionRepo: Repository<Prediction>,

    @InjectRepository(Employee)
    private readonly employeeRepo: Repository<Employee>,

    @InjectRepository(Formation)
    private readonly formationRepo: Repository<Formation>,
  ) {}

  async lancer(lanceurId: number, dto: CreatePredictionDto) {
    const lanceur = await this.employeeRepo.findOne({ where: { userId: lanceurId } });
    if (!lanceur) throw new NotFoundException(`Employé introuvable`);

    // Récupérer tous les employés avec leurs données pour l'IA
    const employes = await this.employeeRepo.find({
      relations: [
        'role', 'equipe',
        'evaluations', 'formations',
        'contrats', 'congesDemandes',
        'competences', 'competences.competence',
      ],
    });

    // Construire le payload selon le type de prédiction
    const payload = this.construirePayload(dto.type, employes);

    // Appeler le service IA Flask
    const endpoint = this.getEndpoint(dto.type);
    console.log(`[IA] Envoi vers Flask ${endpoint} — ${employes.length} employé(s)`);
    const iaResponse = await this.appellerIA(endpoint, payload);
    console.log(`[IA] Réponse Flask — resultats: ${(iaResponse.resultats || []).length} entrée(s)`);

    // Trouver les employés concernés par les résultats
    const resultats = iaResponse.resultats || iaResponse.recommandations || [];

    const userIdsConcernes: number[] = resultats
      .map((e: any) => e.userId)
      .filter(Boolean);

    const employesConcernes = userIdsConcernes.length > 0
      ? await this.employeeRepo.findByIds(userIdsConcernes)
      : [];

    // Sauvegarder la prédiction — message = JSON des résultats pour relecture dans le dashboard
    const messageJson = JSON.stringify({
      resumé:   iaResponse.message || '',
      resultats,
    });

    const prediction = await this.predictionRepo.save(
      this.predictionRepo.create({
        type:             dto.type,
        message:          messageJson,
        lanceur,
        employesConcernes,
      }),
    );

    return {
      message:    `Prédiction lancée`,
      prediction: {
        ...prediction,
        resultats,
      },
    };
  }

  // Recommandations de formations pour l'employé connecté
  async recommanderFormations(userId: number) {
    // 1. Récupérer l'employé avec ses compétences et formations déjà suivies
    const employe = await this.employeeRepo.findOne({
      where: { userId },
      relations: [
        'evaluations', 'formations',
        'competences', 'competences.competence',
      ],
    });
    if (!employe) throw new NotFoundException(`Employé introuvable`);

    // 2. Récupérer toutes les formations avec leurs compétences cibles
    //    Exclure celles où l'employé est déjà inscrit
    const toutesFormations = await this.formationRepo.find({
      relations: ['employes', 'competences'],
    });

    const formationsNonInscrites = toutesFormations.filter(
      (f) => !f.employes?.some((e) => e.userId === userId),
    );

    if (formationsNonInscrites.length === 0) {
      return { recommandations: [], message: 'Vous êtes déjà inscrit à toutes les formations disponibles.' };
    }

    // 3. Construire le profil de l'employé pour l'IA
    const competencesMap: Record<string, number> = {};
    for (const ec of employe.competences || []) {
      if (ec.competence?.nom) competencesMap[ec.competence.nom] = ec.niveau;
    }

    const notes = (employe.evaluations || [])
      .map((e) => parseFloat(String(e.note_globale)))
      .filter((n) => !isNaN(n));
    const noteMoyenne = notes.length > 0
      ? Math.round((notes.reduce((a, b) => a + b, 0) / notes.length) * 10) / 10
      : 3.0;

    const niveauMoyenCompetences = employe.competences?.length > 0
      ? Math.round(
          (employe.competences.reduce((s, c) => s + c.niveau, 0) / employe.competences.length) * 10,
        ) / 10
      : 2.5;

    // 4. Préparer le payload pour Flask
    const payload = {
      employe: {
        userId,
        nom:                      employe.nom,
        prenom:                   employe.prenom,
        competences:              competencesMap,
        niveau_moyen_competences: niveauMoyenCompetences,
        nb_formations_suivies:    (employe.formations || []).length,
        note_moyenne:             noteMoyenne,
      },
      formations: formationsNonInscrites.map((f) => ({
        formationId:  f.formationId,
        titre:        f.titre,
        niveau:       f.niveau,
        capacite:     f.capacite,
        inscrits:     f.employes?.length ?? 0,
        competences:  (f.competences || []).map((c) => c.nom),
      })),
    };

    // 5. Appeler Flask
    const iaResponse = await this.appellerIA('/predict/formation', payload);

    return {
      recommandations: iaResponse.recommandations || [],
      message: iaResponse.message || '',
    };
  }

  async getAll(page = 1, limit = 10) {
    const { skip, take } = paginate(page, limit);
    const [data, total] = await this.predictionRepo.findAndCount({
      relations: ['lanceur', 'employesConcernes'],
      skip,
      take,
    });
    return buildResult(data, total, page, limit);
  }

  async getById(predictionId: number) {
    const prediction = await this.predictionRepo.findOne({
      where: { predictionId },
      relations: ['lanceur', 'employesConcernes'],
    });
    if (!prediction) throw new NotFoundException(`Prédiction introuvable`);
    return prediction;
  }

  // Détermine l'endpoint Flask selon le type
  private getEndpoint(type: string): string {
    const map: Record<string, string> = {
      'RECOMMANDATION_FORMATION': '/predict/formation',
      'RISQUE_DEPART':            '/predict/depart',
      'SUGGESTION_LICENCIEMENT':  '/predict/licenciement',
      'SUGGESTION_PROMOTION':     '/predict/promotion',
    };
    return map[type] || '/predict/depart';
  }

  // Construit le payload à envoyer au service IA selon le type
  private construirePayload(type: string, employes: Employee[]): any {
    const employesData = employes.map((emp) => {
      const anciennete = Math.floor(
        (Date.now() - new Date(emp.date_embauche).getTime()) / (1000 * 60 * 60 * 24 * 30)
      );

      // Note moyenne depuis les évaluations
      const notes = (emp.evaluations || [])
        .map((e) => parseFloat(String(e.note_globale)))
        .filter((n) => !isNaN(n));
      const noteMoyenne = notes.length > 0
        ? Math.round((notes.reduce((a, b) => a + b, 0) / notes.length) * 10) / 10
        : 3.0;

      // Contrat actif
      const contratActif = (emp.contrats || []).find((c) => c.statut === 'ACTIF');
      const salaire = Number(contratActif?.salaire || 0);

      // Nombre de promotions = nombre de fois où le salaire a augmenté entre contrats
      const contratsTriés = [...(emp.contrats || [])].sort(
        (a, b) => new Date(a.date_debut).getTime() - new Date(b.date_debut).getTime()
      );
      let nbPromotions = 0;
      for (let i = 1; i < contratsTriés.length; i++) {
        if (contratsTriés[i].salaire > contratsTriés[i - 1].salaire) nbPromotions++;
      }

      // Rendement de l'équipe (0-100), 50 par défaut si pas d'équipe
      const rendementEquipe = emp.equipe?.rendement ?? 50;

      // Score de performance composite
      const scorePerformance = Math.round(
        ((noteMoyenne / 5.0) * 0.6 + (rendementEquipe / 100.0) * 0.4) * 1000
      ) / 1000;

      // Mois depuis la dernière formation
      const formations = emp.formations || [];
      let moisDepuisFormation = 60; // valeur max si aucune formation
      if (formations.length > 0) {
        const derniereFormation = formations.reduce((latest, f) =>
          new Date(f.date_fin) > new Date(latest.date_fin) ? f : latest
        );
        moisDepuisFormation = Math.floor(
          (Date.now() - new Date(derniereFormation.date_fin).getTime()) / (1000 * 60 * 60 * 24 * 30)
        );
      }

      // Congés refusés
      const nbCongesRefuses = (emp.congesDemandes || []).filter(
        (c) => c.statut === 'REFUSE'
      ).length;

      // Compétences
      const competences = emp.competences || [];
      const nbCompetences = competences.length;
      const niveauMoyenCompetences = nbCompetences > 0
        ? Math.round((competences.reduce((sum, c) => sum + c.niveau, 0) / nbCompetences) * 10) / 10
        : 3.0;

      // Map compétences pour la recommandation formation
      const competencesMap: Record<string, number> = {};
      for (const ec of competences) {
        if (ec.competence?.nom) {
          competencesMap[ec.competence.nom] = ec.niveau;
        }
      }

      return {
        userId:                    emp.userId,
        nom:                       emp.nom,
        prenom:                    emp.prenom,
        poste:                     emp.poste || '',
        anciennete_mois:           Number(anciennete),
        salaire:                   Number(salaire),
        nb_conges_refuses:         Number(nbCongesRefuses),
        nb_absences_non_justif:    Number(nbCongesRefuses),
        nb_formations_suivies:     Number(formations.length),
        nb_formations:             Number(formations.length),
        a_equipe:                  emp.equipe ? 1 : 0,
        solde_conges:              Number(emp.soldeConges || 0),
        note_moyenne:              Number(noteMoyenne),
        rendement_equipe:          Number(rendementEquipe),
        score_performance:         Number(scorePerformance),
        nb_promotions:             Number(nbPromotions),
        mois_depuis_formation:     Number(moisDepuisFormation),
        nb_evaluations:            Number((emp.evaluations || []).length),
        nb_competences:            Number(nbCompetences),
        niveau_moyen_competences:  Number(niveauMoyenCompetences),
        competences:               competencesMap,
      };
    });

    if (type === 'RECOMMANDATION_FORMATION' && employes.length === 1) {
      return { employe: employesData[0], top_n: 3 };
    }

    return { employes: employesData };
  }

  // Appel HTTP vers le service Flask
  private async appellerIA(endpoint: string, payload: any): Promise<any> {
    const url = `${IA_SERVICE_URL}${endpoint}`;

    try {
      const response = await fetch(url, {
        method:  'POST',
        headers: { 'Content-Type': 'application/json' },
        body:    JSON.stringify(payload),
      });

      if (!response.ok) {
        throw new Error(`Service IA a répondu avec le statut ${response.status}`);
      }

      return await response.json();
    } catch (err: any) {
      throw new InternalServerErrorException(
        `Impossible de contacter le service IA : ${err.message}`
      );
    }
  }
}
