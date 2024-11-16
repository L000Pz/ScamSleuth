// src/middleware.ts
import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

export function middleware(request: NextRequest) {
  // Check if the authToken cookie exists
  const token = request.cookies.get('authToken');

  // Define a condition to restrict access to specific pages
  const isOTPPage = request.nextUrl.pathname.startsWith('/otp');
  console.log(isOTPPage)
  
  if (isOTPPage && token) {
    // If there's no token, redirect to login
    const loginUrl = new URL('/login', request.url);
    return NextResponse.redirect(loginUrl);
  }

  return NextResponse.next();
}

// Limit middleware to specific paths
export const config = {
  matcher: ['/otp', '/dashboard', '/some-other-protected-page'],
};
