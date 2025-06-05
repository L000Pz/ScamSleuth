'use client';

import Image from 'next/image';
import { Button } from '@/components/ui/button';
import heroImage from '@/assets/images/hero.png';
import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { authorize, resendCode} from './actions';

export default function CodeVerificationPage() {
  const router = useRouter();
  const [code, setCode] = useState('');
  const [message, setMessage] = useState('');
  const [isError, setIsError] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const generateInitialCode = async () => {
      const response = await resendCode();
      setIsLoading(false);
      if (!response.success) {
        setIsError(true);
        setMessage("Couldn't send verification code. Please try again.");
      } else {
        setMessage('Verification code sent to your email!');
      }
    };

    generateInitialCode();
  }, []);

  const handleCodeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setCode(e.target.value);
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setIsError(false);
    
    const response = await authorize(code);

    if (!response.success) {
      setMessage(response.message);
      setIsError(true);
      return;
    }

    setMessage('Code verified! Redirecting to dashboard...');
    setTimeout(() => {
      router.push('/dashboard');
    }, 1500);
  };

  const handleResendCode = async () => {
    setIsError(false);
    setMessage('Sending new code...');
    const response = await resendCode();
    
    setMessage(response.message);
    setIsError(!response.success);
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <p>Sending verification code...</p>
      </div>
    );
  }

  return (
    <div className="flex items-center justify-center p-4 sm:p-6 lg:p-[76px] min-h-screen">
      <div className="bg-cardWhite rounded-xl shadow-lg overflow-hidden flex flex-col lg:flex-row w-full max-w-[1240px]">
        <div className="w-full lg:w-3/5 p-4 sm:p-6 lg:p-8">
          <h2 className="text-2xl sm:text-3xl lg:text-[40px] text-center font-bold mb-6">Enter Code</h2>
          <p className="text-center text-base sm:text-lg mb-4 text-gray-600">
            We&apos;ve sent a one-time code to your email. Please enter it below to continue.
          </p>
          
          <form className="space-y-4 mx-4 sm:mx-8 lg:mx-[90px]" onSubmit={handleSubmit}>
            <div>
              <label className="block text-base sm:text-lg lg:text-[20px] font-bold mb-1">Verification Code</label>
              <input
                type="text"
                name="code"
                value={code}
                onChange={handleCodeChange}
                className="w-full p-2 border border-gray-300 rounded-full text-center focus:outline-none focus:border-blue-500"
                required
                maxLength={6}
                placeholder="Enter code"
              />
            </div>

            <div className="mt-6 sm:mt-8 lg:mt-[50px]">
              <Button 
                type="submit" 
                variant="outline" 
                className="block mx-auto w-full sm:w-[250px] h-[40px] py-2 text-base sm:text-lg lg:text-[20px] leading-none font-bold"
              >
                Verify
              </Button>
            </div>
          </form>

          <p className="text-center text-sm mt-4">
            Didn&apos;t receive the code?{' '}
            <button 
              type="button" 
              onClick={handleResendCode} 
              className="text-blue-600 hover:underline"
            >
              Resend Code
            </button>
          </p>

          {message && (
            <p className={`text-center mt-2 ${
              isError ? 'text-red-600' : 'text-green-600'
            }`}>
              {message}
            </p>
          )}
        </div>

        <div className="hidden lg:flex w-2/5 bg-gradient-to-t from-black via-black/40 via-40% via-cardWhite to-red flex-col items-center justify-center p-8">
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