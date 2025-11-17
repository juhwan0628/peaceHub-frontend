'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import type { ScheduleBlock } from '@/types';
import { dayOfWeekToKorean } from '@/types';
import { validateFullWeekCoverage, fillAllGapsWithTask } from '@/lib/timetable-utils';
import { scheduleApi, getErrorMessage } from '@/lib/api';
import TimetableGrid from '@/components/TimetableGrid';
import { Button } from '@/components/ui/button';

export default function TimetablePage() {
  const router = useRouter();
  const [schedules, setSchedules] = useState<ScheduleBlock[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [warning, setWarning] = useState('');

  // 24시간 커버리지 검증
  const handleValidate = () => {
    const { isValid, missingDays } = validateFullWeekCoverage(schedules);

    if (!isValid) {
      const dayNames = missingDays.map(dayOfWeekToKorean).join(', ');
      setWarning(
        `다음 요일의 24시간이 완전히 채워지지 않았습니다: ${dayNames}. "빈 시간을 업무 시간으로 채우기" 버튼을 눌러 자동으로 채울 수 있습니다.`
      );
      return false;
    }

    setWarning('');
    return true;
  };

  // 저장 및 제출
  const handleSubmit = async () => {
    setError('');

    // 검증
    const isValid = handleValidate();

    // 경고만 표시하고 계속 진행 가능
    if (!isValid) {
      const confirmed = confirm(
        '일부 요일의 24시간이 완전히 채워지지 않았습니다. 그래도 계속하시겠습니까?\n\n자동으로 빈 시간을 업무 시간으로 채우려면 "취소"를 누르고 "빈 시간을 업무 시간으로 채우기" 버튼을 사용하세요.'
      );

      if (!confirmed) {
        return;
      }
    }

    // 빈 시간을 TASK로 자동 채우기
    const completedSchedules = fillAllGapsWithTask(schedules);

    setIsLoading(true);

    try {
      // API 호출
      const payload = completedSchedules.map((block) => ({
        dayOfWeek: block.dayOfWeek,
        type: block.type,
        startTime: block.startTime,
        endTime: block.endTime,
      }));

      await scheduleApi.postSchedule(payload);

      // 성공 시 대시보드로 이동 (TODO: 대시보드 페이지 구현 후)
      alert('타임테이블이 저장되었습니다!');
      // router.push('/dashboard');

      // 임시: 성공 메시지만 표시
      console.log('Saved schedules:', completedSchedules);
    } catch (err) {
      setError(getErrorMessage(err));
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="mx-auto max-w-6xl">
      {/* Title */}
      <div className="mb-8 text-center">
        <h2 className="mb-2 text-3xl text-title">주간 타임테이블 설정</h2>
        <p className="text-body">
          일주일 동안의 조용시간과 외출 시간을 설정하세요
        </p>
        <p className="text-sm text-subtitle mt-2">
          나머지 빈 시간은 자동으로 <strong>업무 가능 시간</strong>으로 설정됩니다
        </p>
      </div>

      {/* Timetable Grid */}
      <TimetableGrid
        schedules={schedules}
        onScheduleChange={setSchedules}
        mode="edit"
        showQuickActions={true}
      />

      {/* 경고 메시지 */}
      {warning && (
        <div className="mt-6 p-4 bg-amber-50 border border-amber-200 rounded-lg">
          <div className="flex items-start gap-2">
            <span className="text-amber-600 text-xl">⚠️</span>
            <div>
              <h4 className="text-sm font-semibold text-amber-800 mb-1">
                경고
              </h4>
              <p className="text-sm text-amber-700">{warning}</p>
            </div>
          </div>
        </div>
      )}

      {/* 에러 메시지 */}
      {error && (
        <div className="mt-6 p-4 bg-destructive/10 border border-destructive rounded-lg">
          <div className="flex items-start gap-2">
            <span className="text-destructive text-xl">❌</span>
            <div>
              <h4 className="text-sm font-semibold text-destructive mb-1">
                오류
              </h4>
              <p className="text-sm text-destructive">{error}</p>
            </div>
          </div>
        </div>
      )}

      {/* 제출 버튼 */}
      <div className="mt-8 flex justify-center">
        <Button
          onClick={handleSubmit}
          disabled={isLoading || schedules.length === 0}
          className="bg-primary text-white hover:bg-primary-light transition-colors rounded-button h-12 px-8 text-base font-medium"
        >
          {isLoading ? '저장 중...' : '저장하고 시작하기'}
        </Button>
      </div>

      {/* 도움말 */}
      <div className="mt-8 p-4 bg-neutral-50 rounded-lg border border-neutral-200">
        <h4 className="text-sm font-semibold text-neutral-800 mb-2">
          💡 사용 방법
        </h4>
        <ul className="text-sm text-neutral-700 space-y-1">
          <li>1. 상단에서 타입(조용시간/외출)을 선택하세요</li>
          <li>2. 타임라인에서 드래그하여 블록을 생성하세요</li>
          <li>3. 블록의 양 끝을 드래그하여 시간을 조정할 수 있습니다</li>
          <li>4. 요일을 클릭하고 "빠른 설정" 버튼으로 쉽게 복사할 수 있습니다</li>
          <li>5. 나머지 빈 시간은 자동으로 업무 가능 시간으로 설정됩니다</li>
        </ul>
      </div>
    </div>
  );
}
