import {
  LayoutDashboard, Users, Building2, FileText, CalendarDays,
  Award, GraduationCap, Wallet, BarChart3, Brain, Bell, Settings, UserCircle,
} from "lucide-react";
import { SidebarBase, type NavGroup } from "./SidebarBase";

const groups: NavGroup[] = [
  {
    label: "Principal",
    items: [
      { title: "Tableau de bord", url: "/rh",             icon: LayoutDashboard, permission: null },
      { title: "Employés",        url: "/rh/employees",   icon: Users,           permission: "VIEW_EMPLOYEES" },
      { title: "Départements",    url: "/rh/departments", icon: Building2,       permission: "VIEW_DEPARTMENTS" },
      { title: "Contrats",        url: "/rh/contracts",   icon: FileText,        permission: "VIEW_CONTRACTS" },
      { title: "Congés",          url: "/rh/leaves",      icon: CalendarDays,    permission: "VIEW_LEAVES" },
    ],
  },
  {
    label: "Gestion",
    items: [
      { title: "Évaluations", url: "/rh/evaluations", icon: Award,       permission: "VIEW_EVALUATIONS" },
      { title: "Formations",  url: "/rh/trainings",   icon: GraduationCap, permission: "VIEW_TRAININGS" },
      { title: "Paie",        url: "/rh/payroll",     icon: Wallet,      permission: "VIEW_SALARY" },
    ],
  },
  {
    label: "Analytique",
    items: [
      { title: "Rapports RH", url: "/rh/reports", icon: BarChart3, permission: "VIEW_REPORTS" },
      { title: "Analyses IA", url: "/rh/ai",      icon: Brain,     permission: "VIEW_AI" },
    ],
  },
  {
    label: "Système",
    items: [
      { title: "Mes contrats",  url: "/rh/my-contracts",    icon: FileText,   permission: null },
      { title: "Notifications", url: "/rh/notifications",   icon: Bell,       permission: null },
      { title: "Paramètres",    url: "/rh/settings",        icon: Settings,   permission: null },
      { title: "Mon profil",    url: "/rh/profile",         icon: UserCircle, permission: null },
    ],
  },
];

type Props = { collapsed: boolean; onToggle: () => void };

export function Sidebar_rh({ collapsed, onToggle }: Props) {
  const employee    = (() => {
    try { return JSON.parse(localStorage.getItem('employee') || 'null'); } catch { return null; }
  })();
  const permissions: string[] = Array.isArray(employee?.permissions) ? employee.permissions : [];

  return <SidebarBase collapsed={collapsed} onToggle={onToggle} groups={groups} permissions={permissions} />;
}
