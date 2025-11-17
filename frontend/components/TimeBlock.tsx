import type { TimeBlockType } from '@/types';
import { minutesToTime } from '@/types';
import { minutesToGridColumn } from '@/lib/timetable-utils';
import { cn } from '@/lib/utils';

// ========================================
// TimeBlock Component
// ========================================

interface TimeBlockProps {
  type: TimeBlockType;
  startTime: number; // 분 단위
  endTime: number; // 분 단위
  isEditing?: boolean;
  isResizing?: boolean;
  onDelete?: () => void;
  onResizeStart?: (edge: 'start' | 'end') => void;
  className?: string;
}

export default function TimeBlock({
  type,
  startTime,
  endTime,
  isEditing = false,
  isResizing = false,
  onDelete,
  onResizeStart,
  className,
}: TimeBlockProps) {
  // Grid column 계산
  const startCol = minutesToGridColumn(startTime);
  const endCol = minutesToGridColumn(endTime);

  // 타입별 스타일
  const getTypeStyles = () => {
    switch (type) {
      case 'QUIET':
        return 'bg-neutral-800 text-white border-neutral-700';
      case 'BUSY':
        return 'bg-accent text-white border-accent-dark';
      case 'TASK':
        return 'bg-primary text-white border-primary-dark';
      default:
        return 'bg-neutral-200 text-neutral-800';
    }
  };

  // 타입별 라벨
  const getTypeLabel = () => {
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
    <div
      className={cn(
        'relative h-full rounded-md border-2 flex items-center justify-center text-xs font-medium transition-all',
        getTypeStyles(),
        isResizing && 'opacity-70 cursor-col-resize',
        isEditing && 'hover:opacity-80',
        className
      )}
      style={{
        gridColumn: `${startCol} / ${endCol}`,
      }}
      title={`${minutesToTime(startTime)} - ${minutesToTime(endTime)}`}
    >
      {/* 블록 라벨 */}
      <span className="select-none pointer-events-none">
        {getTypeLabel()}
      </span>

      {/* 편집 모드: 리사이즈 핸들 */}
      {isEditing && onResizeStart && (
        <>
          {/* 왼쪽 핸들 */}
          <div
            className="absolute left-0 top-0 bottom-0 w-2 cursor-col-resize hover:bg-white/30 z-10"
            onMouseDown={(e) => {
              e.stopPropagation();
              onResizeStart('start');
            }}
          />

          {/* 오른쪽 핸들 */}
          <div
            className="absolute right-0 top-0 bottom-0 w-2 cursor-col-resize hover:bg-white/30 z-10"
            onMouseDown={(e) => {
              e.stopPropagation();
              onResizeStart('end');
            }}
          />
        </>
      )}

      {/* 편집 모드: 삭제 버튼 */}
      {isEditing && onDelete && (
        <button
          onClick={(e) => {
            e.stopPropagation();
            onDelete();
          }}
          className="absolute -top-2 -right-2 w-5 h-5 bg-destructive text-white rounded-full flex items-center justify-center text-xs hover:bg-destructive/80 z-20"
          title="삭제"
        >
          ×
        </button>
      )}
    </div>
  );
}
