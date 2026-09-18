import { useState } from 'react';
import { Sidebar_admin } from './Sidebar_admin';
import { TopBar } from './TopBar';
import { useIsMobile } from '../../hooks/Use-mobile';

type Props = {
  children: React.ReactNode;
  clearToken: () => void;
};

const Admin_layout = ({ children, clearToken }: Props) => {
  const isMobile = useIsMobile();
  // Initialisation directe via window pour avoir la vraie valeur dès le 1er render
  const [collapsed, setCollapsed] = useState(() => window.innerWidth < 768);

  return (
    <div style={{ display: 'flex', height: '100vh', overflow: 'hidden', backgroundColor: 'var(--color-background)' }}>
      <Sidebar_admin collapsed={collapsed} onToggle={() => setCollapsed(c => !c)} />
      <div style={{ display: 'flex', flexDirection: 'column', flex: 1, minWidth: 0, overflow: 'hidden' }}>
        <TopBar onToggleSidebar={() => setCollapsed(c => !c)} clearToken={clearToken} />
        <main style={{ flex: 1, overflowY: 'auto', padding: isMobile ? '1rem' : '1.5rem' }}>
          {children}
        </main>
      </div>
    </div>
  );
};

export default Admin_layout;
