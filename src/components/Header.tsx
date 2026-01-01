import type { ReactNode } from 'react';
import ThemeSelector from '@/components/ThemeSelector';
import UserMenu from '@/components/UserMenu';

type HeaderProps = {
  title: string;
  subtitle?: ReactNode;
  actions?: ReactNode;
  userName?: string;
  isManager?: boolean;
};

const Header = ({ title, subtitle, actions, userName, isManager = false }: HeaderProps) => {
  return (
    <header className="border-b bg-card">
      <div className="container mx-auto px-4 py-4 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold text-foreground">{title}</h1>
          {subtitle && (
            <p className="text-sm text-muted-foreground">
              {subtitle}
            </p>
          )}
        </div>
        <div className="flex items-center gap-2">
          {actions}
          <ThemeSelector />
          <UserMenu userName={userName} isManager={isManager} />
        </div>
      </div>
    </header>
  );
};

export default Header;
