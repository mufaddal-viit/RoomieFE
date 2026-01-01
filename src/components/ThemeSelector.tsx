import { useEffect, useState } from 'react';
import { Palette } from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';

const THEME_STORAGE_KEY = 'roomie-theme';
const THEME_CLASSES = ['theme-ocean', 'theme-sand', 'dark'];
const THEME_OPTIONS = [
  { value: 'default', label: 'Default' },
  { value: 'dark', label: 'Dark' },
  { value: 'ocean', label: 'Ocean' },
  { value: 'sand', label: 'Sand' },
] as const;

const applyTheme = (theme: string) => {
  if (typeof document === 'undefined') return;
  const root = document.documentElement;
  root.classList.remove(...THEME_CLASSES);
  if (theme === 'dark') {
    root.classList.add('dark');
  } else if (theme !== 'default') {
    root.classList.add(`theme-${theme}`);
  }
};

const ThemeSelector = () => {
  const [theme, setTheme] = useState<string>('default');

  useEffect(() => {
    if (typeof window === 'undefined') return;
    const stored = window.localStorage.getItem(THEME_STORAGE_KEY);
    const isValid = THEME_OPTIONS.some(option => option.value === stored);
    const initialTheme = isValid && stored ? stored : 'default';
    setTheme(initialTheme);
    applyTheme(initialTheme);
  }, []);

  useEffect(() => {
    if (typeof window === 'undefined') return;
    applyTheme(theme);
    window.localStorage.setItem(THEME_STORAGE_KEY, theme);
  }, [theme]);

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button className="h-14 w-14 rounded-full" variant='ghost'>
          <Palette className="h-14 w-13" />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end">
        <DropdownMenuLabel>Theme</DropdownMenuLabel>
        <DropdownMenuSeparator />
        {THEME_OPTIONS.map(option => (
          <DropdownMenuItem key={option.value} onClick={() => setTheme(option.value)}>
            {option.label}
          </DropdownMenuItem>
        ))}
      </DropdownMenuContent>
    </DropdownMenu>
  );
};

export default ThemeSelector;
