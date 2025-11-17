import type { ScheduleBlock, DayOfWeek, TimeBlockType } from '@/types';
import { DAYS_OF_WEEK } from '@/types';

// ========================================
// 시간 변환 유틸
// ========================================

/**
 * 시간(분)을 Grid Column으로 변환
 * 0분 → 1, 60분 → 2, 1380분 → 24
 */
export const minutesToGridColumn = (minutes: number): number => {
  return Math.floor(minutes / 60) + 1;
};

/**
 * 시간 칸(0-23)을 분으로 변환
 * 0 → 0, 1 → 60, 23 → 1380
 */
export const hourToMinutes = (hour: number): number => {
  return hour * 60;
};

/**
 * Grid Column을 시간(분)으로 변환
 */
export const gridColumnToMinutes = (column: number): number => {
  return (column - 1) * 60;
};

// ========================================
// 블록 필터링 및 정렬
// ========================================

/**
 * 특정 요일의 블록만 필터링
 */
export const getBlocksByDay = (
  blocks: ScheduleBlock[],
  day: DayOfWeek
): ScheduleBlock[] => {
  return blocks
    .filter((b) => b.dayOfWeek === day)
    .sort((a, b) => a.startTime - b.startTime);
};

/**
 * 요일별로 블록 그룹화
 */
export const groupBlocksByDay = (
  blocks: ScheduleBlock[]
): Record<DayOfWeek, ScheduleBlock[]> => {
  const grouped = {} as Record<DayOfWeek, ScheduleBlock[]>;

  DAYS_OF_WEEK.forEach((day) => {
    grouped[day] = getBlocksByDay(blocks, day);
  });

  return grouped;
};

// ========================================
// 블록 검증
// ========================================

/**
 * 블록 겹침 여부 확인
 */
export const hasOverlap = (
  existingBlocks: ScheduleBlock[],
  newBlock: { dayOfWeek: DayOfWeek; startTime: number; endTime: number },
  excludeId?: string
): boolean => {
  const dayBlocks = getBlocksByDay(existingBlocks, newBlock.dayOfWeek).filter(
    (b) => b.id !== excludeId
  );

  return dayBlocks.some((block) => {
    return (
      (newBlock.startTime >= block.startTime &&
        newBlock.startTime < block.endTime) ||
      (newBlock.endTime > block.startTime &&
        newBlock.endTime <= block.endTime) ||
      (newBlock.startTime <= block.startTime &&
        newBlock.endTime >= block.endTime)
    );
  });
};

/**
 * 특정 요일이 24시간을 커버하는지 확인
 */
export const covers24Hours = (blocks: ScheduleBlock[]): boolean => {
  if (blocks.length === 0) return false;

  const sorted = [...blocks].sort((a, b) => a.startTime - b.startTime);

  // 첫 블록이 0시에서 시작하는지
  if (sorted[0].startTime !== 0) return false;

  // 연속성 확인
  for (let i = 0; i < sorted.length - 1; i++) {
    if (sorted[i].endTime !== sorted[i + 1].startTime) {
      return false;
    }
  }

  // 마지막 블록이 24시(1440분)에 끝나는지
  return sorted[sorted.length - 1].endTime === 1440;
};

/**
 * 전체 7일이 24시간을 커버하는지 확인
 */
export const validateFullWeekCoverage = (
  blocks: ScheduleBlock[]
): { isValid: boolean; missingDays: DayOfWeek[] } => {
  const missingDays: DayOfWeek[] = [];

  DAYS_OF_WEEK.forEach((day) => {
    const dayBlocks = getBlocksByDay(blocks, day);
    if (!covers24Hours(dayBlocks)) {
      missingDays.push(day);
    }
  });

  return {
    isValid: missingDays.length === 0,
    missingDays,
  };
};

// ========================================
// 빠른 액션 유틸
// ========================================

/**
 * 평일에 패턴 적용 (월~금)
 */
export const applyToWeekdays = (
  sourceDay: DayOfWeek,
  allBlocks: ScheduleBlock[]
): ScheduleBlock[] => {
  const template = getBlocksByDay(allBlocks, sourceDay);
  const weekdays: DayOfWeek[] = ['MONDAY', 'TUESDAY', 'WEDNESDAY', 'THURSDAY', 'FRIDAY'];

  // 기존 평일 블록 제거
  const withoutWeekdays = allBlocks.filter(
    (b) => !weekdays.includes(b.dayOfWeek)
  );

  // 새 평일 블록 생성
  const newWeekdayBlocks = weekdays.flatMap((day) =>
    template.map((b) => ({
      ...b,
      id: crypto.randomUUID(),
      dayOfWeek: day,
    }))
  );

  return [...withoutWeekdays, ...newWeekdayBlocks];
};

/**
 * 주말에 패턴 적용 (토~일)
 */
export const applyToWeekend = (
  sourceDay: DayOfWeek,
  allBlocks: ScheduleBlock[]
): ScheduleBlock[] => {
  const template = getBlocksByDay(allBlocks, sourceDay);
  const weekend: DayOfWeek[] = ['SATURDAY', 'SUNDAY'];

  // 기존 주말 블록 제거
  const withoutWeekend = allBlocks.filter((b) => !weekend.includes(b.dayOfWeek));

  // 새 주말 블록 생성
  const newWeekendBlocks = weekend.flatMap((day) =>
    template.map((b) => ({
      ...b,
      id: crypto.randomUUID(),
      dayOfWeek: day,
    }))
  );

  return [...withoutWeekend, ...newWeekendBlocks];
};

/**
 * 특정 요일을 다른 요일로 복사
 */
