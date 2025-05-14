// src/app/login/actions.ts
'use server';

import { cookies } from 'next/headers';

interface LoginResponse {
  user_id: number;
  username: string;
  email: string;
  name: string;
  profile_picture_id: number | null;
  is_verified: boolean;
  token: string;
  role: string;
}

type LoginResult = 
  | {
      success: false;
      message: string;
    }
  | {
      success: true;
      data: LoginResponse;
    };

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
    
    // Set isVerified flag
    cookiesStore.set({
      name: 'isVerified',
      value: data.is_verified.toString(),
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'strict',
      path: '/'
    });

    return { 
      success: true,
      data
    };
  } catch (error) {
    console.error('error:', error);
    return {
      success: false,
      message: 'An unexpected error occurred. Please try again.',
    };
  }
}