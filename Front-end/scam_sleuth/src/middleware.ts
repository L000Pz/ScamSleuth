// middleware.ts
import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

// Define protected routes
const authRequiredRoutes = ['/dashboard', '/admin-dashboard'];
const adminRoutes = ['/admin-dashboard'];
const userRoutes = ['/dashboard'];
const noAuthRoutes = ['/login', '/signup'];
const otpRoute = '/otp';

async function getUserInfoFromToken(token: string) {
  try {
    const response = await fetch(
      `http://localhost:8080/IAM/authentication/ReturnByToken?token=${encodeURIComponent(token)}`,
      {
        method: 'GET',
        headers: { 
          'Accept': '*/*' 
        },
      }
    );

    if (!response.ok) {
      return null;
    }

    return await response.json();
  } catch (error) {
    console.error('Error fetching user info:', error);
    return null;
  }
}

export async function middleware(request: NextRequest) {
  const token = request.cookies.get('token');
  const currentPath = request.nextUrl.pathname;

  // Create response with cache-busting headers
  const response = NextResponse.next();
  response.headers.set('Cache-Control', 'no-store, must-revalidate');
  response.headers.set('Pragma', 'no-cache');
  response.headers.set('Expires', '0');

  // If no token, handle public routes
  if (!token) {
    // Allow access to login/signup pages
    if (noAuthRoutes.some(route => currentPath === route)) {
      return response;
    }
    
    // Redirect to login for protected routes
    if (authRequiredRoutes.some(route => currentPath.startsWith(route)) || currentPath === otpRoute) {
      return NextResponse.redirect(new URL('/login', request.url));
    }
    
    return response;
  }

  // Get user info from token
  const userInfo = await getUserInfoFromToken(token.value);
  
  // If token is invalid, clear it and redirect to login
  if (!userInfo) {
    const cleanupResponse = NextResponse.redirect(new URL('/login', request.url));
    cleanupResponse.cookies.delete('token');
    return cleanupResponse;
  }

  const { role, is_verified } = userInfo;

  // Handle unverified users (but not admins)
  if (!is_verified && role !== 'admin' && currentPath !== '/otp') {
    // If they're trying to access login/signup, clean up their session
    if (noAuthRoutes.some(route => currentPath === route)) {
      const cleanupResponse = NextResponse.redirect(new URL(currentPath, request.url));
      cleanupResponse.cookies.delete('token');
      return cleanupResponse;
    }
    
    // Otherwise redirect to OTP
    return NextResponse.redirect(new URL('/otp', request.url));
  }

  // Case 1: Check if admin is trying to access user dashboard
  if (userRoutes.some(route => currentPath.startsWith(route))) {
    if (role === 'admin') {
      return NextResponse.redirect(new URL('/admin-dashboard', request.url));
    }
  }

  // Case 2: Trying to access admin routes without being admin
  if (adminRoutes.some(route => currentPath.startsWith(route))) {
    if (role !== 'admin') {
      // If logged in as regular user, redirect to user dashboard
      return NextResponse.redirect(new URL('/dashboard', request.url));
    }
  }

  // Case 3: Accessing login/signup pages while already logged in
  if (noAuthRoutes.some(route => currentPath === route)) {
    // Redirect based on user type
    if (role === 'admin') {
      return NextResponse.redirect(new URL('/admin-dashboard', request.url));
    }
    return NextResponse.redirect(new URL('/dashboard', request.url));
  }

  // Case 4: Accessing OTP page
  if (currentPath === otpRoute) {
    // Admins shouldn't access OTP page
    if (role === 'admin') {
      return NextResponse.redirect(new URL('/admin-dashboard', request.url));
    }
    
    if (is_verified) {
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