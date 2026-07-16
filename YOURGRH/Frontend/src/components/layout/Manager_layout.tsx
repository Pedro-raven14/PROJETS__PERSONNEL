import { useState } from 'react';
import { Sidebar_manag } from './Sidebar_manag';
import { TopBar } from './TopBar';
import { useIsMobile } from '../../hooks/Use-mobile';

type Manager_layoutProps = {
  children: React.ReactNode;
  clearToken?: () => void;
};

const Manager_layout = ({ children, clearToken }: Manager_layoutProps) => {
  const isMobile = useIsMobile();
  const [collapsed, setCollapsed] = useState(() => window.innerWidth < 768);

  return (
    <div style={{ display: 'flex', height: '100vh', overflow: 'hidden', backgroundColor: 'var(--color-background)' }}>
      <Sidebar_manag collapsed={collapsed} onToggle={() => setCollapsed(c => !c)} />
      <div style={{ display: 'flex', flexDirection: 'column', flex: 1, minWidth: 0, overflow: 'hidden' }}>
        <TopBar onToggleSidebar={() => setCollapsed(c => !c)} clearToken={clearToken} />
        <main style={{ flex: 1, overflowY: 'auto', padding: isMobile ? '1rem' : '1.5rem' }}>
          {children}
        </main>
      </div>
    </div>
  );
};

export default Manager_layout;
