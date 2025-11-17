'use client';

import { Button } from '@/components/ui/button';
import { authApi } from '@/lib/api';

export default function LoginPage() {
  const handleGoogleLogin = () => {
    authApi.loginWithGoogle();
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-background">
      <div className="w-full max-w-md px-8">
        {/* Logo */}
        <div className="mb-12 text-center">
          <h1 className="text-5xl font-bold" style={{ color: 'var(--brand)' }}>
            peaceHub
          </h1>
          <p className="mt-4 text-subtitle">
            룸메이트와 함께하는 평화로운 공동생활
          </p>
        </div>

        {/* Welcome Card */}
        <div className="rounded-card bg-card p-8 shadow-card">
          <h2 className="mb-4 text-center text-2xl text-title">
            환영합니다!
          </h2>
          <p className="mb-8 text-center text-body">
            Google 계정으로 간편하게 시작하세요
          </p>

          {/* Google Login Button */}
          <Button
            onClick={handleGoogleLogin}
            className="w-full bg-primary text-white hover:bg-primary-light transition-colors rounded-button h-12 text-base font-medium"
            size="lg"
          >
            <svg className="mr-2 h-5 w-5" viewBox="0 0 24 24">
              <path
                fill="currentColor"
                d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
              />
              <path
                fill="currentColor"
                d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
              />
              <path
                fill="currentColor"
                d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
              />
              <path
                fill="currentColor"
                d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
              />
            </svg>
            Google로 계속하기
          </Button>

          {/* Info Text */}
          <p className="mt-6 text-center text-xs text-subtitle">
            계속 진행하면 peaceHub의 서비스 약관에 동의하는 것으로 간주됩니다
          </p>
        </div>

        {/* Footer */}
        <p className="mt-8 text-center text-sm text-subtitle">
          © 2025 peaceHub. All rights reserved.
        </p>
      </div>
    </div>
  );
}
