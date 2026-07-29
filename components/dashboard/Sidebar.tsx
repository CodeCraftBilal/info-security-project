"use client"
import React, { useState, useRef } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useSession } from 'next-auth/react';
import { ChevronRight, X } from 'lucide-react';
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
    { label: 'My Files', href: '/dashboard' },
    { label: 'Shared With Me', href: '/dashboard/shared' },
    { label: 'Share File', href: '/dashboard/share' },
  ];

  return (
    <>
      {/* Floating arrow for mobile when closed */}
      {!isOpen && (
        <button
          onClick={() => setIsOpen(true)}
          className="md:hidden fixed top-1/2 left-0 -translate-y-1/2 z-40 bg-blue-500 text-white p-2 rounded-r-xl shadow-lg opacity-80 hover:opacity-100 transition-opacity"
        >
          <ChevronRight size={24} />
        </button>
      )}

      {/* Sidebar Container */}
      <div 
        ref={sidebarRef}
        className={`left w-[70%] sm:w-[50%] md:w-[30%] h-full flex flex-col min-h-0
          bg-[#0b1338] md:bg-transparent
          transition-transform duration-300 ease-in-out
          ${isOpen ? 'translate-x-0 absolute z-50 left-0 shadow-2xl' : '-translate-x-full absolute z-50 left-0'} 
          md:relative md:translate-x-0 md:shadow-none
        `}
      >
        <button 
          className="md:hidden absolute top-4 right-4 text-white hover:text-gray-300"
          onClick={() => setIsOpen(false)}
        >
          <X size={24} />
        </button>
        
        <div className="menu flex flex-col gap-3 p-2 mt-12 md:mt-0">
          {menuItems.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              onClick={() => setIsOpen(false)}
              className={`${pathname === item.href ? 'bg-[#5968a3ec]' : 'bg-[#26305aec]'} cursor-pointer transition-all hover:bg-[#5968a3ec] p-3 rounded-2xl text-lg text-white text-center block`}
            >
              {item.label}
            </Link>
          ))}
        </div>

        <div className="collaborator flex flex-col gap-2 overflow-auto p-2 h-0 flex-grow justify-end">
          <div className="container bg-[#26305aec] flex items-center p-3 rounded-2xl text-lg text-white">
            <div className="image mr-3">
              <img 
                src={session?.userImage || "/colImg.gif"} 
                alt="collaborator" 
                width={60} 
                height={60} 
                className="rounded-full object-cover w-[60px] h-[60px]"
              />
            </div>
            <div className="description flex flex-col overflow-hidden">
              <span className="font-semibold truncate" title={session?.userName}>{session?.userName}</span>
              <span className="text-sm text-gray-300 truncate" title={session?.userEmail}>{session?.userEmail}</span>
            </div>
          </div>
        </div>
      </div>
      
      {/* Overlay for mobile when sidebar is open */}
      {isOpen && (
        <div className="md:hidden fixed inset-0 bg-black/50 z-40" aria-hidden="true" />
      )}
    </>
  );
};

export default Sidebar;
