/* eslint-disable prefer-const */
// List
"use client";

import { Button } from '@/components/ui/button';
import { useRouter } from 'next/navigation';
import { useState, useEffect, useCallback } from 'react'; // Added useCallback
import { Search, Filter, Grid, List, Calendar, TrendingUp, Shield, Clock, ArrowUpDown } from 'lucide-react';
import Image from 'next/image';
import heroImage from '@/assets/images/hero.png';
import { fetchScamReports, searchScamReportsByTitle, type ScamReport } from './actions'; // Imported searchScamReportsByTitle

// Enhanced ScamCard component with better design (risk tags removed)
interface ScamCardProps {
  scam: ScamReport;
  onReview: (id: string) => void;
  viewMode: 'grid' | 'list';
}

const ScamCard = ({ scam, onReview, viewMode }: ScamCardProps) => {
  if (viewMode === 'grid') {
    return (
      <div className="group bg-cardWhite rounded-2xl shadow-md hover:shadow-xl transition-all duration-300 overflow-hidden border border-gradWhite/30 hover:border-red/40 hover:-translate-y-1">
        {/* Header */}
        <div className="relative h-32 bg-gradient-to-br from-black to-gradWhite overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
          <Image 
            src={heroImage} 
            alt="Scam illustration" 
            fill
            className="object-cover opacity-30"
          />
          <div className="absolute bottom-4 left-4">
            <span className="px-3 py-1 bg-black/60 backdrop-blur-sm text-white text-xs rounded-full font-medium">
              {scam.type}
            </span>
          </div>
        </div>

        {/* Content */}
        <div className="p-6 flex flex-col h-40">
          <h3 className="font-bold text-lg text-black mb-2 line-clamp-2 group-hover:text-red transition-colors flex-grow overflow-hidden text-ellipsis">
            {scam.name}
          </h3>
          
          <div className="flex items-center gap-2 text-sm text-black/70 mb-4">
            <Calendar className="w-4 h-4" />
            <span>{scam.date}</span>
          </div>

          <Button 
            onClick={() => onReview(scam.id)}
            className="w-full bg-gradient-to-r from-red to-red/90 hover:from-red/90 hover:to-red text-white border-0 rounded-xl font-semibold transition-all duration-200 hover:scale-105 mt-auto"
          >
            View Details
          </Button>
        </div>
      </div>
    );
  }

  // List view
  return (
    <div className="group bg-cardWhite rounded-xl shadow-md hover:shadow-lg transition-all duration-300 overflow-hidden border border-gradWhite/30 hover:border-red/40">
      <div className="flex items-stretch min-h-24">
        {/* Left accent */}
        <div className="w-2 bg-red flex-shrink-0" />
        
        {/* Image */}
        <div className="w-16 h-16 sm:w-20 sm:h-20 m-4 relative rounded-lg overflow-hidden flex-shrink-0 self-center">
          <Image 
            src={heroImage} 
            alt="Scam illustration" 
            fill
            className="object-cover"
          />
        </div>

        {/* Content */}
        <div className="flex-1 py-4 pr-4 flex flex-col justify-between min-h-24">
          <div className="flex-1">
            <h3 className="font-bold text-base sm:text-lg text-black mb-2 line-clamp-2 group-hover:text-red transition-colors overflow-hidden text-ellipsis">
              {scam.name}
            </h3>
            <div className="flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-4 text-sm text-black/70">
              <span className="flex items-center gap-1">
                <Calendar className="w-4 h-4" />
                {scam.date}
              </span>
              <span className="px-2 py-1 bg-gradWhite/30 text-black rounded-full text-xs font-medium w-fit">
                {scam.type}
              </span>
            </div>
          </div>
          
          <div className="mt-3 flex justify-end">
            <Button 
              onClick={() => onReview(scam.id)}
              variant="outline"
              size="sm"
              className="rounded-full hover:bg-red hover:text-white hover:border-red transition-all duration-200 font-semibold border-gradWhite/50"
            >
              View Details
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default function ScamsPage() {
  const router = useRouter();
  const [sortBy, setSortBy] = useState<'date' | 'name' | 'type'>('date');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('desc');
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedType, setSelectedType] = useState<string>('all');
  const [isLoading, setIsLoading] = useState(true);
  const [reports, setReports] = useState<ScamReport[]>([]);
  const [filteredReports, setFilteredReports] = useState<ScamReport[]>([]);
  const [backendSearchResults, setBackendSearchResults] = useState<ScamReport[]>([]); // New state for backend results
  const [isSearchingBackend, setIsSearchingBackend] = useState(false); // New state for backend search loading
  const [error, setError] = useState<string | null>(null);

  // Get unique scam types for filter
  const scamTypes = Array.from(new Set(reports.map(report => report.type)));

  useEffect(() => {
    const loadReports = async () => {
      setIsLoading(true);
      const { data, error: fetchError } = await fetchScamReports();
      
      if (fetchError) {
        setError(fetchError);
      } else if (data) {
        setReports(data);
        // Initially, filtered reports are all reports
        setFilteredReports(data); 
      }
      
      setIsLoading(false);
    };

    loadReports();
  }, []);

  // Effect for backend search and combining results
  useEffect(() => {
    const performSearch = async () => {
      if (searchQuery.trim() === '') {
        setBackendSearchResults([]); // Clear backend results if search query is empty
        setIsSearchingBackend(false);
        return;
      }

      setIsSearchingBackend(true);
      const { data, error: searchError } = await searchScamReportsByTitle(searchQuery);
      if (searchError) {
        console.error("Backend search error:", searchError);
        // Optionally, show an error to the user
      } else if (data) {
        setBackendSearchResults(data);
      }
      setIsSearchingBackend(false);
    };

    const handler = setTimeout(() => {
      performSearch();
    }, 500); // Debounce search to avoid too many API calls

    return () => {
      clearTimeout(handler);
    };
  }, [searchQuery]); // Rerun when search query changes

  // Filter and sort reports (now considers backendSearchResults)
  useEffect(() => {
    // Combine initial reports and backend search results
    let combinedReports = [...reports];
    if (backendSearchResults.length > 0 && searchQuery.trim() !== '') {
      // Filter out duplicates from backendSearchResults that are already in reports
      const uniqueBackendResults = backendSearchResults.filter(
        (backendScam) => !reports.some((report) => report.id === backendScam.id)
      );
      combinedReports = [...reports, ...uniqueBackendResults];
    }

    let filtered = combinedReports.filter(report => {
      const matchesSearch = report.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                           report.type.toLowerCase().includes(searchQuery.toLowerCase());
      const matchesType = selectedType === 'all' || report.type === selectedType;
      return matchesSearch && matchesType;
    });

    // Sort reports
    filtered.sort((a, b) => {
      let comparison = 0;
      
      switch (sortBy) {
        case 'date':
          comparison = new Date(a.date).getTime() - new Date(b.date).getTime();
          break;
        case 'name':
          comparison = a.name.localeCompare(b.name);
          break;
        case 'type':
          comparison = a.type.localeCompare(b.type);
          break;
      }
      
      return sortOrder === 'desc' ? -comparison : comparison;
    });

    setFilteredReports(filtered);
  }, [reports, searchQuery, selectedType, sortBy, sortOrder, backendSearchResults]); // Added backendSearchResults as dependency

  const handleSort = (criteria: 'date' | 'name' | 'type') => {
    if (sortBy === criteria) {
      setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc');
    } else {
      setSortBy(criteria);
      setSortOrder('desc');
    }
  };

  const handleReview = (id: string) => {
    router.push(`/scams/${id}`);
  };

  if (isLoading) {
    return (
      <div className="min-h-screen" style={{ backgroundColor: '#BBB8AF' }}>
        <div className="container mx-auto px-4 py-8">
          {/* Loading skeleton */}
          <div className="animate-pulse">
            <div className="h-12 bg-cardWhite rounded-lg mb-8 w-1/3"></div>
            <div className="h-16 bg-cardWhite rounded-xl mb-8"></div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {Array.from({ length: 6 }).map((_, i) => (
                <div key={i} className="h-80 bg-cardWhite rounded-2xl"></div>
              ))}
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center" style={{ backgroundColor: '#BBB8AF' }}>
        <div className="text-center bg-cardWhite rounded-2xl shadow-lg p-8 max-w-md">
          <div className="text-red text-6xl mb-4">⚠️</div>
          <h2 className="text-2xl font-bold text-black mb-4">Oops! Something went wrong</h2>
          <p className="text-black/70 mb-6">{error}</p>
          <Button 
            onClick={() => window.location.reload()} 
            className="bg-red hover:bg-red/90 text-white border-0 font-semibold"
          >
            Try Again
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen" style={{ backgroundColor: '#BBB8AF' }}>
      
        {/* Header */}
        <div className="bg-gradient-to-r from-black via-black to-red text-white py-8">
        <div className="max-w-6xl mx-auto px-4 md:px-8">
          <div className="flex items-center gap-4 mb-4">
            <div className="w-3 h-3 bg-red rounded-full animate-pulse"></div>
            <h1 className="text-3xl md:text-4xl lg:text-5xl font-bold">Scams</h1>
          </div>
          <p className="text-lg md:text-xl text-gray-200 max-w-2xl">
            Stay informed about the latest scam reports from our community. Help protect others by reviewing and sharing these alerts.
          </p>
        </div>
      </div>
      <div className="container mx-auto px-4 py-8 max-w-7xl">
        

        {/* Controls */}
        <div className="bg-cardWhite rounded-2xl shadow-lg border border-gradWhite/30 p-6 mb-8">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-4 items-center">
            {/* Search */}
            <div className="lg:col-span-4">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-black/50 w-5 h-5" />
                <input
                  type="text"
                  placeholder="Search scams..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full pl-10 pr-4 py-3 border border-gradWhite/50 rounded-xl focus:outline-none focus:ring-2 focus:ring-red/20 focus:border-red transition-all bg-white"
                />
                 {isSearchingBackend && (
                  <div className="absolute right-3 top-1/2 transform -translate-y-1/2 text-black/50">
                    <svg className="animate-spin h-5 w-5 text-red" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                  </div>
                )}
              </div>
            </div>

            {/* Type Filter */}
            <div className="lg:col-span-3">
              <div className="relative">
                <Filter className="absolute left-3 top-1/2 transform -translate-y-1/2 text-black/50 w-5 h-5" />
                <select
                  value={selectedType}
                  onChange={(e) => setSelectedType(e.target.value)}
                  className="w-full pl-10 pr-4 py-3 border border-gradWhite/50 rounded-xl focus:outline-none focus:ring-2 focus:ring-red/20 focus:border-red transition-all appearance-none bg-white"
                >
                  <option value="all">All Types</option>
                  {scamTypes.map(type => (
                    <option key={type} value={type}>{type}</option>
                  ))}
                </select>
              </div>
            </div>

            {/* Sort */}
            <div className="lg:col-span-3">
              <div className="flex gap-2">
                {(['date', 'name', 'type'] as const).map((option) => (
                  <Button
                    key={option}
                    variant={sortBy === option ? "default" : "outline"}
                    onClick={() => handleSort(option)}
                    className={`flex items-center gap-2 font-medium ${
                      sortBy === option 
                        ? 'bg-red text-white border-red hover:bg-red/90' 
                        : 'hover:border-red hover:text-red border-gradWhite/50'
                    }`}
                  >
                    {option === 'date' && <Calendar className="w-4 h-4" />}
                    {option === 'name' && <TrendingUp className="w-4 h-4" />}
                    {option === 'type' && <Filter className="w-4 h-4" />}
                    {option.charAt(0).toUpperCase() + option.slice(1)}
                    {sortBy === option && (
                      <ArrowUpDown className={`w-4 h-4 ${sortOrder === 'desc' ? 'rotate-180' : ''} transition-transform`} />
                    )}
                  </Button>
                ))}
              </div>
            </div>

            {/* View Mode Toggle */}
            <div className="lg:col-span-2 flex justify-end">
              <div className="flex bg-gradWhite/20 rounded-xl p-1">
                <Button
                  variant={viewMode === 'grid' ? "default" : "ghost"}
                  size="sm"
                  onClick={() => setViewMode('grid')}
                  className={`${viewMode === 'grid' ? 'bg-white shadow-sm text-black' : 'text-black/60 hover:text-black'}`}
                >
                  <Grid className="w-4 h-4" />
                </Button>
                <Button
                  variant={viewMode === 'list' ? "default" : "ghost"}
                  size="sm"
                  onClick={() => setViewMode('list')}
                  className={`${viewMode === 'list' ? 'bg-white shadow-sm text-black' : 'text-black/60 hover:text-black'}`}
                >
                  <List className="w-4 h-4" />
                </Button>
              </div>
            </div>
          </div>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <div className="bg-cardWhite rounded-xl p-6 shadow-md border border-gradWhite/30">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 bg-red/10 rounded-xl flex items-center justify-center">
                <TrendingUp className="w-6 h-6 text-red" />
              </div>
              <div>
                <p className="text-sm text-black/60">Total Reports</p>
                <p className="text-2xl font-bold text-black">{filteredReports.length}</p>
              </div>
            </div>
          </div>
          
          <div className="bg-cardWhite rounded-xl p-6 shadow-md border border-gradWhite/30">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 bg-blue-100 rounded-xl flex items-center justify-center">
                <Clock className="w-6 h-6 text-blue-600" />
              </div>
              <div>
                <p className="text-sm text-black/60">This Week</p>
                <p className="text-2xl font-bold text-black">
                  {filteredReports.filter(report => {
                    const reportDate = new Date(report.date);
                    const weekAgo = new Date();
                    weekAgo.setDate(weekAgo.getDate() - 7);
                    return reportDate >= weekAgo;
                  }).length}
                </p>
              </div>
            </div>
          </div>
          
          <div className="bg-cardWhite rounded-xl p-6 shadow-md border border-gradWhite/30">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 bg-green-100 rounded-xl flex items-center justify-center">
                <Shield className="w-6 h-6 text-green-600" />
              </div>
              <div>
                <p className="text-sm text-black/60">Categories</p>
                <p className="text-2xl font-bold text-black">{scamTypes.length}</p>
              </div>
            </div>
          </div>
        </div>

        {/* Results */}
        {filteredReports.length === 0 && !isSearchingBackend ? ( // Added !isSearchingBackend
          <div className="text-center py-16 bg-cardWhite rounded-2xl shadow-lg border border-gradWhite/30">
            <div className="text-black/40 text-6xl mb-4">🔍</div>
            <h3 className="text-xl font-semibold text-black mb-2">No scams found</h3>
            <p className="text-black/70 mb-6">
              {searchQuery || selectedType !== 'all' 
                ? 'Try adjusting your search or filters' 
                : 'No scam reports available at the moment'}
            </p>
            {(searchQuery || selectedType !== 'all') && (
              <Button 
                onClick={() => {
                  setSearchQuery('');
                  setSelectedType('all');
                }}
                variant="outline"
                className="hover:border-red hover:text-red border-gradWhite/50"
              >
                Clear Filters
              </Button>
            )}
          </div>
        ) : isSearchingBackend ? ( // Show loading indicator during backend search
          <div className="text-center py-16 bg-cardWhite rounded-2xl shadow-lg border border-gradWhite/30">
            <div className="text-black/40 text-6xl mb-4">
              <svg className="animate-spin mx-auto h-12 w-12 text-red" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
              </svg>
            </div>
            <h3 className="text-xl font-semibold text-black mb-2">Searching...</h3>
            <p className="text-black/70">Fetching results from the backend.</p>
          </div>
        ) : (
          <div className={viewMode === 'grid' 
            ? "grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6" 
            : "space-y-4"
          }>
            {filteredReports.map((scam) => (
              <ScamCard 
                key={scam.id} 
                scam={scam} 
                onReview={handleReview}
                viewMode={viewMode}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
