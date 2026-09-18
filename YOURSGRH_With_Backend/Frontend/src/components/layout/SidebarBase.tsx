import { type LucideIcon } from "lucide-react";
import { NavLink } from "../NavLink";
import { useLocation } from "react-router-dom";
import { AvatarInitials } from "../element/AvatarInitials";
import { useUnreadCount } from "../../hooks/Use-notifications";
import { useIsMobile } from "../../hooks/Use-mobile";

export type NavItem = {
  title: string;
  url: string;
  icon: LucideIcon;
  permission: string | null;
  badge?: number;
};

export type NavGroup = {
  label: string;
  items: NavItem[];
};

type Props = {
  collapsed: boolean;
  onToggle?: () => void;   // utilisé sur mobile pour fermer le drawer
  groups: NavGroup[];
  permissions: string[];
  appName?: string;
  appLetter?: string;
};

function NavSection({
  label, items, collapsed, permissions, unreadCount, onClose,
}: {
  label: string;
  items: NavItem[];
  collapsed: boolean;
  permissions: string[];
  unreadCount: number;
  onClose?: () => void;
}) {
  const location = useLocation();

  const visible = items.filter(
    (item) => item.permission === null || permissions.includes(item.permission),
  );

  if (visible.length === 0) return null;

  return (
    <div style={{ marginBottom: '0.25rem' }}>
      {!collapsed && (
        <p style={{
          margin: '0.75rem 0.75rem 0.25rem',
          fontSize: '11px',
          fontWeight: 600,
          textTransform: 'uppercase',
          letterSpacing: '0.08em',
          color: 'var(--color-sidebar-muted)',
          fontFamily: 'var(--font-display)',
        }}>
          {label}
        </p>
      )}
      {visible.map((item) => {
        const isActive    = location.pathname === item.url;
        const isNotifItem = item.url.endsWith('/notifications');
        const itemBadge   = item.badge ?? 0;
        const badgeCount  = isNotifItem ? unreadCount : itemBadge;
        const hasBadge    = badgeCount > 0;

        return (
          <NavLink
            key={item.title}
            to={item.url}
            end
            className="sidebar-nav-item"
            onClick={onClose}
            style={{
              gap: '0.625rem',
              margin: '0.125rem 0.5rem',
              padding: collapsed ? '0.5rem' : '0.5rem 0.75rem',
              fontWeight: isActive ? 600 : 400,
              color: isActive ? 'var(--color-sidebar-accent-foreground)' : 'var(--color-sidebar-muted)',
              backgroundColor: isActive ? 'var(--color-sidebar-accent)' : 'transparent',
              justifyContent: collapsed ? 'center' : 'flex-start',
              position: 'relative',
            }}
          >
            <div style={{ position: 'relative', flexShrink: 0 }}>
              <item.icon style={{ width: '18px', height: '18px' }} />
              {hasBadge && collapsed && (
                <span style={{
                  position: 'absolute', top: '-4px', right: '-4px',
                  minWidth: '14px', height: '14px', borderRadius: '9999px',
                  backgroundColor: 'var(--color-destructive)', color: 'white',
                  fontSize: '0.55rem', fontWeight: 700,
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  padding: '0 2px', lineHeight: 1,
                }}>
                  {badgeCount > 99 ? '99+' : badgeCount}
                </span>
              )}
            </div>
            {!collapsed && <span style={{ flex: 1 }}>{item.title}</span>}
            {!collapsed && hasBadge && (
              <span style={{
                minWidth: '18px', height: '18px', borderRadius: '9999px',
                backgroundColor: 'var(--color-destructive)', color: 'white',
                fontSize: '0.625rem', fontWeight: 700,
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                padding: '0 4px', lineHeight: 1, flexShrink: 0,
              }}>
                {badgeCount > 99 ? '99+' : badgeCount}
              </span>
            )}
          </NavLink>
        );
      })}
    </div>
  );
}

