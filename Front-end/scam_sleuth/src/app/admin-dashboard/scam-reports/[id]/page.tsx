"use client";

import { Button } from '@/components/ui/button';
import { useRouter } from 'next/navigation';
import { useState, useEffect } from 'react';
import { ArrowLeft, Check, Pencil } from 'lucide-react';

interface ScamReport {
  id: string;
  type: string;
  name: string;
  description: string;
  date: string;
  status: 'pending' | 'under_review' | 'resolved';
  reporterName?: string;
  contactInfo?: string;
  evidence?: string[];
  timeline?: string;
}

export default function ScamReviewPage({ params }: { params: { id: string } }) {
  const router = useRouter();
  const [report, setReport] = useState<ScamReport | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [notes, setNotes] = useState('');

  useEffect(() => {
    const fetchReport = async () => {
      try {
        // Simulate API call
        await new Promise(resolve => setTimeout(resolve, 1000));
        
        // Dummy data - replace with actual API call
        const dummyReport: ScamReport = {
          id: params.id,
          type: 'Phishing',
          name: 'Email Scam',
          description: 'Received an email claiming to be from a major bank, requesting immediate account verification. The email contained suspicious links and poor grammar.',
          date: '2024/10/1',
          status: 'under_review',
          reporterName: 'John Doe',
          contactInfo: 'john.doe@email.com',
          evidence: [
            'Original email with headers',
            'Screenshots of the phishing website',
            'Communication records'
          ],
          timeline: 'Received email on Sept 30, reported immediately after noticing suspicious elements'
        };

        setReport(dummyReport);
      } catch (error) {
        setError('Failed to load scam report');
        console.error('Error fetching report:', error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchReport();
  }, [params.id]);

  const handleStatusUpdate = async (newStatus: 'resolved' | 'pending') => {
    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 500));
      
      // Update local state
      if (report) {
        setReport({ ...report, status: newStatus });
      }
      
      // Navigate back after short delay
      setTimeout(() => router.push('/admin-dashboard/scam-reports'), 500);
    } catch (error) {
      console.error('Error updating status:', error);
    }
  };

  if (isLoading) {
    return <div className="flex justify-center items-center h-full">Loading...</div>;
  }

  if (error || !report) {
    return (
      <div className="flex justify-center items-center h-full text-red-500">
        {error || 'Report not found'}
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Button
            variant="ghost"
            onClick={() => router.push('/admin-dashboard/scam-reports')}
            className="p-2"
          >
            <ArrowLeft className="h-6 w-6" />
          </Button>
          <h2 className="text-[40px] font-bold">Review Scam Report</h2>
        </div>
        <div className="flex items-center gap-3">
          <Button
            variant="outline"
            onClick={() => handleStatusUpdate('pending')}
            className="rounded-full  font-bold"
          >
            <Pencil className="mr-2 h-4 w-4" />
            Write a Review
          </Button>
          <Button
            onClick={() => handleStatusUpdate('resolved')}
            className="rounded-full px-6 font-bold bg-black hover:bg-gray-800"
          >
            <Check className="mr-2 h-4 w-4" />
            Resolved
          </Button>
        </div>
      </div>

      {/* Main Content */}
      <div className="grid grid-cols-3 gap-6">
        {/* Left Column - Basic Info */}
        <div className="col-span-2 space-y-6">
          <div className="bg-background rounded-xl p-6 shadow-md">
            <h3 className="text-xl font-bold mb-4">Basic Information</h3>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-500">Type</label>
                <p className="text-lg">{report.type}</p>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-500">Name</label>
                <p className="text-lg">{report.name}</p>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-500">Description</label>
                <p className="text-lg">{report.description}</p>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-500">Timeline</label>
                <p className="text-lg">{report.timeline}</p>
              </div>
            </div>
          </div>

          <div className="bg-background rounded-xl p-6 shadow-md">
            <h3 className="text-xl font-bold mb-4">Evidence</h3>
            <ul className="space-y-2">
              {report.evidence?.map((item, index) => (
                <li key={index} className="flex items-center gap-2">
                  <span className="w-2 h-2 bg-black rounded-full"></span>
                  <span>{item}</span>
                </li>
              ))}
            </ul>
          </div>
        </div>

        {/* Right Column - Reporter Info & Notes */}
        <div className="space-y-6">
          <div className="bg-background rounded-xl p-6 shadow-md">
            <h3 className="text-xl font-bold mb-4">Reporter Information</h3>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-500">Name</label>
                <p className="text-lg">{report.reporterName}</p>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-500">Contact</label>
                <p className="text-lg">{report.contactInfo}</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}