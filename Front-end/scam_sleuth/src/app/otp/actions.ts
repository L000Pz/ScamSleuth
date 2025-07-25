// src/app/otp/actions.ts
'use server';

import { cookies } from 'next/headers';

export async function authorize(code: string): Promise<{
  success: boolean;
  message: string;
}> {
  const cookieStore = await cookies();
  const token = cookieStore.get('token')?.value;

  if (!token) {
    return {
      success: false,
      message: 'Authentication token not found. Please login again.',
    };
  }

  try {
    const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/IAM/authentication/Verify`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        token,
        code,
      }),
    });

    if (!response.ok) {
      return {
        success: false,
        message: 'Invalid verification code. Please try again.',
      };
    }

    cookieStore.set({
      name: 'isVerified',
      value: 'true',
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'strict',
      path: '/'
    });

    

    return {
      success: true,
      message: 'Account verified successfully!',
    };
  } catch (error) {
    console.error('Verification error:', error);
    return {
      success: false,
      message: 'An unexpected error occurred. Please try again.',
    };
  }
}

export async function resendCode(): Promise<{
  success: boolean;
  message: string;
}> {
  const cookieStore = await cookies();
  const token = cookieStore.get('token')?.value;

  if (!token) {
    return {
      success: false,
      message: 'Authentication token not found. Please login again.',
    };
  }

  try {
    // Changed to use query parameter instead of request body
    const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/IAM/authentication/New Code?token=${token}`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      }
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error('Error response:', errorText);
      return {
        success: false,
        message: 'Failed to generate new code. Please try again.',
      };
    }

    const data = await response.text();
    return {
      success: true,
      message: data || 'New code has been generated!',
    };
  } catch (error) {
    console.error('Resend code error:', error);
    return {
      success: false,
      message: 'An unexpected error occurred. Please try again.',
    };
  }
}