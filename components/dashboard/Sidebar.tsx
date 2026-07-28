"use client"
import React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useSession } from 'next-auth/react';

const Sidebar: React.FC = () => {
  const pathname = usePathname();
  const { data: authSession } = useSession();
  
  const session = authSession ? {
    userId: authSession.user?.id as unknown as number,
    userRole: 'user', // default
  } : null;

  return (
    <div className="left w-[30%] h-full flex flex-col min-h-0 relative">
      <div className="humburger md:hidden absolute max-md:right-4">X</div>
      <div className="menu flex flex-col gap-3 p-2 max-md:mt-5">
        <Link 
          href="/dashboard"
          className={`${pathname === '/dashboard' ? 'bg-[#5968a3ec]' : 'bg-[#26305aec]'} cursor-pointer transition-all hover:bg-[#5968a3ec] p-3 rounded-2xl text-lg text-white text-center block`}
        >
          My Files
        </Link>
        <Link 
          href="/dashboard/shared"
          className={`${pathname === '/dashboard/shared' ? 'bg-[#5968a3ec]' : 'bg-[#26305aec]'} cursor-pointer transition-all hover:bg-[#5968a3ec] p-3 rounded-2xl text-lg text-white text-center block`}
        >
          Shared With Me
        </Link>
      </div>

      <div className="collaborator flex flex-col gap-2 overflow-auto p-2 h-0 flex-grow justify-end">
        <div className="container bg-[#26305aec] flex items-center p-3 rounded-2xl text-lg text-white">
          <div className="image mr-3">
            <img src="/colImg.gif" alt="collaborator" width={60} height={60} />
          </div>
          <div className="description flex flex-col">
            <span>{session?.userId}</span>
            <span>{session?.userRole}</span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Sidebar;
