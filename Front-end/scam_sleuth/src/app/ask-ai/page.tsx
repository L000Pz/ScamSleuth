"use client"
import React, { useState, useEffect, JSX } from 'react';
import { Search, Star, Globe, Shield, AlertTriangle, RefreshCw } from 'lucide-react';
import NextImage from 'next/image';
import { useRouter } from 'next/navigation';
import heroImage from '@/assets/images/hero.png';
import { quickAnalyzeWebsite } from '../website-analysis/actions';
import { getRecentWebsites, getRecentWebsiteStats, type TransformedWebsite } from './actions';

interface Website {
  id: string;
  name: string;
  score: number;
  riskLevel: 'low' | 'medium' | 'high';
  lastChecked: string;
}

interface Review {
  id: string;
  title: string;
  description: string;
  url: string;
  rating: number;
  date: string;
}

interface WebsiteStats {
  totalAnalyzed: number;
  highRiskCount: number;
  mediumRiskCount: number;
  lowRiskCount: number;
  averageScore: number;
}

const WebsiteAnalysisPage: React.FC = () => {
  const router = useRouter();
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [isSearching, setIsSearching] = useState<boolean>(false);
  const [searchResult, setSearchResult] = useState<Website | null>(null);
  const [searchError, setSearchError] = useState<string | null>(null);
  
  // Real data states
  const [recentWebsites, setRecentWebsites] = useState<Website[]>([]);
  const [isLoadingWebsites, setIsLoadingWebsites] = useState<boolean>(true);
  const [websitesError, setWebsitesError] = useState<string | null>(null);
  const [websiteStats, setWebsiteStats] = useState<WebsiteStats | null>(null);
  const [lastRefresh, setLastRefresh] = useState<Date>(new Date());

  // Mock data for recent reviews (keeping this as mock since we don't have an endpoint for reviews)
  const [recentReviews] = useState<Review[]>([
    {
      id: '1',
      title: 'Phishing Email Campaign Targeting Bank Customers',
      description: 'Recent analysis reveals sophisticated phishing attempts targeting major bank customers with fake login pages.',
      url: 'suspicious-bank-site.com',
      rating: 4,
      date: '2 days ago'
    },
    {
      id: '2',
      title: 'Fake Shopping Website Steals Credit Card Info',
      description: 'Investigation shows this e-commerce site collects payment information without delivering products.',
      url: 'fake-shop-deals.net',
      rating: 4,
      date: '3 days ago'
    },
    {
      id: '3',
      title: 'Romance Scam on Dating Platform',
      description: 'Profile analysis indicates fraudulent accounts using stolen photos to manipulate victims financially.',
      url: 'dating-scammer.com',
      rating: 4,
      date: '1 week ago'
    }
  ]);

  // Fetch recent websites on component mount
  useEffect(() => {
    fetchRecentWebsites();
  }, []);

  const fetchRecentWebsites = async (): Promise<void> => {
    try {
      setIsLoadingWebsites(true);
      setWebsitesError(null);
      
      // Fetch both recent websites and stats
      const [websitesResult, statsResult] = await Promise.all([
        getRecentWebsites(),
        getRecentWebsiteStats()
      ]);
      
      if (websitesResult.success && websitesResult.data) {
        // Transform the data to match our interface
        const transformedWebsites: Website[] = websitesResult.data.map((website: TransformedWebsite) => ({
          id: website.id,
          name: website.name,
          score: website.score,
          riskLevel: website.riskLevel,
          lastChecked: website.lastChecked
        }));
        
        setRecentWebsites(transformedWebsites);
      } else {
        setWebsitesError(websitesResult.error || 'Failed to load recent websites');
      }

      if (statsResult.success && statsResult.data) {
        setWebsiteStats(statsResult.data);
      }

      setLastRefresh(new Date());
    } catch (error) {
      console.error('Error fetching recent websites:', error);
      setWebsitesError('An unexpected error occurred while loading websites');
    } finally {
      setIsLoadingWebsites(false);
    }
  };

  const handleRefresh = (): void => {
    fetchRecentWebsites();
  };

  const handleSearch = async (e: React.FormEvent | React.MouseEvent): Promise<void> => {
    e.preventDefault();
    if (!searchQuery.trim()) return;

    setIsSearching(true);
    setSearchError(null);
    setSearchResult(null);
    
    try {
      const result = await quickAnalyzeWebsite(searchQuery.trim());
      
      if (result.success && result.data) {
        const website: Website = {
          id: Date.now().toString(),
          name: result.data.name,
          score: result.data.score,
          riskLevel: result.data.riskLevel,
          lastChecked: result.data.lastChecked
        };
        
        setSearchResult(website);
        
        // Navigate to detailed results after showing preview
        setTimeout(() => {
          router.push(`/website-analysis?site=${encodeURIComponent(result.data!.name)}`);
        }, 3000);
      } else {
        setSearchError(result.error || 'Analysis failed');
      }
    } catch (error) {
      setSearchError('An unexpected error occurred during analysis');
      console.error('Search error:', error);
    } finally {
      setIsSearching(false);
    }
  };

  const handleWebsiteClick = (website: Website): void => {
    router.push(`/website-analysis?site=${encodeURIComponent(website.name)}`);
  };

  const getScoreColor = (score: number): string => {
    if (score >= 70) return 'text-green-600';
    if (score >= 40) return 'text-yellow-600';
    return 'text-red';
  };

  const getScoreBgColor = (score: number): string => {
    if (score >= 70) return 'bg-green-100';
    if (score >= 40) return 'bg-yellow-100';
    return 'bg-red/10';
  };

  const getRiskIcon = (riskLevel: string): JSX.Element => {
    switch (riskLevel) {
      case 'low':
        return <Shield className="w-4 h-4 text-green-600" />;
      case 'medium':
        return <AlertTriangle className="w-4 h-4 text-yellow-600" />;
      case 'high':
        return <AlertTriangle className="w-4 h-4 text-red" />;
      default:
        return <Globe className="w-4 h-4 text-gray-600" />;
    }
  };

  const renderStars = (rating: number): JSX.Element[] => {
    return Array.from({ length: 5 }, (_, index) => (
      <Star
        key={index}
        className={`w-4 h-4 ${
          index < rating ? 'text-yellow-400 fill-current' : 'text-gray-300'
        }`}
      />
    ));
  };

  const formatLastRefresh = (date: Date): string => {
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffMins = Math.floor(diffMs / (1000 * 60));
    
    if (diffMins < 1) return 'Just now';
    if (diffMins < 60) return `${diffMins}m ago`;
    
    const diffHours = Math.floor(diffMins / 60);
    if (diffHours < 24) return `${diffHours}h ago`;
    
    const diffDays = Math.floor(diffHours / 24);
    return `${diffDays}d ago`;
  };

  return (
    <div className="min-h-screen bg-background relative overflow-hidden">
      {/* Background Hero Image - Left Side */}
      <div className="absolute inset-0 w-full">
        <div className="absolute -left-[100px] w-2/3 bg-gradient-to-r from-black/10 via-black/5 to-transparent overflow-hidden flex items-center justify-start pl-0">
          <NextImage 
            src={heroImage} 
            alt="Detective Dog" 
            width={1500}
            height={1500}
            className="opacity-25 object-contain -ml-20" 
          />
        </div>
      </div>

      <div className="relative z-10 container mx-auto px-4 py-8 max-w-7xl">
        {/* Header Section */}
        <div className="text-center mb-12">
          <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold text-black mb-4 leading-tight">
            Think Before You Click!
          </h1>
          <h2 className="text-2xl md:text-3xl lg:text-4xl font-semibold text-black mb-8">
            Check Any Websites for Scams.
          </h2>

          {/* Search Bar */}
          <div className="max-w-2xl mx-auto mb-8">
            <div className="relative">
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Enter website URL (e.g., example.com)"
                className="w-full px-6 py-4 text-lg rounded-full border-2 border-gray-300 focus:border-blue-500 focus:outline-none shadow-lg bg-white"
                disabled={isSearching}
                onKeyDown={(e) => {
                  if (e.key === 'Enter') {
                    // eslint-disable-next-line @typescript-eslint/no-explicit-any
                    handleSearch(e as any);
                  }
                }}
              />
              <button
                onClick={handleSearch}
                disabled={isSearching || !searchQuery.trim()}
                className="absolute right-2 top-2 bg-black text-white p-3 rounded-full hover:bg-gray-800 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isSearching ? (
                  <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                ) : (
                  <Search className="w-5 h-5" />
                )}
              </button>
            </div>
          </div>

          {/* Search Result */}
          {searchResult && (
            <div className="max-w-2xl mx-auto mb-8">
              <div className="bg-white rounded-2xl shadow-lg p-6 border border-gray-200">
                <h3 className="text-xl font-bold mb-4 text-gray-800">Analysis Result</h3>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    {getRiskIcon(searchResult.riskLevel)}
                    <span className="font-medium text-gray-700">{searchResult.name}</span>
                  </div>
                  <div className={`px-4 py-2 rounded-full font-bold ${getScoreBgColor(searchResult.score)} ${getScoreColor(searchResult.score)}`}>
                    {searchResult.score}/100
                  </div>
                </div>
                <p className="text-sm text-gray-500 mt-2">Analyzed {searchResult.lastChecked}</p>
                <p className="text-sm text-blue-600 mt-2">Redirecting to detailed analysis...</p>
              </div>
            </div>
          )}

          {/* Search Error */}
          {searchError && (
            <div className="max-w-2xl mx-auto mb-8">
              <div className="bg-red-50 border border-red-200 rounded-2xl p-6">
                <h3 className="text-xl font-bold mb-2 text-red-800">Analysis Failed</h3>
                <p className="text-red-600">{searchError}</p>
                <button 
                  onClick={() => {setSearchError(null); setSearchQuery('');}}
                  className="mt-3 text-sm text-red-700 hover:text-red-900 underline"
                >
                  Try again
                </button>
              </div>
            </div>
          )}

          {/* Stats Summary */}
          {websiteStats && (
            <div className="max-w-4xl mx-auto mb-8">
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <div className="bg-white rounded-xl p-4 shadow-md border border-gray-200">
                  <div className="text-2xl font-bold text-blue-600">{websiteStats.totalAnalyzed}</div>
                  <div className="text-sm text-gray-600">Analyzed</div>
                </div>
                <div className="bg-white rounded-xl p-4 shadow-md border border-gray-200">
                  <div className="text-2xl font-bold text-red">{websiteStats.highRiskCount}</div>
                  <div className="text-sm text-gray-600">High Risk</div>
                </div>
                <div className="bg-white rounded-xl p-4 shadow-md border border-gray-200">
                  <div className="text-2xl font-bold text-yellow-600">{websiteStats.mediumRiskCount}</div>
                  <div className="text-sm text-gray-600">Medium Risk</div>
                </div>
                <div className="bg-white rounded-xl p-4 shadow-md border border-gray-200">
                  <div className="text-2xl font-bold text-green-600">{websiteStats.lowRiskCount}</div>
                  <div className="text-sm text-gray-600">Low Risk</div>
                </div>
              </div>
            </div>
          )}

          {/* Description */}
          <p className="text-lg md:text-xl text-black max-w-4xl mx-auto leading-relaxed">
            Don&apos;t let scams catch you off guard—be one step ahead with ScamSleuth. Our AI-powered 
            detective meticulously analyzes websites in real-time, uncovering hidden dangers, phishing 
            traps, and fraudulent schemes before they can deceive you. With a clear safety score and 
            expert insights, ScamSleuth helps you navigate the web fearlessly. Just drop a URL above, 
            and let&apos;s unmask the truth together!
          </p>
        </div>

        {/* Content Cards */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Recent Websites Card */}
          <div className="bg-white rounded-2xl shadow-lg p-6 border border-gray-200">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-2xl font-bold text-gray-800 flex items-center gap-2">
                <Globe className="w-6 h-6" />
                Recent Websites
              </h3>
              <div className="flex items-center gap-2">
                <span className="text-xs text-gray-500">
                  Updated {formatLastRefresh(lastRefresh)}
                </span>
                <button
                  onClick={handleRefresh}
                  disabled={isLoadingWebsites}
                  className="p-2 hover:bg-gray-100 rounded-full transition-colors disabled:opacity-50"
                  title="Refresh recent websites"
                >
                  <RefreshCw className={`w-4 h-4 text-gray-500 ${isLoadingWebsites ? 'animate-spin' : ''}`} />
                </button>
              </div>
            </div>

            {/* Loading State */}
            {isLoadingWebsites && (
              <div className="space-y-4">
                {[...Array(5)].map((_, index) => (
                  <div key={index} className="animate-pulse">
                    <div className="flex items-center justify-between py-3 border-b border-gray-100">
                      <div className="flex items-center gap-3">
                        <div className="w-4 h-4 bg-gray-200 rounded"></div>
                        <div>
                          <div className="h-4 bg-gray-200 rounded w-32 mb-1"></div>
                          <div className="h-3 bg-gray-200 rounded w-20"></div>
                        </div>
                      </div>
                      <div className="w-12 h-6 bg-gray-200 rounded-full"></div>
                    </div>
                  </div>
                ))}
              </div>
            )}

            {/* Error State */}
            {websitesError && !isLoadingWebsites && (
              <div className="text-center py-8">
                <div className="text-red text-sm mb-4">{websitesError}</div>
                <button
                  onClick={handleRefresh}
                  className="px-4 py-2 bg-red text-white rounded-lg hover:bg-red/90 transition-colors"
                >
                  Try Again
                </button>
              </div>
            )}

            {/* Websites List */}
            {!isLoadingWebsites && !websitesError && (
              <div className="space-y-4">
                {recentWebsites.length === 0 ? (
                  <div className="text-center py-8 text-gray-500">
                    <Globe className="w-12 h-12 mx-auto mb-4 opacity-50" />
                    <p>No recent website analyses found</p>
                    <button
                      onClick={handleRefresh}
                      className="mt-2 text-blue-600 hover:text-blue-800 underline"
                    >
                      Refresh
                    </button>
                  </div>
                ) : (
                  recentWebsites.map((website) => (
                    <div 
                      key={website.id} 
                      onClick={() => handleWebsiteClick(website)}
                      className="flex items-center justify-between py-3 border-b border-gray-100 last:border-b-0 cursor-pointer hover:bg-gray-50 rounded px-2 transition-colors"
                    >
                      <div className="flex items-center gap-3">
                        {getRiskIcon(website.riskLevel)}
                        <div>
                          <p className="font-medium text-gray-800">{website.name}</p>
                          <p className="text-sm text-gray-500">Checked {website.lastChecked}</p>
                        </div>
                      </div>
                      <div className={`px-3 py-1 rounded-full text-sm font-bold ${getScoreBgColor(website.score)} ${getScoreColor(website.score)}`}>
                        {website.score}
                      </div>
                    </div>
                  ))
                )}
              </div>
            )}
          </div>

          {/* Recent Reviews Card - Still using mock data */}
          <div className="bg-white rounded-2xl shadow-lg p-6 border border-gray-200">
            <h3 className="text-2xl font-bold mb-6 text-gray-800 flex items-center gap-2">
              <Star className="w-6 h-6" />
              Recent Reviews
            </h3>
            <div className="space-y-6">
              {recentReviews.map((review) => (
                <div key={review.id} className="border-b border-gray-100 pb-4 last:border-b-0 last:pb-0">
                  <div className="flex items-start justify-between mb-2">
                    <h4 className="font-semibold text-gray-800 text-sm leading-tight">{review.title}</h4>
                    <div className="flex items-center gap-1 ml-4 flex-shrink-0">
                      {renderStars(review.rating)}
                      <span className="text-sm font-bold text-gray-700 ml-1">{review.rating}</span>
                    </div>
                  </div>
                  <p className="text-sm text-gray-600 mb-2 leading-relaxed">{review.description}</p>
                  <div className="flex items-center justify-between">
                    <button 
                      onClick={() => router.push(`/website-analysis?site=${encodeURIComponent(review.url)}`)}
                      className="text-blue-600 hover:text-blue-800 text-sm font-medium transition-colors"
                    >
                      {review.url}
                    </button>
                    <span className="text-xs text-gray-500">{review.date}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default WebsiteAnalysisPage;