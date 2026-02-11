import React from 'react';
import Skeleton from './Skeleton';

const DashboardSkeleton = () => {
  return (
    <div className="w-full max-w-[1140px] mx-auto glass-panel rounded-t-4xl flex flex-col overflow-hidden relative mt-5 pb-10 md:pb-0 border-white/20 shadow-sm">
      {/* Welcome Section */}
      <div className="px-6 md:px-8 pt-6 md:pt-8 pb-4 md:pb-6">
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 md:gap-6">
          <div>
            <Skeleton className="w-48 h-8 md:h-12 mb-2 md:mb-3" />
            <Skeleton className="w-64 h-4 md:h-6" />
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1 px-6 md:px-8 pb-6 md:pb-8">
        <div className="space-y-6 md:space-y-8">
          {/* Quick Actions */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-6">
            {/* Report Lost Item Card */}
            <div className="bg-slate-50/80 p-6 md:p-8 rounded-2xl border border-slate-200/60 min-h-[200px] md:min-h-[240px] flex flex-col items-center justify-center text-center">
              <Skeleton className="w-12 h-12 md:w-16 md:h-16 mb-4 rounded-xl" />
              <Skeleton className="w-32 h-6 mb-2 rounded-lg" />
              <Skeleton className="w-48 h-4 mb-4 rounded-lg" />
              <Skeleton className="w-24 h-4 rounded-lg" />
            </div>

            {/* Browse Found Items Card */}
            <div className="bg-slate-50/80 p-6 md:p-8 rounded-2xl border border-slate-200/60 min-h-[200px] md:min-h-[240px] flex flex-col items-center justify-center text-center">
              <Skeleton className="w-12 h-12 md:w-16 md:h-16 mb-4 rounded-xl" />
              <Skeleton className="w-32 h-6 mb-2 rounded-lg" />
              <Skeleton className="w-48 h-4 mb-4 rounded-lg" />
              <Skeleton className="w-24 h-4 rounded-lg" />
            </div>
          </div>

          {/* Active Inquiries and Community Protocol */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 md:gap-8 items-start">
            {/* Active Inquiries Section */}
            <div className="lg:col-span-2 space-y-4 md:space-y-6">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <Skeleton className="w-2 h-6 rounded-full" />
                  <Skeleton className="w-32 h-4 rounded-lg" />
                </div>
                <Skeleton className="w-24 h-4 rounded-lg" />
              </div>

              {/* Active Items */}
              <div className="space-y-3">
                {[...Array(3)].map((_, i) => (
                  <div key={i} className="bg-slate-50/60 p-3 md:p-4 rounded-2xl flex items-center justify-between border border-slate-200/50">
                    <div className="flex items-center gap-3">
                      <Skeleton className="w-8 h-8 md:w-10 md:h-10 rounded-xl" />
                      <div>
                        <Skeleton className="w-32 h-5 mb-1 rounded-lg" />
                        <div className="flex items-center gap-2 md:gap-3">
                          <Skeleton className="w-16 h-3 rounded-lg" />
                          <Skeleton className="w-1 h-1 rounded-full" />
                          <Skeleton className="w-20 h-3 rounded-lg" />
                        </div>
                      </div>
                    </div>
                    <Skeleton className="w-20 h-6 rounded-full" />
                  </div>
                ))}
              </div>
            </div>

            {/* Community Protocol Section */}
            <div className="space-y-4 md:space-y-6">
              <div className="flex items-center gap-3">
                <Skeleton className="w-2 h-6 rounded-full" />
                <Skeleton className="w-40 h-4 rounded-lg" />
              </div>
              
              <div className="bg-slate-50/60 p-4 md:p-6 rounded-2xl border border-slate-200/50">
                <div className="space-y-3">
                  {[...Array(4)].map((_, i) => (
                    <div key={i} className="flex items-start gap-3">
                      <Skeleton className="w-5 h-5 rounded-lg flex-shrink-0 mt-0.5" />
                      <div className="flex-1">
                        <Skeleton className="w-full h-4 mb-1 rounded-lg" />
                        <Skeleton className="w-3/4 h-3 rounded-lg" />
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default DashboardSkeleton;
