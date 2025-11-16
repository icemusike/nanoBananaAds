import { useState, useRef, useEffect } from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import { Sparkles, Library, Settings, Sun, Moon, Wand2, BookOpen, Lightbulb, Building2, Users, ChevronDown, User, LogOut, HelpCircle } from 'lucide-react';
import { useTheme } from '../context/ThemeContext';
import { useAuth } from '../context/AuthContext';

export default function Navigation() {
  const { theme, toggleTheme, mode } = useTheme();
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const [promptsOpen, setPromptsOpen] = useState(false);
  const [anglesOpen, setAnglesOpen] = useState(false);
  const [userMenuOpen, setUserMenuOpen] = useState(false);

  const promptsRef = useRef(null);
  const anglesRef = useRef(null);
  const userMenuRef = useRef(null);

  // Close dropdowns when clicking outside
  useEffect(() => {
    function handleClickOutside(event) {
      if (promptsRef.current && !promptsRef.current.contains(event.target)) {
        setPromptsOpen(false);
      }
      if (anglesRef.current && !anglesRef.current.contains(event.target)) {
        setAnglesOpen(false);
      }
      if (userMenuRef.current && !userMenuRef.current.contains(event.target)) {
        setUserMenuOpen(false);
      }
    }

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  // Get user initials for avatar
  const getUserInitials = () => {
    if (!user?.name) return 'U';
    const names = user.name.split(' ');
    if (names.length >= 2) {
      return names[0][0] + names[names.length - 1][0];
    }
    return user.name[0];
  };

  return (
    <nav className="bg-card border-b border-border sticky top-0 z-50 shadow-sm">
      <div className="container mx-auto px-6">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <NavLink to="/app" className="flex items-center hover:opacity-80 transition-opacity">
            <img
              src={mode === 'light' ? '/images/adgeniusai_logo_dark.png' : '/images/adgeniusai_logo_light.png'}
              alt="AdGenius AI"
              className="h-8 w-auto"
            />
          </NavLink>

          {/* Navigation Links */}
          <div className="flex items-center gap-1">
            <NavLink
              to="/app"
              className={({ isActive }) =>
                `flex items-center gap-2 px-4 py-2 rounded-lg transition-all ${
                  isActive
                    ? 'bg-primary/10 text-primary border border-primary/20'
                    : 'text-muted-foreground hover:text-foreground hover:bg-muted'
                }`
              }
            >
              <Sparkles className="w-4 h-4" />
              <span className="font-medium">Create Ads</span>
            </NavLink>

            {/* Prompts Dropdown */}
            <div className="relative" ref={promptsRef}>
              <button
                onClick={() => {
                  setPromptsOpen(!promptsOpen);
                  setAnglesOpen(false);
                }}
                className="flex items-center gap-2 px-4 py-2 rounded-lg transition-all text-muted-foreground hover:text-foreground hover:bg-muted"
              >
                <Wand2 className="w-4 h-4" />
                <span className="font-medium">Prompts</span>
                <ChevronDown className={`w-4 h-4 transition-transform ${promptsOpen ? 'rotate-180' : ''}`} />
              </button>

              {promptsOpen && (
                <div className="absolute top-full mt-1 left-0 w-48 bg-card border border-border rounded-lg shadow-lg py-1 animate-in fade-in slide-in-from-top-2">
                  <NavLink
                    to="/creative-prompts"
                    onClick={() => setPromptsOpen(false)}
                    className={({ isActive }) =>
                      `flex items-center gap-3 px-4 py-2 transition-colors ${
                        isActive
                          ? 'bg-primary/10 text-primary'
                          : 'text-muted-foreground hover:text-foreground hover:bg-muted'
                      }`
                    }
                  >
                    <Wand2 className="w-4 h-4" />
                    <span className="font-medium">Create</span>
                  </NavLink>
                  <NavLink
                    to="/prompt-library"
                    onClick={() => setPromptsOpen(false)}
                    className={({ isActive }) =>
                      `flex items-center gap-3 px-4 py-2 transition-colors ${
                        isActive
                          ? 'bg-primary/10 text-primary'
                          : 'text-muted-foreground hover:text-foreground hover:bg-muted'
                      }`
                    }
                  >
                    <BookOpen className="w-4 h-4" />
                    <span className="font-medium">Library</span>
                  </NavLink>
                </div>
              )}
            </div>

            {/* Angles Dropdown */}
            <div className="relative" ref={anglesRef}>
              <button
                onClick={() => {
                  setAnglesOpen(!anglesOpen);
                  setPromptsOpen(false);
                }}
                className="flex items-center gap-2 px-4 py-2 rounded-lg transition-all text-muted-foreground hover:text-foreground hover:bg-muted"
              >
                <Lightbulb className="w-4 h-4" />
                <span className="font-medium">Angles</span>
                <ChevronDown className={`w-4 h-4 transition-transform ${anglesOpen ? 'rotate-180' : ''}`} />
              </button>

              {anglesOpen && (
                <div className="absolute top-full mt-1 left-0 w-48 bg-card border border-border rounded-lg shadow-lg py-1 animate-in fade-in slide-in-from-top-2">
                  <NavLink
                    to="/angles-generator"
                    onClick={() => setAnglesOpen(false)}
                    className={({ isActive }) =>
                      `flex items-center gap-3 px-4 py-2 transition-colors ${
                        isActive
                          ? 'bg-primary/10 text-primary'
                          : 'text-muted-foreground hover:text-foreground hover:bg-muted'
                      }`
                    }
                  >
                    <Lightbulb className="w-4 h-4" />
                    <span className="font-medium">Create</span>
                  </NavLink>
                  <NavLink
                    to="/angles-library"
                    onClick={() => setAnglesOpen(false)}
                    className={({ isActive }) =>
                      `flex items-center gap-3 px-4 py-2 transition-colors ${
                        isActive
                          ? 'bg-primary/10 text-primary'
                          : 'text-muted-foreground hover:text-foreground hover:bg-muted'
                      }`
                    }
                  >
                    <BookOpen className="w-4 h-4" />
                    <span className="font-medium">Library</span>
                  </NavLink>
                </div>
              )}
            </div>

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
              <Building2 className="w-4 h-4" />
              <span className="font-medium">Brands</span>
            </NavLink>

            <NavLink
              to="/agency"
              className={({ isActive }) =>
                `flex items-center gap-2 px-4 py-2 rounded-lg transition-all ${
                  isActive
                    ? 'bg-primary/10 text-primary border border-primary/20'
                    : 'text-muted-foreground hover:text-foreground hover:bg-muted'
                }`
              }
            >
              <Users className="w-4 h-4" />
              <span className="font-medium">Agency</span>
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
              <Library className="w-4 h-4" />
              <span className="font-medium">Ads</span>
            </NavLink>

            {/* Divider */}
            <div className="w-px h-8 bg-border mx-2"></div>

            {/* User Dropdown */}
            <div className="relative" ref={userMenuRef}>
              <button
                onClick={() => setUserMenuOpen(!userMenuOpen)}
                className="flex items-center gap-2 px-3 py-2 rounded-lg transition-all hover:bg-muted group"
              >
                <div className="w-8 h-8 rounded-full bg-gradient-to-br from-primary to-accent flex items-center justify-center text-primary-foreground font-semibold text-sm shadow-sm">
                  {getUserInitials()}
                </div>
                <span className="font-medium text-foreground hidden lg:block">{user?.name || 'User'}</span>
                <ChevronDown className={`w-4 h-4 text-muted-foreground transition-transform ${userMenuOpen ? 'rotate-180' : ''}`} />
              </button>

              {userMenuOpen && (
                <div className="absolute top-full mt-2 right-0 w-56 bg-card border border-border rounded-lg shadow-lg py-2 animate-in fade-in slide-in-from-top-2">
                  {/* User Info */}
                  <div className="px-4 py-3 border-b border-border">
                    <p className="font-semibold text-foreground">{user?.name || 'User'}</p>
                    <p className="text-sm text-muted-foreground truncate">{user?.email || 'user@example.com'}</p>
                  </div>

                  {/* Menu Items */}
                  <div className="py-1">
                    <button
                      onClick={() => {
                        setUserMenuOpen(false);
                        navigate('/settings');
                      }}
                      className="flex items-center gap-3 w-full px-4 py-2 text-left transition-colors text-muted-foreground hover:text-foreground hover:bg-muted"
                    >
                      <Settings className="w-4 h-4" />
                      <span className="font-medium">Settings</span>
                    </button>

                    <button
                      onClick={() => {
                        setUserMenuOpen(false);
                        navigate('/help');
                      }}
                      className="flex items-center gap-3 w-full px-4 py-2 text-left transition-colors text-muted-foreground hover:text-foreground hover:bg-muted"
                    >
                      <HelpCircle className="w-4 h-4" />
                      <span className="font-medium">Help</span>
                    </button>

                    <button
                      onClick={() => {
                        toggleTheme();
                      }}
                      className="flex items-center gap-3 w-full px-4 py-2 text-left transition-colors text-muted-foreground hover:text-foreground hover:bg-muted"
                    >
                      {theme === 'dark' ? (
                        <>
                          <Sun className="w-4 h-4" />
                          <span className="font-medium">Light Mode</span>
                        </>
                      ) : (
                        <>
                          <Moon className="w-4 h-4" />
                          <span className="font-medium">Dark Mode</span>
                        </>
                      )}
                    </button>
                  </div>

                  {/* Logout */}
                  <div className="border-t border-border pt-1">
                    <button
                      onClick={handleLogout}
                      className="flex items-center gap-3 w-full px-4 py-2 text-left transition-colors text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-950/30"
                    >
                      <LogOut className="w-4 h-4" />
                      <span className="font-medium">Log Out</span>
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </nav>
  );
}
