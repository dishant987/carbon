import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen } from '@testing-library/react';
import { MemoryRouter, Routes, Route } from 'react-router-dom';
import { ProtectedRoute } from '../components/ProtectedRoute';
import { UnprotectedRoute } from '../components/UnprotectedRoute';
import { useAuth } from '../context/AuthContext';

// Mock the AuthContext hook
vi.mock('../context/AuthContext', () => ({
  useAuth: vi.fn(),
}));

describe('Route Guards', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('ProtectedRoute', () => {
    it('shows loading spinner when verifying session', () => {
      (useAuth as any).mockReturnValue({
        isAuthenticated: false,
        loading: true,
      });

      render(
        <MemoryRouter initialEntries={['/protected']}>
          <ProtectedRoute>
            <div data-testid="child">Protected Content</div>
          </ProtectedRoute>
        </MemoryRouter>
      );

      expect(screen.getByText('Verifying session...')).toBeInTheDocument();
      expect(screen.queryByTestId('child')).not.toBeInTheDocument();
    });

    it('redirects to /login when not authenticated', () => {
      (useAuth as any).mockReturnValue({
        isAuthenticated: false,
        loading: false,
      });

      render(
        <MemoryRouter initialEntries={['/protected']}>
          <Routes>
            <Route
              path="/protected"
              element={
                <ProtectedRoute>
                  <div data-testid="child">Protected Content</div>
                </ProtectedRoute>
              }
            />
            <Route path="/login" element={<div data-testid="login">Login Page</div>} />
          </Routes>
        </MemoryRouter>
      );

      expect(screen.getByTestId('login')).toBeInTheDocument();
      expect(screen.queryByTestId('child')).not.toBeInTheDocument();
    });

    it('renders child component when authenticated', () => {
      (useAuth as any).mockReturnValue({
        isAuthenticated: true,
        loading: false,
      });

      render(
        <MemoryRouter initialEntries={['/protected']}>
          <ProtectedRoute>
            <div data-testid="child">Protected Content</div>
          </ProtectedRoute>
        </MemoryRouter>
      );

      expect(screen.getByTestId('child')).toBeInTheDocument();
      expect(screen.queryByText('Verifying session...')).not.toBeInTheDocument();
    });
  });

  describe('UnprotectedRoute', () => {
    it('shows loading spinner when verifying session', () => {
      (useAuth as any).mockReturnValue({
        isAuthenticated: false,
        loading: true,
      });

      render(
        <MemoryRouter initialEntries={['/login']}>
          <UnprotectedRoute>
            <div data-testid="child">Login Form</div>
          </UnprotectedRoute>
        </MemoryRouter>
      );

      expect(screen.getByText('Verifying session...')).toBeInTheDocument();
    });

    it('redirects to /dashboard when already authenticated', () => {
      (useAuth as any).mockReturnValue({
        isAuthenticated: true,
        loading: false,
      });

      render(
        <MemoryRouter initialEntries={['/login']}>
          <Routes>
            <Route
              path="/login"
              element={
                <UnprotectedRoute>
                  <div data-testid="child">Login Form</div>
                </UnprotectedRoute>
              }
            />
            <Route path="/dashboard" element={<div data-testid="dashboard">Dashboard Page</div>} />
          </Routes>
        </MemoryRouter>
      );

      expect(screen.getByTestId('dashboard')).toBeInTheDocument();
      expect(screen.queryByTestId('child')).not.toBeInTheDocument();
    });

    it('renders child component when not authenticated', () => {
      (useAuth as any).mockReturnValue({
        isAuthenticated: false,
        loading: false,
      });

      render(
        <MemoryRouter initialEntries={['/login']}>
          <UnprotectedRoute>
            <div data-testid="child">Login Form</div>
          </UnprotectedRoute>
        </MemoryRouter>
      );

      expect(screen.getByTestId('child')).toBeInTheDocument();
    });
  });
});
