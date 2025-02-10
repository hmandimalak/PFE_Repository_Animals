'use client';

import { useState, useEffect } from 'react';
import { useSearchParams } from 'next/navigation';
import { useRouter } from 'next/navigation'; 
import axios from 'axios';

export default function ResetPassword() {
  const searchParams = useSearchParams();
  const token = searchParams.get('token');
  const email = searchParams.get('email');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');
  const router = useRouter();

  useEffect(() => {
    if (!token || !email) {
      setError('Invalid reset link');
    }
  }, [token, email]);

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (password !== confirmPassword) {
      setError('Passwords do not match');
      return;
    }

    try {
      const response = await axios.post('http://127.0.0.1:8000/api/auth/password-reset/confirm/', {
        token,
        email,
        password,
        confirm_password: confirmPassword, // Make sure this field is sent
      });

      setMessage(response.data.message);
      setError('');
      setTimeout(() => {
        router.push('/login'); // Redirect after success
      }, 2000);
      
    } catch (error) {
      setError(error.response?.data?.error || 'Error resetting password');
    }
  };

  return (
    <div className="flex items-center justify-center min-h-screen bg-gray-50">
      <div className="w-full max-w-md p-6 bg-white rounded shadow">
        <h2 className="text-center text-2xl font-bold">Reset Password</h2>
        <form onSubmit={handleSubmit} className="mt-4">
          <input
            type="password"
            placeholder="New Password"
            className="w-full p-2 border rounded mb-2"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
          />
          <input
            type="password"
            placeholder="Confirm Password"
            className="w-full p-2 border rounded mb-2"
            value={confirmPassword}
            onChange={(e) => setConfirmPassword(e.target.value)}
            required
          />
          {error && <p className="text-red-500">{error}</p>}
          {message && <p className="text-green-500">{message}</p>}
          <button type="submit" className="w-full p-2 mt-2 text-white bg-indigo-600 rounded">
            Reset Password
          </button>
        </form>
      </div>
    </div>
  );
}
