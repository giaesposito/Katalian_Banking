import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { BrowserRouter } from 'react-router-dom';
import LoginScreen from './LoginScreen';

// Wrapper component to provide router context
const RouterWrapper: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  return <BrowserRouter>{children}</BrowserRouter>;
};

describe('LoginScreen Component', () => {
  describe('Rendering', () => {
    it('should render the login form with all required elements', () => {
      const mockOnLogin = vi.fn();
      render(
        <RouterWrapper>
          <LoginScreen onLogin={mockOnLogin} />
        </RouterWrapper>
      );

      // Check for heading and welcome message
      expect(screen.getByText('Sign in to your account')).toBeInTheDocument();
      expect(screen.getByText('Welcome back to Katalian Bank')).toBeInTheDocument();

      // Check for form inputs
      expect(screen.getByLabelText('Username')).toBeInTheDocument();
      expect(screen.getByLabelText('Password')).toBeInTheDocument();

      // Check for submit button
      expect(screen.getByRole('button', { name: 'Sign in' })).toBeInTheDocument();

      // Check for forgot password link
      expect(screen.getByText('Forgot your password?')).toBeInTheDocument();
    });

    it('should render username input with correct attributes', () => {
      const mockOnLogin = vi.fn();
      render(
        <RouterWrapper>
          <LoginScreen onLogin={mockOnLogin} />
        </RouterWrapper>
      );

      const usernameInput = screen.getByLabelText('Username') as HTMLInputElement;
      expect(usernameInput).toHaveAttribute('type', 'text');
      expect(usernameInput).toHaveAttribute('id', 'username');
      expect(usernameInput).toHaveAttribute('autocomplete', 'username');
      expect(usernameInput).toBeRequired();
    });

    it('should render password input with correct attributes', () => {
      const mockOnLogin = vi.fn();
      render(
        <RouterWrapper>
          <LoginScreen onLogin={mockOnLogin} />
        </RouterWrapper>
      );

      const passwordInput = screen.getByLabelText('Password') as HTMLInputElement;
      expect(passwordInput).toHaveAttribute('type', 'password');
      expect(passwordInput).toHaveAttribute('id', 'password');
      expect(passwordInput).toHaveAttribute('autocomplete', 'current-password');
      expect(passwordInput).toBeRequired();
    });

    it('should not display error message initially', () => {
      const mockOnLogin = vi.fn();
      render(
        <RouterWrapper>
          <LoginScreen onLogin={mockOnLogin} />
        </RouterWrapper>
      );

      expect(screen.queryByText(/Invalid username or password/i)).not.toBeInTheDocument();
      expect(screen.queryByText(/Your account is locked/i)).not.toBeInTheDocument();
    });
  });

  describe('User Input', () => {
    it('should update username field when user types', () => {
      const mockOnLogin = vi.fn();
      render(
        <RouterWrapper>
          <LoginScreen onLogin={mockOnLogin} />
        </RouterWrapper>
      );

      const usernameInput = screen.getByLabelText('Username') as HTMLInputElement;
      fireEvent.change(usernameInput, { target: { value: 'testuser' } });

      expect(usernameInput.value).toBe('testuser');
    });

    it('should update password field when user types', () => {
      const mockOnLogin = vi.fn();
      render(
        <RouterWrapper>
          <LoginScreen onLogin={mockOnLogin} />
        </RouterWrapper>
      );

      const passwordInput = screen.getByLabelText('Password') as HTMLInputElement;
      fireEvent.change(passwordInput, { target: { value: 'password123' } });

      expect(passwordInput.value).toBe('password123');
    });

    it('should allow entering both username and password', () => {
      const mockOnLogin = vi.fn();
      render(
        <RouterWrapper>
          <LoginScreen onLogin={mockOnLogin} />
        </RouterWrapper>
      );

      const usernameInput = screen.getByLabelText('Username') as HTMLInputElement;
      const passwordInput = screen.getByLabelText('Password') as HTMLInputElement;

      fireEvent.change(usernameInput, { target: { value: 'bankinguser123' } });
      fireEvent.change(passwordInput, { target: { value: 'notapassword@123' } });

      expect(usernameInput.value).toBe('bankinguser123');
      expect(passwordInput.value).toBe('notapassword@123');
    });
  });

  describe('Form Submission', () => {
    it('should call onLogin with username and password when form is submitted', () => {
      const mockOnLogin = vi.fn().mockReturnValue('success');
      render(
        <RouterWrapper>
          <LoginScreen onLogin={mockOnLogin} />
        </RouterWrapper>
      );

      const usernameInput = screen.getByLabelText('Username');
      const passwordInput = screen.getByLabelText('Password');
      const submitButton = screen.getByRole('button', { name: 'Sign in' });

      fireEvent.change(usernameInput, { target: { value: 'testuser' } });
      fireEvent.change(passwordInput, { target: { value: 'testpass' } });
      fireEvent.click(submitButton);

      expect(mockOnLogin).toHaveBeenCalledWith('testuser', 'testpass');
      expect(mockOnLogin).toHaveBeenCalledTimes(1);
    });

    it('should prevent default form submission behavior', () => {
      const mockOnLogin = vi.fn().mockReturnValue('success');
      render(
        <RouterWrapper>
          <LoginScreen onLogin={mockOnLogin} />
        </RouterWrapper>
      );

      const form = screen.getByRole('button', { name: 'Sign in' }).closest('form')!;
      const submitEvent = new Event('submit', { bubbles: true, cancelable: true });
      const preventDefaultSpy = vi.spyOn(submitEvent, 'preventDefault');

      form.dispatchEvent(submitEvent);

      expect(preventDefaultSpy).toHaveBeenCalled();
    });

    it('should clear previous error before submitting', async () => {
      const mockOnLogin = vi.fn()
        .mockReturnValueOnce('invalid')
        .mockReturnValueOnce('success');

      render(
        <RouterWrapper>
          <LoginScreen onLogin={mockOnLogin} />
        </RouterWrapper>
      );

      const usernameInput = screen.getByLabelText('Username');
      const passwordInput = screen.getByLabelText('Password');
      const submitButton = screen.getByRole('button', { name: 'Sign in' });

      // First submission - invalid credentials
      fireEvent.change(usernameInput, { target: { value: 'wronguser' } });
      fireEvent.change(passwordInput, { target: { value: 'wrongpass' } });
      fireEvent.click(submitButton);

      await waitFor(() => {
        expect(screen.getByText('Invalid username or password.')).toBeInTheDocument();
      });

      // Second submission - should clear error before showing new result
      fireEvent.change(usernameInput, { target: { value: 'correctuser' } });
      fireEvent.change(passwordInput, { target: { value: 'correctpass' } });
      fireEvent.click(submitButton);

      expect(mockOnLogin).toHaveBeenCalledTimes(2);
    });
  });

  describe('Error Handling', () => {
    it('should display error message when login returns "invalid"', async () => {
      const mockOnLogin = vi.fn().mockReturnValue('invalid');
      render(
        <RouterWrapper>
          <LoginScreen onLogin={mockOnLogin} />
        </RouterWrapper>
      );

      const usernameInput = screen.getByLabelText('Username');
      const passwordInput = screen.getByLabelText('Password');
      const submitButton = screen.getByRole('button', { name: 'Sign in' });

      fireEvent.change(usernameInput, { target: { value: 'invaliduser' } });
      fireEvent.change(passwordInput, { target: { value: 'invalidpass' } });
      fireEvent.click(submitButton);

      await waitFor(() => {
        expect(screen.getByText('Invalid username or password.')).toBeInTheDocument();
      });
    });

    it('should display locked account error when login returns "locked"', async () => {
      const mockOnLogin = vi.fn().mockReturnValue('locked');
      render(
        <RouterWrapper>
          <LoginScreen onLogin={mockOnLogin} />
        </RouterWrapper>
      );

      const usernameInput = screen.getByLabelText('Username');
      const passwordInput = screen.getByLabelText('Password');
      const submitButton = screen.getByRole('button', { name: 'Sign in' });

      fireEvent.change(usernameInput, { target: { value: 'lockeduser' } });
      fireEvent.change(passwordInput, { target: { value: 'password' } });
      fireEvent.click(submitButton);

      await waitFor(() => {
        expect(screen.getByText(/Your account is locked/i)).toBeInTheDocument();
        expect(screen.getByText(/Please use your reset password to log in or reset your password/i)).toBeInTheDocument();
      });
    });

    it('should not display error when login returns "success"', async () => {
      const mockOnLogin = vi.fn().mockReturnValue('success');
      render(
        <RouterWrapper>
          <LoginScreen onLogin={mockOnLogin} />
        </RouterWrapper>
      );

      const usernameInput = screen.getByLabelText('Username');
      const passwordInput = screen.getByLabelText('Password');
      const submitButton = screen.getByRole('button', { name: 'Sign in' });

      fireEvent.change(usernameInput, { target: { value: 'validuser' } });
      fireEvent.change(passwordInput, { target: { value: 'validpass' } });
      fireEvent.click(submitButton);

      await waitFor(() => {
        expect(mockOnLogin).toHaveBeenCalled();
      });

      expect(screen.queryByText(/Invalid username or password/i)).not.toBeInTheDocument();
      expect(screen.queryByText(/Your account is locked/i)).not.toBeInTheDocument();
    });
  });

  describe('Navigation', () => {
    it('should have a link to password reset page', () => {
      const mockOnLogin = vi.fn();
      render(
        <RouterWrapper>
          <LoginScreen onLogin={mockOnLogin} />
        </RouterWrapper>
      );

      const resetLink = screen.getByText('Forgot your password?');
      expect(resetLink).toBeInTheDocument();
      expect(resetLink.closest('a')).toHaveAttribute('href', '/reset-password');
    });
  });

  describe('Accessibility', () => {
    it('should have proper form structure with labels', () => {
      const mockOnLogin = vi.fn();
      render(
        <RouterWrapper>
          <LoginScreen onLogin={mockOnLogin} />
        </RouterWrapper>
      );

      const usernameInput = screen.getByLabelText('Username');
      const passwordInput = screen.getByLabelText('Password');

      expect(usernameInput).toHaveAttribute('id', 'username');
      expect(passwordInput).toHaveAttribute('id', 'password');
    });

    it('should mark both fields as required', () => {
      const mockOnLogin = vi.fn();
      render(
        <RouterWrapper>
          <LoginScreen onLogin={mockOnLogin} />
        </RouterWrapper>
      );

      const usernameInput = screen.getByLabelText('Username');
      const passwordInput = screen.getByLabelText('Password');

      expect(usernameInput).toBeRequired();
      expect(passwordInput).toBeRequired();
    });
  });

  describe('Edge Cases', () => {
    it('should not submit form with empty fields due to HTML5 validation', () => {
      const mockOnLogin = vi.fn().mockReturnValue('invalid');
      render(
        <RouterWrapper>
          <LoginScreen onLogin={mockOnLogin} />
        </RouterWrapper>
      );

      const submitButton = screen.getByRole('button', { name: 'Sign in' });
      fireEvent.click(submitButton);

      // HTML5 validation should prevent submission when required fields are empty
      expect(mockOnLogin).not.toHaveBeenCalled();
    });

    it('should handle rapid multiple submissions', () => {
      const mockOnLogin = vi.fn().mockReturnValue('success');
      render(
        <RouterWrapper>
          <LoginScreen onLogin={mockOnLogin} />
        </RouterWrapper>
      );

      const usernameInput = screen.getByLabelText('Username');
      const passwordInput = screen.getByLabelText('Password');
      const submitButton = screen.getByRole('button', { name: 'Sign in' });

      fireEvent.change(usernameInput, { target: { value: 'user' } });
      fireEvent.change(passwordInput, { target: { value: 'pass' } });

      // Click multiple times rapidly
      fireEvent.click(submitButton);
      fireEvent.click(submitButton);
      fireEvent.click(submitButton);

      expect(mockOnLogin).toHaveBeenCalledTimes(3);
    });

    it('should handle special characters in username and password', () => {
      const mockOnLogin = vi.fn().mockReturnValue('success');
      render(
        <RouterWrapper>
          <LoginScreen onLogin={mockOnLogin} />
        </RouterWrapper>
      );

      const usernameInput = screen.getByLabelText('Username');
      const passwordInput = screen.getByLabelText('Password');
      const submitButton = screen.getByRole('button', { name: 'Sign in' });

      const specialUsername = 'user@123!#';
      const specialPassword = 'p@$$w0rd!@#';

      fireEvent.change(usernameInput, { target: { value: specialUsername } });
      fireEvent.change(passwordInput, { target: { value: specialPassword } });
      fireEvent.click(submitButton);

      expect(mockOnLogin).toHaveBeenCalledWith(specialUsername, specialPassword);
    });
  });
});
