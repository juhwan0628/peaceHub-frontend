'use client';

import { useState } from 'react';
import type { ScheduleBlock, DayOfWeek, TimeBlockType } from '@/types';
import { DAYS_OF_WEEK } from '@/types';
import {
  getBlocksByDay,
  hasOverlap,
  fillGapsWithTask,
  applyToWeekdays,
  applyToWeekend,
  copyDayToAnother,
} from '@/lib/timetable-utils';
import DayTimeline from './DayTimeline';
import { Button } from './ui/button';
import { cn } from '@/lib/utils';

// ========================================
// TimetableGrid Component
// ========================================

interface TimetableGridProps {
  schedules: ScheduleBlock[];
  onScheduleChange: (schedules: ScheduleBlock[]) => void;
  mode?: 'edit' | 'view';
  showQuickActions?: boolean;
}

export default function TimetableGrid({
  schedules,
  onScheduleChange,
  mode = 'edit',
  showQuickActions = true,
}: TimetableGridProps) {
  const [selectedType, setSelectedType] = useState<TimeBlockType>('QUIET');
  const [selectedDay, setSelectedDay] = useState<DayOfWeek | null>(null);

  // 블록 추가
  const handleBlockAdd = (day: DayOfWeek, startTime: number, endTime: number) => {
    const newBlock: ScheduleBlock = {
      id: crypto.randomUUID(),
      dayOfWeek: day,
      type: selectedType,
      startTime,
      endTime,
    };

    // 겹침 확인
    if (hasOverlap(schedules, newBlock)) {
      alert('시간이 겹칩니다!');
      return;
    }

    onScheduleChange([...schedules, newBlock]);
  };

  // 블록 업데이트
  const handleBlockUpdate = (
    blockId: string,
    updates: Partial<ScheduleBlock>
  ) => {
    const updatedSchedules = schedules.map((block) =>
      block.id === blockId ? { ...block, ...updates } : block
    );

    // 겹침 확인 (자기 자신 제외)
    const updatedBlock = updatedSchedules.find((b) => b.id === blockId);
    if (
      updatedBlock &&
      hasOverlap(schedules, updatedBlock, blockId)
    ) {
      alert('시간이 겹칩니다!');
      return;
    }

    onScheduleChange(updatedSchedules);
  };

  // 블록 삭제
  const handleBlockDelete = (blockId: string) => {
    onScheduleChange(schedules.filter((block) => block.id !== blockId));
  };

  // 빠른 액션: 평일 적용
  const handleApplyToWeekdays = () => {
    if (!selectedDay) {
      alert('먼저 복사할 요일을 선택하세요');
      return;
    }
    const updated = applyToWeekdays(selectedDay, schedules);
    onScheduleChange(updated);
    alert('평일에 적용되었습니다');
  };

  // 빠른 액션: 주말 적용
  const handleApplyToWeekend = () => {
    if (!selectedDay) {
      alert('먼저 복사할 요일을 선택하세요');
      return;
    }
    const updated = applyToWeekend(selectedDay, schedules);
    onScheduleChange(updated);
    alert('주말에 적용되었습니다');
  };

  // 빠른 액션: 전체 초기화
  const handleReset = () => {
    if (confirm('모든 블록을 삭제하시겠습니까?')) {
      onScheduleChange([]);
    }
  };

  // 빠른 액션: TASK로 빈 시간 채우기
  const handleFillGaps = () => {
    let updated = schedules;
    DAYS_OF_WEEK.forEach((day) => {
      updated = fillGapsWithTask(updated, day);
    });
    onScheduleChange(updated);
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
            타입을 선택한 후 드래그하여 블록을 생성하세요
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
              blocks={getBlocksByDay(schedules, day)}
              selectedType={selectedType}
              mode={mode}
              showHourLabels={index === 0} // 첫 줄만 시간 라벨 표시
              onBlockAdd={(start, end) => handleBlockAdd(day, start, end)}
              onBlockUpdate={handleBlockUpdate}
              onBlockDelete={handleBlockDelete}
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
