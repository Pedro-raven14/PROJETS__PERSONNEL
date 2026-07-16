import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Notification } from 'src/entities/notification.entity';
import { Employee } from 'src/entities/employee.entity';
import { paginate, buildResult } from 'src/common/pagination';

@Injectable()
export class NotificationService {
  constructor(
    @InjectRepository(Notification)
    private readonly notifRepo: Repository<Notification>,

    @InjectRepository(Employee)
    private readonly employeeRepo: Repository<Employee>,
  ) {}

  // Créer une notification pour un employé (appelé en interne par d'autres services)
  async create(userId: number, message: string, type: string) {
    const employee = await this.employeeRepo.findOne({ where: { userId } });
    if (!employee) throw new NotFoundException(`Employé introuvable`);

    return this.notifRepo.save(
      this.notifRepo.create({ message, type, employee }),
    );
  }

  // Notifications de l'employé connecté
  async getMesNotifications(userId: number, page = 1, limit = 20) {
    const { skip, take } = paginate(page, limit);
    const [data, total] = await this.notifRepo.findAndCount({
      where: { employee: { userId } },
      order: { date: 'DESC' },
      skip,
      take,
    });
    return buildResult(data, total, page, limit);
  }

  // Marquer une notification comme lue
  async marquerLue(notifId: number, userId: number) {
    const notif = await this.notifRepo.findOne({
      where: { notifId, employee: { userId } },
    });
    if (!notif) throw new NotFoundException(`Notification introuvable`);

    await this.notifRepo.update(notifId, { lu: true });
    return { message: `Notification marquée comme lue` };
  }

  // Notifications non lues uniquement
  async getNonLues(userId: number) {
    return this.notifRepo.find({
      where: { employee: { userId }, lu: false },
      order: { date: 'DESC' },
    });
  }

  // Marquer toutes les notifications comme lues
  async marquerToutesLues(userId: number) {
    await this.notifRepo.update(
      { employee: { userId }, lu: false },
      { lu: true },
    );
    return { message: `Toutes les notifications marquées comme lues` };
  }
}
