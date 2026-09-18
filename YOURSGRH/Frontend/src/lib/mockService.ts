// ─────────────────────────────────────────────────────────────────────────────
// YOURSGRH — MockService : remplace tous les appels axios par du localStorage
// ─────────────────────────────────────────────────────────────────────────────

import {
  EMPLOYEES_DEFAULT,
  DEPARTEMENTS_DEFAULT,
  CONTRATS_DEFAULT,
  CONGES_DEFAULT,
  TYPES_CONGES_DEFAULT,
  FICHES_PAIE_DEFAULT,
  FORMATIONS_DEFAULT,
  CYCLES_EVALUATION_DEFAULT,
  EVALUATIONS_DEFAULT,
  HEURES_SUP_DEFAULT,
  OBJECTIFS_DEFAULT,
  COMPETENCES_EMPLOYES_DEFAULT,
  COMPETENCES_DEFAULT,
  NOTIFICATIONS_DEFAULT,
  RAPPORTS_DEFAULT,
  PREDICTIONS_DEFAULT,
  PARAMETRES_RH_DEFAULT,
  ALL_PERMISSIONS,
  ROLES,
  DEMO_ACCOUNTS,
} from "./mockData";

// ─── Helpers localStorage ─────────────────────────────────────────────────────

function getStore<T>(key: string, defaults: T[]): T[] {
  try {
    const raw = localStorage.getItem(key);
    if (!raw) {
      localStorage.setItem(key, JSON.stringify(defaults));
      return defaults;
    }
    return JSON.parse(raw) as T[];
  } catch {
    return defaults;
  }
}

function setStore<T>(key: string, data: T[]): void {
  localStorage.setItem(key, JSON.stringify(data));
}

function getStoreOne<T>(key: string, defaults: T): T {
  try {
    const raw = localStorage.getItem(key);
    if (!raw) {
      localStorage.setItem(key, JSON.stringify(defaults));
      return defaults;
    }
    return JSON.parse(raw) as T;
  } catch {
    return defaults;
  }
}

function setStoreOne<T>(key: string, data: T): void {
  localStorage.setItem(key, JSON.stringify(data));
}

// ─── Initialisation des données (appelée au démarrage) ────────────────────────

export function initMockData(): void {
  // N'initialise que si pas encore fait
  if (!localStorage.getItem("mock_initialized")) {
    localStorage.setItem("grh_employees",    JSON.stringify(EMPLOYEES_DEFAULT));
    localStorage.setItem("grh_departements", JSON.stringify(DEPARTEMENTS_DEFAULT));
    localStorage.setItem("grh_contrats",     JSON.stringify(CONTRATS_DEFAULT));
    localStorage.setItem("grh_conges",       JSON.stringify(CONGES_DEFAULT));
    localStorage.setItem("grh_types_conges", JSON.stringify(TYPES_CONGES_DEFAULT));
    localStorage.setItem("grh_fiches_paie",  JSON.stringify(FICHES_PAIE_DEFAULT));
    localStorage.setItem("grh_formations",   JSON.stringify(FORMATIONS_DEFAULT));
    localStorage.setItem("grh_cycles_eval",  JSON.stringify(CYCLES_EVALUATION_DEFAULT));
    localStorage.setItem("grh_evaluations",  JSON.stringify(EVALUATIONS_DEFAULT));
    localStorage.setItem("grh_heures_sup",   JSON.stringify(HEURES_SUP_DEFAULT));
    localStorage.setItem("grh_objectifs",    JSON.stringify(OBJECTIFS_DEFAULT));
    localStorage.setItem("grh_competences_emp", JSON.stringify(COMPETENCES_EMPLOYES_DEFAULT));
    localStorage.setItem("grh_notifications",JSON.stringify(NOTIFICATIONS_DEFAULT));
    localStorage.setItem("grh_rapports",     JSON.stringify(RAPPORTS_DEFAULT));
    localStorage.setItem("grh_predictions",  JSON.stringify(PREDICTIONS_DEFAULT));
    localStorage.setItem("grh_parametres",   JSON.stringify(PARAMETRES_RH_DEFAULT));
    localStorage.setItem("mock_initialized", "1");
  }
}

// ─── Générateur d'ID ─────────────────────────────────────────────────────────

function nextId(items: { [key: string]: any }[]): number {
  if (items.length === 0) return 1;
  const ids = items.map((i) => {
    // cherche la première clé qui finit par "Id" ou qui s'appelle "id"
    const idKey = Object.keys(i).find(
      (k) => k.toLowerCase().endsWith("id") || k === "id"
    );
    return idKey ? Number(i[idKey]) || 0 : 0;
  });
  return Math.max(...ids) + 1;
}

// ─── Génère un faux token JWT non-expirant ────────────────────────────────────

export function generateFakeToken(userId: number): string {
  // exp dans 30 jours
  const payload = {
    sub: userId,
    exp: Math.floor(Date.now() / 1000) + 30 * 24 * 3600,
  };
  const encoded = btoa(JSON.stringify(payload));
  return `eyJhbGciOiJub25lIn0.${encoded}.fake-signature`;
}

// ═══════════════════════════════════════════════════════════════════════════════
// AUTH
// ═══════════════════════════════════════════════════════════════════════════════