export function SidebarBase({ collapsed, onToggle, groups, permissions, appName = 'YOURSG', appLetter = 'YS' }: Props) {
  const { unreadCount } = useUnreadCount();
  const isMobile = useIsMobile();

  const employee = (() => {
    try { return JSON.parse(localStorage.getItem('employee') || 'null'); } catch { return null; }
  })();
  const prenom     = employee?.prenom || '';
  const nom        = employee?.nom    || '';
  const posteLabel = employee?.poste  || employee?.role || '';

  // Sur mobile : drawer overlay. Sur desktop : sidebar classique collapsible.
  const isOpen = isMobile ? !collapsed : true;

  const sidebarContent = (
    <aside style={{
      width: isMobile ? '16rem' : (collapsed ? '3.5rem' : '16rem'),
      minWidth: isMobile ? '16rem' : (collapsed ? '3.5rem' : '16rem'),
      height: '100vh',
      display: 'flex',
      flexDirection: 'column',
      backgroundColor: 'var(--color-sidebar)',
      borderRight: '1px solid var(--color-sidebar-border)',
      transition: 'width 0.2s ease, min-width 0.2s ease',
      overflow: 'hidden',
      paddingTop: '0.25rem',
      // Sur mobile : position fixe pour le drawer
      ...(isMobile ? {
        position: 'fixed',
        top: 0,
        left: 0,
        zIndex: 200,
        boxShadow: '4px 0 24px rgba(0,0,0,0.15)',
        transform: isOpen ? 'translateX(0)' : 'translateX(-100%)',
        transition: 'transform 0.25s ease',
      } : {}),
    }}>

      {/* Logo */}
      <div style={{
        display: 'flex',
        alignItems: 'center',
        gap: '0.625rem',
        padding: '1.25rem 1rem',
        height: '4rem',
        flexShrink: 0,
      }}>
        <div style={{
          display: 'flex',
          height: '2rem',
          width: '2rem',
          flexShrink: 0,
          alignItems: 'center',
          justifyContent: 'center',
          borderRadius: '0.5rem',
          backgroundColor: 'var(--color-primary)',
          color: 'var(--color-primary-foreground)',
          fontFamily: 'var(--font-display)',
          fontSize: '0.875rem',
          fontWeight: 700,
        }}>
          {appLetter}
        </div>
        {(!collapsed || isMobile) && (
          <span style={{
            fontFamily: 'var(--font-display)',
            fontSize: '1.125rem',
            fontWeight: 700,
            letterSpacing: '-0.025em',
            color: 'var(--color-sidebar-foreground)',
            whiteSpace: 'nowrap',
          }}>
            {appName.replace('RH', '')}<span style={{ color: 'var(--color-primary)' }}>RH</span>
          </span>
        )}
      </div>

      {/* Nav scrollable */}
      <div style={{ flex: 1, overflowY: 'auto', padding: '0.5rem 0.5rem' }}>
        {groups.map((group) => (
          <NavSection
            key={group.label}
            label={group.label}
            items={group.items}
            collapsed={!isMobile && collapsed}
            permissions={permissions}
            unreadCount={unreadCount}
            onClose={isMobile ? onToggle : undefined}
          />
        ))}
      </div>

      {/* Footer user */}
      <div style={{
        padding: '0.75rem 1rem',
        borderTop: '1px solid var(--color-sidebar-border)',
        flexShrink: 0,
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
          <AvatarInitials firstName={prenom} lastName={nom} size="sm" />
          {(!collapsed || isMobile) && (
            <div style={{ minWidth: 0 }}>
              <p style={{
                margin: 0,
                fontFamily: 'var(--font-display)',
                fontSize: '0.875rem',
                fontWeight: 600,
                color: 'var(--color-sidebar-foreground)',
                whiteSpace: 'nowrap',
                overflow: 'hidden',
                textOverflow: 'ellipsis',
              }}>
                {prenom} {nom}
              </p>
              <p style={{
                margin: 0,
                fontSize: '0.75rem',
                color: 'var(--color-sidebar-muted)',
                whiteSpace: 'nowrap',
                overflow: 'hidden',
                textOverflow: 'ellipsis',
              }}>
                {posteLabel}
              </p>
            </div>
          )}
        </div>
      </div>
    </aside>
  );

  if (isMobile) {
    return (
      <>
        {/* Backdrop — ferme le drawer au tap */}
        {isOpen && (
          <div
            onClick={onToggle}
            style={{
              position: 'fixed',
              inset: 0,
              zIndex: 199,
              backgroundColor: 'rgba(0,0,0,0.45)',
            }}
          />
        )}
        {sidebarContent}
      </>
    );
  }

  return sidebarContent;
}
