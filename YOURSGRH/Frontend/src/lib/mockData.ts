// ─────────────────────────────────────────────────────────────────────────────
// YOURSGRH — Données de démonstration (localStorage uniquement, pas de backend)
// ─────────────────────────────────────────────────────────────────────────────

// ── Comptes de démo disponibles sur la page Login ────────────────────────────
export const DEMO_ACCOUNTS = [
  { email: "admin@yoursgrh.com",    password: "admin123",    role: "ADMIN",    userId: 1  },
  { email: "rh@yoursgrh.com",       password: "rh123",       role: "RH",       userId: 2  },
  { email: "manager@yoursgrh.com",  password: "manager123",  role: "MANAGER",  userId: 3  },
  { email: "employee@yoursgrh.com", password: "employee123", role: "EMPLOYEE", userId: 4  },
];

// ── Permissions disponibles ───────────────────────────────────────────────────
export const ALL_PERMISSIONS = [
  { nom: "VIEW_EMPLOYEES"     },
  { nom: "CREATE_EMPLOYEE"    },
  { nom: "VIEW_DEPARTMENTS"   },
  { nom: "MANAGE_DEPARTMENTS" },
  { nom: "VIEW_CONTRACTS"     },
  { nom: "MANAGE_CONTRACTS"   },
  { nom: "VIEW_LEAVES"        },
  { nom: "APPROVE_LEAVE"      },
  { nom: "VIEW_EVALUATIONS"   },
  { nom: "MANAGE_EVALUATIONS" },
  { nom: "VIEW_TRAININGS"     },
  { nom: "MANAGE_TRAININGS"   },
  { nom: "VIEW_TEAM"          },
  { nom: "VIEW_SALARY"        },
  { nom: "VIEW_REPORTS"       },
  { nom: "VIEW_AI"            },
];

// ── Rôles ─────────────────────────────────────────────────────────────────────
export const ROLES = [
  { roleId: 1, nom: "ADMIN"    },
  { roleId: 2, nom: "RH"       },
  { roleId: 3, nom: "MANAGER"  },
  { roleId: 4, nom: "EMPLOYEE" },
];

// ── Paramètres RH ─────────────────────────────────────────────────────────────
export const PARAMETRES_RH_DEFAULT = {
  parametreId: 1,
  nom_entreprise:          "YOURSGRH Corp",
  adresse_entreprise:      "12 rue de la Paix, 75001 Paris",
  email:                   "contact@yoursgrh.com",
  phone:                   "+33 1 23 45 67 89",
  taux_conges_annuels:     2.5,
  solde_conges_initial:    25,
  nb_jours_preavis_conge:  7,
};

// ── Départements & Équipes ───────────────────────────────────────────────────
export const DEPARTEMENTS_DEFAULT = [
  {
    departId: 1,
    nom: "Ingénierie",
    description: "Développement produit et infrastructure technique",
    rendement: 87,
    equipes: [
      {
        equipeId: 1,
        nom: "Frontend",
        rendement: 90,
        departement: { nom: "Ingénierie", description: "Développement produit et infrastructure technique" },
        manager: { userId: 3, nom: "Martin", prenom: "Sophie", poste: "Lead Developer" },
        employes: [],
      },
      {
        equipeId: 2,
        nom: "Backend",
        rendement: 84,
        departement: { nom: "Ingénierie", description: "Développement produit et infrastructure technique" },
        manager: null,
        employes: [],
      },
    ],
  },
  {
    departId: 2,
    nom: "Ressources Humaines",
    description: "Gestion du personnel et développement organisationnel",
    rendement: 92,
    equipes: [
      {
        equipeId: 3,
        nom: "Recrutement",
        rendement: 95,
        departement: { nom: "Ressources Humaines", description: "Gestion du personnel et développement organisationnel" },
        manager: { userId: 2, nom: "Dupont", prenom: "Marie", poste: "Responsable RH" },
        employes: [],
      },
    ],
  },
  {
    departId: 3,
    nom: "Commercial",
    description: "Ventes, marketing et relation client",
    rendement: 78,
    equipes: [
      {
        equipeId: 4,
        nom: "Ventes",
        rendement: 80,
        departement: { nom: "Commercial", description: "Ventes, marketing et relation client" },
        manager: null,
        employes: [],
      },
    ],
  },
  {
    departId: 4,
    nom: "Finance",
    description: "Comptabilité, contrôle de gestion et trésorerie",
    rendement: 94,
    equipes: [
      {
        equipeId: 5,
        nom: "Comptabilité",
        rendement: 94,
        departement: { nom: "Finance", description: "Comptabilité, contrôle de gestion et trésorerie" },
        manager: null,
        employes: [],
      },
    ],
  },
];

