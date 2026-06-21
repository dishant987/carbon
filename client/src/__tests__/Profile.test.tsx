import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { Profile } from '../pages/Profile';
import { AuthContext } from '../context/AuthContext';

describe('Profile Component', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  const setupAuth = (
    user = { id: '1', name: 'John Doe', email: 'john@example.com', createdAt: '2026-06-20T00:00:00.000Z' },
    updateProfileMock = vi.fn(),
    updatePasswordMock = vi.fn()
  ) => {
    return {
      user,
      isAuthenticated: true,
      loading: false,
      login: vi.fn(),
      register: vi.fn(),
      logout: vi.fn(),
      checkAuth: vi.fn(),
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
    const user = userEvent.setup();
    await user.click(securityTab);

    await waitFor(() => {
      expect(screen.getByLabelText(/current password/i)).toBeInTheDocument();
    });

    const newPassInput = screen.getByLabelText('New Password');
    const confirmPassInput = screen.getByLabelText('Confirm New Password');
    const submitBtn = screen.getByRole('button', { name: /update password/i });

    // Scenario 1: Mismatch
    const nativeValueSetter = Object.getOwnPropertyDescriptor(window.HTMLInputElement.prototype, 'value')?.set;
    nativeValueSetter?.call(newPassInput, 'pass12345');
    newPassInput.dispatchEvent(new Event('input', { bubbles: true }));
    nativeValueSetter?.call(confirmPassInput, 'pass12346');
    confirmPassInput.dispatchEvent(new Event('input', { bubbles: true }));
    fireEvent.click(submitBtn);

    await waitFor(() => {
      expect(screen.getByText('New passwords do not match')).toBeInTheDocument();
    });

    // Scenario 2: Too short
    nativeValueSetter?.call(newPassInput, 'short');
    newPassInput.dispatchEvent(new Event('input', { bubbles: true }));
    nativeValueSetter?.call(confirmPassInput, 'short');
    confirmPassInput.dispatchEvent(new Event('input', { bubbles: true }));
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
    const user = userEvent.setup();
    await user.click(securityTab);

    await waitFor(() => {
      expect(screen.getByLabelText(/current password/i)).toBeInTheDocument();
    });
    fireEvent.change(screen.getByLabelText(/current password/i), { target: { value: 'oldpassword' } });
    fireEvent.change(screen.getByLabelText('New Password'), { target: { value: 'newpassword123' } });
    fireEvent.change(screen.getByLabelText('Confirm New Password'), { target: { value: 'newpassword123' } });

    const submitBtn = screen.getByRole('button', { name: /update password/i });
    fireEvent.click(submitBtn);

    await waitFor(() => {
      expect(updatePasswordMock).toHaveBeenCalledWith({
        currentPassword: 'oldpassword',
        newPassword: 'newpassword123',
      });
      expect(screen.getByText('Password updated successfully!')).toBeInTheDocument();
    });
  });
});
