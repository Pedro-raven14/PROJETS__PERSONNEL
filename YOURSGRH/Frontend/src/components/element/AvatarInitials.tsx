// Palette de couleurs de fond pour l'avatar — choisie selon les initiales
const colors: { bg: string; color: string }[] = [
  { bg: 'var(--color-primary)',     color: 'var(--color-primary-foreground)' },
  { bg: 'var(--color-accent)',      color: 'var(--color-accent-foreground)' },
  { bg: 'var(--color-ai)',          color: 'var(--color-ai-foreground)' },
  { bg: 'var(--color-warning)',     color: 'var(--color-warning-foreground)' },
  { bg: 'var(--color-success)',     color: 'var(--color-success-foreground)' },
];

const sizes = {
  sm: { width: '2rem',   height: '2rem',   fontSize: '0.75rem' },
  md: { width: '2.5rem', height: '2.5rem', fontSize: '0.875rem' },
  lg: { width: '4rem',   height: '4rem',   fontSize: '1.25rem' },
};

type Props = {
  firstName: string;
  lastName: string;
  size?: 'sm' | 'md' | 'lg';
};

export function AvatarInitials({ firstName, lastName, size = 'md' }: Props) {
  // Choisit une couleur déterministe selon les initiales
  const code = (firstName.charCodeAt(0) || 0) + (lastName.charCodeAt(0) || 0);
  const { bg, color } = colors[code % colors.length];
  const { width, height, fontSize } = sizes[size];

  const initial1 = firstName[0]?.toUpperCase() ?? '';
  const initial2 = lastName[0]?.toUpperCase() ?? '';

  return (
    <div
      style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        borderRadius: '9999px',
        flexShrink: 0,
        width,
        height,
        fontSize,
        fontWeight: 700,
        fontFamily: 'var(--font-display)',
        backgroundColor: bg,
        color,
      }}
    >
      {initial1}{initial2}
    </div>
  );
}
