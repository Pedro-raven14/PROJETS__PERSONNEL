import { useState } from 'react';
import { Sidebar_emp } from './Sidebar_emp';
import { TopBar } from './TopBar';
import { useIsMobile } from '../../hooks/Use-mobile';

type Emp_layoutProps = {
  children: React.ReactNode;
  clearToken?: () => void;
};

const Emp_layout = ({ children, clearToken }: Emp_layoutProps) => {
  const isMobile = useIsMobile();
  const [collapsed, setCollapsed] = useState(() => window.innerWidth < 768);

  return (
    <div style={{ display: 'flex', height: '100vh', overflow: 'hidden', backgroundColor: 'var(--color-background)' }}>
      <Sidebar_emp collapsed={collapsed} onToggle={() => setCollapsed(c => !c)} />
      <div style={{ display: 'flex', flexDirection: 'column', flex: 1, minWidth: 0, overflow: 'hidden' }}>
        <TopBar onToggleSidebar={() => setCollapsed(c => !c)} clearToken={clearToken} />
        <main style={{ flex: 1, overflowY: 'auto', padding: isMobile ? '1rem' : '1.5rem' }}>
          {children}
        </main>
      </div>
    </div>
  );
};

export default Emp_layout;
