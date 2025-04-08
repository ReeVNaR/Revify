import React, { useState, Suspense, lazy } from 'react';
import { Routes, Route } from 'react-router-dom';
import LoadingSpinner from './components/LoadingSpinner';
import BottomNav from './components/BottomNav';
import { useAudio } from './context/AudioContext';
import MiniPlayer from './components/MiniPlayer';
import Header from './components/Header';

// Lazy load components
const Home = lazy(() => import('./pages/Home'));
const Search = lazy(() => import('./pages/Search'));
const SongsList = lazy(() => import('./pages/SongsList'));
const SongView = lazy(() => import('./pages/SongView'));
const Library = lazy(() => import('./pages/Library'));
const Profile = lazy(() => import('./pages/Profile'));
const PlaylistView = lazy(() => import('./pages/PlaylistView'));

const App = () => {
  const { currentTrack } = useAudio();
  const [isError, setIsError] = useState(false);

  const handleRetry = () => {
    setIsError(false);
    window.location.reload();
  };

  return (
    <div className="min-h-[100dvh] bg-[#121212] flex flex-col">
      <div className="flex flex-1 h-full">
        <main className="flex-1 ml-0 md:ml-64 min-h-full transition-all duration-300">
          <Header />
          <div className="mt-16 h-[calc(100dvh-4rem)] overflow-y-auto pb-[calc(6rem+2rem)] md:pb-[calc(6rem+1rem)]">
            {isError ? (
              <div className="text-white text-center p-8 flex flex-col items-center">
                <h2 className="text-2xl font-bold mb-4">Connection Error</h2>
                <p className="mb-4">Unable to connect to the server. Please try again.</p>
                <button 
                  onClick={handleRetry}
                  className="bg-green-500 hover:bg-green-600 text-white px-6 py-2 rounded-full"
                >
                  Retry Connection
                </button>
              </div>
            ) : (
              <Suspense fallback={<LoadingSpinner />}>
                <Routes>
                  <Route path="/" element={<Home />} />
                  <Route path="/search" element={<Search />} />
                  <Route path="/songs" element={<SongsList />} />
                  <Route path="/songs/:songId" element={<SongView />} />
                  <Route path="/library" element={<Library />} />
                  <Route path="/profile" element={<Profile />} />
                  <Route path="/playlist/:playlistId" element={<PlaylistView />} />
                  <Route path="*" element={
                    <div className="text-white text-center p-8">
                      <h1 className="text-4xl font-bold">404 - Page Not Found</h1>
                    </div>
                  } />
                </Routes>
              </Suspense>
            )}
          </div>
        </main>
      </div>
      <div className="fixed bottom-0 left-0 right-0 z-50">
        {currentTrack && <MiniPlayer />}
        <BottomNav />
      </div>
    </div>
  );
};

export default App;
