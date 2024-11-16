// 'use server';

// import { NextResponse } from 'next/server';

// export async function loginUser({ email, password }: { email: string; password: string }) {
//   // Mock user validation (replace this with actual database/auth logic)
//   const users = [
//     { email: 'admin@example.com', password: 'password123', role: 'admin' },
//     { email: 'user@example.com', password: 'password123', role: 'user' },
//   ];

//   const user = users.find((u) => u.email === email && u.password === password);

//   if (!user) {
//     throw new Error('Invalid credentials');
//   }

//   // Generate token (replace this with real token generation logic)
//   const token = `mock-token-${user.role}`;

//   // Set cookie using NextResponse
//   const response = NextResponse.json({ role: user.role });
//   response.cookies.set('authToken', token, {
//     httpOnly: true,
//     secure: process.env.NODE_ENV === 'production',
//     sameSite: 'strict',
//     path: '/',
//     maxAge: 60 * 60 * 24 * 7, // 1 week
//   });

//   return response;
// }
