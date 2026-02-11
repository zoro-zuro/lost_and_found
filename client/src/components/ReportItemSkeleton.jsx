import React from 'react';
import Skeleton from './Skeleton';

const ReportItemSkeleton = () => {
  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-50 via-white to-slate-50">
      {/* Header */}
      <div className="bg-white/80 backdrop-blur-sm border-b border-slate-200/50">
        <div className="max-w-4xl mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <Skeleton className="w-32 h-8 rounded-lg" />
            <Skeleton className="w-16 h-8 rounded-lg" />
          </div>
        </div>
      </div>

      {/* Progress Steps */}
      <div className="max-w-4xl mx-auto px-4 py-6">
        <div className="flex items-center justify-between mb-8">
          {[1, 2, 3, 4].map((step) => (
            <div key={step} className="flex items-center">
              <div className="flex flex-col items-center">
                <Skeleton className="w-10 h-10 rounded-full mb-2" />
                <Skeleton className="w-16 h-4 rounded-lg" />
              </div>
              {step < 4 && <Skeleton className="w-20 h-1 mx-4" />}
            </div>
          ))}
        </div>

        {/* Form Content */}
        <div className="bg-white/80 backdrop-blur-sm rounded-2xl border border-slate-200/50 shadow-lg p-6 md:p-8">
          {/* Step 1: Item Details */}
          <div className="space-y-6">
            <div className="flex items-center gap-3 mb-6">
              <Skeleton className="w-8 h-8 rounded-lg" />
              <Skeleton className="w-32 h-6 rounded-lg" />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-6">
              <div className="space-y-2">
                <Skeleton className="w-24 h-4 rounded-lg" />
                <Skeleton className="w-full h-12 rounded-xl" />
              </div>
              <div className="space-y-2">
                <Skeleton className="w-20 h-4 rounded-lg" />
                <Skeleton className="w-full h-12 rounded-xl" />
              </div>
              <div className="space-y-2">
                <Skeleton className="w-16 h-4 rounded-lg" />
                <Skeleton className="w-full h-12 rounded-xl" />
              </div>
              <div className="space-y-2">
                <Skeleton className="w-12 h-4 rounded-lg" />
                <Skeleton className="w-full h-12 rounded-xl" />
              </div>
              <div className="md:col-span-2 space-y-2">
                <Skeleton className="w-20 h-4 rounded-lg" />
                <Skeleton className="w-full h-20 rounded-xl" />
              </div>
            </div>

            {/* Image Upload */}
            <div className="space-y-2">
              <Skeleton className="w-24 h-4 rounded-lg" />
              <div className="border-2 border-dashed border-slate-300 rounded-2xl p-8 text-center">
                <Skeleton className="w-16 h-16 rounded-full mx-auto mb-4" />
                <Skeleton className="w-32 h-4 rounded-lg mx-auto mb-2" />
                <Skeleton className="w-48 h-3 rounded-lg mx-auto" />
              </div>
            </div>
          </div>

          {/* Step 2: Location */}
          <div className="space-y-6 mt-8">
            <div className="flex items-center gap-3 mb-6">
              <Skeleton className="w-8 h-8 rounded-lg" />
              <Skeleton className="w-28 h-6 rounded-lg" />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-6">
              <div className="space-y-2">
                <Skeleton className="w-16 h-4 rounded-lg" />
                <Skeleton className="w-full h-12 rounded-xl" />
              </div>
              <div className="space-y-2">
                <Skeleton className="w-12 h-4 rounded-lg" />
                <Skeleton className="w-full h-12 rounded-xl" />
              </div>
            </div>
          </div>

          {/* Step 3: Contact */}
          <div className="space-y-6 mt-8">
            <div className="flex items-center gap-3 mb-6">
              <Skeleton className="w-8 h-8 rounded-lg" />
              <Skeleton className="w-24 h-6 rounded-lg" />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-6">
              <div className="space-y-2">
                <Skeleton className="w-20 h-4 rounded-lg" />
                <Skeleton className="w-full h-12 rounded-xl" />
              </div>
              <div className="space-y-2">
                <Skeleton className="w-16 h-4 rounded-lg" />
                <Skeleton className="w-full h-12 rounded-xl" />
              </div>
              <div className="md:col-span-2 space-y-2">
                <Skeleton className="w-20 h-4 rounded-lg" />
                <Skeleton className="w-full h-12 rounded-xl" />
              </div>
            </div>
          </div>

          {/* Step 4: Privacy */}
          <div className="space-y-6 mt-8">
            <div className="flex items-center gap-3 mb-6">
              <Skeleton className="w-8 h-8 rounded-lg" />
              <Skeleton className="w-20 h-6 rounded-lg" />
            </div>

            <div className="space-y-4">
              <div className="flex items-center gap-3">
                <Skeleton className="w-5 h-5 rounded-lg" />
                <Skeleton className="w-32 h-4 rounded-lg" />
              </div>
              <div className="flex items-center gap-3">
                <Skeleton className="w-5 h-5 rounded-lg" />
                <Skeleton className="w-28 h-4 rounded-lg" />
              </div>
            </div>
          </div>

          {/* Navigation Buttons */}
          <div className="flex justify-between items-center mt-8 pt-6 border-t border-slate-200/50">
            <Skeleton className="w-20 h-10 rounded-xl" />
            <div className="flex gap-3">
              <Skeleton className="w-16 h-10 rounded-xl" />
              <Skeleton className="w-20 h-10 rounded-xl" />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ReportItemSkeleton;
