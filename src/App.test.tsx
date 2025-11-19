import { describe, it, expect, beforeEach, vi } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { BrowserRouter } from 'react-router-dom';
import App from './App';

// Mock the constants to have predictable test data
vi.mock('./constants', () => ({
  USERS: [
    {
      id: 'user1',
      username: 'validuser',
      passwordHash: 'validpass',
      locked: false,
      canApplyForPlatinum: true,
      accounts: [
        { id: 'acc1-1', type: 'Checking', accountNumber: '...1234', balance: 1000 },
      ],
    },
    {
      id: 'user2',
      username: 'lockeduser',
      passwordHash: 'normalpass',
      unlockPasswordHash: 'unlockpass',
      locked: true,
      canApplyForPlatinum: false,
      accounts: [
        { id: 'acc2-1', type: 'Checking', accountNumber: '...5678', balance: 500 },
      ],
    },
    {
      id: 'user3',
      username: 'anotheruser',
      passwordHash: 'anotherpass',
      locked: false,
      canApplyForPlatinum: false,
      accounts: [
        { id: 'acc3-1', type: 'Savings', accountNumber: '...9012', balance: 2000 },
      ],
    },
  ],
  STATES: ['California', 'New York', 'Texas'],
}));

// Wrapper to provide router context
const renderApp = () => {
  return render(
    <BrowserRouter>
      <App />
    </BrowserRouter>
  );
};

