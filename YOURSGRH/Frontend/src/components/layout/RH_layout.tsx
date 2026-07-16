import { useState } from 'react';
import { Sidebar_rh } from './Sidebar_rh';
import { TopBar } from './TopBar';
import { useIsMobile } from '../../hooks/Use-mobile';

type RH_layoutProps = {
  children: React.ReactNode;
  clearToken?: () => void;
};

const RH_layout = ({ children, clearToken }: RH_layoutProps) => {
  const isMobile = useIsMobile();
  const [collapsed, setCollapsed] = useState(() => window.innerWidth < 768);

  return (
    <div style={{ display: 'flex', height: '100vh', overflow: 'hidden', backgroundColor: 'var(--color-background)' }}>
      <Sidebar_rh collapsed={collapsed} onToggle={() => setCollapsed(c => !c)} />
      <div style={{ display: 'flex', flexDirection: 'column', flex: 1, minWidth: 0, overflow: 'hidden' }}>
        <TopBar onToggleSidebar={() => setCollapsed(c => !c)} clearToken={clearToken} />
        <main style={{ flex: 1, overflowY: 'auto', padding: isMobile ? '1rem' : '1.5rem' }}>
          {children}
        </main>
      </div>
    </div>
  );
};

export default RH_layout;