// ── Compétences disponibles ───────────────────────────────────────────────────
export const COMPETENCES_DEFAULT = [
  { competenceId: 1,  nom: "React",            categorie: "Frontend"    },
  { competenceId: 2,  nom: "TypeScript",        categorie: "Frontend"    },
  { competenceId: 3,  nom: "Node.js",           categorie: "Backend"     },
  { competenceId: 4,  nom: "PostgreSQL",        categorie: "Backend"     },
  { competenceId: 5,  nom: "Docker",            categorie: "DevOps"      },
  { competenceId: 6,  nom: "Leadership",        categorie: "Management"  },
  { competenceId: 7,  nom: "Communication",     categorie: "Soft Skills" },
  { competenceId: 8,  nom: "Gestion de projet", categorie: "Management"  },
  { competenceId: 9,  nom: "Python",            categorie: "Data"        },
  { competenceId: 10, nom: "Excel avancé",      categorie: "Finance"     },
  { competenceId: 11, nom: "Négociation",       categorie: "Commercial"  },
  { competenceId: 12, nom: "Recrutement",       categorie: "RH"          },
];

// ── Employés ─────────────────────────────────────────────────────────────────
export const EMPLOYEES_DEFAULT = [
  {
    userId: 1,
    nom: "Rousseau",
    prenom: "Alexandre",
    email: "admin@yoursgrh.com",
    phone: "+33 6 11 22 33 44",
    poste: "Administrateur Système",
    date_embauche: "2020-01-15",
    soldeConges: 25,
    mustChangePassword: false,
    role: { nom: "ADMIN" },
    permissions: ALL_PERMISSIONS,
    equipe: null,
    contrats: [{ statut: "ACTIF", type: "CDI", salaire: 6500 }],
  },
  {
    userId: 2,
    nom: "Dupont",
    prenom: "Marie",
    email: "rh@yoursgrh.com",
    phone: "+33 6 22 33 44 55",
    poste: "Responsable RH",
    date_embauche: "2021-03-01",
    soldeConges: 18,
    mustChangePassword: false,
    role: { nom: "RH" },
    permissions: [
      { nom: "VIEW_EMPLOYEES" }, { nom: "CREATE_EMPLOYEE" },
      { nom: "VIEW_DEPARTMENTS" }, { nom: "MANAGE_DEPARTMENTS" },
      { nom: "VIEW_CONTRACTS" }, { nom: "MANAGE_CONTRACTS" },
      { nom: "VIEW_LEAVES" }, { nom: "APPROVE_LEAVE" },
      { nom: "VIEW_EVALUATIONS" }, { nom: "MANAGE_EVALUATIONS" },
      { nom: "VIEW_TRAININGS" }, { nom: "MANAGE_TRAININGS" },
      { nom: "VIEW_SALARY" }, { nom: "VIEW_REPORTS" }, { nom: "VIEW_AI" },
    ],
    equipe: { equipeId: 3, nom: "Recrutement", departement: { nom: "Ressources Humaines" } },
    contrats: [{ statut: "ACTIF", type: "CDI", salaire: 5200 }],
  },
  {
    userId: 3,
    nom: "Martin",
    prenom: "Sophie",
    email: "manager@yoursgrh.com",
    phone: "+33 6 33 44 55 66",
    poste: "Lead Developer",
    date_embauche: "2019-06-10",
    soldeConges: 12,
    mustChangePassword: false,
    role: { nom: "MANAGER" },
    permissions: [
      { nom: "VIEW_EMPLOYEES" }, { nom: "VIEW_TEAM" },
      { nom: "VIEW_LEAVES" }, { nom: "APPROVE_LEAVE" },
      { nom: "VIEW_EVALUATIONS" }, { nom: "MANAGE_EVALUATIONS" },
      { nom: "VIEW_TRAININGS" },
    ],
    equipe: { equipeId: 1, nom: "Frontend", departement: { nom: "Ingénierie" } },
    contrats: [{ statut: "ACTIF", type: "CDI", salaire: 5800 }],
  },
  {
    userId: 4,
    nom: "Bernard",
    prenom: "Lucas",
    email: "employee@yoursgrh.com",
    phone: "+33 6 44 55 66 77",
    poste: "Développeur Frontend",
    date_embauche: "2022-09-05",
    soldeConges: 8,
    mustChangePassword: false,
    role: { nom: "EMPLOYEE" },
    permissions: [{ nom: "VIEW_TRAININGS" }, { nom: "VIEW_TEAM" }],
    equipe: { equipeId: 1, nom: "Frontend", departement: { nom: "Ingénierie" } },
    contrats: [{ statut: "ACTIF", type: "CDI", salaire: 3800 }],
  },
  {
    userId: 5,
    nom: "Leroy",
    prenom: "Camille",
    email: "camille.leroy@yoursgrh.com",
    phone: "+33 6 55 66 77 88",
    poste: "Développeur Backend",
    date_embauche: "2021-11-20",
    soldeConges: 15,
    mustChangePassword: false,
    role: { nom: "EMPLOYEE" },
    permissions: [{ nom: "VIEW_TRAININGS" }, { nom: "VIEW_TEAM" }],
    equipe: { equipeId: 2, nom: "Backend", departement: { nom: "Ingénierie" } },
    contrats: [{ statut: "ACTIF", type: "CDI", salaire: 4200 }],
  },
  {
    userId: 6,
    nom: "Petit",
    prenom: "Emma",
    email: "emma.petit@yoursgrh.com",
    phone: "+33 6 66 77 88 99",
    poste: "Chargée de Recrutement",
    date_embauche: "2022-02-14",
    soldeConges: 20,
    mustChangePassword: false,
    role: { nom: "EMPLOYEE" },
    permissions: [{ nom: "VIEW_TRAININGS" }, { nom: "VIEW_TEAM" }, { nom: "VIEW_EMPLOYEES" }],
    equipe: { equipeId: 3, nom: "Recrutement", departement: { nom: "Ressources Humaines" } },
    contrats: [{ statut: "ACTIF", type: "CDI", salaire: 3500 }],
  },
  {
    userId: 7,
    nom: "Moreau",
    prenom: "Nicolas",
    email: "nicolas.moreau@yoursgrh.com",
    phone: "+33 6 77 88 99 00",
    poste: "Commercial Senior",
    date_embauche: "2020-07-01",
    soldeConges: 5,
    mustChangePassword: false,
    role: { nom: "EMPLOYEE" },
    permissions: [{ nom: "VIEW_TRAININGS" }],
    equipe: { equipeId: 4, nom: "Ventes", departement: { nom: "Commercial" } },
    contrats: [{ statut: "ACTIF", type: "CDI", salaire: 4000 }],
  },
  {
    userId: 8,
    nom: "Simon",
    prenom: "Isabelle",
    email: "isabelle.simon@yoursgrh.com",
    phone: "+33 6 88 99 00 11",
    poste: "Comptable",
    date_embauche: "2023-01-09",
    soldeConges: 22,
    mustChangePassword: false,
    role: { nom: "EMPLOYEE" },
    permissions: [{ nom: "VIEW_TRAININGS" }],
    equipe: { equipeId: 5, nom: "Comptabilité", departement: { nom: "Finance" } },
    contrats: [{ statut: "ACTIF", type: "CDD", salaire: 3200 }],
  },
  {
    userId: 9,
    nom: "Laurent",
    prenom: "Théo",
    email: "theo.laurent@yoursgrh.com",
    phone: "+33 6 99 00 11 22",
    poste: "DevOps Engineer",
    date_embauche: "2021-05-17",
    soldeConges: 10,
    mustChangePassword: false,
    role: { nom: "EMPLOYEE" },
    permissions: [{ nom: "VIEW_TRAININGS" }, { nom: "VIEW_TEAM" }],
    equipe: { equipeId: 2, nom: "Backend", departement: { nom: "Ingénierie" } },
    contrats: [{ statut: "ACTIF", type: "CDI", salaire: 4500 }],
  },
  {
    userId: 10,
    nom: "Garcia",
    prenom: "Anaïs",
    email: "anais.garcia@yoursgrh.com",
    phone: "+33 6 00 11 22 33",
    poste: "Designer UI/UX",
    date_embauche: "2023-03-20",
    soldeConges: 25,
    mustChangePassword: false,
    role: { nom: "EMPLOYEE" },
    permissions: [{ nom: "VIEW_TRAININGS" }],
    equipe: { equipeId: 1, nom: "Frontend", departement: { nom: "Ingénierie" } },
    contrats: [{ statut: "ACTIF", type: "CDI", salaire: 3600 }],
  },
];