export const copyDayToAnother = (
  sourceDay: DayOfWeek,
  targetDay: DayOfWeek,
  allBlocks: ScheduleBlock[]
): ScheduleBlock[] => {
  const template = getBlocksByDay(allBlocks, sourceDay);

  // 대상 요일의 기존 블록 제거
  const withoutTarget = allBlocks.filter((b) => b.dayOfWeek !== targetDay);

  // 새 블록 생성
  const newBlocks = template.map((b) => ({
    ...b,
    id: crypto.randomUUID(),
    dayOfWeek: targetDay,
  }));

  return [...withoutTarget, ...newBlocks];
};

/**
 * 빈 시간을 TASK 타입으로 자동 채우기
 */
export const fillGapsWithTask = (
  blocks: ScheduleBlock[],
  day: DayOfWeek
): ScheduleBlock[] => {
  const dayBlocks = getBlocksByDay(blocks, day);
  const otherBlocks = blocks.filter((b) => b.dayOfWeek !== day);

  if (dayBlocks.length === 0) {
    // 블록이 없으면 전체를 TASK로
    return [
      ...otherBlocks,
      {
        id: crypto.randomUUID(),
        dayOfWeek: day,
        type: 'TASK',
        startTime: 0,
        endTime: 1440,
      },
    ];
  }

  const sorted = [...dayBlocks].sort((a, b) => a.startTime - b.startTime);
  const newBlocks: ScheduleBlock[] = [];

  // 시작 전 공백
  if (sorted[0].startTime > 0) {
    newBlocks.push({
      id: crypto.randomUUID(),
      dayOfWeek: day,
      type: 'TASK',
      startTime: 0,
      endTime: sorted[0].startTime,
    });
  }

  // 중간 공백
  for (let i = 0; i < sorted.length - 1; i++) {
    if (sorted[i].endTime < sorted[i + 1].startTime) {
      newBlocks.push({
        id: crypto.randomUUID(),
        dayOfWeek: day,
        type: 'TASK',
        startTime: sorted[i].endTime,
        endTime: sorted[i + 1].startTime,
      });
    }
  }

  // 끝 공백
  if (sorted[sorted.length - 1].endTime < 1440) {
    newBlocks.push({
      id: crypto.randomUUID(),
      dayOfWeek: day,
      type: 'TASK',
      startTime: sorted[sorted.length - 1].endTime,
      endTime: 1440,
    });
  }

  return [...otherBlocks, ...sorted, ...newBlocks];
};

/**
 * 모든 요일의 빈 시간을 TASK로 채우기
 */
export const fillAllGapsWithTask = (blocks: ScheduleBlock[]): ScheduleBlock[] => {
  let result = blocks;
  DAYS_OF_WEEK.forEach((day) => {
    result = fillGapsWithTask(result, day);
  });
  return result;
};

// ========================================
// 시간별 배열 ↔ 블록 변환
// ========================================

/**
 * 시간별 배열(24개)을 블록 배열로 변환
 * 연속된 같은 타입을 하나의 블록으로 병합
 */
export const hourlyScheduleToBlocks = (
  day: DayOfWeek,
  hourlySchedule: (TimeBlockType | null)[]
): ScheduleBlock[] => {
  const blocks: ScheduleBlock[] = [];
  let currentType: TimeBlockType | null = null;
  let startHour = 0;

  for (let hour = 0; hour < 24; hour++) {
    const type = hourlySchedule[hour];

    if (type !== currentType) {
      // 이전 블록 종료
      if (currentType !== null) {
        blocks.push({
          id: crypto.randomUUID(),
          dayOfWeek: day,
          type: currentType,
          startTime: startHour * 60,
          endTime: hour * 60,
        });
      }

      // 새 블록 시작
      currentType = type;
      startHour = hour;
    }
  }

  // 마지막 블록 처리
  if (currentType !== null) {
    blocks.push({
      id: crypto.randomUUID(),
      dayOfWeek: day,
      type: currentType,
      startTime: startHour * 60,
      endTime: 24 * 60, // 1440분
    });
  }

  return blocks;
};

/**
 * 블록 배열을 시간별 배열(24개)로 변환
 */
export const blocksToHourlySchedule = (
  blocks: ScheduleBlock[]
): (TimeBlockType | null)[] => {
  const hourlySchedule: (TimeBlockType | null)[] = Array(24).fill(null);

  blocks.forEach((block) => {
    const startHour = Math.floor(block.startTime / 60);
    const endHour = Math.ceil(block.endTime / 60);

    for (let hour = startHour; hour < endHour && hour < 24; hour++) {
      hourlySchedule[hour] = block.type;
    }
  });

  return hourlySchedule;
};

/**
 * 전체 주간 스케줄을 시간별 배열로 변환
 */
export const blocksToWeeklyHourlySchedule = (
  blocks: ScheduleBlock[]
): Record<DayOfWeek, (TimeBlockType | null)[]> => {
  const weekly = {} as Record<DayOfWeek, (TimeBlockType | null)[]>;

  DAYS_OF_WEEK.forEach((day) => {
    const dayBlocks = getBlocksByDay(blocks, day);
    weekly[day] = blocksToHourlySchedule(dayBlocks);
  });

  return weekly;
};

/**
 * 시간별 주간 스케줄을 블록 배열로 변환
 */
export const weeklyHourlyScheduleToBlocks = (
  weekly: Record<DayOfWeek, (TimeBlockType | null)[]>
): ScheduleBlock[] => {
  const allBlocks: ScheduleBlock[] = [];

  DAYS_OF_WEEK.forEach((day) => {
    const dayBlocks = hourlyScheduleToBlocks(day, weekly[day]);
    allBlocks.push(...dayBlocks);
  });

  return allBlocks;
};
