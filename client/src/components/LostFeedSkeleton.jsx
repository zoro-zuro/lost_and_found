import React from 'react';
import Skeleton from './Skeleton';

const LostFeedSkeleton = () => {
  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex items-center gap-3 mb-4 md:mb-6">
        <Skeleton className="w-8 h-8 rounded-lg" />
        <Skeleton className="w-32 h-8 rounded-lg" />
      </div>

      {/* Filters Section */}
      <div className="flex flex-col md:flex-row gap-4">
        <Skeleton className="flex-1 h-12 rounded-xl" />
        <Skeleton className="w-40 h-12 rounded-xl" />
        <Skeleton className="w-32 h-12 rounded-xl" />
      </div>

      {/* Items Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {[...Array(9)].map((_, i) => (
          <div key={i} className="bg-white rounded-xl shadow-lg overflow-hidden">
            {/* Image Section */}
            <div className="relative h-48 w-full overflow-hidden">
              <Skeleton className="w-full h-full" />
              <div className="absolute top-2 left-2">
                <Skeleton className="w-16 h-6 rounded-full" />
              </div>
              <div className="absolute top-2 right-2">
                <Skeleton className="w-12 h-6 rounded-full" />
              </div>
            </div>
            
            {/* Content Section */}
            <div className="p-4">
              <Skeleton className="w-full h-6 rounded-lg mb-2" />
              <Skeleton className="w-3/4 h-4 rounded-lg mb-3" />
              <Skeleton className="w-full h-3 rounded-lg mb-2" />
              <Skeleton className="w-5/6 h-3 rounded-lg mb-4" />
              
              {/* Location and Date */}
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-2">
                  <Skeleton className="w-4 h-4 rounded-lg" />
                  <Skeleton className="w-20 h-3 rounded-lg" />
                </div>
                <div className="flex items-center gap-2">
                  <Skeleton className="w-4 h-4 rounded-lg" />
                  <Skeleton className="w-16 h-3 rounded-lg" />
                </div>
              </div>
              
              {/* Footer */}
              <div className="flex items-center justify-between pt-3 border-t border-gray-200">
                <div className="flex items-center gap-2">
                  <Skeleton className="w-8 h-8 rounded-full" />
                  <Skeleton className="w-20 h-4 rounded-lg" />
                </div>
                <Skeleton className="w-16 h-8 rounded-lg" />
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default LostFeedSkeleton;
