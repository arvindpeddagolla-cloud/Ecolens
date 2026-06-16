import { describe, it, expect, vi, beforeEach } from 'vitest';

// 1. Mock LocalStorage
const localStorageMock = (() => {
  let store: Record<string, string> = {};
  return {
    getItem: (key: string) => store[key] || null,
    setItem: (key: string, value: string) => { store[key] = value.toString(); },
    removeItem: (key: string) => { delete store[key]; },
    clear: () => { store = {}; }
  };
})();

Object.defineProperty(globalThis, 'localStorage', {
  value: localStorageMock,
  writable: true
});

// 2. Mock Firebase Modules before importing mockServices
vi.mock('../services/firebase', () => ({
  auth: {
    currentUser: { uid: 'test-user-123', email: 'test@example.com' }
  },
  db: {},
  googleProvider: {}
}));

vi.mock('firebase/firestore', () => ({
  doc: vi.fn(),
  setDoc: vi.fn(() => Promise.resolve()),
  deleteDoc: vi.fn(() => Promise.resolve()),
  collection: vi.fn()
}));

// Now import the services and validation functions
import { mockAuth } from '../services/mockServices';
import { validateLoginInput, validateRegistrationInput, getAuthErrorMessage } from '../utils/validation';

describe('Authentication & Auth Validation Tests', () => {
  beforeEach(() => {
    localStorage.clear();
  });

  describe('validateLoginInput', () => {
    it('should pass for valid email and password', () => {
      expect(validateLoginInput('user@domain.com', 'securepass')).toEqual({ isValid: true, error: null });
    });

    it('should fail if email is missing or empty', () => {
      expect(validateLoginInput('', 'password')).toEqual({ isValid: false, error: 'Email is required' });
      expect(validateLoginInput('   ', 'password')).toEqual({ isValid: false, error: 'Email is required' });
    });

    it('should fail if email is malformed', () => {
      expect(validateLoginInput('invalidemail', 'password')).toEqual({ isValid: false, error: 'Please enter a valid email address' });
    });

    it('should fail if password is empty', () => {
      expect(validateLoginInput('user@domain.com', '')).toEqual({ isValid: false, error: 'Password is required' });
    });
  });

  describe('validateRegistrationInput', () => {
    it('should pass for valid email and password of 6+ characters', () => {
      expect(validateRegistrationInput('newuser@domain.com', '123456')).toEqual({ isValid: true, error: null });
    });

    it('should fail if email is missing or malformed', () => {
      expect(validateRegistrationInput('', '123456')).toEqual({ isValid: false, error: 'Email is required' });
      expect(validateRegistrationInput('invalid', '123456')).toEqual({ isValid: false, error: 'Please enter a valid email address' });
    });

    it('should fail if password is less than 6 characters', () => {
      expect(validateRegistrationInput('user@domain.com', '12345')).toEqual({ isValid: false, error: 'Password must be at least 6 characters' });
    });
  });

  describe('getAuthErrorMessage', () => {
    it('should map standard Firebase errors correctly', () => {
      expect(getAuthErrorMessage('auth/operation-not-allowed')).toContain('disabled');
      expect(getAuthErrorMessage('auth/wrong-password')).toContain('Invalid email or password');
      expect(getAuthErrorMessage('auth/user-not-found')).toContain('Invalid email or password');
      expect(getAuthErrorMessage('auth/invalid-credential')).toContain('Invalid email or password');
      expect(getAuthErrorMessage('auth/email-already-in-use')).toContain('already registered');
      expect(getAuthErrorMessage('auth/weak-password')).toContain('too weak');
    });

    it('should return fallback message for unrecognized codes', () => {
      expect(getAuthErrorMessage('auth/unknown-error', 'Custom fallback')).toBe('Custom fallback');
    });
  });

  describe('mockAuth service logic', () => {
    it('should fetch the default user initially', () => {
      const user = mockAuth.getCurrentUser();
      expect(user).toBeDefined();
      expect(user.email).toBe('eco.champion@gmail.com');
    });

    it('should update user profile correctly', () => {
      const updated = mockAuth.updateUserProfile({ displayName: 'New Name', xp: 200 });
      expect(updated.displayName).toBe('New Name');
      expect(updated.xp).toBe(200);

      const current = mockAuth.getCurrentUser();
      expect(current.displayName).toBe('New Name');
    });

    it('should unlock badges when XP threshold is met', () => {
      const user = mockAuth.getCurrentUser();
      expect(user.badges).toContain('badge_1'); // default starts with badge_1
      expect(user.badges).not.toContain('badge_2');

      // Update XP to meet badge_2 required XP (500 XP)
      mockAuth.updateUserProfile({ xp: 600 });
      const current = mockAuth.getCurrentUser();
      expect(current.badges).toContain('badge_2');
    });

    it('should clear stored credentials on logout', () => {
      mockAuth.updateUserProfile({ displayName: 'Logged In User' });
      mockAuth.logout();
      expect(localStorage.getItem('ecolens_user')).toBeNull();
    });
  });
});
