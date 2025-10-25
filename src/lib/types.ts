export interface Roommate {
  id: string;
  name: string;
  isManager: boolean;
}

export interface Expense {
  id: string;
  description: string;
  amount: number;
  category: string;
  addedBy: string;
  addedByName: string;
  date: string;
  status: 'pending' | 'approved' | 'rejected';
  approvedBy?: string;
  approvedByName?: string;
  approvedAt?: string;
}

export const EXPENSE_CATEGORIES = [
  'Food',
  'Utilities',
  'Cleaning Supplies',
  'Internet',
  'Electricity',
  'Water',
  'Gas',
  'Maintenance',
  'Other',
] as const;

export type ExpenseCategory = typeof EXPENSE_CATEGORIES[number];
