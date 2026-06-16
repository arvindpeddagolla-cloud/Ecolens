import { describe, it, expect } from 'vitest';
import { validateRequired, validateEmail, validateNumericInput } from '../utils/validation';

describe('Form Validation Utility Tests', () => {
  describe('validateRequired', () => {
    it('should return true for valid non-empty strings', () => {
      expect(validateRequired('hello')).toBe(true);
      expect(validateRequired('  hello  ')).toBe(true);
      expect(validateRequired(123)).toBe(true);
    });

    it('should return false for empty, whitespace-only, null, or undefined values', () => {
      expect(validateRequired('')).toBe(false);
      expect(validateRequired('   ')).toBe(false);
      expect(validateRequired(null)).toBe(false);
      expect(validateRequired(undefined)).toBe(false);
    });
  });

  describe('validateEmail', () => {
    it('should return true for valid email addresses', () => {
      expect(validateEmail('test@example.com')).toBe(true);
      expect(validateEmail('user.name+tag@domain.co.uk')).toBe(true);
      expect(validateEmail('alex_123@sub.domain.org')).toBe(true);
    });

    it('should return false for malformed email addresses', () => {
      expect(validateEmail('')).toBe(false);
      expect(validateEmail('plaintest')).toBe(false);
      expect(validateEmail('test@')).toBe(false);
      expect(validateEmail('test@domain')).toBe(false);
      expect(validateEmail('@domain.com')).toBe(false);
      expect(validateEmail('test@domain.')).toBe(false);
      expect(validateEmail('test.domain.com')).toBe(false);
    });
  });

  describe('validateNumericInput', () => {
    it('should return valid result for positive numbers', () => {
      expect(validateNumericInput(10)).toEqual({ isValid: true, parsedValue: 10, error: null });
      expect(validateNumericInput('50.5')).toEqual({ isValid: true, parsedValue: 50.5, error: null });
    });

    it('should reject empty or null inputs', () => {
      expect(validateNumericInput('')).toEqual({ isValid: false, parsedValue: 0, error: 'Value is required' });
      // @ts-ignore
      expect(validateNumericInput(null)).toEqual({ isValid: false, parsedValue: 0, error: 'Value is required' });
    });

    it('should reject non-numeric inputs', () => {
      expect(validateNumericInput('abc')).toEqual({ isValid: false, parsedValue: 0, error: 'Must be a valid number' });
      expect(validateNumericInput('12a')).toEqual({ isValid: false, parsedValue: 0, error: 'Must be a valid number' });
    });

    it('should reject numbers less than or equal to 0', () => {
      expect(validateNumericInput(0)).toEqual({ isValid: false, parsedValue: 0, error: 'Value must be greater than 0' });
      expect(validateNumericInput(-5)).toEqual({ isValid: false, parsedValue: -5, error: 'Value must be greater than 0' });
      expect(validateNumericInput('-10.2')).toEqual({ isValid: false, parsedValue: -10.2, error: 'Value must be greater than 0' });
    });
  });
});
