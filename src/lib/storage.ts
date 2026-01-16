import { Expense, Room, Roommate } from './types';

const RAW_API_BASE = import.meta.env.VITE_API_BASE_URL ?? '/api';
const API_BASE = RAW_API_BASE.replace(/\/$/, '');
const API_BASE_URL = API_BASE.endsWith('/api') ? API_BASE : `${API_BASE}/api`;
const CURRENT_USER_KEY = 'currentUserId';
const CURRENT_ROOM_KEY = 'currentRoomId';
const CURRENT_USER_PROFILE_KEY = 'currentUserProfile';
const AUTH_TOKEN_KEY = 'authToken';

const normalizeEmail = (email: string) => email.trim().toLowerCase();

const getStoredAuthToken = () => {
  if (typeof sessionStorage === 'undefined') return null;
  return sessionStorage.getItem(AUTH_TOKEN_KEY);
};

const getStoredUserProfile = () => {
  if (typeof sessionStorage === 'undefined') return null;
  const raw = sessionStorage.getItem(CURRENT_USER_PROFILE_KEY);
  if (!raw) return null;
  try {
    return JSON.parse(raw) as Roommate;
  } catch {
    return null;
  }
};

const parseResponseBody = async (res: Response) => {
  const text = await res.text();
  if (!text) return null;
  try {
    return JSON.parse(text);
  } catch {
    return text;
  }
};

const request = async <T>(path: string, options: RequestInit = {}): Promise<T> => {
  const headers = new Headers(options.headers ?? {});
  if (!headers.has('Content-Type')) {
    headers.set('Content-Type', 'application/json');
  }

  const token = getStoredAuthToken();
  if (token && !headers.has('Authorization')) {
    headers.set('Authorization', `Bearer ${token}`);
  }

  const res = await fetch(`${API_BASE_URL}${path}`, {
    ...options,
    headers,
  });
  const body = await parseResponseBody(res);
  if (!res.ok) {
    const message =
      body && typeof body === 'object'
        ? (body as { error?: string; message?: string }).error ?? (body as { message?: string }).message
        : typeof body === 'string'
          ? body
          : null;
    throw new Error(message || `Request failed: ${res.status}`);
  }
  return body as T;
};

export const storage = {
  getAuthToken: (): string | null => getStoredAuthToken(),

  setAuthToken: (token: string) => {
    if (typeof sessionStorage === 'undefined') return;
    sessionStorage.setItem(AUTH_TOKEN_KEY, token);
  },

  clearAuthToken: () => {
    if (typeof sessionStorage === 'undefined') return;
    sessionStorage.removeItem(AUTH_TOKEN_KEY);
  },

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

  getCurrentUserProfile: (): Roommate | null => getStoredUserProfile(),

  setCurrentUserProfile: (user: Roommate) => {
    if (typeof sessionStorage === 'undefined') return;
    sessionStorage.setItem(CURRENT_USER_PROFILE_KEY, JSON.stringify(user));
  },

  clearCurrentUserProfile: () => {
    if (typeof sessionStorage === 'undefined') return;
    sessionStorage.removeItem(CURRENT_USER_PROFILE_KEY);
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

  getRooms: async (): Promise<Room[]> => {
    return request<Room[]>('/rooms');
  },

  createRoom: async (name: string, inviteCode?: string): Promise<Room> => {
    return request<Room>('/rooms', {
      method: 'POST',
      body: JSON.stringify({ name, inviteCode }),
    });
  },

  joinRoom: async (inviteCode: string): Promise<Room> => {
    return request<Room>('/rooms/join', {
      method: 'POST',
      body: JSON.stringify({ inviteCode }),
    });
  },

  getRoom: async (roomId: string): Promise<Room> => {
    return request<Room>(`/rooms/${roomId}`);
  },

  updateRoom: async (roomId: string, name: string): Promise<Room> => {
    return request<Room>(`/rooms/${roomId}`, {
      method: 'PATCH',
      body: JSON.stringify({ name }),
    });
  },

  regenerateInviteCode: async (roomId: string): Promise<Room> => {
    return request<Room>(`/rooms/${roomId}/invite-code`, {
      method: 'POST',
    });
  },

  deleteRoom: async (roomId: string): Promise<void> => {
    return request<void>(`/rooms/${roomId}`, {
      method: 'DELETE',
    });
  },

  getRoommates: async (roomId: string): Promise<Roommate[]> => {
    return request<Roommate[]>(`/rooms/${roomId}/roommates`);
  },

 createRoommate: async (params: {
  name: string;
  email: string;
  password: string;
  roomId?: string;      // used when creating a room
  inviteCode?: string;  // used when joining a room
}): Promise<Roommate> => {
  const payload: Record<string, string> = {
    name: params.name.trim(),
    email: normalizeEmail(params.email),
    password: params.password,
  };

  if (params.roomId) {
    payload.roomId = params.roomId;
  }

  if (params.inviteCode) {
    payload.inviteCode = params.inviteCode.trim();
  }

  return request<Roommate>('/roommates/register', {
    method: 'POST',
    body: JSON.stringify(payload),
  });
}
,

  addMember: async (params: { roommateId?: string; email?: string }): Promise<Roommate> => {
    const payload: { roommateId?: string; email?: string } = {};
    if (params.roommateId?.trim()) {
      payload.roommateId = params.roommateId.trim();
    }
    if (params.email?.trim()) {
      payload.email = normalizeEmail(params.email);
    }
    if (!payload.roommateId && !payload.email) {
      throw new Error('roommateId or email is required');
    }

    return request<Roommate>('/roommates/add-member', {
      method: 'POST',
      body: JSON.stringify(payload),
    });
  },
  authenticate: async (email: string, password: string): Promise<Roommate> => {
    const auth = await request<{ token?: string; user: Roommate }>('/login', {
      method: 'POST',
      body: JSON.stringify({ email: normalizeEmail(email), password }),
    });
    if (auth.token) {
      storage.setAuthToken(auth.token);
    }
    if (auth.user) {
      storage.setCurrentUserProfile(auth.user);
    }
    return auth.user;
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
    const { roomId, ...payload } = params;
    return request<Expense>(`/rooms/${roomId}/expenses`, {
      method: 'POST',
      body: JSON.stringify(payload),
    });
  },

  updateExpenseStatus: async (expenseId: string, status: Expense['status'], approverId?: string) => {
    return request<Expense>(`/expenses/${expenseId}/status`, {
      method: 'POST',
      body: JSON.stringify({ status, approverId }),
    });
  },

  // initializeRoommates: async (names: string[], roomName = 'Household'): Promise<{
  //   room: Room;
  //   roommates: Roommate[];
  // }> => {
  //   if (names.length === 0) {
  //     throw new Error('At least one roommate is required');
  //   }

  //   const room = await storage.createRoom(roomName);
  //   const roommates: Roommate[] = [];
  //   for (let i = 0; i < names.length; i++) {
  //     const roommate = await storage.createRoommate({
  //       name: names[i],
  //       email: `${names[i].replace(/\s+/g, '.').toLowerCase()}@example.com`,
  //       password: 'password',
  //       roomId: room.id,
  //       isManager: i === 0,
  //     });
  //     roommates.push(roommate);
  //   }

  //   return { room, roommates };
  // },
};