export const authService = {
  login(email: string, password: string): { access_token: string; employee: any } {
    const account = DEMO_ACCOUNTS.find(
      (a) => a.email === email && a.password === password
    );
    if (!account) throw new Error("Identifiants invalides");

    const employees = getStore("grh_employees", EMPLOYEES_DEFAULT);
    const emp = employees.find((e: any) => e.userId === account.userId);
    if (!emp) throw new Error("Employé introuvable");

    const token = generateFakeToken(emp.userId);
    return { access_token: token, employee: emp };
  },

  changePassword(_newPassword: string): { access_token: string; employee: any } {
    // En mode démo : on met juste à jour mustChangePassword → false
    const empStr = localStorage.getItem("employee");
    if (!empStr) throw new Error("Non authentifié");
    const emp = JSON.parse(empStr);
    emp.mustChangePassword = false;

    // Mettre à jour dans le store
    const employees = getStore("grh_employees", EMPLOYEES_DEFAULT);
    const idx = employees.findIndex((e: any) => e.userId === emp.userId);
    if (idx !== -1) { (employees[idx] as any).mustChangePassword = false; setStore("grh_employees", employees); }

    const token = generateFakeToken(emp.userId);
    return { access_token: token, employee: emp };
  },
};

// ═══════════════════════════════════════════════════════════════════════════════
// EMPLOYEES
// ═══════════════════════════════════════════════════════════════════════════════

export const employeeService = {
  getAll(page = 1, limit = 10): { data: any[]; total: number; totalPages: number } {
    const all = getStore("grh_employees", EMPLOYEES_DEFAULT);
    const start = (page - 1) * limit;
    return {
      data: all.slice(start, start + limit),
      total: all.length,
      totalPages: Math.ceil(all.length / limit),
    };
  },

  getById(id: number): any {
    const all = getStore("grh_employees", EMPLOYEES_DEFAULT);
    const emp = all.find((e: any) => e.userId === id);
    if (!emp) throw new Error("Employé introuvable");
    return emp;
  },

  create(data: any): { employee: any } {
    const employees = getStore("grh_employees", EMPLOYEES_DEFAULT);
    const newEmp = {
      userId: nextId(employees),
      nom: data.nom,
      prenom: data.prenom,
      email: data.email,
      phone: data.phone || "",
      poste: data.poste || "",
      date_embauche: new Date().toISOString().split("T")[0],
      soldeConges: 25,
      mustChangePassword: true,
      role: ROLES.find((r) => r.roleId === data.role) || { nom: "EMPLOYEE" },
      permissions: [],
      equipe: null,
      contrats: [],
    };
    employees.push(newEmp);
    setStore("grh_employees", employees);
    return { employee: newEmp };
  },

  update(id: number, data: any): any {
    const employees = getStore("grh_employees", EMPLOYEES_DEFAULT);
    const idx = employees.findIndex((e: any) => e.userId === id);
    if (idx === -1) throw new Error("Employé introuvable");
    (employees[idx] as any) = { ...(employees[idx] as any), ...data };
    setStore("grh_employees", employees);
    return employees[idx];
  },

  addPermission(id: number, permNom: string): void {
    const employees = getStore("grh_employees", EMPLOYEES_DEFAULT);
    const emp: any = employees.find((e: any) => e.userId === id);
    if (!emp) return;
    if (!emp.permissions) emp.permissions = [];
    if (!emp.permissions.find((p: any) => p.nom === permNom)) {
      emp.permissions.push({ nom: permNom });
    }
    setStore("grh_employees", employees);
  },

  removePermission(id: number, permNom: string): void {
    const employees = getStore("grh_employees", EMPLOYEES_DEFAULT);
    const emp: any = employees.find((e: any) => e.userId === id);
    if (!emp) return;
    emp.permissions = (emp.permissions || []).filter((p: any) => p.nom !== permNom);
    setStore("grh_employees", employees);
  },

  getAllPermissions(): { data: any[] } {
    return { data: ALL_PERMISSIONS };
  },

  getAllRoles(): any[] {
    return ROLES;
  },
};

// ═══════════════════════════════════════════════════════════════════════════════
// DEPARTEMENTS & ÉQUIPES
// ═══════════════════════════════════════════════════════════════════════════════

export const departementService = {
  getAll(): any[] {
    return getStore("grh_departements", DEPARTEMENTS_DEFAULT);
  },

  getById(id: number): any {
    const all = getStore("grh_departements", DEPARTEMENTS_DEFAULT);
    const dept = all.find((d: any) => d.departId === id);
    if (!dept) throw new Error("Département introuvable");
    return dept;
  },

  create(data: { nom: string; description?: string }): void {
    const depts = getStore("grh_departements", DEPARTEMENTS_DEFAULT);
    depts.push({
      departId: nextId(depts),
      nom: data.nom,
      description: data.description || "",
      rendement: 0,
      equipes: [],
    } as any);
    setStore("grh_departements", depts);
  },
};

