import type { ReactNode } from 'react';

type HeaderProps = {
  title: string;
  subtitle?: ReactNode;
  actions?: ReactNode;
};

const Header = ({ title, subtitle, actions }: HeaderProps) => (
  <header className="border-b bg-card">
    <div className="container mx-auto px-4 py-4 flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
      <div>
        <h1 className="text-2xl font-bold text-foreground">{title}</h1>
        {subtitle && (
          <p className="text-sm text-muted-foreground">
            {subtitle}
          </p>
        )}
      </div>
      {actions && <div className="flex items-center gap-2">{actions}</div>}
    </div>
  </header>
);

export default Header;
