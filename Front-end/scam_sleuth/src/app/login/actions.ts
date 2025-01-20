'use server';

import { cookies } from 'next/headers';

interface AdminResponse {
  admin: {
    admin_id: number;
    username: string;
    email: string;
    name: string;
    contact_info: string;
    password: string;
  };
  token: string;
}

interface UserResponse {
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

type LoginResult = 
  | {
      success: false;
      message: string;
    }
  | {
      success: true;
      data: AdminResponse | UserResponse;
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

    const data: AdminResponse | UserResponse = await response.json();

    // Use NextResponse to set cookies
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
    const userName = 'admin' in data ? data.admin.name : data.users.name;
    cookiesStore.set({
      name: 'userName',
      value: userName,
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'strict',
      path: '/'
    });

    if ('admin' in data) {
      // Admin case
      cookiesStore.set({
        name: 'userType',
        value: 'admin',
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'strict',
        path: '/'
      });
      
      // Set isVerified to true for admins
      cookiesStore.set({
        name: 'isVerified',
        value: 'true',
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'strict',
        path: '/'
      });
    } else {
      // Regular user case
      cookiesStore.set({
        name: 'userType',
        value: 'user',
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'strict',
        path: '/'
      });
      
      cookiesStore.set({
        name: 'isVerified',
        value: data.users.is_verified.toString(),
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'strict',
        path: '/'
      });
    }

    return { 
      success: true,
      data: data
    };
  } catch (error) {
    console.error('error:', error);
    return {
      success: false,
      message: 'An unexpected error occurred. Please try again.',
    };
  }
}