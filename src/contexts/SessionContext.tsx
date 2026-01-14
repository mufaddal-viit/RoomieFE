import { createContext, useCallback, useContext, useEffect, useMemo, useState, type ReactNode } from 'react';
import { storage } from '@/lib/storage';
import type { Roommate } from '@/lib/types';

type SessionContextValue = {
  currentUser: Roommate | null;
  roommates: Roommate[];
  roomId: string | null;
  loading: boolean;
  refreshSession: () => Promise<void>;
  setSession: (userId: string, roomId: string) => Promise<void>;
  clearSession: () => void;
};

const SessionContext = createContext<SessionContextValue | undefined>(undefined);

const SessionProvider = ({ children }: { children: ReactNode }) => {
  const [currentUser, setCurrentUser] = useState<Roommate | null>(null);
  const [roommates, setRoommates] = useState<Roommate[]>([]);
  const [roomId, setRoomId] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  const clearSession = useCallback(() => {
    storage.clearCurrentUser();
    storage.clearCurrentUserProfile();
    storage.clearCurrentRoom();
    storage.clearAuthToken();
    setCurrentUser(null);
    setRoommates([]);
    setRoomId(null);
    setLoading(false);
  }, []);

  const loadSession = useCallback(
    async (userIdOverride?: string, roomIdOverride?: string) => {
      const storedUserId = userIdOverride ?? storage.getCurrentUser();
      const storedRoomId = roomIdOverride ?? storage.getCurrentRoom();
      if (!storedUserId) {
        clearSession();
        return;
      }
      if (!storedRoomId) {
        const profile = storage.getCurrentUserProfile();
        setCurrentUser(profile && profile.id === storedUserId ? profile : null);
        setRoommates([]);
        setRoomId(null);
        setLoading(false);
        return;
      }

      setLoading(true);
      try {
        const fetchedRoommates = await storage.getRoommates(storedRoomId);
        const user = fetchedRoommates.find(r => r.id === storedUserId) || null;
        if (!user) {
          clearSession();
          return;
        }
        setCurrentUser(user);
        storage.setCurrentUserProfile(user);
        setRoommates(fetchedRoommates);
        setRoomId(storedRoomId);
      } catch (error) {
        console.error('Failed to load session', error);
        clearSession();
      } finally {
        setLoading(false);
      }
    },
    [clearSession]
  );

  const refreshSession = useCallback(async () => {
    await loadSession();
  }, [loadSession]);

  const setSession = useCallback(
    async (userId: string, activeRoomId: string) => {
      storage.setCurrentUser(userId);
      storage.setCurrentRoom(activeRoomId);
      await loadSession(userId, activeRoomId);
    },
    [loadSession]
  );

  useEffect(() => {
    loadSession();
  }, [loadSession]);

  const value = useMemo(
    () => ({
      currentUser,
      roommates,
      roomId,
      loading,
      refreshSession,
      setSession,
      clearSession,
    }),
    [currentUser, roommates, roomId, loading, refreshSession, setSession, clearSession]
  );

  return <SessionContext.Provider value={value}>{children}</SessionContext.Provider>;
};

const useSession = () => {
  const ctx = useContext(SessionContext);
  if (!ctx) {
    throw new Error('useSession must be used within a SessionProvider');
  }
  return ctx;
};

export { SessionProvider, useSession };
