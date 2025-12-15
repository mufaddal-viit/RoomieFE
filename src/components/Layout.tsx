import type { ReactNode } from 'react';
import Header from '@/components/Header';

type LayoutProps = {
  title: string;
  subtitle?: ReactNode;
  actions?: ReactNode;
  children: ReactNode;
  contentClassName?: string;
  userName?: string;
  isManager?: boolean;
};

const Layout = ({
  title,
  subtitle,
  actions,
  children,
  contentClassName,
  userName,
  isManager = false,
}: LayoutProps) => {
  return (
    <div className="min-h-screen bg-background">
      <Header
        title={title}
        subtitle={subtitle}
        actions={actions}
        userName={userName}
        isManager={isManager}
      />
      <main className={`container mx-auto px-4 py-6 ${contentClassName ?? ''}`}>
        {children}
      </main>
    </div>
  );
};

export default Layout;
