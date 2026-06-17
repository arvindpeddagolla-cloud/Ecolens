// EcoLens AI Mock Services - Version 2.0 (Formula & Scientific Calculations)
import { auth, db } from './firebase';
import { doc, setDoc, deleteDoc } from 'firebase/firestore';

export interface UserProfile {
  uid: string;
  email: string;
  displayName: string;
  photoURL: string;
  greenPoints: number;
  xp: number;
  level: number;
  badges: string[]; // Badge ids
  isOnboarded: boolean;
  onboardingData?: {
    transportMode: 'car' | 'bus' | 'train' | 'bike' | 'walking';
    electricityUsage: number; // kWh
    foodPreference: 'vegetarian' | 'non-vegetarian' | 'vegan';
    shoppingFrequency: 'low' | 'medium' | 'high';
  };
}

export interface EmissionsLog {
  id: string;
  date: string;
  category: 'travel' | 'energy' | 'food' | 'shopping';
  description: string;
  amount: number; // kilometers, kWh, meals, items
  unit: string;
  co2Emissions: number; // in kg CO2 (MUST be calculated via formula, not AI)
  subCategory?: string; // e.g. beef, clothing, car
}

export interface Challenge {
  id: string;
  title: string;
  description: string;
  points: number;
  xp: number;
  completed: boolean;
  category: 'daily' | 'weekly';
  progress: number; // 0 to 100
  target: string;
}

export interface Badge {
  id: string;
  name: string;
  description: string;
  icon: string;
  level: 'Eco Beginner' | 'Green Warrior' | 'Climate Champion' | 'Sustainability Master';
  xpRequired: number;
}

export interface CameraAnalysisResult {
  itemName: string;
  category: 'food' | 'energy' | 'shopping';
  detectedSubCategory: string; // e.g. beef, plastic, electronics
  carbonFootprint: number; // in kg CO2
  sustainabilityScore: number; // 1-10
  alternatives: {
    name: string;
    subCategory: string;
    carbonFootprint: number;
    savingsPercent: number;
    description: string;
  }[];
  generalTips: string[];
}

export interface RouteOption {
  mode: 'car' | 'bus' | 'train' | 'motorcycle' | 'bike' | 'walking';
  emissions: number; // kg CO2
  savings: number; // kg CO2 saved vs car
  cost: string;
  duration: string;
}

export interface LeaderboardEntry {
  rank: number;
  name: string;
  avatar: string;
  score: number;
  type: 'global' | 'city' | 'college';
  entity: string;
}

export interface NotificationAlert {
  id: string;
  type: 'alert' | 'tip';
  message: string;
  date: string;
}

// Constant Badge Definitions
export const ALL_BADGES: Badge[] = [
  { id: 'badge_1', name: '🌱 Eco Beginner', description: 'Unlock by completing your first carbon log.', icon: '🌱', level: 'Eco Beginner', xpRequired: 50 },
  { id: 'badge_2', name: '🌿 Green Warrior', description: 'Earn 500 XP through daily green activities.', icon: '🌿', level: 'Green Warrior', xpRequired: 500 },
  { id: 'badge_3', name: '🌍 Climate Champion', description: 'Reduce carbon footprint by 20% or reach 1500 XP.', icon: '🌍', level: 'Climate Champion', xpRequired: 1500 },
  { id: 'badge_4', name: '🏆 Sustainability Master', description: 'Master all platforms features and hit 3000 XP.', icon: '🏆', level: 'Sustainability Master', xpRequired: 3000 },
];

// Calculation Factors
export const TRAVEL_FACTORS = {
  car: 0.192,
  bus: 0.105,
  train: 0.041,
  motorcycle: 0.103,
  bike: 0,
  walking: 0,
};

export const ELECTRICITY_FACTOR = 0.82; // Carbon = kWh * 0.82

export const FOOD_FACTORS = {
  beef: 27,
  lamb: 24,
  chicken: 6.9,
  fish: 5,
  egg: 4.8,
  vegetarian: 2,
  vegan: 1.5,
};

