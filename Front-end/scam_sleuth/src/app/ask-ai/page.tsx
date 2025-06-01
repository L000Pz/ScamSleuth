"use client"
import React, { useState, useEffect } from 'react';
import { Search, Star, Globe, Shield, AlertTriangle } from 'lucide-react';
import NextImage from 'next/image';
import heroImage from '@/assets/images/hero.png';

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

const WebsiteAnalysisPage: React.FC = () => {
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [isSearching, setIsSearching] = useState<boolean>(false);
  const [searchResult, setSearchResult] = useState<Website | null>(null);

  // Mock data for recent websites
  const [recentWebsites] = useState<Website[]>([
    { id: '1', name: 'amazon.com', score: 95, riskLevel: 'low', lastChecked: '2 hours ago' },
    { id: '2', name: 'suspicious-deals.net', score: 23, riskLevel: 'high', lastChecked: '1 hour ago' },
    { id: '3', name: 'paypal.com', score: 98, riskLevel: 'low', lastChecked: '30 minutes ago' },
    { id: '4', name: 'fake-bank-login.com', score: 12, riskLevel: 'high', lastChecked: '15 minutes ago' },
    { id: '5', name: 'legitimate-store.com', score: 78, riskLevel: 'medium', lastChecked: '5 minutes ago' }
  ]);

  // Mock data for recent reviews
  const [recentReviews] = useState<Review[]>([
    {
      id: '1',
      title: 'Phishing Email Campaign Targeting Bank Customers',
      description: 'Lorem ipsum dolor sit amet, consectetur adipiscing elit. Nam et efficitur ipsum, id hendrerit leo.',
      url: 'example.com',
      rating: 4,
      date: '2 days ago'
    },
    {
      id: '2',
      title: 'Fake Shopping Website Steals Credit Card Info',
      description: 'Lorem ipsum dolor sit amet, consectetur adipiscing elit. Nam et efficitur ipsum, id hendrerit leo.',
      url: 'example.com',
      rating: 4,
      date: '3 days ago'
    },
    {
      id: '3',
      title: 'Romance Scam on Dating Platform',
      description: 'Lorem ipsum dolor sit amet, consectetur adipiscing elit. Nam et efficitur ipsum, id hendrerit leo.',
      url: 'example.com',
      rating: 4,
      date: '1 week ago'
    }
  ]);

  const handleSearch = async (e: React.FormEvent | React.MouseEvent) => {
    e.preventDefault();
    if (!searchQuery.trim()) return;

    setIsSearching(true);
    
    // Simulate API call
    setTimeout(() => {
      // Mock analysis result
      const mockResult: Website = {
        id: Date.now().toString(),
        name: searchQuery,
        score: Math.floor(Math.random() * 100),
        riskLevel: Math.random() > 0.7 ? 'high' : Math.random() > 0.4 ? 'medium' : 'low',
        lastChecked: 'Just now'
      };
      
      setSearchResult(mockResult);
      setIsSearching(false);
    }, 2000);
  };

  const getScoreColor = (score: number): string => {
    if (score >= 80) return 'text-green-600';
    if (score >= 50) return 'text-yellow-600';
    return 'text-red-600';
  };

  const getScoreBgColor = (score: number): string => {
    if (score >= 80) return 'bg-green-100';
    if (score >= 50) return 'bg-yellow-100';
    return 'bg-red-100';
  };

  const getRiskIcon = (riskLevel: string) => {
    switch (riskLevel) {
      case 'low':
        return <Shield className="w-4 h-4 text-green-600" />;
      case 'medium':
        return <AlertTriangle className="w-4 h-4 text-yellow-600" />;
      case 'high':
        return <AlertTriangle className="w-4 h-4 text-red-600" />;
      default:
        return <Globe className="w-4 h-4 text-gray-600" />;
    }
  };

  const renderStars = (rating: number) => {
    return Array.from({ length: 5 }, (_, index) => (
      <Star
        key={index}
        className={`w-4 h-4 ${
          index < rating ? 'text-yellow-400 fill-current' : 'text-gray-300'
        }`}
      />
    ));
  };

  return (
    <div className="min-h-screen bg-background relative overflow-hidden">
      {/* Background Hero Image - Left Side */}
      <div className="absolute inset-0 w-full">
        {/* Left side with hero image - semi-transparent */}
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
                placeholder="Search a website"
                className="w-full px-6 py-4 text-lg rounded-full border-2 border-gray-300 focus:border-blue-500 focus:outline-none shadow-lg bg-white"
                disabled={isSearching}
                onKeyDown={(e) => {
                  if (e.key === 'Enter') {
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
              </div>
            </div>
          )}

          {/* Description */}
          <p className="text-lg md:text-xl text-black max-w-4xl mx-auto leading-relaxed">
            Don't let scams catch you off guard—be one step ahead with ScamSleuth. Our AI-powered 
            detective meticulously analyzes websites in real-time, uncovering hidden dangers, phishing 
            traps, and fraudulent schemes before they can deceive you. With a clear safety score and 
            expert insights, ScamSleuth helps you navigate the web fearlessly. Just drop a URL above, 
            and let's unmask the truth together!
          </p>
        </div>

        {/* Content Cards */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Recent Websites Card */}
          <div className="bg-white rounded-2xl shadow-lg p-6 border border-gray-200">
            <h3 className="text-2xl font-bold mb-6 text-gray-800 flex items-center gap-2">
              <Globe className="w-6 h-6" />
              Recent Websites
            </h3>
            <div className="space-y-4">
              {recentWebsites.map((website) => (
                <div key={website.id} className="flex items-center justify-between py-3 border-b border-gray-100 last:border-b-0">
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
              ))}
            </div>
          </div>

          {/* Recent Reviews Card */}
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
                    <a href="#" className="text-blue-600 hover:text-blue-800 text-sm font-medium transition-colors">
                      {review.url}
                    </a>
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