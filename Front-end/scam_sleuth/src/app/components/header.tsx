import React from 'react';
import { Button } from '@/components/ui/button';

const Navbar = () => {
  return (
    <header className="flex justify-between items-center p-6 bg-black text-white">
      <h1 className="text-2xl font-bold">
        <span className="block">SCAM</span>
        <span className="block">SLEUTH</span>
      </h1>
      <nav className="flex space-x-4">
        <a href="#" className="hover:text-gray-300">Home</a>
        <a href="#" className="hover:text-gray-300">Scams</a>
        <a href="#" className="hover:text-gray-300">Report a Scam</a>
        <a href="#" className="hover:text-gray-300">About Us</a>
      </nav>
      <div className="flex space-x-4">
        <Button variant="ghost">Login</Button> 
        <Button variant="outline">Sign Up</Button> 
      </div>
    </header>
  );
};

export default Navbar;
