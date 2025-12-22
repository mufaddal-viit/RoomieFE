import type { ReactNode } from 'react';
import Header from '@/components/Header';
import { Button } from './ui/button';
import { ArrowLeft } from 'lucide-react';
import { useNavigate, useLocation } from 'react-router-dom';

type LayoutProps = {
  title: string;
  subtitle?: ReactNode;
  actions?: ReactNode;
  children: ReactNode;
  contentClassName?: string;
  userName?: string;
  isManager?: boolean;
};

const BackToDashboard = () => {
  const navigate = useNavigate();
  const location = useLocation();
  if (location.pathname === '/dashboard') return null;
  return (
    <Button variant="ghost" onClick={() => navigate('/dashboard')}>
      <ArrowLeft className="h-4 w-4 mr-2" />
      Back to Dashboard
    </Button>
  );
};

const Layout = ({
  title,
  subtitle,
  actions = <BackToDashboard />,
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
