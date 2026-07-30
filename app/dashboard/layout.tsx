import React from 'react';
import Header from '@/components/dashboard/Header';
import Sidebar from '@/components/dashboard/Sidebar';
import { KeyProvider } from '@/hooks/useKeyPair';
import KeyGuard from '@/components/dashboard/KeyGuard';

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <KeyProvider>
      <KeyGuard>
        <div className="bg-[#0b1338] h-screen p-2 flex flex-col">
          <Header />
          <div className="bottom flex flex-1 min-h-0 relative overflow-hidden">
            <Sidebar />
            <div className="right flex flex-col flex-1 items-center gap-2 bg-blue-200 h-full rounded-2xl px-2 overflow-y-auto">
              {children}
            </div>
          </div>
        </div>
      </KeyGuard>
    </KeyProvider>
  );
}