export const SHOPPING_FACTORS = {
  plastic: 6,
  clothing: 15,
  electronics: 75,
  reusable: 1.5,
  paper: 2,
};

const DEFAULT_USER: UserProfile = {
  uid: 'user_ecolens_2.0',
  email: 'eco.champion@gmail.com',
  displayName: 'Alex Rivers',
  photoURL: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=150&q=80',
  greenPoints: 240,
  xp: 120,
  level: 1,
  badges: ['badge_1'],
  isOnboarded: false,
};

const DEFAULT_LOGS: EmissionsLog[] = [
  { id: 'log_1', date: '2026-06-10', category: 'travel', subCategory: 'car', description: 'Commute to Work', amount: 25, unit: 'km', co2Emissions: 4.8 }, // 25 * 0.192 = 4.8
  { id: 'log_2', date: '2026-06-11', category: 'energy', subCategory: 'grid', description: 'Weekly AC & Lighting', amount: 80, unit: 'kWh', co2Emissions: 65.6 }, // 80 * 0.82 = 65.6
  { id: 'log_4', date: '2026-06-13', category: 'shopping', subCategory: 'plastic', description: 'Single-use Water Bottle Pack', amount: 2, unit: 'items', co2Emissions: 12.0 }, // 2 * 6 = 12
  { id: 'log_5', date: '2026-06-14', category: 'travel', subCategory: 'train', description: 'Weekend Train Ride', amount: 50, unit: 'km', co2Emissions: 2.1 }, // 50 * 0.041 = 2.05 ~ 2.1
];

const DEFAULT_CHALLENGES: Challenge[] = [
  { id: 'ch_1', title: 'Pedal Power', description: 'Walk or bike instead of driving for any trip today.', points: 50, xp: 100, completed: false, category: 'daily', progress: 0, target: '1 trip' },
  { id: 'ch_2', title: 'Plant Powered', description: 'Log a completely plant-based (vegan) meal today.', points: 30, xp: 60, completed: false, category: 'daily', progress: 0, target: '1 meal' },
  { id: 'ch_3', title: 'Solar Savings', description: 'Keep daily electricity usage below 6 kWh.', points: 40, xp: 80, completed: false, category: 'daily', progress: 0, target: 'Under 6kWh' },
  { id: 'ch_4', title: 'Green Commuter', description: 'Save a total of 15kg CO2 this week using trains.', points: 150, xp: 300, completed: false, category: 'weekly', progress: 30, target: '15kg CO2' },
  { id: 'ch_5', title: 'Zero waste advocate', description: 'Log 3 Reusable shopping choices instead of plastics.', points: 120, xp: 250, completed: false, category: 'weekly', progress: 66, target: '3 items' },
];

