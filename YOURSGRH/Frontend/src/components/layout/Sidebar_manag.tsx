import {
  LayoutDashboard, Users, CalendarDays,
  Award, GraduationCap, Bell, UserCircle, FileText, Timer, Wallet,
} from "lucide-react";
import { SidebarBase, type NavGroup } from "./SidebarBase";
import { useCongesPending } from "../../hooks/Use-conges-attente";

type Props = { collapsed: boolean; onToggle: () => void };

export function Sidebar_manag({ collapsed, onToggle }: Props) {
  const employee = (() => {
    try { return JSON.parse(localStorage.getItem('employee') || 'null'); } catch { return null; }
  })();
  const permissions: string[] = Array.isArray(employee?.permissions) ? employee.permissions : [];
  const { pendingCount } = useCongesPending();

  const groups: NavGroup[] = [
    {
      label: "Principal",
      items: [
        { title: "Tableau de bord", url: "/manager",        icon: LayoutDashboard, permission: null },
        { title: "Mon équipe",      url: "/manager/team",    icon: Users,           permission: "VIEW_TEAM" },
        { title: "Congés",          url: "/manager/leaves",  icon: CalendarDays,    permission: "VIEW_LEAVES", badge: pendingCount },
        { title: "Heures sup.",     url: "/manager/overtime", icon: Timer,           permission: null },
      ],
    },
    {
      label: "Gestion",
      items: [
        { title: "Évaluations", url: "/manager/evaluations", icon: Award,         permission: "VIEW_EVALUATIONS" },
        { title: "Formations",  url: "/manager/trainings",   icon: GraduationCap, permission: "VIEW_TRAININGS" },
      ],
    },
    {
      label: "Personnel",
      items: [
        { title: "Mes contrats",    url: "/manager/contracts",     icon: FileText,   permission: null },
        { title: "Salaire & Paie",  url: "/manager/payroll",       icon: Wallet,     permission: null },
        { title: "Mon profil",      url: "/manager/profile",       icon: UserCircle, permission: null },
        { title: "Notifications",   url: "/manager/notifications", icon: Bell,       permission: null },
      ],
    },
  ];

  return <SidebarBase collapsed={collapsed} onToggle={onToggle} groups={groups} permissions={permissions} />;
}
