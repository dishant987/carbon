import React, { useState } from 'react';
import { NavLink, Link } from 'react-router-dom';
import {
  Leaf,
  BarChart3,
  ListTodo,
  Lightbulb,
  LogOut,
  User,
  Sun,
  Moon,
  Menu,
  X,
  ChevronLeft,
  ChevronRight,
  MessageSquare,
} from 'lucide-react';
import { cn } from '../lib/utils';
import { useAuth } from '../context/AuthContext';
import { useTheme } from '../context/ThemeContext';

const navItems = [
  { to: '/dashboard', label: 'Dashboard', icon: BarChart3 },
  { to: '/activities', label: 'Activities', icon: ListTodo },
  { to: '/tips', label: 'Tips', icon: Lightbulb },
  { to: '/chat', label: 'EcoBot Chat', icon: MessageSquare },
] as const;

interface LayoutProps {
  children: React.ReactNode;
}

export function Layout({ children }: LayoutProps) {
  const { user, isAuthenticated, logout } = useAuth();
  const { theme, toggleTheme } = useTheme();
  // Sidebar collapsible state for desktop
  const [isCollapsed, setIsCollapsed] = useState(false);
  // Mobile drawer state
  const [isMobileOpen, setIsMobileOpen] = useState(false);

  // Helper to close mobile drawer
  const closeMobile = () => setIsMobileOpen(false);

  // 1. PUBLIC LAYOUT FOR UNAUTHENTICATED USERS
  if (!isAuthenticated) {
    return (
      <div className="min-h-screen bg-background flex flex-col transition-colors duration-300">
        <header
          role="banner"
          className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60"
        >
          <div className="container flex h-16 items-center justify-between px-4 sm:px-6">
            <Link
              to="/"
              className="flex items-center gap-2 mr-6 no-underline text-foreground hover:opacity-95 transition"
              aria-label="CarbonTracker home"
            >
              <div className="rounded-lg bg-green-500/10 p-1.5">
                <Leaf className="h-6 w-6 text-green-600 dark:text-green-400" aria-hidden="true" />
              </div>
              <span className="font-extrabold text-xl tracking-tight bg-gradient-to-r from-green-600 to-emerald-500 bg-clip-text text-transparent">
                CarbonTracker
              </span>
            </Link>

            <div className="flex items-center gap-3">
              {/* Theme Toggle */}
              <button
                onClick={toggleTheme}
                className="p-2 rounded-lg border border-border bg-card text-muted-foreground hover:text-foreground transition-all hover:bg-accent/40"
                aria-label="Toggle dark/light mode"
              >
                {theme === 'dark' ? (
                  <Sun className="h-4.5 w-4.5 text-yellow-500" />
                ) : (
                  <Moon className="h-4.5 w-4.5 text-blue-600" />
                )}
              </button>

              <NavLink
                to="/login"
                className={({ isActive }) =>
                  cn(
                    'text-sm font-medium px-3.5 py-2 rounded-lg transition-colors',
                    isActive ? 'text-primary' : 'text-muted-foreground hover:text-foreground'
                  )
                }
              >
                Sign In
              </NavLink>
              <NavLink
                to="/register"
                className="text-sm font-semibold text-white bg-primary px-4 py-2 rounded-lg hover:bg-primary/95 shadow-md shadow-primary/10 transition-all"
              >
                Register
              </NavLink>
            </div>
          </div>
        </header>

        <main id="main-content" className="flex-1 container py-8 px-4 sm:px-6" role="main">
          {children}
        </main>

        <footer className="border-t py-6 text-center text-xs text-muted-foreground bg-secondary/35">
          <p>© {new Date().getFullYear()} CarbonTracker Platform. All rights reserved.</p>
        </footer>
      </div>
    );
  }

  // 2. DASHBOARD LAYOUT WITH SIDEBAR FOR AUTHENTICATED USERS
  return (
    <div className="min-h-screen bg-background flex transition-colors duration-300 relative">
      {/* Mobile Top Bar */}
      <div className="md:hidden fixed top-0 left-0 right-0 h-16 border-b bg-card/90 backdrop-blur z-40 flex items-center justify-between px-4">
        <button
          onClick={() => setIsMobileOpen(true)}
          className="p-2 rounded-lg text-muted-foreground hover:text-foreground hover:bg-accent/50 transition"
          aria-label="Open sidebar menu"
        >
          <Menu className="h-6 w-6" />
        </button>

        <Link to="/" className="flex items-center gap-1.5">
          <Leaf className="h-5 w-5 text-green-600 dark:text-green-400" />
          <span className="font-bold text-lg bg-gradient-to-r from-green-600 to-emerald-500 bg-clip-text text-transparent">
            CarbonTracker
          </span>
        </Link>

        <button
          onClick={toggleTheme}
          className="p-2 rounded-lg text-muted-foreground hover:text-foreground hover:bg-accent/50 transition"
          aria-label="Toggle theme"
        >
          {theme === 'dark' ? (
            <Sun className="h-5 w-5 text-yellow-500" />
          ) : (
            <Moon className="h-5 w-5 text-blue-600" />
          )}
        </button>
      </div>

      {/* Backdrop for Mobile Sidebar */}
      {isMobileOpen && (
        <div
          onClick={closeMobile}
          className="md:hidden fixed inset-0 bg-black/40 backdrop-blur-xs z-45 transition-opacity duration-300"
        />
      )}

      {/* Sidebar (Drawer on mobile, stationary on desktop) */}
      <aside
        className={cn(
          'fixed inset-y-0 left-0 bg-card border-r z-50 flex flex-col justify-between transition-all duration-300 ease-in-out',
          // Desktop behavior
          isCollapsed ? 'md:w-20' : 'md:w-64',
          // Mobile behavior
          isMobileOpen ? 'translate-x-0 w-64' : '-translate-x-full md:translate-x-0'
        )}
      >
        {/* Top Header Section */}
        <div className="flex flex-col gap-6 pt-6 px-4">
          <div className="flex items-center justify-between">
            <Link to="/dashboard" onClick={closeMobile} className="flex items-center gap-2 overflow-hidden">
              <div className="rounded-lg bg-green-500/10 p-2 shrink-0">
                <Leaf className="h-5 w-5 text-green-600 dark:text-green-400" />
              </div>
              {(!isCollapsed || isMobileOpen) && (
                <span className="font-extrabold text-lg tracking-tight bg-gradient-to-r from-green-600 to-emerald-500 bg-clip-text text-transparent truncate animate-in fade-in duration-300">
                  CarbonTracker
                </span>
              )}
            </Link>

            {/* Mobile close button / Desktop collapse button */}
            <div className="flex items-center">
              <button
                onClick={closeMobile}
                className="md:hidden p-1.5 rounded-lg hover:bg-accent text-muted-foreground hover:text-foreground"
                aria-label="Close sidebar menu"
              >
                <X className="h-5 w-5" />
              </button>

              <button
                onClick={() => setIsCollapsed(!isCollapsed)}
                className="hidden md:flex p-1.5 rounded-lg hover:bg-accent text-muted-foreground hover:text-foreground"
                aria-label={isCollapsed ? 'Expand sidebar' : 'Collapse sidebar'}
              >
                {isCollapsed ? <ChevronRight className="h-4 w-4" /> : <ChevronLeft className="h-4 w-4" />}
              </button>
            </div>
          </div>

          {/* User profile widget */}
          <div
            className={cn(
              'flex items-center gap-3 p-2.5 rounded-xl border border-border/40 bg-secondary/40 overflow-hidden',
              isCollapsed && 'md:justify-center md:px-0 md:w-11 md:mx-auto'
            )}
          >
            <div className="h-8 w-8 rounded-full bg-primary/10 text-primary flex items-center justify-center font-bold text-sm shrink-0">
              {user?.name ? user.name.charAt(0).toUpperCase() : <User className="h-4 w-4" />}
            </div>
            {(!isCollapsed || isMobileOpen) && (
              <div className="min-w-0 flex-1 animate-in fade-in duration-300">
                <p className="text-xs font-semibold text-foreground truncate">{user?.name || 'User'}</p>
                <p className="text-[10px] text-muted-foreground truncate">{user?.email}</p>
              </div>
            )}
          </div>

          {/* Navigation Links */}
          <nav className="flex flex-col gap-1.5 mt-2" aria-label="Sidebar navigation">
            {navItems.map((item) => (
              <NavLink
                key={item.to}
                to={item.to}
                onClick={closeMobile}
                className={({ isActive }) =>
                  cn(
                    'flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-all group relative',
                    isActive
                      ? 'bg-primary text-primary-foreground shadow-md shadow-primary/15'
                      : 'text-muted-foreground hover:text-foreground hover:bg-accent/60',
                    isCollapsed && 'md:justify-center md:px-0'
                  )
                }
              >
                {({ isActive }) => (
                  <>
                    <item.icon className="h-5 w-5 shrink-0" aria-hidden="true" />
                    {!isCollapsed || isMobileOpen ? (
                      <span className="truncate">{item.label}</span>
                    ) : (
                      // Tooltip for collapsed desktop state
                      <span className="absolute left-full ml-4 px-2.5 py-1 rounded bg-popover border text-popover-foreground text-xs shadow-md opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none whitespace-nowrap z-50">
                        {item.label}
                      </span>
                    )}
                    {/* Active line indicator on left */}
                    {isActive && (
                      <span className="absolute left-0 top-1/4 bottom-1/4 w-1 bg-primary-foreground rounded-r" />
                    )}
                  </>
                )}
              </NavLink>
            ))}
          </nav>
        </div>

        {/* Footer controls section */}
        <div className="flex flex-col gap-2 p-4 border-t">
          {/* Light/Dark mode switcher */}
          <button
            onClick={toggleTheme}
            className={cn(
              'flex items-center gap-3 w-full px-3 py-2.5 text-sm font-medium text-muted-foreground hover:text-foreground rounded-lg hover:bg-accent/50 transition-all',
              isCollapsed && 'md:justify-center md:px-0'
            )}
            aria-label="Toggle theme"
          >
            {theme === 'dark' ? (
              <>
                <Sun className="h-5 w-5 text-yellow-500 shrink-0" />
                {(!isCollapsed || isMobileOpen) && <span>Light Mode</span>}
              </>
            ) : (
              <>
                <Moon className="h-5 w-5 text-blue-600 shrink-0" />
                {(!isCollapsed || isMobileOpen) && <span>Dark Mode</span>}
              </>
            )}
          </button>

          {/* Logout button */}
          <button
            onClick={logout}
            className={cn(
              'flex items-center gap-3 w-full px-3 py-2.5 text-sm font-medium text-muted-foreground hover:text-destructive rounded-lg hover:bg-destructive/10 transition-colors',
              isCollapsed && 'md:justify-center md:px-0'
            )}
            aria-label="Log out of account"
          >
            <LogOut className="h-5 w-5 text-muted-foreground group-hover:text-destructive shrink-0" />
            {(!isCollapsed || isMobileOpen) && <span>Log Out</span>}
          </button>
        </div>
      </aside>

      {/* Main Content Area */}
      <div
        className={cn(
          'flex-1 flex flex-col min-w-0 transition-all duration-300 ease-in-out',
          // Padding top for mobile bar, and margin left for desktop sidebar
          'pt-16 md:pt-0',
          isCollapsed ? 'md:ml-20' : 'md:ml-64'
        )}
      >
        <main
          id="main-content"
          className="flex-1 p-4 sm:p-6 md:p-8 max-w-[1400px] w-full mx-auto"
          role="main"
        >
          {children}
        </main>
      </div>
    </div>
  );
}
