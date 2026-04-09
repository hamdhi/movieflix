'use client';

import { useState, useEffect } from 'react';
import { useRouter, useParams } from 'next/navigation';

export default function MovieShowsPage() {
  const router = useRouter();
  const params = useParams();
  const movieId = params.id; // Extracts the ID from the URL

  const [movie, setMovie] = useState(null);
  const [shows, setShows] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchMovieAndShows = async () => {
      const token = localStorage.getItem('token');
      if (!token) {
        router.push('/login');
        return;
      }

      try {
        // 1. Fetch Movie Details
        const movieRes = await fetch(`http://localhost:8080/api/v1/movies/${movieId}`, {
          headers: { 'Authorization': `Bearer ${token}` }
        });
        
        if (!movieRes.ok) throw new Error('Failed to fetch movie details');
        const movieData = await movieRes.json();
        setMovie(movieData);

        // 2. Fetch Shows for this Movie
        const showsRes = await fetch(`http://localhost:8080/api/v1/shows/movie/${movieId}`, {
          headers: { 'Authorization': `Bearer ${token}` }
        });

        if (!showsRes.ok) throw new Error('Failed to fetch shows');
        const showsData = await showsRes.json();
        
        // Sort shows by time
        const sortedShows = showsData.sort((a, b) => new Date(a.showTime) - new Date(b.showTime));
        setShows(sortedShows);

      } catch (err) {
        setError(err.message);
      } finally {
        setIsLoading(false);
      }
    };

    fetchMovieAndShows();
  }, [movieId, router]);

  // Helper function to format the LocalDateTime string from Java into a readable format
  const formatDateTime = (dateString) => {
    const date = new Date(dateString);
    return {
      date: date.toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' }),
      time: date.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' })
    };
  };

  if (isLoading) {
    return <div className="min-h-screen flex items-center justify-center bg-gray-50 text-gray-500">Loading schedule...</div>;
  }

  return (
    <div className="min-h-screen bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-4xl mx-auto space-y-8">
        
        {/* Navigation & Header */}
        <div>
          <button 
            onClick={() => router.push('/Movies')}
            className="text-indigo-600 hover:text-indigo-800 font-medium text-sm mb-4 inline-flex items-center"
          >
            ← Back to All Movies
          </button>
          
          {movie && (
            <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
              <h1 className="text-3xl font-bold text-gray-900">{movie.title}</h1>
              <div className="mt-2 flex flex-wrap gap-3 text-sm text-gray-600">
                <span className="bg-gray-100 px-2 py-1 rounded">{movie.genre}</span>
                <span className="bg-gray-100 px-2 py-1 rounded">{movie.language}</span>
                <span className="bg-gray-100 px-2 py-1 rounded">{movie.durationMinutes} mins</span>
              </div>
              <p className="mt-4 text-gray-600">{movie.description}</p>
            </div>
          )}
        </div>

        {error && (
          <div className="bg-red-50 text-red-500 p-4 rounded-md border border-red-200">
            {error}
          </div>
        )}

        {/* Shows Listing */}
        <div>
          <h2 className="text-xl font-bold text-gray-900 mb-4">Available Showtimes</h2>
          
          {shows.length === 0 ? (
            <div className="bg-white p-8 rounded-xl shadow-sm text-center border border-gray-100">
              <p className="text-gray-500 text-lg">No shows are currently scheduled for this movie.</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {shows.map((show) => {
                const { date, time } = formatDateTime(show.showTime);
                
                return (
                  <div key={show.id} className="bg-white p-5 rounded-xl shadow-sm border border-gray-200 flex flex-col justify-between hover:border-indigo-300 transition-colors">
                    <div className="flex justify-between items-start mb-4">
                      <div>
                        <p className="text-lg font-bold text-gray-900">{time}</p>
                        <p className="text-sm text-gray-500">{date}</p>
                      </div>
                      <div className="text-right">
                        <span className="inline-block bg-green-50 text-green-700 font-bold px-3 py-1 rounded-full text-sm border border-green-200">
                          ${show.price.toFixed(2)}
                        </span>
                      </div>
                    </div>
                    
                    <div className="flex items-center text-sm text-gray-600 mb-6">
                      <span className="font-medium mr-2">Screen:</span> {show.screen.name} 
                    </div>

                    <button
                      onClick={() => router.push(`/Shows/${show.id}/Seats`)}
                      className="w-full bg-indigo-600 text-white py-2 px-4 rounded-md font-medium hover:bg-indigo-700 transition-colors"
                    >
                      View Seats & Book
                    </button>
                  </div>
                );
              })}
            </div>
          )}
        </div>

      </div>
    </div>
  );
}