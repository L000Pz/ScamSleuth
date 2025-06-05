"use client";

import React, { useState, useEffect } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import { 
  Search, 
  Star, 
  ArrowLeft, 
  MessageSquare, 
  AlertTriangle, 
  Camera, 
  RefreshCw, 
  Download, 
  Maximize2,
  Globe,
  Calendar,
  Building,
  Shield,
  Server,
  Mail,
  Phone,
  MapPin
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import Image from 'next/image';
import heroImage from '@/assets/images/hero.png';
import { analyzeWebsite, getLatestScreenshotByDomain, getWhoisData, type AnalysisResult, type WhoisData } from './actions';

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
  const initialWebsite = searchParams.get('site') || 'example.com';
  
  // State management
  const [searchQuery, setSearchQuery] = useState<string>(initialWebsite);
  const [currentWebsite, setCurrentWebsite] = useState<string>(initialWebsite);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [isSearching, setIsSearching] = useState<boolean>(false);
  const [analysisResult, setAnalysisResult] = useState<AnalysisResult | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [newReview, setNewReview] = useState({ rating: 0, comment: '' });
  const [hoveredRating, setHoveredRating] = useState<number>(0);
  
  // Screenshot state
  const [screenshotUrl, setScreenshotUrl] = useState<string | null>(null);
  const [screenshotLoading, setScreenshotLoading] = useState<boolean>(false);
  const [screenshotError, setScreenshotError] = useState<string | null>(null);
  const [isScreenshotModalOpen, setIsScreenshotModalOpen] = useState<boolean>(false);

  // WHOIS state
  const [whoisData, setWhoisData] = useState<WhoisData | null>(null);
  const [whoisLoading, setWhoisLoading] = useState<boolean>(false);
  const [whoisError, setWhoisError] = useState<string | null>(null);

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

  // Format date helper
  const formatDate = (dateString: string | undefined): string => {
    if (!dateString) return 'Not available';
    try {
      const date = new Date(dateString);
      return date.toLocaleDateString('en-US', { 
        year: 'numeric', 
        month: 'long', 
        day: 'numeric' 
      });
    } catch {
      return 'Invalid date';
    }
  };

  // Calculate domain age helper
  const calculateDomainAge = (createdDate: string | undefined): string => {
    if (!createdDate) return 'Unknown';
    try {
      const created = new Date(createdDate);
      const now = new Date();
      const diffTime = Math.abs(now.getTime() - created.getTime());
      const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
      const years = Math.floor(diffDays / 365);
      const months = Math.floor((diffDays % 365) / 30);
      
      if (years > 0) {
        return `${years} year${years > 1 ? 's' : ''}${months > 0 ? ` and ${months} month${months > 1 ? 's' : ''}` : ''}`;
      } else if (months > 0) {
        return `${months} month${months > 1 ? 's' : ''}`;
      } else {
        return `${diffDays} day${diffDays > 1 ? 's' : ''}`;
      }
    } catch {
      return 'Unknown';
    }
  };

  // Fetch analysis data
  const performAnalysis = async (website: string) => {
    setIsLoading(true);
    setError(null);
    
    try {
      const result = await analyzeWebsite(website);
      
      if (result.success && result.data) {
        setAnalysisResult(result.data);
        setCurrentWebsite(website);
        
        // Set screenshot if available
        if (result.data.screenshotUrl) {
          setScreenshotUrl(result.data.screenshotUrl);
          setScreenshotError(null);
        } else {
          setScreenshotUrl(null);
          setScreenshotError('No screenshot available');
        }

        // Set WHOIS data if available
        if (result.data.whoisData) {
          setWhoisData(result.data.whoisData);
          setWhoisError(null);
        } else {
          setWhoisData(null);
          setWhoisError('WHOIS data not available');
        }
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

  // Refresh screenshot - just get the latest existing one
  const refreshScreenshot = async () => {
    if (!currentWebsite) return;
    
    setScreenshotLoading(true);
    setScreenshotError(null);
    
    try {
      // Just get the latest screenshot (don't capture new)
      const result = await getLatestScreenshotByDomain(currentWebsite);
      
      if (result.success && result.screenshotUrl) {
        setScreenshotUrl(result.screenshotUrl);
      } else {
        setScreenshotError(result.error || 'No screenshot available yet');
      }
    } catch (err) {
      setScreenshotError('An error occurred while loading screenshot');
      console.error('Screenshot error:', err);
    } finally {
      setScreenshotLoading(false);
    }
  };

  // Refresh WHOIS data
  const refreshWhoisData = async () => {
    if (!currentWebsite) return;
    
    setWhoisLoading(true);
    setWhoisError(null);
    
    try {
      const result = await getWhoisData(currentWebsite);
      
      if (result.success && result.data) {
        setWhoisData(result.data);
      } else {
        setWhoisError(result.error || 'WHOIS data not available');
      }
    } catch (err) {
      setWhoisError('An error occurred while loading WHOIS data');
      console.error('WHOIS error:', err);
    } finally {
      setWhoisLoading(false);
    }
  };

  // Download screenshot
  const downloadScreenshot = async () => {
    if (!screenshotUrl) return;
    
    try {
      // Convert base64 data URL to blob for download
      const response = await fetch(screenshotUrl);
      const blob = await response.blob();
      
      const link = document.createElement('a');
      const blobUrl = URL.createObjectURL(blob);
      link.href = blobUrl;
      link.download = `${currentWebsite}-screenshot.png`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      
      // Clean up the blob URL
      URL.revokeObjectURL(blobUrl);
    } catch (err) {
      console.error('Download error:', err);
    }
  };

  // Initial analysis on component mount
  useEffect(() => {
    performAnalysis(initialWebsite);
  }, [initialWebsite]);

  // Handle search functionality
  const handleSearch = async (e: React.FormEvent<HTMLFormElement> | React.MouseEvent<HTMLButtonElement>) => {
    e.preventDefault();
    
    if (!searchQuery.trim() || isSearching) return;
    
    const cleanQuery = searchQuery.trim();
    
    // Don't search if it's the same website
    if (cleanQuery === currentWebsite) return;
    
    setIsSearching(true);
    
    try {
      // Update URL without page reload
      const newUrl = new URL(window.location.href);
      newUrl.searchParams.set('site', cleanQuery);
      window.history.pushState({}, '', newUrl);
      
      // Perform new analysis
      await performAnalysis(cleanQuery);
      
      // Reset review form
      setNewReview({ rating: 0, comment: '' });
      setHoveredRating(0);
      
    } catch (err) {
      console.error('Search error:', err);
    } finally {
      setIsSearching(false);
    }
  };

  // Handle enter key in search input
  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      handleSearch(e as any);
    }
  };

  const getTrustScoreColor = (score: number): string => {
    if (score >= 70) return 'bg-green-500';
    if (score >= 40) return 'bg-yellow-500';
    return 'bg-red';
  };

  const getTrustScoreLabel = (score: number): string => {
    if (score >= 70) return 'Trusted';
    if (score >= 40) return 'Caution';
    return 'High Risk';
  };

  const handleContactSpecialist = () => {
    router.push('/contact');
  };

  const handleReportScam = () => {
    router.push(`/report?website=${encodeURIComponent(currentWebsite)}`);
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

  // Screenshot Modal Component
  const ScreenshotModal = () => {
    if (!isScreenshotModalOpen || !screenshotUrl) return null;

    return (
      <div 
        className="fixed inset-0 bg-black bg-opacity-75 flex items-center justify-center z-50 p-4"
        onClick={() => setIsScreenshotModalOpen(false)}
      >
        <div 
          className="relative max-w-6xl max-h-[90vh] bg-white rounded-lg overflow-hidden"
          onClick={(e) => e.stopPropagation()}
        >
          <div className="flex items-center justify-between p-4 border-b border-gray-200">
            <h3 className="text-lg font-semibold text-gray-800">
              Screenshot: {currentWebsite}
            </h3>
            <div className="flex items-center gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={downloadScreenshot}
                className="flex items-center gap-2"
              >
                <Download className="w-4 h-4" />
                Download
              </Button>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setIsScreenshotModalOpen(false)}
              >
                ✕
              </Button>
            </div>
          </div>
          <div className="p-4 max-h-[calc(90vh-80px)] overflow-auto">
            <Image
              src={screenshotUrl}
              alt={`Screenshot of ${currentWebsite}`}
              width={1200}
              height={800}
              className="w-full h-auto rounded-lg shadow-lg"
              unoptimized
            />
          </div>
        </div>
      </div>
    );
  };

  if (isLoading && !isSearching) {
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

  if (error && !analysisResult) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center bg-white rounded-2xl shadow-lg p-8 max-w-md">
          <div className="text-red text-6xl mb-4">⚠️</div>
          <h2 className="text-2xl font-bold text-gray-800 mb-4">Analysis Failed</h2>
          <p className="text-gray-600 mb-6">{error}</p>
          <div className="space-y-3">
            <Button 
              variant="outline" 
              onClick={() => router.push('/ask-ai')} 
              className="w-full font-bold"
            >
              Try Again
            </Button>
            <Button 
              variant="ghost" 
              onClick={() => router.push('/ask-ai')} 
              className="w-full font-medium"
            >
              Go Back
            </Button>
          </div>
        </div>
      </div>
    );
  }

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
          onClick={() => router.push('/ask-ai')}
          className="mb-6 flex items-center gap-2 font-medium text-[16px]"
        >
          <ArrowLeft className="w-4 h-4" />
          Back to Search
        </Button>

        {/* Functional Search Bar */}
        <div className="mb-8">
          <form onSubmit={handleSearch} className="relative max-w-lg mx-auto">
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder="Enter website URL (e.g., example.com)"
              disabled={isSearching || isLoading}
              className="w-full px-6 py-4 pr-14 rounded-full border-2 border-gray-300 bg-white text-center font-medium shadow-lg focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
            />
            <button
              type="submit"
              disabled={isSearching || isLoading || !searchQuery.trim()}
              className="absolute right-4 top-1/2 transform -translate-y-1/2 disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-100 rounded-full p-1 transition-colors"
            >
              {isSearching ? (
                <div className="w-5 h-5 border-2 border-gray-400 border-t-transparent rounded-full animate-spin" />
              ) : (
                <Search className="w-5 h-5 text-gray-400" />
              )}
            </button>
          </form>
          
          {/* Loading indicator for search */}
          {isSearching && (
            <div className="text-center mt-4">
              <p className="text-blue-600 font-medium">Analyzing new website...</p>
            </div>
          )}
          
          {/* Score Badge */}
          {analysisResult && (
            <div className="text-center mt-6">
              <div className="inline-flex items-center bg-white rounded-full px-6 py-3 shadow-lg border">
                <span className="font-semibold text-gray-800 mr-3">{analysisResult.website}</span>
                <span className={`px-4 py-2 rounded-full text-white text-sm font-bold shadow-sm ${getTrustScoreColor(analysisResult.trustScore)}`}>
                  Score: {analysisResult.trustScore}/100
                </span>
              </div>
            </div>
          )}
        </div>

        {/* Error Message */}
        {error && analysisResult && (
          <div className="mb-6 max-w-2xl mx-auto">
            <div className="bg-red-50 border border-red-200 rounded-xl p-4">
              <p className="text-red-600 text-center">
                <strong>Search Error:</strong> {error}
              </p>
            </div>
          </div>
        )}

        {/* Main Content - Only show if we have analysis results */}
        {analysisResult && (
          <>
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
                        analysisResult.trustScore >= 40 ? 'text-yellow-600' : 'text-red'
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
                          <span className="text-green-500 mt-1">✓</span>
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
                          <span className="text-red mt-1">⚠</span>
                          <span className="flex-1">{point}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>

                {/* Removed Description Box from here - moved to full-width section above review */}
              </div>

              {/* Right Column - Screenshot and WHOIS */}
              <div className="space-y-6">
                {/* Screenshot Card */}
                <div className="bg-white rounded-2xl shadow-lg border border-gray-100 overflow-hidden max-h-[480px]">
                  <div className="p-4 border-b border-gray-200">
                    <div className="flex items-center justify-between">
                      <h3 className="text-lg font-bold text-gray-800 flex items-center gap-2">
                        <Camera className="w-5 h-5" />
                        Website Screenshot
                      </h3>
                      <div className="flex items-center gap-2">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={refreshScreenshot}
                          disabled={screenshotLoading}
                          className="flex items-center gap-2"
                          title="Refresh screenshot"
                        >
                          <RefreshCw className={`w-4 h-4 ${screenshotLoading ? 'animate-spin' : ''}`} />
                          {screenshotLoading ? 'Loading...' : 'Refresh'}
                        </Button>
                        {screenshotUrl && (
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={downloadScreenshot}
                            className="flex items-center gap-2"
                          >
                            <Download className="w-4 h-4" />
                            Download
                          </Button>
                        )}
                      </div>
                    </div>
                  </div>
                  
                  <div className="relative h-[280px] bg-gray-50 overflow-hidden">
                    {screenshotLoading ? (
                      <div className="absolute inset-0 flex items-center justify-center">
                        <div className="flex flex-col items-center gap-3">
                          <div className="animate-spin rounded-full h-8 w-8 border-4 border-blue-500 border-t-transparent"></div>
                          <p className="text-sm text-gray-600">Loading screenshot...</p>
                        </div>
                      </div>
                    ) : screenshotUrl ? (
                      <div className="relative h-full group cursor-pointer" onClick={() => setIsScreenshotModalOpen(true)}>
                        <Image
                          src={screenshotUrl}
                          alt={`Screenshot of ${currentWebsite}`}
                          fill
                          className="object-cover object-top"
                          sizes="400px"
                          unoptimized
                        />
                        <div className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-30 transition-all duration-200 flex items-center justify-center">
                          <div className="opacity-0 group-hover:opacity-100 transition-opacity duration-200">
                            <div className="bg-white rounded-full p-3 shadow-lg">
                              <Maximize2 className="w-6 h-6 text-gray-800" />
                            </div>
                          </div>
                        </div>
                        <div className="absolute bottom-2 right-2 bg-black bg-opacity-75 text-white text-xs px-2 py-1 rounded opacity-0 group-hover:opacity-100 transition-opacity duration-200">
                          Click to enlarge
                        </div>
                      </div>
                    ) : (
                      <div className="absolute inset-0 flex items-center justify-center text-center p-4">
                        <div className="text-gray-500">
                          {screenshotError ? (
                            <>
                              <div className="text-4xl mb-3">📷</div>
                              <h4 className="text-lg font-semibold mb-2 text-gray-700">Screenshot Unavailable</h4>
                              <p className="text-sm text-gray-600 mb-3">{screenshotError}</p>
                              <p className="text-xs text-gray-500 mb-3">A new screenshot may be generating in the background</p>
                              <Button
                                variant="outline"
                                size="sm"
                                onClick={refreshScreenshot}
                                className="flex items-center gap-2 mx-auto"
                                title="Check for new screenshot"
                              >
                                <RefreshCw className="w-4 h-4" />
                                Check Again
                              </Button>
                            </>
                          ) : (
                            <>
                              <div className="text-6xl mb-4 opacity-60">🌐</div>
                              <h4 className="text-xl font-bold mb-2 text-gray-700">Loading Screenshot</h4>
                              <p className="text-sm">Please wait...</p>
                            </>
                          )}
                        </div>
                      </div>
                    )}
                  </div>
                </div>

                {/* WHOIS Information Card */}
                <div className="bg-white rounded-2xl shadow-lg border border-gray-100 overflow-hidden">
                  <div className="p-4 border-b border-gray-200">
                    <div className="flex items-center justify-between">
                      <h3 className="text-lg font-bold text-gray-800 flex items-center gap-2">
                        <Globe className="w-5 h-5" />
                        Domain Information
                      </h3>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={refreshWhoisData}
                        disabled={whoisLoading}
                        className="flex items-center gap-2"
                        title="Refresh WHOIS data"
                      >
                        <RefreshCw className={`w-4 h-4 ${whoisLoading ? 'animate-spin' : ''}`} />
                        {whoisLoading ? 'Loading...' : 'Refresh'}
                      </Button>
                    </div>
                  </div>
                  
                  <div className="p-4 max-h-[400px] overflow-y-auto">
                    {whoisLoading ? (
                      <div className="flex items-center justify-center py-8">
                        <div className="flex flex-col items-center gap-3">
                          <div className="animate-spin rounded-full h-6 w-6 border-4 border-blue-500 border-t-transparent"></div>
                          <p className="text-sm text-gray-600">Loading domain information...</p>
                        </div>
                      </div>
                    ) : whoisData ? (
                      <div className="space-y-4 text-sm">
                        {/* Domain Information */}
                        <div className="space-y-3">
                          <h4 className="font-semibold text-gray-800 flex items-center gap-2">
                            <Globe className="w-4 h-4" />
                            Domain Details
                          </h4>
                          <div className="bg-gray-50 rounded-lg p-3 space-y-2">
                            <div className="flex justify-between">
                              <span className="text-gray-600">Domain:</span>
                              <span className="font-medium">{whoisData.domain.domain}</span>
                            </div>
                            {whoisData.domain.created_date && (
                              <div className="flex justify-between">
                                <span className="text-gray-600">Created:</span>
                                <span className="font-medium">{formatDate(whoisData.domain.created_date)}</span>
                              </div>
                            )}
                            {whoisData.domain.created_date && (
                              <div className="flex justify-between">
                                <span className="text-gray-600">Age:</span>
                                <span className="font-medium">{calculateDomainAge(whoisData.domain.created_date)}</span>
                              </div>
                            )}
                            {whoisData.domain.expiration_date && (
                              <div className="flex justify-between">
                                <span className="text-gray-600">Expires:</span>
                                <span className="font-medium">{formatDate(whoisData.domain.expiration_date)}</span>
                              </div>
                            )}
                            {whoisData.domain.updated_date && (
                              <div className="flex justify-between">
                                <span className="text-gray-600">Updated:</span>
                                <span className="font-medium">{formatDate(whoisData.domain.updated_date)}</span>
                              </div>
                            )}
                          </div>
                        </div>

                        {/* Registrar Information */}
                        {whoisData.registrar && (
                          <div className="space-y-3">
                            <h4 className="font-semibold text-gray-800 flex items-center gap-2">
                              <Building className="w-4 h-4" />
                              Registrar
                            </h4>
                            <div className="bg-gray-50 rounded-lg p-3 space-y-2">
                              {whoisData.registrar.name && (
                                <div className="flex justify-between">
                                  <span className="text-gray-600">Name:</span>
                                  <span className="font-medium">{whoisData.registrar.name}</span>
                                </div>
                              )}
                              {whoisData.registrar.email && (
                                <div className="flex justify-between items-center">
                                  <span className="text-gray-600">Email:</span>
                                  <div className="flex items-center gap-1">
                                    <Mail className="w-3 h-3 text-gray-400" />
                                    <span className="font-medium text-xs">{whoisData.registrar.email}</span>
                                  </div>
                                </div>
                              )}
                              {whoisData.registrar.phone && (
                                <div className="flex justify-between items-center">
                                  <span className="text-gray-600">Phone:</span>
                                  <div className="flex items-center gap-1">
                                    <Phone className="w-3 h-3 text-gray-400" />
                                    <span className="font-medium">{whoisData.registrar.phone}</span>
                                  </div>
                                </div>
                              )}
                            </div>
                          </div>
                        )}

                        {/* Name Servers */}
                        {whoisData.domain.name_servers && whoisData.domain.name_servers.length > 0 && (
                          <div className="space-y-3">
                            <h4 className="font-semibold text-gray-800 flex items-center gap-2">
                              <Server className="w-4 h-4" />
                              Name Servers
                            </h4>
                            <div className="bg-gray-50 rounded-lg p-3">
                              <div className="space-y-1">
                                {whoisData.domain.name_servers.map((ns, index) => (
                                  <div key={index} className="text-xs font-mono bg-white px-2 py-1 rounded">
                                    {ns}
                                  </div>
                                ))}
                              </div>
                            </div>
                          </div>
                        )}

                        {/* Organization Information */}
                        {whoisData.registrant && (
                          <div className="space-y-3">
                            <h4 className="font-semibold text-gray-800 flex items-center gap-2">
                              <Building className="w-4 h-4" />
                              Registrant
                            </h4>
                            <div className="bg-gray-50 rounded-lg p-3 space-y-2">
                              {whoisData.registrant.organization && (
                                <div className="flex justify-between">
                                  <span className="text-gray-600">Organization:</span>
                                  <span className="font-medium">{whoisData.registrant.organization}</span>
                                </div>
                              )}
                              {(whoisData.registrant.country || whoisData.registrant.province) && (
                                <div className="flex justify-between items-center">
                                  <span className="text-gray-600">Location:</span>
                                  <div className="flex items-center gap-1">
                                    <MapPin className="w-3 h-3 text-gray-400" />
                                    <span className="font-medium">
                                      {[whoisData.registrant.province, whoisData.registrant.country]
                                        .filter(Boolean)
                                        .join(', ')}
                                    </span>
                                  </div>
                                </div>
                              )}
                            </div>
                          </div>
                        )}

                        {/* Domain Status */}
                        {whoisData.domain.status && whoisData.domain.status.length > 0 && (
                          <div className="space-y-3">
                            <h4 className="font-semibold text-gray-800 flex items-center gap-2">
                              <Shield className="w-4 h-4" />
                              Status
                            </h4>
                            <div className="bg-gray-50 rounded-lg p-3">
                              <div className="space-y-1">
                                {whoisData.domain.status.map((status, index) => (
                                  <div key={index} className="text-xs bg-white px-2 py-1 rounded flex items-center gap-2">
                                    <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                                    {status}
                                  </div>
                                ))}
                              </div>
                            </div>
                          </div>
                        )}
                      </div>
                    ) : (
                      <div className="flex items-center justify-center py-8 text-center">
                        <div className="text-gray-500">
                          {whoisError ? (
                            <>
                              <div className="text-4xl mb-3">🌐</div>
                              <h4 className="text-lg font-semibold mb-2 text-gray-700">Domain Info Unavailable</h4>
                              <p className="text-sm text-gray-600 mb-3">{whoisError}</p>
                              <Button
                                variant="outline"
                                size="sm"
                                onClick={refreshWhoisData}
                                className="flex items-center gap-2 mx-auto"
                                title="Retry WHOIS lookup"
                              >
                                <RefreshCw className="w-4 h-4" />
                                Try Again
                              </Button>
                            </>
                          ) : (
                            <>
                              <div className="text-6xl mb-4 opacity-60">🌐</div>
                              <h4 className="text-xl font-bold mb-2 text-gray-700">Loading Domain Info</h4>
                              <p className="text-sm">Please wait...</p>
                            </>
                          )}
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </div>

            {/* Description Box - Moved here as a full-width section */}
            <div className="mt-12 bg-white rounded-2xl shadow-lg p-8 border border-gray-100">
              <h3 className="text-2xl font-bold mb-6 text-gray-800">Analysis Description</h3>
              <div className="prose max-w-none">
                <p className="text-base text-gray-700 leading-relaxed">
                  {analysisResult.description}
                </p>
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
          </>
        )}
      </div>

      {/* Screenshot Modal */}
      <ScreenshotModal />
    </div>
  );
};

export default WebsiteAnalysisPage;