import { Body, Controller, Get, Post } from '@nestjs/common';
import { MatiereService } from './matiere.service';

@Controller('matiere')
export class MatiereController {
	constructor(private readonly matiereService: MatiereService) {}

	@Get()
	async findAll() {
		return await this.matiereService.findAll();
	}

	@Post()
	async create(@Body('nom') nom: string) {
		return await this.matiereService.create(nom);
	}
}
