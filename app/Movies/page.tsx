'use client';

import { useState, useEffect, useCallback } from 'react';
import { useRouter } from 'next/navigation';

export default function MoviesPage() {
  const router = useRouter();

  // --- STATE MANAGEMENT ---
  const [movies, setMovies] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');
  const [isAdmin, setIsAdmin] = useState(false);

  // Pagination & Search State matching your Spring Boot backend
  const [page, setPage] = useState(0);
  const [totalPages, setTotalPages] = useState(1);
  const [searchFilters, setSearchFilters] = useState({
    title: '',
    genre: '',
    language: '',
  });

  // --- INITIALIZATION & AUTH CHECK ---
  useEffect(() => {
    // Check if user is logged in and if they are an ADMIN
    const userStr = localStorage.getItem('user');
    if (!userStr) {
      router.push('/login'); // Not logged in? Kick them to login.
      return;
    }

    try {
      const user = JSON.parse(userStr);
      if (user.roles && user.roles.includes('ROLE_ADMIN')) {
        setIsAdmin(true);
      }
    } catch (e) {
      console.error('Failed to parse user data');
    }
  }, [router]);

  // --- FETCH DATA FROM SPRING BOOT ---
  const fetchMovies = useCallback(async () => {
    setIsLoading(true);
    setError('');

    const token = localStorage.getItem('token');
    if (!token) return;

    // Build the query string based on filters and current page
    const queryParams = new URLSearchParams({
      page: page.toString(),
      size: '10', // Default page size
    });

    if (searchFilters.title) queryParams.append('title', searchFilters.title);
    if (searchFilters.genre) queryParams.append('genre', searchFilters.genre);
    if (searchFilters.language) queryParams.append('language', searchFilters.language);

    try {
      const response = await fetch(`http://localhost:8080/api/v1/movies?${queryParams.toString()}`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}` // The crucial JWT!
        },
      });

      if (!response.ok) {
        if (response.status === 401) {
          router.push('/login'); // Token expired
          return;
        }
        throw new Error('Failed to fetch movies');
      }

      const data = await response.json();
      
      // Map to your backend's Map<String, Object> response structure
      setMovies(data.movies || []);
      setTotalPages(data.totalPages || 1);

    } catch (err) {
      setError(err.message);
    } finally {
      setIsLoading(false);
    }
  }, [page, searchFilters, router]);

  // Trigger fetch when page or filters change
  useEffect(() => {
    fetchMovies();
  }, [fetchMovies]);

  // --- EVENT HANDLERS ---
  const handleSearchChange = (e) => {
    const { name, value } = e.target;
    setSearchFilters(prev => ({ ...prev, [name]: value }));
    setPage(0); // Reset to first page on new search
  };

  const deleteMovie = async (movieId) => {
    if (!window.confirm("Are you sure you want to delete this movie?")) return;
    
    const token = localStorage.getItem('token');
    try {
      const res = await fetch(`http://localhost:8080/api/v1/movies/${movieId}`, {
        method: 'DELETE',
        headers: { 'Authorization': `Bearer ${token}` }
      });
      if (res.ok) fetchMovies(); // Refresh list
    } catch (err) {
      alert("Failed to delete movie");
    }
  };

  return (
    <div className="min-h-screen bg-gray-100 p-6">
      <div className="max-w-7xl mx-auto space-y-6">
        
        {/* HEADER & ADMIN ACTIONS */}
        <div className="flex justify-between items-center bg-white p-6 rounded-xl shadow-sm">
          <h1 className="text-3xl font-bold text-gray-900">Now Showing</h1>
          
          {isAdmin && (
            <button 
              onClick={() => router.push('/Movies/Add')} // Route to your Add Movie form
              className="bg-indigo-600 text-white px-4 py-2 rounded-md hover:bg-indigo-700 font-medium transition-colors"
            >
              + Add New Movie
            </button>
          )}
        </div>

        {/* SEARCH & FILTERS */}
        <div className="bg-white p-6 rounded-xl shadow-sm grid grid-cols-1 md:grid-cols-3 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Search Title</label>
            <input
              type="text" name="title" value={searchFilters.title} onChange={handleSearchChange}
              placeholder="e.g. Inception"
              className="w-full rounded-md border border-gray-300 px-3 py-2 focus:ring-indigo-500 focus:border-indigo-500"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Genre</label>
            <input
              type="text" name="genre" value={searchFilters.genre} onChange={handleSearchChange}
              placeholder="e.g. Action"
              className="w-full rounded-md border border-gray-300 px-3 py-2 focus:ring-indigo-500 focus:border-indigo-500"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Language</label>
            <input
              type="text" name="language" value={searchFilters.language} onChange={handleSearchChange}
              placeholder="e.g. English"
              className="w-full rounded-md border border-gray-300 px-3 py-2 focus:ring-indigo-500 focus:border-indigo-500"
            />
          </div>
        </div>

        {/* ERROR STATE */}
        {error && (
          <div className="bg-red-50 text-red-500 p-4 rounded-md border border-red-200">
            {error}
          </div>
        )}

        {/* LOADING STATE */}
        {isLoading ? (
          <div className="text-center py-20 text-gray-500">Loading movies...</div>
        ) : movies.length === 0 ? (
          <div className="text-center py-20 bg-white rounded-xl shadow-sm text-gray-500">
            No movies found matching your criteria.
          </div>
        ) : (
          /* MOVIE GRID */
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {movies.map((movie) => (
              <div key={movie.id} className="bg-white rounded-xl shadow-sm overflow-hidden border border-gray-100 flex flex-col">
                <div className="p-6 flex-grow space-y-3">
                  <div className="flex justify-between items-start">
                    <h2 className="text-xl font-bold text-gray-900 line-clamp-1">{movie.title}</h2>
                    <span className="bg-blue-100 text-blue-800 text-xs px-2 py-1 rounded-full font-medium">
                      {movie.language}
                    </span>
                  </div>
                  
                  <p className="text-sm text-gray-500 line-clamp-2">{movie.description}</p>
                  
                  <div className="flex items-center text-sm text-gray-600 gap-4">
                    <span className="font-medium bg-gray-100 px-2 py-1 rounded">{movie.genre}</span>
                    <span>⏱ {movie.durationMinutes} min</span>
                  </div>
                </div>

                {/* ACTION BUTTONS */}
                <div className="p-4 border-t border-gray-100 bg-gray-50 flex gap-2">
                  <button
                    onClick={() => router.push(`/Movies/${movie.id}/Shows`)} // Links to Shows view
                    className="flex-1 bg-indigo-600 text-white px-3 py-2 rounded-md hover:bg-indigo-700 font-medium text-sm transition-colors text-center"
                  >
                    View Shows & Book
                  </button>
                  
                  {isAdmin && (
                    <>
                      <button 
                        onClick={() => router.push(`/movies/edit/${movie.id}`)}
                        className="bg-white border border-gray-300 text-gray-700 px-3 py-2 rounded-md hover:bg-gray-50 font-medium text-sm transition-colors"
                      >
                        Edit
                      </button>
                      <button 
                        onClick={() => deleteMovie(movie.id)}
                        className="bg-white border border-red-300 text-red-600 px-3 py-2 rounded-md hover:bg-red-50 font-medium text-sm transition-colors"
                      >
                        Delete
                      </button>
                    </>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}

        {/* PAGINATION */}
        {!isLoading && movies.length > 0 && (
          <div className="flex justify-center items-center space-x-4 py-6">
            <button
              onClick={() => setPage(p => Math.max(0, p - 1))}
              disabled={page === 0}
              className="px-4 py-2 border border-gray-300 rounded-md bg-white disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50"
            >
              Previous
            </button>
            <span className="text-gray-600 font-medium">
              Page {page + 1} of {totalPages}
            </span>
            <button
              onClick={() => setPage(p => Math.min(totalPages - 1, p + 1))}
              disabled={page >= totalPages - 1}
              className="px-4 py-2 border border-gray-300 rounded-md bg-white disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50"
            >
              Next
            </button>
          </div>
        )}

      </div>
    </div>
  );
}