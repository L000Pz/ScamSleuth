"use client";

import Image from "next/image";
import { Button } from "@/components/ui/button";
import heroImage from "@/assets/images/hero.png";
import { useRouter } from "next/navigation";
import { LogOut, User } from "lucide-react";
import { logout, getUserData } from "./actions";
import { getActivities } from "./activities/actions";
import { useEffect, useState } from "react";

interface UserData {
  name: string;
  username?: string;
  email?: string;
  profile_picture_id?: number | null;
}

export default function UserDashboard() {
  const router = useRouter();
  const [userName, setUserName] = useState("[User]");
  const [userUsername, setUserUsername] = useState("user");
  const [userData, setUserData] = useState<UserData | null>(null);
  const [reportCount, setReportCount] = useState<number>(0);
  const [isLoadingReports, setIsLoadingReports] = useState(false);
  const [isLoadingUser, setIsLoadingUser] = useState(true);

  useEffect(() => {
    // Force reload on mount using hash strategy
    const reloadOnce = () => {
      if (!window.location.hash) {
        window.location.hash = "loaded";
        window.location.reload();
      }
    };

    reloadOnce();
    fetchUserData();
    fetchReportCount();
  }, []);

  const fetchUserData = async () => {
    try {
      setIsLoadingUser(true);
      const userData = await getUserData();
      if (userData && userData.name) {
        setUserName(userData.name);
        setUserData(userData);
        // Set username if available, otherwise create one from name
        if (userData.username) {
          setUserUsername(userData.username);
        } else {
          // Generate username from name as fallback
          const generatedUsername = userData.name.toLowerCase().replace(/\s+/g, '');
          setUserUsername(generatedUsername);
        }
      }
    } catch (error) {
      console.error("Error fetching user data:", error);
    } finally {
      setIsLoadingUser(false);
    }
  };

  const fetchReportCount = async () => {
    try {
      setIsLoadingReports(true);
      const result = await getActivities();
      
      if (result.success && result.data) {
        setReportCount(result.data.length);
      }
    } catch (error) {
      console.error("Error fetching report count:", error);
      // Keep default value of 0 on error
    } finally {
      setIsLoadingReports(false);
    }
  };

  const handleLogout = async () => {
    try {
      await logout();
      window.location.href = "/login";
      router.refresh();
    } catch (error) {
      console.error("Logout failed:", error);
    }
  };

  const ProfilePicture = ({ size = "w-12 h-12" }: { size?: string }) => {
    // Just show a nice placeholder since backend is broken
    return (
      <div className={`${size} rounded-full bg-gradient-to-br from-red via-red/80 to-red/60 flex items-center justify-center shadow-lg`}>
        <User className="w-6 h-6 text-white" />
      </div>
    );
  };

  return (
    <div className="flex items-center justify-center px-4 py-6 md:p-[76px]">
      <div className="bg-cardWhite rounded-xl shadow-lg overflow-hidden flex flex-col md:flex-row w-full max-w-[1440px] h-auto md:h-[700px]">
        {/* Left Column - Dashboard Content */}
        <div className="w-full md:w-3/5 p-6 md:p-8 overflow-y-auto max-h-[700px]">
          <div className="flex justify-between items-center mb-6">
            <div className="flex items-center gap-4">
              <ProfilePicture />
              {isLoadingUser ? (
                <div className="h-10 bg-gray-200 rounded-lg w-48 animate-pulse"></div>
              ) : (
                <h2 className="text-[28px] md:text-[40px] font-bold">
                  Welcome, {userName}!
                </h2>
              )}
            </div>
            <Button
              variant="ghost"
              className="flex items-center gap-2 text-gray-600 hover:text-gray-800"
              onClick={handleLogout}
            >
              <LogOut size={18} />
              <span>Logout</span>
            </Button>
          </div>

          <div className="space-y-6">
            {/* Profile Section - Enhanced with better styling */}
            <div className="p-8 border border-gray-200 rounded-xl bg-gradient-to-r from-gray-50 to-white shadow-sm hover:shadow-md transition-shadow">
              <h3 className="text-[18px] md:text-[20px] font-bold mb-6 flex items-center gap-2">
                <div className="w-2 h-2 bg-red rounded-full"></div>
                Your Profile
              </h3>
              <div className="flex items-center gap-6 mb-6">
                <ProfilePicture size="w-20 h-20" />
                {isLoadingUser ? (
                  <div className="space-y-3">
                    <div className="h-6 bg-gray-200 rounded w-40 animate-pulse"></div>
                    <div className="h-5 bg-gray-200 rounded w-32 animate-pulse"></div>
                    <div className="h-4 bg-gray-200 rounded w-20 animate-pulse"></div>
                  </div>
                ) : (
                  <div>
                    <p className="font-medium text-xl">{userName}</p>
                    <p className="text-base text-gray-500">@{userUsername}</p>
                    <div className="flex items-center gap-2 mt-2">
                      <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                      <span className="text-sm text-green-600">Active</span>
                    </div>
                  </div>
                )}
              </div>
              <p className="text-gray-600 mb-4 text-sm md:text-base">
                View or edit your personal information and settings.
              </p>
              <Button
                variant="outline"
                className="w-full md:w-[150px] h-[40px] rounded-full font-bold"
                onClick={() => router.push("dashboard/profile-edit")}
              >
                Edit Profile
              </Button>
            </div>

            {/* Recent Activity */}
            <div className="p-6 border border-gray-200 rounded-xl bg-gradient-to-r from-blue-50 to-white shadow-sm hover:shadow-md transition-shadow">
              <h3 className="text-[18px] md:text-[20px] font-bold mb-4 flex items-center gap-2">
                <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                Recent Activity
              </h3>
              <p className="text-gray-600 mb-4 text-sm md:text-base">
                Track your recent reports and account activities.
              </p>
              <div className="flex items-center gap-3 mb-4 p-3 bg-white rounded-lg border">
                <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center">
                  {isLoadingReports ? (
                    <div className="w-4 h-4 border-2 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
                  ) : (
                    <span className="text-blue-600 text-sm font-bold">{reportCount}</span>
                  )}
                </div>
                <div>
                  <p className="text-sm font-medium">Reports Submitted</p>
                  <p className="text-xs text-gray-500">Total reports</p>
                </div>
              </div>
              <Button
                variant="outline"
                className="w-full md:w-[150px] h-[40px] rounded-full font-bold"
                onClick={() => router.push("dashboard/activities")}
              >
                View Activity
              </Button>
            </div>

            {/* Quick Actions */}
            <div className="p-6 border border-gray-200 rounded-xl bg-gradient-to-r from-green-50 to-white shadow-sm hover:shadow-md transition-shadow">
              <h3 className="text-[18px] md:text-[20px] font-bold mb-4 flex items-center gap-2">
                <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                Quick Actions
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                <Button
                  variant="outline"
                  className="w-full h-[50px] rounded-xl font-bold hover:bg-red hover:text-white hover:border-red transition-all duration-200 flex items-center gap-2"
                  onClick={() => router.push("report")}
                >
                  <span className="text-lg">📝</span>
                  Submit Report
                </Button>
                <Button
                  variant="outline"
                  className="w-full h-[50px] rounded-xl font-bold hover:bg-blue-500 hover:text-white hover:border-blue-500 transition-all duration-200 flex items-center gap-2"
                  onClick={() => router.push("scams")}
                >
                  <span className="text-lg">🔍</span>
                  Browse Alerts
                </Button>
              </div>
            </div>
          </div>
        </div>

        {/* Right Column - Gradient Background and Image */}
        <div className="hidden md:flex w-full md:w-2/5 bg-gradient-to-t from-black via-black/40 via-40% via-cardWhite to-red flex-col items-center justify-center p-8">
          <Image
            src={heroImage}
            alt="Detective Dog"
            width={278}
            height={319}
            className="mb-4"
          />
          <p className="text-[24px] md:text-[40px] font-bold text-white text-center">
            Welcome back, <span style={{ color: "#E14048" }}>Sleuth</span>!
          </p>
          <p className="text-[24px] md:text-[40px] font-bold text-white text-center">
            Ready to make a difference?
          </p>
        </div>
      </div>
    </div>
  );
}