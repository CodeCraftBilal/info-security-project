import React from 'react';

interface SkeletonCardProps {
  variant?: 'simple' | 'product' | 'detailed';
  className?: string;
}

const SkeletonCard: React.FC<SkeletonCardProps> = ({
  variant = 'simple',
  className = ''
}) => {
  // Simple matches FileItem format
  const renderSimple = () => (
    <div className={`rounded-xl overflow-hidden shadow-sm animate-pulse flex flex-col h-full w-full ${className}`} style={{ background: 'var(--surface-elevated)', border: '1px solid var(--border)' }}>
      {/* Thumbnail */}
      <div className="w-full h-32 sm:h-48" style={{ background: 'var(--surface)' }}></div>
      
      {/* Content */}
      <div className="p-2 sm:p-3 flex flex-col gap-2">
        <div className="w-3/4 h-3 rounded" style={{ background: 'var(--surface)' }}></div>
        <div className="flex justify-between items-center mt-1">
          <div className="w-1/3 h-2.5 rounded" style={{ background: 'var(--surface)' }}></div>
          <div className="w-1/4 h-2.5 rounded" style={{ background: 'var(--surface)' }}></div>
        </div>
        <div className="w-1/2 h-2 rounded mt-1" style={{ background: 'var(--surface)' }}></div>
      </div>
    </div>
  );

  return renderSimple(); // Simplified to only what's needed for the dashboard
};

export default SkeletonCard;