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
    <div className={`grid grid-cols-2 md:grid-cols-3 lg:grid-cols-${columns} gap-3 md:gap-6`}>
      {[...Array(count)].map((_, index) => (
        <SkeletonCard key={index} variant="product" className='' />
      ))}
    </div>
  );

  const renderListLoader = () => (
    <div className="space-y-4">
      {[...Array(count)].map((_, index) => (
        <div
          key={index}
          className="bg-white rounded-2xl p-4 md:p-6 shadow-sm border border-green-100 animate-pulse"
        >
          <div className="flex items-start md:space-x-4">
            <div className="w-16 h-16 md:w-20 md:h-20 bg-green-200 rounded-lg flex-shrink-0"></div>
            <div className="hidden md:block flex-1 space-y-3">
              <div className="w-3/4 h-5 bg-green-200 rounded"></div>
              <div className="w-1/2 h-4 bg-green-100 rounded"></div>
              <div className="w-32 h-4 bg-green-50 rounded"></div>
              <div className="flex space-x-2">
                <div className="w-16 h-6 bg-green-200 rounded-full"></div>
                <div className="w-16 h-6 bg-green-100 rounded-full"></div>
              </div>
            </div>
          </div>
        </div>
      ))}
    </div>
  );

  const renderCardsLoader = () => (
    <div className="space-y-6">
      {[...Array(count)].map((_, index) => (
        <SkeletonCard key={index} variant="detailed" />
      ))}
    </div>
  );

  return (
    <div className="w-full">
      {type === 'grid' && renderGridLoader()}
      {type === 'list' && renderListLoader()}
      {type === 'cards' && renderCardsLoader()}
    </div>
  );
};

export default ContentLoader;