import { NavLink } from 'react-router-dom';
import { Sparkles, Library, Settings, Sun, Moon, Wand2, BookOpen, Lightbulb, Building2 } from 'lucide-react';
import { useTheme } from '../context/ThemeContext';

export default function Navigation() {
  const { theme, toggleTheme } = useTheme();

  return (
    <nav className="bg-card border-b border-border sticky top-0 z-50">
      <div className="container mx-auto px-4">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <div className="flex items-center gap-2">
            <span className="text-3xl">🍌</span>
            <h1 className="text-xl font-bold text-primary">
              Nano Banana
            </h1>
          </div>

          {/* Navigation Links */}
          <div className="flex items-center gap-1">
            <NavLink
              to="/"
              className={({ isActive }) =>
                `flex items-center gap-2 px-4 py-2 rounded-lg transition-all ${
                  isActive
                    ? 'bg-primary/10 text-primary border border-primary/20'
                    : 'text-muted-foreground hover:text-foreground hover:bg-muted'
                }`
              }
            >
              <Sparkles className="w-5 h-5" />
              <span className="font-medium">Create Ads</span>
            </NavLink>

            <NavLink
              to="/creative-prompts"
              className={({ isActive }) =>
                `flex items-center gap-2 px-4 py-2 rounded-lg transition-all ${
                  isActive
                    ? 'bg-primary/10 text-primary border border-primary/20'
                    : 'text-muted-foreground hover:text-foreground hover:bg-muted'
                }`
              }
            >
              <Wand2 className="w-5 h-5" />
              <span className="font-medium">Prompts</span>
            </NavLink>

            <NavLink
              to="/prompt-library"
              className={({ isActive }) =>
                `flex items-center gap-2 px-4 py-2 rounded-lg transition-all ${
                  isActive
                    ? 'bg-primary/10 text-primary border border-primary/20'
                    : 'text-muted-foreground hover:text-foreground hover:bg-muted'
                }`
              }
            >
              <BookOpen className="w-5 h-5" />
              <span className="font-medium">Prompts</span>
            </NavLink>

            <NavLink
              to="/angles-generator"
              className={({ isActive }) =>
                `flex items-center gap-2 px-4 py-2 rounded-lg transition-all ${
                  isActive
                    ? 'bg-primary/10 text-primary border border-primary/20'
                    : 'text-muted-foreground hover:text-foreground hover:bg-muted'
                }`
              }
            >
              <Lightbulb className="w-5 h-5" />
              <span className="font-medium">Angles</span>
            </NavLink>

            <NavLink
              to="/brands"
              className={({ isActive }) =>
                `flex items-center gap-2 px-4 py-2 rounded-lg transition-all ${
                  isActive
                    ? 'bg-primary/10 text-primary border border-primary/20'
                    : 'text-muted-foreground hover:text-foreground hover:bg-muted'
                }`
              }
            >
              <Building2 className="w-5 h-5" />
              <span className="font-medium">Brands</span>
            </NavLink>

            <NavLink
              to="/ads-library"
              className={({ isActive }) =>
                `flex items-center gap-2 px-4 py-2 rounded-lg transition-all ${
                  isActive
                    ? 'bg-primary/10 text-primary border border-primary/20'
                    : 'text-muted-foreground hover:text-foreground hover:bg-muted'
                }`
              }
            >
              <Library className="w-5 h-5" />
              <span className="font-medium">Ads</span>
            </NavLink>

            <NavLink
              to="/settings"
              className={({ isActive }) =>
                `flex items-center gap-2 px-4 py-2 rounded-lg transition-all ${
                  isActive
                    ? 'bg-primary/10 text-primary border border-primary/20'
                    : 'text-muted-foreground hover:text-foreground hover:bg-muted'
                }`
              }
            >
              <Settings className="w-5 h-5" />
              <span className="font-medium">Settings</span>
            </NavLink>

            {/* Theme Toggle */}
            <button
              onClick={toggleTheme}
              className="flex items-center gap-2 px-4 py-2 rounded-lg transition-all text-muted-foreground hover:text-foreground hover:bg-muted ml-2"
              aria-label="Toggle theme"
            >
              {theme === 'dark' ? (
                <Sun className="w-5 h-5" />
              ) : (
                <Moon className="w-5 h-5" />
              )}
            </button>
          </div>
        </div>
      </div>
    </nav>
  );
}