export const equipeService = {
  getByDepartement(departId: number): any[] {
    const depts = getStore("grh_departements", DEPARTEMENTS_DEFAULT);
    const dept: any = depts.find((d: any) => d.departId === departId);
    return dept?.equipes || [];
  },

  getMonEquipe(managerId: number): any {
    const depts = getStore("grh_departements", DEPARTEMENTS_DEFAULT);
    const employees = getStore("grh_employees", EMPLOYEES_DEFAULT);
    for (const dept of depts as any[]) {
      for (const eq of dept.equipes || []) {
        if (eq.manager?.userId === managerId) {
          // enrichir avec les vrais membres
          const membres = employees.filter((e: any) => e.equipe?.equipeId === eq.equipeId);
          return { ...eq, employes: membres };
        }
      }
    }
    return null;
  },

  getById(equipeId: number): any {
    const depts = getStore("grh_departements", DEPARTEMENTS_DEFAULT);
    const employees = getStore("grh_employees", EMPLOYEES_DEFAULT);
    for (const dept of depts as any[]) {
      for (const eq of dept.equipes || []) {
        if (eq.equipeId === equipeId) {
          const membres = employees.filter((e: any) => e.equipe?.equipeId === equipeId);
          return { ...eq, employes: membres };
        }
      }
    }
    return null;
  },

  create(data: { nom: string; departId: number }): { equipe: any } {
    const depts = getStore("grh_departements", DEPARTEMENTS_DEFAULT);
    const dept: any = depts.find((d: any) => d.departId === data.departId);
    if (!dept) throw new Error("Département introuvable");
    const allEquipes = (depts as any[]).flatMap((d: any) => d.equipes || []);
    const newEq = {
      equipeId: nextId(allEquipes),
      nom: data.nom,
      rendement: 0,
      departement: { nom: dept.nom },
      manager: null,
      employes: [],
    };
    dept.equipes.push(newEq);
    setStore("grh_departements", depts);
    return { equipe: newEq };
  },

  update(equipeId: number, data: any): void {
    const depts = getStore("grh_departements", DEPARTEMENTS_DEFAULT);
    const employees = getStore("grh_employees", EMPLOYEES_DEFAULT);
    for (const dept of depts as any[]) {
      const eq = dept.equipes?.find((e: any) => e.equipeId === equipeId);
      if (eq) {
        if (data.nom !== undefined) eq.nom = data.nom;
        if ("managerId" in data) {
          if (data.managerId === null) {
            eq.manager = null;
          } else {
            const mgr: any = employees.find((e: any) => e.userId === data.managerId);
            if (mgr) eq.manager = { userId: mgr.userId, nom: mgr.nom, prenom: mgr.prenom, poste: mgr.poste };
          }
        }
        break;
      }
    }
    setStore("grh_departements", depts);
  },

  assignerMembre(equipeId: number, userId: number): void {
    const employees = getStore("grh_employees", EMPLOYEES_DEFAULT);
    const depts = getStore("grh_departements", DEPARTEMENTS_DEFAULT);
    const emp: any = employees.find((e: any) => e.userId === userId);
    if (!emp) return;
    // Trouver l'équipe pour récupérer les infos
    for (const dept of depts as any[]) {
      const eq = dept.equipes?.find((e: any) => e.equipeId === equipeId);
      if (eq) {
        emp.equipe = { equipeId: eq.equipeId, nom: eq.nom, departement: { nom: dept.nom } };
        break;
      }
    }
    setStore("grh_employees", employees);
  },

  retirerMembre(equipeId: number, userId: number): void {
    const employees = getStore("grh_employees", EMPLOYEES_DEFAULT);
    const emp: any = employees.find((e: any) => e.userId === userId);
    if (emp && emp.equipe?.equipeId === equipeId) emp.equipe = null;
    setStore("grh_employees", employees);
  },

  delete(equipeId: number): void {
    const depts = getStore("grh_departements", DEPARTEMENTS_DEFAULT);
    for (const dept of depts as any[]) {
      dept.equipes = (dept.equipes || []).filter((e: any) => e.equipeId !== equipeId);
    }
    setStore("grh_departements", depts);
  },
};

// ═══════════════════════════════════════════════════════════════════════════════
// CONGÉS
// ═══════════════════════════════════════════════════════════════════════════════

export const congeService = {
  getAll(limit = 1000): any[] {
    return getStore("grh_conges", CONGES_DEFAULT).slice(0, limit);
  },

  getMesConges(userId: number): any[] {
    return getStore("grh_conges", CONGES_DEFAULT).filter(
      (c: any) => c.demandeur?.userId === userId
    );
  },

  getMonEquipe(managerId: number): any[] {
    // Récupérer les membres de l'équipe du manager
    const equipe = equipeService.getMonEquipe(managerId);
    if (!equipe) return [];
    const memberIds = new Set((equipe.employes || []).map((e: any) => e.userId));
    return getStore("grh_conges", CONGES_DEFAULT).filter(
      (c: any) => memberIds.has(c.demandeur?.userId)
    );
  },

  getByEmployee(userId: number): any[] {
    return getStore("grh_conges", CONGES_DEFAULT).filter(
      (c: any) => c.demandeur?.userId === userId
    );
  },

  demander(userId: number, data: any): void {
    const conges = getStore("grh_conges", CONGES_DEFAULT);
    const employees = getStore("grh_employees", EMPLOYEES_DEFAULT);
    const emp: any = employees.find((e: any) => e.userId === userId);
    const types = getStore("grh_types_conges", TYPES_CONGES_DEFAULT);
    const typeConge: any = types.find((t: any) => t.typeCId === data.typeCId);
    conges.push({
      congeId: nextId(conges),
      date_debut: data.date_debut,
      date_fin: data.date_fin,
      statut: "EN_ATTENTE",
      commentaire: data.commentaire || "",
      demandeur: { userId: emp?.userId, nom: emp?.nom, prenom: emp?.prenom, poste: emp?.poste },
      typeConge: { nomType: typeConge?.nomType || "Congé", impacte_salaire: typeConge?.impacte_salaire || false },
      validateur: null,
    } as any);
    setStore("grh_conges", conges);
  },

  valider(congeId: number, statut: "APPROUVE" | "REFUSE", validateurId: number): void {
    const conges = getStore("grh_conges", CONGES_DEFAULT);
    const employees = getStore("grh_employees", EMPLOYEES_DEFAULT);
    const validateur: any = employees.find((e: any) => e.userId === validateurId);
    const c: any = conges.find((x: any) => x.congeId === congeId);
    if (c) {
      c.statut = statut;
      c.validateur = validateur ? { nom: validateur.nom, prenom: validateur.prenom } : null;
    }
    setStore("grh_conges", conges);
  },

  annuler(congeId: number): void {
    const conges = getStore("grh_conges", CONGES_DEFAULT).filter(
      (c: any) => c.congeId !== congeId
    );
    setStore("grh_conges", conges);
  },
};

export const typeCongeService = {
  getAll(): any[] {
    return getStore("grh_types_conges", TYPES_CONGES_DEFAULT);
  },

  add(data: { nomType: string; impacte_salaire: boolean }): void {
    const types = getStore("grh_types_conges", TYPES_CONGES_DEFAULT);
    types.push({ typeCId: nextId(types), ...data } as any);
    setStore("grh_types_conges", types);
  },

  delete(id: number): void {
    const types = getStore("grh_types_conges", TYPES_CONGES_DEFAULT).filter(
      (t: any) => t.typeCId !== id
    );
    setStore("grh_types_conges", types);
  },
};

