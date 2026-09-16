/*
  Composant Avatar — initiale colorée + badge de statut optionnel.
  Utilisé dans : Sidebar, MessageBubble, RightPanel, profil bas de sidebar.

  On utilise des styles inline directs ici (pas de var()) parce que
  backgroundColor est dynamique (passé en prop), donc on ne peut pas
  utiliser une classe Tailwind statique.
*/
const STATUS_COLORS = {
  online:  '#00b894',
  away:    '#fdcb6e',
  offline: '#636e72',
};

const Avatar = ({
  username   = '?',
  color      = '#6c5ce7',
  size       = 32,
  showStatus = false,
  status     = 'offline',
}) => {
  const initial    = username.charAt(0).toUpperCase();
  const badgeSize  = Math.round(size * 0.3);
  const badgeBorder = Math.max(1, Math.round(size * 0.06));

  return (
    <div
      style={{
        position: 'relative',
        display: 'inline-flex',
        flexShrink: 0,
        width: size,
        height: size,
      }}
    >
      {/* Cercle principal avec initiale */}
      <div
        style={{
          width: '100%',
          height: '100%',
          borderRadius: '50%',
          backgroundColor: color,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          fontSize: size * 0.38,
          fontWeight: 600,
          color: '#ffffff',
          userSelect: 'none',
          flexShrink: 0,
        }}
      >
        {initial}
      </div>

      {/* Badge de statut */}
      {showStatus && (
        <span
          style={{
            position: 'absolute',
            bottom: 0,
            right: 0,
            width: badgeSize,
            height: badgeSize,
            borderRadius: '50%',
            backgroundColor: STATUS_COLORS[status] ?? STATUS_COLORS.offline,
            /*
              La bordure reprend la couleur du fond parent pour créer
              un effet de séparation visuelle propre.
              On utilise var() ici car c'est une couleur de fond fixe
              (pas dynamique) et ça permet de s'adapter si le contexte change.
            */
            border: `${badgeBorder}px solid var(--color-bg-secondary)`,
          }}
        />
      )}
    </div>
  );
};

export default Avatar;
