// src/components/ui/skeleton.tsx
import React from 'react';

export const SkeletonCard: React.FC<{ 
  height?: string;
  className?: string;
}> = ({ height = 'h-64', className = '' }) => (
  <div className={`bg-white rounded-2xl shadow-lg border border-gray-100 ${height} ${className} animate-pulse`}>
    <div className="p-4 border-b border-gray-200">
      <div className="h-6 bg-gray-200 rounded w-1/2"></div>
    </div>
    <div className="p-4 space-y-3">
      <div className="h-4 bg-gray-200 rounded w-full"></div>
      <div className="h-4 bg-gray-200 rounded w-5/6"></div>
      <div className="h-4 bg-gray-200 rounded w-4/6"></div>
      <div className="h-4 bg-gray-200 rounded w-full"></div>
      <div className="h-4 bg-gray-200 rounded w-3/4"></div>
    </div>
  </div>
);

export const SkeletonText: React.FC<{ 
  lines?: number;
  className?: string;
}> = ({ lines = 3, className = '' }) => (
  <div className={`space-y-2 ${className}`}>
    {Array.from({ length: lines }).map((_, i) => (
      <div 
        key={i} 
        className="h-4 bg-gray-200 rounded animate-pulse"
        style={{ width: `${100 - (i * 10)}%` }}
      />
    ))}
  </div>
);

export const SkeletonImage: React.FC<{ 
  height?: string;
  className?: string;
}> = ({ height = 'h-64', className = '' }) => (
  <div className={`${height} ${className} bg-gray-200 rounded-lg animate-pulse flex items-center justify-center`}>
    <svg className="w-12 h-12 text-gray-300" fill="currentColor" viewBox="0 0 20 20">
      <path fillRule="evenodd" d="M4 3a2 2 0 00-2 2v10a2 2 0 002 2h12a2 2 0 002-2V5a2 2 0 00-2-2H4zm12 12H4l4-8 3 6 2-4 3 6z" clipRule="evenodd" />
    </svg>
  </div>
);