const MOCK_LEADERBOARDS: LeaderboardEntry[] = [
  { rank: 1, name: 'Elena Rostova', avatar: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&w=100&q=80', score: 3820, type: 'global', entity: 'Global' },
  { rank: 2, name: 'Kenji Sato', avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=100&q=80', score: 3450, type: 'global', entity: 'Global' },
  { rank: 3, name: 'Sarah Jenkins', avatar: 'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?auto=format&fit=crop&w=100&q=80', score: 3120, type: 'global', entity: 'Global' },
  { rank: 4, name: 'Alex Rivers (You)', avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=100&q=80', score: 240, type: 'global', entity: 'Global' }
];

export const getStoredData = <T>(key: string, defaultValue: T): T => {
  const data = localStorage.getItem(key);
  return data ? JSON.parse(data) : defaultValue;
};

export const setStoredData = <T>(key: string, value: T): void => {
  localStorage.setItem(key, JSON.stringify(value));
};

// Formula calculator helper
export const calculateCarbon = (category: string, subCategory: string, amount: number): number => {
  let co2 = 0;
  
  switch (category) {
    case 'travel': {
      const travelFactor = TRAVEL_FACTORS[subCategory as keyof typeof TRAVEL_FACTORS] || 0;
      co2 = amount * travelFactor;
      break;
    }
    case 'energy':
      co2 = amount * ELECTRICITY_FACTOR;
      break;
    case 'food': {
      const foodFactor = FOOD_FACTORS[subCategory as keyof typeof FOOD_FACTORS] || 2;
      co2 = amount * foodFactor;
      break;
    }
    case 'shopping': {
      const shopFactor = SHOPPING_FACTORS[subCategory as keyof typeof SHOPPING_FACTORS] || 4;
      co2 = amount * shopFactor;
      break;
    }
  }
  
  return Math.round(co2 * 10) / 10;
};

export const mockAuth = {
  getCurrentUser: (): UserProfile => {
    return getStoredData('ecolens_user', DEFAULT_USER);
  },
  updateUserProfile: (profile: Partial<UserProfile>): UserProfile => {
    const user = getStoredData('ecolens_user', DEFAULT_USER);
    const updated = { ...user, ...profile };
    setStoredData('ecolens_user', updated);
    
    if (profile.xp !== undefined) {
      mockAuth.checkAndUnlockBadges(updated);
    }

    // Sync profile to Firestore
    const firebaseUser = auth.currentUser;
    if (firebaseUser) {
      const userRef = doc(db, 'users', firebaseUser.uid);
      setDoc(userRef, updated, { merge: true }).catch(err => console.error("Firestore user update error:", err));
    }

    return updated;
  },
  checkAndUnlockBadges: (user: UserProfile): void => {
    const currentBadges = [...user.badges];
    const newlyUnlocked: string[] = [];
    
    ALL_BADGES.forEach(badge => {
      if (!currentBadges.includes(badge.id) && user.xp >= badge.xpRequired) {
        currentBadges.push(badge.id);
        newlyUnlocked.push(badge.name);
      }
    });
    
    if (newlyUnlocked.length > 0) {
      const updated = { ...user, badges: currentBadges };
      setStoredData('ecolens_user', updated);
      
      const unlocks = getStoredData<string[]>('ecolens_new_unlocks', []);
      setStoredData('ecolens_new_unlocks', [...unlocks, ...newlyUnlocked]);
    }
  },
  logout: (): void => {
    localStorage.removeItem('ecolens_user');
    localStorage.removeItem('ecolens_logs');
    localStorage.removeItem('ecolens_challenges');
    localStorage.removeItem('ecolens_notifications');
  }
};

export const mockFirestore = {
  getLogs: (): EmissionsLog[] => {
    return getStoredData('ecolens_logs', DEFAULT_LOGS);
  },
  addLog: (
    category: 'travel' | 'energy' | 'food' | 'shopping',
    description: string,
    amount: number,
    unit: string,
    subCategory?: string
  ): EmissionsLog => {
    const logs = getStoredData('ecolens_logs', DEFAULT_LOGS);
    
    // Auto detect subCategory if not passed
    let finalSub = subCategory || 'car';
    if (!subCategory) {
      if (category === 'travel') finalSub = 'car';
      else if (category === 'energy') finalSub = 'grid';
      else if (category === 'food') {
        if (description.toLowerCase().includes('beef')) finalSub = 'beef';
        else if (description.toLowerCase().includes('chicken')) finalSub = 'chicken';
        else if (description.toLowerCase().includes('vegan')) finalSub = 'vegan';
        else finalSub = 'vegetarian';
      } else {
        if (description.toLowerCase().includes('plastic')) finalSub = 'plastic';
        else if (description.toLowerCase().includes('shirt') || description.toLowerCase().includes('clothing')) finalSub = 'clothing';
        else if (description.toLowerCase().includes('electronic') || description.toLowerCase().includes('laptop')) finalSub = 'electronics';
        else if (description.toLowerCase().includes('bottle')) finalSub = 'reusable';
        else finalSub = 'paper';
      }
    }

    // FORMULA-BASED CARBON CALCULATION ONLY (NO AI GENERATION)
    const co2Emissions = calculateCarbon(category, finalSub, amount);
    
    const newLog: EmissionsLog = {
      id: `log_${Date.now()}`,
      date: new Date().toISOString().split('T')[0],
      category,
      subCategory: finalSub,
      description,
      amount,
      unit,
      co2Emissions
    };
    
    const updatedLogs = [newLog, ...logs];
    setStoredData('ecolens_logs', updatedLogs);

    // Sync log to Firestore
    const firebaseUser = auth.currentUser;
    if (firebaseUser) {
      const logRef = doc(db, 'users', firebaseUser.uid, 'logs', newLog.id);
      setDoc(logRef, newLog).catch(err => console.error("Firestore addLog error:", err));
    }
    
    // Award XP
    const user = mockAuth.getCurrentUser();
    mockAuth.updateUserProfile({
      xp: user.xp + 30,
      greenPoints: user.greenPoints + 20
    });

    // Run notifications engine check
    mockFirestore.checkNotifications(updatedLogs);
    
    return newLog;
  },
  deleteLog: (id: string): EmissionsLog[] => {
    const logs = getStoredData('ecolens_logs', DEFAULT_LOGS);
    const filtered = logs.filter(log => log.id !== id);
    setStoredData('ecolens_logs', filtered);

    // Sync log deletion to Firestore
    const firebaseUser = auth.currentUser;
    if (firebaseUser) {
      const logRef = doc(db, 'users', firebaseUser.uid, 'logs', id);
      deleteDoc(logRef).catch(err => console.error("Firestore deleteLog error:", err));
    }

    mockFirestore.checkNotifications(filtered);
    return filtered;
  },
  getChallenges: (): Challenge[] => {
    return getStoredData('ecolens_challenges', DEFAULT_CHALLENGES);
  },
  completeChallenge: (id: string): { challenge: Challenge; user: UserProfile } => {
    const challenges = getStoredData('ecolens_challenges', DEFAULT_CHALLENGES);
    const user = mockAuth.getCurrentUser();
    
    let targetCh!: Challenge;
    const updated = challenges.map(ch => {
      if (ch.id === id) {
        targetCh = { ...ch, completed: true, progress: 100 };
        return targetCh;
      }
      return ch;
    });
    
    setStoredData('ecolens_challenges', updated);

    // Sync challenge to Firestore
    const firebaseUser = auth.currentUser;
    if (firebaseUser) {
      const chRef = doc(db, 'users', firebaseUser.uid, 'challenges', id);
      setDoc(chRef, targetCh).catch(err => console.error("Firestore challenge update error:", err));
    }
    
    const updatedUser = mockAuth.updateUserProfile({
      greenPoints: user.greenPoints + targetCh.points,
      xp: user.xp + targetCh.xp,
    });
    
    return { challenge: targetCh, user: updatedUser };
  },
  getLeaderboard: (type: 'global' | 'city' | 'college'): LeaderboardEntry[] => {
    const user = mockAuth.getCurrentUser();
    const list = [...MOCK_LEADERBOARDS];
    return list.map(item => {
      if (item.name.includes('(You)')) {
        return { ...item, score: user.greenPoints };
      }
      return item;
    }).filter(item => item.type === type).sort((a, b) => b.score - a.score);
  },

  // 4. AI Notification Engine
  getNotifications: (): NotificationAlert[] => {
    return getStoredData<NotificationAlert[]>('ecolens_notifications', []);
  },
  checkNotifications: (currentLogs: EmissionsLog[]): void => {
    const total = currentLogs.reduce((acc, curr) => acc + curr.co2Emissions, 0);
    if (total <= 0) return;

    const catSums = currentLogs.reduce(
      (acc, curr) => {
        acc[curr.category] += curr.co2Emissions;
        return acc;
      },
      { travel: 0, energy: 0, food: 0, shopping: 0 }
    );

    const alerts: NotificationAlert[] = [];
    const dateStr = new Date().toLocaleDateString();

    // Travel > 40%
    if ((catSums.travel / total) > 0.40) {
      alerts.push({
        id: 'notif_travel',
        type: 'alert',
        message: "Travel is your largest emission source. Consider public transport.",
        date: dateStr
      });
    }
    // Electricity > 50%
    if ((catSums.energy / total) > 0.50) {
      alerts.push({
        id: 'notif_energy',
        type: 'alert',
        message: "Electricity usage is high. Reducing AC usage can significantly lower emissions.",
        date: dateStr
      });
    }
    // Food High (> 35% or beef logs)
    const hasBeef = currentLogs.some(l => l.category === 'food' && l.subCategory === 'beef');
    if ((catSums.food / total) > 0.35 || hasBeef) {
      alerts.push({
        id: 'notif_food',
        type: 'tip',
        message: "Reducing red meat consumption can lower your footprint.",
        date: dateStr
      });
    }
    // Shopping High (> 35% or plastic logs)
    const hasPlastic = currentLogs.some(l => l.category === 'shopping' && l.subCategory === 'plastic');
    if ((catSums.shopping / total) > 0.35 || hasPlastic) {
      alerts.push({
        id: 'notif_shop',
        type: 'tip',
        message: "Consider reusable alternatives to reduce waste.",
        date: dateStr
      });
    }

    setStoredData('ecolens_notifications', alerts);
  }
};

interface GeminiContentItem {
  type: string;
  text?: string;
  image_url?: {
    url: string;
  };
}

interface ParsedAlternative {
  name: string;
  subCategory: string;
  description: string;
}

export const mockGeminiAI = {
  // Vision integration: detects category and applies formulas
  analyzeImage: async (fileName: string, imgDataUrl?: string): Promise<CameraAnalysisResult> => {
    const OPENROUTER_API_KEY = import.meta.env.VITE_OPENROUTER_API_KEY || '';
    
    try {
      const contentArray: GeminiContentItem[] = [
        {
          type: "text",
          text: `You are the EcoLens AI computer vision analyzer. Analyze this image of an item, product, meal, or document.
You must categorize it into one of these three categories: 'food', 'energy', or 'shopping'.
Assign it to a matching subCategory based strictly on these rules:
- Category 'food': subCategory MUST be 'beef', 'lamb', 'chicken', 'fish', 'egg', 'vegetarian', or 'vegan'.
- Category 'energy': subCategory MUST be 'grid'.
- Category 'shopping': subCategory MUST be 'plastic', 'clothing', 'electronics', 'reusable', or 'paper'.

Output your analysis strictly in raw JSON format matching this structure:
{
  "itemName": "Specific identified name of the item",
  "category": "food" | "energy" | "shopping",
  "detectedSubCategory": "beef" | "lamb" | "chicken" | "fish" | "egg" | "vegetarian" | "vegan" | "grid" | "plastic" | "clothing" | "electronics" | "reusable" | "paper",
  "sustainabilityScore": 1 to 10 score (1 is worst, 10 is best),
  "alternatives": [
    {
      "name": "Greener alternative item name",
      "subCategory": "matching subcategory key from above",
      "description": "Short explanation of why this alternative is greener"
    }
  ],
  "generalTips": [
    "Insightful tip 1 about this item category's carbon impact",
    "Insightful tip 2 about this item category's carbon impact"
  ]
}

Return ONLY this JSON object. Do not wrap it in markdown code blocks like \`\`\`json.`
        }
      ];

      if (imgDataUrl) {
        contentArray.push({
          type: "image_url",
          image_url: {
            url: imgDataUrl
          }
        });
      } else {
        const firstItem = contentArray[0];
        if (firstItem && firstItem.text) {
          firstItem.text += `\n(Since no image payload was attached, perform analysis based on this file name description: "${fileName}")`;
        }
      }

      const response = await fetch('https://openrouter.ai/api/v1/chat/completions', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${OPENROUTER_API_KEY}`,
          'Content-Type': 'application/json',
          'HTTP-Referer': 'http://localhost:4173',
          'X-Title': 'EcoLens AI'
        },
        body: JSON.stringify({
          model: 'google/gemini-2.5-flash',
          max_tokens: 1500,
          messages: [
            { role: 'user', content: contentArray }
          ]
        })
      });

      const data = await response.json();
      if (!data.choices || !data.choices[0] || !data.choices[0].message) {
        throw new Error('Invalid OpenRouter response structure');
      }

      let textResponse = data.choices[0].message.content;
      textResponse = textResponse.replace(/```json/g, '').replace(/```/g, '').trim();
      
      const parsed = JSON.parse(textResponse);
      
      const factorMap = {
        beef: FOOD_FACTORS.beef,
        lamb: FOOD_FACTORS.lamb,
        chicken: FOOD_FACTORS.chicken,
        fish: FOOD_FACTORS.fish,
        egg: FOOD_FACTORS.egg,
        vegetarian: FOOD_FACTORS.vegetarian,
        vegan: FOOD_FACTORS.vegan,
        grid: ELECTRICITY_FACTOR * 150, // default base kwh for single bill
        plastic: SHOPPING_FACTORS.plastic,
        clothing: SHOPPING_FACTORS.clothing,
        electronics: SHOPPING_FACTORS.electronics,
        reusable: SHOPPING_FACTORS.reusable,
        paper: SHOPPING_FACTORS.paper
      };

      const detectedSub = parsed.detectedSubCategory as keyof typeof factorMap;
      const baseFootprint = factorMap[detectedSub] || 5;

      const alternatives = parsed.alternatives.map((alt: ParsedAlternative) => {
        const altSub = alt.subCategory as keyof typeof factorMap;
        const altFootprint = factorMap[altSub] || 2;
        const savingsPercent = Math.max(0, Math.round(((baseFootprint - altFootprint) / baseFootprint) * 100));
        return {
          name: alt.name,
          subCategory: alt.subCategory,
          carbonFootprint: altFootprint,
          savingsPercent,
          description: alt.description
        };
      });

      return {
        itemName: parsed.itemName,
        category: parsed.category,
        detectedSubCategory: parsed.detectedSubCategory,
        carbonFootprint: baseFootprint,
        sustainabilityScore: parsed.sustainabilityScore,
        alternatives,
        generalTips: parsed.generalTips
      };

    } catch (err) {
      console.error('OpenRouter vision API failed (fallback active):', err instanceof Error ? err.message : String(err));
      // Fallback:
      await new Promise(resolve => setTimeout(resolve, 1500));
      const nameLower = fileName.toLowerCase();
      
      if (nameLower.includes('burger') || nameLower.includes('beef') || nameLower.includes('meat')) {
        const factor = FOOD_FACTORS.beef;
        return {
          itemName: 'Beef Burger Patty',
          category: 'food',
          detectedSubCategory: 'beef',
          carbonFootprint: factor,
          sustainabilityScore: 2,
          alternatives: [
            { name: 'Veggie Chickpea Patty', subCategory: 'vegetarian', carbonFootprint: FOOD_FACTORS.vegetarian, savingsPercent: Math.round(((factor - FOOD_FACTORS.vegetarian) / factor) * 100), description: 'Soy/legume replacement cuts agricultural footprint.' },
            { name: 'Vegan Buddha Salad', subCategory: 'vegan', carbonFootprint: FOOD_FACTORS.vegan, savingsPercent: Math.round(((factor - FOOD_FACTORS.vegan) / factor) * 100), description: 'Plant bowl yields 94%+ lower carbon.' }
          ],
          generalTips: [
            'Red meat cultivation generates massive methane release.',
            'Swapping red meat for poultry or plant recipes scales down environmental stress.'
          ]
        };
      }
      
      if (nameLower.includes('bill') || nameLower.includes('electric') || nameLower.includes('utility')) {
        const co2 = 150 * ELECTRICITY_FACTOR;
        return {
          itemName: 'Utility Electricity Bill (150 kWh)',
          category: 'energy',
          detectedSubCategory: 'grid',
          carbonFootprint: co2,
          sustainabilityScore: 4,
          alternatives: [
            { name: 'Smart Solar Battery Offset', subCategory: 'energy', carbonFootprint: co2 * 0.15, savingsPercent: 85, description: 'Micro-solar array offsets peak grid load.' }
          ],
          generalTips: [
            'HVAC heating and cooling makes up 52% of utility drafts.',
            'Switching off sleep-mode console blocks stops phantom drain.'
          ]
        };
      }

      if (nameLower.includes('bottle') || nameLower.includes('water') || nameLower.includes('plastic')) {
        const factor = SHOPPING_FACTORS.plastic;
        const reusableFactor = SHOPPING_FACTORS.reusable;
        return {
          itemName: 'PET Plastic Water Bottle',
          category: 'shopping',
          detectedSubCategory: 'plastic',
          carbonFootprint: factor,
          sustainabilityScore: 3,
          alternatives: [
            { name: 'Stainless Reusable Flask', subCategory: 'reusable', carbonFootprint: reusableFactor, savingsPercent: Math.round(((factor - reusableFactor) / factor) * 100), description: 'Stainless steel eliminates plastic bottling cycles.' }
          ],
          generalTips: [
            'It takes 3L of water to structure 1L of PET bottle plastic.',
            'Plastics breakdown takes 450+ years, polluting local marine biosystems.'
          ]
        };
      }

      const factor = FOOD_FACTORS.vegan;
      return {
        itemName: 'Organic Plant Salad Meal',
        category: 'food',
        detectedSubCategory: 'vegan',
        carbonFootprint: factor,
        sustainabilityScore: 9,
        alternatives: [
          { name: 'Home-grown organic veggies', subCategory: 'vegan', carbonFootprint: 0.2, savingsPercent: 86, description: 'Bypasses logistics transport emissions entirely.' }
        ],
        generalTips: [
          'Vegan menu cards demand 18x less land area than beef menus.',
          'Locally sourced organic products bypass cold chain logistics.'
        ]
      };
    }
  },

  // ChatGPT Sustainability Advisor responses
  chatCoachResponse: async (text: string, currentLogs: EmissionsLog[]): Promise<string> => {
    const OPENROUTER_API_KEY = import.meta.env.VITE_OPENROUTER_API_KEY || '';
    
    // Context-aware variables
    const total = currentLogs.reduce((acc, curr) => acc + curr.co2Emissions, 0);
    const catSums = currentLogs.reduce(
      (acc, curr) => {
        acc[curr.category] += curr.co2Emissions;
        return acc;
      },
      { travel: 0, energy: 0, food: 0, shopping: 0 }
    );
    
    const travelPct = total > 0 ? Math.round((catSums.travel / total) * 100) : 0;
    const energyPct = total > 0 ? Math.round((catSums.energy / total) * 100) : 0;
    const foodPct = total > 0 ? Math.round((catSums.food / total) * 100) : 0;
    const shopPct = total > 0 ? Math.round((catSums.shopping / total) * 100) : 0;

    try {
      const systemPrompt = `You are the EcoLens AI Sustainability Coach, a helpful, startup-grade eco-advising expert.
Analyze the user's carbon profile, logs, and offer scientific advice.
Current Carbon Profile:
*   Total Logged Footprint: ${total.toFixed(1)} kg CO₂.
*   Emissions Breakdown: Travel: ${travelPct}%, Electricity: ${energyPct}%, Food: ${foodPct}%, Shopping: ${shopPct}%.

Emissions Formula Coefficients:
- Travel: Car = 0.192 kg CO₂/km, Bus = 0.105, Train = 0.041, Motorcycle = 0.103, Bike/Walking = 0.
- Electricity = 0.82 kg CO₂/kWh.
- Food: Beef = 27 kg CO₂/meal, Lamb = 24, Chicken = 6.9, Fish = 5, Egg = 4.8, Vegetarian = 2, Vegan = 1.5.
- Shopping: Plastic = 6 kg CO₂/item, Clothing = 15, Electronics = 75, Reusable = 1.5, Paper = 2.

Provide actionable tips, comparisons, and custom guides. All advice must align with our formula coefficients. Do NOT output raw carbon calculation overrides. Write in clear, structured Markdown.`;

      const response = await fetch('https://openrouter.ai/api/v1/chat/completions', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${OPENROUTER_API_KEY}`,
          'Content-Type': 'application/json',
          'HTTP-Referer': 'http://localhost:4173',
          'X-Title': 'EcoLens AI'
        },
        body: JSON.stringify({
          model: 'google/gemini-2.5-flash',
          max_tokens: 1500,
          messages: [
            { role: 'system', content: systemPrompt },
            { role: 'user', content: text }
          ]
        })
      });

      const data = await response.json();
      if (data.choices && data.choices[0] && data.choices[0].message) {
        return data.choices[0].message.content;
      }
      throw new Error('Invalid OpenRouter response');
      
    } catch (err) {
      console.error('OpenRouter chat API failed (fallback active):', err instanceof Error ? err.message : String(err));
      // Offline fallback:
      await new Promise(resolve => setTimeout(resolve, 1000));
      const lowerText = text.toLowerCase();

      if (lowerText.includes('habit') || lowerText.includes('analyze') || lowerText.includes('report') || lowerText.includes('my data')) {
        return `### Personal Habit Carbon Analysis 📊
        
Analyzing your logged carbon activity:
*   **Total Logged Footprint**: ${total.toFixed(1)} kg CO₂.
*   **Emissions Breakdown**: Travel: **${travelPct}%**, Electricity: **${energyPct}%**, Food: **${foodPct}%**, Shopping: **${shopPct}%**.

*Coach Recommendation*: ${
          travelPct > 40 
            ? `Travel contributes **${travelPct}%** of your emissions. Reducing private car trips and choosing standard rails or buses twice per week could decrease your footprint by roughly 25%.` 
            : energyPct > 40
              ? `Electricity stands at **${energyPct}%** of your draft load. Turning off AC units when rooms are vacant and utilizing smart strips will reduce electricity bills significantly.`
              : `Your emissions are fairly balanced. Try swapping beef burger logs with chicken or vegan salad alternatives to target Food footprint drops.`
        }`;
      }

      if (lowerText.includes('electricity') || lowerText.includes('bill') || lowerText.includes('energy') || lowerText.includes('ac')) {
        return `### Household Energy Conservation Guide ⚡
        
Your electricity factor calculates emissions at **0.82 kg CO₂ per kWh**. Reduce your bill and environmental load through these actions:
1.  **AC Management**: Keeping your home AC at 25°C instead of 21°C saves approximately 15% on cooling energy.
2.  **LED Conversions**: Swapping standard incandescent bulbs for LEDs cuts energy draw by 75%.
3.  **Vampire Load Mitigation**: Unplug unused chargers and standby electronics to shave up to 10% off your bill.`;
      }

      if (lowerText.includes('recipe') || lowerText.includes('food') || lowerText.includes('beef') || lowerText.includes('vegan')) {
        return `### Climate-Positive Culinary Tips 🥗
        
Under our platform factors, food emissions span a wide range:
*   **Beef**: 27.0 kg CO₂ per meal (Highest)
*   **Chicken**: 6.9 kg CO₂ per meal
*   **Vegetarian**: 2.0 kg CO₂ per meal
*   **Vegan**: 1.5 kg CO₂ per meal

*Quick recipe idea*: Try a chickpea and spinach Buddha bowl (Vegan) which generates only **1.5 kg CO₂**, compared to **27.0 kg CO₂** for a beef steak. Swapping just two beef meals a week saves over 2,600 kg CO₂ annually!`;
      }

      return `### EcoLens Sustainability Guide 🌿
      
I have evaluated your carbon profile:
*   **Current Carbon Footprint**: ${total.toFixed(1)} kg CO₂.
*   **Primary Source**: ${travelPct >= Math.max(energyPct, foodPct, shopPct) ? 'Travel Commuting' : energyPct >= Math.max(travelPct, foodPct, shopPct) ? 'Electricity Use' : 'Dietary Habits'}.

You can significantly lower this footprint by choosing train commutes over driving (saves 79% emissions per km), converting household appliances to Energy Star metrics, or adopting plant-based lunch meals. 

What specific action plan would you like to build today?`;
    }
  }
};
