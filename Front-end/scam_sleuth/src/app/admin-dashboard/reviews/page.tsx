"use client";

import { Button } from '@/components/ui/button';
import { useRouter } from 'next/navigation';
import { useState, useEffect } from 'react';
import { Plus } from 'lucide-react';

interface ScamReport {
  id: string;
  type: string;
  name: string;
  description: string;
  date: string;
  status: 'pending' | 'under_review' | 'resolved';
}

export default function ScamReportsPage() {
  const router = useRouter();
  const [sortBy, setSortBy] = useState('date');
  const [isLoading, setIsLoading] = useState(true);
  const [reports, setReports] = useState<ScamReport[]>([]);
  const [error, setError] = useState<string | null>(null);

  // Sample data - replace with actual API call
  useEffect(() => {
    const fetchReports = async () => {
      try {
        // Simulate API call
        await new Promise(resolve => setTimeout(resolve, 1000));
        
        const dummyReports: ScamReport[] = [
          {
            id: '1',
            type: 'Phishing',
            name: 'Email Scam',
            description: 'Lorem ipsum dolor sit amet, consectetur adipiscing elit. Nam et efficitur ipsum, id hendrerit leo. Ut accumsan neque nunc.',
            date: '2024/10/1',
            status: 'pending'
          },
          {
            id: '2',
            type: 'Investment',
            name: 'Crypto Scam',
            description: 'Lorem ipsum dolor sit amet, consectetur adipiscing elit. Nam et efficitur ipsum, id hendrerit leo. Ut accumsan neque nunc.',
            date: '2024/10/1',
            status: 'under_review'
          },
          {
            id: '3',
            type: 'Shopping',
            name: 'Fake Store',
            description: 'Lorem ipsum dolor sit amet, consectetur adipiscing elit. Nam et efficitur ipsum, id hendrerit leo. Ut accumsan neque nunc.',
            date: '2024/10/1',
            status: 'resolved'
          },
          {
            id: '4',
            type: 'Romance',
            name: 'Dating Scam',
            description: 'Lorem ipsum dolor sit amet, consectetur adipiscing elit. Nam et efficitur ipsum, id hendrerit leo. Ut accumsan neque nunc.',
            date: '2024/10/1',
            status: 'pending'
          }
        ];

        setReports(dummyReports);
      } catch (error) {
        setError('Failed to load scam reports');
        console.error('Error fetching reports:', error);
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
        case 'status':
          return a.status.localeCompare(b.status);
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
        <h2 className="text-[40px] font-bold">Reviews</h2>
        <div className="flex items-end flex-col gap-2">
        <div
            className="p-2 rounded-full hover:bg-gray-200 cursor-pointer align-left"
            onClick={() => router.push('/admin/scam-reports/new')} // Example navigation
            >
            <Plus className="h-5 w-5" />
        </div>
            
            <div className="">
                <span className="text-xl">Sort by: </span>
                <select 
                    value={sortBy}
                    onChange={(e) => handleSort(e.target.value)}
                    className="p-2 border border-gray-300 rounded-lg focus:outline-none focus:border-blue-500"
                >
                    <option value="date">Date</option>
                    <option value="type">Type</option>
                    <option value="name">Name</option>
                    <option value="status">Status</option>
                </select>
            </div>
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
              <div className="bg-black text-white p-4 w-32 flex items-center justify-center">
                <span className="text-sm font-medium rotate-180 text-center" style={{ writingMode: 'vertical-rl' }}>
                  {report.type}
                </span>
              </div>

              {/* Main content */}
              <div className="flex-grow p-4 flex justify-between items-center">
                <div className="flex-grow">
                  <div className="flex items-center gap-3 mb-2">
                    <h3 className="text-xl font-bold">{report.name}</h3>
                    <span className={`px-3 py-1 rounded-full text-xs font-semibold ${
                      report.status === 'pending' ? 'bg-yellow-200 text-yellow-800' :
                      report.status === 'under_review' ? 'bg-blue-200 text-blue-800' :
                      'bg-green-200 text-green-800'
                    }`}>
                      {report.status.replace('_', ' ').toUpperCase()}
                    </span>
                  </div>
                  <p className="text-gray-600 text-sm line-clamp-2">{report.description}</p>
                </div>

                {/* Right side with date and button */}
                <div className="ml-4 flex flex-col items-end gap-2">
                  <span className="text-gray-500">{report.date}</span>
                  <Button 
                    variant="outline"
                    onClick={() => router.push(`/admin/scam-reports/${report.id}`)}
                    className="rounded-full px-6 font-bold"
                  >
                    Edit
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