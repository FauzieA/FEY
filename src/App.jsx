import { Routes, Route } from 'react-router-dom';
import Navigation from './components/Navigation';
import Home from './pages/Home';
import Archive from './pages/Archive';
import Notes from './pages/Notes';
import Chapter from './pages/Chapter';
import Gallery from './pages/Gallery';
import Materials from './pages/Materials';

function App() {
  return (
    <div className="min-h-screen bg-porcelain selection:bg-ink selection:text-porcelain">
      <Navigation />
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/archive" element={<Archive />} />
        <Route path="/notes" element={<Notes />} />
        <Route path="/chapter/:id" element={<Chapter />} />
        <Route path="/gallery" element={<Gallery />} />
        <Route path="/materials" element={<Materials />} />
      </Routes>
    </div>
  );
}

export default App;