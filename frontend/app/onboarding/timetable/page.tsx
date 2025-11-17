'use client';

import { useState, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { weeklyHourlyScheduleToBlocks, fillAllGapsWithTask } from '@/lib/timetable-utils';
import { scheduleApi, getErrorMessage } from '@/lib/api';
import TimetableGrid, { type WeeklyHourlySchedule } from '@/components/TimetableGrid';
import { Button } from '@/components/ui/button';

export default function TimetablePage() {
  const router = useRouter();
  const [schedule, setSchedule] = useState<WeeklyHourlySchedule | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');

  const handleScheduleChange = useCallback((newSchedule: WeeklyHourlySchedule) => {
    setSchedule(newSchedule);
    setError('');
  }, []);

  const handleSubmit = async () => {
    if (!schedule) {
      alert('스케줄을 설정해주세요');
      return;
    }

    setIsLoading(true);
    setError('');

    try {
      // 시간별 배열 → 블록 배열로 변환
      let blocks = weeklyHourlyScheduleToBlocks(schedule);

      // 빈 시간을 TASK로 자동 채우기
      blocks = fillAllGapsWithTask(blocks);

      // API 호출
      const payload = blocks.map((block) => ({
        dayOfWeek: block.dayOfWeek,
        type: block.type,
        startTime: block.startTime,
        endTime: block.endTime,
      }));

      await scheduleApi.postSchedule(payload);

      alert('타임테이블이 저장되었습니다! 🎉');
      // router.push('/dashboard');

      console.log('Saved blocks:', blocks);
    } catch (err) {
      setError(getErrorMessage(err));
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="mx-auto max-w-7xl">
      {/* Header */}
      <div className="mb-10 text-center">
        <h1 className="text-4xl font-bold bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent mb-3">
          주간 타임테이블 설정
        </h1>
        <p className="text-lg text-neutral-600 mb-2">
          일주일 동안의 <strong className="text-neutral-800">조용시간</strong>과{' '}
          <strong className="text-neutral-800">외출 시간</strong>을 설정하세요
        </p>
        <p className="text-sm text-neutral-500">
          나머지 빈 시간은 자동으로 <span className="text-primary font-semibold">업무 가능 시간</span>으로 설정됩니다
        </p>
      </div>

      {/* Timetable Grid */}
      <TimetableGrid
        onScheduleChange={handleScheduleChange}
        mode="edit"
        showQuickActions={true}
      />

      {/* Error Message */}
      {error && (
        <div className="mt-8 p-5 bg-red-50 border-2 border-red-200 rounded-xl">
          <div className="flex items-start gap-3">
            <span className="text-2xl">❌</span>
            <div>
              <h4 className="text-sm font-bold text-red-800 mb-1">
                저장 실패
              </h4>
              <p className="text-sm text-red-700">{error}</p>
            </div>
          </div>
        </div>
      )}

      {/* Submit Button */}
      <div className="mt-10 flex justify-center">
        <Button
          onClick={handleSubmit}
          disabled={isLoading || !schedule}
          className="bg-gradient-to-r from-primary to-primary-dark text-white hover:shadow-xl transition-all rounded-full h-14 px-10 text-lg font-bold disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {isLoading ? '저장 중...' : '💾 저장하고 시작하기'}
        </Button>
      </div>

      {/* Help Section */}
      <div className="mt-12 p-6 bg-gradient-to-br from-blue-50 to-indigo-50 rounded-2xl border-2 border-blue-100">
        <h4 className="text-base font-bold text-blue-900 mb-3 flex items-center gap-2">
          <span className="text-2xl">💡</span>
          사용 방법
        </h4>
        <ul className="text-sm text-blue-800 space-y-2">
          <li className="flex items-start gap-2">
            <span className="text-primary font-bold">1.</span>
            <span>상단에서 타입(🌙 조용시간 / 🚶 외출)을 선택하세요</span>
          </li>
          <li className="flex items-start gap-2">
            <span className="text-primary font-bold">2.</span>
            <span>타임라인의 시간을 클릭하거나 드래그하여 설정하세요</span>
          </li>
          <li className="flex items-start gap-2">
            <span className="text-primary font-bold">3.</span>
            <span>같은 타입을 다시 클릭하면 지워집니다</span>
          </li>
          <li className="flex items-start gap-2">
            <span className="text-primary font-bold">4.</span>
            <span>요일을 선택하고 <strong>빠른 설정</strong>으로 평일/주말에 복사할 수 있어요</span>
          </li>
          <li className="flex items-start gap-2">
            <span className="text-primary font-bold">5.</span>
            <span>빈 시간은 저장 시 자동으로 <strong className="text-primary">업무 시간</strong>으로 변환됩니다</span>
          </li>
        </ul>
      </div>
    </div>
  );
}
