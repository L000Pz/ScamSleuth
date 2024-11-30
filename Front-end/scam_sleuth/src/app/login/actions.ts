'use server';

import { cookies } from 'next/headers';

interface LoginResponse {
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

export async function login(formData: { email: string; password: string }): Promise<
  | {
      success: false;
      message: string;
    }
  | {
      success: true;
      userData: LoginResponse['users'];
    }
> {
  try {
    const response = await fetch('http://localhost:5000/authentication/Login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        email: formData.email,
        password: formData.password
      }),
    });

    if (!response.ok) {
      return response.status === 400
        ? {
            success: false,
            message: 'Invalid credentials. Please check your email and password.',
          }
        : {
            success: false,
            message: 'Server error. Please try again later.',
          };
    }

    const data: LoginResponse = await response.json();

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

    return { 
      success: true,
      userData: data.users
    };
  } catch (error) {
    console.error('error:', error);
    return {
      success: false,
      message: 'An unexpected error occurred. Please try again.',
    };
  }
}
