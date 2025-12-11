"use client";

import { Button } from '@/components/ui/button';
import { useRouter } from 'next/navigation';
import { useState, useEffect } from 'react';
import { Calendar, Clock, AlertTriangle, RefreshCw } from 'lucide-react';
import { getReports } from './actions';

interface ScamReport {
  id: string;
  type: string;
  name: string;
  description: string;
  scamDate: string; 
  reportDate: string; 
  date: string; 
  rawScamDate: string;
  rawReportDate: string; 
  financial_loss: number;
}

type SortCriteria = 'reportDate' | 'scamDate' | 'type' | 'name' | 'financial_loss';

export default function AdminReportsPage() {
  const router = useRouter();
  const [sortBy, setSortBy] = useState<SortCriteria>('reportDate');
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [reports, setReports] = useState<ScamReport[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [isRefreshing, setIsRefreshing] = useState<boolean>(false);

  const sortReports = (reportsToSort: ScamReport[], criteria: SortCriteria): ScamReport[] => {
    return [...reportsToSort].sort((a, b) => {
      switch (criteria) {
        case 'reportDate':
          return new Date(b.rawReportDate).getTime() - new Date(a.rawReportDate).getTime();
        case 'scamDate':
          return new Date(b.rawScamDate).getTime() - new Date(a.rawScamDate).getTime();
        case 'type':
          return a.type.localeCompare(b.type);
        case 'name':
          return a.name.localeCompare(b.name);
        case 'financial_loss':
          return b.financial_loss - a.financial_loss;
        default:
          return 0;
      }
    });
  };

  const fetchReports = async (showRefreshLoader = false) => {
    try {
      if (showRefreshLoader) {
        setIsRefreshing(true);
      } else {
        setIsLoading(true);
      }
      
      const result = await getReports();
      
      if (result.success && result.data) {
        const sortedData = sortReports(result.data, sortBy);
        setReports(sortedData);
        setError(null);
      } else {
        setError(result.error || 'Failed to fetch reports');
      }
    } catch (err) {
      console.error('Error fetching reports:', err);
      setError('An error occurred while fetching reports');
    } finally {
      setIsLoading(false);
      setIsRefreshing(false);
    }
  };

  useEffect(() => {
    fetchReports();
  }, []);

  const handleSort = (criteria: SortCriteria) => {
    setSortBy(criteria);
    const sortedReports = sortReports(reports, criteria);
    setReports(sortedReports);
  };

  const formatScamType = (type: string): string => {
    if (type.toLowerCase().includes('crypto')) {
      return 'Crypto Scam';
    }
    const words = type.split(',');
    if (words.length > 1) {
      return words.map(word => word.trim()).join('\n');
    }
    return type;
  };

  const formatCurrency = (amount: number): string => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(amount);
  };

  const truncateDescription = (description: string, maxLength: number = 120): string => {
    if (description.length <= maxLength) return description;
    return description.slice(0, maxLength).trim() + '...';
  };

  const handleRefresh = () => {
    fetchReports(true);
  };

  if (isLoading) {
    return (
      <div className="flex justify-center items-center h-full">
        <div className="flex flex-col items-center gap-4">
          <div className="animate-spin rounded-full h-12 w-12 border-4 border-blue-500 border-t-transparent"></div>
          <p className="text-gray-600 font-medium">Loading reports...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex justify-center items-center h-full">
        <div className="text-center bg-red-50 border border-red-200 rounded-xl p-8 max-w-md">
          <AlertTriangle className="w-12 h-12 text-red-500 mx-auto mb-4" />
          <h3 className="text-lg font-semibold text-red-800 mb-2">Error Loading Reports</h3>
          <p className="text-red-600 mb-4">{error}</p>
          <Button 
            onClick={handleRefresh}
            disabled={isRefreshing}
            className="bg-red-500 hover:bg-red-600 text-white"
          >
            {isRefreshing ? (
              <>
                <RefreshCw className="w-4 h-4 mr-2 animate-spin" />
                Retrying...
              </>
            ) : (
              'Try Again'
            )}
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="p-4 space-y-6">
      {/* Header Section */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div className="flex items-center gap-4">
          <h2 className="text-2xl sm:text-3xl md:text-4xl font-bold text-gray-900">
            Scam Reports
          </h2>
          <Button
            variant="outline"
            size="sm"
            onClick={handleRefresh}
            disabled={isRefreshing}
            className="flex items-center gap-2"
          >
            <RefreshCw className={`w-4 h-4 ${isRefreshing ? 'animate-spin' : ''}`} />
            {isRefreshing ? 'Refreshing...' : 'Refresh'}
          </Button>
        </div>
        
        {/* Sort Controls */}
        <div className="flex items-center gap-2 w-full sm:w-auto">
          <span className="text-lg sm:text-xl font-medium text-gray-700">Sort by:</span>
          <select 
            value={sortBy}
            onChange={(e) => handleSort(e.target.value as SortCriteria)}
            className="p-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 w-full sm:w-auto bg-white shadow-sm"
          >
            <option value="reportDate">Report Date</option>
            <option value="scamDate">Scam Date</option>
            <option value="financial_loss">Financial Loss</option>
            <option value="type">Type</option>
            <option value="name">Name</option>
          </select>
        </div>
      </div>

      {/* Stats Summary */}
      {reports.length > 0 && (
        <div className="bg-white rounded-xl border border-gray-200 p-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-center">
            <div className="bg-blue-50 rounded-lg p-3">
              <div className="text-2xl font-bold text-blue-600">{reports.length}</div>
              <div className="text-sm text-blue-800">Total Reports</div>
            </div>
            <div className="bg-green-50 rounded-lg p-3">
              <div className="text-2xl font-bold text-green-600">
                {new Set(reports.map(report => report.type)).size}
              </div>
              <div className="text-sm text-green-800">Unique Scam Types</div>
            </div>
          </div>
        </div>
      )}

      {/* Reports List */}
      {reports.length === 0 ? (
        <div className="text-center text-gray-500 mt-8 bg-gray-50 rounded-xl p-12">
          <AlertTriangle className="w-16 h-16 text-gray-400 mx-auto mb-4" />
          <h3 className="text-xl font-semibold text-gray-700 mb-2">No Reports Found</h3>
          <p className="text-gray-600">There are currently no scam reports to display.</p>
        </div>
      ) : (
        <div className="space-y-4">
          {reports.map((report) => (
            <div 
              key={report.id}
              className="flex flex-col lg:flex-row bg-white rounded-xl overflow-hidden shadow-sm border border-gray-200 hover:shadow-md transition-shadow duration-200 min-h-[160px]"
            >
              {/* Type Badge - Fixed width on desktop */}
              <div className="bg-gradient-to-br from-gray-900 to-black text-white py-3 px-4 lg:p-4 w-full lg:w-24 lg:min-w-24 lg:max-w-24 flex items-center justify-center min-h-[50px]">
                <span className="text-xs font-semibold text-center whitespace-pre-line lg:[writing-mode:vertical-rl] lg:rotate-180 leading-tight overflow-hidden">
                  {formatScamType(report.type)}
                </span>
              </div>

              {/* Content - Fixed height container */}
              <div className="flex-grow p-4 lg:p-6">
                <div className="flex flex-col lg:flex-row justify-between gap-4 h-full">
                  <div className="flex-grow">
                    {/* Title - Truncated to prevent height variations */}
                    <h3 className="text-lg lg:text-xl font-bold text-gray-900 mb-2 line-clamp-1">
                      {report.name.length > 60 ? `${report.name.substring(0, 60)}...` : report.name}
                    </h3>
                    
                    {/* Description - Consistently truncated */}
                    <p className="text-gray-600 text-sm mb-4 max-w-2xl overflow-hidden">
                      {truncateDescription(report.description)}
                    </p>
                    
                    {/* Dates and Financial Loss */}
                    <div className="flex flex-wrap items-center gap-4 text-sm text-gray-500">
                      <div className="flex items-center gap-1">
                        <Calendar className="w-4 h-4 flex-shrink-0" />
                        <span className="font-medium">Scam:</span>
                        <span>{report.scamDate}</span>
                      </div>
                      <div className="flex items-center gap-1">
                        <Clock className="w-4 h-4 flex-shrink-0" />
                        <span className="font-medium">Reported:</span>
                        <span>{report.reportDate}</span>
                      </div>
                      {report.financial_loss > 0 && (
                        <div className="flex items-center gap-1">
                          <span className="font-medium">Loss:</span>
                          <span className="text-red-600 font-semibold">
                            {formatCurrency(report.financial_loss)}
                          </span>
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Action Button - Centered */}
                  <div className="flex items-center justify-end lg:justify-center">
                    <Button 
                      variant="outline"
                      onClick={() => router.push(`/admin-dashboard/reports/${report.id}`)}
                      className="rounded-full px-6 py-2 font-semibold hover:bg-blue-50 hover:border-blue-500 hover:text-blue-600 transition-colors duration-200 whitespace-nowrap"
                    >
                      Review Report
                    </Button>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}