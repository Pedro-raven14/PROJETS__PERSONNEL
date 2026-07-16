import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { LessThanOrEqual, MoreThanOrEqual, Repository } from 'typeorm';
import { CycleEvaluation } from 'src/entities/cycle_evaluation.entity';
import { Employee } from 'src/entities/employee.entity';
import { NotificationService } from 'src/notification/notification.service';
import { CreateCycleEvaluationDto } from 'src/dto/cycleEvaluationDTO';

@Injectable()
export class CycleEvaluationService {
  constructor(
    @InjectRepository(CycleEvaluation)
    private readonly cycleRepo: Repository<CycleEvaluation>,

    @InjectRepository(Employee)
    private readonly employeeRepo: Repository<Employee>,

    private readonly notificationService: NotificationService,
  ) {}

  async create(dto: CreateCycleEvaluationDto) {
    const cycle = await this.cycleRepo.save(this.cycleRepo.create(dto));

    // Notifier tous les employés du nouveau cycle
    const tousLesEmployes = await this.employeeRepo.find({ select: ['userId'] });
    const debut = new Date(dto.date_debut).toLocaleDateString('fr-FR');
    const fin   = new Date(dto.date_fin).toLocaleDateString('fr-FR');

    await Promise.all(
      tousLesEmployes.map(emp =>
        this.notificationService.create(
          emp.userId,
          `Un nouveau cycle d'évaluation a été lancé : "${cycle.nom}" (du ${debut} au ${fin}).`,
          'EVALUATION',
        )
      )
    );

    return { message: `Cycle d'évaluation "${cycle.nom}" créé`, cycle };
  }

  async getAll() {
    return this.cycleRepo.find({
      relations: ['evaluations'],
      order: { date_debut: 'DESC' },
    });
  }

  async getById(cycleId: number) {
    const cycle = await this.cycleRepo.findOne({
      where: { cycleId },
      relations: ['evaluations', 'evaluations.employee', 'evaluations.evaluateur'],
    });
    if (!cycle) throw new NotFoundException(`Cycle d'évaluation introuvable`);
    return cycle;
  }

  // Cycles actifs (date_debut <= aujourd'hui <= date_fin)
  async getActifs() {
    const today = new Date();
    return this.cycleRepo.find({
      where: {
        date_debut: LessThanOrEqual(today),
        date_fin:   MoreThanOrEqual(today),
      },
      order: { date_debut: 'DESC' },
    });
  }

  async delete(cycleId: number) {
    await this.getById(cycleId);
    await this.cycleRepo.delete(cycleId);
    return { message: `Cycle supprimé` };
  }
}
