// middleware.ts
import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

// Define protected routes
const authRequiredRoutes = ['/dashboard', '/admin-dashboard'];
const adminRoutes = ['/admin-dashboard'];
const userRoutes = ['/dashboard'];
const noAuthRoutes = ['/login', '/signup'];
const otpRoute = '/otp';

export function middleware(request: NextRequest) {
  const token = request.cookies.get('token');
  const userType = request.cookies.get('userType');
  const isVerified = request.cookies.get('isVerified');
  const currentPath = request.nextUrl.pathname;

  // Create response with cache-busting headers
  const response = NextResponse.next();
  response.headers.set('Cache-Control', 'no-store, must-revalidate');
  response.headers.set('Pragma', 'no-cache');
  response.headers.set('Expires', '0');

  // If user has token but is not verified and trying to access something other than OTP
  if (token && isVerified?.value !== 'true' && currentPath !== '/otp') {
    // If they're trying to access login/signup, clean up their session
    if (noAuthRoutes.some(route => currentPath === route)) {
      const cleanupResponse = NextResponse.redirect(new URL(currentPath, request.url));
      
      // Clear all cookies
      cleanupResponse.cookies.delete('token');
      cleanupResponse.cookies.delete('userType');
      cleanupResponse.cookies.delete('isVerified');
      
      return cleanupResponse;
    }
    
    // Otherwise redirect to OTP
    return NextResponse.redirect(new URL('/otp', request.url));
  }

  // Case 1: Check if admin is trying to access user dashboard
  if (userRoutes.some(route => currentPath.startsWith(route))) {
    if (userType?.value === 'admin') {
      return NextResponse.redirect(new URL('/admin-dashboard', request.url));
    }
  }

  // Case 2: Trying to access protected routes without being logged in
  if (authRequiredRoutes.some(route => currentPath.startsWith(route))) {
    if (!token) {
      return NextResponse.redirect(new URL('/login', request.url));
    }
    const isVerified = request.cookies.get('isVerified')?.value === 'true';
    if (!isVerified && currentPath !== '/otp') {
      return NextResponse.redirect(new URL('/otp', request.url));
    }
    return response;
  }

  // Case 3: Trying to access admin routes without being admin
  if (adminRoutes.some(route => currentPath.startsWith(route))) {
    if (userType?.value !== 'admin') {
      // If logged in as regular user, redirect to user dashboard
      if (token) {
        return NextResponse.redirect(new URL('/dashboard', request.url));
      }
      // If not logged in, redirect to login
      return NextResponse.redirect(new URL('/login', request.url));
    }
  }

  // Case 4: Accessing login/signup pages while already logged in
  if (noAuthRoutes.some(route => currentPath === route) && token) {
    // Redirect based on user type
    if (userType?.value === 'admin') {
      return NextResponse.redirect(new URL('/admin-dashboard', request.url));
    }
    return NextResponse.redirect(new URL('/dashboard', request.url));
  }

  // Case 5: Accessing OTP page
  if (currentPath === otpRoute) {
    if (!token) {
      return NextResponse.redirect(new URL('/login', request.url));
    }
    
    const isVerified = request.cookies.get('isVerified')?.value === 'true';
    if (isVerified) {
      if (userType?.value === 'admin') {
        return NextResponse.redirect(new URL('/admin-dashboard', request.url));
      }
      return NextResponse.redirect(new URL('/dashboard', request.url));
    }
  }

  return response;
}

// Configure the middleware to run on specific paths
export const config = {
  matcher: [
    '/dashboard/:path*',
    '/admin-dashboard/:path*',
    '/login',
    '/signup',
    '/otp',
  ]
};