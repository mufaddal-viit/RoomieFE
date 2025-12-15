import { useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import type { ReactNode } from 'react';
import { Button } from './ui/button';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuLabel, DropdownMenuSeparator, DropdownMenuTrigger } from './ui/dropdown-menu';
import { Avatar, AvatarFallback, AvatarImage } from './ui/avatar';
import { LogOut } from 'lucide-react';
import { storage } from '@/lib/storage';

type HeaderProps = {
  title: string;
  subtitle?: ReactNode;
  actions?: ReactNode;
  userName?: string;
  isManager?: boolean;
};

const Header = ({ title, subtitle, actions, userName, isManager = false }: HeaderProps) => {
  const navigate = useNavigate();
  const initial = useMemo(() => (userName?.[0]?.toUpperCase() ?? '?'), [userName]);

  const handleLogout = () => {
    storage.clearCurrentUser();
    storage.clearCurrentRoom();
    navigate('/');
  };
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
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" className="h-10 w-10 rounded-full p-0">
                <Avatar className="h-10 w-10">
                  <AvatarImage alt={userName || 'User'} />
                  <AvatarFallback>{initial}</AvatarFallback>
                </Avatar>
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuLabel>{userName || 'Current user'}</DropdownMenuLabel>
              <DropdownMenuSeparator />
              {isManager && (
                <DropdownMenuItem onClick={() => navigate('/add-member')}>
                  Add Member
                </DropdownMenuItem>
              )}
              <DropdownMenuItem onClick={handleLogout}>
                <LogOut className="mr-2 h-4 w-4" />
                Logout
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>
    </header>
  );
};

export default Header;