// ═══════════════════════════════════════════════════════════════════════════════
// CONTRATS
// ═══════════════════════════════════════════════════════════════════════════════

export const contratService = {
  getAll(limit = 1000): any[] {
    return getStore("grh_contrats", CONTRATS_DEFAULT).slice(0, limit);
  },

  getMesContrats(userId: number): any[] {
    return getStore("grh_contrats", CONTRATS_DEFAULT).filter(
      (c: any) => c.employee?.userId === userId
    );
  },

  getByEmployee(userId: number): any[] {
    return getStore("grh_contrats", CONTRATS_DEFAULT).filter(
      (c: any) => c.employee?.userId === userId
    );
  },

  add(data: any): void {
    const contrats = getStore("grh_contrats", CONTRATS_DEFAULT);
    const employees = getStore("grh_employees", EMPLOYEES_DEFAULT);
    const emp: any = employees.find((e: any) => e.userId === data.userId);
    contrats.push({
      contratId: nextId(contrats),
      type: data.type,
      poste: data.poste,
      salaire: data.salaire,
      date_debut: data.date_debut,
      date_fin: data.date_fin || undefined,
      statut: "ACTIF",
      signe: false,
      signeLe: null,
      documentPath: null,
      documentSignePath: null,
      employee: emp ? { userId: emp.userId, nom: emp.nom, prenom: emp.prenom, email: emp.email } : null,
    } as any);
    setStore("grh_contrats", contrats);
  },

  signer(contratId: number, _signature: string): void {
    const contrats = getStore("grh_contrats", CONTRATS_DEFAULT);
    const c: any = contrats.find((x: any) => x.contratId === contratId);
    if (c) {
      c.signe = true;
      c.signeLe = new Date().toISOString().split("T")[0];
    }
    setStore("grh_contrats", contrats);
  },

  licencier(userId: number): void {
    const contrats = getStore("grh_contrats", CONTRATS_DEFAULT);
    for (const c of contrats as any[]) {
      if (c.employee?.userId === userId && c.statut === "ACTIF") {
        c.statut = "RESILIE";
      }
    }
    setStore("grh_contrats", contrats);
  },
};

// ═══════════════════════════════════════════════════════════════════════════════
// FICHES DE PAIE
// ═══════════════════════════════════════════════════════════════════════════════

export const fichePaieService = {
  getAll(page = 1, limit = 10): { data: any[]; total: number; totalPages: number } {
    const all = getStore("grh_fiches_paie", FICHES_PAIE_DEFAULT);
    const sorted = [...all].sort((a: any, b: any) =>
      b.periode.localeCompare(a.periode)
    );
    const start = (page - 1) * limit;
    return {
      data: sorted.slice(start, start + limit),
      total: sorted.length,
      totalPages: Math.ceil(sorted.length / limit),
    };
  },

  getMesFiches(userId: number, page = 1, limit = 10): { data: any[]; total: number; totalPages: number } {
    const all = getStore("grh_fiches_paie", FICHES_PAIE_DEFAULT).filter(
      (f: any) => f.employee?.userId === userId
    );
    const sorted = [...all].sort((a: any, b: any) =>
      b.periode.localeCompare(a.periode)
    );
    const start = (page - 1) * limit;
    return {
      data: sorted.slice(start, start + limit),
      total: sorted.length,
      totalPages: Math.ceil(sorted.length / limit),
    };
  },

  genererTous(periode: string, nbHeuresSup: number): { generes: number; ignores: number; erreurs: string[] } {
    const fiches = getStore("grh_fiches_paie", FICHES_PAIE_DEFAULT);
    const employees = getStore("grh_employees", EMPLOYEES_DEFAULT);
    const contrats = getStore("grh_contrats", CONTRATS_DEFAULT);
    const conges = getStore("grh_conges", CONGES_DEFAULT);
    let generes = 0;
    const erreurs: string[] = [];

    for (const emp of employees as any[]) {
      // Vérif si déjà générée
      if (fiches.find((f: any) => f.employee?.userId === emp.userId && f.periode === periode)) {
        continue;
      }
      const contrat: any = (contrats as any[]).find(
        (c: any) => c.employee?.userId === emp.userId && c.statut === "ACTIF"
      );
      if (!contrat) { erreurs.push(`${emp.prenom} ${emp.nom}: pas de contrat actif`); continue; }

      const salaireBase = contrat.salaire;
      // Calculer les jours d'absence sur la période
      const [annee, mois] = periode.split("-").map(Number);
      const debutPeriode = new Date(annee, mois - 1, 1);
      const finPeriode = new Date(annee, mois, 0);
      const absences = (conges as any[]).filter((c: any) =>
        c.demandeur?.userId === emp.userId &&
        c.statut === "APPROUVE" &&
        new Date(c.date_debut) <= finPeriode &&
        new Date(c.date_fin) >= debutPeriode &&
        (conges as any[]).find((x: any) => x.congeId === c.congeId)?.typeConge?.impacte_salaire
      );
      const nbJoursAbs = absences.reduce((sum: number, c: any) => {
        const debut = Math.max(new Date(c.date_debut).getTime(), debutPeriode.getTime());
        const fin   = Math.min(new Date(c.date_fin).getTime(), finPeriode.getTime());
        return sum + Math.ceil((fin - debut) / (1000 * 60 * 60 * 24)) + 1;
      }, 0);

      const tauxJournalier = salaireBase / 21.67;
      const deductionAbsence = nbJoursAbs * tauxJournalier;
      const tauxHoraire = salaireBase / 173.33;
      const montantSup = nbHeuresSup * tauxHoraire * 1.12;
      const salaireNet = Math.round((salaireBase - deductionAbsence + montantSup) * 100) / 100;

      fiches.push({
        ficheId: nextId(fiches),
        periode,
        salaire_base: salaireBase,
        nb_jours_absence: nbJoursAbs,
        deduction_absence: Math.round(deductionAbsence * 100) / 100,
        salaire_net: salaireNet,
        nb_heures_sup: nbHeuresSup,
        montant_heures_sup: Math.round(montantSup * 100) / 100,
        date_generation: new Date().toISOString().split("T")[0],
        employee: { userId: emp.userId, nom: emp.nom, prenom: emp.prenom, poste: emp.poste },
      } as any);
      generes++;
    }
    setStore("grh_fiches_paie", fiches);
    return { generes, ignores: employees.length - generes - erreurs.length, erreurs };
  },
};

