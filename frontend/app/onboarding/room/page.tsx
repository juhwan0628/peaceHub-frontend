'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card } from '@/components/ui/card';
import { roomApi, getErrorMessage } from '@/lib/api';
import { useRoomStore } from '@/store/roomStore';
import RoomCodeDisplay from '@/components/RoomCodeDisplay';

type Mode = 'select' | 'create' | 'join';

export default function RoomPage() {
  const router = useRouter();
  const { setRoom } = useRoomStore();

  const [mode, setMode] = useState<Mode>('select');
  const [roomName, setRoomName] = useState('');
  const [inviteCode, setInviteCode] = useState('');
  const [createdCode, setCreatedCode] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');

  // 방 생성
  const handleCreateRoom = async () => {
    if (!roomName.trim()) {
      setError('방 이름을 입력해주세요');
      return;
    }

    setIsLoading(true);
    setError('');

    try {
      const response = await roomApi.createRoom({ name: roomName });
      setRoom(response);
      setCreatedCode(response.inviteCode);
      // 생성 성공 시 코드를 표시하고, 다음 단계로 진행
    } catch (err) {
      setError(getErrorMessage(err));
    } finally {
      setIsLoading(false);
    }
  };

  // 방 참여
  const handleJoinRoom = async () => {
    if (!inviteCode.trim()) {
      setError('초대 코드를 입력해주세요');
      return;
    }

    if (inviteCode.length !== 6) {
      setError('초대 코드는 6자리입니다');
      return;
    }

    setIsLoading(true);
    setError('');

    try {
      const response = await roomApi.joinRoom({ inviteCode });
      setRoom(response);
      // 참여 성공 시 다음 단계로
      router.push('/onboarding/timetable');
    } catch (err) {
      const message = getErrorMessage(err);
      if (message.includes('404') || message.includes('invalid')) {
        setError('유효하지 않은 초대 코드입니다');
      } else if (message.includes('409') || message.includes('already')) {
        setError('이미 다른 방에 속해 있습니다');
      } else {
        setError(message);
      }
    } finally {
      setIsLoading(false);
    }
  };

  // 코드 표시 후 다음 단계로
  const handleNext = () => {
    router.push('/onboarding/timetable');
  };

  // 선택 화면
  if (mode === 'select') {
    return (
      <div className="mx-auto max-w-3xl">
        {/* Title */}
        <div className="mb-8 text-center">
          <h2 className="mb-2 text-3xl text-title">방 선택</h2>
          <p className="text-body">새로운 방을 만들거나 기존 방에 참여하세요</p>
        </div>

        {/* Options */}
        <div className="grid gap-6 md:grid-cols-2">
          {/* Create Room Card */}
          <Card
            className="cursor-pointer rounded-card p-8 shadow-card hover:shadow-lg hover:border-primary transition-all"
            onClick={() => setMode('create')}
          >
            <div className="text-center">
              <div className="mb-4 flex justify-center">
                <div className="flex h-20 w-20 items-center justify-center rounded-full bg-primary/10">
                  <svg
                    className="h-10 w-10 text-primary"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M12 6v6m0 0v6m0-6h6m-6 0H6"
                    />
                  </svg>
                </div>
              </div>
              <h3 className="mb-2 text-xl text-title font-semibold">방 만들기</h3>
              <p className="text-sm text-subtitle">
                새로운 방을 만들고 룸메이트를 초대하세요
              </p>
            </div>
          </Card>

          {/* Join Room Card */}
          <Card
            className="cursor-pointer rounded-card p-8 shadow-card hover:shadow-lg hover:border-primary transition-all"
            onClick={() => setMode('join')}
          >
            <div className="text-center">
              <div className="mb-4 flex justify-center">
                <div className="flex h-20 w-20 items-center justify-center rounded-full bg-accent/10">
                  <svg
                    className="h-10 w-10 text-accent"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1"
                    />
                  </svg>
                </div>
              </div>
              <h3 className="mb-2 text-xl text-title font-semibold">방 참여</h3>
              <p className="text-sm text-subtitle">
                초대 코드를 입력하여 기존 방에 참여하세요
              </p>
            </div>
          </Card>
        </div>
      </div>
    );
  }

  // 방 생성 화면
  if (mode === 'create') {
    return (
      <div className="mx-auto max-w-lg">
        <Button
          variant="ghost"
          onClick={() => setMode('select')}
          className="mb-6"
        >
          ← 뒤로
        </Button>

        <div className="mb-8 text-center">
          <h2 className="mb-2 text-3xl text-title">방 만들기</h2>
          <p className="text-body">방 이름을 입력하세요</p>
        </div>

        <div className="rounded-card bg-card p-8 shadow-card">
          {!createdCode ? (
            <>
              <div className="space-y-6">
                <div>
                  <label
                    htmlFor="roomName"
                    className="mb-2 block text-sm font-medium text-title"
                  >
                    방 이름 <span className="text-destructive">*</span>
                  </label>
                  <Input
                    id="roomName"
                    type="text"
                    value={roomName}
                    onChange={(e) => setRoomName(e.target.value)}
                    placeholder="예: 403호"
                    className="h-12"
                    disabled={isLoading}
                  />
                </div>

                {error && (
                  <div className="rounded-lg bg-destructive/10 px-4 py-3 text-sm text-destructive">
                    {error}
                  </div>
                )}
              </div>

              <Button
                onClick={handleCreateRoom}
                className="mt-8 w-full bg-primary text-white hover:bg-primary-light transition-colors rounded-button h-12 text-base font-medium"
                disabled={isLoading || !roomName.trim()}
              >
                {isLoading ? '생성 중...' : '방 만들기'}
              </Button>
            </>
          ) : (
            <>
              <div className="text-center mb-6">
                <div className="mb-4 flex justify-center">
                  <div className="flex h-16 w-16 items-center justify-center rounded-full bg-primary/10">
                    <svg
                      className="h-8 w-8 text-primary"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M5 13l4 4L19 7"
                      />
                    </svg>
                  </div>
                </div>
                <h3 className="text-xl text-title font-semibold mb-2">
                  방이 생성되었습니다!
                </h3>
                <p className="text-subtitle">
                  아래 코드를 룸메이트들에게 공유하세요
                </p>
              </div>

              <RoomCodeDisplay code={createdCode} />

              <Button
                onClick={handleNext}
                className="mt-8 w-full bg-primary text-white hover:bg-primary-light transition-colors rounded-button h-12 text-base font-medium"
              >
                다음
              </Button>
            </>
          )}
        </div>
      </div>
    );
  }

  // 방 참여 화면
  return (
    <div className="mx-auto max-w-lg">
      <Button
        variant="ghost"
        onClick={() => setMode('select')}
        className="mb-6"
      >
        ← 뒤로
      </Button>

      <div className="mb-8 text-center">
        <h2 className="mb-2 text-3xl text-title">방 참여</h2>
        <p className="text-body">초대 코드를 입력하세요</p>
      </div>

      <div className="rounded-card bg-card p-8 shadow-card">
        <div className="space-y-6">
          <div>
            <label
              htmlFor="inviteCode"
              className="mb-2 block text-sm font-medium text-title"
            >
              초대 코드 <span className="text-destructive">*</span>
            </label>
            <Input
              id="inviteCode"
              type="text"
              value={inviteCode}
              onChange={(e) => setInviteCode(e.target.value.toUpperCase())}
              placeholder="6자리 코드 입력"
              className="h-12 text-center text-2xl font-mono tracking-widest"
              maxLength={6}
              disabled={isLoading}
            />
            <p className="mt-2 text-xs text-subtitle">
              룸메이트로부터 받은 6자리 코드를 입력하세요
            </p>
          </div>

          {error && (
            <div className="rounded-lg bg-destructive/10 px-4 py-3 text-sm text-destructive">
              {error}
            </div>
          )}
        </div>

        <Button
          onClick={handleJoinRoom}
          className="mt-8 w-full bg-primary text-white hover:bg-primary-light transition-colors rounded-button h-12 text-base font-medium"
          disabled={isLoading || inviteCode.length !== 6}
        >
          {isLoading ? '참여 중...' : '방 참여하기'}
        </Button>
      </div>
    </div>
  );
}
