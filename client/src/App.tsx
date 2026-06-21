import React, { Suspense, Component } from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { Layout } from './components/Layout';
import { Leaf, AlertTriangle } from 'lucide-react';
import { AuthProvider, useAuth } from './context/AuthContext';
import { ProtectedRoute } from './components/ProtectedRoute';
import { UnprotectedRoute } from './components/UnprotectedRoute';
import { Button } from './components/ui/button';

class ErrorBoundary extends Component<
  { children: React.ReactNode },
  { hasError: boolean; error: Error | null }
> {
  constructor(props: { children: React.ReactNode }) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error: Error) {
    return { hasError: true, error };
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="flex flex-col items-center justify-center min-h-screen p-8 text-center">
          <AlertTriangle className="h-12 w-12 text-destructive mb-4" />
          <h1 className="text-2xl font-bold mb-2">Something went wrong</h1>
          <p className="text-muted-foreground mb-6 max-w-md">
            {this.state.error?.message || 'An unexpected error occurred.'}
          </p>
          <Button onClick={() => window.location.reload()}>Reload Page</Button>
        </div>
      );
    }
    return this.props.children;
  }
}

// Lazy-loaded page components — split into separate chunks by Vite
const Landing = React.lazy(() => import('./pages/Landing').then((module) => ({ default: module.Landing })));
const Dashboard = React.lazy(() =>
  import('./pages/Dashboard').then((module) => ({ default: module.Dashboard }))
);
const Activities = React.lazy(() =>
  import('./pages/Activities').then((module) => ({ default: module.Activities }))
);
const Tips = React.lazy(() => import('./pages/Tips').then((module) => ({ default: module.Tips })));
const Chat = React.lazy(() => import('./pages/Chat').then((module) => ({ default: module.Chat })));
const Goals = React.lazy(() => import('./pages/Goals').then((module) => ({ default: module.Goals })));
const Offsets = React.lazy(() => import('./pages/Offsets').then((module) => ({ default: module.Offsets })));
const EcoTools = React.lazy(() =>
  import('./pages/EcoTools').then((module) => ({ default: module.EcoTools }))
);
const Challenges = React.lazy(() =>
  import('./pages/Challenges').then((module) => ({ default: module.Challenges }))
);
const Login = React.lazy(() => import('./pages/Login').then((module) => ({ default: module.Login })));
const Register = React.lazy(() =>
  import('./pages/Register').then((module) => ({ default: module.Register }))
);
const Profile = React.lazy(() => import('./pages/Profile').then((module) => ({ default: module.Profile })));

/** Fallback shown while route chunks load */
function PageLoader() {
  return (
    <div
      className="flex flex-col items-center justify-center py-20 min-h-[50vh]"
      role="status"
      aria-live="polite"
    >
      <Leaf className="h-8 w-8 text-green-500 animate-pulse" aria-hidden="true" />
      <span className="ml-2 text-muted-foreground text-sm font-medium mt-2">Loading Page...</span>
    </div>
  );
}

function Home() {
  const { isAuthenticated } = useAuth();
  if (isAuthenticated) {
    return <Navigate to="/dashboard" replace />;
  }
  return <Landing />;
}

export default function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <Layout>
          <ErrorBoundary>
            <Suspense fallback={<PageLoader />}>
              <Routes>
                {/* Home route handles landing vs dashboard redirect */}
                <Route path="/" element={<Home />} />

                {/* Public auth routes */}
                <Route
                  path="/login"
                  element={
                    <UnprotectedRoute>
                      <Login />
                    </UnprotectedRoute>
                  }
                />
                <Route
                  path="/register"
                  element={
                    <UnprotectedRoute>
                      <Register />
                    </UnprotectedRoute>
                  }
                />

                {/* Secure dashboard/tracker routes */}
                <Route
                  path="/dashboard"
                  element={
                    <ProtectedRoute>
                      <Dashboard />
                    </ProtectedRoute>
                  }
                />
                <Route
                  path="/activities"
                  element={
                    <ProtectedRoute>
                      <Activities />
                    </ProtectedRoute>
                  }
                />
                <Route
                  path="/tips"
                  element={
                    <ProtectedRoute>
                      <Tips />
                    </ProtectedRoute>
                  }
                />
                <Route
                  path="/chat"
                  element={
                    <ProtectedRoute>
                      <Chat />
                    </ProtectedRoute>
                  }
                />
                <Route
                  path="/goals"
                  element={
                    <ProtectedRoute>
                      <Goals />
                    </ProtectedRoute>
                  }
                />
                <Route
                  path="/offsets"
                  element={
                    <ProtectedRoute>
                      <Offsets />
                    </ProtectedRoute>
                  }
                />
                <Route
                  path="/tools"
                  element={
                    <ProtectedRoute>
                      <EcoTools />
                    </ProtectedRoute>
                  }
                />
                <Route
                  path="/challenges"
                  element={
                    <ProtectedRoute>
                      <Challenges />
                    </ProtectedRoute>
                  }
                />
                <Route
                  path="/profile"
                  element={
                    <ProtectedRoute>
                      <Profile />
                    </ProtectedRoute>
                  }
                />
                {/* Fallback to home */}
                <Route path="*" element={<Navigate to="/" replace />} />
              </Routes>
            </Suspense>
          </ErrorBoundary>
        </Layout>
      </AuthProvider>
    </BrowserRouter>
  );
}
