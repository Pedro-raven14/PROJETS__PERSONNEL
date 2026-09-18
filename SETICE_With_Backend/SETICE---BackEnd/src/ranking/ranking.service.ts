import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Equipe } from 'src/equipe/equipe.entity';
import { Etudiant } from 'src/etudiant/etudiant.entity';
import { Repository } from 'typeorm';

@Injectable()
export class RankingService {
  constructor(
    @InjectRepository(Etudiant)
    private etudiantRepo: Repository<Etudiant>,

    @InjectRepository(Equipe)
    private equipeRepo: Repository<Equipe>,
  ) {}

  async getIndividualRanking(espaceId: number) {
    const results = await this.etudiantRepo
      .createQueryBuilder('e')
      .leftJoin('e.equipe', 'eq')
      .leftJoin('eq.promotion', 'p')
      .leftJoin('p.espacesPedagogiques', 'esp')
      .leftJoin('e.utilisateur', 'u')

      .leftJoin(
        (subQuery) =>
          subQuery
            .select('si.etudiant_id', 'etudiantid') // <-- ici
            .addSelect('SUM(si.note)', 'individuel')
            .from('soumission', 'si')
            .where('si.etudiant_id IS NOT NULL')
            .groupBy('si.etudiant_id'),
        'si',
        'si.etudiantid = e.id',
      )

      .leftJoin(
        (subQuery) =>
          subQuery
            .select('se.equipe_id', 'equipeid')
            .addSelect('SUM(se.note)', 'collectif')
            .from('soumission', 'se')
            .where('se.equipe_id IS NOT NULL')
            .groupBy('se.equipe_id'),
        'se',
        'se.equipeid = eq.id',
      )

      .where('esp.id = :espaceId', { espaceId })

      .select('e.id', 'id')
      .addSelect('u.nom', 'name')

      .addSelect(
        'COALESCE(si.individuel, 0) + COALESCE(se.collectif, 0)',
        'uatmCoins',
      )

      .orderBy('COALESCE(si.individuel, 0) + COALESCE(se.collectif, 0)', 'DESC')

      .getRawMany();

    //   return results.map((row, index) => ({
    //     ...row,
    //     rank: index + 1,
    //     evolution: 'stable',
    //     evolutionValue: 0,
    //     role: 'Étudiant',
    //     isCurrent: false, // à brancher avec JWT plus tard
    //   }));
    if (!results || results.length === 0) {
      return [];
    }
    return results.map((row, index) => ({
      id: Number(row.id),
      name: row.name,
      uatmCoins: Number(row.uatmCoins),
      rank: index + 1,
      evolution: 'stable',
      evolutionValue: 0,
      role: 'Étudiant',
      isCurrent: true,
    }));
  }

  async getTeamRanking(espaceId: number) {
    const results = await this.equipeRepo
      .createQueryBuilder('eq')
      .leftJoin('eq.promotion', 'p')
      .leftJoin('p.espacesPedagogiques', 'esp')
      .leftJoin('eq.soumissions', 's')

      .where('esp.id = :espaceId', { espaceId })

      .select('eq.id', 'id')
      .addSelect('eq.nom', 'name')
      .addSelect('COALESCE(SUM(s.note),0)', 'uatmCoins')
      .addSelect('COUNT(DISTINCT et.id)', 'members')

      .leftJoin('eq.etudiants', 'et')

      .groupBy('eq.id')
      .orderBy('COALESCE(SUM("s"."note"),0)', 'DESC')
      .getRawMany();

    // return results.map((row, index) => ({
    //   ...row,
    //   rank: index + 1,
    //   evolution: 'stable',
    //   multiplier: 1.0,
    // }));
    if (!results || results.length === 0) {
      return [];
    }
    return results.map((row, index) => ({
      id: Number(row.id),
      name: row.name,
      uatmCoins: Number(row.uatmCoins),
      members: Number(row.members),
      rank: index + 1,
      evolution: 'stable',
      multiplier: 1.0,
       isCurrent: true,
    }));
  }
}
