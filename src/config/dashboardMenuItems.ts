import type { ComponentType } from 'react';
import type { ButtonProps } from '@/components/ui/button';
import { Clock, ListTodo, Plus, HeartPulse, User, Users, Wallet } from 'lucide-react';

export type DashboardMenuInput = {
  pendingCount: number;
  isManager: boolean;
};

export type DashboardMenuItem = {
  label: string | ((input: DashboardMenuInput) => string);
  path: string;
  icon?: ComponentType<{ className?: string }>;
  variant?: ButtonProps['variant'];
  requiresManager?: boolean;
};

export const dashboardMenuItems: DashboardMenuItem[] = [
  {
    label: 'Add Expense',
    path: '/add-expense',
    icon: Plus,
    variant: 'default',
  },
  {
    label: ({ pendingCount }) => `Manage Approvals (${pendingCount})`,
    path: '/approvals',
    icon: Clock,
    variant: 'secondary',
    requiresManager: true,
  },
  {
    label: 'One to One Expense',
    path: '/one-to-one',
    icon: Users,
    variant: 'outline',
  },
  {
    label: 'Personal Expense',
    path: '/personal',
    icon: User,
    variant: 'outline',
  },
  {
    label: 'Update Namaz',
    path: '/namaz',
    icon: HeartPulse,
    variant: 'outline',
  },
  {
    label: 'Personal Todos',
    path: '/todos',
    icon: ListTodo,
    variant: 'outline',
  },
  {
    label: 'Savings',
    path: '/savings',
    icon: Wallet,
    variant: 'outline',
  },
  {
    label: 'Accounts',
    path: '/accounts',
    icon: User,
    variant: 'outline',
  },
];
