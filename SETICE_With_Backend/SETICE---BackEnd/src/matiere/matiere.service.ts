import { Injectable, BadRequestException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, ILike } from 'typeorm';
import { Matiere } from './matiere.entity';

@Injectable()
export class MatiereService {
	constructor(
		@InjectRepository(Matiere)
		private readonly matiereRepository: Repository<Matiere>,
	) {}

	async create(nom: string) {
		if (!nom || !nom.trim()) {
			throw new BadRequestException('Nom de matière invalide');
		}
		const existing = await this.matiereRepository.findOne({ where: { nom: ILike(nom.trim()) } });
		if (existing) return existing;
		const m = this.matiereRepository.create({ nom: nom.trim() });
		return await this.matiereRepository.save(m);
	}

	async findAll() {
		return await this.matiereRepository.find();
	}
}
