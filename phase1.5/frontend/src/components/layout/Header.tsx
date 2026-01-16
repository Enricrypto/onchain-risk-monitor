import { Link, useLocation } from 'react-router-dom';
import { LayoutDashboard, Bell, Settings } from 'lucide-react';

const navigation = [
  { name: 'Dashboard', href: '/', icon: LayoutDashboard },
  { name: 'Alerts', href: '/alerts', icon: Bell },
];

// 3D Prism Logo Component - inspired by Spark design
function Logo({ size = 40 }: { size?: number }) {
  return (
    <div className="relative" style={{ width: size, height: size }}>
      {/* Glow effect */}
      <div
        className="absolute inset-0 rounded-xl opacity-60 blur-md"
        style={{
          background: 'linear-gradient(135deg, rgba(139, 92, 246, 0.5), rgba(245, 158, 11, 0.5))',
        }}
      />
      {/* Logo SVG */}
      <svg
        viewBox="0 0 100 100"
        className="relative w-full h-full"
        style={{ filter: 'drop-shadow(0 2px 4px rgba(0,0,0,0.3))' }}
      >
        <defs>
          <linearGradient id="headerGradPurple" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#8b5cf6"/>
            <stop offset="100%" stopColor="#6d28d9"/>
          </linearGradient>
          <linearGradient id="headerGradOrange" x1="0%" y1="100%" x2="100%" y2="0%">
            <stop offset="0%" stopColor="#d97706"/>
            <stop offset="100%" stopColor="#f59e0b"/>
          </linearGradient>
          <linearGradient id="headerGradTeal" x1="50%" y1="0%" x2="50%" y2="100%">
            <stop offset="0%" stopColor="#14b8a6"/>
            <stop offset="100%" stopColor="#0d9488"/>
          </linearGradient>
        </defs>
        {/* Background */}
        <rect width="100" height="100" rx="20" fill="#121212"/>
        {/* 3D Prism shape - back face */}
        <polygon points="50,18 72,42 50,82 28,42" fill="url(#headerGradPurple)" opacity="0.95"/>
        {/* Right face - orange */}
        <polygon points="50,18 72,42 50,82" fill="url(#headerGradOrange)" opacity="0.75"/>
        {/* Left face - teal */}
        <polygon points="50,18 28,42 50,82" fill="url(#headerGradTeal)" opacity="0.55"/>
        {/* Edge highlights */}
        <line x1="50" y1="18" x2="50" y2="82" stroke="rgba(255,255,255,0.25)" strokeWidth="1.5"/>
        <line x1="50" y1="18" x2="72" y2="42" stroke="rgba(255,255,255,0.15)" strokeWidth="1"/>
        <line x1="50" y1="18" x2="28" y2="42" stroke="rgba(255,255,255,0.35)" strokeWidth="1"/>
        {/* Bottom edges */}
        <line x1="28" y1="42" x2="50" y2="82" stroke="rgba(255,255,255,0.1)" strokeWidth="0.5"/>
        <line x1="72" y1="42" x2="50" y2="82" stroke="rgba(255,255,255,0.1)" strokeWidth="0.5"/>
      </svg>
    </div>
  );
}

export function Header() {
  const location = useLocation();

  return (
    <header className="sticky top-0 z-40 bg-bg-primary/80 backdrop-blur-lg border-b border-border-subtle">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo and title */}
          <Link to="/" className="flex items-center gap-3 group">
            <Logo size={40} />
            <div className="hidden sm:block">
              <h1 className="text-lg font-semibold text-text-primary tracking-tight">
                Risk Console
              </h1>
              <p className="text-xs text-text-muted -mt-0.5">
                Onchain Monitor
              </p>
            </div>
            {/* Mobile: just show short title */}
            <span className="sm:hidden text-base font-semibold text-text-primary">
              Risk
            </span>
          </Link>

          {/* Navigation */}
          <nav className="flex items-center gap-1">
            {navigation.map((item) => {
              const isActive = location.pathname === item.href;
              const Icon = item.icon;

              return (
                <Link
                  key={item.name}
                  to={item.href}
                  className={`
                    flex items-center gap-2 px-3 sm:px-4 py-2 rounded-lg text-sm font-medium
                    transition-all duration-200
                    ${
                      isActive
                        ? 'bg-white/10 text-text-primary'
                        : 'text-text-secondary hover:text-text-primary hover:bg-white/5'
                    }
                  `}
                >
                  <Icon className="w-4 h-4" />
                  <span className="hidden sm:inline">{item.name}</span>
                </Link>
              );
            })}

            {/* Settings button */}
            <button
              className="p-2 rounded-lg text-text-muted hover:text-text-secondary hover:bg-white/5 transition-colors ml-1 sm:ml-2"
              title="Settings"
            >
              <Settings className="w-5 h-5" />
            </button>
          </nav>
        </div>
      </div>
    </header>
  );
}
