import axios, { AxiosHeaders, type AxiosInstance, type AxiosRequestConfig } from 'axios';
import type { Expense, Room, Roommate, ContributionPeriod, Contribution, BankSummary } from './types';

const RAW_API_BASE = import.meta.env.VITE_API_BASE_URL ?? '/api';
const SESSION_KEYS = {
  authToken: 'authToken',
  currentRoom: 'currentRoomId',
  currentUser: 'currentUserId',
  currentUserProfile: 'currentUserProfile',
} as const;

type AuthResponse = {
  token?: string;
  user: Roommate;
};

type ApiErrorPayload = {
  error?: string;
  message?: string;
  details?: unknown;
};

type CreateRoommateParams = {
  name: string;
  email: string;
  password: string;
  roomId?: string;
  inviteCode?: string;
};

type AddMemberParams = {
  roommateId?: string;
  email?: string;
};

type CreateExpenseParams = {
  roomId: string;
  description: string;
  amount: number;
  category: string;
  date: string;
  addedById: string;
};

const normalizeApiBaseUrl = (value: string) => {
  const base = value.trim().replace(/\/$/, '');
  if (!base) {
    return '/api';
  }

  return base.endsWith('/api') ? base : `${base}/api`;
};

const getSessionStorage = () => {
  if (typeof window === 'undefined') {
    return null;
  }

  return window.sessionStorage;
};

const readSessionValue = (key: string) => getSessionStorage()?.getItem(key) ?? null;

const writeSessionValue = (key: string, value: string) => {
  getSessionStorage()?.setItem(key, value);
};

const removeSessionValue = (key: string) => {
  getSessionStorage()?.removeItem(key);
};

const readSessionJson = <T>(key: string): T | null => {
  const raw = readSessionValue(key);
  if (!raw) {
    return null;
  }

  try {
    return JSON.parse(raw) as T;
  } catch {
    return null;
  }
};

const normalizeEmail = (email: string) => email.trim().toLowerCase();

const extractErrorMessage = (payload: unknown) => {
  if (!payload) {
    return null;
  }

  if (typeof payload === 'string') {
    return payload;
  }

  if (typeof payload === 'object') {
    const { error, message } = payload as ApiErrorPayload;
    return error ?? message ?? null;
  }

  return null;
};

export class ApiError extends Error {
  status?: number;
  code?: string;
  details?: unknown;

  constructor(message: string, options: { status?: number; code?: string; details?: unknown } = {}) {
    super(message);
    this.name = 'ApiError';
    this.status = options.status;
    this.code = options.code;
    this.details = options.details;
  }
}

const toApiError = (error: unknown) => {
  if (axios.isAxiosError(error)) {
    if (!error.response) {
      if (error.code === 'ECONNABORTED') {
        return new ApiError('The request timed out. Please try again.', {
          code: error.code,
        });
      }

      return new ApiError('Unable to reach the server. Check your connection and backend URL.', {
        code: error.code,
      });
    }

    const message = extractErrorMessage(error.response.data) ?? `Request failed: ${error.response.status}`;
    return new ApiError(message, {
      status: error.response.status,
      code: error.code,
      details: error.response.data,
    });
  }

  if (error instanceof Error) {
    return error;
  }

  return new ApiError('Unexpected error');
};

const apiClientBaseUrl = normalizeApiBaseUrl(RAW_API_BASE);

export const httpClient: AxiosInstance = axios.create({
  baseURL: apiClientBaseUrl,
  headers: {
    Accept: 'application/json',
    'Content-Type': 'application/json',
  },
  timeout: 15000,
});

export const sessionStore = {
  getAuthToken: () => readSessionValue(SESSION_KEYS.authToken),
  setAuthToken: (token: string) => writeSessionValue(SESSION_KEYS.authToken, token),
  clearAuthToken: () => removeSessionValue(SESSION_KEYS.authToken),

  getCurrentUser: () => readSessionValue(SESSION_KEYS.currentUser),
  setCurrentUser: (userId: string) => writeSessionValue(SESSION_KEYS.currentUser, userId),
  clearCurrentUser: () => removeSessionValue(SESSION_KEYS.currentUser),

  getCurrentRoom: () => readSessionValue(SESSION_KEYS.currentRoom),
  setCurrentRoom: (roomId: string) => writeSessionValue(SESSION_KEYS.currentRoom, roomId),
  clearCurrentRoom: () => removeSessionValue(SESSION_KEYS.currentRoom),

  getCurrentUserProfile: () => readSessionJson<Roommate>(SESSION_KEYS.currentUserProfile),
  setCurrentUserProfile: (user: Roommate) =>
    writeSessionValue(SESSION_KEYS.currentUserProfile, JSON.stringify(user)),
  clearCurrentUserProfile: () => removeSessionValue(SESSION_KEYS.currentUserProfile),

  clear: () => {
    removeSessionValue(SESSION_KEYS.authToken);
    removeSessionValue(SESSION_KEYS.currentUser);
    removeSessionValue(SESSION_KEYS.currentRoom);
    removeSessionValue(SESSION_KEYS.currentUserProfile);
  },
};

