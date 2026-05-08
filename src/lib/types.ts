export interface Roommate {
  id: string;
  name: string;
  email?: string;
  password?: string;
  isManager: boolean;
  roomId: string | null;
  room?: Room;
  createdAt?: Date
  updatedAt?: Date
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

export interface ContributionPeriod {
  id: string;
  roomId: string;
  month: number;
  year: number;
  amountPerPerson: number;
  contributions: Contribution[];
  createdAt: string;
  updatedAt: string;
}

export interface Contribution {
  id: string;
  periodId: string;
  roommateId: string;
  roommate?: Pick<Roommate, 'id' | 'name' | 'email'>;
  amountPaid: number;
  createdAt: string;
  updatedAt: string;
}

export interface PerPersonBankSummary {
  roommateId: string;
  name: string;
  email: string;
  totalOwed: number;
  totalPaid: number;
  outstandingDues: number;
}

export interface BankSummary {
  totalContributed: number;
  totalSpent: number;
  bankBalance: number;
  profitLoss: number;
  perPerson: PerPersonBankSummary[];
}
