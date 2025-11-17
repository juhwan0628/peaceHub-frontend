'use client';

import { useState, useRef, useEffect } from 'react';
import type { DayOfWeek, ScheduleBlock, TimeBlockType } from '@/types';
import { dayOfWeekToKorean, minutesToTime } from '@/types';
import { hourToMinutes, minutesToGridColumn } from '@/lib/timetable-utils';
import TimeBlock from './TimeBlock';
import { cn } from '@/lib/utils';

// ========================================
// DayTimeline Component
// ========================================

interface DayTimelineProps {
  day: DayOfWeek;
  blocks: ScheduleBlock[];
  selectedType: TimeBlockType; // 현재 선택된 타입 (툴바에서)
  mode?: 'edit' | 'view';
  showHourLabels?: boolean;
  compact?: boolean;
  onBlockAdd?: (startTime: number, endTime: number) => void;
  onBlockUpdate?: (blockId: string, updates: Partial<ScheduleBlock>) => void;
  onBlockDelete?: (blockId: string) => void;
}

export default function DayTimeline({
  day,
  blocks,
  selectedType,
  mode = 'view',
  showHourLabels = true,
  compact = false,
  onBlockAdd,
  onBlockUpdate,
  onBlockDelete,
}: DayTimelineProps) {
  const [dragState, setDragState] = useState<{
    isActive: boolean;
    startHour: number;
    endHour: number;
  }>({ isActive: false, startHour: 0, endHour: 0 });

  const [resizeState, setResizeState] = useState<{
    isActive: boolean;
    blockId: string;
    edge: 'start' | 'end';
    originalStart: number;
    originalEnd: number;
  } | null>(null);

  const timelineRef = useRef<HTMLDivElement>(null);

  // 드래그로 블록 생성
  const handleMouseDown = (hour: number) => {
    if (mode !== 'edit') return;
    setDragState({ isActive: true, startHour: hour, endHour: hour });
  };

  const handleMouseMove = (hour: number) => {
    if (dragState.isActive) {
      setDragState((prev) => ({ ...prev, endHour: hour }));
    }
  };

  const handleMouseUp = () => {
    if (!dragState.isActive) return;

    const { startHour, endHour } = dragState;
    const [start, end] =
      startHour <= endHour ? [startHour, endHour + 1] : [endHour, startHour + 1];

    const startTime = hourToMinutes(start);
    const endTime = hourToMinutes(end);

    if (onBlockAdd && startTime < endTime) {
      onBlockAdd(startTime, endTime);
    }

    setDragState({ isActive: false, startHour: 0, endHour: 0 });
  };

  // 리사이즈 시작
  const handleResizeStart = (blockId: string, edge: 'start' | 'end') => {
    const block = blocks.find((b) => b.id === blockId);
    if (!block) return;

    setResizeState({
      isActive: true,
      blockId,
      edge,
      originalStart: block.startTime,
      originalEnd: block.endTime,
    });
  };

  // 전역 마우스 이벤트로 리사이즈 처리
  useEffect(() => {
    if (!resizeState?.isActive) return;

    const handleGlobalMouseMove = (e: MouseEvent) => {
      if (!timelineRef.current) return;

      const rect = timelineRef.current.getBoundingClientRect();
      const x = e.clientX - rect.left;
      const hour = Math.floor((x / rect.width) * 24);
      const clampedHour = Math.max(0, Math.min(23, hour));

      const newTime = hourToMinutes(clampedHour);

      if (resizeState.edge === 'start') {
        const newStart = Math.min(newTime, resizeState.originalEnd - 60);
        if (onBlockUpdate) {
          onBlockUpdate(resizeState.blockId, { startTime: newStart });
        }
      } else {
        const newEnd = Math.max(newTime + 60, resizeState.originalStart + 60);
        if (onBlockUpdate) {
          onBlockUpdate(resizeState.blockId, { endTime: newEnd });
        }
      }
    };

    const handleGlobalMouseUp = () => {
      setResizeState(null);
    };

    document.addEventListener('mousemove', handleGlobalMouseMove);
    document.addEventListener('mouseup', handleGlobalMouseUp);

    return () => {
      document.removeEventListener('mousemove', handleGlobalMouseMove);
      document.removeEventListener('mouseup', handleGlobalMouseUp);
    };
  }, [resizeState, onBlockUpdate]);

  // 드래그 미리보기 영역 계산
  const getPreviewArea = () => {
    if (!dragState.isActive) return null;

    const { startHour, endHour } = dragState;
    const [start, end] = startHour <= endHour ? [startHour, endHour] : [endHour, startHour];

    return {
      startCol: start + 1,
      endCol: end + 2,
    };
  };

  const previewArea = getPreviewArea();

  return (
    <div className="flex flex-col gap-1">
      {/* 요일 라벨 */}
      <div className="flex items-center gap-2">
        <span className={cn(
          'text-sm font-medium text-neutral-700 w-8',
          compact && 'text-xs'
        )}>
          {dayOfWeekToKorean(day)}
        </span>

        {/* 시간 라벨 */}
        {showHourLabels && (
          <div className="grid grid-cols-24 gap-0 flex-1 text-xs text-neutral-500">
            {Array.from({ length: 24 }, (_, i) => (
              <div key={i} className="text-center">
                {i}
              </div>
            ))}
          </div>
        )}
      </div>

      {/* 타임라인 그리드 */}
      <div className="flex items-center gap-2">
        <div className="w-8" /> {/* 요일 라벨 공간 */}

        <div
          ref={timelineRef}
          className={cn(
            'relative grid grid-cols-24 gap-0 flex-1 bg-neutral-100 rounded-lg overflow-hidden border border-neutral-300',
            compact ? 'h-8' : 'h-12'
          )}
          onMouseUp={handleMouseUp}
          onMouseLeave={handleMouseUp}
        >
          {/* 시간 칸 (드래그 영역) */}
          {Array.from({ length: 24 }, (_, hour) => (
            <div
              key={hour}
              className={cn(
                'border-r border-neutral-200 last:border-r-0',
                mode === 'edit' && 'cursor-crosshair hover:bg-neutral-200'
              )}
              onMouseDown={() => handleMouseDown(hour)}
              onMouseMove={() => handleMouseMove(hour)}
            />
          ))}

          {/* 블록 레이어 */}
          <div className="absolute inset-0 grid grid-cols-24 gap-0 pointer-events-none">
            {blocks.map((block) => (
              <div key={block.id} className="pointer-events-auto">
                <TimeBlock
                  type={block.type}
                  startTime={block.startTime}
                  endTime={block.endTime}
                  isEditing={mode === 'edit'}
                  isResizing={resizeState?.blockId === block.id}
                  onDelete={() => onBlockDelete?.(block.id!)}
                  onResizeStart={(edge) => handleResizeStart(block.id!, edge)}
                />
              </div>
            ))}
          </div>

          {/* 드래그 미리보기 */}
          {previewArea && (
            <div
              className="absolute top-0 bottom-0 bg-primary/30 border-2 border-primary border-dashed pointer-events-none"
              style={{
                gridColumn: `${previewArea.startCol} / ${previewArea.endCol}`,
              }}
            />
          )}
        </div>
      </div>
    </div>
  );
}