// ── Types de congés ──────────────────────────────────────────────────────────
export const TYPES_CONGES_DEFAULT = [
  { typeCId: 1, nomType: "Congé annuel",        impacte_salaire: false },
  { typeCId: 2, nomType: "Congé maladie",        impacte_salaire: true  },
  { typeCId: 3, nomType: "Congé sans solde",     impacte_salaire: true  },
  { typeCId: 4, nomType: "Congé maternité",      impacte_salaire: false },
  { typeCId: 5, nomType: "Congé exceptionnel",   impacte_salaire: false },
];

// ── Congés ───────────────────────────────────────────────────────────────────
export const CONGES_DEFAULT = [
  {
    congeId: 1,
    date_debut: "2026-08-01",
    date_fin: "2026-08-15",
    statut: "APPROUVE",
    commentaire: "Vacances d'été",
    demandeur: { userId: 4, nom: "Bernard", prenom: "Lucas", poste: "Développeur Frontend" },
    typeConge: { nomType: "Congé annuel", impacte_salaire: false },
    validateur: { nom: "Martin", prenom: "Sophie" },
  },
  {
    congeId: 2,
    date_debut: "2026-09-10",
    date_fin: "2026-09-12",
    statut: "EN_ATTENTE",
    commentaire: "Rendez-vous médical",
    demandeur: { userId: 5, nom: "Leroy", prenom: "Camille", poste: "Développeur Backend" },
    typeConge: { nomType: "Congé maladie", impacte_salaire: true },
    validateur: null,
  },
  {
    congeId: 3,
    date_debut: "2026-10-20",
    date_fin: "2026-10-24",
    statut: "EN_ATTENTE",
    commentaire: "Déménagement",
    demandeur: { userId: 10, nom: "Garcia", prenom: "Anaïs", poste: "Designer UI/UX" },
    typeConge: { nomType: "Congé exceptionnel", impacte_salaire: false },
    validateur: null,
  },
  {
    congeId: 4,
    date_debut: "2026-07-14",
    date_fin: "2026-07-18",
    statut: "REFUSE",
    commentaire: "Congés perso",
    demandeur: { userId: 7, nom: "Moreau", prenom: "Nicolas", poste: "Commercial Senior" },
    typeConge: { nomType: "Congé annuel", impacte_salaire: false },
    validateur: { nom: "Martin", prenom: "Sophie" },
  },
  {
    congeId: 5,
    date_debut: "2026-11-03",
    date_fin: "2026-11-07",
    statut: "EN_ATTENTE",
    commentaire: "",
    demandeur: { userId: 9, nom: "Laurent", prenom: "Théo", poste: "DevOps Engineer" },
    typeConge: { nomType: "Congé annuel", impacte_salaire: false },
    validateur: null,
  },
  {
    congeId: 6,
    date_debut: "2026-06-02",
    date_fin: "2026-06-06",
    statut: "APPROUVE",
    commentaire: "Vacances en famille",
    demandeur: { userId: 6, nom: "Petit", prenom: "Emma", poste: "Chargée de Recrutement" },
    typeConge: { nomType: "Congé annuel", impacte_salaire: false },
    validateur: { nom: "Dupont", prenom: "Marie" },
  },
];

