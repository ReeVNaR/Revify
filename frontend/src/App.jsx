import React, { useState, Suspense, lazy, useEffect } from 'react';
import { Routes, Route } from 'react-router-dom';
import LoadingSpinner from './components/LoadingSpinner';
import BottomNav from './components/BottomNav';
import { useAudio } from './context/AudioContext';
import MiniPlayer from './components/MiniPlayer';
import Header from './components/Header';
import ErrorBoundary from './components/ErrorBoundary';
import ErrorFallback from './components/ErrorFallback';

// Lazy load components with prefetch
const Home = lazy(() => import(/* webpackPrefetch: true */ './pages/Home'));
const Search = lazy(() => import(/* webpackPrefetch: true */ './pages/Search'));
const SongsList = lazy(() => import(/* webpackPrefetch: true */ './pages/SongsList'));
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

  // Preload critical routes
  useEffect(() => {
    const routes = [Home, Search, Library];
    routes.forEach(component => {
      try {
        component.preload?.();
      } catch (error) {
        console.error('Error preloading component:', error);
      }
    });
  }, []);

  return (
    <ErrorBoundary FallbackComponent={ErrorFallback}>
      <div className="min-h-[100dvh] bg-[#121212] flex flex-col">
        <div className="flex flex-1 h-full">
          <main className="flex-1 ml-0 md:ml-64 min-h-full transition-all duration-300">
            <Header />
            <div className="mt-16 h-[calc(100dvh-4rem)] overflow-y-auto pb-[calc(6rem+2rem)] md:pb-[calc(6rem+1rem)]">
              {isError ? (
                <ErrorFallback error={new Error('Connection Error')} resetErrorBoundary={handleRetry} />
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
    </ErrorBoundary>
  );
};

export default App;
