// src/app/login/actions.ts
'use server';

import { cookies } from 'next/headers';

// User login response interface
interface UserLoginResponse {
  user_id: number;
  username: string;
  email: string;
  name: string;
  profile_picture_id: number | null;
  is_verified: boolean;
  token: string;
  role: string;
}

// Admin login response interface
interface AdminLoginResponse {
  admin_id: number;
  username: string;
  email: string;
  name: string;
  contact_info: string;
  bio: string;
  profile_picture_id: number | null;
  token: string;
  role: string;
}

// Union type for both response types
type LoginResponse = UserLoginResponse | AdminLoginResponse;

type LoginResult = 
  | {
      success: false;
      message: string;
    }
  | {
      success: true;
      data: LoginResponse & { is_verified?: boolean };
    };

// Type guard to check if response is a user login response
function isUserLoginResponse(data: LoginResponse): data is UserLoginResponse {
  return 'user_id' in data && 'is_verified' in data;
}

// Type guard to check if response is an admin login response
function isAdminLoginResponse(data: LoginResponse): data is AdminLoginResponse {
  return 'admin_id' in data && !('is_verified' in data);
}

export async function login(formData: { email: string; password: string }): Promise<LoginResult> {
  try {
    const response = await fetch('http://localhost:8080/IAM/authentication/Login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        email: formData.email,
        password: formData.password
      }),
    });

    if (!response.ok) {
      return {
        success: false,
        message: response.status === 400
          ? 'Invalid credentials. Please check your email and password.'
          : 'Server error. Please try again later.',
      };
    }

    const data: LoginResponse = await response.json();
    
    // Set the token in cookies
    const cookiesStore = await cookies();
    
    cookiesStore.set({
      name: 'token',
      value: data.token,
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'strict',
      path: '/'
    });

    // Store the user's name
    cookiesStore.set({
      name: 'userName',
      value: data.name,
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'strict',
      path: '/'
    });

    // Set userType based on role
    cookiesStore.set({
      name: 'userType',
      value: data.role,
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'strict',
      path: '/'
    });
    
    // Handle is_verified flag - only exists for regular users, not admins
    let isVerified = 'true'; // Default for admins
    
    if (isUserLoginResponse(data)) {
      // Regular user - use the is_verified field from response
      isVerified = data.is_verified.toString();
    } else if (isAdminLoginResponse(data)) {
      // Admin - they're always considered verified
      isVerified = 'true';
    }
    
    cookiesStore.set({
      name: 'isVerified',
      value: isVerified,
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'strict',
      path: '/'
    });

    // Return the data with is_verified included for consistency
    return { 
      success: true,
      data: {
        ...data,
        is_verified: isVerified === 'true'
      }
    };
  } catch (error) {
    console.error('Login error:', error);
    return {
      success: false,
      message: 'An unexpected error occurred. Please try again.',
    };
  }
}