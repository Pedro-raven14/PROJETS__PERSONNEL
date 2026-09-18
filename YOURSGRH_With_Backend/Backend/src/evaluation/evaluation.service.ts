import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Evaluation } from 'src/entities/evaluation.entity';
import { Employee } from 'src/entities/employee.entity';
import { CycleEvaluation } from 'src/entities/cycle_evaluation.entity';
import { NotificationService } from 'src/notification/notification.service';
import { CreateEvaluationDto } from 'src/dto/evaluationDTO';
import { paginate, buildResult } from 'src/common/pagination';

@Injectable()
export class EvaluationService {
  constructor(
    @InjectRepository(Evaluation)
    private readonly evaluationRepo: Repository<Evaluation>,

    @InjectRepository(Employee)
    private readonly employeeRepo: Repository<Employee>,

    @InjectRepository(CycleEvaluation)
    private readonly cycleRepo: Repository<CycleEvaluation>,

    private readonly notificationService: NotificationService,
  ) {}

  async create(dto: CreateEvaluationDto) {
    const employee = await this.employeeRepo.findOne({ where: { userId: dto.userId } });
    if (!employee) throw new NotFoundException(`Employé introuvable`);

    const evaluateur = await this.employeeRepo.findOne({ where: { userId: dto.evaluateurId } });
    if (!evaluateur) throw new NotFoundException(`Évaluateur introuvable`);

    const cycle = await this.cycleRepo.findOne({ where: { cycleId: dto.cycleId } });
    if (!cycle) throw new NotFoundException(`Cycle d'évaluation introuvable`);

    // Vérifier qu'une évaluation n'existe pas déjà pour cet employé dans ce cycle
    const existing = await this.evaluationRepo.findOne({
      where: { employee: { userId: dto.userId }, cycle: { cycleId: dto.cycleId } },
    });
    if (existing) throw new BadRequestException(`Cet employé a déjà été évalué pour ce cycle`);

    // Calculer la note globale (moyenne des critères)
    const notes = Object.values(dto.notes_criteres);
    const note_globale = notes.length > 0
      ? Math.round((notes.reduce((a, b) => a + b, 0) / notes.length) * 100) / 100
      : 0;

    const evaluation = await this.evaluationRepo.save(
      this.evaluationRepo.create({
        ...dto,
        employee,
        evaluateur,
        cycle,
        note_globale,
      }),
    );

    // Notifier l'employé évalué
    await this.notificationService.create(
      employee.userId,
      `Votre évaluation pour le cycle "${cycle.nom}" a été complétée par ${evaluateur.prenom} ${evaluateur.nom}. Note globale : ${note_globale.toFixed(2)}/5.`,
      'EVALUATION',
    );

    return { message: `Évaluation enregistrée`, evaluation };
  }

  async getAll(page = 1, limit = 10) {
    const { skip, take } = paginate(page, limit);
    const [data, total] = await this.evaluationRepo.findAndCount({
      relations: ['employee', 'cycle', 'evaluateur'],
      skip,
      take,
      order: { date: 'DESC' },
    });
    return buildResult(data, total, page, limit);
  }

  async getByEmployee(userId: number) {
    return this.evaluationRepo.find({
      where: { employee: { userId } },
      relations: ['cycle', 'evaluateur'],
      order: { date: 'DESC' },
    });
  }

  // Évaluations faites par un manager (pour un cycle donné)
  async getByEvaluateur(evaluateurId: number, cycleId?: number) {
    const where: any = { evaluateur: { userId: evaluateurId } };
    if (cycleId) where.cycle = { cycleId };
    return this.evaluationRepo.find({
      where,
      relations: ['employee', 'cycle'],
      order: { date: 'DESC' },
    });
  }

  async getById(evaluationId: number) {
    const evaluation = await this.evaluationRepo.findOne({
      where: { evaluationId },
      relations: ['employee', 'cycle', 'evaluateur'],
    });
    if (!evaluation) throw new NotFoundException(`Évaluation introuvable`);
    return evaluation;
  }
}
