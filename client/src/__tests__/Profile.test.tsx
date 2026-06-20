import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { Profile } from '../pages/Profile';
import { AuthContext } from '../context/AuthContext';

describe('Profile Component', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  const setupAuth = (user = { id: '1', name: 'John Doe', email: 'john@example.com' }, updateProfileMock = vi.fn(), updatePasswordMock = vi.fn()) => {
    return {
      user,
      isAuthenticated: true,
      loading: false,
      login: vi.fn(),
      register: vi.fn(),
      logout: vi.fn(),
      updateProfile: updateProfileMock,
      updatePassword: updatePasswordMock,
    };
  };

  it('renders profile details and forms correctly', () => {
    render(
      <AuthContext.Provider value={setupAuth()}>
        <Profile />
      </AuthContext.Provider>
    );

    // Initial credentials should be set in inputs
    expect(screen.getByLabelText(/full name/i)).toHaveValue('John Doe');
    expect(screen.getByLabelText(/email address/i)).toHaveValue('john@example.com');
  });

  it('updates profile info successfully', async () => {
    const updateProfileMock = vi.fn().mockResolvedValue({});
    render(
      <AuthContext.Provider value={setupAuth(undefined, updateProfileMock)}>
        <Profile />
      </AuthContext.Provider>
    );

    const nameInput = screen.getByLabelText(/full name/i);
    fireEvent.change(nameInput, { target: { value: 'John Smith' } });

    const submitBtn = screen.getByRole('button', { name: /save changes/i });
    fireEvent.click(submitBtn);

    await waitFor(() => {
      expect(updateProfileMock).toHaveBeenCalledWith({ name: 'John Smith', email: 'john@example.com' });
      expect(screen.getByText('Profile updated successfully!')).toBeInTheDocument();
    });
  });

  it('shows validation errors for password length and mismatch', async () => {
    render(
      <AuthContext.Provider value={setupAuth()}>
        <Profile />
      </AuthContext.Provider>
    );

    // Switch to Security tab
    const securityTab = screen.getByRole('tab', { name: /security/i });
    fireEvent.click(securityTab);

    expect(screen.getByLabelText(/current password/i)).toBeInTheDocument();

    const newPassInput = screen.getByLabelText(/new password/i);
    const confirmPassInput = screen.getByLabelText(/confirm new password/i);
    const submitBtn = screen.getByRole('button', { name: /update password/i });

    // Scenario 1: Mismatch
    fireEvent.change(newPassInput, { target: { value: 'pass12345' } });
    fireEvent.change(confirmPassInput, { target: { value: 'pass12346' } });
    fireEvent.click(submitBtn);

    await waitFor(() => {
      expect(screen.getByText('New passwords do not match')).toBeInTheDocument();
    });

    // Scenario 2: Too short
    fireEvent.change(newPassInput, { target: { value: 'short' } });
    fireEvent.change(confirmPassInput, { target: { value: 'short' } });
    fireEvent.click(submitBtn);

    await waitFor(() => {
      expect(screen.getByText('New password must be at least 8 characters long')).toBeInTheDocument();
    });
  });

  it('submits password update successfully', async () => {
    const updatePasswordMock = vi.fn().mockResolvedValue({});
    render(
      <AuthContext.Provider value={setupAuth(undefined, undefined, updatePasswordMock)}>
        <Profile />
      </AuthContext.Provider>
    );

    const securityTab = screen.getByRole('tab', { name: /security/i });
    fireEvent.click(securityTab);

    fireEvent.change(screen.getByLabelText(/current password/i), { target: { value: 'oldpassword' } });
    fireEvent.change(screen.getByLabelText(/new password/i), { target: { value: 'newpassword123' } });
    fireEvent.change(screen.getByLabelText(/confirm new password/i), { target: { value: 'newpassword123' } });

    const submitBtn = screen.getByRole('button', { name: /update password/i });
    fireEvent.click(submitBtn);

    await waitFor(() => {
      expect(updatePasswordMock).toHaveBeenCalledWith({ currentPassword: 'oldpassword', newPassword: 'newpassword123' });
      expect(screen.getByText('Password updated successfully!')).toBeInTheDocument();
    });
  });
});
