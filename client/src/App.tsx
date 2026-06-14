import React, { Suspense } from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { Layout } from './components/Layout';
import { Leaf } from 'lucide-react';
import { AuthProvider, useAuth } from './context/AuthContext';
import { ProtectedRoute } from './components/ProtectedRoute';

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
const Login = React.lazy(() => import('./pages/Login').then((module) => ({ default: module.Login })));
const Register = React.lazy(() =>
  import('./pages/Register').then((module) => ({ default: module.Register }))
);

/** Fallback shown while route chunks load */
function PageLoader() {
  return (
    <div className="flex flex-col items-center justify-center py-20 min-h-[50vh]">
      <Leaf className="h-8 w-8 text-green-500 animate-pulse" />
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
          <Suspense fallback={<PageLoader />}>
            <Routes>
              {/* Home route handles landing vs dashboard redirect */}
              <Route path="/" element={<Home />} />

              {/* Public auth routes */}
              <Route path="/login" element={<Login />} />
              <Route path="/register" element={<Register />} />

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
              {/* Fallback to home */}
              <Route path="*" element={<Navigate to="/" replace />} />
            </Routes>
          </Suspense>
        </Layout>
      </AuthProvider>
    </BrowserRouter>
  );
}
