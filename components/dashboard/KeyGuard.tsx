"use client"
import React, { useEffect } from 'react';
import { useKeyPair } from '@/hooks/useKeyPair';
import { usePathname, useRouter } from 'next/navigation';
import LoadingSpinner from '../Loader/LoadingSpinner';

export default function KeyGuard({ children }: { children: React.ReactNode }) {
  const { needsOnboarding, needsRecovery, isInitializing } = useKeyPair();
  const router = useRouter();
  const pathname = usePathname();

  useEffect(() => {
    if (isInitializing) return;

    if (needsOnboarding && pathname !== '/dashboard/onboarding') {
      router.push('/dashboard/onboarding');
    } else if (needsRecovery && pathname !== '/dashboard/recovery') {
      router.push('/dashboard/recovery');
    } else if (!needsOnboarding && !needsRecovery && (pathname === '/dashboard/onboarding' || pathname === '/dashboard/recovery')) {
      router.push('/dashboard');
    }
  }, [needsOnboarding, needsRecovery, isInitializing, pathname, router]);

  if (isInitializing) {
    return (
      <div className="flex flex-col items-center justify-center h-full w-full gap-3">
        <LoadingSpinner size="large" color="primary" />
        <span className="text-text-secondary font-medium text-sm animate-pulse">Loading encryption keys...</span>
      </div>
    );
  }

  // Prevent rendering children if they are about to be redirected
  if (needsOnboarding && pathname !== '/dashboard/onboarding') return null;
  if (needsRecovery && pathname !== '/dashboard/recovery') return null;

  return <>{children}</>;
}
