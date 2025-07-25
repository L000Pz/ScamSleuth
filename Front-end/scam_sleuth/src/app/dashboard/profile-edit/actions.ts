'use server';

import { cookies } from 'next/headers';

interface EditUserInfoRequest {
  email: string;
  old_password: string;
  new_username?: string;
  new_profile_picture_id?: number;
  new_name?: string;
  new_password?: string;
}

interface EditUserInfoResponse {
  success: boolean;
  message?: string;
}

async function getUserInfoFromToken(token: string) {
  try {
    const response = await fetch(
      `${process.env.NEXT_PUBLIC_API_URL}/IAM/authentication/ReturnByToken?token=${encodeURIComponent(token)}`,
      {
        method: 'GET',
        headers: { 
          'Accept': '*/*' 
        },
      }
    );

    if (!response.ok) {
      return null;
    }

    return await response.json();
  } catch (error) {
    console.error('Error fetching user info:', error);
    return null;
  }
}

export async function uploadProfilePicture(formData: FormData): Promise<{
  mediaId: number | null;
  error: string | null;
}> {
  try {
    const cookieStore = await cookies();
    const token = cookieStore.get('token')?.value;

    if (!token) {
      return {
        mediaId: null,
        error: 'Please login to upload files'
      };
    }

    // Verify user is authenticated and verified
    const userInfo = await getUserInfoFromToken(token);
    
    if (!userInfo) {
      return {
        mediaId: null,
        error: 'Invalid authentication. Please login again.'
      };
    }

    if (!userInfo.is_verified) {
      return {
        mediaId: null,
        error: 'Please verify your account to upload files'
      };
    }

    const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/Media/mediaManager/Save`, {
      method: 'PUT',
      headers: {
        'Authorization': `Bearer ${token}`,
      },
      body: formData,
    });

    if (!response.ok) {
      const errorMessage = `Upload failed: ${response.statusText}`;
      console.error(errorMessage, response.status);
      return {
        mediaId: null,
        error: errorMessage
      };
    }

    const data = await response.json();
    
    if (data && typeof data === 'number') {
      return { mediaId: data, error: null };
    } else {
      console.error('Unexpected response format:', data);
      return {
        mediaId: null,
        error: 'Invalid server response format'
      };
    }

  } catch (error) {
    console.error('Error uploading file:', error);
    return {
      mediaId: null,
      error: error instanceof Error ? error.message : 'Failed to upload file'
    };
  }
}

export async function deleteProfilePicture(id: number): Promise<{
  success: boolean;
  error: string | null;
}> {
  try {
    const cookieStore = await cookies();
    const token = cookieStore.get('token')?.value;

    if (!token) {
      return {
        success: false,
        error: 'Please login to delete files'
      };
    }

    const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/Media/mediaManager/Delete?id=${id}`, {
      method: 'DELETE',
      headers: {
        'Authorization': `Bearer ${token}`,
      },
    });

    if (!response.ok) {
      return {
        success: false,
        error: `Failed to delete file: ${response.statusText}`
      };
    }

    return { success: true, error: null };
  } catch (error) {
    console.error('Error deleting file:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Failed to delete file'
    };
  }
}

export async function updateUserProfile(data: {
  email: string;
  username: string;
  name: string;
  oldPassword: string;
  newPassword?: string;
  profilePictureId?: number;
}): Promise<EditUserInfoResponse> {
  try {
    const cookieStore = await cookies();
    const token = cookieStore.get('token')?.value;

    if (!token) {
      return {
        success: false,
        message: 'No authentication token found. Please login again.',
      };
    }

    // Verify user is authenticated
    const userInfo = await getUserInfoFromToken(token);
    
    if (!userInfo) {
      return {
        success: false,
        message: 'Invalid authentication. Please login again.',
      };
    }

    if (!userInfo.is_verified) {
      return {
        success: false,
        message: 'Please verify your account to update profile.',
      };
    }

    // Build request body with only required fields + fields that are being changed
    const requestBody: EditUserInfoRequest = {
      email: data.email, // Required for authentication
      old_password: data.oldPassword, // Required for authentication
    };

    // Only add fields that are being changed
    if (data.username !== userInfo.username) {
      requestBody.new_username = data.username;
    }

    if (data.name !== userInfo.name) {
      requestBody.new_name = data.name;
    }

    if (data.profilePictureId !== undefined && data.profilePictureId !== userInfo.profile_picture_id) {
      requestBody.new_profile_picture_id = data.profilePictureId;
    }

    // Only include new password if it's provided and not empty
    if (data.newPassword && data.newPassword.trim()) {
      requestBody.new_password = data.newPassword;
    }

    const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/User/userManagement/EditUserInfo`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`,
        'Accept': '*/*',
      },
      body: JSON.stringify(requestBody),
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error('API Error Response:', {
        status: response.status,
        text: errorText
      });

      if (response.status === 401) {
        return {
          success: false,
          message: 'Invalid credentials. Please check your current password.',
        };
      }

      if (response.status === 400) {
        // Try to extract the actual error message from the response
        let errorMessage = 'Invalid input. Please check your information and try again.';
        
        try {
          // Check if the response is a JSON string (wrapped in quotes)
          if (errorText.startsWith('"') && errorText.endsWith('"')) {
            errorMessage = JSON.parse(errorText);
          } else {
            // Try to parse as JSON object
            const errorObj = JSON.parse(errorText);
            errorMessage = errorObj.message || errorObj.error || errorText;
          }
        } catch {
          // If parsing fails, use the raw error text
          errorMessage = errorText || errorMessage;
        }

        return {
          success: false,
          message: errorMessage,
        };
      }

      return {
        success: false,
        message: `Failed to update profile: ${errorText || response.statusText}`,
      };
    }

    // Handle successful response
    const responseData = await response.text();
    return {
      success: true,
      message: responseData || 'Profile updated successfully!',
    };

  } catch (error) {
    console.error('Error updating profile:', error);
    return {
      success: false,
      message: error instanceof Error ? error.message : 'An unexpected error occurred. Please try again.',
    };
  }
}

export async function getCurrentUserInfo() {
  try {
    const cookieStore = await cookies();
    const token = cookieStore.get('token')?.value;

    if (!token) {
      return { success: false, error: 'No token found' };
    }

    const userInfo = await getUserInfoFromToken(token);
    
    if (!userInfo) {
      return { success: false, error: 'Failed to fetch user info' };
    }

    return { 
      success: true, 
      data: {
        email: userInfo.email,
        username: userInfo.username,
        name: userInfo.name,
        profile_picture_id: userInfo.profile_picture_id,
        is_verified: userInfo.is_verified,
      }
    };
  } catch (error) {
    console.error('Error fetching current user info:', error);
    return { success: false, error: 'Failed to fetch user info' };
  }
}