// ═══════════════════════════════════════════════════════════════════════════════
// FORMATIONS
// ═══════════════════════════════════════════════════════════════════════════════

export const formationService = {
  getAll(limit = 100): any[] {
    return getStore("grh_formations", FORMATIONS_DEFAULT).slice(0, limit);
  },

  getByEmployee(userId: number): any[] {
    return getStore("grh_formations", FORMATIONS_DEFAULT).filter(
      (f: any) => (f.employes || []).some((e: any) => e.userId === userId)
    );
  },

  add(data: any): void {
    const formations = getStore("grh_formations", FORMATIONS_DEFAULT);
    formations.push({ formationId: nextId(formations), ...data, employes: [] } as any);
    setStore("grh_formations", formations);
  },

  inscrire(formationId: number, userId: number): void {
    const formations = getStore("grh_formations", FORMATIONS_DEFAULT);
    const employees = getStore("grh_employees", EMPLOYEES_DEFAULT);
    const f: any = formations.find((x: any) => x.formationId === formationId);
    const emp: any = employees.find((e: any) => e.userId === userId);
    if (f && emp) {
      if (!f.employes) f.employes = [];
      if (!f.employes.find((e: any) => e.userId === userId)) {
        f.employes.push({ userId: emp.userId, nom: emp.nom, prenom: emp.prenom });
      }
    }
    setStore("grh_formations", formations);
  },

  desinscrire(formationId: number, userId: number): void {
    const formations = getStore("grh_formations", FORMATIONS_DEFAULT);
    const f: any = formations.find((x: any) => x.formationId === formationId);
    if (f) f.employes = (f.employes || []).filter((e: any) => e.userId !== userId);
    setStore("grh_formations", formations);
  },
};

// ═══════════════════════════════════════════════════════════════════════════════
// CYCLES D'ÉVALUATION
// ═══════════════════════════════════════════════════════════════════════════════

export const cycleEvaluationService = {
  getAll(): any[] {
    const cycles = getStore("grh_cycles_eval", CYCLES_EVALUATION_DEFAULT);
    const evaluations = getStore("grh_evaluations", EVALUATIONS_DEFAULT);
    return cycles.map((c: any) => ({
      ...c,
      evaluations: evaluations.filter((e: any) => e.cycle?.cycleId === c.cycleId),
    }));
  },

  getById(cycleId: number): any {
    const cycles = getStore("grh_cycles_eval", CYCLES_EVALUATION_DEFAULT);
    const evaluations = getStore("grh_evaluations", EVALUATIONS_DEFAULT);
    const cycle = cycles.find((c: any) => c.cycleId === cycleId);
    if (!cycle) throw new Error("Cycle introuvable");
    return {
      ...cycle,
      evaluations: evaluations.filter((e: any) => e.cycle?.cycleId === cycleId),
    };
  },

  add(data: any): void {
    const cycles = getStore("grh_cycles_eval", CYCLES_EVALUATION_DEFAULT);
    cycles.push({ cycleId: nextId(cycles), ...data, evaluations: [] } as any);
    setStore("grh_cycles_eval", cycles);
  },

  delete(cycleId: number): void {
    const cycles = getStore("grh_cycles_eval", CYCLES_EVALUATION_DEFAULT).filter(
      (c: any) => c.cycleId !== cycleId
    );
    setStore("grh_cycles_eval", cycles);
    // Supprimer les évaluations associées
    const evals = getStore("grh_evaluations", EVALUATIONS_DEFAULT).filter(
      (e: any) => e.cycle?.cycleId !== cycleId
    );
    setStore("grh_evaluations", evals);
  },
};

// ═══════════════════════════════════════════════════════════════════════════════
// ÉVALUATIONS
// ═══════════════════════════════════════════════════════════════════════════════

export const evaluationService = {
  getByEmployee(userId: number): any[] {
    return getStore("grh_evaluations", EVALUATIONS_DEFAULT).filter(
      (e: any) => e.employee?.userId === userId
    );
  },

  getByEvaluateur(evaluateurId: number): any[] {
    return getStore("grh_evaluations", EVALUATIONS_DEFAULT).filter(
      (e: any) => e.evaluateur?.userId === evaluateurId
    );
  },

  add(data: any): void {
    const evals = getStore("grh_evaluations", EVALUATIONS_DEFAULT);
    const employees = getStore("grh_employees", EMPLOYEES_DEFAULT);
    const cycles = getStore("grh_cycles_eval", CYCLES_EVALUATION_DEFAULT);
    const emp: any = employees.find((e: any) => e.userId === data.userId);
    const evaluateur: any = employees.find((e: any) => e.userId === data.evaluateurId);
    const cycle: any = cycles.find((c: any) => c.cycleId === data.cycleId);

    const notes = Object.values(data.notes_criteres || {}) as number[];
    const note_globale = notes.length
      ? Math.round((notes.reduce((a: number, b: number) => a + b, 0) / notes.length) * 10) / 10
      : 0;

    evals.push({
      evaluationId: nextId(evals),
      note_globale,
      notes_criteres: data.notes_criteres || {},
      date: data.date || new Date().toISOString().split("T")[0],
      commentaire: data.commentaire || "",
      cycle: cycle ? { cycleId: cycle.cycleId, nom: cycle.nom, date_debut: cycle.date_debut, date_fin: cycle.date_fin } : null,
      employee: emp ? { userId: emp.userId, nom: emp.nom, prenom: emp.prenom, poste: emp.poste } : null,
      evaluateur: evaluateur ? { userId: evaluateur.userId, nom: evaluateur.nom, prenom: evaluateur.prenom, poste: evaluateur.poste } : null,
    } as any);
    setStore("grh_evaluations", evals);
  },
};