// ── Contrats ─────────────────────────────────────────────────────────────────
export const CONTRATS_DEFAULT = [
  {
    contratId: 1, type: "CDI", poste: "Administrateur Système",
    salaire: 6500, date_debut: "2020-01-15", date_fin: undefined,
    statut: "ACTIF", signe: true, signeLe: "2020-01-15",
    documentPath: null, documentSignePath: null,
    employee: { userId: 1, nom: "Rousseau", prenom: "Alexandre", email: "admin@yoursgrh.com" },
  },
  {
    contratId: 2, type: "CDI", poste: "Responsable RH",
    salaire: 5200, date_debut: "2021-03-01", date_fin: undefined,
    statut: "ACTIF", signe: true, signeLe: "2021-03-01",
    documentPath: null, documentSignePath: null,
    employee: { userId: 2, nom: "Dupont", prenom: "Marie", email: "rh@yoursgrh.com" },
  },
  {
    contratId: 3, type: "CDI", poste: "Lead Developer",
    salaire: 5800, date_debut: "2019-06-10", date_fin: undefined,
    statut: "ACTIF", signe: true, signeLe: "2019-06-10",
    documentPath: null, documentSignePath: null,
    employee: { userId: 3, nom: "Martin", prenom: "Sophie", email: "manager@yoursgrh.com" },
  },
  {
    contratId: 4, type: "CDI", poste: "Développeur Frontend",
    salaire: 3800, date_debut: "2022-09-05", date_fin: undefined,
    statut: "ACTIF", signe: true, signeLe: "2022-09-05",
    documentPath: null, documentSignePath: null,
    employee: { userId: 4, nom: "Bernard", prenom: "Lucas", email: "employee@yoursgrh.com" },
  },
  {
    contratId: 5, type: "CDI", poste: "Développeur Backend",
    salaire: 4200, date_debut: "2021-11-20", date_fin: undefined,
    statut: "ACTIF", signe: true, signeLe: "2021-11-20",
    documentPath: null, documentSignePath: null,
    employee: { userId: 5, nom: "Leroy", prenom: "Camille", email: "camille.leroy@yoursgrh.com" },
  },
  {
    contratId: 6, type: "CDI", poste: "Chargée de Recrutement",
    salaire: 3500, date_debut: "2022-02-14", date_fin: undefined,
    statut: "ACTIF", signe: true, signeLe: "2022-02-14",
    documentPath: null, documentSignePath: null,
    employee: { userId: 6, nom: "Petit", prenom: "Emma", email: "emma.petit@yoursgrh.com" },
  },
  {
    contratId: 7, type: "CDI", poste: "Commercial Senior",
    salaire: 4000, date_debut: "2020-07-01", date_fin: undefined,
    statut: "ACTIF", signe: false, signeLe: null,
    documentPath: null, documentSignePath: null,
    employee: { userId: 7, nom: "Moreau", prenom: "Nicolas", email: "nicolas.moreau@yoursgrh.com" },
  },
  {
    contratId: 8, type: "CDD", poste: "Comptable",
    salaire: 3200, date_debut: "2023-01-09", date_fin: "2025-01-09",
    statut: "RESILIE", signe: true, signeLe: "2023-01-09",
    documentPath: null, documentSignePath: null,
    employee: { userId: 8, nom: "Simon", prenom: "Isabelle", email: "isabelle.simon@yoursgrh.com" },
  },
  {
    contratId: 9, type: "CDI", poste: "Comptable Senior",
    salaire: 3600, date_debut: "2025-01-10", date_fin: undefined,
    statut: "ACTIF", signe: true, signeLe: "2025-01-10",
    documentPath: null, documentSignePath: null,
    employee: { userId: 8, nom: "Simon", prenom: "Isabelle", email: "isabelle.simon@yoursgrh.com" },
  },
  {
    contratId: 10, type: "CDI", poste: "DevOps Engineer",
    salaire: 4500, date_debut: "2021-05-17", date_fin: undefined,
    statut: "ACTIF", signe: true, signeLe: "2021-05-17",
    documentPath: null, documentSignePath: null,
    employee: { userId: 9, nom: "Laurent", prenom: "Théo", email: "theo.laurent@yoursgrh.com" },
  },
  {
    contratId: 11, type: "CDI", poste: "Designer UI/UX",
    salaire: 3600, date_debut: "2023-03-20", date_fin: undefined,
    statut: "ACTIF", signe: true, signeLe: "2023-03-20",
    documentPath: null, documentSignePath: null,
    employee: { userId: 10, nom: "Garcia", prenom: "Anaïs", email: "anais.garcia@yoursgrh.com" },
  },
];

