import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import confetti from 'canvas-confetti';
import { 
  Navbar 
} from './components/Navbar';
import { 
  Hero 
} from './components/Hero';
import { 
  Features 
} from './components/Features';
import { 
  DashboardTab 
} from './components/DashboardTab';
import { 
  GreenRouteTab 
} from './components/GreenRouteTab';
import { 
  CarbonCameraTab 
} from './components/CarbonCameraTab';
import { 
  AICoachTab 
} from './components/AICoachTab';
import { 
  EarthSimulatorTab 
} from './components/EarthSimulatorTab';
import { 
  GamificationTab 
} from './components/GamificationTab';
import { 
  LeaderboardTab 
} from './components/LeaderboardTab';
import type { 
  UserProfile, 
  EmissionsLog, 
  Challenge,
  NotificationAlert
} from './services/mockServices';
import { 
  mockAuth, 
  mockFirestore, 
  getStoredData, 
  setStoredData 
} from './services/mockServices';
import { auth, db, googleProvider } from './services/firebase';
import { 
  signInWithEmailAndPassword, 
  createUserWithEmailAndPassword, 
  signInWithPopup, 
  signOut, 
  onAuthStateChanged 
} from 'firebase/auth';
import { doc, setDoc, getDoc, onSnapshot, collection } from 'firebase/firestore';
import { Sparkles, X, ChevronRight, Mail, Lock, User as UserIcon, LogIn, ChevronLeft, AlertTriangle } from 'lucide-react';