// ═══════════════════════════════════════════════════════════════════════════════
// HEURES SUPPLÉMENTAIRES
// ═══════════════════════════════════════════════════════════════════════════════

export const heuresSupService = {
  getMesDeclarations(userId: number): any[] {
    return getStore("grh_heures_sup", HEURES_SUP_DEFAULT).filter(
      (h: any) => h.employee?.userId === userId
    );
  },

  getMonEquipe(managerId: number): any[] {
    const equipe = equipeService.getMonEquipe(managerId);
    if (!equipe) return [];
    const memberIds = new Set((equipe.employes || []).map((e: any) => e.userId));
    return getStore("grh_heures_sup", HEURES_SUP_DEFAULT).filter(
      (h: any) => memberIds.has(h.employee?.userId)
    );
  },

  declarer(userId: number, data: any): void {
    const heures = getStore("grh_heures_sup", HEURES_SUP_DEFAULT);
    const employees = getStore("grh_employees", EMPLOYEES_DEFAULT);
    const emp: any = employees.find((e: any) => e.userId === userId);
    heures.push({
      heuresSupId: nextId(heures),
      date: data.date,
      nb_heures: data.nb_heures,
      motif: data.motif || "",
      statut: "EN_ATTENTE",
      employee: emp ? { userId: emp.userId, nom: emp.nom, prenom: emp.prenom, poste: emp.poste } : null,
      validateur: null,
    } as any);
    setStore("grh_heures_sup", heures);
  },

  valider(id: number, statut: "VALIDEE" | "REFUSEE", validateurId: number): void {
    const heures = getStore("grh_heures_sup", HEURES_SUP_DEFAULT);
    const employees = getStore("grh_employees", EMPLOYEES_DEFAULT);
    const validateur: any = employees.find((e: any) => e.userId === validateurId);
    const h: any = heures.find((x: any) => x.heuresSupId === id);
    if (h) {
      h.statut = statut;
      h.validateur = validateur ? { nom: validateur.nom, prenom: validateur.prenom } : null;
    }
    setStore("grh_heures_sup", heures);
  },

  annuler(id: number): void {
    const heures = getStore("grh_heures_sup", HEURES_SUP_DEFAULT).filter(
      (h: any) => h.heuresSupId !== id
    );
    setStore("grh_heures_sup", heures);
  },
};

// ═══════════════════════════════════════════════════════════════════════════════
// OBJECTIFS
// ═══════════════════════════════════════════════════════════════════════════════

export const objectifService = {
  getAll(): any[] {
    return getStore("grh_objectifs", OBJECTIFS_DEFAULT);
  },

  getByEquipe(equipeId: number): any[] {
    return getStore("grh_objectifs", OBJECTIFS_DEFAULT).filter(
      (o: any) => o.equipeId === equipeId
    );
  },

  add(data: any): void {
    const objectifs = getStore("grh_objectifs", OBJECTIFS_DEFAULT);
    objectifs.push({
      objectifId: nextId(objectifs),
      titre: data.titre,
      status: "EN_COURS",
      points: data.points || 0,
      date_debut: data.date_debut,
      date_fin: data.date_fin,
      equipeId: data.equipeId,
    } as any);
    setStore("grh_objectifs", objectifs);
  },

  update(id: number, data: any): void {
    const objectifs = getStore("grh_objectifs", OBJECTIFS_DEFAULT);
    const o: any = objectifs.find((x: any) => x.objectifId === id);
    if (o) Object.assign(o, data);
    setStore("grh_objectifs", objectifs);
  },

  delete(id: number): void {
    const objectifs = getStore("grh_objectifs", OBJECTIFS_DEFAULT).filter(
      (o: any) => o.objectifId !== id
    );
    setStore("grh_objectifs", objectifs);
  },
};

// ═══════════════════════════════════════════════════════════════════════════════
// COMPÉTENCES
// ═══════════════════════════════════════════════════════════════════════════════

export const competenceService = {
  getAll(): any[] {
    return COMPETENCES_DEFAULT;
  },

  getByEmployee(userId: number): any[] {
    return getStore("grh_competences_emp", COMPETENCES_EMPLOYES_DEFAULT).filter(
      (c: any) => c.userId === userId
    );
  },

  addToEmployee(userId: number, data: { nom: string; niveau: number }): void {
    const comps = getStore("grh_competences_emp", COMPETENCES_EMPLOYES_DEFAULT);
    const ref = COMPETENCES_DEFAULT.find((c) => c.nom === data.nom) || {
      competenceId: nextId(COMPETENCES_DEFAULT),
      nom: data.nom,
      categorie: undefined,
    };
    comps.push({
      id: nextId(comps),
      userId,
      niveau: data.niveau,
      competence: { competenceId: ref.competenceId, nom: ref.nom, categorie: ref.categorie },
    } as any);
    setStore("grh_competences_emp", comps);
  },
};

// ═══════════════════════════════════════════════════════════════════════════════
// NOTIFICATIONS
// ═══════════════════════════════════════════════════════════════════════════════