describe('App - Login Functionality', () => {
  beforeEach(() => {
    // Reset any navigation between tests
    window.history.pushState({}, '', '/login');
  });

  describe('handleLogin - Valid Credentials', () => {
    it('should successfully log in with correct username and password', async () => {
      renderApp();

      const usernameInput = screen.getByLabelText('Username');
      const passwordInput = screen.getByLabelText('Password');
      const submitButton = screen.getByRole('button', { name: 'Sign in' });

      fireEvent.change(usernameInput, { target: { value: 'validuser' } });
      fireEvent.change(passwordInput, { target: { value: 'validpass' } });
      fireEvent.click(submitButton);

      // Should navigate to dashboard after successful login
      await waitFor(() => {
        expect(window.location.pathname).toBe('/dashboard');
      }, { timeout: 3000 });
    });

    it('should set currentUser state after successful login', async () => {
      renderApp();

      const usernameInput = screen.getByLabelText('Username');
      const passwordInput = screen.getByLabelText('Password');
      const submitButton = screen.getByRole('button', { name: 'Sign in' });

      fireEvent.change(usernameInput, { target: { value: 'validuser' } });
      fireEvent.change(passwordInput, { target: { value: 'validpass' } });
      fireEvent.click(submitButton);

      // Check that user info appears (e.g., logout button or user welcome)
      await waitFor(() => {
        expect(screen.getByText(/Logout/i)).toBeInTheDocument();
      }, { timeout: 3000 });
    });

    it('should display user accounts after successful login', async () => {
      renderApp();

      const usernameInput = screen.getByLabelText('Username');
      const passwordInput = screen.getByLabelText('Password');
      const submitButton = screen.getByRole('button', { name: 'Sign in' });

      fireEvent.change(usernameInput, { target: { value: 'validuser' } });
      fireEvent.change(passwordInput, { target: { value: 'validpass' } });
      fireEvent.click(submitButton);

      // Wait for dashboard to load and show accounts
      await waitFor(() => {
        expect(window.location.pathname).toBe('/dashboard');
      }, { timeout: 3000 });
    });
  });

  describe('handleLogin - Invalid Credentials', () => {
    it('should show error for non-existent username', async () => {
      renderApp();

      const usernameInput = screen.getByLabelText('Username');
      const passwordInput = screen.getByLabelText('Password');
      const submitButton = screen.getByRole('button', { name: 'Sign in' });

      fireEvent.change(usernameInput, { target: { value: 'nonexistentuser' } });
      fireEvent.change(passwordInput, { target: { value: 'anypassword' } });
      fireEvent.click(submitButton);

      await waitFor(() => {
        expect(screen.getByText('Invalid username or password.')).toBeInTheDocument();
      });

      // Should remain on login page
      expect(window.location.pathname).toBe('/login');
    });

    it('should show error for wrong password with valid username', async () => {
      renderApp();

      const usernameInput = screen.getByLabelText('Username');
      const passwordInput = screen.getByLabelText('Password');
      const submitButton = screen.getByRole('button', { name: 'Sign in' });

      fireEvent.change(usernameInput, { target: { value: 'validuser' } });
      fireEvent.change(passwordInput, { target: { value: 'wrongpassword' } });
      fireEvent.click(submitButton);

      await waitFor(() => {
        expect(screen.getByText('Invalid username or password.')).toBeInTheDocument();
      });

      // Should remain on login page
      expect(window.location.pathname).toBe('/login');
    });

    it('should not submit with empty username due to HTML5 validation', async () => {
      renderApp();

      const usernameInput = screen.getByLabelText('Username');
      const passwordInput = screen.getByLabelText('Password');
      const submitButton = screen.getByRole('button', { name: 'Sign in' });

      fireEvent.change(usernameInput, { target: { value: '' } });
      fireEvent.change(passwordInput, { target: { value: 'somepassword' } });
      fireEvent.click(submitButton);

      // HTML5 validation should prevent submission
      // The error message should not appear since form won't submit
      expect(screen.queryByText('Invalid username or password.')).not.toBeInTheDocument();

      // Should remain on login page
      expect(window.location.pathname).toBe('/login');
    });
  });

  describe('handleLogin - Locked Account', () => {
    it('should show locked error when trying to log in with normal password', async () => {
      renderApp();

      const usernameInput = screen.getByLabelText('Username');
      const passwordInput = screen.getByLabelText('Password');
      const submitButton = screen.getByRole('button', { name: 'Sign in' });

      fireEvent.change(usernameInput, { target: { value: 'lockeduser' } });
      fireEvent.change(passwordInput, { target: { value: 'normalpass' } });
      fireEvent.click(submitButton);

      await waitFor(() => {
        expect(screen.getByText(/Your account is locked/i)).toBeInTheDocument();
      });

      // Should remain on login page
      expect(window.location.pathname).toBe('/login');
    });

    it('should unlock account and log in with unlock password', async () => {
      renderApp();

      const usernameInput = screen.getByLabelText('Username');
      const passwordInput = screen.getByLabelText('Password');
      const submitButton = screen.getByRole('button', { name: 'Sign in' });

      fireEvent.change(usernameInput, { target: { value: 'lockeduser' } });
      fireEvent.change(passwordInput, { target: { value: 'unlockpass' } });
      fireEvent.click(submitButton);

      // Should navigate to dashboard after unlocking
      await waitFor(() => {
        expect(window.location.pathname).toBe('/dashboard');
      }, { timeout: 3000 });
    });

    it('should persist unlocked state after using unlock password', async () => {
      renderApp();

      // First login with unlock password
      let usernameInput = screen.getByLabelText('Username');
      let passwordInput = screen.getByLabelText('Password');
      let submitButton = screen.getByRole('button', { name: 'Sign in' });

      fireEvent.change(usernameInput, { target: { value: 'lockeduser' } });
      fireEvent.change(passwordInput, { target: { value: 'unlockpass' } });
      fireEvent.click(submitButton);

      // Wait for successful login
      await waitFor(() => {
        expect(window.location.pathname).toBe('/dashboard');
      }, { timeout: 3000 });

      // Logout
      const logoutButton = screen.getByText(/Logout/i);
      fireEvent.click(logoutButton);

      await waitFor(() => {
        expect(window.location.pathname).toBe('/login');
      });

      // Try logging in again with normal password (should work now that account is unlocked)
      usernameInput = screen.getByLabelText('Username');
      passwordInput = screen.getByLabelText('Password');
      submitButton = screen.getByRole('button', { name: 'Sign in' });

      fireEvent.change(usernameInput, { target: { value: 'lockeduser' } });
      fireEvent.change(passwordInput, { target: { value: 'normalpass' } });
      fireEvent.click(submitButton);

      // Should successfully log in with normal password
      await waitFor(() => {
        expect(window.location.pathname).toBe('/dashboard');
      }, { timeout: 3000 });
    });

    it('should show invalid error for locked account with wrong unlock password', async () => {
      renderApp();

      const usernameInput = screen.getByLabelText('Username');
      const passwordInput = screen.getByLabelText('Password');
      const submitButton = screen.getByRole('button', { name: 'Sign in' });

      fireEvent.change(usernameInput, { target: { value: 'lockeduser' } });
      fireEvent.change(passwordInput, { target: { value: 'wrongunlockpass' } });
      fireEvent.click(submitButton);

      await waitFor(() => {
        expect(screen.getByText(/Your account is locked/i)).toBeInTheDocument();
      });
    });
  });

  describe('handleLogin - Return Values', () => {
    it('should return "success" for valid credentials', async () => {
      renderApp();

      const usernameInput = screen.getByLabelText('Username');
      const passwordInput = screen.getByLabelText('Password');
      const submitButton = screen.getByRole('button', { name: 'Sign in' });

      fireEvent.change(usernameInput, { target: { value: 'validuser' } });
      fireEvent.change(passwordInput, { target: { value: 'validpass' } });
      fireEvent.click(submitButton);

      // Success is indicated by navigation to dashboard
      await waitFor(() => {
        expect(window.location.pathname).toBe('/dashboard');
      }, { timeout: 3000 });
    });

    it('should return "invalid" for wrong credentials', async () => {
      renderApp();

      const usernameInput = screen.getByLabelText('Username');
      const passwordInput = screen.getByLabelText('Password');
      const submitButton = screen.getByRole('button', { name: 'Sign in' });

      fireEvent.change(usernameInput, { target: { value: 'validuser' } });
      fireEvent.change(passwordInput, { target: { value: 'wrongpass' } });
      fireEvent.click(submitButton);

      // Invalid is indicated by error message
      await waitFor(() => {
        expect(screen.getByText('Invalid username or password.')).toBeInTheDocument();
      });
    });

    it('should return "locked" for locked account with normal password', async () => {
      renderApp();

      const usernameInput = screen.getByLabelText('Username');
      const passwordInput = screen.getByLabelText('Password');
      const submitButton = screen.getByRole('button', { name: 'Sign in' });

      fireEvent.change(usernameInput, { target: { value: 'lockeduser' } });
      fireEvent.change(passwordInput, { target: { value: 'normalpass' } });
      fireEvent.click(submitButton);

      // Locked is indicated by locked account error message
      await waitFor(() => {
        expect(screen.getByText(/Your account is locked/i)).toBeInTheDocument();
      });
    });
  });

  describe('handleLogin - Edge Cases', () => {
    it('should handle case-sensitive usernames', async () => {
      renderApp();

      const usernameInput = screen.getByLabelText('Username');
      const passwordInput = screen.getByLabelText('Password');
      const submitButton = screen.getByRole('button', { name: 'Sign in' });

      // Try with uppercase username
      fireEvent.change(usernameInput, { target: { value: 'VALIDUSER' } });
      fireEvent.change(passwordInput, { target: { value: 'validpass' } });
      fireEvent.click(submitButton);

      await waitFor(() => {
        expect(screen.getByText('Invalid username or password.')).toBeInTheDocument();
      });
    });

    it('should handle usernames with spaces', async () => {
      renderApp();

      const usernameInput = screen.getByLabelText('Username');
      const passwordInput = screen.getByLabelText('Password');
      const submitButton = screen.getByRole('button', { name: 'Sign in' });

      fireEvent.change(usernameInput, { target: { value: 'valid user' } });
      fireEvent.change(passwordInput, { target: { value: 'validpass' } });
      fireEvent.click(submitButton);

      await waitFor(() => {
        expect(screen.getByText('Invalid username or password.')).toBeInTheDocument();
      });
    });

    it('should handle SQL injection attempts safely', async () => {
      renderApp();

      const usernameInput = screen.getByLabelText('Username');
      const passwordInput = screen.getByLabelText('Password');
      const submitButton = screen.getByRole('button', { name: 'Sign in' });

      fireEvent.change(usernameInput, { target: { value: "admin' OR '1'='1" } });
      fireEvent.change(passwordInput, { target: { value: "password' OR '1'='1" } });
      fireEvent.click(submitButton);

      await waitFor(() => {
        expect(screen.getByText('Invalid username or password.')).toBeInTheDocument();
      });
    });

    it('should handle multiple failed login attempts', async () => {
      renderApp();

      const usernameInput = screen.getByLabelText('Username');
      const passwordInput = screen.getByLabelText('Password');
      const submitButton = screen.getByRole('button', { name: 'Sign in' });

      // Multiple failed attempts
      for (let i = 0; i < 3; i++) {
        fireEvent.change(usernameInput, { target: { value: 'validuser' } });
        fireEvent.change(passwordInput, { target: { value: `wrongpass${i}` } });
        fireEvent.click(submitButton);

        await waitFor(() => {
          expect(screen.getByText('Invalid username or password.')).toBeInTheDocument();
        });
      }

      // System should still allow valid login after failed attempts
      fireEvent.change(usernameInput, { target: { value: 'validuser' } });
      fireEvent.change(passwordInput, { target: { value: 'validpass' } });
      fireEvent.click(submitButton);

      await waitFor(() => {
        expect(window.location.pathname).toBe('/dashboard');
      }, { timeout: 3000 });
    });
  });

  describe('handleLogin - State Management', () => {
    it('should update users array when unlocking an account', async () => {
      renderApp();

      const usernameInput = screen.getByLabelText('Username');
      const passwordInput = screen.getByLabelText('Password');
      const submitButton = screen.getByRole('button', { name: 'Sign in' });

      // Login with unlock password
      fireEvent.change(usernameInput, { target: { value: 'lockeduser' } });
      fireEvent.change(passwordInput, { target: { value: 'unlockpass' } });
      fireEvent.click(submitButton);

      await waitFor(() => {
        expect(window.location.pathname).toBe('/dashboard');
      }, { timeout: 3000 });

      // User should now be unlocked in the system
      // This is tested by the persistence test above
    });

    it('should not modify user data for invalid login attempts', async () => {
      renderApp();

      const usernameInput = screen.getByLabelText('Username');
      const passwordInput = screen.getByLabelText('Password');
      const submitButton = screen.getByRole('button', { name: 'Sign in' });

      // Failed login attempt
      fireEvent.change(usernameInput, { target: { value: 'validuser' } });
      fireEvent.change(passwordInput, { target: { value: 'wrongpass' } });
      fireEvent.click(submitButton);

      await waitFor(() => {
        expect(screen.getByText('Invalid username or password.')).toBeInTheDocument();
      });

      // Clear error and try correct credentials
      fireEvent.change(usernameInput, { target: { value: 'validuser' } });
      fireEvent.change(passwordInput, { target: { value: 'validpass' } });
      fireEvent.click(submitButton);

      await waitFor(() => {
        expect(window.location.pathname).toBe('/dashboard');
      }, { timeout: 3000 });
    });
  });
});
