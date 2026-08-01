import React from 'react';
import SkeletonCard from './SkeletonCard';

interface ContentLoaderProps {
  type?: 'grid' | 'list' | 'cards';
  count?: number;
  columns?: number;
}

const ContentLoader: React.FC<ContentLoaderProps> = ({
  type = 'grid',
  count = 6,
  columns = 3
}) => {
  const renderGridLoader = () => (
    <div className={`grid grid-cols-2 sm:grid-cols-[repeat(auto-fill,minmax(200px,1fr))] gap-3 sm:gap-5 p-2`}>
      {[...Array(count)].map((_, index) => (
        <SkeletonCard key={index} variant="simple" />
      ))}
    </div>
  );

  const renderListLoader = () => (
    <div className="space-y-4">
      {[...Array(count)].map((_, index) => (
        <div
          key={index}
          className="rounded-xl p-4 shadow-sm animate-pulse flex items-start space-x-4"
          style={{ background: 'var(--surface-elevated)', border: '1px solid var(--border)' }}
        >
          <div className="w-12 h-12 rounded-lg shrink-0" style={{ background: 'var(--surface)' }}></div>
          <div className="flex-1 space-y-3 py-1">
            <div className="w-3/4 h-4 rounded" style={{ background: 'var(--surface)' }}></div>
            <div className="w-1/2 h-3 rounded" style={{ background: 'var(--surface)' }}></div>
            <div className="flex space-x-2">
              <div className="w-16 h-5 rounded-full" style={{ background: 'var(--surface)' }}></div>
              <div className="w-16 h-5 rounded-full" style={{ background: 'var(--surface)' }}></div>
            </div>
          </div>
        </div>
      ))}
    </div>
  );

  return (
    <div className="w-full">
      {type === 'grid' && renderGridLoader()}
      {type === 'list' && renderListLoader()}
    </div>
  );
};

export default ContentLoader;