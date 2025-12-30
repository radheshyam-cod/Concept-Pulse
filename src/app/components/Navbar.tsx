import { Link, useLocation } from 'react-router-dom';
import { Button } from './ui/button';
import { LogOut, Home, Upload, Calendar, TrendingUp, Settings } from 'lucide-react';

interface NavbarProps {
  user: any;
  onLogout: () => void;
  currentPage?: string;
}

export function Navbar({ user, onLogout, currentPage }: NavbarProps) {
  const location = useLocation();

  const isActive = (path: string) => {
    return location.pathname === path;
  };

  return (
    <nav className="sticky top-0 z-50 w-full border-b border-border/50 bg-background/80 backdrop-blur-md">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          <div className="flex items-center gap-8">
            <Link to="/dashboard" className="flex items-center gap-2 group">
              <div className="bg-primary/10 p-1.5 rounded-lg">
                <TrendingUp className="h-5 w-5 text-primary" />
              </div>
              <span className="text-xl font-bold tracking-tight text-foreground" style={{ fontFamily: 'Playfair Display, serif' }}>ConceptPulse</span>
            </Link>

            <div className="hidden md:flex items-center gap-1">
              {[
                { path: '/dashboard', label: 'Dashboard', icon: Home },
                { path: '/upload', label: 'Upload', icon: Upload },
                { path: '/revision', label: 'Revision', icon: Calendar },
                { path: '/progress', label: 'Progress', icon: TrendingUp },
              ].map((item) => (
                <Link to={item.path} key={item.path}>
                  <Button
                    variant="ghost"
                    size="sm"
                    className={`gap-2 transition-all duration-300 ${isActive(item.path)
                      ? 'bg-primary/10 text-primary hover:bg-primary/20'
                      : 'text-muted-foreground hover:text-foreground hover:bg-white/50 dark:hover:bg-white/10'}`}
                  >
                    <item.icon className={`h-4 w-4 ${isActive(item.path) ? 'text-primary' : ''}`} />
                    {item.label}
                  </Button>
                </Link>
              ))}
              <Link to="/kiro">
                <Button
                  variant="ghost"
                  size="sm"
                  className={`gap-2 transition-all duration-300 relative ${isActive('/kiro') || currentPage === 'kiro'
                    ? 'bg-gradient-to-r from-blue-500/10 to-purple-500/10 text-blue-600 hover:from-blue-500/20 hover:to-purple-500/20 border border-blue-200/50'
                    : 'text-muted-foreground hover:text-foreground hover:bg-white/50 dark:hover:bg-white/10'}`}
                >
                  <Settings className={`h-4 w-4 ${isActive('/kiro') ? 'text-blue-600' : ''}`} />
                  Kiro IDE
                  {(isActive('/kiro') || currentPage === 'kiro') && (
                    <div className="absolute -top-1 -right-1 w-2 h-2 bg-blue-500 rounded-full animate-pulse"></div>
                  )}
                </Button>
              </Link>
            </div>
          </div>

          <div className="flex items-center gap-4">
            <div className="text-sm text-right hidden sm:block">
              <p className="font-medium text-foreground">{user?.name || 'User'}</p>
              <p className="text-muted-foreground text-xs">
                Class {user?.class || 'N/A'} {user?.exam_type !== 'None' && `• ${user?.exam_type}`}
              </p>
            </div>
            <Button variant="outline" size="sm" onClick={onLogout} className="gap-2 bg-transparent border-primary/20 hover:bg-red-50 hover:text-red-600 hover:border-red-200 dark:hover:bg-red-950/30 transition-all">
              <LogOut className="h-4 w-4" />
              Logout
            </Button>
          </div>
        </div>
      </div>
    </nav>
  );
}
