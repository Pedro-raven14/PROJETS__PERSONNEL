import { Search, Bell, PanelLeft } from "lucide-react";
import { useNavigate } from "react-router-dom";
import Userbox from "./Userbox";
import { useUnreadCount } from "../../hooks/Use-notifications";
import { useIsMobile } from "../../hooks/Use-mobile";

type Props = { onToggleSidebar: () => void; clearToken?: () => void; };

export function TopBar({ onToggleSidebar, clearToken }: Props) {
  const navigate   = useNavigate();
  const isMobile   = useIsMobile();
  const { unreadCount } = useUnreadCount();

  const getNotifPath = () => {
    try {
      const emp  = JSON.parse(localStorage.getItem('employee') || 'null');
      const role = emp?.role?.toLowerCase() || 'employee';
      return `/${role}/notifications`;
    } catch {
      return '/notifications';
    }
  };

  return (
    <header style={{
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'space-between',
      gap: '0.75rem',
      height: '4rem',
      flexShrink: 0,
      padding: isMobile ? '0 1rem' : '0 2rem',
      backgroundColor: 'var(--color-card)',
      borderBottom: '1px solid var(--color-border)',
    }}>

      {/* Toggle sidebar / hamburger */}
      <button
        onClick={onToggleSidebar}
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          width: '2rem',
          height: '2rem',
          borderRadius: '0.375rem',
          border: 'none',
          background: 'transparent',
          cursor: 'pointer',
          color: 'var(--color-muted-foreground)',
          flexShrink: 0,
        }}
      >
        <PanelLeft style={{ width: '18px', height: '18px' }} />
      </button>

      {/* Search — masquée sur mobile */}
      {!isMobile && (
        <div style={{ position: 'relative', flex: 1, maxWidth: '28rem' }}>
          
          
        </div>
      )}

      {/* Spacer sur mobile pour pousser les icônes à droite */}
      {isMobile && <div style={{ flex: 1 }} />}

      {/* Bell avec badge */}
      <button
        onClick={() => navigate(getNotifPath())}
        style={{
          position: 'relative',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          width: '2.25rem', height: '2.25rem', borderRadius: '0.5rem',
          border: 'none', background: 'transparent', cursor: 'pointer',
          color: 'var(--color-muted-foreground)', flexShrink: 0,
        }}
      >
        <Bell style={{ width: '18px', height: '18px' }} />
        {unreadCount > 0 && (
          <span style={{
            position: 'absolute', top: '2px', right: '2px',
            minWidth: '16px', height: '16px', borderRadius: '9999px',
            backgroundColor: 'var(--color-destructive)', color: 'white',
            fontSize: '0.625rem', fontWeight: 700, display: 'flex',
            alignItems: 'center', justifyContent: 'center', padding: '0 3px',
            lineHeight: 1,
          }}>
            {unreadCount > 99 ? '99+' : unreadCount}
          </span>
        )}
      </button>

      <Userbox clearToken={clearToken} />
    </header>
  );
}
