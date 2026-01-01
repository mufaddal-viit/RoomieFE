import { useEffect, useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { LogOut, Upload, User } from 'lucide-react';
import { Avatar, AvatarFallback, AvatarImage } from './ui/avatar';
import { Button } from './ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from './ui/dropdown-menu';
import { useSession } from '@/contexts/SessionContext';
import { userMenuConfig, type UserMenuItem } from '@/config/userMenuConfig';
import UploadPhotoDialog from '@/components/UploadPhotoDialog';

type UserMenuProps = {
  userName?: string;
  isManager?: boolean;
};

const AVATAR_STORAGE_KEY = 'roomie-avatar';

const UserMenu = ({ userName, isManager = false }: UserMenuProps) => {
  const navigate = useNavigate();
  const { clearSession } = useSession();
  const initial = useMemo(() => (userName?.[0]?.toUpperCase() ?? '?'), [userName]);
  const [avatarUrl, setAvatarUrl] = useState<string | null>(null);
  const [uploadOpen, setUploadOpen] = useState(false);
  const roleLabel = isManager ? 'Manager' : 'Roommate';
  const menuItems = userMenuConfig.filter(item => !item.requiresManager || isManager);
  const primaryItems = menuItems.filter(item => item.action !== 'logout');
  const logoutItem = menuItems.find(item => item.action === 'logout');

  useEffect(() => {
    if (typeof window === 'undefined') return;
    const stored = window.localStorage.getItem(AVATAR_STORAGE_KEY);
    if (stored) {
      setAvatarUrl(stored);
    }
  }, []);

  const handleLogout = () => {
    clearSession();
    navigate('/');
  };

  const handleSavePhoto = (dataUrl: string) => {
    setAvatarUrl(dataUrl);
    if (typeof window !== 'undefined') {
      window.localStorage.setItem(AVATAR_STORAGE_KEY, dataUrl);
    }
    setUploadOpen(false);
  };

  const handleItemClick = (item: UserMenuItem) => {
    if (item.action === 'logout') {
      handleLogout();
      return;
    }
    if (item.action === 'upload-photo') {
      setUploadOpen(true);
      return;
    }
    if (item.path) {
      navigate(item.path);
    }
  };

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button
          variant="ghost"
          className="relative h-10 w-10 rounded-full p-0 ring-1 ring-border/40 transition hover:ring-border"
        >
          <Avatar className="h-10 w-10">
            <AvatarImage alt={userName || 'User'} src={avatarUrl || undefined} />
            <AvatarFallback>{initial}</AvatarFallback>
          </Avatar>
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-64 p-0">
        <DropdownMenuLabel className="px-3 py-3">
          <div className="flex items-center gap-3">
            <Avatar className="h-11 w-11">
              <AvatarImage alt={userName || 'User'} src={avatarUrl || undefined} />
              <AvatarFallback>{initial}</AvatarFallback>
            </Avatar>
            <div className="space-y-0.5">
              <p className="text-sm font-medium">{userName || 'Current user'}</p>
              <p className="text-xs text-muted-foreground">{roleLabel}</p>
            </div>
          </div>
        </DropdownMenuLabel>
        <DropdownMenuSeparator />
        {primaryItems.map((item) => (
          <DropdownMenuItem
            key={item.label}
            className="cursor-pointer gap-2"
            onClick={() => handleItemClick(item)}
          >
            {item.icon === 'upload' && <Upload className="h-4 w-4" />}
            {item.icon === 'addmember' && <User className="h-4 w-4" />}
            {item.label}
          </DropdownMenuItem>
        ))}
        {logoutItem && (
          <>
            <DropdownMenuSeparator />
            <DropdownMenuItem
              className="cursor-pointer gap-2 text-destructive focus:text-destructive font-bold"
              onClick={() => handleItemClick(logoutItem)}
            >
              <LogOut className="h-4 w-4" />
              {logoutItem.label}
            </DropdownMenuItem>
          </>
        )}
      </DropdownMenuContent>

      <UploadPhotoDialog
        open={uploadOpen}
        onOpenChange={setUploadOpen}
        initial={userName}
        onSave={handleSavePhoto}
      />
    </DropdownMenu>
  );
};

export default UserMenu;
