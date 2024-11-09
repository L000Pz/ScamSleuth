export default function ScamCardSkeleton() {
    return (
      <div className="bg-grey rounded-xl shadow-lg overflow-hidden w-[280px] h-[337px] animate-pulse relative">
        {/* Dark Header Placeholder */}
        <div className="bg-gray-300 h-[33px] w-full"></div>
  
        {/* Image Placeholder */}
        <div className="mt-4 flex justify-center">
          <div className="w-[100px] h-[100px] bg-gradient-to-r from-gray-200 via-gray-300 to-gray-200 rounded-full animate-[shimmer_1.5s_infinite]"></div>
        </div>
  
        {/* Title Placeholder */}
        <div className="text-center px-4 py-2 mt-4">
          <div className="h-6 bg-gradient-to-r from-gray-200 via-gray-300 to-gray-200 rounded w-3/4 mx-auto animate-[shimmer_1.5s_infinite]"></div>
        </div>
  
        {/* Description Placeholder */}
        <div className="text-center px-4 mt-2">
          <div className="h-4 bg-gradient-to-r from-gray-200 via-gray-300 to-gray-200 rounded w-5/6 mx-auto animate-[shimmer_1.5s_infinite] mb-2"></div>
          <div className="h-4 bg-gradient-to-r from-gray-200 via-gray-300 to-gray-200 rounded w-4/6 mx-auto animate-[shimmer_1.5s_infinite]"></div>
        </div>
  
        {/* Button Placeholder */}
        <div className="flex justify-center pt-4">
          <div className="w-[100px] h-8 bg-gradient-to-r from-gray-200 via-gray-300 to-gray-200 rounded-full animate-[shimmer_1.5s_infinite]"></div>
        </div>
      </div>
    );
  }
  