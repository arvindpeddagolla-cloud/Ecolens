import React, { useState, useEffect, useRef } from 'react';
import { motion } from 'framer-motion';
import confetti from 'canvas-confetti';
import { Navbar } from './components/Navbar';
import { Hero } from './components/Hero';
import { Features } from './components/Features';
import { DashboardTab } from './components/DashboardTab';
import { GreenRouteTab } from './components/GreenRouteTab';
import { CarbonCameraTab } from './components/CarbonCameraTab';
import { AICoachTab } from './components/AICoachTab';
import { EarthSimulatorTab } from './components/EarthSimulatorTab';
import { GamificationTab } from './components/GamificationTab';
import { LeaderboardTab } from './components/LeaderboardTab';
import { OnboardingSurvey } from './components/OnboardingSurvey';
import { AuthModal } from './components/AuthModal';
import { UnlockedBadgeModal } from './components/UnlockedBadgeModal';
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
import { auth, db } from './services/firebase';
import { signOut, onAuthStateChanged } from 'firebase/auth';
import { doc, setDoc, onSnapshot, collection } from 'firebase/firestore';
import { AlertTriangle } from 'lucide-react';

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
  const [authInitialMode, setAuthInitialMode] = useState<'login' | 'signup'>('login');

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
  const [prevUserUid, setPrevUserUid] = useState<string>(user.uid);
  if (user.uid !== prevUserUid) {
    setPrevUserUid(user.uid);
    setChallenges(mockFirestore.getChallenges());
  }

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
    setAuthInitialMode(mode);
    setShowAuthModal(true);
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
          <OnboardingSurvey
            onboardingStep={onboardingStep}
            setOnboardingStep={setOnboardingStep}
            onboardTransport={onboardTransport}
            setOnboardTransport={setOnboardTransport}
            onboardKwh={onboardKwh}
            setOnboardKwh={setOnboardKwh}
            onboardFood={onboardFood}
            setOnboardFood={setOnboardFood}
            onboardShop={onboardShop}
            setOnboardShop={setOnboardShop}
            handleOnboardingComplete={handleOnboardingComplete}
          />
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
      <AuthModal
        isOpen={showAuthModal}
        onClose={() => setShowAuthModal(false)}
        initialMode={authInitialMode}
        onSuccess={(newUser, isNewUser) => {
          setUser(newUser);
          setShowAuthModal(false);
          if (isNewUser) {
            setActiveTab('onboarding');
            setOnboardingStep(1);
          } else {
            setActiveTab(newUser.isOnboarded ? 'dashboard' : 'onboarding');
          }
        }}
      />

      {/* Pop-up Overlay for Badge Unlock Achievement */}
      <UnlockedBadgeModal
        unlockedBadgeName={unlockedBadgeName}
        onClose={handleCloseBadgeModal}
      />

    </div>
  );
};
export default App;
