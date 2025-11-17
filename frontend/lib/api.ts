import type {
  User,
  Room,
  ScheduleBlock,
  CreateRoomRequest,
  JoinRoomRequest,
  RoomResponse,
  UserResponse,
} from '@/types';

// ========================================
// API Configuration
// ========================================

export const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000';

// ========================================
// Fetch Wrapper with Session Support
// ========================================

class ApiError extends Error {
  constructor(
    public status: number,
    public statusText: string,
    message: string
  ) {
    super(message);
    this.name = 'ApiError';
  }
}

/**
 * Fetch wrapper with credentials (session cookies)
 * Automatically redirects to /login on 401 Unauthorized
 */
export async function fetchWithAuth<T>(
  endpoint: string,
  options?: RequestInit
): Promise<T> {
  const url = `${API_BASE_URL}${endpoint}`;

  try {
    const response = await fetch(url, {
      ...options,
      credentials: 'include', // 세션 쿠키 포함
      headers: {
        'Content-Type': 'application/json',
        ...options?.headers,
      },
    });

    // 401 Unauthorized → 로그인 페이지로 리다이렉트
    if (response.status === 401) {
      if (typeof window !== 'undefined') {
        window.location.href = '/login';
      }
      throw new ApiError(401, 'Unauthorized', 'Login required');
    }

    // 에러 응답 처리
    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new ApiError(
        response.status,
        response.statusText,
        errorData.message || 'API request failed'
      );
    }

    // 성공 응답
    return await response.json();
  } catch (error) {
    if (error instanceof ApiError) {
      throw error;
    }
    // 네트워크 에러 등
    throw new Error('Network error or server is unreachable');
  }
}

// ========================================
// SWR Fetcher
// ========================================

/**
 * SWR용 fetcher 함수
 * 사용법: const { data, error } = useSWR('/api/users/', swrFetcher)
 */
export const swrFetcher = async <T>(url: string): Promise<T> => {
  return fetchWithAuth<T>(url);
};

// ========================================
// API Client Functions
// ========================================

/**
 * 1. Authentication
 */
export const authApi = {
  /**
   * Google 로그인 시작
   * 사용자를 백엔드 OAuth URL로 리다이렉트
   */
  loginWithGoogle: () => {
    if (typeof window !== 'undefined') {
      window.location.href = `${API_BASE_URL}/api/auth/google`;
    }
  },

  /**
   * 현재 로그인된 사용자 정보 조회
   * GET /api/users/
   */
  getCurrentUser: async (): Promise<UserResponse> => {
    return fetchWithAuth<UserResponse>('/api/users/');
  },
};

/**
 * 2. Room
 */
export const roomApi = {
  /**
   * 방 생성
   * POST /api/rooms/
   */
  createRoom: async (data: CreateRoomRequest): Promise<RoomResponse> => {
    return fetchWithAuth<RoomResponse>('/api/rooms/', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  },

  /**
   * 방 참여
   * POST /api/rooms/join
   */
  joinRoom: async (data: JoinRoomRequest): Promise<RoomResponse> => {
    return fetchWithAuth<RoomResponse>('/api/rooms/join', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  },
};

/**
 * 3. Schedule
 */
export const scheduleApi = {
  /**
   * 타임테이블 조회
   * GET /api/schedules
   */
  getSchedule: async (): Promise<ScheduleBlock[]> => {
    return fetchWithAuth<ScheduleBlock[]>('/api/schedules');
  },

  /**
   * 타임테이블 등록/수정
   * POST /api/schedules
   *
   * @param schedules - 24시간 공백 없는 블록 배열
   */
  postSchedule: async (schedules: Omit<ScheduleBlock, 'id' | 'userId'>[]): Promise<ScheduleBlock[]> => {
    return fetchWithAuth<ScheduleBlock[]>('/api/schedules', {
      method: 'POST',
      body: JSON.stringify(schedules),
    });
  },
};

// ========================================
// Helper Functions
// ========================================

/**
 * 에러 메시지 추출
 */
export function getErrorMessage(error: unknown): string {
  if (error instanceof ApiError) {
    return error.message;
  }
  if (error instanceof Error) {
    return error.message;
  }
  return 'An unknown error occurred';
}

/**
 * HTTP 상태 코드별 에러 처리
 */
export function handleApiError(error: unknown): void {
  if (error instanceof ApiError) {
    switch (error.status) {
      case 400:
        console.error('Bad Request:', error.message);
        break;
      case 404:
        console.error('Not Found:', error.message);
        break;
      case 409:
        console.error('Conflict:', error.message);
        break;
      case 500:
        console.error('Server Error:', error.message);
        break;
      default:
        console.error('API Error:', error.message);
    }
  }
}
