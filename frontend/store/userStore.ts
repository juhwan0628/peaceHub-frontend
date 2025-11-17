import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type { User } from '@/types';

// ========================================
// User Store Types
// ========================================

interface UserState {
  user: User | null;
  isLoading: boolean;
  error: string | null;

  // Actions
  setUser: (user: User | null) => void;
  clearUser: () => void;
  setLoading: (loading: boolean) => void;
  setError: (error: string | null) => void;
}

// ========================================
// User Store
// ========================================

export const useUserStore = create<UserState>()(
  persist(
    (set) => ({
      user: null,
      isLoading: false,
      error: null,

      setUser: (user) => set({ user, error: null }),

      clearUser: () => set({ user: null, error: null }),

      setLoading: (isLoading) => set({ isLoading }),

      setError: (error) => set({ error, isLoading: false }),
    }),
    {
      name: 'peacehub-user-storage', // localStorage key
      partialize: (state) => ({ user: state.user }), // user만 persist
    }
  )
);

// ========================================
// Selectors (for performance)
// ========================================

export const selectUser = (state: UserState) => state.user;
export const selectIsLoggedIn = (state: UserState) => !!state.user;
export const selectUserName = (state: UserState) => state.user?.name || '';
export const selectUserEmail = (state: UserState) => state.user?.email || '';
export const selectRoomId = (state: UserState) => state.user?.roomId;
