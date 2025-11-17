'use client';

import { useState, useEffect } from 'react';
import type { DayOfWeek, TimeBlockType } from '@/types';
import { DAYS_OF_WEEK } from '@/types';
import DayTimeline from './DayTimeline';
import { Button } from './ui/button';
import { cn } from '@/lib/utils';

// ========================================
// TimetableGrid Component (시간별 상태 관리)
// ========================================

export type WeeklyHourlySchedule = Record<DayOfWeek, (TimeBlockType | null)[]>;

interface TimetableGridProps {
  initialSchedule?: WeeklyHourlySchedule;
  onScheduleChange: (schedule: WeeklyHourlySchedule) => void;
  mode?: 'edit' | 'view';
  showQuickActions?: boolean;
}

// 빈 스케줄 생성
const createEmptySchedule = (): WeeklyHourlySchedule => {
  const schedule = {} as WeeklyHourlySchedule;
  DAYS_OF_WEEK.forEach((day) => {
    schedule[day] = Array(24).fill(null);
  });
  return schedule;
};

export default function TimetableGrid({
  initialSchedule,
  onScheduleChange,
  mode = 'edit',
  showQuickActions = true,
}: TimetableGridProps) {
  const [schedule, setSchedule] = useState<WeeklyHourlySchedule>(
    initialSchedule || createEmptySchedule()
  );
  const [selectedType, setSelectedType] = useState<TimeBlockType>('QUIET');
  const [selectedDay, setSelectedDay] = useState<DayOfWeek | null>(null);

  // 부모에게 변경 알림
  useEffect(() => {
    onScheduleChange(schedule);
  }, [schedule, onScheduleChange]);

  // 요일 스케줄 변경
  const handleDayScheduleChange = (day: DayOfWeek, hourlySchedule: (TimeBlockType | null)[]) => {
    setSchedule((prev) => ({
      ...prev,
      [day]: hourlySchedule,
    }));
  };

  // 빠른 액션: 평일 적용
  const handleApplyToWeekdays = () => {
    if (!selectedDay) {
      alert('먼저 복사할 요일을 선택하세요');
      return;
    }

    const template = schedule[selectedDay];
    const weekdays: DayOfWeek[] = ['MONDAY', 'TUESDAY', 'WEDNESDAY', 'THURSDAY', 'FRIDAY'];

    setSchedule((prev) => {
      const updated = { ...prev };
      weekdays.forEach((day) => {
        updated[day] = [...template];
      });
      return updated;
    });

    alert('평일에 적용되었습니다');
  };

  // 빠른 액션: 주말 적용
  const handleApplyToWeekend = () => {
    if (!selectedDay) {
      alert('먼저 복사할 요일을 선택하세요');
      return;
    }

    const template = schedule[selectedDay];
    const weekend: DayOfWeek[] = ['SATURDAY', 'SUNDAY'];

    setSchedule((prev) => {
      const updated = { ...prev };
      weekend.forEach((day) => {
        updated[day] = [...template];
      });
      return updated;
    });

    alert('주말에 적용되었습니다');
  };

  // 빠른 액션: 빈 시간 TASK로 채우기
  const handleFillGaps = () => {
    setSchedule((prev) => {
      const updated = { ...prev };
      DAYS_OF_WEEK.forEach((day) => {
        updated[day] = updated[day].map((type) => type || 'TASK');
      });
      return updated;
    });

    alert('빈 시간을 업무 시간으로 채웠습니다');
  };

  // 빠른 액션: 전체 초기화
  const handleReset = () => {
    if (confirm('모든 블록을 삭제하시겠습니까?')) {
      setSchedule(createEmptySchedule());
    }
  };

  return (
    <div className="space-y-6">
      {/* 타입 선택 툴바 */}
      {mode === 'edit' && (
        <div className="flex items-center gap-3 p-4 bg-card rounded-lg border border-neutral-200">
          <span className="text-sm font-medium text-neutral-700">
            선택 타입:
          </span>
          <div className="flex gap-2">
            <Button
              variant={selectedType === 'QUIET' ? 'default' : 'outline'}
              size="sm"
              onClick={() => setSelectedType('QUIET')}
              className={cn(
                selectedType === 'QUIET' && 'bg-neutral-800 hover:bg-neutral-700'
              )}
            >
              🌙 조용시간
            </Button>
            <Button
              variant={selectedType === 'BUSY' ? 'default' : 'outline'}
              size="sm"
              onClick={() => setSelectedType('BUSY')}
              className={cn(
                selectedType === 'BUSY' && 'bg-accent hover:bg-accent/80'
              )}
            >
              🚶 외출
            </Button>
          </div>
          <span className="text-xs text-neutral-500 ml-auto">
            타입을 선택한 후 클릭/드래그하여 시간을 설정하세요
          </span>
        </div>
      )}

      {/* 7일 타임라인 그리드 */}
      <div className="space-y-3">
        {DAYS_OF_WEEK.map((day, index) => (
          <div
            key={day}
            className={cn(
              'p-3 rounded-lg transition-colors',
              selectedDay === day && 'bg-primary/5 border border-primary',
              mode === 'edit' && 'cursor-pointer hover:bg-neutral-50'
            )}
            onClick={() => mode === 'edit' && setSelectedDay(day)}
          >
            <DayTimeline
              day={day}
              hourlySchedule={schedule[day]}
              selectedType={selectedType}
              mode={mode}
              showHourLabels={index === 0} // 첫 줄만 시간 라벨 표시
              onChange={(hourlySchedule) => handleDayScheduleChange(day, hourlySchedule)}
            />
          </div>
        ))}
      </div>

      {/* 빠른 액션 */}
      {mode === 'edit' && showQuickActions && (
        <div className="flex flex-wrap gap-2 p-4 bg-neutral-50 rounded-lg border border-neutral-200">
          <span className="text-sm font-medium text-neutral-700 w-full mb-2">
            빠른 설정:
          </span>

          <Button
            variant="outline"
            size="sm"
            onClick={handleApplyToWeekdays}
            disabled={!selectedDay}
          >
            선택한 요일을 평일에 적용
          </Button>

          <Button
            variant="outline"
            size="sm"
            onClick={handleApplyToWeekend}
            disabled={!selectedDay}
          >
            선택한 요일을 주말에 적용
          </Button>

          <Button
            variant="outline"
            size="sm"
            onClick={handleFillGaps}
          >
            빈 시간을 업무 시간으로 채우기
          </Button>

          <Button
            variant="outline"
            size="sm"
            onClick={handleReset}
            className="ml-auto text-destructive hover:bg-destructive/10"
          >
            전체 초기화
          </Button>

          {selectedDay && (
            <span className="text-xs text-neutral-500 w-full mt-2">
              현재 선택된 요일: <strong>{selectedDay}</strong>
            </span>
          )}
        </div>
      )}
    </div>
  );
}
