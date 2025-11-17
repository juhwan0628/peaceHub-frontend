import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type { Room } from '@/types';

// ========================================
// Room Store Types
// ========================================

interface RoomState {
  room: Room | null;
  isLoading: boolean;
  error: string | null;

  // Actions
  setRoom: (room: Room | null) => void;
  clearRoom: () => void;
  setLoading: (loading: boolean) => void;
  setError: (error: string | null) => void;
}

// ========================================
// Room Store
// ========================================

export const useRoomStore = create<RoomState>()(
  persist(
    (set) => ({
      room: null,
      isLoading: false,
      error: null,

      setRoom: (room) => set({ room, error: null }),

      clearRoom: () => set({ room: null, error: null }),

      setLoading: (isLoading) => set({ isLoading }),

      setError: (error) => set({ error, isLoading: false }),
    }),
    {
      name: 'peacehub-room-storage', // localStorage key
      partialize: (state) => ({ room: state.room }), // room만 persist
    }
  )
);

// ========================================
// Selectors (for performance)
// ========================================

export const selectRoom = (state: RoomState) => state.room;
export const selectRoomName = (state: RoomState) => state.room?.name || '';
export const selectInviteCode = (state: RoomState) => state.room?.inviteCode || '';
export const selectIsRoomOwner = (userId: string | undefined) => (state: RoomState) =>
  !!userId && state.room?.ownerId === userId;
