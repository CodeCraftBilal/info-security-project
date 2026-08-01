"use client"
import React, { useState, useRef } from 'react';
import { Bell } from 'lucide-react';
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
        className="relative p-2 text-text-secondary hover:text-text-primary rounded-lg hover:bg-primary/10 transition-colors"
      >
        <Bell size={20} />
        {unreadCount > 0 && (
          <span className="absolute top-0.5 right-0.5 bg-danger text-white text-[9px] font-bold h-4 w-4 rounded-full flex items-center justify-center animate-pulse">
            {unreadCount > 9 ? '9+' : unreadCount}
          </span>
        )}
      </button>

      {isOpen && (
        <div className="absolute top-[48px] right-0 w-80 rounded-xl shadow-xl z-50 overflow-hidden flex flex-col max-h-[400px] animate-fade-in-down" style={{ background: 'var(--surface)', border: '1px solid var(--border)' }}>
          <div className="p-3 flex justify-between items-center" style={{ borderBottom: '1px solid var(--border)', background: 'var(--surface-elevated)' }}>
            <h3 className="text-text-primary font-semibold text-sm">Notifications</h3>
            {notifications.length > 0 && (
              <button 
                onClick={handleMarkAllRead}
                className="text-xs text-primary-light hover:text-primary transition-colors"
              >
                Mark all as read
              </button>
            )}
          </div>
          
          <div className="flex-1 overflow-y-auto">
            {notifications.length === 0 ? (
              <div className="p-8 text-center text-text-muted text-sm">
                No new notifications
              </div>
            ) : (
              <div className="flex flex-col">
                {notifications.map((notification) => (
                  <div 
                    key={notification._id} 
                    onClick={() => handleNotificationClick(notification._id)}
                    className="p-3 hover:bg-primary/5 cursor-pointer transition-colors flex gap-3 items-start"
                    style={{ borderBottom: '1px solid var(--border-subtle)' }}
                  >
                    <div className="shrink-0 w-9 h-9 rounded-full overflow-hidden flex items-center justify-center ring-1 ring-border" style={{ background: 'var(--surface-elevated)' }}>
                      <img 
                        src={notification.senderProfilePic || '/colImg.gif'} 
                        alt="Profile" 
                        className="w-full h-full object-cover"
                        onError={(e) => { (e.target as HTMLImageElement).src = '/colImg.gif'; }}
                      />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm text-text-primary break-words leading-snug">
                        <span className="font-semibold text-primary-light">{notification.senderUsername}</span>{' '}
                        {notification.message.replace(`Shared a new file with you: `, 'shared a file: ')}
                      </p>
                      <span className="text-[10px] text-text-muted mt-1 block">
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