export const notificationService = {
  getMesNotifications(userId: number, limit = 100): any[] {
    return getStore("grh_notifications", NOTIFICATIONS_DEFAULT)
      .filter((n: any) => n.userId === userId)
      .sort((a: any, b: any) => new Date(b.date).getTime() - new Date(a.date).getTime())
      .slice(0, limit);
  },

  getNonLues(userId: number): any[] {
    return getStore("grh_notifications", NOTIFICATIONS_DEFAULT).filter(
      (n: any) => n.userId === userId && !n.lu
    );
  },

  lire(notifId: number): void {
    const notifs = getStore("grh_notifications", NOTIFICATIONS_DEFAULT);
    const n: any = notifs.find((x: any) => x.notifId === notifId);
    if (n) n.lu = true;
    setStore("grh_notifications", notifs);
  },

  lireTout(userId: number): void {
    const notifs = getStore("grh_notifications", NOTIFICATIONS_DEFAULT);
    for (const n of notifs as any[]) {
      if (n.userId === userId) n.lu = true;
    }
    setStore("grh_notifications", notifs);
  },
};

// ═══════════════════════════════════════════════════════════════════════════════
// RAPPORTS
// ═══════════════════════════════════════════════════════════════════════════════

export const rapportService = {
  getStats(): any {
    const employees = getStore("grh_employees", EMPLOYEES_DEFAULT);
    const contrats  = getStore("grh_contrats",  CONTRATS_DEFAULT);
    const conges    = getStore("grh_conges",    CONGES_DEFAULT);
    const formations= getStore("grh_formations",FORMATIONS_DEFAULT);
    const depts     = getStore("grh_departements", DEPARTEMENTS_DEFAULT);
    const evaluations = getStore("grh_evaluations", EVALUATIONS_DEFAULT);

    // Regroupement par département
    const parDept: Record<string, number> = {};
    for (const emp of employees as any[]) {
      const nom = emp.equipe?.departement?.nom || "Sans département";
      parDept[nom] = (parDept[nom] || 0) + 1;
    }

    // Regroupement par équipe
    const parEquipe: Record<string, number> = {};
    for (const emp of employees as any[]) {
      if (emp.equipe?.nom) parEquipe[emp.equipe.nom] = (parEquipe[emp.equipe.nom] || 0) + 1;
    }

    // Regroupement par type contrat
    const parTypeContrat: Record<string, number> = {};
    for (const c of contrats as any[]) {
      if (c.statut === "ACTIF") parTypeContrat[c.type] = (parTypeContrat[c.type] || 0) + 1;
    }

    // Congés
    const parTypeConge: Record<string, number> = {};
    for (const c of conges as any[]) {
      const t = c.typeConge?.nomType || "Autre";
      parTypeConge[t] = (parTypeConge[t] || 0) + 1;
    }

    // Formations top
    const topFormations = (formations as any[]).map((f) => ({
      titre: f.titre,
      inscrits: (f.employes || []).length,
      capacite: f.capacite,
    })).sort((a, b) => b.inscrits - a.inscrits).slice(0, 5);

    // Évaluations
    const notes = (evaluations as any[]).map((e) => Number(e.note_globale)).filter(Boolean);
    const noteMoyenne = notes.length
      ? Math.round((notes.reduce((a, b) => a + b, 0) / notes.length) * 10) / 10
      : 0;

    const distribution = [
      { tranche: "1-2", total: notes.filter((n) => n >= 1 && n < 3).length },
      { tranche: "3",   total: notes.filter((n) => n >= 3 && n < 4).length },
      { tranche: "4-5", total: notes.filter((n) => n >= 4).length },
    ];

    // Taux moyen de remplissage des formations
    const tauxMoyen = (formations as any[]).length
      ? Math.round(
          (formations as any[]).reduce((sum, f) =>
            sum + (f.capacite > 0 ? ((f.employes?.length || 0) / f.capacite) * 100 : 0), 0
          ) / (formations as any[]).length
        )
      : 0;

    return {
      effectifs: {
        totalEmployes: employees.length,
        parDepartement: Object.entries(parDept).map(([nom, total]) => ({ nom, total })),
        parTypeContrat: Object.entries(parTypeContrat).map(([type, total]) => ({ type, total })),
        parEquipe: Object.entries(parEquipe).map(([nom, total]) => ({ nom, total })),
      },
      conges: {
        totalEnAttente: (conges as any[]).filter((c: any) => c.statut === "EN_ATTENTE").length,
        totalApprouves: (conges as any[]).filter((c: any) => c.statut === "APPROUVE").length,
        totalRefuses:   (conges as any[]).filter((c: any) => c.statut === "REFUSE").length,
        parType: Object.entries(parTypeConge).map(([type, total]) => ({ type, total })),
      },
      formations: {
        totalFormations: formations.length,
        totalInscrits: (formations as any[]).reduce((sum, f) => sum + (f.employes?.length || 0), 0),
        tauxMoyen,
        topFormations,
      },
      evaluations: {
        totalEvaluations: evaluations.length,
        noteMoyenne,
        distribution,
      },
    };
  },

  getAll(): any[] {
    return getStore("grh_rapports", RAPPORTS_DEFAULT);
  },

  generer(type: string): void {
    const rapports = getStore("grh_rapports", RAPPORTS_DEFAULT);
    const emp = (() => {
      try { return JSON.parse(localStorage.getItem("employee") || "null"); } catch { return null; }
    })();
    const labels: Record<string, string> = {
      EFFECTIFS: "Effectifs", CONGES: "Congés", FORMATIONS: "Formations",
      EVALUATIONS: "Évaluations", COMPLET: "Complet",
    };
    rapports.push({
      rapportId: nextId(rapports),
      titre: `Rapport ${labels[type] || type} — ${new Date().toLocaleDateString("fr-FR", { month: "long", year: "numeric" })}`,
      type,
      date_generation: new Date().toISOString(),
      documentPath: null,
      generePar: emp ? { nom: emp.nom, prenom: emp.prenom } : null,
    } as any);
    setStore("grh_rapports", rapports);
  },

  delete(id: number): void {
    const rapports = getStore("grh_rapports", RAPPORTS_DEFAULT).filter(
      (r: any) => r.rapportId !== id
    );
    setStore("grh_rapports", rapports);
  },
};

