import { Injectable, OnApplicationBootstrap } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import * as bcrypt from 'bcrypt';
import { TypeConge } from './entities/typeconge.entity';
import { Role } from './entities/role.entity';
import { Permission } from './entities/permission.entity';
import { Employee } from './entities/employee.entity';
import { Departement } from './entities/departement.entity';
import { Equipe } from './entities/equipe.entity';
import { Contrat } from './entities/contrat.entity';
import { Conge } from './entities/conge.entity';
import { Formation } from './entities/formation.entity';
import { Inscription } from './entities/inscription.entity';
import { Evaluation } from './entities/evaluation.entity';
import { CycleEvaluation } from './entities/cycle_evaluation.entity';
import { Competence } from './entities/competence.entity';
import { EmployeCompetence } from './entities/employe_competence.entity';
import { ParametreRH } from './entities/parametre-rh.entity';
import { Objectif } from './entities/objectif.entity';

// ─── Données de seed statiques ────────────────────────────────────────────────

const ROLES = ['ADMIN', 'RH', 'MANAGER', 'EMPLOYEE'];

const PERMISSIONS = [
  'VIEW_EMPLOYEES',    'CREATE_EMPLOYEE',
  'VIEW_DEPARTMENTS',  'MANAGE_DEPARTMENTS',
  'VIEW_CONTRACTS',    'MANAGE_CONTRACTS',
  'VIEW_LEAVES',       'APPROVE_LEAVE',
  'VIEW_EVALUATIONS',  'MANAGE_EVALUATIONS',
  'VIEW_TRAININGS',    'MANAGE_TRAININGS',
  'VIEW_TEAM',
  'VIEW_SALARY',
  'VIEW_REPORTS',      'VIEW_AI',
];

const TYPES_CONGE = [
  'Congé annuel',
  'Congé maladie',
  'Congé maternité',
  'Congé paternité',
  'Congé sans solde',
  'Congé exceptionnel',
  'Congé de formation',
  'Récupération',
];

// ─── Service ──────────────────────────────────────────────────────────────────

@Injectable()
export class AppService implements OnApplicationBootstrap {
  constructor(
    @InjectRepository(TypeConge)       private readonly typeCongeRepo:       Repository<TypeConge>,
    @InjectRepository(Role)            private readonly roleRepo:            Repository<Role>,
    @InjectRepository(Permission)      private readonly permissionRepo:      Repository<Permission>,
    @InjectRepository(Employee)        private readonly employeeRepo:        Repository<Employee>,
    @InjectRepository(Departement)     private readonly departementRepo:     Repository<Departement>,
    @InjectRepository(Equipe)          private readonly equipeRepo:          Repository<Equipe>,
    @InjectRepository(Contrat)         private readonly contratRepo:         Repository<Contrat>,
    @InjectRepository(Conge)           private readonly congeRepo:           Repository<Conge>,
    @InjectRepository(Formation)       private readonly formationRepo:       Repository<Formation>,
    @InjectRepository(Inscription)     private readonly inscriptionRepo:     Repository<Inscription>,
    @InjectRepository(Evaluation)      private readonly evaluationRepo:      Repository<Evaluation>,
    @InjectRepository(CycleEvaluation) private readonly cycleRepo:           Repository<CycleEvaluation>,
    @InjectRepository(Competence)      private readonly competenceRepo:      Repository<Competence>,
    @InjectRepository(EmployeCompetence) private readonly empCompRepo:       Repository<EmployeCompetence>,
    @InjectRepository(ParametreRH)     private readonly parametreRepo:       Repository<ParametreRH>,
    @InjectRepository(Objectif)        private readonly objectifRepo:        Repository<Objectif>,
  ) {}

  async onApplicationBootstrap() {
    await this.seedRoles();
    await this.seedPermissions();
    await this.seedTypesConge();
    await this.seedAdmin();
    await this.seedDemoData();
  }

  // ── 1. Rôles ────────────────────────────────────────────────────────────────
  private async seedRoles() {
    for (const nom of ROLES) {
      const exists = await this.roleRepo.findOne({ where: { nom } });
      if (!exists) await this.roleRepo.save(this.roleRepo.create({ nom }));
    }
  }

  // ── 2. Permissions ──────────────────────────────────────────────────────────
  private async seedPermissions() {
    for (const nom of PERMISSIONS) {
      const exists = await this.permissionRepo.findOne({ where: { nom } });
      if (!exists) await this.permissionRepo.save(this.permissionRepo.create({ nom }));
    }
  }

