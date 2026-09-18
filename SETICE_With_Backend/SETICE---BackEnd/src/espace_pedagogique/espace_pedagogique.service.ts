// @Injectable()
// export class EspacePedagogiqueService {}
// import { Injectable, NotFoundException } from '@nestjs/common';
// import { EspacePedagogique } from './espace_pedagogique.entity';
// import { InjectRepository } from '@nestjs/typeorm';
// import { Repository, ILike } from 'typeorm';
// import { espaceDTO } from './espace.dto';
// import { Promotion } from 'src/promotion/promotion.entity';
// import { Formateur } from 'src/formateur/formateur.entity';
// import { Matiere } from 'src/matiere/matiere.entity';

import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Formateur } from 'src/formateur/formateur.entity';
import { Matiere } from 'src/matiere/matiere.entity';
import { Promotion } from 'src/promotion/promotion.entity';
import { Repository, ILike } from 'typeorm';
import { espaceDTO } from './espace.dto';
import { EspacePedagogique } from './espace_pedagogique.entity';

@Injectable()
export class EspacePedagogiqueService {
  constructor(
    @InjectRepository(EspacePedagogique)
    private readonly espaceRepository: Repository<EspacePedagogique>,
    @InjectRepository(Promotion)
    private readonly promotionRepository: Repository<Promotion>,
    @InjectRepository(Formateur)
    private readonly formateurRepository: Repository<Formateur>,
    @InjectRepository(Matiere)
    private readonly matiereRepository: Repository<Matiere>,
  ) {}

  async createEspace(espace: espaceDTO) {
    const {
      nom,
      matiere,
      description,
      anneeAcademique,
      filiere,
      options,
      formateurId,
    } = espace;

    // find or attach promotion if provided
    let promotion: Promotion | null = null;
    if (filiere && options && anneeAcademique) {
      promotion = await this.promotionRepository.findOne({
        where: {
          filiere,
          options,
          anneeAcademique,
        },
      });
      if (!promotion) {
        throw new NotFoundException('Promotion introuvable');
      }
    }

    // attach formateur if provided
    let formateur: Formateur | null = null;
    if (formateurId) {
      formateur = await this.formateurRepository.findOne({
        where: { id: formateurId },
      });
      if (!formateur) {
        throw new NotFoundException('Formateur introuvable');
      }
    }

    // find or create matiere
    let matiereEntity: Matiere | null = null;
    if (matiere) {
      if (typeof matiere === 'number') {
        matiereEntity = await this.matiereRepository.findOne({
          where: { id: matiere },
        });
      } else {
        // case-insensitive lookup by name
        matiereEntity = await this.matiereRepository.findOne({
          where: { nom: ILike(String(matiere)) },
        });
      }
      if (!matiereEntity) {
        const newM = this.matiereRepository.create({ nom: String(matiere) });
        matiereEntity = await this.matiereRepository.save(newM);
      }
    }

    const espaceP = this.espaceRepository.create({
      nom,
      description,
      promotion: promotion ?? null,
      formateur: formateur ?? null,
      matiere: matiereEntity ?? null,
    });

    return await this.espaceRepository.save(espaceP);
  }

  async getespace() {
    return this.espaceRepository.find({
      relations: {
        promotion: true,
        formateur: {
          utilisateur: true,
        },
        matiere: true,
      },
    });
  }

  async getStudentsByEspace(espaceId: number) {
    const espace = await this.espaceRepository.findOne({
      where: { id: espaceId },
      relations: { promotion: { etudiants: { utilisateur: true } } },
    });
    if (!espace) return [];
    return espace.promotion ? espace.promotion.etudiants || [] : [];
  }

  async assignFormateur(espaceId: number, formateurId: number) {
    // Vérifier si l'espace existe
    const espace = await this.espaceRepository.findOne({
      where: { id: espaceId },
      relations: ['formateur']
    });
    
    if (!espace) {
      throw new NotFoundException('Espace pédagogique introuvable');
    }

    // Vérifier si le formateur existe
    const formateur = await this.formateurRepository.findOne({
      where: { id: formateurId },
      relations: ['utilisateur']
    });
    
    if (!formateur) {
      throw new NotFoundException('Formateur introuvable');
    }

    // Assigner le formateur à l'espace
    espace.formateur = formateur;
    
    const saved = await this.espaceRepository.save(espace);
    
    // Retourner avec les relations pour le frontend
    return await this.espaceRepository.findOne({
      where: { id: saved.id },
      relations: ['formateur', 'promotion', 'matiere']
    });
  }
  //récupérer un espace pédagogique par id (avec travaux)
  async findOne(espaceId: number) {
    const espace = await this.espaceRepository.findOne({
      where: { id: espaceId },
      relations: {
        promotion: { etudiants: { utilisateur: true } },
        formateur: { utilisateur: true },
        matiere: true,
        travaux: true,
      },
    });

    if (!espace) {
      throw new NotFoundException(`Espace pédagogique ${espaceId} introuvable`);
    }

    return espace;
  }

  async getEspacesByFormateur(formateurId: number) {
    const espaces = await this.espaceRepository.find({
      where: {
        formateur: {
          utilisateur: {
            id: formateurId,
          },
        },
      },
      relations: {
        formateur: { utilisateur: true },
        promotion: true,
        matiere: true,
        travaux: true, // optionnel
      },
      order: {
        dateCreation: 'DESC',
      },
    });

    if (!espaces || espaces.length === 0) {
      throw new NotFoundException(
        'Aucun espace pédagogique trouvé pour ce formateur',
      );
    }

    return espaces;
  }

  async deleteEspace(id: number): Promise<{ message: string }> {
    // Utiliser une transaction pour garantir l'intégrité
    return await this.espaceRepository.manager.transaction(async (manager) => {
      // 1. Récupérer l'espace avec ses relations
      const espace = await manager.findOne(EspacePedagogique, {
        where: { id },
        relations: ['travaux', 'promotion', 'formateur', 'matiere']
      });

      if (!espace) {
        throw new Error('Espace pédagogique non trouvé');
      }

      // 2. Supprimer tous les travaux de l'espace (cascade automatique vers soumissions)
      if (espace.travaux && espace.travaux.length > 0) {
        // Les soumissions seront supprimées automatiquement grâce à la cascade
        await manager.delete('Travail', { espace: { id } });
      }

      // 3. Supprimer l'espace pédagogique
      // Note: On garde la promotion, le formateur et la matière
      await manager.delete(EspacePedagogique, { id });

      return {
        message: `Espace pédagogique "${espace.nom}" supprimé avec succès`
      };
    });
  }
}