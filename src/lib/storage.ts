import { Roommate, Expense } from './types';

const ROOMMATES_KEY = 'roommates';
const EXPENSES_KEY = 'expenses';
const CURRENT_USER_KEY = 'currentUser';

export const storage = {
  getRoommates: (): Roommate[] => {
    const data = localStorage.getItem(ROOMMATES_KEY);
    return data ? JSON.parse(data) : [];
  },

  setRoommates: (roommates: Roommate[]) => {
    localStorage.setItem(ROOMMATES_KEY, JSON.stringify(roommates));
  },

  getExpenses: (): Expense[] => {
    const data = localStorage.getItem(EXPENSES_KEY);
    return data ? JSON.parse(data) : [];
  },

  setExpenses: (expenses: Expense[]) => {
    localStorage.setItem(EXPENSES_KEY, JSON.stringify(expenses));
  },

  getCurrentUser: (): string | null => {
    return localStorage.getItem(CURRENT_USER_KEY);
  },

  setCurrentUser: (userId: string) => {
    localStorage.setItem(CURRENT_USER_KEY, userId);
  },

  clearCurrentUser: () => {
    localStorage.removeItem(CURRENT_USER_KEY);
  },

  initializeRoommates: (names: string[]) => {
    const roommates: Roommate[] = names.map((name, index) => ({
      id: `roommate-${index + 1}`,
      name,
      isManager: index === 0, // First person is the manager
    }));
    storage.setRoommates(roommates);
  },
};
