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
    <>
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-[40px] font-bold">Scam Reports</h2>
        <div className="flex items-center gap-2">
          <span className="text-xl">Sort by:</span>
          <select 
            value={sortBy}
            onChange={(e) => handleSort(e.target.value)}
            className="p-2 border border-gray-300 rounded-lg focus:outline-none focus:border-blue-500"
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
              className="flex items-stretch bg-background rounded-xl overflow-hidden shadow-md"
            >
              {/* Left black label */}
              <div className="bg-black text-white sm:p-4 w-full sm:w-40 sm:max-w-[100px] flex items-center justify-center">
                <span className="text-sm font-medium text-center sm:[writing-mode:vertical-rl] sm:h-[98px] sm:rotate-180 sm:max-h-[90px] whitespace-pre-wrap break-words">
                  {report.type}
                </span>
              </div>

              {/* Main content */}
              <div className="flex-grow p-4 flex justify-between items-center">
                <div className="flex-grow">
                  <div className="flex items-center gap-3 mb-2">
                    <h3 className="text-xl font-bold">{report.name}</h3>
                  </div>
                  <p className="text-gray-600 text-sm line-clamp-2">{report.description}</p>
                </div>

                {/* Right side with date and button */}
                <div className="ml-4 flex flex-col items-end gap-2">
                  <span className="text-gray-500">{report.date}</span>
                  <Button 
                    variant="outline"
                    onClick={() => router.push(`/admin-dashboard/${report.id}`)}
                    className="rounded-full px-6 font-bold"
                  >
                    Review
                  </Button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </>
  );
}