  // ── 3. Types de congés ──────────────────────────────────────────────────────
  private async seedTypesConge() {
    for (const nomType of TYPES_CONGE) {
      const exists = await this.typeCongeRepo.findOne({ where: { nomType } });
      if (!exists) await this.typeCongeRepo.save(this.typeCongeRepo.create({ nomType }));
    }
  }

  // ── 4. Administrateur par défaut ────────────────────────────────────────────
  private async seedAdmin() {
    const email = 'admin@yoursgrh.com';
    if (await this.employeeRepo.findOne({ where: { email } })) return;

    const roleAdmin = await this.roleRepo.findOne({ where: { nom: 'ADMIN' } });
    if (!roleAdmin) return;

    const allPermissions = await this.permissionRepo.find();
    const admin = this.employeeRepo.create({
      nom: 'AKPAOKA', prenom: 'Admin', email,
      password:           await bcrypt.hash('directeur8585', 10),
      phone:              '+22900000000',
      poste:              'Administrateur Système',
      soldeConges:        25,
      mustChangePassword: false,
      role:               roleAdmin,
      permissions:        allPermissions,
    });
    await this.employeeRepo.save(admin);
    console.log('✅ Admin seedé : admin@yoursgrh.com');
  }


  // ── 5. Données de démonstration ──────────────────────────────────────────────
  private async seedDemoData() {
    // Guard : ne re-seeder que si la base est vide (hors admin)
    const count = await this.employeeRepo.count();
    if (count > 1) {
      console.log('ℹ️  Données de démo déjà présentes — seed ignoré');
      return;
    }

    console.log('🌱 Seeding données de démo...');

    // ── Helpers ─────────────────────────────────────────────────────────────────
    const getRole  = (nom: string) => this.roleRepo.findOneOrFail({ where: { nom } });
    const getPerms = async (noms: string[]) => this.permissionRepo.find({ where: noms.map(n => ({ nom: n })) });
    const hash     = (p: string) => bcrypt.hash(p, 10);

    // ── Paramètres RH ────────────────────────────────────────────────────────
    const parametre = await this.parametreRepo.save(this.parametreRepo.create({
      nom_entreprise:       'TechBénin SARL',
      adresse_entreprise:   'Avenue Jean-Paul II, Cotonou, Bénin',
      email:                'contact@techbenin.bj',
      phone:                '+22921000000',
      taux_conges_annuels:  30,
      solde_conges_initial: 15,
      nb_jours_preavis_conge: 3,
    }));
    console.log('✅ Paramètres RH seedés');

    // ── Départements ─────────────────────────────────────────────────────────
    const deptInfo = await this.departementRepo.save(this.departementRepo.create({
      nom: 'Informatique', description: 'Développement logiciel et systèmes', rendement: 78,
    }));
    const deptComm = await this.departementRepo.save(this.departementRepo.create({
      nom: 'Commercial', description: 'Ventes, marketing et relation client', rendement: 65,
    }));
    console.log('✅ Départements seedés');

    // ── Rôles & permissions ──────────────────────────────────────────────────
    const roleRH      = await getRole('RH');
    const roleManager = await getRole('MANAGER');
    const roleEmp     = await getRole('EMPLOYEE');

    const permsRH = await getPerms([
      'VIEW_EMPLOYEES', 'CREATE_EMPLOYEE', 'VIEW_DEPARTMENTS', 'MANAGE_DEPARTMENTS',
      'VIEW_CONTRACTS', 'MANAGE_CONTRACTS', 'VIEW_LEAVES', 'APPROVE_LEAVE',
      'VIEW_EVALUATIONS', 'MANAGE_EVALUATIONS', 'VIEW_TRAININGS', 'MANAGE_TRAININGS',
      'VIEW_SALARY', 'VIEW_REPORTS', 'VIEW_AI',
    ]);
    const permsManager = await getPerms([
      'VIEW_TEAM', 'VIEW_LEAVES', 'APPROVE_LEAVE',
      'VIEW_EVALUATIONS', 'MANAGE_EVALUATIONS', 'VIEW_TRAININGS',
    ]);
    const permsEmp = await getPerms(['VIEW_TEAM']);

    // ── RH ───────────────────────────────────────────────────────────────────
    const rh = await this.employeeRepo.save(this.employeeRepo.create({
      nom: 'HOUNKPE', prenom: 'Marie', email: 'marie.hounkpe@techbenin.bj',
      password: await hash('password123'), phone: '+22997111111',
      poste: 'Responsable RH', date_embauche: new Date('2022-03-15'),
      soldeConges: 15, mustChangePassword: false,
      role: roleRH, permissions: permsRH,
    }));

    // ── Équipes + Managers ───────────────────────────────────────────────────
    // On crée d'abord les managers sans équipe, puis on assigne
    const mgr1 = await this.employeeRepo.save(this.employeeRepo.create({
      nom: 'AGOSSOU', prenom: 'Koffi', email: 'koffi.agossou@techbenin.bj',
      password: await hash('password123'), phone: '+22997222222',
      poste: 'Chef de Projet Backend', date_embauche: new Date('2020-06-01'),
      soldeConges: 15, mustChangePassword: false,
      role: roleManager, permissions: permsManager,
    }));
    const mgr2 = await this.employeeRepo.save(this.employeeRepo.create({
      nom: 'DOSSOU', prenom: 'Sylvie', email: 'sylvie.dossou@techbenin.bj',
      password: await hash('password123'), phone: '+22997333333',
      poste: 'Lead Designer Frontend', date_embauche: new Date('2021-02-10'),
      soldeConges: 15, mustChangePassword: false,
      role: roleManager, permissions: permsManager,
    }));
    const mgr3 = await this.employeeRepo.save(this.employeeRepo.create({
      nom: 'ADJOVI', prenom: 'Jean', email: 'jean.adjovi@techbenin.bj',
      password: await hash('password123'), phone: '+22997444444',
      poste: 'Directeur Commercial', date_embauche: new Date('2019-09-01'),
      soldeConges: 15, mustChangePassword: false,
      role: roleManager, permissions: permsManager,
    }));

    // ── Équipes ──────────────────────────────────────────────────────────────
    const equipeBackend = await this.equipeRepo.save(this.equipeRepo.create({
      nom: 'Équipe Dev Backend', rendement: 82, departement: deptInfo, manager: mgr1,
    }));
    const equipeFrontend = await this.equipeRepo.save(this.equipeRepo.create({
      nom: 'Équipe Dev Frontend', rendement: 75, departement: deptInfo, manager: mgr2,
    }));
    const equipeVentes = await this.equipeRepo.save(this.equipeRepo.create({
      nom: 'Équipe Ventes', rendement: 68, departement: deptComm, manager: mgr3,
    }));
    const equipeMarketing = await this.equipeRepo.save(this.equipeRepo.create({
      nom: 'Équipe Marketing', rendement: 60, departement: deptComm,
    }));
    console.log('✅ Équipes seedées');

    // Affecter les managers à leurs équipes
    await this.employeeRepo.update(mgr1.userId, { equipe: equipeBackend });
    await this.employeeRepo.update(mgr2.userId, { equipe: equipeFrontend });
    await this.employeeRepo.update(mgr3.userId, { equipe: equipeVentes });


    // ── Employés (profils contrastés pour l'IA) ──────────────────────────────
    const arnaud = await this.employeeRepo.save(this.employeeRepo.create({
      nom: 'KPOSSOU', prenom: 'Arnaud', email: 'arnaud.kpossou@techbenin.bj',
      password: await hash('password123'), phone: '+22997555555',
      poste: 'Développeur Senior', date_embauche: new Date('2021-04-01'),
      soldeConges: 15, mustChangePassword: false,
      role: roleEmp, permissions: permsEmp, equipe: equipeBackend,
    }));
    const fatou = await this.employeeRepo.save(this.employeeRepo.create({
      nom: 'MENSAH', prenom: 'Fatou', email: 'fatou.mensah@techbenin.bj',
      password: await hash('password123'), phone: '+22997666666',
      poste: 'Développeuse Junior', date_embauche: new Date('2024-06-01'),
      // Profil RISQUE DÉPART : pas d'équipe (isolement), solde élevé (désengagement)
      soldeConges: 28, mustChangePassword: false,
      role: roleEmp, permissions: permsEmp,
      // NOTE : pas d'équipe volontairement → a_equipe=0 → +2 au score départ
    }));
    const boris = await this.employeeRepo.save(this.employeeRepo.create({
      nom: 'CODJO', prenom: 'Boris', email: 'boris.codjo@techbenin.bj',
      password: await hash('password123'), phone: '+22997777777',
      poste: 'Développeur Frontend', date_embauche: new Date('2023-01-15'),
      soldeConges: 15, mustChangePassword: false,
      role: roleEmp, permissions: permsEmp, equipe: equipeFrontend,
    }));
    const aline = await this.employeeRepo.save(this.employeeRepo.create({
      nom: 'SOGLO', prenom: 'Aline', email: 'aline.soglo@techbenin.bj',
      password: await hash('password123'), phone: '+22997888888',
      poste: 'Commerciale Senior', date_embauche: new Date('2020-10-01'),
      soldeConges: 15, mustChangePassword: false,
      role: roleEmp, permissions: permsEmp, equipe: equipeVentes,
    }));
    const marc = await this.employeeRepo.save(this.employeeRepo.create({
      nom: 'TOVIHO', prenom: 'Marc', email: 'marc.toviho@techbenin.bj',
      password: await hash('password123'), phone: '+22997999999',
      poste: 'Commercial Junior', date_embauche: new Date('2024-10-01'),
      // Profil RISQUE DÉPART : salaire très bas, pas d'équipe, solde très élevé
      soldeConges: 30, mustChangePassword: false,
      role: roleEmp, permissions: permsEmp,
      // NOTE : pas d'équipe volontairement → a_equipe=0 → +2 au score départ
    }));
    const diane = await this.employeeRepo.save(this.employeeRepo.create({
      nom: 'AHOSSI', prenom: 'Diane', email: 'diane.ahossi@techbenin.bj',
      password: await hash('password123'), phone: '+22998111111',
      poste: 'UI Designer', date_embauche: new Date('2022-07-01'),
      soldeConges: 15, mustChangePassword: false,
      role: roleEmp, permissions: permsEmp, equipe: equipeFrontend,
    }));
    const paul = await this.employeeRepo.save(this.employeeRepo.create({
      nom: 'AGBANLIN', prenom: 'Paul', email: 'paul.agbanlin@techbenin.bj',
      password: await hash('password123'), phone: '+22998222222',
      poste: 'Chargé Marketing', date_embauche: new Date('2023-03-01'),
      soldeConges: 15, mustChangePassword: false,
      role: roleEmp, permissions: permsEmp, equipe: equipeMarketing,
    }));
    console.log('✅ Employés seedés');

    // ── Contrats actifs ───────────────────────────────────────────────────────
    const contrats = [
      { emp: rh,     type: 'CDI', poste: 'Responsable RH',         salaire: 450000, debut: '2022-03-15' },
      { emp: mgr1,   type: 'CDI', poste: 'Chef de Projet Backend',  salaire: 520000, debut: '2020-06-01' },
      { emp: mgr2,   type: 'CDI', poste: 'Lead Designer Frontend',  salaire: 480000, debut: '2021-02-10' },
      { emp: mgr3,   type: 'CDI', poste: 'Directeur Commercial',    salaire: 550000, debut: '2019-09-01' },
      { emp: arnaud, type: 'CDI', poste: 'Développeur Senior',      salaire: 380000, debut: '2021-04-01' },
      { emp: fatou,  type: 'CDD', poste: 'Développeuse Junior',     salaire: 100000, debut: '2024-06-01' },
      { emp: boris,  type: 'CDI', poste: 'Développeur Frontend',    salaire: 300000, debut: '2023-01-15' },
      { emp: aline,  type: 'CDI', poste: 'Commerciale Senior',      salaire: 350000, debut: '2020-10-01' },
      { emp: marc,   type: 'CDD', poste: 'Commercial Junior',       salaire: 110000, debut: '2024-10-01' },
      { emp: diane,  type: 'CDI', poste: 'UI Designer',             salaire: 260000, debut: '2022-07-01' },
      { emp: paul,   type: 'CDI', poste: 'Chargé Marketing',        salaire: 240000, debut: '2023-03-01' },
    ];
    for (const c of contrats) {
      await this.contratRepo.save(this.contratRepo.create({
        type: c.type, poste: c.poste, salaire: c.salaire,
        date_debut: new Date(c.debut), statut: 'ACTIF', signe: true,
        signeLe: new Date(c.debut), employee: c.emp,
      }));
    }

    // Contrats EXPIRE historiques — permettent à nb_promotions > 0 dans le modèle IA
    const contratsHistoriques = [
      // Arnaud : promu de 280k → 380k (1 promotion confirmée)
      { emp: arnaud, type: 'CDI', poste: 'Développeur Junior',  salaire: 280000, debut: '2019-09-01', fin: '2021-03-31' },
      // Aline  : promue de 230k → 350k (1 promotion confirmée)
      { emp: aline,  type: 'CDI', poste: 'Commerciale Junior',  salaire: 230000, debut: '2018-04-01', fin: '2020-09-30' },
      // Mgr1   : promu de 350k → 520k (1 promotion confirmée)
      { emp: mgr1,   type: 'CDI', poste: 'Développeur Senior',  salaire: 350000, debut: '2018-03-01', fin: '2020-05-31' },
    ];
    for (const c of contratsHistoriques) {
      await this.contratRepo.save(this.contratRepo.create({
        type: c.type, poste: c.poste, salaire: c.salaire,
        date_debut: new Date(c.debut), date_fin: new Date(c.fin),
        statut: 'EXPIRE', signe: true, signeLe: new Date(c.debut), employee: c.emp,
      }));
    }
    console.log('✅ Contrats seedés');


    // ── Cycles d'évaluation ───────────────────────────────────────────────────
    const cycle2024 = await this.cycleRepo.save(this.cycleRepo.create({
      nom: 'Évaluation Annuelle 2024',
      date_debut: new Date('2024-01-01'),
      date_fin:   new Date('2024-12-31'),
      criteres:   ['Technique', 'Communication', 'Ponctualité', 'Initiative'],
    }));
    const cycle2025 = await this.cycleRepo.save(this.cycleRepo.create({
      nom: 'Évaluation Annuelle 2025',
      date_debut: new Date('2025-01-01'),
      date_fin:   new Date('2025-12-31'),
      criteres:   ['Technique', 'Communication', 'Ponctualité', 'Initiative', 'Leadership'],
    }));
    console.log('✅ Cycles d\'évaluation seedés');

    // ── Évaluations (2 par employé — 1 par cycle) ────────────────────────────
    // Evaluateur = mgr correspondant à l'équipe
    const evals: { emp: Employee; eval1: number; eval2: number }[] = [
      // Profil PROMOTION : notes élevées et croissantes
      { emp: arnaud, eval1: 4.5, eval2: 4.7 },
      { emp: aline,  eval1: 4.3, eval2: 4.6 },
      // Profil DÉPART : notes basses
      { emp: fatou,  eval1: 2.1, eval2: 1.8 },
      // Profil LICENCIEMENT : notes très basses
      { emp: marc,   eval1: 1.8, eval2: 1.3 },
      // Profils STABLES
      { emp: boris,  eval1: 3.2, eval2: 3.5 },
      { emp: diane,  eval1: 3.8, eval2: 3.6 },
      { emp: paul,   eval1: 3.0, eval2: 3.2 },
      { emp: mgr1,   eval1: 4.0, eval2: 4.1 },
      { emp: mgr2,   eval1: 3.7, eval2: 3.9 },
      { emp: mgr3,   eval1: 4.1, eval2: 4.3 },
      { emp: rh,     eval1: 3.9, eval2: 4.0 },
    ];

    const evalAdmin = await this.employeeRepo.findOne({ where: { email: 'admin@yoursgrh.com' } });

    for (const e of evals) {
      await this.evaluationRepo.save(this.evaluationRepo.create({
        notes_criteres: { Technique: e.eval1, Communication: e.eval1, Ponctualité: e.eval1, Initiative: e.eval1 },
        note_globale:   e.eval1,
        date:           new Date('2024-06-15'),
        commentaire:    'Évaluation semestrielle 2024.',
        employee:       e.emp,
        evaluateur:     evalAdmin ?? mgr1,
        cycle:          cycle2024,
      }));
      await this.evaluationRepo.save(this.evaluationRepo.create({
        notes_criteres: { Technique: e.eval2, Communication: e.eval2, Ponctualité: e.eval2, Initiative: e.eval2, Leadership: e.eval2 },
        note_globale:   e.eval2,
        date:           new Date('2025-03-20'),
        commentaire:    'Évaluation Q1 2025.',
        employee:       e.emp,
        evaluateur:     evalAdmin ?? mgr1,
        cycle:          cycle2025,
      }));
    }
    console.log('✅ Évaluations seedées');

    // ── Congés ────────────────────────────────────────────────────────────────
    const typeCongeAnnuel    = await this.typeCongeRepo.findOne({ where: { nomType: 'Congé annuel' } });
    const typeCongeMaladie   = await this.typeCongeRepo.findOne({ where: { nomType: 'Congé maladie' } });
    const typeCongeExcept    = await this.typeCongeRepo.findOne({ where: { nomType: 'Congé exceptionnel' } });

    if (typeCongeAnnuel && typeCongeMaladie && typeCongeExcept) {
      const congesDef = [
        // Arnaud — profil promotion : congés approuvés normaux
        { emp: arnaud, type: typeCongeAnnuel,  debut: '2024-07-15', fin: '2024-07-26', statut: 'APPROUVE', val: mgr1 },
        { emp: arnaud, type: typeCongeAnnuel,  debut: '2025-04-07', fin: '2025-04-11', statut: 'APPROUVE', val: mgr1 },
        // Fatou — profil départ : congés refusés répétés (facteur risque IA fort)
        { emp: fatou,  type: typeCongeAnnuel,  debut: '2024-11-04', fin: '2024-11-08', statut: 'REFUSE',   val: mgr1 },
        { emp: fatou,  type: typeCongeAnnuel,  debut: '2025-02-17', fin: '2025-02-21', statut: 'REFUSE',   val: mgr1 },
        { emp: fatou,  type: typeCongeAnnuel,  debut: '2025-03-10', fin: '2025-03-14', statut: 'REFUSE',   val: mgr1 },
        { emp: fatou,  type: typeCongeMaladie, debut: '2025-04-07', fin: '2025-04-11', statut: 'REFUSE',   val: mgr1 },
        { emp: fatou,  type: typeCongeAnnuel,  debut: '2025-05-05', fin: '2025-05-09', statut: 'REFUSE',   val: mgr1 },
        // Marc — profil départ : congés refusés + sans équipe
        { emp: marc,   type: typeCongeAnnuel,  debut: '2025-01-13', fin: '2025-01-17', statut: 'REFUSE',   val: mgr3 },
        { emp: marc,   type: typeCongeMaladie, debut: '2025-03-03', fin: '2025-03-07', statut: 'REFUSE',   val: mgr3 },
        { emp: marc,   type: typeCongeAnnuel,  debut: '2025-04-14', fin: '2025-04-18', statut: 'REFUSE',   val: mgr3 },
        { emp: marc,   type: typeCongeAnnuel,  debut: '2025-05-19', fin: '2025-05-23', statut: 'REFUSE',   val: mgr3 },
        { emp: marc,   type: typeCongeExcept,  debut: '2025-06-02', fin: '2025-06-06', statut: 'REFUSE',   val: mgr3 },
        // Boris — stable : approuvé
        { emp: boris,  type: typeCongeAnnuel,  debut: '2024-08-12', fin: '2024-08-23', statut: 'APPROUVE', val: mgr2 },
        // Aline — profil promotion : congés approuvés
        { emp: aline,  type: typeCongeAnnuel,  debut: '2024-09-02', fin: '2024-09-13', statut: 'APPROUVE', val: mgr3 },
        { emp: aline,  type: typeCongeExcept,  debut: '2025-01-20', fin: '2025-01-22', statut: 'APPROUVE', val: mgr3 },
        // Diane — stable
        { emp: diane,  type: typeCongeAnnuel,  debut: '2024-12-23', fin: '2025-01-03', statut: 'APPROUVE', val: mgr2 },
        // Paul — en attente (pour tester validation)
        { emp: paul,   type: typeCongeAnnuel,  debut: '2025-07-07', fin: '2025-07-18', statut: 'EN_ATTENTE', val: null },
        // Mgr1 — en attente pour tester
        { emp: mgr1,   type: typeCongeAnnuel,  debut: '2025-08-04', fin: '2025-08-15', statut: 'EN_ATTENTE', val: null },
      ];

      for (const c of congesDef) {
        await this.congeRepo.save(this.congeRepo.create({
          date_debut:  new Date(c.debut),
          date_fin:    new Date(c.fin),
          statut:      c.statut,
          demandeur:   c.emp,
          validateur:  c.val as any ?? null,
          typeConge:   c.type,
          commentaire: '',
        }));
      }
    }
    console.log('✅ Congés seedés');


    // ── Formations ────────────────────────────────────────────────────────────
    // duree = nb_jours_ouvrés (lun-ven) × heures_par_jour (même logique que formation.service.ts)
    const calcDuree = (debut: string, fin: string, hParJour: number): number => {
      let nbJours = 0;
      const current = new Date(debut);
      const end = new Date(fin);
      while (current <= end) {
        const jour = current.getDay();
        if (jour !== 0 && jour !== 6) nbJours++;
        current.setDate(current.getDate() + 1);
      }
      return Math.max(1, nbJours) * hParJour;
    };

    const formations = await Promise.all([
      this.formationRepo.save(this.formationRepo.create({
        titre: 'NestJS Avancé', niveau: 'AVANCÉ', heures_par_jour: 6,
        duree: calcDuree('2025-02-03', '2025-02-14', 6), // 10 jours ouvrés × 6 = 60h
        description: 'Maîtrise des modules NestJS, TypeORM, guards et interceptors.',
        date_debut: new Date('2025-02-03'), date_fin: new Date('2025-02-14'), capacite: 10,
      })),
      this.formationRepo.save(this.formationRepo.create({
        titre: 'React & TypeScript', niveau: 'INTERMÉDIAIRE', heures_par_jour: 5,
        duree: calcDuree('2025-03-03', '2025-03-14', 5), // 10 jours ouvrés × 5 = 50h
        description: 'Développement d\'applications React modernes avec TypeScript.',
        date_debut: new Date('2025-03-03'), date_fin: new Date('2025-03-14'), capacite: 12,
      })),
      this.formationRepo.save(this.formationRepo.create({
        titre: 'Techniques de Vente', niveau: 'INTERMÉDIAIRE', heures_par_jour: 4,
        duree: calcDuree('2025-04-07', '2025-04-11', 4), // 5 jours ouvrés × 4 = 20h
        description: 'Méthodes de prospection, négociation et closing.',
        date_debut: new Date('2025-04-07'), date_fin: new Date('2025-04-11'), capacite: 15,
      })),
      this.formationRepo.save(this.formationRepo.create({
        titre: 'Leadership & Management d\'Équipe', niveau: 'INTERMÉDIAIRE', heures_par_jour: 4,
        duree: calcDuree('2025-05-05', '2025-05-16', 4), // 10 jours ouvrés × 4 = 40h
        description: 'Gestion d\'équipe, communication et conduite du changement.',
        date_debut: new Date('2025-05-05'), date_fin: new Date('2025-05-16'), capacite: 8,
      })),
    ]);
    const [fNestjs, fReact, fVente, fLeadership] = formations;
    console.log('✅ Formations seedées');

    // ── Inscriptions ──────────────────────────────────────────────────────────
    const inscriptions: { emp: Employee; form: Formation }[] = [
      { emp: arnaud, form: fNestjs     },
      { emp: arnaud, form: fLeadership },
      { emp: fatou,  form: fReact      },
      { emp: boris,  form: fReact      },
      { emp: boris,  form: fNestjs     },
      { emp: diane,  form: fReact      },
      { emp: diane,  form: fLeadership },
      { emp: aline,  form: fVente      },
      { emp: aline,  form: fLeadership },
      { emp: mgr3,   form: fVente      },
      { emp: mgr3,   form: fLeadership },
      { emp: paul,   form: fVente      },
      { emp: mgr1,   form: fNestjs     },
      { emp: mgr2,   form: fReact      },
    ];
    for (const ins of inscriptions) {
      await this.inscriptionRepo.save(this.inscriptionRepo.create({
        userId:      ins.emp.userId,
        formationId: ins.form.formationId,
        employee:    ins.emp,
        formation:   ins.form,
        date_inscription: new Date(),
      }));
    }
    console.log('✅ Inscriptions formations seedées');

    // ── Compétences ───────────────────────────────────────────────────────────
    const competenceDefs = [
      { nom: 'TypeScript',       categorie: 'Technique'    },
      { nom: 'NestJS',           categorie: 'Technique'    },
      { nom: 'PostgreSQL',       categorie: 'Technique'    },
      { nom: 'React',            categorie: 'Technique'    },
      { nom: 'Figma',            categorie: 'Technique'    },
      { nom: 'Négociation',      categorie: 'Soft Skill'   },
      { nom: 'Vente',            categorie: 'Soft Skill'   },
      { nom: 'CRM',              categorie: 'Technique'    },
      { nom: 'Communication',    categorie: 'Soft Skill'   },
      { nom: 'Leadership',       categorie: 'Management'   },
      { nom: 'JavaScript',       categorie: 'Technique'    },
      { nom: 'Marketing Digital', categorie: 'Marketing'   },
    ];
    const competences: Record<string, Competence> = {};
    for (const cd of competenceDefs) {
      const comp = await this.competenceRepo.save(this.competenceRepo.create(cd));
      competences[cd.nom] = comp;
    }

    // Niveaux par employé (1=débutant, 5=expert)
    const empComps: { emp: Employee; comp: string; niveau: number }[] = [
      // Arnaud — profil PROMOTION : compétences hautes
      { emp: arnaud, comp: 'TypeScript',    niveau: 5 },
      { emp: arnaud, comp: 'NestJS',        niveau: 4 },
      { emp: arnaud, comp: 'PostgreSQL',    niveau: 4 },
      { emp: arnaud, comp: 'Leadership',    niveau: 3 },
      // Fatou — profil DÉPART : compétences faibles
      { emp: fatou,  comp: 'JavaScript',    niveau: 2 },
      { emp: fatou,  comp: 'React',         niveau: 2 },
      // Boris — stable
      { emp: boris,  comp: 'React',         niveau: 3 },
      { emp: boris,  comp: 'TypeScript',    niveau: 3 },
      { emp: boris,  comp: 'Figma',         niveau: 2 },
      // Aline — profil PROMOTION : compétences commerciales hautes
      { emp: aline,  comp: 'Vente',         niveau: 5 },
      { emp: aline,  comp: 'Négociation',   niveau: 4 },
      { emp: aline,  comp: 'CRM',           niveau: 4 },
      { emp: aline,  comp: 'Communication', niveau: 4 },
      // Marc — profil LICENCIEMENT : compétences très faibles
      { emp: marc,   comp: 'Négociation',   niveau: 2 },
      { emp: marc,   comp: 'CRM',           niveau: 1 },
      // Diane — stable
      { emp: diane,  comp: 'Figma',         niveau: 4 },
      { emp: diane,  comp: 'React',         niveau: 3 },
      { emp: diane,  comp: 'Communication', niveau: 3 },
      // Paul — stable
      { emp: paul,   comp: 'Marketing Digital', niveau: 3 },
      { emp: paul,   comp: 'Communication', niveau: 3 },
      // Managers
      { emp: mgr1,   comp: 'NestJS',        niveau: 5 },
      { emp: mgr1,   comp: 'Leadership',    niveau: 4 },
      { emp: mgr1,   comp: 'PostgreSQL',    niveau: 3 },
      { emp: mgr2,   comp: 'React',         niveau: 5 },
      { emp: mgr2,   comp: 'Figma',         niveau: 4 },
      { emp: mgr3,   comp: 'Vente',         niveau: 5 },
      { emp: mgr3,   comp: 'Négociation',   niveau: 5 },
      { emp: mgr3,   comp: 'Leadership',    niveau: 4 },
    ];
    for (const ec of empComps) {
      await this.empCompRepo.save(this.empCompRepo.create({
        employee:   ec.emp,
        competence: competences[ec.comp],
        niveau:     ec.niveau,
      }));
    }
    console.log('✅ Compétences seedées');

    // ── Objectifs d'équipe ────────────────────────────────────────────────────
    await this.objectifRepo.save(this.objectifRepo.create({
      titre: 'Migrer l\'API vers NestJS v10', date_debut: new Date('2024-09-01'),
      date_fin: new Date('2024-12-31'), status: 'ATTEINT', points: 100, equipe: equipeBackend,
    }));
    await this.objectifRepo.save(this.objectifRepo.create({
      titre: 'Refonte UI du tableau de bord', date_debut: new Date('2025-01-06'),
      date_fin: new Date('2025-03-31'), status: 'ATTEINT', points: 80, equipe: equipeFrontend,
    }));
    await this.objectifRepo.save(this.objectifRepo.create({
      titre: 'Intégration service IA', date_debut: new Date('2025-03-01'),
      date_fin: new Date('2025-06-30'), status: 'EN_COURS', points: 120, equipe: equipeBackend,
    }));
    await this.objectifRepo.save(this.objectifRepo.create({
      titre: 'Atteindre 50 nouveaux clients', date_debut: new Date('2025-01-06'),
      date_fin: new Date('2025-06-30'), status: 'EN_COURS', points: 150, equipe: equipeVentes,
    }));
    await this.objectifRepo.save(this.objectifRepo.create({
      titre: 'Lancer campagne réseaux sociaux', date_debut: new Date('2025-04-01'),
      date_fin: new Date('2025-07-31'), status: 'EN_COURS', points: 90, equipe: equipeMarketing,
    }));
    await this.objectifRepo.save(this.objectifRepo.create({
      titre: 'Optimisation des performances DB', date_debut: new Date('2024-06-01'),
      date_fin: new Date('2024-08-31'), status: 'ATTEINT', points: 70, equipe: equipeBackend,
    }));
    console.log('✅ Objectifs seedés');

    // Supprimer l'avertissement sur le paramètre non utilisé
    void parametre;

    console.log('🎉 Seed de démo terminé — TechBénin SARL prêt pour la soutenance');
  }

  getHello(): string {
    return 'YOURSGRH API';
  }
}
