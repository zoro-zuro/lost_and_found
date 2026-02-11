import React from 'react';
import Skeleton from './Skeleton';

const ProfileSkeleton = () => {
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

      <div className="max-w-4xl mx-auto px-4 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Profile Sidebar */}
          <div className="lg:col-span-1">
            <div className="bg-white/80 backdrop-blur-sm rounded-2xl border border-slate-200/50 shadow-lg p-6">
              {/* Profile Picture */}
              <div className="text-center mb-6">
                <Skeleton className="w-24 h-24 rounded-full mx-auto mb-4" />
                <Skeleton className="w-32 h-6 mx-auto mb-2" />
                <Skeleton className="w-24 h-4 mx-auto mb-1" />
                <Skeleton className="w-20 h-3 mx-auto" />
              </div>

              {/* Profile Actions */}
              <div className="space-y-3">
                <Skeleton className="w-full h-10 rounded-xl" />
                <Skeleton className="w-full h-10 rounded-xl" />
              </div>

              {/* Stats */}
              <div className="grid grid-cols-3 gap-4 mt-6 pt-6 border-t border-slate-200/50">
                <div className="text-center">
                  <Skeleton className="w-8 h-8 mx-auto mb-2 rounded-lg" />
                  <Skeleton className="w-4 h-4 mx-auto rounded" />
                </div>
                <div className="text-center">
                  <Skeleton className="w-8 h-8 mx-auto mb-2 rounded-lg" />
                  <Skeleton className="w-4 h-4 mx-auto rounded" />
                </div>
                <div className="text-center">
                  <Skeleton className="w-8 h-8 mx-auto mb-2 rounded-lg" />
                  <Skeleton className="w-4 h-4 mx-auto rounded" />
                </div>
              </div>
            </div>
          </div>

          {/* Main Content */}
          <div className="lg:col-span-2 space-y-6">
            {/* Personal Information */}
            <div className="bg-white/80 backdrop-blur-sm rounded-2xl border border-slate-200/50 shadow-lg p-6">
              <div className="flex items-center justify-between mb-6">
                <div className="flex items-center gap-3">
                  <Skeleton className="w-6 h-6 rounded-lg" />
                  <Skeleton className="w-32 h-6 rounded-lg" />
                </div>
                <Skeleton className="w-20 h-8 rounded-lg" />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Skeleton className="w-20 h-4 rounded-lg" />
                  <Skeleton className="w-full h-10 rounded-xl" />
                </div>
                <div className="space-y-2">
                  <Skeleton className="w-24 h-4 rounded-lg" />
                  <Skeleton className="w-full h-10 rounded-xl" />
                </div>
                <div className="space-y-2">
                  <Skeleton className="w-16 h-4 rounded-lg" />
                  <Skeleton className="w-full h-10 rounded-xl" />
                </div>
                <div className="space-y-2">
                  <Skeleton className="w-28 h-4 rounded-lg" />
                  <Skeleton className="w-full h-10 rounded-xl" />
                </div>
                <div className="md:col-span-2 space-y-2">
                  <Skeleton className="w-24 h-4 rounded-lg" />
                  <Skeleton className="w-full h-10 rounded-xl" />
                </div>
                <div className="md:col-span-2 space-y-2">
                  <Skeleton className="w-20 h-4 rounded-lg" />
                  <Skeleton className="w-full h-10 rounded-xl" />
                </div>
              </div>
            </div>

            {/* Academic Information */}
            <div className="bg-white/80 backdrop-blur-sm rounded-2xl border border-slate-200/50 shadow-lg p-6">
              <div className="flex items-center justify-between mb-6">
                <div className="flex items-center gap-3">
                  <Skeleton className="w-6 h-6 rounded-lg" />
                  <Skeleton className="w-36 h-6 rounded-lg" />
                </div>
                <Skeleton className="w-20 h-8 rounded-lg" />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Skeleton className="w-28 h-4 rounded-lg" />
                  <Skeleton className="w-full h-10 rounded-xl" />
                </div>
                <div className="space-y-2">
                  <Skeleton className="w-20 h-4 rounded-lg" />
                  <Skeleton className="w-full h-10 rounded-xl" />
                </div>
                <div className="space-y-2">
                  <Skeleton className="w-16 h-4 rounded-lg" />
                  <Skeleton className="w-full h-10 rounded-xl" />
                </div>
                <div className="space-y-2">
                  <Skeleton className="w-24 h-4 rounded-lg" />
                  <Skeleton className="w-full h-10 rounded-xl" />
                </div>
              </div>
            </div>

            {/* Notification Settings */}
            <div className="bg-white/80 backdrop-blur-sm rounded-2xl border border-slate-200/50 shadow-lg p-6">
              <div className="flex items-center justify-between mb-6">
                <div className="flex items-center gap-3">
                  <Skeleton className="w-6 h-6 rounded-lg" />
                  <Skeleton className="w-40 h-6 rounded-lg" />
                </div>
                <Skeleton className="w-20 h-8 rounded-lg" />
              </div>

              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div>
                    <Skeleton className="w-32 h-4 rounded-lg mb-1" />
                    <Skeleton className="w-48 h-3 rounded-lg" />
                  </div>
                  <Skeleton className="w-12 h-6 rounded-lg" />
                </div>
                <div className="flex items-center justify-between">
                  <div>
                    <Skeleton className="w-28 h-4 rounded-lg mb-1" />
                    <Skeleton className="w-40 h-3 rounded-lg" />
                  </div>
                  <Skeleton className="w-12 h-6 rounded-lg" />
                </div>
                <div className="flex items-center justify-between">
                  <div>
                    <Skeleton className="w-24 h-4 rounded-lg mb-1" />
                    <Skeleton className="w-36 h-3 rounded-lg" />
                  </div>
                  <Skeleton className="w-12 h-6 rounded-lg" />
                </div>
              </div>
            </div>

            {/* Save Button */}
            <div className="flex justify-end">
              <Skeleton className="w-24 h-12 rounded-xl" />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProfileSkeleton;
