'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';

interface RoomCodeDisplayProps {
  code: string;
  showLabel?: boolean;
  size?: 'sm' | 'md' | 'lg';
}

export default function RoomCodeDisplay({
  code,
  showLabel = true,
  size = 'md',
}: RoomCodeDisplayProps) {
  const [copied, setCopied] = useState(false);

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(code);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (error) {
      console.error('Failed to copy:', error);
      alert('복사에 실패했습니다');
    }
  };

  const sizeClasses = {
    sm: 'text-lg',
    md: 'text-2xl',
    lg: 'text-4xl',
  };

  return (
    <div className="space-y-3">
      {showLabel && (
        <p className="text-sm font-medium text-title">초대 코드</p>
      )}

      <div className="flex items-center gap-3">
        {/* Code Display */}
        <div className="flex-1 rounded-card bg-neutral-100 dark:bg-neutral-800 border-2 border-primary px-6 py-4 text-center">
          <div className={`font-mono font-bold tracking-widest text-primary ${sizeClasses[size]}`}>
            {code}
          </div>
        </div>

        {/* Copy Button */}
        <Button
          onClick={handleCopy}
          variant={copied ? 'secondary' : 'default'}
          className="h-full px-6 rounded-button"
        >
          {copied ? (
            <>
              <svg
                className="mr-2 h-4 w-4"
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
              복사됨!
            </>
          ) : (
            <>
              <svg
                className="mr-2 h-4 w-4"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M8 5H6a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2v-1M8 5a2 2 0 002 2h2a2 2 0 002-2M8 5a2 2 0 012-2h2a2 2 0 012 2m0 0h2a2 2 0 012 2v3m2 4H10m0 0l3-3m-3 3l3 3"
                />
              </svg>
              복사
            </>
          )}
        </Button>
      </div>

      <p className="text-xs text-subtitle">
        💡 이 코드를 룸메이트들에게 공유하세요
      </p>
    </div>
  );
}
