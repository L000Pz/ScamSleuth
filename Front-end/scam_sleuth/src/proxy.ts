import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

export default async function proxy(request: NextRequest) {
  const token = request.cookies.get('token');
  const currentPath = request.nextUrl.pathname;

  const response = NextResponse.next({
    headers: {
      "Cache-Control": "no-store, must-revalidate",
      "Pragma": "no-cache",
      "Expires": "0",
    },
  });

  if (!token) {
    if (['/login', '/signup'].includes(currentPath)) return response;

    if (
      currentPath.startsWith('/dashboard') ||
      currentPath.startsWith('/admin-dashboard') ||
      currentPath === '/otp'
    ) {
      return NextResponse.redirect(new URL('/login', request.url));
    }

    return response;
  }

  // user validation:
  const userInfo = await getUserInfoFromToken(token.value);
  if (!userInfo) {
    const cleanup = NextResponse.redirect(new URL('/login', request.url));
    cleanup.cookies.delete('token');
    return cleanup;
  }

  const { role, is_verified } = userInfo;

  if (!is_verified && role !== 'admin' && currentPath !== '/otp') {
    const cleanup = NextResponse.redirect(new URL('/otp', request.url));
    return cleanup;
  }

  if (currentPath.startsWith('/dashboard') && role === 'admin') {
    return NextResponse.redirect(new URL('/admin-dashboard', request.url));
  }

  if (currentPath.startsWith('/admin-dashboard') && role !== 'admin') {
    return NextResponse.redirect(new URL('/dashboard', request.url));
  }

  if (['/login', '/signup'].includes(currentPath)) {
    return NextResponse.redirect(
      new URL(role === 'admin' ? '/admin-dashboard' : '/dashboard', request.url)
    );
  }

  if (currentPath === '/otp') {
    if (role === 'admin') return NextResponse.redirect(new URL('/admin-dashboard', request.url));
    if (is_verified) return NextResponse.redirect(new URL('/dashboard', request.url));
  }

  return response;
}

async function getUserInfoFromToken(token: string) {
  try {
    const response = await fetch(
      `${process.env.NEXT_PUBLIC_API_URL}/IAM/authentication/ReturnByToken?token=${encodeURIComponent(token)}`,
      { method: 'GET', headers: { Accept: '*/*' } }
    );

    if (!response.ok) return null;
    return await response.json();
  } catch {
    return null;
  }
}

export const config = {
  matcher: [
    '/dashboard/:path*',
    '/admin-dashboard/:path*',
    '/login',
    '/signup',
    '/otp',
  ]
};
