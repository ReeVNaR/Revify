import { BrowserRouter as Router, Routes, Route, Link } from 'react-router-dom';
import SongUploader from './components/SongUploader';
import Songs from './pages/Songs';
import './styles/variables.css';
import './styles/main.css';

export default function App() {
  return (
    <Router>
      <div className="min-h-screen bg-[#191414]">
        <nav className="bg-[#282828] p-4">
          <div className="max-w-4xl mx-auto flex space-x-4">
            <Link 
              to="/upload" 
              className="text-white hover:text-[#1DB954] transition-colors"
            >
              Upload
            </Link>
            <Link 
              to="/songs" 
              className="text-white hover:text-[#1DB954] transition-colors"
            >
              Songs
            </Link>
          </div>
        </nav>
        
        <Routes>
          <Route path="/upload" element={<SongUploader />} />
          <Route path="/songs" element={<Songs />} />
          <Route path="/" element={<SongUploader />} />
        </Routes>
      </div>
    </Router>
  );
}
