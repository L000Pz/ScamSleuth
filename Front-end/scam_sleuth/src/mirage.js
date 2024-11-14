// src/mirage.js
import { createServer, Response } from 'miragejs'; // Import Response for error handling
import heroImage from './assets/images/hero.png'; // Ensure correct relative path

export function makeServer({ environment = 'development' } = {}) {
  console.log('Mirage server is starting...');
  
  return createServer({
    environment,

    routes() {
      this.namespace = 'api';

      // Mock GET request for scams
      this.get('/scams', () => {
        return [
          {
            id: '1',
            name: 'Fake Charity Organization',
            description: 'This scam tricks people into donating to a fake charity.',
            imageUrl: heroImage,
          },
          {
            id: '2',
            name: 'Phishing Email',
            description: 'An email scam claiming to be from a bank asking for sensitive info.',
            imageUrl: heroImage,
          },
          {
            id: '3',
            name: 'Online Job Fraud',
            description: 'Scammers offer fake job positions to gather personal data.',
            imageUrl: heroImage,
          },
          {
            id: '4',
            name: 'Lottery Scam',
            description: 'Victims are told they won a lottery to collect advance fees.',
            imageUrl: heroImage,
          },
          {
            id: '5',
            name: 'Tech Support Scam',
            description: 'Fake tech support requests access to your device.',
            imageUrl: heroImage,
          },
          {
            id: '6',
            name: 'Romance Scam',
            description: 'Scammers pose as romantic partners to exploit victims financially.',
            imageUrl: heroImage,
          },
        ];
      });

      // Mock POST request for sign-up
      this.post('/signup', (schema, request) => {
        const attrs = JSON.parse(request.requestBody);

        if (attrs.username === 'existinguser') {
          return new Response(400, {}, { message: 'Username already taken' });
        }

        return { message: 'Signup successful', user: attrs };
      });

      // Mock OTP verification endpoint
      this.post('/verify-otp', (schema, request) => {
        const { otp } = JSON.parse(request.requestBody);

        if (otp === '123456') {
          return { success: true, token: 'mockToken123' };
        } else {
          return new Response(400, {}, { success: false, message: 'Invalid OTP. Please try again.' });
        }
      });

      // Mock resend OTP endpoint
      this.post('/resend-otp', () => {
        return { message: 'OTP resent! Please check your email.' };
      });

      // Mock login endpoint
      this.post('/login', (schema, request) => {
        const { email, password } = JSON.parse(request.requestBody);

        if (email === 'user@example.com' && password === 'password123') {
          return { success: true, token: 'mockToken123' };
        } else {
          return new Response(401, {}, { message: 'Invalid email or password' });
        }
      });
    },
  });
}
