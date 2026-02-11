import React from 'react';
import Skeleton from './Skeleton';

const AdminRoomSkeleton = () => {
  return (
    <div className="w-full max-w-[1140px] mx-auto glass-panel rounded-t-[40px] flex flex-col overflow-hidden relative mt-5">
      {/* Header Section */}
      <div className="px-3 md:px-8 pt-6 md:pt-8 pb-4 md:pb-6">
        {/* Page Title */}
        <div className="text-center mb-6 md:mb-8">
          <Skeleton className="w-64 h-8 md:h-12 mx-auto mb-2" />
          <Skeleton className="w-96 h-4 md:h-6 mx-auto" />
        </div>

        {/* Mobile Search */}
        <div className="md:hidden flex flex-col gap-3 mb-4">
          <div className="flex items-center gap-2">
            <Skeleton className="flex-1 h-9 rounded-lg" />
          </div>
          <div className="bg-white/50 p-1 flex items-center gap-1 rounded-xl border border-white/60">
            <Skeleton className="flex-1 h-8 rounded-lg" />
            <Skeleton className="flex-1 h-8 rounded-lg" />
          </div>
        </div>

        {/* Desktop Search and Filters */}
        <div className="hidden md:flex items-center gap-4">
          <Skeleton className="flex-[6] h-12 rounded-xl" />
          <Skeleton className="flex-[2] h-12 rounded-xl" />
          <Skeleton className="flex-[2] h-12 rounded-xl" />
        </div>

        {/* Stats Cards */}
        <div className="mt-4 grid grid-cols-4 md:grid-cols-2 lg:grid-cols-4 gap-2 md:gap-6 mb-4 md:mb-6">
          {[...Array(4)].map((_, i) => (
            <div key={i} className="bg-white/60 backdrop-blur-sm border-2 border-slate-100 rounded-lg md:rounded-2xl p-2 md:p-6 flex flex-col items-center justify-center gap-1 md:gap-3 text-center">
              <Skeleton className="w-8 h-8 md:w-12 md:h-12 rounded-lg md:rounded-xl" />
              <Skeleton className="w-12 h-3 rounded-lg" />
              <Skeleton className="w-16 h-6 md:h-8 rounded-lg" />
            </div>
          ))}
        </div>
      </div>

      {/* Table Section */}
      <div className="flex-1 px-3 md:px-8 pb-10 md:pb-8 overflow-hidden">
        <div className="bg-white/40 backdrop-blur-sm rounded-xl md:rounded-2xl border border-white/30 overflow-hidden min-h-[400px]">
          {/* Table Header */}
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="bg-white/50 border-b border-white/30">
                  <th className="px-2 md:px-4 py-3 text-left w-[135px] md:w-[180px]">
                    <Skeleton className="w-full h-8 rounded-lg" />
                  </th>
                  <th className="px-2 md:px-4 py-3 text-left">
                    <Skeleton className="w-16 h-4 rounded-lg" />
                  </th>
                  <th className="hidden md:table-cell px-4 py-3 text-left">
                    <Skeleton className="w-20 h-4 rounded-lg" />
                  </th>
                  <th className="hidden lg:table-cell px-4 py-3 text-left">
                    <Skeleton className="w-20 h-4 rounded-lg" />
                  </th>
                  <th className="px-2 md:px-4 py-3 text-left">
                    <Skeleton className="w-12 h-4 rounded-lg" />
                  </th>
                  <th className="px-2 md:px-4 py-3 text-left">
                    <Skeleton className="w-12 h-4 rounded-lg" />
                  </th>
                  <th className="px-2 md:px-4 py-3 text-right">
                    <Skeleton className="w-8 h-4 rounded-lg ml-auto" />
                  </th>
                </tr>
              </thead>
              <tbody>
                {/* Table Rows Skeleton */}
                {[...Array(10)].map((_, i) => (
                  <tr key={i} className="border-b border-white/20">
                    <td className="px-2 md:px-4 py-4">
                      <Skeleton className="w-20 h-4 rounded-lg" />
                    </td>
                    <td className="px-2 md:px-4 py-4">
                      <Skeleton className="w-24 h-4 rounded-lg mb-1" />
                      <div className="md:hidden">
                        <Skeleton className="w-16 h-3 rounded-lg" />
                      </div>
                    </td>
                    <td className="hidden md:table-cell px-4 py-4">
                      <Skeleton className="w-20 h-4 rounded-lg" />
                    </td>
                    <td className="hidden lg:table-cell px-4 py-4">
                      <Skeleton className="w-24 h-4 rounded-lg" />
                    </td>
                    <td className="px-2 md:px-4 py-4">
                      <Skeleton className="w-20 h-4 rounded-lg" />
                    </td>
                    <td className="px-2 md:px-4 py-4">
                      <Skeleton className="w-16 h-6 rounded-full" />
                    </td>
                    <td className="px-2 md:px-4 py-4 text-right">
                      <Skeleton className="w-6 h-6 rounded-full ml-auto" />
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminRoomSkeleton;
