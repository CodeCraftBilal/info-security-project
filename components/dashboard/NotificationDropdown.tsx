"use client"
import React, { useState, useRef } from 'react';
import { Bell, Check, X } from 'lucide-react';
import { useNotification } from '@/context/NotificationContext';
import { useClickOutside } from '@/hooks/useClickOutside';

const NotificationDropdown = () => {
  const { notifications, unreadCount, markAsRead } = useNotification();
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  useClickOutside(dropdownRef, () => {
    if (isOpen) setIsOpen(false);
  });

  const handleNotificationClick = async (id: string) => {
    await markAsRead(id);
    // You could optionally navigate the user to the shared file here
  };

  const handleMarkAllRead = async (e: React.MouseEvent) => {
    e.stopPropagation();
    await markAsRead();
    setIsOpen(false);
  };

  return (
    <div className="relative flex items-center" ref={dropdownRef}>
      <button 
        onClick={() => setIsOpen(!isOpen)} 
        className="relative p-2 text-white hover:bg-white/10 rounded-full transition-colors"
      >
        <Bell size={24} />
        {unreadCount > 0 && (
          <span className="absolute top-1 right-1 bg-red-500 text-white text-[10px] font-bold h-4 w-4 rounded-full flex items-center justify-center">
            {unreadCount > 9 ? '9+' : unreadCount}
          </span>
        )}
      </button>

      {isOpen && (
        <div className="absolute top-[50px] right-0 w-80 bg-[#26305aec] border border-blue-400/20 rounded-xl shadow-2xl z-50 overflow-hidden flex flex-col max-h-[400px]">
          <div className="p-3 border-b border-blue-400/20 flex justify-between items-center bg-[#1e2646ec]">
            <h3 className="text-white font-semibold">Notifications</h3>
            {notifications.length > 0 && (
              <button 
                onClick={handleMarkAllRead}
                className="text-xs text-blue-300 hover:text-white transition-colors"
              >
                Mark all as read
              </button>
            )}
          </div>
          
          <div className="flex-1 overflow-y-auto">
            {notifications.length === 0 ? (
              <div className="p-6 text-center text-gray-400 text-sm">
                No new notifications
              </div>
            ) : (
              <div className="flex flex-col">
                {notifications.map((notification) => (
                  <div 
                    key={notification._id} 
                    onClick={() => handleNotificationClick(notification._id)}
                    className="p-3 border-b border-blue-400/10 hover:bg-blue-900/40 cursor-pointer transition-colors flex gap-3 items-start"
                  >
                    <div className="shrink-0 w-10 h-10 rounded-full overflow-hidden bg-blue-800/50 flex items-center justify-center">
                      <img 
                        src={notification.senderProfilePic || '/colImg.gif'} 
                        alt="Profile" 
                        className="w-full h-full object-cover"
                        onError={(e) => { (e.target as HTMLImageElement).src = '/colImg.gif'; }}
                      />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm text-white break-words">
                        <span className="font-semibold text-blue-300">{notification.senderUsername}</span>{' '}
                        {notification.message.replace(`Shared a new file with you: `, 'shared a file: ')}
                      </p>
                      <span className="text-[10px] text-gray-400 mt-1 block">
                        {new Date(notification.createdAt).toLocaleDateString()} {new Date(notification.createdAt).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default NotificationDropdown;