// ── Fiches de paie ────────────────────────────────────────────────────────────
export const FICHES_PAIE_DEFAULT = [
  {
    ficheId: 1, periode: "2026-07", salaire_base: 3800, nb_jours_absence: 0,
    deduction_absence: 0, salaire_net: 3990, nb_heures_sup: 4, montant_heures_sup: 190,
    date_generation: "2026-08-01",
    employee: { userId: 4, nom: "Bernard", prenom: "Lucas", poste: "Développeur Frontend" },
  },
  {
    ficheId: 2, periode: "2026-08", salaire_base: 3800, nb_jours_absence: 2,
    deduction_absence: 347, salaire_net: 3453, nb_heures_sup: 0, montant_heures_sup: 0,
    date_generation: "2026-09-01",
    employee: { userId: 4, nom: "Bernard", prenom: "Lucas", poste: "Développeur Frontend" },
  },
  {
    ficheId: 3, periode: "2026-07", salaire_base: 4200, nb_jours_absence: 0,
    deduction_absence: 0, salaire_net: 4368, nb_heures_sup: 6, montant_heures_sup: 168,
    date_generation: "2026-08-01",
    employee: { userId: 5, nom: "Leroy", prenom: "Camille", poste: "Développeur Backend" },
  },
  {
    ficheId: 4, periode: "2026-08", salaire_base: 5200, nb_jours_absence: 0,
    deduction_absence: 0, salaire_net: 5200, nb_heures_sup: 0, montant_heures_sup: 0,
    date_generation: "2026-09-01",
    employee: { userId: 2, nom: "Dupont", prenom: "Marie", poste: "Responsable RH" },
  },
  {
    ficheId: 5, periode: "2026-07", salaire_base: 5800, nb_jours_absence: 0,
    deduction_absence: 0, salaire_net: 6148, nb_heures_sup: 8, montant_heures_sup: 348,
    date_generation: "2026-08-01",
    employee: { userId: 3, nom: "Martin", prenom: "Sophie", poste: "Lead Developer" },
  },
  {
    ficheId: 6, periode: "2026-08", salaire_base: 4500, nb_jours_absence: 1,
    deduction_absence: 207, salaire_net: 4293, nb_heures_sup: 0, montant_heures_sup: 0,
    date_generation: "2026-09-01",
    employee: { userId: 9, nom: "Laurent", prenom: "Théo", poste: "DevOps Engineer" },
  },
];

