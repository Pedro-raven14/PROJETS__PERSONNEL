import { useEffect, useState } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import {
  Bell, FileText, CalendarDays, Award,
  GraduationCap, Brain, CheckCheck, Loader2, PenLine, Wallet,
} from "lucide-react";
import { PageHeader } from "../element/PageHeader";
import { API_URL } from "../../config/api";
import { useUnreadCount } from "../../hooks/Use-notifications";

type Notification = {
  notifId: number;
  message: string;
  type: string;
  date: string;
  lu: boolean;
};

// Icône et couleur selon le type de notification
const getTypeStyle = (type: string): { icon: React.ElementType; bg: string; color: string } => {
  switch (type) {
    case 'CONTRAT':
      return { icon: FileText,      bg: 'color-mix(in srgb, var(--color-primary) 12%, transparent)',     color: 'var(--color-primary)' };
    case 'CONGE':
      return { icon: CalendarDays,  bg: 'color-mix(in srgb, var(--color-warning) 12%, transparent)',     color: 'var(--color-warning)' };
    case 'EVALUATION':
      return { icon: Award,         bg: 'color-mix(in srgb, var(--color-accent) 12%, transparent)',      color: 'var(--color-accent)' };
    case 'FORMATION':
      return { icon: GraduationCap, bg: 'color-mix(in srgb, var(--color-success) 12%, transparent)',     color: 'var(--color-success)' };
    case 'IA':
      return { icon: Brain,         bg: 'color-mix(in srgb, var(--color-ai) 12%, transparent)',          color: 'var(--color-ai)' };
    case 'PAIE':
      return { icon: Wallet,        bg: 'color-mix(in srgb, var(--color-success) 12%, transparent)',     color: 'var(--color-success)' };
    default:
      return { icon: Bell,          bg: 'color-mix(in srgb, var(--color-muted-foreground) 12%, transparent)', color: 'var(--color-muted-foreground)' };
  }
};

const formatDate = (dateStr: string) => {
  const date = new Date(dateStr);
  const now  = new Date();
  const diff = Math.floor((now.getTime() - date.getTime()) / 1000);

  if (diff < 60)   return "À l'instant";
  if (diff < 3600) return `Il y a ${Math.floor(diff / 60)} min`;
  if (diff < 86400) return `Il y a ${Math.floor(diff / 3600)} h`;
  return date.toLocaleDateString('fr-FR', { day: 'numeric', month: 'long', year: 'numeric' });
};

