'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { useUserStore } from '@/store/userStore';
import { authApi } from '@/lib/api';

export default function ProfilePage() {
  const router = useRouter();
  const { user, setUser } = useUserStore();
  const [name, setName] = useState('');
  const [isLoading, setIsLoading] = useState(true);

  // 사용자 정보 로드
  useEffect(() => {
    const loadUser = async () => {
      try {
        const response = await authApi.getCurrentUser();
        setUser(response.user);
        setName(response.user.name || '');
      } catch (error) {
        console.error('Failed to load user:', error);
        router.push('/login');
      } finally {
        setIsLoading(false);
      }
    };

    loadUser();
  }, [setUser, router]);

  const handleNext = () => {
    if (!name.trim()) {
      alert('이름을 입력해주세요');
      return;
    }

    // Note: 백엔드에 이름 업데이트 API가 없으므로, 일단 다음 단계로 진행
    // 실제로는 PUT /api/users/me 같은 API가 필요할 수 있음
    router.push('/onboarding/room');
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-20">
        <p className="text-subtitle">로딩 중...</p>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-lg">
      {/* Title */}
      <div className="mb-8 text-center">
        <h2 className="mb-2 text-3xl text-title">프로필 설정</h2>
        <p className="text-body">기본 정보를 입력해주세요</p>
      </div>

      {/* Form Card */}
      <div className="rounded-card bg-card p-8 shadow-card">
        <div className="space-y-6">
          {/* Name Input */}
          <div>
            <label
              htmlFor="name"
              className="mb-2 block text-sm font-medium text-title"
            >
              이름 <span className="text-destructive">*</span>
            </label>
            <Input
              id="name"
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="홍길동"
              className="h-12"
            />
            <p className="mt-2 text-xs text-subtitle">
              룸메이트들에게 표시될 이름입니다
            </p>
          </div>

          {/* Email Display (Read-only) */}
          <div>
            <label className="mb-2 block text-sm font-medium text-title">
              이메일
            </label>
            <div className="flex h-12 items-center rounded-lg border border-border bg-neutral-100 px-4 text-subtitle">
              {user?.email}
            </div>
            <p className="mt-2 text-xs text-subtitle">
              Google 계정에서 자동으로 가져온 이메일입니다
            </p>
          </div>
        </div>

        {/* Next Button */}
        <Button
          onClick={handleNext}
          className="mt-8 w-full bg-primary text-white hover:bg-primary-light transition-colors rounded-button h-12 text-base font-medium"
          disabled={!name.trim()}
        >
          다음
        </Button>
      </div>

      {/* Help Text */}
      <p className="mt-6 text-center text-sm text-subtitle">
        💡 언제든지 설정에서 프로필을 수정할 수 있습니다
      </p>
    </div>
  );
}
