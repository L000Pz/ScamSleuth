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
      <div className="bg-cardWhite rounded-xl shadow-lg overflow-hidden flex flex-col md:flex-row w-full max-w-[1240px] h-auto md:h-[610px]">
        <div className="w-full md:w-3/5 p-6 md:p-8">
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-[28px] md:text-[40px] font-bold">Edit Profile</h2>
            <Button
              variant="outline"
              className="flex items-center gap-2"
              onClick={() => router.push("/dashboard")}
            >
              Back to Dashboard
            </Button>
          </div>

          <form className="space-y-4" onSubmit={handleSubmit}>
            <div>
              <label className="block text-[16px] md:text-[20px] font-bold mb-1">Username</label>
              <input
                type="text"
                name="username"
                value={formData.username}
                onChange={handleChange}
                className="w-full p-2 border border-gray-300 rounded-full focus:outline-none focus:border-blue-500"
                required
                disabled={isLoading}
              />
              {errors.username && <p className="text-red-500 text-sm">{errors.username}</p>}
            </div>

            <div>
              <label className="block text-[16px] md:text-[20px] font-bold mb-1">
                Current Password
              </label>
              <input
                type="password"
                name="currentPassword"
                value={formData.currentPassword}
                onChange={handleChange}
                className="w-full p-2 border border-gray-300 rounded-full focus:outline-none focus:border-blue-500"
                required
                disabled={isLoading}
              />
              {errors.currentPassword && (
                <p className="text-red-500 text-sm">{errors.currentPassword}</p>
              )}
            </div>

            <div>
              <label className="block text-[16px] md:text-[20px] font-bold mb-1">
                New Password (Optional)
              </label>
              <input
                type="password"
                name="newPassword"
                value={formData.newPassword}
                onChange={handleChange}
                className="w-full p-2 border border-gray-300 rounded-full focus:outline-none focus:border-blue-500"
                disabled={isLoading}
              />
              {errors.newPassword && <p className="text-red-500 text-sm">{errors.newPassword}</p>}
            </div>

            <div>
              <label className="block text-[16px] md:text-[20px] font-bold mb-1">
                Confirm New Password
              </label>
              <input
                type="password"
                name="confirmPassword"
                value={formData.confirmPassword}
                onChange={handleChange}
                className="w-full p-2 border border-gray-300 rounded-full focus:outline-none focus:border-blue-500"
                disabled={isLoading || !formData.newPassword}
              />
              {errors.confirmPassword && (
                <p className="text-red-500 text-sm">{errors.confirmPassword}</p>
              )}
            </div>

            {apiError && <p className="text-red-500 text-sm text-center">{apiError}</p>}

            <div className="mt-6">
              <Button
                type="submit"
                variant="outline"
                className="block mx-auto w-full md:w-[250px] h-[40px] py-2 text-[16px] md:text-[20px] leading-none font-bold"
                disabled={isLoading}
              >
                {isLoading ? "Saving Changes..." : "Save Changes"}
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