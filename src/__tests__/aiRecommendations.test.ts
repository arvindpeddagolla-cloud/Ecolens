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

// 2. Mock Firebase
vi.mock('../services/firebase', () => ({
  auth: { currentUser: null },
  db: {},
  googleProvider: {}
}));

import { mockGeminiAI } from '../services/mockServices';

describe('AI Recommendation & Coaching Tests', () => {
  beforeEach(() => {
    vi.restoreAllMocks();
  });

  describe('analyzeImage - Camera Scanner API', () => {
    it('should generate correct fallback analysis for food (burger/beef)', async () => {
      // Mock fetch failure to trigger local fallback scanner
      const fetchSpy = vi.spyOn(globalThis, 'fetch').mockRejectedValue(new Error('Network offline'));
      
      const result = await mockGeminiAI.analyzeImage('my_beef_burger.jpg');
      
      expect(result.itemName).toBe('Beef Burger Patty');
      expect(result.category).toBe('food');
      expect(result.detectedSubCategory).toBe('beef');
      expect(result.carbonFootprint).toBe(27.0); // beef factor coefficient
      expect(result.sustainabilityScore).toBeLessThanOrEqual(3);
      expect(result.alternatives.length).toBeGreaterThan(0);
      expect(result.alternatives[0].subCategory).toBe('vegetarian');
      
      expect(fetchSpy).toHaveBeenCalled();
    });

    it('should generate correct fallback analysis for utility electricity bill', async () => {
      vi.spyOn(globalThis, 'fetch').mockRejectedValue(new Error('Network offline'));
      
      const result = await mockGeminiAI.analyzeImage('june_electric_bill.pdf');
      
      expect(result.itemName).toContain('Electricity Bill');
      expect(result.category).toBe('energy');
      expect(result.detectedSubCategory).toBe('grid');
      expect(result.carbonFootprint).toBe(150 * 0.82); // 123 kg CO2
      expect(result.alternatives[0].savingsPercent).toBe(85);
    });

    it('should generate correct fallback analysis for plastic water bottle', async () => {
      vi.spyOn(globalThis, 'fetch').mockRejectedValue(new Error('Network offline'));
      
      const result = await mockGeminiAI.analyzeImage('plastic_water_bottle.png');
      
      expect(result.category).toBe('shopping');
      expect(result.detectedSubCategory).toBe('plastic');
      expect(result.carbonFootprint).toBe(6.0); // plastic coefficient
      expect(result.alternatives[0].name).toContain('Flask');
    });

    it('should handle unrecognized/default inputs gracefully', async () => {
      vi.spyOn(globalThis, 'fetch').mockRejectedValue(new Error('Network offline'));
      
      const result = await mockGeminiAI.analyzeImage('unknown_object.png');
      
      // Default fallback should be a clean vegan organic salad
      expect(result.category).toBe('food');
      expect(result.detectedSubCategory).toBe('vegan');
      expect(result.carbonFootprint).toBe(1.5); // vegan coefficient
      expect(result.sustainabilityScore).toBe(9);
    });

    it('should process API response successfully when fetch succeeds', async () => {
      const mockResultJSON = JSON.stringify({
        itemName: "Soy Milk Carton",
        category: "food",
        detectedSubCategory: "vegan",
        sustainabilityScore: 8,
        alternatives: [
          { name: "Water", subCategory: "vegan", description: "Bypasses packaging packaging entirely" }
        ],
        generalTips: ["Soy milk is green", "Prefer cartons"]
      });

      const fetchSpy = vi.spyOn(globalThis, 'fetch').mockResolvedValue({
        json: () => Promise.resolve({
          choices: [{
            message: { content: mockResultJSON }
          }]
        })
      } as Response);

      const result = await mockGeminiAI.analyzeImage('soy_milk.jpg');
      
      expect(result.itemName).toBe('Soy Milk Carton');
      expect(result.category).toBe('food');
      expect(result.detectedSubCategory).toBe('vegan');
      expect(result.carbonFootprint).toBe(1.5); // vegan coefficient
      expect(result.sustainabilityScore).toBe(8);
      expect(result.alternatives[0].name).toBe('Water');
      expect(fetchSpy).toHaveBeenCalled();
    });
  });

  describe('chatCoachResponse - Sustainability Advisor', () => {
    const dummyLogs = [
      { id: 'log_1', date: '2026-06-10', category: 'travel' as const, subCategory: 'car', description: 'Car ride', amount: 100, unit: 'km', co2Emissions: 19.2 }, // 19.2 kg
      { id: 'log_2', date: '2026-06-11', category: 'energy' as const, subCategory: 'grid', description: 'Energy', amount: 50, unit: 'kWh', co2Emissions: 41.0 }  // 41.0 kg
    ];

    it('should generate structured advice fallback when offline', async () => {
      vi.spyOn(globalThis, 'fetch').mockRejectedValue(new Error('Network offline'));

      const result = await mockGeminiAI.chatCoachResponse('Give me a habit report', dummyLogs);
      
      expect(result).toContain('### Personal Habit Carbon Analysis');
      expect(result).toContain('Total Logged Footprint');
      expect(result).toContain('60.2 kg CO₂'); // 19.2 + 41.0
      expect(result).toContain('Travel');
      expect(result).toContain('Electricity');
    });

    it('should suggest specific energy guide for electricity prompts', async () => {
      vi.spyOn(globalThis, 'fetch').mockRejectedValue(new Error('Network offline'));

      const result = await mockGeminiAI.chatCoachResponse('How do I reduce my electricity usage?', dummyLogs);
      
      expect(result).toContain('### Household Energy Conservation Guide');
      expect(result).toContain('0.82 kg CO₂ per kWh');
      expect(result).toContain('AC Management');
    });

    it('should suggest recipes for food prompts', async () => {
      vi.spyOn(globalThis, 'fetch').mockRejectedValue(new Error('Network offline'));

      const result = await mockGeminiAI.chatCoachResponse('Give me a recipe or food tips', dummyLogs);
      
      expect(result).toContain('### Climate-Positive Culinary Tips');
      expect(result).toContain('Beef');
      expect(result).toContain('27.0 kg CO₂');
      expect(result).toContain('Vegan');
      expect(result).toContain('1.5 kg CO₂');
    });

    it('should handle empty input queries gracefully by offering a general overview', async () => {
      vi.spyOn(globalThis, 'fetch').mockRejectedValue(new Error('Network offline'));

      const result = await mockGeminiAI.chatCoachResponse('', dummyLogs);
      
      expect(result).toContain('### EcoLens Sustainability Guide');
      expect(result).toContain('60.2 kg CO₂');
    });

    it('should return API response content when query fetch succeeds', async () => {
      const customResponseText = "### Customized advice from AI coach";
      const fetchSpy = vi.spyOn(globalThis, 'fetch').mockResolvedValue({
        json: () => Promise.resolve({
          choices: [{
            message: { content: customResponseText }
          }]
        })
      } as Response);

      const result = await mockGeminiAI.chatCoachResponse('Tell me what to do', []);
      expect(result).toBe(customResponseText);
      expect(fetchSpy).toHaveBeenCalled();
    });
  });
});
