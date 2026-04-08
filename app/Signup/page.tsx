'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';

export default function SignUpPage() {
  const router = useRouter();
  
  // State updated to include role
  const [formData, setFormData] = useState({
    username: '',
    email: '',
    password: '',
    role: 'user', // Default selection
  });

  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    setError('');
    setSuccess('');

    try {
      const response = await fetch('http://localhost:8080/api/auth/signup', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        // Matching your exact backend JSON requirement
        body: JSON.stringify({
          username: formData.username,
          email: formData.email,
          password: formData.password,
          role: [formData.role], // Wrapped in an array!
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || 'Registration failed. Please try again.');
      }

      setSuccess(data.message || 'User registered successfully!');
      
      setFormData({ username: '', email: '', password: '', role: 'user' });

      setTimeout(() => {
        router.push('/Login');
      }, 2000);

    } catch (err) {
      setError(err.message);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-gray-50 px-4 py-12 sm:px-6 lg:px-8">
      <div className="w-full max-w-md space-y-8 bg-white p-8 rounded-xl shadow-md">
        
        <div>
          <h2 className="mt-6 text-center text-3xl font-bold tracking-tight text-gray-900">
            Create an account
          </h2>
        </div>

        <form className="mt-8 space-y-6" onSubmit={handleSubmit}>
          
          {error && <div className="text-red-500 text-sm">{error}</div>}
          {success && <div className="text-green-600 text-sm">{success} Redirecting...</div>}

          <div className="space-y-4 rounded-md shadow-sm">
            <div>
              <label className="block text-sm font-medium text-gray-700" htmlFor="username">Username</label>
              <input
                id="username" name="username" type="text" required
                value={formData.username} onChange={handleChange}
                className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2"
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700" htmlFor="email">Email address</label>
              <input
                id="email" name="email" type="email" required
                value={formData.email} onChange={handleChange}
                className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700" htmlFor="password">Password</label>
              <input
                id="password" name="password" type="password" required
                value={formData.password} onChange={handleChange}
                className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2"
              />
            </div>

            {/* New Role Selection Dropdown */}
            <div>
              <label className="block text-sm font-medium text-gray-700" htmlFor="role">Account Type</label>
              <select
                id="role" name="role"
                value={formData.role} onChange={handleChange}
                className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 bg-white"
              >
                <option value="user">Standard User</option>
                <option value="admin">Administrator</option>
              </select>
            </div>
          </div>

          <button
            type="submit" disabled={isLoading}
            className="w-full rounded-md bg-indigo-600 py-2 px-4 text-white hover:bg-indigo-700 disabled:opacity-70"
          >
            {isLoading ? 'Creating account...' : 'Sign Up'}
          </button>
        </form>
      </div>
    </div>
  );
}