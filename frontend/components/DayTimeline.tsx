'use client';

import { useState } from 'react';
import type { DayOfWeek, TimeBlockType } from '@/types';
import { dayOfWeekToKorean } from '@/types';
import { cn } from '@/lib/utils';

// ========================================
// DayTimeline Component (시간별 셀 방식)
// ========================================

interface DayTimelineProps {
  day: DayOfWeek;
  hourlySchedule: (TimeBlockType | null)[]; // 24개 시간의 타입 배열
  selectedType: TimeBlockType; // 현재 선택된 타입
  mode?: 'edit' | 'view';
  showHourLabels?: boolean;
  compact?: boolean;
  onChange?: (hourlySchedule: (TimeBlockType | null)[]) => void;
}

export default function DayTimeline({
  day,
  hourlySchedule,
  selectedType,
  mode = 'view',
  showHourLabels = true,
  compact = false,
  onChange,
}: DayTimelineProps) {
  const [isPainting, setIsPainting] = useState(false);

  // 셀 클릭/드래그로 페인팅
  const handleCellInteraction = (hour: number) => {
    if (mode !== 'edit' || !onChange) return;

    const newSchedule = [...hourlySchedule];

    // 같은 타입이면 지우기 (토글)
    if (newSchedule[hour] === selectedType) {
      newSchedule[hour] = null;
    } else {
      newSchedule[hour] = selectedType;
    }

    onChange(newSchedule);
  };

  // 마우스 다운 (페인팅 시작)
  const handleMouseDown = (hour: number) => {
    if (mode !== 'edit') return;
    setIsPainting(true);
    handleCellInteraction(hour);
  };

  // 마우스 엔터 (드래그 중)
  const handleMouseEnter = (hour: number) => {
    if (isPainting && mode === 'edit') {
      handleCellInteraction(hour);
    }
  };

  // 마우스 업 (페인팅 종료)
  const handleMouseUp = () => {
    setIsPainting(false);
  };

  // 타입별 스타일
  const getCellStyle = (type: TimeBlockType | null) => {
    if (!type) return 'bg-white hover:bg-neutral-100';

    switch (type) {
      case 'QUIET':
        return 'bg-neutral-800 text-white';
      case 'BUSY':
        return 'bg-accent text-white';
      case 'TASK':
        return 'bg-primary text-white';
      default:
        return 'bg-neutral-200';
    }
  };

  // 타입별 라벨
  const getTypeLabel = (type: TimeBlockType | null) => {
    if (!type) return '';
    switch (type) {
      case 'QUIET':
        return '조용';
      case 'BUSY':
        return '외출';
      case 'TASK':
        return '업무';
      default:
        return '';
    }
  };

  return (
    <div className="flex flex-col gap-1" onMouseUp={handleMouseUp} onMouseLeave={handleMouseUp}>
      {/* 요일 라벨 */}
      <div className="flex items-center gap-2">
        <span
          className={cn(
            'text-sm font-medium text-neutral-700 w-8 text-center',
            compact && 'text-xs'
          )}
        >
          {dayOfWeekToKorean(day)}
        </span>

        {/* 시간 라벨 */}
        {showHourLabels && (
          <div className="grid grid-cols-24 gap-0 flex-1">
            {Array.from({ length: 24 }, (_, i) => (
              <div key={i} className="text-center text-xs text-neutral-500">
                {i}
              </div>
            ))}
          </div>
        )}
      </div>

      {/* 타임라인 셀 그리드 */}
      <div className="flex items-center gap-2">
        <div className="w-8" /> {/* 요일 라벨 공간 */}

        <div
          className={cn(
            'grid grid-cols-24 gap-0.5 flex-1',
            compact ? 'h-8' : 'h-12'
          )}
        >
          {hourlySchedule.map((type, hour) => (
            <div
              key={hour}
              className={cn(
                'rounded-sm border border-neutral-300 flex items-center justify-center text-xs font-medium transition-all select-none',
                getCellStyle(type),
                mode === 'edit' && 'cursor-pointer hover:opacity-80'
              )}
              onMouseDown={() => handleMouseDown(hour)}
              onMouseEnter={() => handleMouseEnter(hour)}
              title={`${hour}:00 - ${hour + 1}:00`}
            >
              {!compact && type && (
                <span className="text-[10px]">{getTypeLabel(type)}</span>
              )}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
