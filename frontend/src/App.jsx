import React, { useState, Suspense, lazy, useEffect } from 'react';
import { Routes, Route } from 'react-router-dom';
import routes, { criticalRoutes } from './routes/config';
import NotFound from './components/NotFound';
import LoadingSpinner from './components/LoadingSpinner';
import BottomNav from './components/BottomNav';
import { useAudio } from './context/AudioContext';
import MiniPlayer from './components/MiniPlayer';
import Header from './components/Header';
import ErrorBoundary from './components/ErrorBoundary';
import ErrorFallback from './components/ErrorFallback';
import { setupAutoRefresh } from './utils/refreshUtils';

const App = () => {
  const { currentTrack } = useAudio();
  const [isError, setIsError] = useState(false);

  const handleRetry = () => {
    setIsError(false);
    window.location.reload();
  };

  // Preload critical routes
  useEffect(() => {
    criticalRoutes.forEach(route => {
      const component = routes.find(r => r.path === route)?.component;
      try {
        component?.preload?.();
      } catch (error) {
        console.error('Error preloading component:', error);
      }
    });
  }, []);

  useEffect(() => {
    const cleanup = setupAutoRefresh();
    return () => cleanup();
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
                    {routes.map(({ path, component: Component }) => (
                      <Route key={path} path={path} element={<Component />} />
                    ))}
                    <Route path="*" element={<NotFound />} />
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
