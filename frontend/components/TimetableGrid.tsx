'use client';

import { useState, useEffect } from 'react';
import type { DayOfWeek, TimeBlockType } from '@/types';
import { DAYS_OF_WEEK } from '@/types';
import DayTimeline from './DayTimeline';
import { Button } from './ui/button';
import { cn } from '@/lib/utils';

// ========================================
// TimetableGrid Component
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

    setSelectedDay(null);
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

    setSelectedDay(null);
  };

  // 빠른 액션: 전체 초기화
  const handleReset = () => {
    if (confirm('모든 설정을 초기화하시겠습니까?')) {
      setSchedule(createEmptySchedule());
      setSelectedDay(null);
    }
  };

  return (
    <div className="space-y-8">
      {/* 타입 선택 툴바 */}
      {mode === 'edit' && (
        <div className="bg-gradient-to-r from-neutral-50 to-neutral-100 rounded-xl p-6 border border-neutral-200 shadow-sm">
          <div className="flex items-center justify-between flex-wrap gap-4">
            <div className="flex items-center gap-3">
              <span className="text-sm font-semibold text-neutral-700">
                시간 타입:
              </span>
              <div className="flex gap-2">
                <Button
                  variant={selectedType === 'QUIET' ? 'default' : 'outline'}
                  size="sm"
                  onClick={() => setSelectedType('QUIET')}
                  className={cn(
                    'px-4 py-2 font-medium transition-all',
                    selectedType === 'QUIET'
                      ? 'bg-neutral-800 hover:bg-neutral-700 text-white shadow-md'
                      : 'hover:bg-neutral-100'
                  )}
                >
                  🌙 조용시간
                </Button>
                <Button
                  variant={selectedType === 'BUSY' ? 'default' : 'outline'}
                  size="sm"
                  onClick={() => setSelectedType('BUSY')}
                  className={cn(
                    'px-4 py-2 font-medium transition-all',
                    selectedType === 'BUSY'
                      ? 'bg-accent hover:bg-accent/90 text-white shadow-md'
                      : 'hover:bg-accent/10'
                  )}
                >
                  🚶 외출
                </Button>
              </div>
            </div>
            <span className="text-xs text-neutral-500">
              💡 선택한 타입을 클릭하거나 드래그하여 시간을 설정하세요
            </span>
          </div>
        </div>
      )}

      {/* 7일 타임라인 그리드 */}
      <div className="space-y-4">
        {DAYS_OF_WEEK.map((day, index) => (
          <div
            key={day}
            className={cn(
              'rounded-xl p-4 transition-all duration-200',
              selectedDay === day
                ? 'bg-primary/10 border-2 border-primary shadow-lg'
                : 'bg-white border-2 border-transparent hover:border-neutral-200',
              mode === 'edit' && 'cursor-pointer'
            )}
            onClick={() => mode === 'edit' && setSelectedDay(day)}
          >
            <DayTimeline
              day={day}
              hourlySchedule={schedule[day]}
              selectedType={selectedType}
              mode={mode}
              showHourLabels={index === 0}
              onChange={(hourlySchedule) => handleDayScheduleChange(day, hourlySchedule)}
            />
          </div>
        ))}
      </div>

      {/* 빠른 액션 */}
      {mode === 'edit' && showQuickActions && (
        <div className="bg-white rounded-xl p-6 border-2 border-neutral-200 shadow-sm">
          <h3 className="text-sm font-semibold text-neutral-800 mb-4">
            ⚡ 빠른 설정
          </h3>

          <div className="flex flex-wrap gap-3">
            <Button
              variant="outline"
              size="sm"
              onClick={handleApplyToWeekdays}
              disabled={!selectedDay}
              className="border-primary text-primary hover:bg-primary hover:text-white disabled:opacity-50"
            >
              📅 선택한 요일을 평일에 적용
            </Button>

            <Button
              variant="outline"
              size="sm"
              onClick={handleApplyToWeekend}
              disabled={!selectedDay}
              className="border-accent text-accent hover:bg-accent hover:text-white disabled:opacity-50"
            >
              🌴 선택한 요일을 주말에 적용
            </Button>

            <Button
              variant="outline"
              size="sm"
              onClick={handleReset}
              className="ml-auto border-destructive text-destructive hover:bg-destructive hover:text-white"
            >
              🗑️ 전체 초기화
            </Button>
          </div>

          {selectedDay && (
            <p className="text-xs text-neutral-600 mt-4 bg-primary/5 p-3 rounded-lg border border-primary/20">
              ✅ 현재 선택: <strong>{selectedDay}</strong> (위 버튼을 눌러 다른 요일에 적용)
            </p>
          )}
        </div>
      )}
    </div>
  );
}
