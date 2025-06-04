"use client";

import Image from "next/image";
import { Button } from "@/components/ui/button";
import heroImage from "@/assets/images/hero.png";
import { useRouter } from "next/navigation";
import { useState, useEffect } from "react";
import { z } from "zod";
import { updateUserProfile, getCurrentUserInfo, uploadProfilePicture, deleteProfilePicture } from "./actions";
import { User, Camera, X } from "lucide-react";

const ProfileSchema = z.object({
  email: z.string().email({ message: "Invalid email address" }),
  username: z.string().min(3, { message: "Username must be at least 3 characters long" }),
  name: z.string().min(1, { message: "Name is required" }),
  oldPassword: z.string().min(1, { message: "Current password is required" }),
  newPassword: z.string().optional(),
  confirmPassword: z.string().optional(),
}).refine(
  (data) => {
    // Only validate password length if newPassword is provided and not empty
    if (data.newPassword && data.newPassword.trim() !== "" && data.newPassword.length < 6) {
      return false;
    }
    return true;
  },
  {
    message: "New password must be at least 6 characters long",
    path: ["newPassword"],
  }
).refine(
  (data) => {
    // Only check password match if newPassword is provided and not empty
    if (data.newPassword && data.newPassword.trim() !== "" && data.newPassword !== data.confirmPassword) {
      return false;
    }
    return true;
  },
  {
    message: "Passwords don't match",
    path: ["confirmPassword"],
  }
);

interface FormData {
  email: string;
  username: string;
  name: string;
  oldPassword: string;
  newPassword: string;
  confirmPassword: string;
}

interface FormErrors {
  email: string;
  username: string;
  name: string;
  oldPassword: string;
  newPassword: string;
  confirmPassword: string;
}

interface UserInfo {
  email: string;
  username: string;
  name: string;
  profile_picture_id: number | null;
  is_verified: boolean;
}