const NotificationsPage = () => {
  const token   = localStorage.getItem("token");
  const headers = { Authorization: `Bearer ${token}` };
  const navigate = useNavigate();
  const { decrement, reset } = useUnreadCount();

  const role = (() => {
    try { return JSON.parse(localStorage.getItem('employee') || 'null')?.role?.toLowerCase() || 'employee'; }
    catch { return 'employee'; }
  })();

  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [loading,       setLoading]       = useState(true);
  const [markingAll,    setMarkingAll]    = useState(false);

  const fetchNotifications = async () => {
    try {
      const res = await axios.get(`${API_URL}/notification/mes-notifications?limit=100`, { headers });
      setNotifications(res.data.data ?? res.data);
    } catch {
      // silencieux
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchNotifications(); }, []);

  const nbNonLues = notifications.filter((n) => !n.lu).length;

  const marquerLue = async (notifId: number) => {
    // Mise à jour optimiste — badge décrémenté immédiatement
    setNotifications((prev) =>
      prev.map((n) => n.notifId === notifId ? { ...n, lu: true } : n)
    );
    decrement(1);
    try {
      await axios.patch(`${API_URL}/notification/${notifId}/lire`, {}, { headers });
    } catch {
      fetchNotifications();
    }
  };

  const marquerToutesLues = async () => {
    setMarkingAll(true);
    setNotifications((prev) => prev.map((n) => ({ ...n, lu: true })));
    reset(); // badge à zéro immédiatement
    try {
      await axios.patch(`${API_URL}/notification/lire-tout`, {}, { headers });
    } catch {
      fetchNotifications();
    } finally {
      setMarkingAll(false);
    }
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
      <PageHeader
        title="Notifications"
        subtitle={nbNonLues > 0 ? `${nbNonLues} non lue(s)` : 'Tout est à jour'}
        actions={
          nbNonLues > 0 ? (
            <button
              onClick={marquerToutesLues}
              disabled={markingAll}
              style={{
                display: 'inline-flex', alignItems: 'center', gap: '0.375rem',
                fontSize: '0.875rem', color: 'var(--color-primary)',
                background: 'none', border: 'none', cursor: 'pointer',
                fontFamily: 'var(--font-display)', fontWeight: 500,
                opacity: markingAll ? 0.6 : 1,
              }}
            >
              <CheckCheck style={{ width: '15px', height: '15px' }} />
              Tout marquer comme lu
            </button>
          ) : undefined
        }
      />

      {loading ? (
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '3rem', gap: '0.75rem', color: 'var(--color-muted-foreground)' }}>
          <Loader2 style={{ width: '20px', height: '20px', animation: 'spin 1s linear infinite' }} />
          Chargement...
        </div>
      ) : notifications.length === 0 ? (
        <div className="stat-card" style={{ textAlign: 'center', padding: '3rem' }}>
          <Bell style={{ width: '2.5rem', height: '2.5rem', margin: '0 auto 0.75rem', color: 'var(--color-muted-foreground)' }} />
          <p style={{ margin: 0, color: 'var(--color-muted-foreground)', fontFamily: 'var(--font-display)', fontWeight: 500 }}>
            Aucune notification
          </p>
          <p style={{ margin: '0.375rem 0 0', fontSize: '0.875rem', color: 'var(--color-muted-foreground)' }}>
            Vous êtes à jour !
          </p>
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
          {notifications.map((notif) => {
            const { icon: Icon, bg, color } = getTypeStyle(notif.type);
            return (
              <div
                key={notif.notifId}
                onClick={() => !notif.lu && marquerLue(notif.notifId)}
                className="stat-card"
                style={{
                  display: 'flex', alignItems: 'flex-start', gap: '1rem',
                  cursor: notif.lu ? 'default' : 'pointer',
                  borderLeft: notif.lu ? '3px solid transparent' : '3px solid var(--color-primary)',
                  opacity: notif.lu ? 0.7 : 1,
                  transition: 'opacity 0.2s',
                  padding: '1rem 1.25rem',
                }}
                onMouseEnter={(e) => { if (!notif.lu) (e.currentTarget as HTMLDivElement).style.opacity = '0.85'; }}
                onMouseLeave={(e) => { if (!notif.lu) (e.currentTarget as HTMLDivElement).style.opacity = '1'; }}
              >
                {/* Icône */}
                <div style={{
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  width: '2.5rem', height: '2.5rem', borderRadius: '0.5rem',
                  backgroundColor: bg, flexShrink: 0,
                }}>
                  <Icon style={{ width: '18px', height: '18px', color }} />
                </div>

                {/* Contenu */}
                <div style={{ flex: 1, minWidth: 0 }}>
                  <p style={{
                    margin: 0, fontSize: '0.875rem',
                    fontFamily: 'var(--font-display)', fontWeight: notif.lu ? 400 : 600,
                    color: 'var(--color-foreground)',
                  }}>
                    {notif.message}
                  </p>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginTop: '0.375rem' }}>
                    <span style={{ fontSize: '0.75rem', color: 'var(--color-muted-foreground)' }}>
                      {formatDate(notif.date)}
                    </span>
                    <span style={{
                      fontSize: '0.65rem', fontWeight: 600, padding: '0.1rem 0.4rem',
                      borderRadius: '9999px', backgroundColor: bg, color,
                    }}>
                      {notif.type}
                    </span>
                  </div>
                </div>

                {/* Point non lu */}
                {!notif.lu && (
                  <div style={{
                    width: '8px', height: '8px', borderRadius: '9999px',
                    backgroundColor: 'var(--color-primary)', flexShrink: 0, marginTop: '0.375rem',
                  }} />
                )}

                {/* Bouton Signer — uniquement pour les employés/managers qui ont un contrat à signer */}
                {notif.type === 'CONTRAT' && !notif.lu && role !== 'admin' && (
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      marquerLue(notif.notifId);
                      navigate(`/${role}/contracts`);
                    }}
                    style={{
                      display: 'inline-flex', alignItems: 'center', gap: '0.25rem',
                      padding: '0.3rem 0.625rem', borderRadius: '0.375rem', border: 'none',
                      backgroundColor: 'var(--color-primary)', color: 'var(--color-primary-foreground)',
                      fontFamily: 'var(--font-display)', fontWeight: 500, fontSize: '0.75rem',
                      cursor: 'pointer', flexShrink: 0,
                    }}
                  >
                    <PenLine style={{ width: '12px', height: '12px' }} />
                    Voir
                  </button>
                )}

                {/* Bouton Voir ma fiche — notification de paie */}
                {notif.type === 'PAIE' && role !== 'admin' && (
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      if (!notif.lu) marquerLue(notif.notifId);
                      navigate(`/${role}/payroll`);
                    }}
                    style={{
                      display: 'inline-flex', alignItems: 'center', gap: '0.25rem',
                      padding: '0.3rem 0.625rem', borderRadius: '0.375rem', border: 'none',
                      backgroundColor: 'var(--color-success)', color: '#fff',
                      fontFamily: 'var(--font-display)', fontWeight: 500, fontSize: '0.75rem',
                      cursor: 'pointer', flexShrink: 0,
                    }}
                  >
                    <Wallet style={{ width: '12px', height: '12px' }} />
                    Voir ma fiche
                  </button>
                )}
              </div>
            );
          })}
        </div>
      )}

      <style>{`
        @keyframes spin { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }
      `}</style>
    </div>
  );
};

export default NotificationsPage;
