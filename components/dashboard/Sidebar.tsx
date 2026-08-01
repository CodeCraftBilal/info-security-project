"use client"
import React, { useState, useRef } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useSession } from 'next-auth/react';
import { ChevronRight, X, FolderOpen, Users, Share2 } from 'lucide-react';
import { useClickOutside } from '@/hooks/useClickOutside';

const Sidebar: React.FC = () => {
  const pathname = usePathname();
  const { data: authSession } = useSession();
  const [isOpen, setIsOpen] = useState(false);
  const sidebarRef = useRef<HTMLDivElement>(null);

  useClickOutside(sidebarRef, () => {
    if (isOpen) setIsOpen(false);
  });
  
  const session = authSession ? {
    userId: authSession.user?.id as unknown as string,
    userName: authSession.user?.name || 'Unknown User',
    userEmail: authSession.user?.email || 'No email',
    userImage: authSession.user?.image || '/colImg.gif',
    userRole: 'user', // default
  } : null;

  const menuItems = [
    { label: 'My Files', href: '/dashboard', icon: FolderOpen },
    { label: 'Shared With Me', href: '/dashboard/shared', icon: Users },
    { label: 'Share File', href: '/dashboard/share', icon: Share2 },
  ];

  return (
    <>
      {/* Floating arrow for mobile when closed */}
      {!isOpen && (
        <button
          onClick={() => setIsOpen(true)}
          className="md:hidden fixed top-1/2 left-0 -translate-y-1/2 z-40 p-2 rounded-r-xl shadow-lg opacity-80 hover:opacity-100 transition-all duration-200"
          style={{ background: 'var(--primary)', color: 'white' }}
        >
          <ChevronRight size={24} />
        </button>
      )}

      {/* Sidebar Container */}
      <div 
        ref={sidebarRef}
        className={`w-[70%] sm:w-[50%] md:w-[240px] lg:w-[260px] h-full flex flex-col min-h-0
          transition-transform duration-300 ease-in-out
          ${isOpen ? 'translate-x-0 absolute z-50 left-0 shadow-2xl' : '-translate-x-full absolute z-50 left-0'} 
          md:relative md:translate-x-0 md:shadow-none
        `}
        style={{ background: isOpen ? 'var(--background)' : 'transparent' }}
      >
        <button 
          className="md:hidden absolute top-4 right-4 text-text-secondary hover:text-text-primary transition-colors"
          onClick={() => setIsOpen(false)}
        >
          <X size={24} />
        </button>
        
        <div className="flex flex-col gap-1.5 p-2 mt-12 md:mt-0">
          {menuItems.map((item) => {
            const isActive = pathname === item.href;
            const IconComponent = item.icon;
            return (
              <Link
                key={item.href}
                href={item.href}
                onClick={() => setIsOpen(false)}
                className={`flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium transition-all duration-200
                  ${isActive 
                    ? 'bg-primary/15 text-primary-light border-l-3 border-primary' 
                    : 'text-text-secondary hover:bg-surface-elevated hover:text-text-primary'
                  }`}
              >
                <IconComponent className={`w-5 h-5 ${isActive ? 'text-primary-light' : 'text-text-muted'}`} />
                {item.label}
              </Link>
            );
          })}
        </div>

        <div className="flex flex-col gap-2 overflow-auto p-2 flex-grow justify-end">
          <div className="glass rounded-xl p-3 flex items-center gap-3">
            <img 
              src={session?.userImage || "/colImg.gif"} 
              alt="collaborator" 
              width={44} 
              height={44} 
              className="rounded-full object-cover w-[44px] h-[44px] ring-2 ring-primary/20"
            />
            <div className="flex flex-col overflow-hidden min-w-0">
              <span className="font-semibold text-sm text-text-primary truncate" title={session?.userName}>{session?.userName}</span>
              <span className="text-xs text-text-muted truncate" title={session?.userEmail}>{session?.userEmail}</span>
            </div>
          </div>
        </div>
      </div>
      
      {/* Overlay for mobile when sidebar is open */}
      {isOpen && (
        <div className="md:hidden fixed inset-0 bg-black/50 z-40 backdrop-blur-sm" aria-hidden="true" />
      )}
    </>
  );
};

export default Sidebar;
