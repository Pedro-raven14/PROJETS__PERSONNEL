import {
  LayoutDashboard, Users, Building2, FileText, CalendarDays,
  Award, GraduationCap, Wallet, BarChart3, Brain,
  Bell, Settings, ShieldCheck, UserCircle,
} from "lucide-react";
import { SidebarBase, type NavGroup } from "./SidebarBase";

// L'Admin voit tout — toutes les sections, tous les items
const groups: NavGroup[] = [
  {
    label: "Principal",
    items: [
      { title: "Tableau de bord", url: "/admin",             icon: LayoutDashboard, permission: null },
      { title: "Employés",        url: "/admin/employees",   icon: Users,           permission: null },
      { title: "Départements",    url: "/admin/departments", icon: Building2,       permission: null },
      { title: "Contrats",        url: "/admin/contracts",   icon: FileText,        permission: null },
      { title: "Congés",          url: "/admin/leaves",      icon: CalendarDays,    permission: null },
    ],
  },
  {
    label: "Gestion",
    items: [
      { title: "Évaluations", url: "/admin/evaluations", icon: Award,         permission: null },
      { title: "Formations",  url: "/admin/trainings",   icon: GraduationCap, permission: null },
      { title: "Paie",        url: "/admin/payroll",     icon: Wallet,        permission: null },
    ],
  },
  {
    label: "Analytique",
    items: [
      { title: "Rapports RH", url: "/admin/reports", icon: BarChart3, permission: null },
      { title: "Analyses IA", url: "/admin/ai",      icon: Brain,     permission: null },
    ],
  },
  {
    label: "Administration",
    items: [
      { title: "Rôles & Permissions", url: "/admin/roles",         icon: ShieldCheck, permission: null },
      { title: "Notifications",       url: "/admin/notifications", icon: Bell,        permission: null },
      { title: "Paramètres",          url: "/admin/settings",      icon: Settings,    permission: null },
      { title: "Mon profil",          url: "/admin/profile",       icon: UserCircle,  permission: null },
    ],
  },
];

type Props = { collapsed: boolean; onToggle: () => void };

export function Sidebar_admin({ collapsed, onToggle }: Props) {
  // L'admin a toutes les permissions — pas besoin de filtrer
  return <SidebarBase collapsed={collapsed} onToggle={onToggle} groups={groups} permissions={[]} />;
}
