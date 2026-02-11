import React from 'react';
import Skeleton from './Skeleton';

const AuthSkeleton = ({ isLogin = true }) => {
  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-50 via-white to-slate-50 flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        {/* Logo/Header */}
        <div className="text-center mb-8">
          <Skeleton className="w-16 h-16 rounded-full mx-auto mb-4" />
          <Skeleton className="w-48 h-8 mx-auto mb-2" />
          <Skeleton className="w-64 h-4 mx-auto" />
        </div>

        {/* Form Card */}
        <div className="bg-white/80 backdrop-blur-sm rounded-2xl border border-slate-200/50 shadow-lg p-8">
          {/* Form Title */}
          <div className="text-center mb-6">
            <Skeleton className="w-32 h-6 mx-auto mb-2" />
            <Skeleton className="w-48 h-4 mx-auto" />
          </div>

          {/* Form Fields */}
          <div className="space-y-4">
            {/* Email Field */}
            <div className="space-y-2">
              <Skeleton className="w-16 h-4 rounded-lg" />
              <Skeleton className="w-full h-12 rounded-xl" />
            </div>

            {/* Password Field */}
            <div className="space-y-2">
              <Skeleton className="w-20 h-4 rounded-lg" />
              <Skeleton className="w-full h-12 rounded-xl" />
            </div>

            {/* Additional Fields for Register */}
            {!isLogin && (
              <>
                <div className="space-y-2">
                  <Skeleton className="w-12 h-4 rounded-lg" />
                  <Skeleton className="w-full h-12 rounded-xl" />
                </div>
                <div className="space-y-2">
                  <Skeleton className="w-16 h-4 rounded-lg" />
                  <Skeleton className="w-full h-12 rounded-xl" />
                </div>
                <div className="space-y-2">
                  <Skeleton className="w-24 h-4 rounded-lg" />
                  <Skeleton className="w-full h-12 rounded-xl" />
                </div>
                <div className="space-y-2">
                  <Skeleton className="w-20 h-4 rounded-lg" />
                  <Skeleton className="w-full h-12 rounded-xl" />
                </div>
              </>
            )}

            {/* Remember Me / Forgot Password */}
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Skeleton className="w-4 h-4 rounded" />
                <Skeleton className="w-20 h-4 rounded-lg" />
              </div>
              {isLogin && <Skeleton className="w-24 h-4 rounded-lg" />}
            </div>

            {/* Submit Button */}
            <Skeleton className="w-full h-12 rounded-xl" />

            {/* Divider */}
            <div className="flex items-center gap-4 my-6">
              <Skeleton className="flex-1 h-px" />
              <Skeleton className="w-8 h-4 rounded-lg" />
              <Skeleton className="flex-1 h-px" />
            </div>

            {/* Social Login */}
            <div className="space-y-3">
              <Skeleton className="w-full h-12 rounded-xl" />
              <Skeleton className="w-full h-12 rounded-xl" />
            </div>
          </div>

          {/* Footer Links */}
          <div className="text-center mt-6">
            <Skeleton className="w-48 h-4 mx-auto" />
          </div>
        </div>

        {/* Bottom Link */}
        <div className="text-center mt-8">
          <Skeleton className="w-64 h-4 mx-auto" />
        </div>
      </div>
    </div>
  );
};

export default AuthSkeleton;
