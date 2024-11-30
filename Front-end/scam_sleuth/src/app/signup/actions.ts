// src/app/signup/actions.ts
'use server';

import { cookies } from 'next/headers';

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

export async function signup(formData: {
  email: string;
  username: string;
  password: string;
  name: string;
}): Promise<
  | {
      success: false;
      message: string;
    }
  | {
      success: true;
      userData: SignupResponse['users'];
    }
> {
  try {
    const response = await fetch('http://localhost:5000/authentication/Register', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(formData),
    });

    if (!response.ok) {
      return {
        success: false,
        message: 'Registration failed. Please try again.',
      };
    }

    const data: SignupResponse = await response.json();
    
    // Set the token in cookies
    const cookieStore = await cookies();
    cookieStore.set({
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
    console.error('Signup error:', error);
    return {
      success: false,
      message: 'An unexpected error occurred. Please try again.',
    };
  }
}