//otp/actions.ts
'use server';

import { cookies } from 'next/headers';

export async function authorize(code: string): Promise<
  | {
      success: false;
      message: string;
    }
  | {
      success: true;
    }
> {
  try {
    const response = await fetch('http://localhost:1234/succeed-verify-otp', {
      method: 'GET',
    //   headers: { 'Content-Type': 'application/json' },
    //   body: JSON.stringify({ otp: code }),
    });

    if (!response.ok)
      return response.status === 400
        ? {
            success: false,
            message: 'Unauthorized request.',
          }
        : {
            success: false,
            message:
              'Response from server was not ok, please contact the site administrators.',
          };

    const data = await response.json();

    if (!data.success)
      return { success: false, message: 'Invalid code. Please try again.' };

    const cookiesStore = await cookies();
    cookiesStore.set('token', data.token);
    return { success: true };
  } catch (error) {
    console.error('error:', error);
    return {
      success: false,
      message: 'An unknown error occurred. Contact the site administrators.',
    };
  }
}
