import {
  LayoutDashboard, CalendarDays,
  GraduationCap, Bell, UserCircle, FileText, Award, Timer, Users, Wallet,
} from "lucide-react";
import { SidebarBase, type NavGroup } from "./SidebarBase";

const groups: NavGroup[] = [
  {
    label: "Principal",
    items: [
      { title: "Tableau de bord", url: "/employee",       icon: LayoutDashboard, permission: null },
      { title: "Mon équipe",      url: "/employee/team",  icon: Users,           permission: "VIEW_TEAM" },
    ],
  },
  {
    label: "Mes demandes",
    items: [
      { title: "Mes congés",               url: "/employee/leaves",      icon: CalendarDays,  permission: null },
      { title: "Heures supplémentaires",   url: "/employee/overtime",    icon: Timer,         permission: null },
      { title: "Mes formations",           url: "/employee/trainings",   icon: GraduationCap, permission: null },
      { title: "Mes évaluations",          url: "/employee/evaluations", icon: Award,         permission: null },
    ],
  },
  {
    label: "Mon espace",
    items: [
      { title: "Mes contrats",   url: "/employee/contracts",     icon: FileText,   permission: null },
      { title: "Salaire & Paie", url: "/employee/payroll",       icon: Wallet,     permission: null },
      { title: "Mon profil",     url: "/employee/profile",       icon: UserCircle, permission: null },
      { title: "Notifications",  url: "/employee/notifications", icon: Bell,       permission: null },
    ],
  },
];

type Props = { collapsed: boolean; onToggle: () => void };

export function Sidebar_emp({ collapsed, onToggle }: Props) {
  const employee    = (() => {
    try { return JSON.parse(localStorage.getItem('employee') || 'null'); } catch { return null; }
  })();
  const permissions: string[] = Array.isArray(employee?.permissions) ? employee.permissions : [];

  return <SidebarBase collapsed={collapsed} onToggle={onToggle} groups={groups} permissions={permissions} />;
}
