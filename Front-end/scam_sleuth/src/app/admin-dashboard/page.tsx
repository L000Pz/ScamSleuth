"use client";

import { Button } from '@/components/ui/button';
import { useRouter } from 'next/navigation';
import { useState, useEffect } from 'react';
import { getReports } from './actions';

interface ScamReport {
  id: string;
  type: string;
  name: string;
  description: string;
  date: string;
}

export default function ScamReportsPage() {
  const router = useRouter();
  const [sortBy, setSortBy] = useState('date');
  const [isLoading, setIsLoading] = useState(true);
  const [reports, setReports] = useState<ScamReport[]>([]);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchReports = async () => {
      try {
        setIsLoading(true);
        const result = await getReports();
        
        if (result.success && result.data) {
          setReports(result.data);
        } else {
          setError(result.error || 'Failed to fetch reports');
        }
      } catch (err) {
        setError('An error occurred while fetching Reports');
      } finally {
        setIsLoading(false);
      }
    };
    const reloadOnce = () => {
      if (!window.location.hash) {
        window.location.hash = "loaded";
        window.location.reload();
      }
    };
    reloadOnce();
    fetchReports();
  }, []);

  const handleSort = (criteria: string) => {
    setSortBy(criteria);
    const sortedReports = [...reports].sort((a, b) => {
      switch (criteria) {
        case 'date':
          return new Date(b.date).getTime() - new Date(a.date).getTime();
        case 'type':
          return a.type.localeCompare(b.type);
        case 'name':
          return a.name.localeCompare(b.name);
        default:
          return 0;
      }
    });
    setReports(sortedReports);
  };

  const formatScamType = (type: string) => {
    if (type.toLowerCase().includes('crypto')) {
      return 'Crypto Scam';
    }
    const words = type.split(',');
    if (words.length > 1) {
      return words.map(word => word.trim()).join('\n');
    }
    return type;
  };

  if (isLoading) {
    return <div className="flex justify-center items-center h-full">Loading...</div>;
  }

  if (error) {
    return (
      <div className="flex justify-center items-center h-full text-red-500">
        {error}
      </div>
    );
  }

  return (
    <div className="p-4">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6">
        <h2 className="text-2xl sm:text-3xl md:text-4xl font-bold">Scam Reports</h2>
        <div className="flex items-center gap-2 w-full sm:w-auto">
          <span className="text-lg sm:text-xl">Sort by:</span>
          <select 
            value={sortBy}
            onChange={(e) => handleSort(e.target.value)}
            className="p-2 border border-gray-300 rounded-lg focus:outline-none focus:border-blue-500 w-full sm:w-auto"
          >
            <option value="date">Date</option>
            <option value="type">Type</option>
            <option value="name">Name</option>
          </select>
        </div>
      </div>

      {reports.length === 0 ? (
        <div className="text-center text-gray-500 mt-8">
          No scam reports found.
        </div>
      ) : (
        <div className="space-y-4">
          {reports.map((report) => (
            <div 
              key={report.id}
              className="flex flex-col sm:flex-row items-stretch bg-background rounded-xl overflow-hidden shadow-md min-h-[160px] sm:h-32"
            >
              <div className="bg-black text-white py-2 px-4 sm:p-4 w-full sm:w-24 flex items-center justify-center min-h-[40px] sm:min-h-full">
                <span className="text-xs font-medium text-center whitespace-pre-line sm:[writing-mode:vertical-rl] sm:rotate-180 sm:h-20 leading-tight">
                  {formatScamType(report.type)}
                </span>
              </div>

              <div className="flex-grow p-4">
                <div className="flex flex-col justify-between h-full gap-4">
                  <div>
                    <div className="flex items-center justify-between gap-3 mb-2">
                      <h3 className="text-lg font-bold truncate max-w-[calc(100%-100px)]">
                        {report.name.length > 50 ? `${report.name.substring(0, 50)}...` : report.name}
                      </h3>
                      <span className="text-gray-500 text-sm whitespace-nowrap">{report.date}</span>
                    </div>
                    <p className="text-gray-600 text-sm line-clamp-2 max-w-xl">{report.description}</p>
                  </div>

                  <div className="flex justify-end">
                    <Button 
                      variant="outline"
                      onClick={() => router.push(`/admin-dashboard/${report.id}`)}
                      className="rounded-full px-4 sm:px-6 text-sm font-bold"
                    >
                      Review
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