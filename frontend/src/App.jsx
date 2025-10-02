import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { ThemeProvider } from './context/ThemeContext';
import Navigation from './components/Navigation';
import CreateAds from './pages/CreateAds';
import AdsLibrary from './pages/AdsLibrary';
import CreativePrompts from './pages/CreativePrompts';
import PromptLibrary from './pages/PromptLibrary';
import AnglesGenerator from './pages/AnglesGenerator';
import AnglesLibrary from './pages/AnglesLibrary';
import BrandsManager from './pages/BrandsManager';
import Settings from './pages/Settings';

function App() {
  return (
    <ThemeProvider>
      <Router>
        <div className="min-h-screen bg-background text-foreground">
          <Navigation />
          <Routes>
            <Route path="/" element={<CreateAds />} />
            <Route path="/creative-prompts" element={<CreativePrompts />} />
            <Route path="/prompt-library" element={<PromptLibrary />} />
            <Route path="/angles-generator" element={<AnglesGenerator />} />
            <Route path="/angles-library" element={<AnglesLibrary />} />
            <Route path="/brands" element={<BrandsManager />} />
            <Route path="/ads-library" element={<AdsLibrary />} />
            <Route path="/library" element={<AdsLibrary />} />
            <Route path="/settings" element={<Settings />} />
          </Routes>

          {/* Footer */}
          <footer className="border-t border-border mt-16 py-8">
            <div className="container mx-auto px-4 text-center text-muted-foreground text-sm">
              <p>🍌 Nano Banana Ad Creator • Powered by Google Gemini & OpenAI</p>
              <p className="mt-2">Built with React, Vite, Tailwind CSS, Node.js & Express</p>
            </div>
          </footer>
        </div>
      </Router>
    </ThemeProvider>
  );
}

export default App;
