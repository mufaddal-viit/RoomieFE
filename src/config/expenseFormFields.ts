import { type Roommate } from '@/lib/types';

const EXPENSE_CATEGORIES = [
  'Food',
  'Utilities',
  'Cleaning Supplies',
  'Internet',
  'Electricity',
  'Water',
  'Gas',
  'Maintenance',
  'Other',
  'masti'
] as const;

type ExpenseField = {
  name: 'memberId' | 'amount' | 'description' | 'category' | 'date' | string;
  label: string;
  type: 'text' | 'number' | 'textarea' | 'select' | 'calendar';
  placeholder?: string;
  options?: { label: string; value: string }[];
  getOptions?: (roommates: Roommate[], currentUserId?: string) => { label: string; value: string }[];
};

export const expenseFields: ExpenseField[] = [
  {
    name: 'memberId',
    label: 'Purchaser',
    type: 'select',
    placeholder: 'Select a member',
    getOptions: (roommates, currentUserId) =>
      roommates.map(roommate => ({
        label: `${roommate.name}${roommate.id === currentUserId ? ' (You)' : ''}`,
        value: roommate.id,
      })),
  },
  {
    name: 'date',
    label: 'Date',
    type: 'calendar',
    placeholder: 'Pick a date',
  },
  {
    name: 'amount',
    label: 'Amount (AED)',
    type: 'number',
    placeholder: '0.00',
  },
  {
    name: 'description',
    label: 'Description',
    type: 'textarea',
    placeholder: 'What was purchased?',
  },
  
  {
    name: 'category',
    label: 'Category',
    type: 'select',
    placeholder: 'Select a category',
    options: EXPENSE_CATEGORIES.map(cat => ({ label: cat, value: cat })),
  },
];
