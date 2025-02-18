'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { signIn } from "next-auth/react";
import { FaGoogle } from "react-icons/fa";



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
  onClick={() => signIn("google")}
  className="px-6 py-3 text-sm bg-pastel-blue text-white rounded-full hover:bg-pastel-green transition flex items-center"
>
  <FaGoogle className="mr-2" /> Login with Google
</button>

        </div>
      </div>
    </div>
  );
}
