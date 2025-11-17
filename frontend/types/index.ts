// ========================================
// Enums
// ========================================

export enum DayOfWeek {
  MONDAY = 'MONDAY',
  TUESDAY = 'TUESDAY',
  WEDNESDAY = 'WEDNESDAY',
  THURSDAY = 'THURSDAY',
  FRIDAY = 'FRIDAY',
  SATURDAY = 'SATURDAY',
  SUNDAY = 'SUNDAY',
}

export enum TimeBlockType {
  QUIET = 'QUIET', // 조용시간 (수업, 수면 등)
  BUSY = 'BUSY',   // 외출
  TASK = 'TASK',   // 업무 가능 시간
}

// ========================================
// API Response Types
// ========================================

export interface User {
  id: string;
  googleId: string;
  email: string;
  name: string | null;
  createdAt: string;
  updatedAt: string;
  roomId: string | null;
  workLoad: number;
}

export interface Room {
  id: string;
  name: string;
  inviteCode: string; // 6자리 nanoid
  createdAt: string;
  updatedAt: string;
  ownerId: string;
}

export interface ScheduleBlock {
  id?: string;
  dayOfWeek: DayOfWeek;
  type: TimeBlockType;
  startTime: number; // 분 단위 (예: 16:00 = 960)
  endTime: number;   // 분 단위
  userId?: string;
}

export interface TaskPreference {
  id: string;
  priority: number; // 1지망: 1, 2지망: 2
  userId: string;
  taskId: string;
}

export interface RoomTask {
  id: string;
  title: string;
  difficulty: number;      // knapsack 가치
  estimatedTime: number;   // knapsack 용량
  roomId: string;
}

export interface AssignedTask {
  id: string;
  RoomTaskId: string;
  userId: string;
  difficulty: number;
  roomId: string;
  startDateTime: string;
  endDateTime: string;
}

// ========================================
// API Request Types
// ========================================

export interface CreateRoomRequest {
  name: string;
}

export interface JoinRoomRequest {
  inviteCode: string;
}

export interface PostScheduleRequest {
  schedules: Omit<ScheduleBlock, 'id' | 'userId'>[];
}

// ========================================
// API Response Types (with message)
// ========================================

export interface ApiResponse<T> {
  message: string;
  data?: T;
}

export interface UserResponse {
  message: string;
  user: User;
}

export interface RoomResponse {
  id: string;
  name: string;
  inviteCode: string;
  createdAt: string;
  updatedAt: string;
  ownerId: string;
}

export interface ScheduleResponse {
  schedules: ScheduleBlock[];
}

// ========================================
// Frontend-only Types
// ========================================

export interface TimetableGridData {
  [key: string]: ScheduleBlock[]; // key: DayOfWeek
}

export interface OnboardingData {
  name?: string;
  roomId?: string;
  roomCode?: string;
  roomName?: string;
}

// 타임테이블 UI 상태
export interface TimeBlockSelection {
  day: DayOfWeek;
  startHour: number;
  endHour: number;
  type: TimeBlockType;
}

// ========================================
// Utility Types
// ========================================

// 시간을 "HH:MM" 형식으로 변환
export const minutesToTime = (minutes: number): string => {
  const hours = Math.floor(minutes / 60);
  const mins = minutes % 60;
  return `${hours.toString().padStart(2, '0')}:${mins.toString().padStart(2, '0')}`;
};

// "HH:MM"을 분으로 변환
export const timeToMinutes = (time: string): number => {
  const [hours, minutes] = time.split(':').map(Number);
  return hours * 60 + minutes;
};

// 요일을 한글로 변환
export const dayOfWeekToKorean = (day: DayOfWeek): string => {
  const map: Record<DayOfWeek, string> = {
    [DayOfWeek.MONDAY]: '월',
    [DayOfWeek.TUESDAY]: '화',
    [DayOfWeek.WEDNESDAY]: '수',
    [DayOfWeek.THURSDAY]: '목',
    [DayOfWeek.FRIDAY]: '금',
    [DayOfWeek.SATURDAY]: '토',
    [DayOfWeek.SUNDAY]: '일',
  };
  return map[day];
};

// 요일 배열 (월~일)
export const DAYS_OF_WEEK = [
  DayOfWeek.MONDAY,
  DayOfWeek.TUESDAY,
  DayOfWeek.WEDNESDAY,
  DayOfWeek.THURSDAY,
  DayOfWeek.FRIDAY,
  DayOfWeek.SATURDAY,
  DayOfWeek.SUNDAY,
] as const;
