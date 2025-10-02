import { Sparkles } from 'lucide-react';

export default function Header() {
  return (
    <header className="border-b border-dark-800 bg-dark-900/50 backdrop-blur-sm sticky top-0 z-50">
      <div className="container mx-auto px-4 py-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="text-4xl">🍌</div>
            <div>
              <h1 className="text-2xl font-bold bg-gradient-to-r from-primary-400 to-accent-purple bg-clip-text text-transparent">
                Nano Banana
              </h1>
              <p className="text-xs text-gray-500">Ad Creator</p>
            </div>
          </div>

          <div className="hidden md:flex items-center gap-6 text-sm text-gray-400">
            <div className="flex items-center gap-2">
              <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
              <span>AI Ready</span>
            </div>
          </div>
        </div>
      </div>
    </header>
  );
}
