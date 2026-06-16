import { describe, it, expect } from 'vitest';
import { calculateCarbon } from '../services/mockServices';

describe('Carbon Footprint Calculation Tests', () => {
  describe('Standard Calculations', () => {
    it('should calculate correct emissions for travel by car', () => {
      // Car coefficient: 0.192
      const result = calculateCarbon('travel', 'car', 25);
      expect(result).toBe(4.8);
    });

    it('should calculate correct emissions for travel by train', () => {
      // Train coefficient: 0.041
      const result = calculateCarbon('travel', 'train', 50);
      expect(result).toBe(2.1);
    });

    it('should calculate correct emissions for grid electricity', () => {
      // Grid coefficient: 0.82
      const result = calculateCarbon('energy', 'grid', 80);
      expect(result).toBe(65.6);
    });

    it('should calculate correct emissions for food (beef vs vegan)', () => {
      // Beef: 27, Vegan: 1.5
      expect(calculateCarbon('food', 'beef', 2)).toBe(54.0);
      expect(calculateCarbon('food', 'vegan', 3)).toBe(4.5);
    });

    it('should calculate correct emissions for shopping (clothing)', () => {
      // Clothing: 15
      const result = calculateCarbon('shopping', 'clothing', 2);
      expect(result).toBe(30.0);
    });
  });

  describe('Edge Cases', () => {
    it('should handle zero amounts correctly', () => {
      expect(calculateCarbon('travel', 'car', 0)).toBe(0);
      expect(calculateCarbon('energy', 'grid', 0)).toBe(0);
      expect(calculateCarbon('food', 'beef', 0)).toBe(0);
      expect(calculateCarbon('shopping', 'electronics', 0)).toBe(0);
    });

    it('should handle small floating point numbers', () => {
      // 0.25 * 0.192 = 0.048 -> rounded to 1 decimal place: 0.0
      expect(calculateCarbon('travel', 'car', 0.25)).toBe(0);
      // 10 * 0.192 = 1.92 -> 1.9
      expect(calculateCarbon('travel', 'car', 10)).toBe(1.9);
    });

    it('should handle very large numbers', () => {
      const result = calculateCarbon('energy', 'grid', 1000000);
      expect(result).toBe(820000);
    });

    it('should compute negative values mathematically correctly', () => {
      // -10 * 0.192 = -1.92 -> rounded to -1.9
      expect(calculateCarbon('travel', 'car', -10)).toBe(-1.9);
    });
  });

  describe('Invalid Inputs and Fallbacks', () => {
    it('should return 0 for unknown category', () => {
      expect(calculateCarbon('unknown_category', 'car', 10)).toBe(0);
    });

    it('should fallback to 0 for unknown travel subcategory', () => {
      expect(calculateCarbon('travel', 'rocket_ship', 10)).toBe(0);
    });

    it('should use food fallback factor of 2 for unknown food subcategory', () => {
      // Unknown food defaults to factor 2: 10 * 2 = 20
      expect(calculateCarbon('food', 'exotic_fruit', 10)).toBe(20.0);
    });

    it('should use shopping fallback factor of 4 for unknown shopping subcategory', () => {
      // Unknown shopping defaults to factor 4: 10 * 4 = 40
      expect(calculateCarbon('shopping', 'unknown_item', 10)).toBe(40.0);
    });
  });
});
