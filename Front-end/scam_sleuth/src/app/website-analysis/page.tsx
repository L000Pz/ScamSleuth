"use client";

import React, { useState, useEffect } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import { Search, Star, ArrowLeft, MessageSquare, AlertTriangle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import Image from 'next/image';
import heroImage from '@/assets/images/hero.png';
import { analyzeWebsite, type AnalysisResult } from './actions';

interface UserReview {
  id: string;
  rating: number;
  comment: string;
  date: string;
  helpful: number;
}

interface ReviewStats {
  averageRating: number;
  totalReviews: number;
  ratingBreakdown: {
    5: number;
    4: number;
    3: number;
    2: number;
    1: number;
  };
}

const WebsiteAnalysisPage: React.FC = () => {
  const searchParams = useSearchParams();
  const router = useRouter();
  const website = searchParams.get('site') || 'example.com';
  
  // State management
  const [isLoading, setIsLoading] = useState(true);
  const [analysisResult, setAnalysisResult] = useState<AnalysisResult | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [newReview, setNewReview] = useState({ rating: 0, comment: '' });
  const [hoveredRating, setHoveredRating] = useState(0);
  const [userReviews, setUserReviews] = useState<UserReview[]>([
    { 
      id: '1', 
      rating: 4, 
      comment: 'Website seems legitimate but some aspects could be improved. Good overall experience.', 
      date: '2 days ago', 
      helpful: 15 
    },
    { 
      id: '2', 
      rating: 5, 
      comment: 'Excellent security features and transparent business practices. Highly recommended.', 
      date: '1 week ago', 
      helpful: 23 
    },
    { 
      id: '3', 
      rating: 2, 
      comment: 'Some concerning elements found. Proceed with caution when using this website.', 
      date: '2 weeks ago', 
      helpful: 8 
    },
  ]);

  const reviewStats: ReviewStats = {
    averageRating: 3.8,
    totalReviews: 260,
    ratingBreakdown: { 5: 100, 4: 75, 3: 50, 2: 25, 1: 10 }
  };

  // Fetch analysis data on component mount
  useEffect(() => {
    const performAnalysis = async () => {
      setIsLoading(true);
      setError(null);
      
      try {
        const result = await analyzeWebsite(website);
        
        if (result.success && result.data) {
          setAnalysisResult(result.data);
        } else {
          setError(result.error || 'Failed to analyze website');
        }
      } catch (err) {
        setError('An unexpected error occurred during analysis');
        console.error('Analysis error:', err);
      } finally {
        setIsLoading(false);
      }
    };

    performAnalysis();
  }, [website]);

  const getTrustScoreColor = (score: number): string => {
    if (score >= 70) return 'bg-green-500';
    if (score >= 40) return 'bg-yellow-500';
    return 'bg-red-500';
  };

  const getTrustScoreLabel = (score: number): string => {
    if (score >= 70) return 'Trusted';
    if (score >= 40) return 'Caution';
    return 'High Risk';
  };

  const handleContactSpecialist = () => {
    // Navigate to contact page or open contact modal
    router.push('/contact');
  };

  const handleReportScam = () => {
    // Navigate to report page with pre-filled website
    router.push(`/report?website=${encodeURIComponent(website)}`);
  };

  const handleHelpfulClick = (reviewId: string) => {
    setUserReviews(reviews => 
      reviews.map(review => 
        review.id === reviewId 
          ? { ...review, helpful: review.helpful + 1 }
          : review
      )
    );
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="flex flex-col items-center gap-4">
          <div className="animate-spin rounded-full h-16 w-16 border-4 border-blue-500 border-t-transparent"></div>
          <p className="text-xl font-semibold text-gray-700">Analyzing website...</p>
          <p className="text-gray-500">This may take a few moments</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center bg-white rounded-2xl shadow-lg p-8 max-w-md">
          <div className="text-red-500 text-6xl mb-4">⚠️</div>
          <h2 className="text-2xl font-bold text-gray-800 mb-4">Analysis Failed</h2>
          <p className="text-gray-600 mb-6">{error}</p>
          <div className="space-y-3">
            <Button 
              variant="outline" 
              onClick={() => window.location.reload()} 
              className="w-full font-bold"
            >
              Try Again
            </Button>
            <Button 
              variant="ghost" 
              onClick={() => router.back()} 
              className="w-full font-medium"
            >
              Go Back
            </Button>
          </div>
        </div>
      </div>
    );
  }

  if (!analysisResult) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <p className="text-xl text-red-600 mb-4">No analysis data available</p>
          <Button variant="outline" onClick={() => router.back()} className="font-bold">
            Go Back
          </Button>
        </div>
      </div>
    );
  }

  const renderStars = (rating: number, interactive = false, onRate?: (rating: number) => void) => {
    return Array.from({ length: 5 }, (_, index) => (
      <Star
        key={index}
        className={`w-4 h-4 transition-colors ${
          interactive ? 'cursor-pointer' : ''
        } ${
          index < (interactive ? hoveredRating || rating : rating)
            ? 'text-yellow-400 fill-current' 
            : 'text-gray-300'
        }`}
        onClick={() => interactive && onRate && onRate(index + 1)}
        onMouseEnter={() => interactive && setHoveredRating(index + 1)}
        onMouseLeave={() => interactive && setHoveredRating(0)}
      />
    ));
  };

  const handleSubmitReview = () => {
    if (newReview.rating === 0 || !newReview.comment.trim()) return;
    
    const review: UserReview = {
      id: Date.now().toString(),
      rating: newReview.rating,
      comment: newReview.comment,
      date: 'Just now',
      helpful: 0
    };
    
    setUserReviews([review, ...userReviews]);
    setNewReview({ rating: 0, comment: '' });
    setHoveredRating(0);
  };

  return (
    <div className="min-h-screen bg-background relative">
      {/* Background Hero Image */}
      <div className="absolute inset-0 w-full overflow-hidden">
        <div className="absolute -left-[100px] w-2/3 bg-gradient-to-r from-black/8 via-black/4 to-transparent flex items-center justify-start">
          <Image 
            src={heroImage} 
            alt="Detective Dog" 
            width={1400}
            height={1400}
            className="opacity-20 object-contain -ml-20" 
            priority
          />
        </div>
      </div>

      <div className="relative z-10 container mx-auto px-4 py-6 max-w-7xl">
        {/* Back Button */}
        <Button 
          variant="ghost" 
          onClick={() => router.back()}
          className="mb-6 flex items-center gap-2 font-medium text-[16px]"
        >
          <ArrowLeft className="w-4 h-4" />
          Back to Search
        </Button>

        {/* Search Bar */}
        <div className="mb-8">
          <div className="relative max-w-lg mx-auto">
            <input
              type="text"
              value={website}
              readOnly
              className="w-full px-6 py-4 pr-14 rounded-full border-2 border-gray-300 bg-white text-center font-medium shadow-lg focus:outline-none"
            />
            <div className="absolute right-4 top-1/2 transform -translate-y-1/2">
              <Search className="w-5 h-5 text-gray-400" />
            </div>
          </div>
          
          {/* Score Badge */}
          <div className="text-center mt-6">
            <div className="inline-flex items-center bg-white rounded-full px-6 py-3 shadow-lg border">
              <span className="font-semibold text-gray-800 mr-3">{analysisResult.website}</span>
              <span className={`px-4 py-2 rounded-full text-white text-sm font-bold shadow-sm ${getTrustScoreColor(analysisResult.trustScore)}`}>
                Score: {analysisResult.trustScore}/100
              </span>
            </div>
          </div>
        </div>

        {/* Main Content Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          
          {/* Left Column */}
          <div className="space-y-6">
            {/* Trust Score Card */}
            <div className="bg-white rounded-2xl shadow-lg p-8 border border-gray-100">
              <h3 className="text-xl font-bold text-center mb-6 text-gray-800">Trust Score</h3>
              <div className="text-center">
                <div className="relative mb-6">
                  <div className="text-5xl font-black mb-2 text-gray-800">{analysisResult.trustScore}</div>
                  <div className="text-gray-500 text-xl font-medium">/100</div>
                  <div className={`text-sm font-bold mt-2 ${
                    analysisResult.trustScore >= 70 ? 'text-green-600' : 
                    analysisResult.trustScore >= 40 ? 'text-yellow-600' : 'text-red-600'
                  }`}>
                    {getTrustScoreLabel(analysisResult.trustScore)}
                  </div>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-4 shadow-inner">
                  <div 
                    className={`h-4 rounded-full transition-all duration-1000 shadow-sm ${getTrustScoreColor(analysisResult.trustScore)}`}
                    style={{ width: `${analysisResult.trustScore}%` }}
                  />
                </div>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="space-y-4">
              <Button 
                variant="ghost" 
                size="lg"
                onClick={handleContactSpecialist}
                className="w-full py-4 text-[16px] font-medium text-white bg-black flex items-center justify-center gap-2"
              >
                <MessageSquare className="w-5 h-5" />
                Need help? Contact our Specialist
              </Button>
              
              <Button 
                variant="outline" 
                size="lg"
                onClick={handleReportScam}
                className="w-full py-4 text-[16px] font-bold flex items-center justify-center gap-2 hover:bg-red hover:text-white hover:border-red transition-all duration-200"
              >
                <AlertTriangle className="w-5 h-5" />
                Report Scam!
              </Button>
            </div>

            {/* User Reviews Summary */}
            <div className="bg-white rounded-2xl shadow-lg p-6 border border-gray-100">
              <h3 className="text-lg font-bold mb-6 text-gray-800">User Score Based on Review</h3>
              <div className="flex items-center gap-3 mb-4">
                <span className="text-4xl font-bold text-gray-800">{reviewStats.averageRating}</span>
                <div className="flex">
                  {renderStars(Math.round(reviewStats.averageRating))}
                </div>
              </div>
              <p className="text-sm text-gray-600 mb-6">
                From {reviewStats.totalReviews} total reviews.
              </p>
              
              {/* Rating Breakdown */}
              <div className="space-y-3">
                {[5, 4, 3, 2, 1].map((rating) => (
                  <div key={rating} className="flex items-center gap-3 text-sm">
                    <span className="w-3 font-medium">{rating}</span>
                    <Star className="w-4 h-4 text-green-500 fill-current flex-shrink-0" />
                    <div className="flex-1 bg-gray-200 rounded-full h-2.5">
                      <div 
                        className="bg-green-500 h-2.5 rounded-full transition-all duration-500"
                        style={{ width: `${(reviewStats.ratingBreakdown[rating as keyof typeof reviewStats.ratingBreakdown] / reviewStats.totalReviews) * 100}%` }}
                      />
                    </div>
                    <span className="w-8 text-xs text-gray-500 text-right">
                      {reviewStats.ratingBreakdown[rating as keyof typeof reviewStats.ratingBreakdown]}
                    </span>
                  </div>
                ))}
              </div>
              <p className="text-xs text-gray-500 mt-4 italic">
                Reviews are made by registered members.
              </p>
            </div>
          </div>

          {/* Middle Column - Details and Description */}
          <div className="space-y-6">
            {/* Details Box */}
            <div className="bg-gray-200 rounded-2xl shadow-lg p-6 border border-gray-300">
              <h3 className="text-xl font-bold mb-6 text-gray-800">Details</h3>
              
              {/* Positive Points */}
              <div className="mb-8">
                <h4 className="text-sm font-bold text-green-600 mb-4 flex items-center gap-2">
                  <span className="w-2 h-2 bg-green-500 rounded-full"></span>
                  Positive points
                </h4>
                <ul className="space-y-3">
                  {analysisResult.positivePoints.map((point, index) => (
                    <li key={index} className="flex items-start gap-3 text-sm text-gray-700 leading-relaxed">
                      <span></span>
                      <span className="flex-1">{point}</span>
                    </li>
                  ))}
                </ul>
              </div>

              {/* Negative Points */}
              <div>
                <h4 className="text-sm font-bold text-red mb-4 flex items-center gap-2">
                  <span className="w-2 h-2 bg-red rounded-full"></span>
                  Negative points
                </h4>
                <ul className="space-y-3">
                  {analysisResult.negativePoints.map((point, index) => (
                    <li key={index} className="flex items-start gap-3 text-sm text-gray-700 leading-relaxed">
                      <span></span>
                      <span className="flex-1">{point}</span>
                    </li>
                  ))}
                </ul>
              </div>
            </div>

            {/* Description Box */}
            <div className="bg-gray-200 rounded-2xl shadow-lg p-6 border border-gray-300">
              <h3 className="text-xl font-bold mb-4 text-gray-800">Description</h3>
              <p className="text-sm text-gray-700 leading-relaxed mb-4">
                {analysisResult.description}
              </p>
            </div>
          </div>

          {/* Right Column - Screenshot */}
          <div className="bg-gray-200 rounded-2xl shadow-lg p-8 flex items-center justify-center h-[320px] border border-gray-300">
            <div className="text-center text-gray-500">
              <div className="text-7xl mb-4 opacity-60">🌐</div>
              <h3 className="text-2xl font-bold mb-2 text-gray-700">Screenshot</h3>
              <p className="text-sm">Website preview would appear here</p>
            </div>
          </div>
        </div>

        {/* Write a Review Section */}
        <div className="mt-12 bg-white rounded-2xl shadow-lg p-8 border border-gray-100">
          <h3 className="text-2xl font-bold mb-6 text-gray-800">Write a review!</h3>
          <div className="flex items-center gap-4 mb-6">
            <div className="flex">
              {renderStars(newReview.rating, true, (rating) => setNewReview({...newReview, rating}))}
            </div>
            <span className="text-sm text-gray-600 font-medium">
              {newReview.rating > 0 ? `${newReview.rating} star${newReview.rating > 1 ? 's' : ''}` : 'Click to rate'}
            </span>
          </div>
          <textarea
            value={newReview.comment}
            onChange={(e) => setNewReview({...newReview, comment: e.target.value})}
            placeholder="Share your experience with this website..."
            className="w-full h-32 p-4 border-2 border-gray-300 rounded-xl resize-none focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all mb-6"
          />
          <Button 
            variant="outline"
            size="lg"
            onClick={handleSubmitReview}
            disabled={newReview.rating === 0 || !newReview.comment.trim()}
            className="px-8 py-3 hover:border-black border border-transparent font-bold disabled:opacity-50 disabled:cursor-not-allowed"
          >
            Submit Review
          </Button>
        </div>

        {/* User Reviews List */}
        {userReviews.length > 0 && (
          <div className="mt-8">
            <h3 className="text-xl font-bold mb-6 text-gray-800">Recent Reviews</h3>
            <div className="space-y-4">
              {userReviews.map((review) => (
                <div key={review.id} className="bg-white rounded-xl shadow-md p-6 border border-gray-100 hover:shadow-lg transition-shadow">
                  <div className="flex items-center justify-between mb-3">
                    <div className="flex items-center gap-3">
                      {renderStars(review.rating)}
                      <span className="text-sm text-gray-500">{review.date}</span>
                    </div>
                    <Button 
                      variant="ghost" 
                      size="sm" 
                      onClick={() => handleHelpfulClick(review.id)}
                      className="text-blue-600 hover:text-blue-700 hover:bg-blue-50 font-medium"
                    >
                      👍 {review.helpful}
                    </Button>
                  </div>
                  <p className="text-gray-700 leading-relaxed">{review.comment}</p>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default WebsiteAnalysisPage;