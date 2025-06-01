"use client";

import Image from "next/image";
import { Button } from "@/components/ui/button";
import heroImage from "@/assets/images/hero.png";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { z } from "zod";
import { changePassword } from "./actions";

const ProfileSchema = z.object({
  username: z.string().min(3, { message: "Username must be at least 3 characters long" }),
  currentPassword: z.string().min(1, { message: "Current password is required" }),
  newPassword: z
    .string()
    .min(6, { message: "New password must be at least 6 characters long" })
    .optional(),
  confirmPassword: z.string().optional(),
}).refine(
  (data) => {
    if (data.newPassword && data.newPassword !== data.confirmPassword) {
      return false;
    }
    return true;
  },
  {
    message: "Passwords don't match",
    path: ["confirmPassword"],
  }
);

export default function EditProfilePage() {
  const router = useRouter();
  const [formData, setFormData] = useState({
    username: "",
    currentPassword: "",
    newPassword: "",
    confirmPassword: "",
  });
  const [errors, setErrors] = useState({
    username: "",
    currentPassword: "",
    newPassword: "",
    confirmPassword: "",
  });
  const [apiError, setApiError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setIsLoading(true);

    const result = ProfileSchema.safeParse(formData);

    if (!result.success) {
      const fieldErrors = result.error.flatten().fieldErrors;
      setErrors({
        username: fieldErrors.username?.[0] || "",
        currentPassword: fieldErrors.currentPassword?.[0] || "",
        newPassword: fieldErrors.newPassword?.[0] || "",
        confirmPassword: fieldErrors.confirmPassword?.[0] || "",
      });
      setIsLoading(false);
      return;
    }

    setErrors({
      username: "",
      currentPassword: "",
      newPassword: "",
      confirmPassword: "",
    });
    setApiError(null);

    try {
      const response = await changePassword(formData.username, formData.newPassword || "");
      
      if (response.success) {
        router.push("/dashboard");
      } else {
        setApiError(response.message || "Failed to change password");
      }
    } catch (error) {
      setApiError("An unexpected error occurred.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="flex flex-col md:flex-row items-center justify-center px-4 py-6 md:p-[76px]">
      <div className="bg-cardWhite rounded-xl shadow-lg overflow-hidden flex flex-col md:flex-row w-full max-w-[1440px] h-auto md:h-[700px]">
        <div className="w-full md:w-3/5 p-6 md:p-8 overflow-y-auto max-h-[700px]">
          <div className="flex justify-between items-center mb-8">
            <h2 className="text-[28px] md:text-[40px] font-bold flex items-center gap-3">
              <div className="w-3 h-3 bg-red rounded-full"></div>
              Edit Profile
            </h2>
            <Button
              variant="outline"
              className="flex items-center gap-2 hover:bg-gray-50 transition-colors"
              onClick={() => router.push("/dashboard")}
            >
              Back to Dashboard
            </Button>
          </div>

          <form className="space-y-6" onSubmit={handleSubmit}>
            {/* Username Section */}
            <div className="p-6 border border-gray-200 rounded-xl bg-gradient-to-r from-blue-50 to-white shadow-sm">
              <h3 className="text-lg font-bold mb-4 flex items-center gap-2">
                <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                Account Information
              </h3>
              <div>
                <label className="block text-[16px] md:text-[18px] font-bold mb-2">Username</label>
                <input
                  type="text"
                  name="username"
                  value={formData.username}
                  onChange={handleChange}
                  className="w-full p-3 border border-gray-300 rounded-xl focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100 transition-all"
                  required
                  disabled={isLoading}
                  placeholder="Enter your username"
                />
                {errors.username && <p className="text-red-500 text-sm mt-1">{errors.username}</p>}
              </div>
            </div>

            {/* Current Password Section */}
            <div className="p-6 border border-gray-200 rounded-xl bg-gradient-to-r from-orange-50 to-white shadow-sm">
              <h3 className="text-lg font-bold mb-4 flex items-center gap-2">
                <div className="w-2 h-2 bg-orange-500 rounded-full"></div>
                Current Password
              </h3>
              <div>
                <label className="block text-[16px] md:text-[18px] font-bold mb-2">
                  Current Password
                </label>
                <input
                  type="password"
                  name="currentPassword"
                  value={formData.currentPassword}
                  onChange={handleChange}
                  className="w-full p-3 border border-gray-300 rounded-xl focus:outline-none focus:border-orange-500 focus:ring-2 focus:ring-orange-100 transition-all"
                  required
                  disabled={isLoading}
                  placeholder="Enter your current password"
                />
                {errors.currentPassword && (
                  <p className="text-red-500 text-sm mt-1">{errors.currentPassword}</p>
                )}
              </div>
            </div>

            {/* New Password Section */}
            <div className="p-6 border border-gray-200 rounded-xl bg-gradient-to-r from-green-50 to-white shadow-sm">
              <h3 className="text-lg font-bold mb-4 flex items-center gap-2">
                <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                New Password (Optional)
              </h3>
              <div className="space-y-4">
                <div>
                  <label className="block text-[16px] md:text-[18px] font-bold mb-2">
                    New Password
                  </label>
                  <input
                    type="password"
                    name="newPassword"
                    value={formData.newPassword}
                    onChange={handleChange}
                    className="w-full p-3 border border-gray-300 rounded-xl focus:outline-none focus:border-green-500 focus:ring-2 focus:ring-green-100 transition-all"
                    disabled={isLoading}
                    placeholder="Enter new password (optional)"
                  />
                  {errors.newPassword && <p className="text-red-500 text-sm mt-1">{errors.newPassword}</p>}
                </div>

                <div>
                  <label className="block text-[16px] md:text-[18px] font-bold mb-2">
                    Confirm New Password
                  </label>
                  <input
                    type="password"
                    name="confirmPassword"
                    value={formData.confirmPassword}
                    onChange={handleChange}
                    className="w-full p-3 border border-gray-300 rounded-xl focus:outline-none focus:border-green-500 focus:ring-2 focus:ring-green-100 transition-all"
                    disabled={isLoading || !formData.newPassword}
                    placeholder="Confirm your new password"
                  />
                  {errors.confirmPassword && (
                    <p className="text-red-500 text-sm mt-1">{errors.confirmPassword}</p>
                  )}
                </div>
              </div>
            </div>

            {apiError && (
              <div className="p-4 border border-red-200 rounded-xl bg-red-50">
                <p className="text-red-600 text-center font-medium">{apiError}</p>
              </div>
            )}

            <div className="mt-8 pt-6 border-t border-gray-200">
              <Button
                type="submit"
                variant="outline"
                className="block mx-auto w-full md:w-[300px] h-[50px] py-2 text-[16px] md:text-[18px] leading-none font-bold hover:bg-red hover:text-white hover:border-red transition-all duration-200"
                disabled={isLoading}
              >
                {isLoading ? (
                  <div className="flex items-center gap-2">
                    <div className="w-4 h-4 border-2 border-current border-t-transparent rounded-full animate-spin"></div>
                    Saving Changes...
                  </div>
                ) : (
                  "Save Changes"
                )}
              </Button>
            </div>
          </form>
        </div>

        <div className="hidden md:flex w-full md:w-2/5 bg-gradient-to-t from-black via-black/40 via-40% via-cardWhite to-red flex-col items-center justify-center p-8">
          <Image src={heroImage} alt="Detective Dog" width={278} height={319} className="mb-4" />
          <p className="text-[24px] md:text-[40px] font-bold text-white text-center">
            Keep your <span style={{ color: "#E14048" }}>profile</span>
          </p>
          <p className="text-[24px] md:text-[40px] font-bold text-white text-center">
            up to date!
          </p>
        </div>
      </div>
    </div>
  );
}