export default function EditProfilePage() {
  const router = useRouter();
  
  const [formData, setFormData] = useState<FormData>({
    email: "",
    username: "",
    name: "",
    oldPassword: "",
    newPassword: "",
    confirmPassword: "",
  });
  
  const [errors, setErrors] = useState<FormErrors>({
    email: "",
    username: "",
    name: "",
    oldPassword: "",
    newPassword: "",
    confirmPassword: "",
  });
  
  const [apiError, setApiError] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [isLoadingUserInfo, setIsLoadingUserInfo] = useState(true);
  
  // Profile picture states
  const [currentUserInfo, setCurrentUserInfo] = useState<UserInfo | null>(null);
  const [newProfilePictureId, setNewProfilePictureId] = useState<number | null>(null);
  const [isUploadingImage, setIsUploadingImage] = useState(false);
  const [imageUploadError, setImageUploadError] = useState<string | null>(null);

  // Load current user info on component mount
  useEffect(() => {
    const loadUserInfo = async () => {
      try {
        setIsLoadingUserInfo(true);
        const result = await getCurrentUserInfo();
        
        if (result.success && result.data) {
          const userInfo = result.data;
          setCurrentUserInfo(userInfo);
          setFormData(prev => ({
            ...prev,
            email: userInfo.email,
            username: userInfo.username,
            name: userInfo.name,
          }));
        } else {
          setApiError(result.error || 'Failed to load user information');
        }
      } catch (error) {
        setApiError('Failed to load user information');
      } finally {
        setIsLoadingUserInfo(false);
      }
    };

    loadUserInfo();
  }, []);

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Validate file type
    const allowedTypes = ['image/jpeg', 'image/png', 'image/gif', 'image/webp'];
    if (!allowedTypes.includes(file.type)) {
      setImageUploadError('Please select a valid image file (JPEG, PNG, GIF, or WebP)');
      return;
    }

    // Validate file size (5MB max)
    if (file.size > 5 * 1024 * 1024) {
      setImageUploadError('Image size should not exceed 5MB');
      return;
    }

    setIsUploadingImage(true);
    setImageUploadError(null);

    try {
      const formData = new FormData();
      formData.append('file', file);

      const result = await uploadProfilePicture(formData);

      if (result.error || result.mediaId === null) {
        setImageUploadError(result.error || 'Failed to upload image');
      } else {
        setNewProfilePictureId(result.mediaId);
        setImageUploadError(null);
      }
    } catch (error) {
      setImageUploadError('Failed to upload image');
    } finally {
      setIsUploadingImage(false);
    }
  };

  const handleRemoveProfilePicture = async () => {
    if (newProfilePictureId) {
      // If there's a newly uploaded image, delete it
      try {
        await deleteProfilePicture(newProfilePictureId);
        setNewProfilePictureId(null);
      } catch (error) {
        console.error('Failed to delete uploaded image:', error);
      }
    } else {
      // If removing current profile picture, just set to null
      setNewProfilePictureId(0); // 0 indicates removal of current picture
    }
  };

  const getCurrentProfilePictureId = () => {
    if (newProfilePictureId !== null) {
      return newProfilePictureId;
    }
    return currentUserInfo?.profile_picture_id || null;
  };

  const ProfilePicture = ({ size = "w-24 h-24" }: { size?: string }) => {
    const pictureId = getCurrentProfilePictureId();
    
    if (pictureId && pictureId > 0) {
      return (
        <div className={`${size} rounded-full overflow-hidden border-4 border-white shadow-lg`}>
          <Image
            src={`http://localhost:8080/Media/mediaManager/Get?id=${pictureId}`}
            alt="Profile Picture"
            width={96}
            height={96}
            className="w-full h-full object-cover"
            unoptimized
          />
        </div>
      );
    }
    
    return (
      <div className={`${size} rounded-full bg-gradient-to-br from-blue-500 via-blue-600 to-blue-700 flex items-center justify-center shadow-lg border-4 border-white`}>
        <User className="w-8 h-8 text-white" />
      </div>
    );
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    
    // Clear errors for the field being edited
    if (errors[name as keyof FormErrors]) {
      setErrors(prev => ({ ...prev, [name]: "" }));
    }
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setIsLoading(true);
    setApiError(null);
    setSuccessMessage(null);

    const result = ProfileSchema.safeParse(formData);

    if (!result.success) {
      const fieldErrors = result.error.flatten().fieldErrors;
      setErrors({
        email: fieldErrors.email?.[0] || "",
        username: fieldErrors.username?.[0] || "",
        name: fieldErrors.name?.[0] || "",
        oldPassword: fieldErrors.oldPassword?.[0] || "",
        newPassword: fieldErrors.newPassword?.[0] || "",
        confirmPassword: fieldErrors.confirmPassword?.[0] || "",
      });
      setIsLoading(false);
      return;
    }

    // Clear all errors if validation passes
    setErrors({
      email: "",
      username: "",
      name: "",
      oldPassword: "",
      newPassword: "",
      confirmPassword: "",
    });

    try {
      const response = await updateUserProfile({
        email: formData.email,
        username: formData.username,
        name: formData.name,
        oldPassword: formData.oldPassword,
        // Only pass newPassword if it's not empty
        newPassword: formData.newPassword.trim() ? formData.newPassword : undefined,
        // Pass profile picture ID if changed
        profilePictureId: newProfilePictureId !== null ? newProfilePictureId : undefined,
      });
      
      if (response.success) {
        setSuccessMessage(response.message || "Profile updated successfully!");
        // Clear password fields after successful update
        setFormData(prev => ({
          ...prev,
          oldPassword: "",
          newPassword: "",
          confirmPassword: "",
        }));
        
        // Reset profile picture state
        if (newProfilePictureId !== null) {
          setCurrentUserInfo(prev => prev ? { ...prev, profile_picture_id: newProfilePictureId } : null);
          setNewProfilePictureId(null);
        }
        
        // Redirect to dashboard after a short delay
        setTimeout(() => {
          router.push("/dashboard");
        }, 2000);
      } else {
        setApiError(response.message || "Failed to update profile");
      }
    } catch (error) {
      setApiError("An unexpected error occurred.");
    } finally {
      setIsLoading(false);
    }
  };

  if (isLoadingUserInfo) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="flex flex-col items-center gap-4">
          <div className="animate-spin rounded-full h-12 w-12 border-4 border-blue-500 border-t-transparent"></div>
          <p className="text-gray-600 font-medium">Loading profile...</p>
        </div>
      </div>
    );
  }

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
            {/* Profile Picture Section */}
            <div className="p-6 border border-gray-200 rounded-xl bg-gradient-to-r from-purple-50 to-white shadow-sm">
              <h3 className="text-lg font-bold mb-4 flex items-center gap-2">
                <div className="w-2 h-2 bg-purple-500 rounded-full"></div>
                Profile Picture
              </h3>
              
              <div className="flex flex-col md:flex-row items-center gap-6">
                <div className="flex justify-center">
                  <ProfilePicture size="w-32 h-32" />
                </div>
                
                <div className="flex-1 text-center md:text-left">
                  <p className="text-gray-600 mb-2">
                    Upload a new profile picture to personalize your account.
                  </p>
                  <p className="text-sm text-gray-500 mb-4">
                    Supported formats: JPEG, PNG, GIF, WebP. Max size: 5MB.
                  </p>
                  
                  <div className="flex flex-col sm:flex-row gap-3 justify-center md:justify-start">
                    <label className="cursor-pointer">
                      <input
                        type="file"
                        accept="image/*"
                        onChange={handleImageUpload}
                        className="hidden"
                        disabled={isUploadingImage || isLoading}
                      />
                      <div className="flex items-center justify-center gap-2 px-4 py-2 bg-purple-500 text-white rounded-lg hover:bg-purple-600 transition-colors disabled:opacity-50 min-w-[120px]">
                        {isUploadingImage ? (
                          <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                        ) : (
                          <Camera className="w-4 h-4" />
                        )}
                        {isUploadingImage ? 'Uploading...' : 'Change'}
                      </div>
                    </label>
                    
                    {(getCurrentProfilePictureId() || newProfilePictureId) && (
                      <button
                        type="button"
                        onClick={handleRemoveProfilePicture}
                        className="flex items-center justify-center gap-2 px-4 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600 transition-colors min-w-[120px]"
                        disabled={isUploadingImage || isLoading}
                      >
                        <X className="w-4 h-4" />
                        Remove
                      </button>
                    )}
                  </div>
                  
                  {imageUploadError && (
                    <p className="text-red-500 text-sm mt-2">{imageUploadError}</p>
                  )}
                  
                  {newProfilePictureId && (
                    <p className="text-green-600 text-sm mt-2">
                      ✓ New profile picture uploaded! Save changes to apply.
                    </p>
                  )}
                </div>
              </div>
            </div>

            {/* Account Information Section */}
            <div className="p-6 border border-gray-200 rounded-xl bg-gradient-to-r from-blue-50 to-white shadow-sm">
              <h3 className="text-lg font-bold mb-4 flex items-center gap-2">
                <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                Account Information
              </h3>
              
              <div className="space-y-4">
                <div>
                  <label className="block text-[16px] md:text-[18px] font-bold mb-2">Email</label>
                  <input
                    type="email"
                    name="email"
                    value={formData.email}
                    onChange={handleChange}
                    className="w-full p-3 border border-gray-300 rounded-xl focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100 transition-all"
                    required
                    disabled={isLoading}
                    placeholder="Enter your email"
                  />
                  {errors.email && <p className="text-red-500 text-sm mt-1">{errors.email}</p>}
                </div>

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

                <div>
                  <label className="block text-[16px] md:text-[18px] font-bold mb-2">Full Name</label>
                  <input
                    type="text"
                    name="name"
                    value={formData.name}
                    onChange={handleChange}
                    className="w-full p-3 border border-gray-300 rounded-xl focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100 transition-all"
                    required
                    disabled={isLoading}
                    placeholder="Enter your full name"
                  />
                  {errors.name && <p className="text-red-500 text-sm mt-1">{errors.name}</p>}
                </div>
              </div>
            </div>

            {/* Current Password Section */}
            <div className="p-6 border border-gray-200 rounded-xl bg-gradient-to-r from-orange-50 to-white shadow-sm">
              <h3 className="text-lg font-bold mb-4 flex items-center gap-2">
                <div className="w-2 h-2 bg-orange-500 rounded-full"></div>
                Authentication
              </h3>
              <div>
                <label className="block text-[16px] md:text-[18px] font-bold mb-2">
                  Current Password
                </label>
                <input
                  type="password"
                  name="oldPassword"
                  value={formData.oldPassword}
                  onChange={handleChange}
                  className="w-full p-3 border border-gray-300 rounded-xl focus:outline-none focus:border-orange-500 focus:ring-2 focus:ring-orange-100 transition-all"
                  required
                  disabled={isLoading}
                  placeholder="Enter your current password"
                />
                {errors.oldPassword && (
                  <p className="text-red-500 text-sm mt-1">{errors.oldPassword}</p>
                )}
                <p className="text-sm text-gray-600 mt-1">
                  Required to confirm your identity
                </p>
              </div>
            </div>

            {/* New Password Section */}
            <div className="p-6 border border-gray-200 rounded-xl bg-gradient-to-r from-green-50 to-white shadow-sm">
              <h3 className="text-lg font-bold mb-4 flex items-center gap-2">
                <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                Change Password (Optional)
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
                    placeholder="Enter new password (leave blank to keep current)"
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

            {/* Success Message */}
            {successMessage && (
              <div className="p-4 border border-green-200 rounded-xl bg-green-50">
                <p className="text-green-600 text-center font-medium">{successMessage}</p>
              </div>
            )}

            {/* Error Message */}
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