// ── Formations ───────────────────────────────────────────────────────────────
export const FORMATIONS_DEFAULT = [
  {
    formationId: 1,
    titre: "React Avancé & Performance",
    description: "Techniques avancées de React : mémoïsation, hooks personnalisés, optimisation du rendu et Server Components.",
    duree: 16,
    heures_par_jour: 8,
    niveau: "Avancé",
    date_debut: "2026-10-06",
    date_fin: "2026-10-07",
    capacite: 10,
    employes: [
      { userId: 4, nom: "Bernard",  prenom: "Lucas"  },
      { userId: 10, nom: "Garcia",  prenom: "Anaïs"  },
    ],
  },
  {
    formationId: 2,
    titre: "Leadership & Management d'équipe",
    description: "Développer ses compétences managériales, animer une équipe et gérer les conflits.",
    duree: 24,
    heures_par_jour: 8,
    niveau: "Intermédiaire",
    date_debut: "2026-11-10",
    date_fin: "2026-11-12",
    capacite: 15,
    employes: [
      { userId: 3, nom: "Martin",  prenom: "Sophie" },
      { userId: 2, nom: "Dupont",  prenom: "Marie"  },
    ],
  },
  {
    formationId: 3,
    titre: "Docker & Kubernetes",
    description: "Maîtriser la conteneurisation avec Docker et l'orchestration avec Kubernetes pour des déploiements modernes.",
    duree: 32,
    heures_par_jour: 8,
    niveau: "Avancé",
    date_debut: "2026-09-22",
    date_fin: "2026-09-25",
    capacite: 8,
    employes: [
      { userId: 9, nom: "Laurent", prenom: "Théo"   },
      { userId: 5, nom: "Leroy",   prenom: "Camille" },
    ],
  },
  {
    formationId: 4,
    titre: "Techniques de recrutement moderne",
    description: "Entretiens structurés, sourcing LinkedIn, évaluation des compétences et expérience candidat.",
    duree: 8,
    heures_par_jour: 8,
    niveau: "Débutant",
    date_debut: "2026-10-15",
    date_fin: "2026-10-15",
    capacite: 12,
    employes: [
      { userId: 6, nom: "Petit", prenom: "Emma" },
    ],
  },
  {
    formationId: 5,
    titre: "Excel pour la Finance",
    description: "Tableaux croisés dynamiques, Power Query, modélisation financière et automatisation des rapports.",
    duree: 16,
    heures_par_jour: 8,
    niveau: "Intermédiaire",
    date_debut: "2026-12-01",
    date_fin: "2026-12-02",
    capacite: 6,
    employes: [],
  },
];

// ── Cycles d'évaluation ───────────────────────────────────────────────────────
export const CYCLES_EVALUATION_DEFAULT = [
  {
    cycleId: 1,
    nom: "Évaluation Annuelle 2025",
    date_debut: "2025-12-01",
    date_fin: "2025-12-31",
    criteres: ["Qualité du travail", "Respect des délais", "Initiative", "Travail en équipe", "Communication"],
    evaluations: [],
  },
  {
    cycleId: 2,
    nom: "Évaluation Mi-année 2026",
    date_debut: "2026-06-01",
    date_fin: "2026-06-30",
    criteres: ["Performance technique", "Autonomie", "Adaptabilité", "Impact business"],
    evaluations: [],
  },
];

// ── Évaluations ───────────────────────────────────────────────────────────────
export const EVALUATIONS_DEFAULT = [
  {
    evaluationId: 1,
    note_globale: 4.2,
    notes_criteres: {
      "Qualité du travail": 4,
      "Respect des délais": 4,
      "Initiative": 5,
      "Travail en équipe": 4,
      "Communication": 4,
    },
    date: "2025-12-15",
    commentaire: "Excellent travail cette année, très bonne maîtrise des technologies frontend.",
    cycle: { cycleId: 1, nom: "Évaluation Annuelle 2025", date_debut: "2025-12-01", date_fin: "2025-12-31" },
    employee: { userId: 4, nom: "Bernard", prenom: "Lucas", poste: "Développeur Frontend" },
    evaluateur: { userId: 3, nom: "Martin", prenom: "Sophie", poste: "Lead Developer" },
  },
  {
    evaluationId: 2,
    note_globale: 3.8,
    notes_criteres: {
      "Qualité du travail": 4,
      "Respect des délais": 3,
      "Initiative": 4,
      "Travail en équipe": 4,
      "Communication": 4,
    },
    date: "2025-12-18",
    commentaire: "Bonne performance globale, quelques améliorations possibles sur les délais.",
    cycle: { cycleId: 1, nom: "Évaluation Annuelle 2025", date_debut: "2025-12-01", date_fin: "2025-12-31" },
    employee: { userId: 5, nom: "Leroy", prenom: "Camille", poste: "Développeur Backend" },
    evaluateur: { userId: 3, nom: "Martin", prenom: "Sophie", poste: "Lead Developer" },
  },
  {
    evaluationId: 3,
    note_globale: 4.5,
    notes_criteres: {
      "Performance technique": 5,
      "Autonomie": 4,
      "Adaptabilité": 4,
      "Impact business": 5,
    },
    date: "2026-06-20",
    commentaire: "Performance exceptionnelle, candidat idéal pour une promotion.",
    cycle: { cycleId: 2, nom: "Évaluation Mi-année 2026", date_debut: "2026-06-01", date_fin: "2026-06-30" },
    employee: { userId: 9, nom: "Laurent", prenom: "Théo", poste: "DevOps Engineer" },
    evaluateur: { userId: 3, nom: "Martin", prenom: "Sophie", poste: "Lead Developer" },
  },
  {
    evaluationId: 4,
    note_globale: 3.5,
    notes_criteres: {
      "Performance technique": 3,
      "Autonomie": 4,
      "Adaptabilité": 3,
      "Impact business": 4,
    },
    date: "2026-06-22",
    commentaire: "Travail correct, montée en compétences à encourager.",
    cycle: { cycleId: 2, nom: "Évaluation Mi-année 2026", date_debut: "2026-06-01", date_fin: "2026-06-30" },
    employee: { userId: 10, nom: "Garcia", prenom: "Anaïs", poste: "Designer UI/UX" },
    evaluateur: { userId: 3, nom: "Martin", prenom: "Sophie", poste: "Lead Developer" },
  },
];

