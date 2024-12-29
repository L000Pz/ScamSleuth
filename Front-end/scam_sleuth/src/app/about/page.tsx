"use client";


export default function AboutPage() {
  return (
    <div className="flex items-center justify-center p-[76px]">
      <div className="bg-cardWhite rounded-xl shadow-lg overflow-hidden flex w-[1240px] min-h-[610px]">
        {/* Left Column - Content */}
        <div className=" p-8">
          <h2 className="text-[30px] mx-[30px] font-bold ">About  <span className="text-red">Scam Sleuth</span></h2>
          
          <div className=" mx-[30px] relative">
            
            <p className="text-lg">
            At Scam Sleuth, our mission is simple: to help people protect themselves from scams by providing a platform where users can report and uncover fraudulent activities. In an increasingly digital world, scams are becoming more common, affecting millions of people worldwide. Our goal is to create a safer environment by equipping individuals with the knowledge and tools needed to avoid falling victim to fraud.
            Our platform is powered by a community of vigilant users who share their experiences to help others stay informed. From online scams to in-person fraud, we’re committed to building a comprehensive database that’s easy to access and navigate.
            </p>

            <div className="space-y-2 ">
              <h3 className="text-lg font-bold">With Scam Sleuth, you can:</h3>
              <ul className="space-y-2 list-disc pl-6">
                <li className="text-lg">Report scams you've encountered</li>
                <li className="text-lg">Browse reports submitted by others</li>
                <li className="text-lg">Learn about the latest trends in fraudulent activities</li>
                <li className="text-lg">Take steps to protect yourself and your loved ones</li>
              </ul>
            </div>

            {/* Second red separator */}
            <div className="relative">
              <div className="border-t-2 border-[#E14048] my-4 mx-auto w-full" />
            </div>

            <div className="space-y-4">
              <h3 className="text-[24px] font-bold">Contact Us</h3>
              <p className="text-lg">We value feedback from our users and are always ready to assist:</p>
              <ul className="space-y-2 list-disc pl-6">
                <li className="text-lg">Email: support@scamsleuth.com</li>
                <li className="text-lg">Phone: +1-800-SCAM-SLEUTH (1-800-722-6758)</li>
                <li className="text-lg">Follow us on Twitter, Facebook, and Instagram</li>
              </ul>
            </div>
            <div className="relative ">
              <div className="border-t-2 border-[#E14048] my-4 mx-auto w-full " />
            </div>
            <p className="text-lg">
              We believe that by working together, we can reduce the number of people affected by
              scams. Join Scam Sleuth today and help us uncover scams, one report at a time.
            </p>

            <div className="text-sm text-gray-600 pt-6">
              © 2024 Scam Sleuth. All rights reserved. Unauthorized reproduction or distribution of any
              material from this site is prohibited without permission.
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}