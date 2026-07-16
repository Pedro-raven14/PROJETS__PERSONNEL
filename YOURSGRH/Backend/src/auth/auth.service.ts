import {
  BadRequestException,
  Injectable,
  NotFoundException,
  UnauthorizedException,
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import * as bcrypt from 'bcrypt';

import { autDTO } from 'src/dto/authDTO';
import { EmployeeService } from 'src/employee/employee.service';
import { Employee } from 'src/entities/employee.entity';
import { Contrat } from 'src/entities/contrat.entity';

@Injectable()
export class AuthService {
  constructor(
    @InjectRepository(Employee)
    private readonly employeeRepo: Repository<Employee>,
    @InjectRepository(Contrat)
    private readonly contratRepo: Repository<Contrat>,
    private readonly employeeService: EmployeeService,
    private readonly jwtService: JwtService,
  ) {}

  // Construit l'objet employé renvoyé au frontend (sans mot de passe)
  private buildEmployeePayload(employee: Employee) {
    return {
      userId:             employee.userId,
      nom:                employee.nom,
      prenom:             employee.prenom,
      email:              employee.email,
      poste:              employee.poste ?? null,
      role:               employee.role?.nom ?? '',
      permissions:        Array.isArray(employee.permissions)
                            ? employee.permissions.map((p) => p.nom)
                            : [],
      mustChangePassword: employee.mustChangePassword,
    };
  }

  async login(dto: autDTO) {
    const employee = await this.employeeService.getEmployeebyMail(dto.email);

    if (!employee) {
      throw new UnauthorizedException('Email ou mot de passe incorrect');
    }

    const passwordValid = await bcrypt.compare(dto.password, employee.password);
    if (!passwordValid) {
      throw new UnauthorizedException('Email ou mot de passe incorrect');
    }

    // Vérification licenciement : EMPLOYEE et MANAGER doivent avoir un contrat ACTIF
    const role = employee.role?.nom?.toUpperCase();
    if (role !== 'ADMIN' && role !== 'RH') {
      const contratActif = await this.contratRepo.findOne({
        where: { employee: { userId: employee.userId }, statut: 'ACTIF' },
      });
      if (!contratActif) {
        throw new UnauthorizedException(
          'Votre accès à la plateforme a été révoqué. Veuillez contacter votre responsable RH.',
        );
      }
    }

    const employeeData = this.buildEmployeePayload(employee);

    return {
      access_token: await this.jwtService.sign({
        sub:         employee.userId,
        email:       employee.email,
        role:        employeeData.role,
        permissions: employeeData.permissions,
      }),
      employee: employeeData,
    };
  }

  async changePassword(userId: number, newPassword: string) {
    const employee = await this.employeeRepo.findOne({
      where: { userId },
      relations: ['role', 'permissions'],
    });

    if (!employee) {
      throw new NotFoundException('Employé introuvable');
    }

    // Lors d'un changement volontaire (pas le premier forcé), interdire le même mot de passe
    if (!employee.mustChangePassword) {
      const isSame = await bcrypt.compare(newPassword, employee.password);
      if (isSame) {
        throw new BadRequestException('Le nouveau mot de passe doit être différent de l\'ancien');
      }
    }

    await this.employeeRepo.update(userId, {
      password:           await bcrypt.hash(newPassword, 10),
      mustChangePassword: false,
    });

    // Recharger l'entité mise à jour pour construire la réponse
    const updated = await this.employeeRepo.findOne({
      where: { userId },
      relations: ['role', 'permissions'],
    });

    if (!updated) {
      throw new NotFoundException('Employé introuvable après mise à jour');
    }

    const employeeData = this.buildEmployeePayload(updated);

    return {
      access_token: await this.jwtService.sign({
        sub:         updated.userId,
        email:       updated.email,
        role:        employeeData.role,
        permissions: employeeData.permissions,
      }),
      employee: employeeData,
    };
  }
}
