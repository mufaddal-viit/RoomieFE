import { Expense, Room, Roommate } from './types';

const API_BASE = import.meta.env.VITE_API_BASE_URL ?? '/api';
const CURRENT_USER_KEY = 'currentUserId';
const CURRENT_ROOM_KEY = 'currentRoomId';

const normalizeEmail = (email: string) => email.trim().toLowerCase();

const request = async <T>(path: string, options: RequestInit = {}): Promise<T> => {
  const res = await fetch(`${API_BASE}${path}`, {
    headers: {
      'Content-Type': 'application/json',
      ...(options.headers ?? {}),
    },
    ...options,
  });
  if (!res.ok) {
    const body = await res.json().catch(() => ({}));
    throw new Error(body.error || `Request failed: ${res.status}`);
  }
  return res.json() as Promise<T>;
};

export const storage = {
  getCurrentUser: (): string | null => {
    if (typeof sessionStorage === 'undefined') return null;
    return sessionStorage.getItem(CURRENT_USER_KEY);
  },

  setCurrentUser: (userId: string) => {
    if (typeof sessionStorage === 'undefined') return;
    sessionStorage.setItem(CURRENT_USER_KEY, userId);
  },

  clearCurrentUser: () => {
    if (typeof sessionStorage === 'undefined') return;
    sessionStorage.removeItem(CURRENT_USER_KEY);
  },

  getCurrentRoom: (): string | null => {
    if (typeof sessionStorage === 'undefined') return null;
    return sessionStorage.getItem(CURRENT_ROOM_KEY);
  },

  setCurrentRoom: (roomId: string) => {
    if (typeof sessionStorage === 'undefined') return;
    sessionStorage.setItem(CURRENT_ROOM_KEY, roomId);
  },

  clearCurrentRoom: () => {
    if (typeof sessionStorage === 'undefined') return;
    sessionStorage.removeItem(CURRENT_ROOM_KEY);
  },

  createRoom: async (name: string, inviteCode?: string): Promise<Room> => {
    return request<Room>('/rooms', {
      method: 'POST',
      body: JSON.stringify({ name, inviteCode }),
    });
  },

  getRoom: async (roomId: string): Promise<Room> => {
    return request<Room>(`/rooms/${roomId}`);
  },

  getRoommates: async (roomId: string): Promise<Roommate[]> => {
    return request<Roommate[]>(`/rooms/${roomId}/roommates`);
  },

  createRoommate: async (params: {
    name: string;
    email: string;
    password: string;
    roomId: string;
    isManager?: boolean;
  }): Promise<Roommate> => {
    return request<Roommate>('/roommates', {
      method: 'POST',
      body: JSON.stringify({
        ...params,
        email: normalizeEmail(params.email),
      }),
    });
  },

  authenticate: async (email: string, password: string): Promise<Roommate> => {
    return request<Roommate>('/login', {
      method: 'POST',
      body: JSON.stringify({ email: normalizeEmail(email), password }),
    });
  },

  getExpenses: async (roomId: string): Promise<Expense[]> => {
    return request<Expense[]>(`/rooms/${roomId}/expenses`);
  },

  createExpense: async (params: {
    roomId: string;
    description: string;
    amount: number;
    category: string;
    date: string;
    addedById: string;
  }): Promise<Expense> => {
    return request<Expense>(`/rooms/${params.roomId}/expenses`, {
      method: 'POST',
      body: JSON.stringify(params),
    });
  },

  updateExpenseStatus: async (expenseId: string, status: Expense['status'], approverId?: string) => {
    return request<Expense>(`/expenses/${expenseId}/status`, {
      method: 'POST',
      body: JSON.stringify({ status, approverId }),
    });
  },

  initializeRoommates: async (names: string[], roomName = 'Household'): Promise<{
    room: Room;
    roommates: Roommate[];
  }> => {
    if (names.length === 0) {
      throw new Error('At least one roommate is required');
    }

    const room = await storage.createRoom(roomName);
    const roommates: Roommate[] = [];
    for (let i = 0; i < names.length; i++) {
      const roommate = await storage.createRoommate({
        name: names[i],
        email: `${names[i].replace(/\s+/g, '.').toLowerCase()}@example.com`,
        password: 'password',
        roomId: room.id,
        isManager: i === 0,
      });
      roommates.push(roommate);
    }

    return { room, roommates };
  },
};
