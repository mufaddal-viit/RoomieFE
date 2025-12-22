export interface Roommate {
  id: string;
  name: string;
  email?: string;
  password?: string;
  isManager: boolean;
  roomId: string;
  room?: Room;
}

export interface Expense {
  id: string;
  description: string;
  amount: number;
  category: string;
  addedById: string;
  addedByName?: string;
  date: string;
  roomId: string;
  status: 'pending' | 'approved' | 'rejected';
  approvedById?: string;
  approvedByName?: string;
  approvedAt?: string;
}

// export const EXPENSE_CATEGORIES = [
//   'Food',
//   'Utilities',
//   'Cleaning Supplies',
//   'Internet',
//   'Electricity',
//   'Water',
//   'Gas',
//   'Maintenance',
//   'Other',
// ] as const;

// export type ExpenseCategory = typeof EXPENSE_CATEGORIES[number];

export interface Room {
  id: string;
  name: string;
  inviteCode: string;
  createdAt: string;
  updatedAt: string;
}
