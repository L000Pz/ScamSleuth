"use client";
import React from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import Link from 'next/link';

export default function Navbar() {
  const router = useRouter();

  const handleLogin = () => {
    router.push('/login');
  };

  const handleSignup = () => {
    router.push('/signup');
  };


  return (
    <header className="flex items-center justify-between pl-[100px] pr-[100px] p-6 bg-black text-white">
      <div className="flex items-center space-x-8">
        <Link  href="/" className="text-[39px] font-bold leading-tight">
          SCAM<br />SLEUTH
        </Link >
        <nav className="flex space-x-6 pl-[17px]  text-[28px] font-medium ">
        <Link href="/" className="relative">
          <button className="relative after:content-[''] after:absolute after:bottom-0 after:left-0 after:w-0 after:h-[2px] after:bg-red after:transition-all after:duration-300 after:ease-in-out hover:after:w-full">Home</button>
        </Link>
          <button className="relative after:content-[''] after:absolute after:bottom-0 after:left-0 after:w-0 after:h-[2px] after:bg-red after:transition-all after:duration-300 after:ease-in-out hover:after:w-full">Scams</button>
          <button className="relative after:content-[''] after:absolute after:bottom-0 after:left-0 after:w-0 after:h-[2px] after:bg-red after:transition-all after:duration-300 after:ease-in-out hover:after:w-full">Report a scam</button>
          <button className="relative after:content-[''] after:absolute after:bottom-0 after:left-0 after:w-0 after:h-[2px] after:bg-red after:transition-all after:duration-300 after:ease-in-out hover:after:w-full">About us</button>
        </nav>
      </div>
      <div className=" flex items-center space-x-4">
      
      <Button size ='md' variant="ghost" onClick={handleLogin} className='text-[20px] font-meduim'>Login</Button> 
      
      <Button size ='md' variant="outline" onClick={handleSignup} className='text-[20px] font-meduim'>Sign Up</Button> 
      </div>
    </header>
  );
};


