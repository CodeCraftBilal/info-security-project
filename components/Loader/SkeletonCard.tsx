import React from 'react';

interface SkeletonCardProps {
  variant?: 'simple' | 'product' | 'detailed';
  className?: string;
}

const SkeletonCard: React.FC<SkeletonCardProps> = ({
  variant = 'simple',
  className = ''
}) => {
  const renderSimple = () => (
    <div className={`bg-white rounded-2xl p-6 shadow-sm border border-green-100 animate-pulse ${className}`}>
      <div className="w-3/4 h-5 bg-blue-200 rounded mb-3"></div>
      <div className="w-1/2 h-4 bg-blue-100 rounded mb-4"></div>
      <div className="w-full h-3 bg-blue-50 rounded mb-2"></div>
      <div className="w-4/5 h-3 bg-blue-50 rounded"></div>
    </div>
  );

  const renderProduct = () => (
    <div className={`bg-white rounded-2xl p-4 shadow-sm border border-green-100 animate-pulse ${className}`}>
      {/* Image */}
      <div className="w-full h-48 bg-blue-200 rounded-xl mb-4"></div>
      
      {/* Content */}
      <div className="space-y-3">
        <div className="w-3/4 h-5 bg-blue-200 rounded"></div>
        <div className="w-1/2 h-4 bg-blue-100 rounded"></div>
        
        {/* Price and Rating */}
        <div className="flex justify-between items-center">
          <div className="w-16 h-6 bg-blue-300 rounded"></div>
          <div className="w-20 h-4 bg-blue-100 rounded"></div>
        </div>
        
        {/* Location and Date */}
        <div className="flex justify-between items-center pt-2 border-t border-green-50">
          <div className="w-20 h-3 bg-blue-50 rounded"></div>
          <div className="w-16 h-3 bg-blue-50 rounded"></div>
        </div>
      </div>
    </div>
  );

  const renderDetailed = () => (
    <div className={`bg-white rounded-2xl p-6 shadow-sm border border-green-100 animate-pulse ${className}`}>
      <div className="flex flex-col sm:flex-row space-y-4 sm:space-y-0 sm:space-x-6">
        {/* Image */}
        <div className="w-full sm:w-40 h-40 bg-blue-200 rounded-xl flex-shrink-0"></div>
        
        {/* Content */}
        <div className="flex-1 space-y-4">
          {/* Header */}
          <div className="space-y-2">
            <div className="w-3/4 h-6 bg-blue-200 rounded"></div>
            <div className="w-1/2 h-4 bg-blue-100 rounded"></div>
          </div>
          
          {/* Description */}
          <div className="space-y-2">
            <div className="w-full h-3 bg-blue-50 rounded"></div>
            <div className="w-4/5 h-3 bg-blue-50 rounded"></div>
            <div className="w-3/4 h-3 bg-blue-50 rounded"></div>
          </div>
          
          {/* Tags */}
          <div className="flex flex-wrap gap-2">
            <div className="w-16 h-6 bg-blue-100 rounded-full"></div>
            <div className="w-20 h-6 bg-blue-100 rounded-full"></div>
            <div className="w-14 h-6 bg-blue-100 rounded-full"></div>
          </div>
          
          {/* Footer */}
          <div className="flex justify-between items-center pt-4 border-t border-green-50">
            <div className="flex items-center space-x-2">
              <div className="w-8 h-8 bg-blue-200 rounded-full"></div>
              <div className="w-20 h-4 bg-blue-100 rounded"></div>
            </div>
            <div className="w-24 h-10 bg-blue-300 rounded-lg"></div>
          </div>
        </div>
      </div>
    </div>
  );

  switch (variant) {
    case 'simple':
      return renderSimple();
    case 'product':
      return renderProduct();
    case 'detailed':
      return renderDetailed();
    default:
      return renderSimple();
  }
};

export default SkeletonCard;