'use client';

import { useState } from 'react';
import type { DayOfWeek, TimeBlockType } from '@/types';
import { dayOfWeekToKorean } from '@/types';
import { cn } from '@/lib/utils';

// ========================================
// DayTimeline Component (블록 스타일 UI)
// ========================================

interface DayTimelineProps {
  day: DayOfWeek;
  hourlySchedule: (TimeBlockType | null)[];
  selectedType: TimeBlockType;
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

  const handleMouseDown = (hour: number) => {
    if (mode !== 'edit') return;
    setIsPainting(true);
    handleCellInteraction(hour);
  };

  const handleMouseEnter = (hour: number) => {
    if (isPainting && mode === 'edit') {
      handleCellInteraction(hour);
    }
  };

  const handleMouseUp = () => {
    setIsPainting(false);
  };

  // 타입별 스타일 (블록 느낌)
  const getCellStyle = (type: TimeBlockType | null, hour: number) => {
    const prevType = hour > 0 ? hourlySchedule[hour - 1] : null;
    const nextType = hour < 23 ? hourlySchedule[hour + 1] : null;

    const isFirstOfBlock = type !== prevType;
    const isLastOfBlock = type !== nextType;

    if (!type) {
      return {
        bg: 'bg-white hover:bg-neutral-50',
        border: 'border-neutral-200',
        text: 'text-neutral-400',
        radius: '',
      };
    }

    let bg = '';
    let text = 'text-white font-medium';

    switch (type) {
      case 'QUIET':
        bg = 'bg-neutral-800';
        break;
      case 'BUSY':
        bg = 'bg-accent';
        break;
      case 'TASK':
        bg = 'bg-primary';
        break;
    }

    // 연속된 블록의 경계 처리
    const radius = cn(
      isFirstOfBlock && 'rounded-l-lg',
      isLastOfBlock && 'rounded-r-lg'
    );

    return { bg, border: '', text, radius };
  };

  // 타입별 아이콘
  const getTypeIcon = (type: TimeBlockType | null) => {
    switch (type) {
      case 'QUIET': return '🌙';
      case 'BUSY': return '🚶';
      case 'TASK': return '✅';
      default: return '';
    }
  };

  return (
    <div className="flex flex-col gap-2" onMouseUp={handleMouseUp} onMouseLeave={handleMouseUp}>
      {/* 요일 라벨 + 시간 라벨 */}
      <div className="flex items-center gap-3">
        <span
          className={cn(
            'font-bold text-neutral-800 min-w-[32px] text-center',
            compact ? 'text-sm' : 'text-base'
          )}
        >
          {dayOfWeekToKorean(day)}
        </span>

        {/* 시간 라벨 (주요 시간만 표시) */}
        {showHourLabels && (
          <div className="flex-1 flex justify-between px-1 text-xs text-neutral-500">
            {[0, 6, 12, 18, 24].map((h) => (
              <span key={h} className="w-8 text-center">
                {h}
              </span>
            ))}
          </div>
        )}
      </div>

      {/* 타임라인 그리드 */}
      <div className="flex items-center gap-3">
        <div className="min-w-[32px]" /> {/* 요일 라벨 공간 */}

        <div
          className={cn(
            'flex-1 grid grid-cols-24 gap-0',
            compact ? 'h-10' : 'h-14'
          )}
        >
          {hourlySchedule.map((type, hour) => {
            const style = getCellStyle(type, hour);
            const prevType = hour > 0 ? hourlySchedule[hour - 1] : null;

            return (
              <div
                key={hour}
                className={cn(
                  'flex items-center justify-center transition-all select-none border-y-2',
                  style.bg,
                  style.text,
                  style.radius,
                  // 좌우 테두리는 블록의 시작/끝에만
                  type !== prevType && 'border-l-2',
                  type !== hourlySchedule[hour + 1] && 'border-r-2',
                  // 테두리 색상
                  type === 'QUIET' && 'border-neutral-900',
                  type === 'BUSY' && 'border-accent-dark',
                  type === 'TASK' && 'border-primary-dark',
                  !type && 'border-neutral-200',
                  mode === 'edit' && 'cursor-pointer hover:opacity-80 active:scale-95'
                )}
                onMouseDown={() => handleMouseDown(hour)}
                onMouseEnter={() => handleMouseEnter(hour)}
                title={`${hour}:00 - ${hour + 1}:00`}
              >
                {/* 블록 첫 칸에만 아이콘 표시 */}
                {!compact && type && type !== prevType && (
                  <span className="text-base">
                    {getTypeIcon(type)}
                  </span>
                )}
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
