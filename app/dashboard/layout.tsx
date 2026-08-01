import React from 'react';
import Header from '@/components/dashboard/Header';
import Sidebar from '@/components/dashboard/Sidebar';
import { KeyProvider } from '@/hooks/useKeyPair';
import KeyGuard from '@/components/dashboard/KeyGuard';
import { NotificationProvider } from '@/context/NotificationContext';

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <KeyProvider>
      <NotificationProvider>
        <KeyGuard>
          <div className="h-screen flex flex-col p-2 gap-2" style={{ background: 'var(--background)' }}>
            <Header />
            <div className="flex flex-1 min-h-0 gap-2 relative overflow-hidden">
              <Sidebar />
              <div className="flex flex-col flex-1 items-center gap-2 h-full rounded-2xl px-2 overflow-y-auto" style={{ background: 'var(--surface)' }}>
                {children}
              </div>
            </div>
          </div>
        </KeyGuard>
      </NotificationProvider>
    </KeyProvider>
  );
}
