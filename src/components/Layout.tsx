import { useEffect, useRef, useState, type ReactNode } from 'react';
import Header from '@/components/Header';
import { Button } from './ui/button';
import { ArrowLeft, House } from 'lucide-react';
import { useNavigate, useLocation } from 'react-router-dom';
import { Skeleton } from '@/components/ui/skeleton';

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
    <Button
      variant="ghost"
      onClick={() => navigate('/dashboard')}
      className="h-10 w-10 p-0 [&_svg]:size-5"
    >
      {/* <ArrowLeft className="h-4 w-4 mr-2" /> */}
      <House />
    </Button>
  );
};

const LayoutSkeleton = () => (
  <div className="space-y-6">
    <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
      <Skeleton className="h-24" />
      <Skeleton className="h-24" />
      <Skeleton className="h-24" />
    </div>
    <Skeleton className="h-10 w-1/2" />
    <div className="space-y-3">
      <Skeleton className="h-12" />
      <Skeleton className="h-12" />
      <Skeleton className="h-12" />
    </div>
    <Skeleton className="h-48" />
  </div>
);

const Layout = ({
  title,
  subtitle,
  actions = <BackToDashboard />,
  children,
  contentClassName,
  userName,
  isManager = false,
}: LayoutProps) => {
  const location = useLocation();
  const hasMounted = useRef(false);
  const [showSkeleton, setShowSkeleton] = useState(false);

  useEffect(() => {
    if (!hasMounted.current) {
      hasMounted.current = true;
      return;
    }
    setShowSkeleton(true);
    const rafId = window.requestAnimationFrame(() => setShowSkeleton(false));
    return () => window.cancelAnimationFrame(rafId);
  }, [location.pathname]);

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
        {showSkeleton ? <LayoutSkeleton /> : children}
      </main>
    </div>
  );
};

export default Layout;
