'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { signIn } from "next-auth/react";


export default function LoginForm() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  // Handle Google login
  const handleGoogleLogin = async (googleResponse) => {
    signIn("google");
    try {
      const { tokenId } = googleResponse;
      const response = await fetch('http://localhost:8000/api/auth/google/', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          access_token: tokenId, // Pass the tokenId from Google login
        }),
      });
       // This will initiate the Google OAuth flow

  
      const data = await response.json();
  
      if (data.access) {
        // Store tokens in cookies/localStorage
        document.cookie = `access_token=${data.access}; path=/; max-age=86400`;
        document.cookie = `refresh_token=${data.refresh}; path=/; max-age=86400`;
        localStorage.setItem('access_token', data.access);
        localStorage.setItem('refresh_token', data.refresh);
        router.push('/');  // Redirect after successful login
      } else {
        setError('Google login failed');
      }
    } catch (err) {
      setError('Google login failed');
    }
  };
  
  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    if (!email || !password) {
      setError('Please fill in all fields');
      setLoading(false);
      return;
    }

    try {
      const response = await fetch('http://localhost:8000/api/auth/login/', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password }),
      });

      const data = await response.json();
      if (!response.ok) throw new Error(data.detail || 'Login failed');

      document.cookie = `access_token=${data.access}; path=/; max-age=86400`;
      document.cookie = `refresh_token=${data.refresh}; path=/; max-age=86400`;

      localStorage.setItem('access_token', data.access);
      localStorage.setItem('refresh_token', data.refresh);
      router.push('/'); // Redirect to home
    } catch (err) {
      setError(err.message || 'Login failed. Please check your credentials.');
    } finally {
      setLoading(false);
    }
  };

  const googleLoginSuccess = (response) => {
    handleGoogleLogin(response);
  };

  const googleLoginFailure = (error) => {
    console.error('Google login error:', error);
    setError('Google login failed. Please try again.');
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8">
        <div>
          <h2 className="mt-6 text-center text-3xl font-extrabold text-gray-900">
            Sign in to your account
          </h2>
        </div>
        <form className="mt-8 space-y-6" onSubmit={handleSubmit}>
          {/* Email and password input fields */}
          <div>
            <label htmlFor="email" className="block text-sm font-medium text-gray-700">
              Email address
            </label>
            <input
              id="email"
              name="email"
              type="email"
              autoComplete="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="mt-1 p-2 block w-full rounded-md border border-gray-300 shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
            />
          </div>

          <div>
            <label htmlFor="password" className="block text-sm font-medium text-gray-700">
              Password
            </label>
            <input
              id="password"
              name="password"
              type="password"
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="mt-1 p-2 block w-full rounded-md border border-gray-300 shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
            />
          </div>

          <div>
            {error && <div className="text-red-500 text-sm text-center">{error}</div>}
          </div>
          <div className="flex items-center justify-between">
            <div className="text-sm">
              <Link href="/forgot" className="font-medium text-indigo-600 hover:text-indigo-500">
                Forgot your password?
              </Link>
            </div>
          </div>
          <div>
            <button
              type="submit"
              disabled={loading}
              className="group relative w-full flex justify-center py-2 px-4 border border-transparent text-sm font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:opacity-50"
            >
              {loading ? 'Signing in...' : 'Sign in'}
            </button>
          </div>
        </form>

        <div className="text-center text-sm">
          <span className="text-gray-600">Don't have an account? </span>
          <Link href="/register" className="font-medium text-indigo-600 hover:text-indigo-500">
            Sign up
          </Link>
        </div>

        {/* Google OAuth Button */}
        <div className="text-center mt-4">
          <button
            onClick={handleGoogleLogin}
            className="group relative w-full flex justify-center py-2 px-4 border border-transparent text-sm font-medium rounded-md text-white bg-red-600 hover:bg-red-700 focus:outline-none"
          >
            <svg className="h-5 w-5 mr-2" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 48 48">
              <path fill="#4285F4" d="M24 9.5c3.57 0 6.3 1.47 8.26 2.86l6.18-6.18C34.84 2.03 29.88 0 24 0 14.85 0 7.14 5.85 4 14.27l7.48 5.8c1.64-4.88 6.26-10.57 12.52-10.57z"/>
              <path fill="#34A853" d="M4 14.27C1.5 19.29 1.5 24.71 4 29.73l7.48-5.8c-.49-1.41-.49-2.91 0-4.43L4 14.27z"/>
              <path fill="#FBBC05" d="M24 38.5c-3.69 0-6.74-1.13-9.27-3.07l-7.48 5.8C10.29 45.4 16.81 48 24 48c5.88 0 10.84-2.03 14.44-5.82l-6.18-6.18c-1.97 1.39-4.7 2.86-8.26 2.86z"/>
              <path fill="#EA4335" d="M44 24c0-1.37-.17-2.72-.47-4H24v8h11.44c-.64 2.06-2.03 3.64-4.07 5.07l6.18 6.18C40.44 35.6 44 30.5 44 24z"/>
            </svg>
            Sign in with Google
          </button>
        </div>
      </div>
    </div>
  );
}
