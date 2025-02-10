'use client';

import { useState } from 'react';

export default function ForgotPassword() {
  const [email, setEmail] = useState('');
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setMessage('');
    setError('');

    try {
      const response = await fetch('http://localhost:8000/api/auth/password-reset/', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email }),
      });

      if (!response.ok) {
        throw new Error('Failed to send reset email');
      }

      setMessage('Check your email for the reset link');
    } catch (err) {
      setError(err.message || 'Something went wrong');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex items-center justify-center min-h-screen bg-gray-50">
      <div className="w-full max-w-md p-6 bg-white rounded shadow">
        <h2 className="text-center text-2xl font-bold">Forgot Password</h2>
        <form onSubmit={handleSubmit} className="mt-4">
          <input
            type="email"
            placeholder="Enter your email"
            className="w-full p-2 border rounded"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
          />
          <button type="submit" className="w-full p-2 mt-2 text-white bg-indigo-600 rounded disabled:opacity-50" disabled={loading}>
            {loading ? 'Sending...' : 'Send Reset Email'}
          </button>
        </form>
        {message && <p className="mt-2 text-green-500">{message}</p>}
        {error && <p className="mt-2 text-red-500">{error}</p>}
      </div>
    </div>
  );
}

 
 