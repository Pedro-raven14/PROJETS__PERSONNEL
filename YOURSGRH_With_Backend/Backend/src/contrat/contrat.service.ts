import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Contrat } from 'src/entities/contrat.entity';
import { Employee } from 'src/entities/employee.entity';
import { NotificationService } from 'src/notification/notification.service';
import { PdfService } from './pdf.service';
import { SupabaseStorageService } from './supabase-storage.service';
import { CreateContratDto, UpdateContratDto } from 'src/dto/contratDTO';
import { paginate, buildResult } from 'src/common/pagination';

@Injectable()
export class ContratService {
  constructor(
    @InjectRepository(Contrat)
    private readonly contratRepo: Repository<Contrat>,

    @InjectRepository(Employee)
    private readonly employeeRepo: Repository<Employee>,

    private readonly notificationService: NotificationService,
    private readonly pdfService: PdfService,
    private readonly storageService: SupabaseStorageService,
  ) {}

  // Créer un contrat, générer le PDF et notifier l'employé
  async create(dto: CreateContratDto) {
    const employee = await this.employeeRepo.findOne({ where: { userId: dto.userId } });
    if (!employee) throw new NotFoundException(`Employé introuvable`);

    // Sauvegarder le contrat en base
    const contrat = await this.contratRepo.save(
      this.contratRepo.create({ ...dto, employee }),
    );

    // Recharger avec la relation employee pour le PDF
    const contratComplet = await this.contratRepo.findOne({
      where: { contratId: contrat.contratId },
      relations: ['employee'],
    });

    // Générer le PDF en mémoire et uploader vers Supabase Storage
    const pdfBuffer = await this.pdfService.genererContratBuffer(contratComplet!);
    const fileName  = `contrat_${contrat.contratId}_${Date.now()}.pdf`;
    const documentPath = await this.storageService.uploadPdf(pdfBuffer, fileName);
    await this.contratRepo.update(contrat.contratId, { documentPath });

    // Notifier l'employé qu'il a un contrat à signer
    await this.notificationService.create(
      employee.userId,
      `Vous avez un nouveau contrat (${dto.type} — ${dto.poste}) à signer. Veuillez le consulter et le signer dès que possible.`,
      'CONTRAT',
    );

    return {
      message:  `Contrat créé et PDF généré. L'employé a été notifié.`,
      contrat:  { ...contrat, documentPath },
    };
  }

  async getAll(page = 1, limit = 10) {
    const { skip, take } = paginate(page, limit);
    const [data, total] = await this.contratRepo.findAndCount({
      relations: ['employee'],
      skip,
      take,
    });
    return buildResult(data, total, page, limit);
  }

  // Contrats non encore signés — pour le tableau de bord RH
  async getNonSignes() {
    return this.contratRepo.find({
      where: { signe: false },
      relations: ['employee'],
      order: { date_debut: 'ASC' },
    });
  }

  async getByEmployee(userId: number) {
    return this.contratRepo.find({
      where: { employee: { userId } },
      relations: ['employee'],
    });
  }

  async getById(contratId: number) {
    const contrat = await this.contratRepo.findOne({
      where: { contratId },
      relations: ['employee'],
    });
    if (!contrat) throw new NotFoundException(`Contrat introuvable`);
    return contrat;
  }

  // Retourne le chemin du PDF pour le téléchargement/affichage
  // Priorité : PDF signé > PDF brut
  async getDocument(contratId: number) {
    const contrat = await this.getById(contratId);
    const filePath = contrat.documentSignePath || contrat.documentPath;
    if (!filePath) {
      throw new NotFoundException(`Aucun document généré pour ce contrat`);
    }
    return filePath;
  }

  // L'employé signe le contrat — reçoit la signature en base64
  async signer(contratId: number, userId: number, signatureBase64: string) {
    const contrat = await this.contratRepo.findOne({
      where: { contratId },
      relations: ['employee'],
    });
    if (!contrat) throw new NotFoundException(`Contrat introuvable`);

    if (contrat.employee.userId !== userId) {
      throw new BadRequestException(`Ce contrat ne vous appartient pas`);
    }
    if (contrat.signe) {
      throw new BadRequestException(`Ce contrat a déjà été signé`);
    }

    // Intégrer la signature dans le PDF et uploader vers Supabase Storage
    const pdfBuffer = await this.pdfService.integrerSignatureBuffer(contrat, signatureBase64);
    const fileName  = `contrat_${contratId}_signe_${Date.now()}.pdf`;
    const documentSignePath = await this.storageService.uploadPdf(pdfBuffer, fileName);

    await this.contratRepo.update(contratId, {
      signe:            true,
      signeLe:          new Date(),
      documentSignePath,
    });

    // Notifier le RH que le contrat a été signé
    // On notifie tous les employés avec le rôle RH
    const rhEmployes = await this.employeeRepo.find({
      where: { role: { nom: 'RH' } },
      relations: ['role'],
    });
    for (const rh of rhEmployes) {
      await this.notificationService.create(
        rh.userId,
        `${contrat.employee.prenom} ${contrat.employee.nom} a signé son contrat (${contrat.type} — ${contrat.poste}).`,
        'CONTRAT',
      );
    }

    return { message: `Contrat signé avec succès` };
  }

  async update(contratId: number, dto: UpdateContratDto) {
    await this.getById(contratId);
    await this.contratRepo.update(contratId, dto);
    return this.getById(contratId);
  }

  /**
   * Licencier un employé : résilie TOUS ses contrats ACTIF + envoie une notification
   */
  async licencier(userId: number): Promise<{ message: string; contratsMisAJour: number }> {
    const employee = await this.employeeRepo.findOne({ where: { userId } });
    if (!employee) throw new NotFoundException('Employé introuvable');

    const contratsActifs = await this.contratRepo.find({
      where: { employee: { userId }, statut: 'ACTIF' },
    });

    if (contratsActifs.length === 0) {
      throw new BadRequestException('Cet employé n\'a aucun contrat actif à résilier');
    }

    // Résilier tous les contrats actifs
    for (const contrat of contratsActifs) {
      await this.contratRepo.update(contrat.contratId, { statut: 'RESILIE' });
    }

    // Notifier l'employé
    await this.notificationService.create(
      userId,
      'Votre contrat a été résilié. Votre accès à la plateforme a été révoqué. Veuillez contacter votre responsable RH pour toute question.',
      'SYSTEME',
    );

    return {
      message: `${employee.prenom} ${employee.nom} a été licencié(e). ${contratsActifs.length} contrat(s) résilié(s).`,
      contratsMisAJour: contratsActifs.length,
    };
  }
}