httpClient.interceptors.request.use(config => {
  const headers = AxiosHeaders.from(config.headers);
  const token = sessionStore.getAuthToken();

  headers.set('Accept', 'application/json');
  if (token) {
    headers.set('Authorization', `Bearer ${token}`);
  }

  config.headers = headers;
  return config;
});

httpClient.interceptors.response.use(
  response => response,
  error => Promise.reject(toApiError(error))
);

const request = async <T>(config: AxiosRequestConfig) => {
  const response = await httpClient.request<T>(config);
  return response.data;
};

const auth = {
  authenticate: async (email: string, password: string) => {
    const authResponse = await request<AuthResponse>({
      method: 'POST',
      url: '/login',
      data: {
        email: normalizeEmail(email),
        password,
      },
    });

    if (authResponse.token) {
      sessionStore.setAuthToken(authResponse.token);
    }

    sessionStore.setCurrentUserProfile(authResponse.user);
    return authResponse.user;
  },
};

const rooms = {
  list: () => request<Room[]>({ method: 'GET', url: '/rooms' }),
  create: (name: string, inviteCode?: string) =>
    request<Room>({
      method: 'POST',
      url: '/rooms',
      data: { name, inviteCode },
    }),
  join: (inviteCode: string) =>
    request<Room>({
      method: 'POST',
      url: '/rooms/join',
      data: { inviteCode },
    }),
  getById: (roomId: string) => request<Room>({ method: 'GET', url: `/rooms/${roomId}` }),
  update: (roomId: string, name: string) =>
    request<Room>({
      method: 'PATCH',
      url: `/rooms/${roomId}`,
      data: { name },
    }),
  regenerateInviteCode: (roomId: string) =>
    request<Room>({
      method: 'POST',
      url: `/rooms/${roomId}/invite-code`,
    }),
  remove: (roomId: string) =>
    request<void>({
      method: 'DELETE',
      url: `/rooms/${roomId}`,
    }),
};

const roommates = {
  listByRoom: (roomId: string) => request<Roommate[]>({ method: 'GET', url: `/rooms/${roomId}/roommates` }),
  register: (params: CreateRoommateParams) => {
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

    return request<Roommate>({
      method: 'POST',
      url: '/roommates/register',
      data: payload,
    });
  },
  addMember: (params: AddMemberParams) => {
    const payload: AddMemberParams = {};

    if (params.roommateId?.trim()) {
      payload.roommateId = params.roommateId.trim();
    }

    if (params.email?.trim()) {
      payload.email = normalizeEmail(params.email);
    }

    if (!payload.roommateId && !payload.email) {
      throw new ApiError('roommateId or email is required');
    }

    return request<Roommate>({
      method: 'POST',
      url: '/roommates/add-member',
      data: payload,
    });
  },
};

const expenses = {
  listByRoom: (roomId: string) => request<Expense[]>({ method: 'GET', url: `/rooms/${roomId}/expenses` }),
  create: ({ roomId, ...payload }: CreateExpenseParams) =>
    request<Expense>({
      method: 'POST',
      url: `/rooms/${roomId}/expenses`,
      data: payload,
    }),
  updateStatus: (expenseId: string, status: Expense['status']) =>
    request<Expense>({
      method: 'POST',
      url: `/expenses/${expenseId}/status`,
      data: { status },
    }),
};

type CreatePeriodParams = {
  roomId: string;
  month: number;
  year: number;
  amountPerPerson: number;
};

type UpdatePaymentParams = {
  roomId: string;
  periodId: string;
  roommateId: string;
  amountPaid: number;
};

const contributions = {
  getBankSummary: (roomId: string) =>
    request<BankSummary>({ method: 'GET', url: `/rooms/${roomId}/bank` }),

  listPeriods: (roomId: string) =>
    request<ContributionPeriod[]>({ method: 'GET', url: `/rooms/${roomId}/contribution-periods` }),

  createPeriod: ({ roomId, ...data }: CreatePeriodParams) =>
    request<ContributionPeriod>({
      method: 'POST',
      url: `/rooms/${roomId}/contribution-periods`,
      data,
    }),

  updatePayment: ({ roomId, periodId, roommateId, amountPaid }: UpdatePaymentParams) =>
    request<Contribution>({
      method: 'PUT',
      url: `/rooms/${roomId}/contribution-periods/${periodId}/payments/${roommateId}`,
      data: { amountPaid },
    }),
};

export const api = {
  auth,
  client: httpClient,
  contributions,
  expenses,
  roommates,
  rooms,
  session: sessionStore,
};

export type Api = typeof api;