// ═══════════════════════════════════════════════════════════════════════════════
// PRÉDICTIONS IA
// ═══════════════════════════════════════════════════════════════════════════════

export const predictionService = {
  getAll(): { data: any[] } {
    return { data: getStore("grh_predictions", PREDICTIONS_DEFAULT) };
  },

  lancer(type: string): any {
    const employees = getStore("grh_employees", EMPLOYEES_DEFAULT);
    const evaluations = getStore("grh_evaluations", EVALUATIONS_DEFAULT);
    const preds = getStore("grh_predictions", PREDICTIONS_DEFAULT);

    let resultats: any[] = [];
    let recommandations: any[] = [];

    if (type === "RISQUE_DEPART") {
      resultats = (employees as any[])
        .filter((e) => !["ADMIN", "RH"].includes((e as any).role?.nom))
        .map((emp: any) => {
          const evals = evaluations.filter((e: any) => e.employee?.userId === emp.userId);
          const noteMoyenne = evals.length
            ? evals.reduce((s: number, e: any) => s + Number(e.note_globale), 0) / evals.length
            : 3;
          const prob = Math.max(5, Math.min(95, Math.round(
            (emp.soldeConges < 5 ? 30 : 0) +
            (noteMoyenne < 3 ? 25 : noteMoyenne > 4 ? -15 : 5) +
            Math.random() * 20 - 10
          )));
          return {
            userId: emp.userId, nom: emp.nom, prenom: emp.prenom, poste: emp.poste,
            probabilite_depart: prob,
            niveau_risque: prob > 60 ? "Élevé" : prob > 35 ? "Modéré" : "Faible",
            risque_depart: prob > 60,
            facteurs_risque: prob > 40 ? ["Peu d'évaluations", "Solde congés faible"] : [],
            facteurs_retention: prob < 50 ? ["Bonne ancienneté", "Formations régulières"] : [],
            actions_recommandees: prob > 50
              ? [{ categorie: "Engagement", action: "Entretien de motivation" }]
              : [],
          };
        });
    } else if (type === "SUGGESTION_PROMOTION") {
      resultats = (employees as any[])
        .filter((e: any) => !["ADMIN", "RH"].includes(e.role?.nom))
        .map((emp: any) => {
          const evals = evaluations.filter((e: any) => e.employee?.userId === emp.userId);
          const noteMoyenne = evals.length
            ? evals.reduce((s: number, e: any) => s + Number(e.note_globale), 0) / evals.length
            : 3;
          const prob = Math.max(5, Math.min(95, Math.round(noteMoyenne * 20 + Math.random() * 10 - 5)));
          return {
            userId: emp.userId, nom: emp.nom, prenom: emp.prenom, poste: emp.poste,
            promotion_suggeree: prob > 70,
            probabilite_promotion: prob,
            niveau_risque: prob > 70 ? "Élevé" : prob > 40 ? "Modéré" : "Faible",
          };
        });
    } else if (type === "SUGGESTION_LICENCIEMENT") {
      resultats = (employees as any[])
        .filter((e: any) => !["ADMIN", "RH"].includes(e.role?.nom))
        .map((emp: any) => {
          const prob = Math.max(1, Math.min(60, Math.round(Math.random() * 30)));
          return {
            userId: emp.userId, nom: emp.nom, prenom: emp.prenom, poste: emp.poste,
            probabilite_licenciement: prob,
            niveau_risque: prob > 40 ? "Élevé" : prob > 20 ? "Modéré" : "Faible",
            licenciement_suggere: prob > 40,
            motifs: prob > 30 ? ["Performances en baisse"] : [],
            points_positifs: ["Bonne intégration équipe"],
            actions_recommandees: prob > 30
              ? [{ categorie: "RH", action: "Entretien d'amélioration" }]
              : [],
          };
        });
    } else if (type === "RECOMMANDATION_FORMATION") {
      const formations = getStore("grh_formations", FORMATIONS_DEFAULT);
      recommandations = (formations as any[]).map((f, i) => ({
        rang: i + 1,
        formationId: f.formationId,
        titre: f.titre,
        niveau: f.niveau,
        score: Math.round(60 + Math.random() * 40),
        raison: "Correspond au profil des employés de l'équipe",
        competences_cibles: [],
      }));
    }

    const message = JSON.stringify({ resultats, recommandations });
    const newPred = {
      predictionId: nextId(preds),
      type,
      date: new Date().toISOString(),
      message,
    };
    preds.push(newPred as any);
    setStore("grh_predictions", preds);

    return {
      message: "Analyse terminée",
      prediction: {
        predictionId: newPred.predictionId,
        type,
        message,
        resultats: type !== "RECOMMANDATION_FORMATION" ? resultats : undefined,
        recommandations: type === "RECOMMANDATION_FORMATION" ? recommandations : undefined,
      },
    };
  },
};

// ═══════════════════════════════════════════════════════════════════════════════
// PARAMÈTRES RH
// ═══════════════════════════════════════════════════════════════════════════════

export const parametreService = {
  get(): any {
    return getStoreOne("grh_parametres", PARAMETRES_RH_DEFAULT);
  },

  update(data: any): void {
    const current = getStoreOne("grh_parametres", PARAMETRES_RH_DEFAULT);
    setStoreOne("grh_parametres", { ...current, ...data });
  },

  setup(data: any): void {
    setStoreOne("grh_parametres", { ...PARAMETRES_RH_DEFAULT, ...data });
  },
};
