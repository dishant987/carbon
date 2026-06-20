import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { Login } from '../pages/Login';
import { AuthContext } from '../context/AuthContext';
import { MemoryRouter } from 'react-router-dom';

const mockNavigate = vi.fn();
vi.mock('react-router-dom', async () => {
  const actual = await vi.importActual('react-router-dom');
  return {
    ...actual,
    useNavigate: () => mockNavigate,
  };
});

describe('Login Component', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  const setupAuth = (loginMock = vi.fn()) => {
    return {
      user: null,
      isAuthenticated: false,
      loading: false,
      login: loginMock,
      register: vi.fn(),
      logout: vi.fn(),
      checkAuth: vi.fn(),
      updateProfile: vi.fn(),
      updatePassword: vi.fn(),
    };
  };

  it('renders login form inputs and labels', () => {
    render(
      <MemoryRouter>
        <AuthContext.Provider value={setupAuth()}>
          <Login />
        </AuthContext.Provider>
      </MemoryRouter>
    );

    expect(screen.getByLabelText(/email address/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/password/i)).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /sign in/i })).toBeInTheDocument();
  });

  it('calls login handler with input values and redirects on success', async () => {
    const loginMock = vi.fn().mockResolvedValue({});
    render(
      <MemoryRouter>
        <AuthContext.Provider value={setupAuth(loginMock)}>
          <Login />
        </AuthContext.Provider>
      </MemoryRouter>
    );

    fireEvent.change(screen.getByLabelText(/email address/i), { target: { value: 'user@example.com' } });
    fireEvent.change(screen.getByLabelText(/password/i), { target: { value: 'password123' } });

    fireEvent.click(screen.getByRole('button', { name: /sign in/i }));

    await waitFor(() => {
      expect(loginMock).toHaveBeenCalledWith({ email: 'user@example.com', password: 'password123' });
      expect(mockNavigate).toHaveBeenCalledWith('/dashboard');
    });
  });

  it('displays error alert when login fails', async () => {
    const loginMock = vi.fn().mockRejectedValue(new Error('Invalid email or password'));
    render(
      <MemoryRouter>
        <AuthContext.Provider value={setupAuth(loginMock)}>
          <Login />
        </AuthContext.Provider>
      </MemoryRouter>
    );

    fireEvent.change(screen.getByLabelText(/email address/i), { target: { value: 'wrong@example.com' } });
    fireEvent.change(screen.getByLabelText(/password/i), { target: { value: 'wrongpass' } });

    fireEvent.click(screen.getByRole('button', { name: /sign in/i }));

    await waitFor(() => {
      expect(screen.getByText('Invalid email or password')).toBeInTheDocument();
    });
  });
});
