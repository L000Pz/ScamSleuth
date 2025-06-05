// src/app/signup/actions.ts
'use server';

import { cookies } from 'next/headers';

// User response interface based on your API
interface UserTokenResponse {
  user_id: number;
  username: string;
  email: string;
  name: string;
  profile_picture_id: number | null;
  is_verified: boolean;
  token: string;
  role: string;
}

// SignupResponse interface for the registration endpoint
interface SignupResponse {
  users: {
    user_id: number;
    username: string;
    email: string;
    name: string;
    password: string;
    is_verified: boolean;
  };
  token: string;
}

type SignupResult = 
  | {
      success: false;
      message: string;
    }
  | {
      success: true;
      data: {
        user_id: number;
        username: string;
        email: string;
        name: string;
        profile_picture_id: number | null;
        is_verified: boolean;
        role: string;
      };
    };

export async function signup(formData: {
  email: string;
  username: string;
  password: string;
  name: string;
}): Promise<SignupResult> {
  try {
    // First, perform the registration to get the token
    const signupResponse = await fetch('http://localhost:8080/IAM/authentication/Register', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        email: formData.email,
        username: formData.username,
        password: formData.password,
        name: formData.name
      }),
    });

    if (!signupResponse.ok) {
      return {
        success: false,
        message: signupResponse.status === 400
          ? 'Registration failed. Please check your information and try again.'
          : 'Server error. Please try again later.',
      };
    }

    const signupData: SignupResponse = await signupResponse.json();
    const token = signupData.token;

    if (!token) {
      return {
        success: false,
        message: 'Registration failed: No token received.',
      };
    }

    // Now use the token to get complete user information
    const userInfoResponse = await fetch(
      `http://localhost:8080/IAM/authentication/ReturnByToken?token=${encodeURIComponent(token)}`,
      {
        method: 'GET',
        headers: { 
          'Accept': '*/*' 
        },
      }
    );

    if (!userInfoResponse.ok) {
      return {
        success: false,
        message: 'Failed to retrieve user information.',
      };
    }

    const userInfo: UserTokenResponse = await userInfoResponse.json();
    
    // Only store the essential token
    const cookiesStore = await cookies();
    
    cookiesStore.set({
      name: 'token',
      value: userInfo.token,
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'strict',
      path: '/'
    });

    // Return simplified data structure
    return { 
      success: true,
      data: {
        user_id: userInfo.user_id,
        username: userInfo.username,
        email: userInfo.email,
        name: userInfo.name,
        profile_picture_id: userInfo.profile_picture_id,
        is_verified: userInfo.is_verified,
        role: userInfo.role,
      }
    };
  } catch (error) {
    console.error('Signup error:', error);
    return {
      success: false,
      message: 'An unexpected error occurred. Please try again.',
    };
  }
}