export const App: React.FC = () => {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [activeTab, setActiveTab] = useState('landing');
  const activeTabRef = useRef(activeTab);

  // Keep ref in sync
  useEffect(() => {
    activeTabRef.current = activeTab;
  }, [activeTab]);

  const [user, setUser] = useState<UserProfile>(mockAuth.getCurrentUser());
  const [logs, setLogs] = useState<EmissionsLog[]>([]);
  const [challenges, setChallenges] = useState<Challenge[]>([]);
  const [notifications, setNotifications] = useState<NotificationAlert[]>([]);
  const [unlockedBadgeName, setUnlockedBadgeName] = useState<string | null>(null);

  // Authentication UI state
  const [showAuthModal, setShowAuthModal] = useState(false);
  const [authMode, setAuthMode] = useState<'login' | 'signup'>('login');
  const [emailInput, setEmailInput] = useState('');
  const [passwordInput, setPasswordInput] = useState('');
  const [nameInput, setNameInput] = useState('');
  const [authError, setAuthError] = useState<string | null>(null);

  // Onboarding survey state
  const [onboardingStep, setOnboardingStep] = useState(1);
  const [onboardTransport, setOnboardTransport] = useState<'car' | 'bus' | 'train' | 'bike' | 'walking'>('car');
  const [onboardKwh, setOnboardKwh] = useState<number>(120);
  const [onboardFood, setOnboardFood] = useState<'vegetarian' | 'non-vegetarian' | 'vegan'>('non-vegetarian');
  const [onboardShop, setOnboardShop] = useState<'low' | 'medium' | 'high'>('medium');

  // Sync state with live Firebase Auth and Firestore on load
  useEffect(() => {
    const unsubscribeAuth = onAuthStateChanged(auth, async (firebaseUser) => {
      if (firebaseUser) {
        setIsLoggedIn(true);

        // Instantly load from cache to avoid flashing the landing page
        const cachedUser = localStorage.getItem('ecolens_user');
        if (cachedUser) {
          try {
            const parsed = JSON.parse(cachedUser) as UserProfile;
            setUser(parsed);
            if (activeTabRef.current === 'landing') {
              setActiveTab(parsed.isOnboarded ? 'dashboard' : 'onboarding');
            }
          } catch (e) {
            console.error("Error parsing cached user:", e);
          }
        } else {
          if (activeTabRef.current === 'landing') {
            setActiveTab('onboarding');
          }
        }

        // Subscribe to User profile changes in Firestore
        const userDocRef = doc(db, 'users', firebaseUser.uid);
        const unsubscribeUser = onSnapshot(userDocRef, (docSnap) => {
          if (docSnap.exists()) {
            const data = docSnap.data() as UserProfile;
            setUser(data);
            localStorage.setItem('ecolens_user', JSON.stringify(data));
            if (activeTabRef.current === 'landing') {
              setActiveTab(data.isOnboarded ? 'dashboard' : 'onboarding');
            }
          } else {
            // Document doesn't exist yet (e.g. they registered but haven't onboarding completed)
            // Or maybe Google sign in just completed and we need to check
            const dummyUser: UserProfile = {
              uid: firebaseUser.uid,
              email: firebaseUser.email || 'eco.champion@gmail.com',
              displayName: firebaseUser.displayName || 'Eco Champion',
              photoURL: firebaseUser.photoURL || 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&w=150&q=80',
              greenPoints: 0,
              xp: 0,
              level: 1,
              badges: [],
              isOnboarded: false,
            };
            setUser(dummyUser);
            if (activeTabRef.current === 'landing') {
              setActiveTab('onboarding');
            }
            // Write it to Firestore
            setDoc(userDocRef, dummyUser).catch(err => console.error("Firestore user creation error:", err));
          }
        }, (err) => {
          console.warn("Firestore user subscription blocked (likely rules):", err);
          const cached = localStorage.getItem('ecolens_user');
          if (cached) {
            try {
              const parsed = JSON.parse(cached) as UserProfile;
              setUser(parsed);
              if (activeTabRef.current === 'landing') {
                setActiveTab(parsed.isOnboarded ? 'dashboard' : 'onboarding');
              }
            } catch (e) {
              console.error(e);
            }
          } else {
            if (activeTabRef.current === 'landing') {
              setActiveTab('onboarding');
            }
          }
        });

        // Subscribe to logs collection changes in Firestore
        const logsColRef = collection(db, 'users', firebaseUser.uid, 'logs');
        const unsubscribeLogs = onSnapshot(logsColRef, (querySnap) => {
          const list: EmissionsLog[] = [];
          querySnap.forEach((d) => {
            list.push(d.data() as EmissionsLog);
          });
          const sortedList = list.sort((a, b) => b.id.localeCompare(a.id));
          setLogs(sortedList);
          localStorage.setItem('ecolens_logs', JSON.stringify(sortedList));
          
          // Recalculate AI warnings
          mockFirestore.checkNotifications(sortedList);
          setNotifications(mockFirestore.getNotifications());
        }, (err) => {
          console.warn("Firestore logs subscription blocked (likely rules):", err);
          const cached = localStorage.getItem('ecolens_logs');
          if (cached) setLogs(JSON.parse(cached));
        });

        return () => {
          unsubscribeUser();
          unsubscribeLogs();
        };
      } else {
        setIsLoggedIn(false);
        setUser(mockAuth.getCurrentUser());
        setLogs([]);
        setNotifications([]);
      }
    });

    return () => unsubscribeAuth();
  }, []);

  // Sync secondary localStorage states
  useEffect(() => {
    setChallenges(mockFirestore.getChallenges());
  }, [user]);

  // Check for badge unlocks in localStorage
  useEffect(() => {
    const checkUnlocks = () => {
      const unlocks = getStoredData<string[]>('ecolens_new_unlocks', []);
      if (unlocks.length > 0) {
        setUnlockedBadgeName(unlocks[0]);
        setStoredData('ecolens_new_unlocks', unlocks.slice(1));
        
        confetti({
          particleCount: 150,
          spread: 80,
          origin: { y: 0.5 },
          colors: ['#22c55e', '#0ea5e9', '#eab308']
        });
      }
    };
    
    checkUnlocks();
    const interval = setInterval(checkUnlocks, 1500);
    return () => clearInterval(interval);
  }, [user]);

  const refreshState = () => {
    setUser(mockAuth.getCurrentUser());
    setLogs(mockFirestore.getLogs());
    setChallenges(mockFirestore.getChallenges());
    setNotifications(mockFirestore.getNotifications());
  };

  const handleOpenAuth = (mode: 'login' | 'signup') => {
    setAuthMode(mode);
    setAuthError(null);
    setShowAuthModal(true);
  };

  const handleAuthSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setAuthError(null);
    
    try {
      if (authMode === 'signup') {
        let firebaseUser;
        try {
          const credentials = await createUserWithEmailAndPassword(auth, emailInput, passwordInput);
          firebaseUser = credentials.user;
          
          const newUser: UserProfile = {
            uid: firebaseUser.uid,
            email: firebaseUser.email || emailInput,
            displayName: nameInput || 'Eco Champion',
            photoURL: 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&w=150&q=80',
            greenPoints: 0,
            xp: 0,
            level: 1,
            badges: [],
            isOnboarded: false,
          };
          
          try {
            await setDoc(doc(db, 'users', firebaseUser.uid), newUser);
          } catch (dbErr) {
            console.warn("Could not write user profile profile in Firestore (blocked by rules):", dbErr);
          }
          
          setUser(newUser);
          localStorage.setItem('ecolens_user', JSON.stringify(newUser));
          setShowAuthModal(false);
          setActiveTab('onboarding');
          setOnboardingStep(1);
        } catch (signupErr: any) {
          if (signupErr.code === 'auth/email-already-in-use') {
            console.log("Email already in use during signup, attempting automatic sign in...");
            const credentials = await signInWithEmailAndPassword(auth, emailInput, passwordInput);
            firebaseUser = credentials.user;
            setShowAuthModal(false);

            // Fetch user profile from Firestore to see if they're onboarded
            const userDocRef = doc(db, 'users', firebaseUser.uid);
            try {
              const docSnap = await getDoc(userDocRef);
              if (docSnap.exists()) {
                const data = docSnap.data() as UserProfile;
                setUser(data);
                localStorage.setItem('ecolens_user', JSON.stringify(data));
                setActiveTab(data.isOnboarded ? 'dashboard' : 'onboarding');
              } else {
                setActiveTab('onboarding');
              }
            } catch (dbErr) {
              console.warn("Could not read user profile from Firestore, falling back to local settings:", dbErr);
              const cached = localStorage.getItem('ecolens_user');
              if (cached) {
                const parsed = JSON.parse(cached) as UserProfile;
                setActiveTab(parsed.isOnboarded ? 'dashboard' : 'onboarding');
              } else {
                setActiveTab('onboarding');
              }
            }
          } else {
            throw signupErr;
          }
        }
      } else {
        const credentials = await signInWithEmailAndPassword(auth, emailInput, passwordInput);
        const firebaseUser = credentials.user;
        setShowAuthModal(false);

        // Fetch user profile from Firestore to see if they're onboarded
        const userDocRef = doc(db, 'users', firebaseUser.uid);
        try {
          const docSnap = await getDoc(userDocRef);
          if (docSnap.exists()) {
            const data = docSnap.data() as UserProfile;
            setUser(data);
            localStorage.setItem('ecolens_user', JSON.stringify(data));
            setActiveTab(data.isOnboarded ? 'dashboard' : 'onboarding');
          } else {
            setActiveTab('onboarding');
          }
        } catch (dbErr) {
          console.warn("Could not read user profile from Firestore, falling back to local settings:", dbErr);
          const cached = localStorage.getItem('ecolens_user');
          if (cached) {
            const parsed = JSON.parse(cached) as UserProfile;
            setActiveTab(parsed.isOnboarded ? 'dashboard' : 'onboarding');
          } else {
            setActiveTab('onboarding');
          }
        }
      }
    } catch (err: any) {
      console.error("Auth error details:", err);
      let errMsg = err.message || "Authentication failed.";
      
      // Map standard Firebase Auth error codes to helpful troubleshooting advice
      if (err.code === 'auth/operation-not-allowed') {
        errMsg = "Email/Password sign-in method is currently disabled in your Firebase console. Please go to Firebase Console > Authentication > Sign-in Method, and enable 'Email/Password'.";
      } else if (err.code === 'auth/wrong-password' || err.code === 'auth/user-not-found' || err.code === 'auth/invalid-credential') {
        errMsg = "Invalid email or password. Verify your credentials, or click 'Sign Up' to register a new account.";
      } else if (err.code === 'auth/email-already-in-use') {
        errMsg = "This email address is already registered. Please sign in or use a different email.";
      } else if (err.code === 'auth/weak-password') {
        errMsg = "Password is too weak. Please use at least 6 characters.";
      }
      setAuthError(errMsg);
    }

    setEmailInput('');
    setPasswordInput('');
    setNameInput('');
  };

  const handleGoogleSignInClick = async () => {
    try {
      const result = await signInWithPopup(auth, googleProvider);
      const firebaseUser = result.user;
      
      const userDocRef = doc(db, 'users', firebaseUser.uid);
      const userDoc = await getDoc(userDocRef);
      
      if (!userDoc.exists()) {
        const googleUser: UserProfile = {
          uid: firebaseUser.uid,
          email: firebaseUser.email || 'alex.rivers@gmail.com',
          displayName: firebaseUser.displayName || 'Alex Rivers',
          photoURL: firebaseUser.photoURL || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=150&q=80',
          greenPoints: 240,
          xp: 120,
          level: 1,
          badges: ['badge_1'],
          isOnboarded: false, // Let them complete onboarding
        };
        await setDoc(userDocRef, googleUser);
        setUser(googleUser);
        setActiveTab('onboarding');
      } else {
        const data = userDoc.data() as UserProfile;
        setUser(data);
        setActiveTab(data.isOnboarded ? 'dashboard' : 'onboarding');
      }
      
      setShowAuthModal(false);
      
      confetti({
        particleCount: 100,
        spread: 80,
        origin: { y: 0.5 }
      });
    } catch (err: any) {
      console.error("Google Auth error:", err);
      alert(err.message || "Google Sign-In failed.");
    }
  };

  // Onboarding Complete Handler
  const handleOnboardingComplete = () => {
    // 1. Save onboarding choices to user profile
    const updatedUser = mockAuth.updateUserProfile({
      isOnboarded: true,
      onboardingData: {
        transportMode: onboardTransport,
        electricityUsage: onboardKwh,
        foodPreference: onboardFood,
        shoppingFrequency: onboardShop
      },
      xp: 50, // Grant Eco Beginner XP
      greenPoints: 50
    });

    // 2. Prepopulate database logs based on onboarding to initialize starting emissions
    // Travel log
    let travelDist = 0;
    if (onboardTransport === 'car') travelDist = 120; // 120km
    else if (onboardTransport === 'bus') travelDist = 80;
    else if (onboardTransport === 'train') travelDist = 200;
    else if (onboardTransport === 'bike' || onboardTransport === 'walking') travelDist = 0;
    
    if (travelDist > 0) {
      mockFirestore.addLog('travel', 'Usual commute log (Onboarding)', travelDist, 'km', onboardTransport);
    }

    // Electricity log
    if (onboardKwh > 0) {
      mockFirestore.addLog('energy', 'Monthly base electricity (Onboarding)', onboardKwh, 'kWh', 'grid');
    }

    // Food log
    let foodDesc = 'Vegan Salad Meal';
    let foodSub = 'vegan';
    if (onboardFood === 'vegetarian') { foodDesc = 'Vegetarian Tacos'; foodSub = 'vegetarian'; }
    else if (onboardFood === 'non-vegetarian') { foodDesc = 'Beef Steak Dinner'; foodSub = 'beef'; }
    mockFirestore.addLog('food', foodDesc, 1, 'meal', foodSub);

    // Shopping log
    let shopDesc = 'Paper Grocery Bag';
    let shopSub = 'paper';
    if (onboardShop === 'high') { shopDesc = 'Fashion clothing purchase'; shopSub = 'clothing'; }
    else if (onboardShop === 'medium') { shopDesc = 'Plastic bottled products'; shopSub = 'plastic'; }
    mockFirestore.addLog('shopping', shopDesc, 1, 'item', shopSub);

    // Refresh, play confetti, transition
    setUser(updatedUser);
    refreshState();
    
    confetti({
      particleCount: 150,
      spread: 80,
      origin: { y: 0.5 }
    });

    setActiveTab('dashboard');
  };

  const handleLogout = async () => {
    try {
      await signOut(auth);
      mockAuth.logout();
      setIsLoggedIn(false);
      setActiveTab('landing');
      setUser(mockAuth.getCurrentUser());
      setLogs([]);
      setChallenges([]);
      setNotifications([]);
    } catch (err) {
      console.error("Logout error:", err);
    }
  };

  const handleCloseBadgeModal = () => {
    setUnlockedBadgeName(null);
  };

  const handleSelectFeature = (featureTab: string) => {
    if (isLoggedIn) {
      setActiveTab(featureTab);
      window.scrollTo({ top: 0, behavior: 'smooth' });
    } else {
      handleOpenAuth('signup');
    }
  };

  const renderActiveTabContent = () => {
    switch (activeTab) {
      case 'onboarding':
        return (
          <div className="max-w-xl mx-auto glass-card p-8 rounded-3xl border border-white/5 shadow-2xl relative overflow-hidden my-8">
            <div className="absolute top-0 right-0 w-32 h-32 bg-emerald-500/10 rounded-full blur-3xl" />
            
            {/* Step HUD */}
            <div className="flex justify-between items-center text-xs font-bold text-slate-400 mb-6">
              <span>ONBOARDING PROFILE SETUP</span>
              <span className="text-emerald-400">Step {onboardingStep} of 4</span>
            </div>

            {/* Steps Rendering */}
            <AnimatePresence mode="wait">
              {onboardingStep === 1 && (
                <motion.div
                  key="step1"
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -20 }}
                  className="space-y-6"
                >
                  <h3 className="text-xl font-bold text-white">1. What is your primary mode of transit?</h3>
                  <p className="text-xs text-slate-400">This helps estimate your baseline travel carbon footprint (computed in km).</p>
                  
                  <div className="grid grid-cols-1 gap-2.5">
                    {[
                      { id: 'car', label: '🚗 Private Petrol Car', desc: '0.192 kg CO₂ per km' },
                      { id: 'bus', label: '🚌 Public Transit Bus', desc: '0.105 kg CO₂ per km' },
                      { id: 'train', label: '🚆 Electric Subway / Rail', desc: '0.041 kg CO₂ per km' },
                      { id: 'bike', label: '🚲 Bicycle / E-Bike', desc: '0.000 kg CO₂ per km' },
                      { id: 'walking', label: '🚶 Walking / Footwear', desc: '0.000 kg CO₂ per km' },
                    ].map((mode) => (
                      <button
                        key={mode.id}
                        type="button"
                        onClick={() => setOnboardTransport(mode.id as any)}
                        aria-pressed={onboardTransport === mode.id}
                        className={`p-4 rounded-xl border text-left text-xs font-semibold transition-all ${
                          onboardTransport === mode.id 
                            ? 'border-emerald-500 bg-emerald-500/10 text-white' 
                            : 'border-white/5 bg-slate-900/30 text-slate-400 hover:text-slate-200'
                        } focus:outline-none focus:ring-2 focus:ring-emerald-500/50`}
                      >
                        <div className="flex justify-between items-center">
                          <span>{mode.label}</span>
                          <span className="text-[10px] text-slate-500 font-bold">{mode.desc}</span>
                        </div>
                      </button>
                    ))}
                  </div>
                </motion.div>
              )}

              {onboardingStep === 2 && (
                <motion.div
                  key="step2"
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -20 }}
                  className="space-y-6"
                >
                  <h3 className="text-xl font-bold text-white">2. Estimate monthly home electricity usage</h3>
                  <p className="text-xs text-slate-400">Calculated using our carbon index factor of **0.82 kg CO₂/kWh**.</p>
                  
                  <div className="space-y-4">
                    <label htmlFor="onboard-kwh-input" className="flex justify-between items-center text-xs font-bold text-slate-300 cursor-pointer">
                      <span>MONTHLY USAGE</span>
                      <span className="text-emerald-400 text-sm">{onboardKwh} kWh</span>
                    </label>
                    <input
                      id="onboard-kwh-input"
                      type="range"
                      min="20"
                      max="500"
                      step="10"
                      value={onboardKwh}
                      onChange={(e) => setOnboardKwh(Number(e.target.value))}
                      className="w-full h-2 bg-slate-800 rounded-lg appearance-none cursor-pointer accent-emerald-400 focus:outline-none focus:ring-2 focus:ring-emerald-500/50"
                    />
                    <div className="flex justify-between text-[9px] text-slate-500 font-bold">
                      <span>20 kWh (Eco apartments)</span>
                      <span>500 kWh (High consumption)</span>
                    </div>
                  </div>
                </motion.div>
              )}

              {onboardingStep === 3 && (
                <motion.div
                  key="step3"
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -20 }}
                  className="space-y-6"
                >
                  <h3 className="text-xl font-bold text-white">3. What is your general dietary preference?</h3>
                  <p className="text-xs text-slate-400">Diet accounts for roughly 25% of global personal emissions profiles.</p>
                  
                  <div className="grid grid-cols-1 gap-3">
                    {[
                      { id: 'non-vegetarian', label: '🥩 Non-Vegetarian', desc: 'Frequent red meat, beef (factor: 27.0), chicken (factor: 6.9)' },
                      { id: 'vegetarian', label: '🥗 Vegetarian', desc: 'Eggs (factor: 4.8), dairy, vegetarian recipes (factor: 2.0)' },
                      { id: 'vegan', label: '🌱 Strict Vegan', desc: '100% plant-based recipes, zero dairy (factor: 1.5)' },
                    ].map((food) => (
                      <button
                        key={food.id}
                        type="button"
                        onClick={() => setOnboardFood(food.id as any)}
                        aria-pressed={onboardFood === food.id}
                        className={`p-4.5 rounded-xl border text-left text-xs font-semibold transition-all ${
                          onboardFood === food.id 
                            ? 'border-emerald-500 bg-emerald-500/10 text-white' 
                            : 'border-white/5 bg-slate-900/30 text-slate-400 hover:text-slate-200'
                        } focus:outline-none focus:ring-2 focus:ring-emerald-500/50`}
                      >
                        <span className="block text-white font-bold">{food.label}</span>
                        <span className="block text-[10px] text-slate-500 mt-1 font-medium">{food.desc}</span>
                      </button>
                    ))}
                  </div>
                </motion.div>
              )}

              {onboardingStep === 4 && (
                <motion.div
                  key="step4"
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -20 }}
                  className="space-y-6"
                >
                  <h3 className="text-xl font-bold text-white">4. How often do you buy retail/consumer goods?</h3>
                  <p className="text-xs text-slate-400">This weights clothing purchases, electronics, and general product packaging waste.</p>
                  
                  <div className="grid grid-cols-3 gap-3">
                    {[
                      { id: 'low', label: '🛍️ Low', desc: 'Essential goods only' },
                      { id: 'medium', label: '🛍️ Medium', desc: 'Average consumer habits' },
                      { id: 'high', label: '🛍️ High', desc: 'Frequent fashion / gadgets' },
                    ].map((shop) => (
                      <button
                        key={shop.id}
                        type="button"
                        onClick={() => setOnboardShop(shop.id as any)}
                        aria-pressed={onboardShop === shop.id}
                        className={`p-4 rounded-xl border text-center text-xs font-semibold transition-all flex flex-col items-center justify-center gap-2 ${
                          onboardShop === shop.id 
                            ? 'border-emerald-500 bg-emerald-500/10 text-white' 
                            : 'border-white/5 bg-slate-900/30 text-slate-400 hover:text-slate-200'
                        } focus:outline-none focus:ring-2 focus:ring-emerald-500/50`}
                      >
                        <span className="text-white font-bold">{shop.label}</span>
                        <span className="text-[9px] text-slate-500 leading-snug">{shop.desc}</span>
                      </button>
                    ))}
                  </div>
                </motion.div>
              )}
            </AnimatePresence>

            {/* Navigation buttons */}
            <div className="flex justify-between items-center mt-8 pt-5 border-t border-slate-800/80">
              <button
                disabled={onboardingStep === 1}
                onClick={() => setOnboardingStep(prev => prev - 1)}
                className="glass-btn-secondary px-4 py-2 text-xs flex items-center gap-1 disabled:opacity-30 disabled:scale-100 focus:outline-none focus:ring-2 focus:ring-slate-500/50"
              >
                <ChevronLeft className="w-3.5 h-3.5" />
                <span>Back</span>
              </button>

              {onboardingStep < 4 ? (
                <button
                  onClick={() => setOnboardingStep(prev => prev + 1)}
                  className="glass-btn-primary px-4 py-2 text-xs flex items-center gap-1 focus:outline-none focus:ring-2 focus:ring-emerald-500/50"
                >
                  <span>Next</span>
                  <ChevronRight className="w-3.5 h-3.5" />
                </button>
              ) : (
                <button
                  onClick={handleOnboardingComplete}
                  className="glass-btn-primary px-5 py-2 text-xs font-bold focus:outline-none focus:ring-2 focus:ring-emerald-500/50"
                >
                  Calculate My Score 🌱
                </button>
              )}
            </div>
          </div>
        );
      case 'dashboard':
        return (
          <div className="space-y-8">
            {/* Real-time Notification Alert banners (AI Notification Engine) */}
            {notifications.length > 0 && (
              <div className="space-y-2">
                {notifications.map((alert) => (
                  <motion.div
                    key={alert.id}
                    initial={{ opacity: 0, y: -10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="glass-card border border-amber-500/20 bg-amber-500/5 p-4 rounded-2xl flex items-start gap-3 shadow-md"
                  >
                    <AlertTriangle className="w-5 h-5 text-amber-500 flex-shrink-0 mt-0.5" />
                    <div>
                      <span className="text-[10px] text-amber-400 font-extrabold uppercase block mb-0.5">AI Climate Advisor Warning</span>
                      <p className="text-xs text-slate-300 leading-relaxed">{alert.message}</p>
                    </div>
                  </motion.div>
                ))}
              </div>
            )}
            
            <DashboardTab
              logs={logs}
              onLogAdded={refreshState}
              onLogDeleted={refreshState}
            />
          </div>
        );
      case 'route':
        return <GreenRouteTab onLogAdded={refreshState} />;
      case 'camera':
        return <CarbonCameraTab onLogAdded={refreshState} />;
      case 'coach':
        return <AICoachTab logs={logs} />;
      case 'simulator':
        return <EarthSimulatorTab logs={logs} />;
      case 'gamification':
        return (
          <GamificationTab
            user={user}
            challenges={challenges}
            onChallengeCompleted={refreshState}
          />
        );
      case 'leaderboard':
        return <LeaderboardTab />;
      default:
        return (
          <div className="space-y-12">
            <Hero 
              onStartTracking={() => handleOpenAuth('signup')}
              onWatchDemo={() => handleOpenAuth('login')}
            />
            <Features onSelectFeature={handleSelectFeature} />
          </div>
        );
    }
  };

  return (
    <div className="min-h-screen bg-dark-950 text-slate-100 flex flex-col relative">
      
      <div className="absolute top-10 left-10 w-[500px] h-[500px] rounded-full radial-glow-green opacity-20 blur-[120px] pointer-events-none" />
      <div className="absolute bottom-10 right-10 w-[600px] h-[600px] rounded-full radial-glow-blue opacity-15 blur-[150px] pointer-events-none" />
      
      <Navbar
        user={user}
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        onLogout={handleLogout}
        isLoggedIn={isLoggedIn}
        onLogin={() => handleOpenAuth('login')}
      />

      <main className="flex-grow container mx-auto max-w-7xl px-4 py-8 relative z-10">
        {renderActiveTabContent()}
      </main>

      <footer className="border-t border-slate-900 bg-dark-950 py-8 px-4 text-center text-xs text-slate-500 relative z-10">
        <div className="max-w-7xl mx-auto flex flex-col sm:flex-row justify-between items-center gap-4">
          <div className="flex items-center gap-2">
            <div className="w-5 h-5 rounded-md bg-gradient-to-tr from-emerald-400 to-cyan-500 flex items-center justify-center">
              <span className="text-[10px] text-dark-950 font-extrabold font-sans">E</span>
            </div>
            <span className="font-bold text-slate-400">EcoLens AI © 2026</span>
          </div>
          <p className="leading-snug max-w-md">
            A comprehensive carbon footprint web application designed to calculate emissions, optimize green transit routes, and model long-term ecological sustainability scenarios.
          </p>
        </div>
      </footer>

      {/* Auth Modal (Firebase UI Simulation) */}
      <AnimatePresence>
        {showAuthModal && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-dark-950/70 backdrop-blur-md"
          >
            <motion.div
              initial={{ scale: 0.9, y: 20 }}
              animate={{ scale: 1, y: 0 }}
              exit={{ scale: 0.9, y: 20 }}
              className="glass-card border border-white/10 p-8 rounded-3xl w-full max-w-md relative shadow-2xl bg-slate-900/90"
            >
              <button
                onClick={() => setShowAuthModal(false)}
                aria-label="Close modal"
                className="absolute top-4 right-4 text-slate-500 hover:text-white p-1.5 rounded-lg hover:bg-white/5 focus:outline-none focus:ring-2 focus:ring-emerald-500/50"
              >
                <X className="w-4.5 h-4.5" />
              </button>

              <div className="text-center mb-6">
                <h3 className="text-2xl font-bold text-white">
                  {authMode === 'login' ? 'Welcome Back 🌿' : 'Create Account 🌱'}
                </h3>
                <p className="text-xs text-slate-400 mt-1">
                  {authMode === 'login' 
                    ? 'Log in to trace your weekly carbon milestones' 
                    : 'Start your journey to carbon neutrality today'}
                </p>
              </div>

              {/* Form */}
              <form onSubmit={handleAuthSubmit} className="space-y-4">
                {authError && (
                  <div id="auth-error-msg" role="alert" className="p-3 rounded-xl border border-red-500/20 bg-red-500/10 text-red-400 text-xs flex items-center gap-2">
                    <AlertTriangle className="w-4 h-4 flex-shrink-0" />
                    <span>{authError}</span>
                  </div>
                )}

                {authMode === 'signup' && (
                  <div>
                    <label htmlFor="auth-name-input" className="text-[10px] text-slate-400 font-bold block mb-1.5 uppercase">Full Name</label>
                    <div className="relative">
                      <UserIcon className="absolute left-3.5 top-3.5 w-4 h-4 text-slate-500" />
                      <input
                        id="auth-name-input"
                        type="text"
                        required
                        placeholder="e.g. Alex Rivers"
                        value={nameInput}
                        onChange={(e) => setNameInput(e.target.value)}
                        aria-invalid={authError ? "true" : "false"}
                        aria-describedby={authError ? "auth-error-msg" : undefined}
                        className="glass-input !pl-11 w-full text-xs py-3 focus:outline-none focus:ring-2 focus:ring-emerald-500/50"
                      />
                    </div>
                  </div>
                )}

                <div>
                  <label htmlFor="auth-email-input" className="text-[10px] text-slate-400 font-bold block mb-1.5 uppercase">Email Address</label>
                  <div className="relative">
                    <Mail className="absolute left-3.5 top-3.5 w-4 h-4 text-slate-500" />
                    <input
                      id="auth-email-input"
                      type="email"
                      required
                      placeholder="you@domain.com"
                      value={emailInput}
                      onChange={(e) => setEmailInput(e.target.value)}
                      aria-invalid={authError ? "true" : "false"}
                      aria-describedby={authError ? "auth-error-msg" : undefined}
                      className="glass-input !pl-11 w-full text-xs py-3 focus:outline-none focus:ring-2 focus:ring-emerald-500/50"
                    />
                  </div>
                </div>

                <div>
                  <label htmlFor="auth-password-input" className="text-[10px] text-slate-400 font-bold block mb-1.5 uppercase">Password</label>
                  <div className="relative">
                    <Lock className="absolute left-3.5 top-3.5 w-4 h-4 text-slate-500" />
                    <input
                      id="auth-password-input"
                      type="password"
                      required
                      placeholder="••••••••"
                      value={passwordInput}
                      onChange={(e) => setPasswordInput(e.target.value)}
                      aria-invalid={authError ? "true" : "false"}
                      aria-describedby={authError ? "auth-error-msg" : undefined}
                      className="glass-input !pl-11 w-full text-xs py-3 focus:outline-none focus:ring-2 focus:ring-emerald-500/50"
                    />
                  </div>
                </div>

                <button
                  type="submit"
                  className="glass-btn-primary w-full py-3.5 text-xs font-bold mt-2 flex items-center justify-center gap-1.5 focus:outline-none focus:ring-2 focus:ring-emerald-500/50"
                >
                  <LogIn className="w-4 h-4" />
                  <span>{authMode === 'login' ? 'Sign In with Email' : 'Sign Up & Continue'}</span>
                </button>
              </form>

              {/* Google OAuth Simulation Button */}
              <div className="relative flex py-5 items-center">
                <div className="flex-grow border-t border-slate-800"></div>
                <span className="flex-shrink mx-4 text-slate-500 text-[10px] uppercase font-bold">Or use federated auth</span>
                <div className="flex-grow border-t border-slate-800"></div>
              </div>

              <button
                type="button"
                onClick={handleGoogleSignInClick}
                className="w-full flex items-center justify-center gap-2 px-4 py-3 rounded-xl border border-white/5 bg-slate-900/30 hover:bg-slate-900/60 text-slate-200 text-xs font-semibold transition-all focus:outline-none focus:ring-2 focus:ring-emerald-500/50"
              >
                <svg viewBox="0 0 24 24" width="16" height="16" className="w-4 h-4" xmlns="http://www.w3.org/2000/svg">
                  <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
                  <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
                  <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z" fillRule="evenodd" />
                  <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" />
                </svg>
                <span>Sign In with Google</span>
              </button>

              <div className="text-center mt-6 text-xs">
                <span className="text-slate-400">
                  {authMode === 'login' ? "Don't have an account? " : "Already registered? "}
                </span>
                <button
                  type="button"
                  onClick={() => {
                    setAuthMode(authMode === 'login' ? 'signup' : 'login');
                    setAuthError(null);
                  }}
                  className="text-emerald-400 font-bold hover:underline focus:outline-none focus:ring-2 focus:ring-emerald-500/30 rounded px-1"
                >
                  {authMode === 'login' ? 'Sign Up' : 'Log In'}
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Google Auth is handled natively using Firebase Browser OAuth flows */}

      {/* Pop-up Overlay for Badge Unlock Achievement */}
      <AnimatePresence>
        {unlockedBadgeName && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-dark-950/70 backdrop-blur-md"
          >
            <motion.div
              initial={{ scale: 0.9, y: 20 }}
              animate={{ scale: 1, y: 0 }}
              exit={{ scale: 0.9, y: 20 }}
              className="glass-card border border-emerald-500/30 p-8 rounded-3xl text-center max-w-sm relative shadow-2xl bg-slate-900/90"
            >
              <button
                onClick={handleCloseBadgeModal}
                aria-label="Close achievement modal"
                className="absolute top-4 right-4 text-slate-500 hover:text-white p-1 rounded-lg hover:bg-white/5 focus:outline-none focus:ring-2 focus:ring-emerald-500/50"
              >
                <X className="w-4.5 h-4.5" />
              </button>

              <div aria-hidden="true" className="w-20 h-20 rounded-full bg-emerald-500/10 border border-emerald-500/30 flex items-center justify-center text-4xl mx-auto mb-6 shadow-lg animate-bounce" style={{ animationDuration: '3s' }}>
                🏆
              </div>

              <div className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-emerald-500/10 text-emerald-400 text-[10px] font-bold border border-emerald-500/15 mb-3 uppercase tracking-widest">
                <Sparkles className="w-3 h-3" />
                <span>Achievement Unlocked</span>
              </div>

              <h4 className="text-xl font-extrabold text-white mb-2 leading-tight">
                {unlockedBadgeName}
              </h4>
              
              <p className="text-xs text-slate-400 leading-relaxed mb-6">
                Congratulations! Your ecological score and carbon reduction accomplishments have earned you top-tier credentials.
              </p>

              <button
                onClick={handleCloseBadgeModal}
                className="glass-btn-primary w-full py-2.5 text-xs font-semibold flex items-center justify-center gap-1.5 shadow-md shadow-emerald-950/20 focus:outline-none focus:ring-2 focus:ring-emerald-500/50"
              >
                <span>Awesome, Thank You!</span>
                <ChevronRight className="w-4 h-4" />
              </button>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

    </div>
  );
};
export default App;
