import type { ComponentType } from 'react';
import { Clock, DollarSign, TrendingUp } from 'lucide-react';

export type DashboardStatsInput = {
  totalExpense: number;
  perPersonShare: number;
  pendingCount: number;
  roommatesCount: number;
};

export type DashboardStatConfig = {
  title: string;
  value: (input: DashboardStatsInput) => string;
  description: (input: DashboardStatsInput) => string;
  icon: ComponentType<{ className?: string }>;
};

export const dashboardStats: DashboardStatConfig[] = [
  {
    title: 'Total Room Expense',
    value: ({ totalExpense }) => `$${totalExpense.toFixed(2)}`,
    description: () => "This month's approved expenses",
    icon: DollarSign,
  },
  {
    title: 'Your Share',
    value: ({ perPersonShare }) => `$${perPersonShare.toFixed(2)}`,
    description: ({ roommatesCount }) => `Split equally among ${roommatesCount} people`,
    icon: TrendingUp,
  },
  {
    title: 'Pending Approvals',
    value: ({ pendingCount }) => pendingCount.toString(),
    description: () => 'Waiting for manager approval',
    icon: Clock,
  },
];
