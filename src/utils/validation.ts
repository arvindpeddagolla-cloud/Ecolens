/**
 * EcoLens UI Form Validation Utility Helpers
 */

/**
 * Validates if a required field is not empty, null, undefined, or whitespace-only.
 */
export function validateRequired(value: string | number | null | undefined): boolean {
  if (value === null || value === undefined) {
    return false;
  }
  const str = String(value).trim();
  return str.length > 0;
}

/**
 * Validates if an email address conforms to standard format constraints.
 */
export function validateEmail(email: string): boolean {
  if (!email) return false;
  // A standard, robust email regex matching user@domain.tld
  const emailRegex = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
  return emailRegex.test(email.trim());
}

/**
 * Validates if an input is a valid positive number greater than 0.
 */
export function validateNumericInput(value: string | number): {
  isValid: boolean;
  parsedValue: number;
  error: string | null;
} {
  if (value === null || value === undefined || value === '') {
    return { isValid: false, parsedValue: 0, error: 'Value is required' };
  }

  const parsed = Number(value);
  if (isNaN(parsed)) {
    return { isValid: false, parsedValue: 0, error: 'Must be a valid number' };
  }

  if (parsed <= 0) {
    return { isValid: false, parsedValue: parsed, error: 'Value must be greater than 0' };
  }

  return { isValid: true, parsedValue: parsed, error: null };
}

/**
 * Maps standard Firebase Auth error codes to helpful user-facing troubleshooting advice.
 */
export function getAuthErrorMessage(code: string, fallbackMessage: string = "Authentication failed."): string {
  switch (code) {
    case 'auth/operation-not-allowed':
      return "Email/Password sign-in method is currently disabled in your Firebase console. Please go to Firebase Console > Authentication > Sign-in Method, and enable 'Email/Password'.";
    case 'auth/wrong-password':
    case 'auth/user-not-found':
    case 'auth/invalid-credential':
      return "Invalid email or password. Verify your credentials, or click 'Sign Up' to register a new account.";
    case 'auth/email-already-in-use':
      return "This email address is already registered. Please sign in or use a different email.";
    case 'auth/weak-password':
      return "Password is too weak. Please use at least 6 characters.";
    default:
      return fallbackMessage;
  }
}

/**
 * Validates registration input fields.
 */
export function validateRegistrationInput(email: string, password: string): { isValid: boolean; error: string | null } {
  if (!validateRequired(email)) {
    return { isValid: false, error: 'Email is required' };
  }
  if (!validateEmail(email)) {
    return { isValid: false, error: 'Please enter a valid email address' };
  }
  if (!validateRequired(password)) {
    return { isValid: false, error: 'Password is required' };
  }
  if (password.length < 6) {
    return { isValid: false, error: 'Password must be at least 6 characters' };
  }
  return { isValid: true, error: null };
}

/**
 * Validates login input fields.
 */
export function validateLoginInput(email: string, password: string): { isValid: boolean; error: string | null } {
  if (!validateRequired(email)) {
    return { isValid: false, error: 'Email is required' };
  }
  if (!validateEmail(email)) {
    return { isValid: false, error: 'Please enter a valid email address' };
  }
  if (!validateRequired(password)) {
    return { isValid: false, error: 'Password is required' };
  }
  return { isValid: true, error: null };
}

/**
 * Sanitizes input text by stripping HTML tags and trimming.
 * Helps prevent XSS injections when displaying data or sending it to APIs.
 */
export function sanitizeText(text: string): string {
  if (!text) return '';
  return text
    .replace(/<[^>]*>/g, '')
    .trim();
}
