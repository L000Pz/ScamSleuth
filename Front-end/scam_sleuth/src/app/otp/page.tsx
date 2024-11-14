'use client'
import Image from 'next/image';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import heroImage from '@/assets/images/hero.png';
import { useState } from 'react';
import { useRouter } from 'next/navigation';

export default function OtpPage() {
    const router = useRouter();
    const [otp, setOtp] = useState('');
    const [message, setMessage] = useState(''); // State to store feedback messages

  const handleOtpChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setOtp(e.target.value);
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    try {
      // Send OTP to backend for verification
      const response = await fetch('/api/verify-otp', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ otp }),
      });

      if (response.ok) {
        const data = await response.json();
        
        // If verification is successful
        if (data.success) {
          // Handle automatic login (if token provided) or redirect
          // Option 1: Store token and redirect
          if (data.token) {
            localStorage.setItem('token', data.token); // or use cookies
            router.push('/dashboard'); // Redirect to the main user area
          } else {
            // Option 2: Redirect to welcome or setup page
            router.push('/welcome');
          }
        } else {
          setMessage('Invalid OTP. Please try again.');
        }
      } else {
        setMessage('Failed to verify OTP. Please try again.');
      }
    } catch (error) {
      setMessage('An error occurred. Please try again.');
      console.error('OTP verification error:', error);
    }
  };

  const handleResendOtp = async () => {
    try {
      // Call the backend endpoint to resend the OTP
      const response = await fetch('/api/resend-otp', {
        method: 'POST',
      });
      if (response.ok) {
        setMessage('OTP resent! Please check your email.');
      } else {
        setMessage('Failed to resend OTP. Please try again.');
      }
    } catch (error) {
      setMessage('Error resending OTP. Please try again.');
      console.error('Resend OTP error:', error);
    }
  };

  return (
    <div className="flex items-center justify-center p-[76px]">
      <div className="bg-cardWhite rounded-xl shadow-lg overflow-hidden flex w-[1240px] h-[610px]">
        
        {/* Left Column - OTP Form */}
        <div className="w-3/5 p-8">
          <h2 className="text-[40px] text-center font-bold mb-6">Enter OTP</h2>
          <p className="text-center text-lg mb-4 text-gray-600">
            We’ve sent a one-time passcode to your email. Please enter it below to continue.
          </p>
          
          <form className="space-y-4 mx-[90px]" onSubmit={handleSubmit}>
            <div>
              <label className="block text-[20px] font-bold mb-1">OTP Code</label>
              <input
                type="text"
                name="otp"
                value={otp}
                onChange={handleOtpChange}
                className="w-full p-2 border border-gray-300 rounded-full text-center focus:outline-none focus:border-blue-500"
                required
                maxLength={6}
                placeholder="Enter OTP"
              />
            </div>

            <div className="mt-[50px]">
              <Button type="submit" variant="outline" className="block mx-auto w-[250px] h-[40px] py-2 text-[20px] leading-none font-bold">
                Verify
              </Button>
            </div>
          </form>

          <p className="text-center text-sm mt-4">
            Didn’t receive the code?{' '}
            <button type="button" onClick={handleResendOtp} className="text-blue-600 hover:underline">
              Resend OTP
            </button>
          </p>

          {message && <p className="text-center text-green-600 mt-2">{message}</p>}
        </div>

        {/* Right Column - Image and Text */}
        <div className="w-2/5 bg-gradient-to-t from-black via-black/40 via-40% via-cardWhite to-red flex flex-col items-center justify-center p-8">
          <Image src={heroImage} alt="Detective Dog" width={278} height={319} className="mb-4" />
          <p className="text-[40px] font-bold text-white text-left">
            Verify your account to make a difference.
          </p>
          <p className="text-[40px] font-bold text-white text-left">Your journey starts here.</p>
        </div>

      </div>
    </div>
  );
}
