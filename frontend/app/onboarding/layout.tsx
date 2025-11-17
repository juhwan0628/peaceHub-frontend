'use client';

import { usePathname } from 'next/navigation';

export default function OnboardingLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();

  // 현재 단계 파악
  const getStep = () => {
    if (pathname.includes('/profile')) return 1;
    if (pathname.includes('/room')) return 2;
    if (pathname.includes('/timetable')) return 3;
    return 1;
  };

  const currentStep = getStep();

  return (
    <div className="min-h-screen bg-background">
      {/* Header with Logo and Progress */}
      <div className="border-b border-border bg-card">
        <div className="mx-auto max-w-3xl px-6 py-6">
          <div className="mb-6 text-center">
            <h1 className="text-3xl font-bold" style={{ color: 'var(--brand)' }}>
              peaceHub
            </h1>
          </div>

          {/* Progress Bar */}
          <div className="flex items-center justify-center gap-4">
            {[1, 2, 3].map((step) => (
              <div key={step} className="flex items-center">
                {/* Step Circle */}
                <div
                  className={`flex h-10 w-10 items-center justify-center rounded-full text-sm font-semibold transition-colors ${
                    step <= currentStep
                      ? 'bg-primary text-white'
                      : 'bg-neutral-200 text-neutral-500'
                  }`}
                >
                  {step}
                </div>

                {/* Connector Line */}
                {step < 3 && (
                  <div
                    className={`h-0.5 w-16 transition-colors ${
                      step < currentStep ? 'bg-primary' : 'bg-neutral-200'
                    }`}
                  />
                )}
              </div>
            ))}
          </div>

          {/* Step Label */}
          <p className="mt-4 text-center text-sm text-subtitle">
            {currentStep}/3 단계
          </p>
        </div>
      </div>

      {/* Content */}
      <div className="mx-auto max-w-2xl px-6 py-12">{children}</div>
    </div>
  );
}
