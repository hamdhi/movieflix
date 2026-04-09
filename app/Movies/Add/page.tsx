'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';

export default function AddMoviePage() {
  const router = useRouter();

  const [formData, setFormData] = useState({
    title: '',
    description: '',
    durationMinutes: '',
    language: '',
    releaseDate: '',
    genre: '',
  });

  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isCheckingAuth, setIsCheckingAuth] = useState(true);

  // Protect this route: Only Admins are allowed here
  useEffect(() => {
    const userStr = localStorage.getItem('user');
    if (!userStr) {
      router.push('/login');
      return;
    }

    try {
      const user = JSON.parse(userStr);
      if (!user.roles || !user.roles.includes('ROLE_ADMIN')) {
        // Not an admin? Kick them back to the main movies page
        router.push('/Movies');
        return;
      }
    } catch (e) {
      router.push('/login');
      return;
    }
    
    setIsCheckingAuth(false);
  }, [router]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    setError('');

    const token = localStorage.getItem('token');

    try {
      const response = await fetch('http://localhost:8080/api/v1/movies/add', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`, // Pass the JWT token
        },
        body: JSON.stringify({
          ...formData,
          // Ensure duration is sent as a number, not a string
          durationMinutes: parseInt(formData.durationMinutes, 10), 
        }),
      });

      if (!response.ok) {
        if (response.status === 401 || response.status === 403) {
          throw new Error('Unauthorized: Only administrators can add movies.');
        }
        const data = await response.json().catch(() => null);
        throw new Error(data?.message || 'Failed to add movie. Please check your inputs.');
      }

      // Success! Redirect back to the movie list
      router.push('/Movies');

    } catch (err) {
      setError(err.message);
    } finally {
      setIsLoading(false);
    }
  };

  if (isCheckingAuth) {
    return <div className="min-h-screen flex items-center justify-center">Verifying permissions...</div>;
  }

  return (
    <div className="min-h-screen bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-2xl mx-auto bg-white rounded-xl shadow-md p-8">
        
        <div className="mb-8 flex items-center justify-between">
          <h2 className="text-3xl font-bold text-gray-900">Add New Movie</h2>
          <button 
            onClick={() => router.push('/Movies')}
            className="text-gray-500 hover:text-gray-700 font-medium text-sm"
          >
            ← Back to Movies
          </button>
        </div>

        {error && (
          <div className="mb-6 bg-red-50 border border-red-200 text-red-600 px-4 py-3 rounded-md text-sm">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            
            {/* Title */}
            <div className="md:col-span-2">
              <label htmlFor="title" className="block text-sm font-medium text-gray-700">Movie Title</label>
              <input
                type="text" id="title" name="title" required
                value={formData.title} onChange={handleChange}
                className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
                placeholder="e.g., Inception"
              />
            </div>

            {/* Description */}
            <div className="md:col-span-2">
              <label htmlFor="description" className="block text-sm font-medium text-gray-700">Description</label>
              <textarea
                id="description" name="description" rows="3" required
                value={formData.description} onChange={handleChange}
                className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
                placeholder="A brief summary of the movie..."
              />
            </div>

            {/* Genre */}
            <div>
              <label htmlFor="genre" className="block text-sm font-medium text-gray-700">Genre</label>
              <input
                type="text" id="genre" name="genre" required
                value={formData.genre} onChange={handleChange}
                className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
                placeholder="e.g., Sci-Fi, Action"
              />
            </div>

            {/* Language */}
            <div>
              <label htmlFor="language" className="block text-sm font-medium text-gray-700">Language</label>
              <input
                type="text" id="language" name="language" required
                value={formData.language} onChange={handleChange}
                className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
                placeholder="e.g., English"
              />
            </div>

            {/* Duration */}
            <div>
              <label htmlFor="durationMinutes" className="block text-sm font-medium text-gray-700">Duration (Minutes)</label>
              <input
                type="number" id="durationMinutes" name="durationMinutes" required min="1"
                value={formData.durationMinutes} onChange={handleChange}
                className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
                placeholder="120"
              />
            </div>

            {/* Release Date */}
            <div>
              <label htmlFor="releaseDate" className="block text-sm font-medium text-gray-700">Release Date</label>
              {/* Using type="date" ensures it formats as YYYY-MM-DD which Java's LocalDate parses perfectly */}
              <input
                type="date" id="releaseDate" name="releaseDate" required
                value={formData.releaseDate} onChange={handleChange}
                className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
              />
            </div>
          </div>

          <div className="flex justify-end pt-4 border-t border-gray-200">
            <button
              type="submit"
              disabled={isLoading}
              className="bg-indigo-600 text-white px-6 py-2 rounded-md hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:opacity-50 disabled:cursor-not-allowed font-medium"
            >
              {isLoading ? 'Saving...' : 'Add Movie'}
            </button>
          </div>
        </form>

      </div>
    </div>
  );
}