// ── Heures supplémentaires ────────────────────────────────────────────────────
export const HEURES_SUP_DEFAULT = [
  {
    heuresSupId: 1,
    date: "2026-09-02",
    nb_heures: 3,
    motif: "Mise en production urgente",
    statut: "VALIDEE",
    employee: { userId: 4, nom: "Bernard", prenom: "Lucas", poste: "Développeur Frontend" },
    validateur: { nom: "Martin", prenom: "Sophie" },
  },
  {
    heuresSupId: 2,
    date: "2026-09-09",
    nb_heures: 2.5,
    motif: "Correction bugs critiques",
    statut: "EN_ATTENTE",
    employee: { userId: 5, nom: "Leroy", prenom: "Camille", poste: "Développeur Backend" },
    validateur: null,
  },
  {
    heuresSupId: 3,
    date: "2026-09-10",
    nb_heures: 4,
    motif: "Migration infrastructure",
    statut: "EN_ATTENTE",
    employee: { userId: 9, nom: "Laurent", prenom: "Théo", poste: "DevOps Engineer" },
    validateur: null,
  },
  {
    heuresSupId: 4,
    date: "2026-08-28",
    nb_heures: 5,
    motif: "Sprint de livraison client",
    statut: "VALIDEE",
    employee: { userId: 4, nom: "Bernard", prenom: "Lucas", poste: "Développeur Frontend" },
    validateur: { nom: "Martin", prenom: "Sophie" },
  },
];

// ── Objectifs ─────────────────────────────────────────────────────────────────
export const OBJECTIFS_DEFAULT = [
  {
    objectifId: 1,
    titre: "Migrer 100% des tests unitaires vers Vitest",
    status: "EN_COURS",
    points: 80,
    date_debut: "2026-09-01",
    date_fin: "2026-11-30",
    equipeId: 1,
  },
  {
    objectifId: 2,
    titre: "Améliorer le score Lighthouse à 95+",
    status: "ATTEINT",
    points: 100,
    date_debut: "2026-07-01",
    date_fin: "2026-08-31",
    equipeId: 1,
  },
  {
    objectifId: 3,
    titre: "Réduire le temps de déploiement de 50%",
    status: "EN_COURS",
    points: 60,
    date_debut: "2026-09-01",
    date_fin: "2026-12-31",
    equipeId: 2,
  },
  {
    objectifId: 4,
    titre: "Recruter 3 nouveaux développeurs seniors",
    status: "EN_COURS",
    points: 70,
    date_debut: "2026-10-01",
    date_fin: "2026-12-31",
    equipeId: 3,
  },
  {
    objectifId: 5,
    titre: "Atteindre 95% de satisfaction candidats",
    status: "NON_ATTEINT",
    points: 40,
    date_debut: "2026-07-01",
    date_fin: "2026-09-30",
    equipeId: 3,
  },
];

// ── Compétences employés ──────────────────────────────────────────────────────
export const COMPETENCES_EMPLOYES_DEFAULT = [
  { id: 1,  userId: 4, niveau: 4, competence: { competenceId: 1,  nom: "React",            categorie: "Frontend"    } },
  { id: 2,  userId: 4, niveau: 4, competence: { competenceId: 2,  nom: "TypeScript",        categorie: "Frontend"    } },
  { id: 3,  userId: 4, niveau: 3, competence: { competenceId: 7,  nom: "Communication",     categorie: "Soft Skills" } },
  { id: 4,  userId: 5, niveau: 4, competence: { competenceId: 3,  nom: "Node.js",           categorie: "Backend"     } },
  { id: 5,  userId: 5, niveau: 5, competence: { competenceId: 4,  nom: "PostgreSQL",        categorie: "Backend"     } },
  { id: 6,  userId: 3, niveau: 5, competence: { competenceId: 1,  nom: "React",             categorie: "Frontend"    } },
  { id: 7,  userId: 3, niveau: 5, competence: { competenceId: 6,  nom: "Leadership",        categorie: "Management"  } },
  { id: 8,  userId: 3, niveau: 4, competence: { competenceId: 8,  nom: "Gestion de projet", categorie: "Management"  } },
  { id: 9,  userId: 2, niveau: 5, competence: { competenceId: 12, nom: "Recrutement",       categorie: "RH"          } },
  { id: 10, userId: 2, niveau: 4, competence: { competenceId: 6,  nom: "Leadership",        categorie: "Management"  } },
  { id: 11, userId: 9, niveau: 5, competence: { competenceId: 5,  nom: "Docker",            categorie: "DevOps"      } },
  { id: 12, userId: 9, niveau: 4, competence: { competenceId: 3,  nom: "Node.js",           categorie: "Backend"     } },
  { id: 13, userId: 10, niveau: 4, competence: { competenceId: 1, nom: "React",             categorie: "Frontend"    } },
  { id: 14, userId: 7, niveau: 4, competence: { competenceId: 11, nom: "Négociation",       categorie: "Commercial"  } },
  { id: 15, userId: 8, niveau: 5, competence: { competenceId: 10, nom: "Excel avancé",      categorie: "Finance"     } },
];

