import React from 'react';
import Skeleton from './Skeleton';

const FoundItemsSkeleton = () => {
  return (
    <div className="flex flex-col h-full bg-gradient-to-br from-indigo-50 via-white to-slate-50">
      {/* Header Section */}
      <div className="px-4 md:px-10 pt-4 md:pt-8 pb-4 md:pb-6">
        {/* Mobile Header */}
        <div className="md:hidden flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <Skeleton className="w-8 h-8 rounded-full" />
            <Skeleton className="w-24 h-6 rounded-lg" />
          </div>
          <Skeleton className="w-16 h-8 rounded-lg" />
        </div>

        {/* Desktop Header */}
        <div className="hidden md:flex items-center justify-between mb-6">
          <div className="flex items-center gap-3">
            <Skeleton className="w-10 h-10 rounded-full" />
            <div>
              <Skeleton className="w-32 h-6 rounded-lg mb-2" />
              <Skeleton className="w-48 h-4 rounded-lg" />
            </div>
          </div>
          <Skeleton className="w-20 h-10 rounded-lg" />
        </div>

        {/* Mobile Categories */}
        <div className="md:hidden flex gap-2 overflow-x-auto pb-2 mb-4">
          {[...Array(6)].map((_, i) => (
            <Skeleton key={i} className="w-20 h-8 rounded-xl flex-shrink-0" />
          ))}
        </div>

        {/* Mobile Tab Indicator */}
        <div className="md:hidden flex items-center justify-center gap-2 mb-4">
          <Skeleton className="w-16 h-4 rounded-lg" />
          <Skeleton className="w-2 h-2 rounded-full" />
        </div>

        {/* Desktop Filters */}
        <div className="hidden md:flex flex-col md:flex-row items-center gap-4 md:gap-6 h-auto md:h-[48px]">
          <Skeleton className="flex-[5] h-[48px] rounded-xl" />
          <Skeleton className="flex-[3] h-[48px] rounded-xl" />
          <Skeleton className="flex-[2] h-[48px] rounded-xl" />
        </div>

        {/* Desktop Quick Categories */}
        <div className="hidden md:flex items-center gap-4 md:gap-6 overflow-x-auto pb-2 pt-4 md:pt-6 mb-6 md:mb-8">
          <div className="flex items-center gap-2 shrink-0">
            <Skeleton className="w-6 h-6 rounded-lg" />
            <Skeleton className="w-32 h-6 rounded-lg" />
          </div>
          <div className="flex gap-2 md:gap-3">
            {[...Array(8)].map((_, i) => (
              <Skeleton key={i} className="w-16 h-8 rounded-xl flex-shrink-0" />
            ))}
          </div>
        </div>
      </div>

      {/* Items Grid */}
      <div className="flex-1 px-4 md:px-10 pb-10 md:pb-8">
        <div className="flex flex-col gap-0 md:gap-8">
          <div className="grid grid-cols-2 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-3 md:gap-6">
            {/* Add New Item Card - Desktop Only */}
            <div className="hidden md:flex">
              <Skeleton className="w-full h-[300px] rounded-3xl" />
            </div>

            {/* Item Cards Skeleton */}
            {[...Array(7)].map((_, i) => (
              <div key={i} className="bg-white/60 backdrop-blur-sm border-2 border-slate-200 rounded-3xl overflow-hidden flex flex-col h-[260px] md:h-[300px]">
                {/* Image Section */}
                <div className="relative h-28 md:h-36 w-full overflow-hidden bg-indigo-50">
                  <Skeleton className="w-full h-full" />
                  <div className="absolute top-2 left-2">
                    <Skeleton className="w-12 h-4 rounded-full" />
                  </div>
                  <div className="absolute top-2 right-2">
                    <Skeleton className="w-16 h-4 rounded-full" />
                  </div>
                </div>
                
                {/* Content Section */}
                <div className="p-2 md:p-3 flex flex-col flex-1">
                  <Skeleton className="w-full h-5 rounded-lg mb-1" />
                  <div className="flex items-center gap-1 mt-1">
                    <Skeleton className="w-4 h-4 rounded-lg" />
                    <Skeleton className="flex-1 h-4 rounded-lg" />
                  </div>
                  <div className="mt-auto flex items-center justify-between pt-2 border-t border-slate-200/30">
                    <Skeleton className="w-6 h-6 rounded-full" />
                    <Skeleton className="w-16 h-4 rounded-lg" />
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* Pagination Skeleton */}
          <div className="flex items-center justify-between pt-4 border-t border-slate-200/30">
            <Skeleton className="w-32 h-4 rounded-lg" />
            <div className="flex items-center gap-2">
              {[...Array(5)].map((_, i) => (
                <Skeleton key={i} className="w-8 h-8 rounded-lg" />
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default FoundItemsSkeleton;
