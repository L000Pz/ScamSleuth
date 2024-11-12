// src/app/signup/page.tsx

import Image from 'next/image';
import Link from 'next/link';
import { Button } from '@/components/ui/button';

export default function SignupPage() {
  return (
    <div className="flex items-center justify-center p-[76px]">
      <div className="bg-cardWhite rounded-xl shadow-lg overflow-hidden flex w-[1240px] h-[610px]">
        
        {/* Left Column - Form */}
        <div className="w-1/2 p-8">
          <h2 className="text-[40px] text-center font-bold mb-6">Sign up now!</h2>
          
          <form className="space-y-4">
            <div>
              <label className="block text-[25px] font-bold mb-1">Email</label>
              <input
                type="email"
                className="w-full p-2 border border-gray-300 rounded-full focus:outline-none focus:border-blue-500"
                required
              />
            </div>

            <div>
              <label className="block text-[25px] font-bold mb-1">Name</label>
              <input
                type="text"
                className="w-full p-2 border border-gray-300 rounded-full focus:outline-none focus:border-blue-500"
                required
              />
            </div>

            <div>
              <label className="block text-[25px] font-bold mb-1">Password</label>
              <input
                type="password"
                className="w-full p-2 border border-gray-300 rounded-full focus:outline-none focus:border-blue-500"
                required
              />
            </div>

            <Button variant="outline" className="block mx-auto w-[250px] h-[40px] py-2 mt-4 mt-6 text-[20px] leading-none font-bold">
              Sign up
            </Button>
          </form>

          <p className="text-center text-sm mt-4">
            Already have an account?{' '}
            <Link href="/login" className="text-blue-600 hover:underline">
              Login
            </Link>
          </p>
        </div>

        {/* Right Column - Image and Text */}
        <div className="w-1/2 bg-gradient-to-t from-[#9E7B69] via-[#C8A88B] to-[#BB5256] flex flex-col items-center justify-center text-center p-8 text-white">
          <Image src="/images/detective-dog.png" alt="Detective Dog" width={150} height={150} className="mb-4" />
          <p className="text-lg font-semibold">The world needs more <span className="text-red-500">Sleuths.</span></p>
          <p className="text-md mt-2">Sign up and make a difference.</p>
        </div>
      </div>
    </div>
  );
}
