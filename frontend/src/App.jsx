import React from 'react';
import { Routes, Route } from 'react-router-dom';
import Home from './pages/Home';
import SongsList from './pages/SongsList';
import SongView from './pages/SongView';
import BottomNav from './components/BottomNav';
import { useAudio } from './context/AudioContext';
import MiniPlayer from './components/MiniPlayer';
import Header from './components/Header';
import Search from './pages/Search';

const App = () => {
  const { currentTrack } = useAudio();

  return (
    <div className="min-h-[100dvh] bg-[#121212] flex flex-col">
      <div className="flex flex-1 h-full">
        <main className="flex-1 ml-0 md:ml-64 min-h-full transition-all duration-300">
          <Header />
          <div className="mt-16 h-[calc(100dvh-4rem)] overflow-y-auto pb-[calc(6rem+2rem)] md:pb-[calc(6rem+1rem)]">
            <Routes>
              <Route path="/" element={<Home />} />
              <Route path="/search" element={<Search />} />
              <Route path="/songs" element={<SongsList />} />
              <Route path="/songs/:songId" element={<SongView />} />
              <Route path="*" element={
                <div className="text-white text-center p-8">
                  <h1 className="text-4xl font-bold">404 - Page Not Found</h1>
                </div>
              } />
            </Routes>
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
