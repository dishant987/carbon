import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { Register } from '../pages/Register';
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

describe('Register Component', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  const setupAuth = (registerMock = vi.fn()) => {
    return {
      user: null,
      isAuthenticated: false,
      loading: false,
      login: vi.fn(),
      register: registerMock,
      logout: vi.fn(),
      updateProfile: vi.fn(),
      updatePassword: vi.fn(),
    };
  };

  it('renders registration form inputs and labels', () => {
    render(
      <MemoryRouter>
        <AuthContext.Provider value={setupAuth()}>
          <Register />
        </AuthContext.Provider>
      </MemoryRouter>
    );

    expect(screen.getByLabelText(/full name/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/email address/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/^password/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/confirm password/i)).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /sign up/i })).toBeInTheDocument();
  });

  it('shows error if passwords do not match', async () => {
    render(
      <MemoryRouter>
        <AuthContext.Provider value={setupAuth()}>
          <Register />
        </AuthContext.Provider>
      </MemoryRouter>
    );

    fireEvent.change(screen.getByLabelText(/email address/i), { target: { value: 'user@example.com' } });
    fireEvent.change(screen.getByLabelText(/^password/i), { target: { value: 'password123' } });
    fireEvent.change(screen.getByLabelText(/confirm password/i), { target: { value: 'password321' } });

    fireEvent.click(screen.getByRole('button', { name: /sign up/i }));

    await waitFor(() => {
      expect(screen.getByText('Passwords do not match')).toBeInTheDocument();
    });
  });

  it('calls register and redirects to dashboard on successful signup', async () => {
    const registerMock = vi.fn().mockResolvedValue({});
    render(
      <MemoryRouter>
        <AuthContext.Provider value={setupAuth(registerMock)}>
          <Register />
        </AuthContext.Provider>
      </MemoryRouter>
    );

    fireEvent.change(screen.getByLabelText(/full name/i), { target: { value: 'John Doe' } });
    fireEvent.change(screen.getByLabelText(/email address/i), { target: { value: 'john@example.com' } });
    fireEvent.change(screen.getByLabelText(/^password/i), { target: { value: 'securepass' } });
    fireEvent.change(screen.getByLabelText(/confirm password/i), { target: { value: 'securepass' } });

    fireEvent.click(screen.getByRole('button', { name: /sign up/i }));

    await waitFor(() => {
      expect(registerMock).toHaveBeenCalledWith({ name: 'John Doe', email: 'john@example.com', password: 'securepass' });
      expect(mockNavigate).toHaveBeenCalledWith('/dashboard');
    });
  });

  it('displays error if registration fails', async () => {
    const registerMock = vi.fn().mockRejectedValue(new Error('Email already registered'));
    render(
      <MemoryRouter>
        <AuthContext.Provider value={setupAuth(registerMock)}>
          <Register />
        </AuthContext.Provider>
      </MemoryRouter>
    );

    fireEvent.change(screen.getByLabelText(/email address/i), { target: { value: 'john@example.com' } });
    fireEvent.change(screen.getByLabelText(/^password/i), { target: { value: 'securepass' } });
    fireEvent.change(screen.getByLabelText(/confirm password/i), { target: { value: 'securepass' } });

    fireEvent.click(screen.getByRole('button', { name: /sign up/i }));

    await waitFor(() => {
      expect(screen.getByText('Email already registered')).toBeInTheDocument();
    });
  });
});