// ── Notifications ─────────────────────────────────────────────────────────────
export const NOTIFICATIONS_DEFAULT = [
  {
    notifId: 1, userId: 4,
    message: "Votre demande de congé du 1 au 15 août a été approuvée.",
    type: "CONGE", date: "2026-07-20T10:00:00Z", lu: false,
  },
  {
    notifId: 2, userId: 4,
    message: "Votre fiche de paie de juillet 2026 est disponible.",
    type: "PAIE", date: "2026-08-01T08:00:00Z", lu: false,
  },
  {
    notifId: 3, userId: 4,
    message: "Vous avez été inscrit à la formation React Avancé du 6 au 7 octobre.",
    type: "FORMATION", date: "2026-09-05T14:30:00Z", lu: true,
  },
  {
    notifId: 4, userId: 3,
    message: "Une nouvelle demande de congé est en attente de votre validation.",
    type: "CONGE", date: "2026-09-11T09:15:00Z", lu: false,
  },
  {
    notifId: 5, userId: 3,
    message: "La formation Leadership commence dans 5 jours.",
    type: "FORMATION", date: "2026-11-05T08:00:00Z", lu: false,
  },
  {
    notifId: 6, userId: 2,
    message: "3 nouvelles candidatures reçues pour le poste de Développeur Senior.",
    type: "IA", date: "2026-09-10T11:00:00Z", lu: false,
  },
  {
    notifId: 7, userId: 5,
    message: "Votre demande de congé du 10 au 12 septembre est en cours de traitement.",
    type: "CONGE", date: "2026-09-09T16:00:00Z", lu: false,
  },
  {
    notifId: 8, userId: 1,
    message: "Le rapport mensuel d'effectifs a été généré.",
    type: "PAIE", date: "2026-09-01T07:00:00Z", lu: true,
  },
];

// ── Rapports ──────────────────────────────────────────────────────────────────
export const RAPPORTS_DEFAULT = [
  {
    rapportId: 1, titre: "Rapport Effectifs — Septembre 2026", type: "EFFECTIFS",
    date_generation: "2026-09-01T07:00:00Z", documentPath: null,
    generePar: { nom: "Rousseau", prenom: "Alexandre" },
  },
  {
    rapportId: 2, titre: "Rapport Congés — Août 2026", type: "CONGES",
    date_generation: "2026-09-01T07:05:00Z", documentPath: null,
    generePar: { nom: "Dupont", prenom: "Marie" },
  },
  {
    rapportId: 3, titre: "Rapport Formations — T3 2026", type: "FORMATIONS",
    date_generation: "2026-09-01T07:10:00Z", documentPath: null,
    generePar: { nom: "Dupont", prenom: "Marie" },
  },
];

// ── Prédictions IA ────────────────────────────────────────────────────────────
export const PREDICTIONS_DEFAULT = [
  {
    predictionId: 1,
    type: "RISQUE_DEPART",
    date: "2026-09-01T10:00:00Z",
    message: JSON.stringify({
      resultats: [
        {
          userId: 7, nom: "Moreau", prenom: "Nicolas", poste: "Commercial Senior",
          probabilite_depart: 72, niveau_risque: "Élevé", risque_depart: true,
          facteurs_risque: ["Demande de congé refusée", "Peu de formations suivies", "Solde congés faible"],
          facteurs_retention: ["Ancienneté de 6 ans", "Bonne rémunération"],
          actions_recommandees: [
            { categorie: "Engagement", action: "Entretien de motivation avec le manager" },
            { categorie: "Formation",  action: "Proposer une formation en négociation avancée" },
          ],
        },
        {
          userId: 8, nom: "Simon", prenom: "Isabelle", poste: "Comptable",
          probabilite_depart: 41, niveau_risque: "Modéré", risque_depart: false,
          facteurs_risque: ["Contrat CDD récemment renouvelé"],
          facteurs_retention: ["Formations régulières", "Bonne évaluation"],
          actions_recommandees: [
            { categorie: "Contrat", action: "Proposer une conversion CDI" },
          ],
        },
        {
          userId: 4, nom: "Bernard", prenom: "Lucas", poste: "Développeur Frontend",
          probabilite_depart: 18, niveau_risque: "Faible", risque_depart: false,
          facteurs_risque: [],
          facteurs_retention: ["Bonne évaluation", "Formation suivie", "Heures sup validées"],
          actions_recommandees: [],
        },
      ],
    }),
  },
];
