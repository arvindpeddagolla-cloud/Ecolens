import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Mail, Lock, User as UserIcon, LogIn, AlertTriangle } from 'lucide-react';
import { auth, db, googleProvider } from '../services/firebase';
import { 
  signInWithEmailAndPassword, 
  createUserWithEmailAndPassword, 
  signInWithPopup 
} from 'firebase/auth';
import { doc, setDoc, getDoc } from 'firebase/firestore';
import type { UserProfile } from '../services/mockServices';
import { getAuthErrorMessage, validateLoginInput, validateRegistrationInput, sanitizeText } from '../utils/validation';
import confetti from 'canvas-confetti';

interface AuthModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: (user: UserProfile, isNewUser: boolean) => void;
  initialMode: 'login' | 'signup';
}

export const AuthModal: React.FC<AuthModalProps> = ({
  isOpen,
  onClose,
  onSuccess,
  initialMode
}) => {
  const [authMode, setAuthMode] = useState<'login' | 'signup'>(initialMode);
  const [emailInput, setEmailInput] = useState('');
  const [passwordInput, setPasswordInput] = useState('');
  const [nameInput, setNameInput] = useState('');
  const [authError, setAuthError] = useState<string | null>(null);

  const [prevInitialMode, setPrevInitialMode] = useState<'login' | 'signup'>(initialMode);
  if (initialMode !== prevInitialMode) {
    setPrevInitialMode(initialMode);
    setAuthMode(initialMode);
  }

  const handleAuthSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setAuthError(null);

    const sanitizedEmail = sanitizeText(emailInput);
    const sanitizedName = sanitizeText(nameInput);

    const validation = authMode === 'signup'
      ? validateRegistrationInput(sanitizedEmail, passwordInput)
      : validateLoginInput(sanitizedEmail, passwordInput);

    if (!validation.isValid) {
      setAuthError(validation.error);
      return;
    }
    
    try {
      if (authMode === 'signup') {
        let firebaseUser;
        try {
          const credentials = await createUserWithEmailAndPassword(auth, sanitizedEmail, passwordInput);
          firebaseUser = credentials.user;
          
          const newUser: UserProfile = {
            uid: firebaseUser.uid,
            email: firebaseUser.email || sanitizedEmail,
            displayName: sanitizedName || 'Eco Champion',
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
          
          localStorage.setItem('ecolens_user', JSON.stringify(newUser));
          onSuccess(newUser, true);
        } catch (signupErr) {
          const signupErrorVal = signupErr as { code?: string; message?: string };
          if (signupErrorVal.code === 'auth/email-already-in-use') {
            console.log("Email already in use during signup, attempting automatic sign in...");
            const credentials = await signInWithEmailAndPassword(auth, sanitizedEmail, passwordInput);
            firebaseUser = credentials.user;

            // Fetch user profile from Firestore to see if they're onboarded
            const userDocRef = doc(db, 'users', firebaseUser.uid);
            try {
              const docSnap = await getDoc(userDocRef);
              if (docSnap.exists()) {
                const data = docSnap.data() as UserProfile;
                localStorage.setItem('ecolens_user', JSON.stringify(data));
                onSuccess(data, !data.isOnboarded);
              } else {
                const newUser: UserProfile = {
                  uid: firebaseUser.uid,
                  email: firebaseUser.email || sanitizedEmail,
                  displayName: sanitizedName || 'Eco Champion',
                  photoURL: 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&w=150&q=80',
                  greenPoints: 0,
                  xp: 0,
                  level: 1,
                  badges: [],
                  isOnboarded: false,
                };
                onSuccess(newUser, true);
              }
            } catch (dbErr) {
              console.warn("Could not read user profile from Firestore, falling back to local settings:", dbErr);
              const cached = localStorage.getItem('ecolens_user');
              if (cached) {
                const parsed = JSON.parse(cached) as UserProfile;
                onSuccess(parsed, !parsed.isOnboarded);
              } else {
                const newUser: UserProfile = {
                  uid: firebaseUser.uid,
                  email: firebaseUser.email || sanitizedEmail,
                  displayName: sanitizedName || 'Eco Champion',
                  photoURL: 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&w=150&q=80',
                  greenPoints: 0,
                  xp: 0,
                  level: 1,
                  badges: [],
                  isOnboarded: false,
                };
                onSuccess(newUser, true);
              }
            }
          } else {
            throw signupErr;
          }
        }
      } else {
        const credentials = await signInWithEmailAndPassword(auth, sanitizedEmail, passwordInput);
        const firebaseUser = credentials.user;

        // Fetch user profile from Firestore to see if they're onboarded
        const userDocRef = doc(db, 'users', firebaseUser.uid);
        try {
          const docSnap = await getDoc(userDocRef);
          if (docSnap.exists()) {
            const data = docSnap.data() as UserProfile;
            localStorage.setItem('ecolens_user', JSON.stringify(data));
            onSuccess(data, !data.isOnboarded);
          } else {
            const newUser: UserProfile = {
              uid: firebaseUser.uid,
              email: firebaseUser.email || sanitizedEmail,
              displayName: sanitizedName || 'Eco Champion',
              photoURL: 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&w=150&q=80',
              greenPoints: 0,
              xp: 0,
              level: 1,
              badges: [],
              isOnboarded: false,
            };
            onSuccess(newUser, true);
          }
        } catch (dbErr) {
          console.warn("Could not read user profile from Firestore, falling back to local settings:", dbErr);
          const cached = localStorage.getItem('ecolens_user');
          if (cached) {
            const parsed = JSON.parse(cached) as UserProfile;
            onSuccess(parsed, !parsed.isOnboarded);
          } else {
            const newUser: UserProfile = {
              uid: firebaseUser.uid,
              email: firebaseUser.email || sanitizedEmail,
              displayName: sanitizedName || 'Eco Champion',
              photoURL: 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&w=150&q=80',
              greenPoints: 0,
              xp: 0,
              level: 1,
              badges: [],
              isOnboarded: false,
            };
            onSuccess(newUser, true);
          }
        }
      }
    } catch (err) {
      console.error("Auth error details:", err);
      const errVal = err as { code?: string; message?: string };
      const errMsg = getAuthErrorMessage(errVal.code || '', errVal.message || "Authentication failed.");
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
        onSuccess(googleUser, true);
      } else {
        const data = userDoc.data() as UserProfile;
        onSuccess(data, !data.isOnboarded);
      }
      
      confetti({
        particleCount: 100,
        spread: 80,
        origin: { y: 0.5 }
      });
    } catch (err) {
      console.error("Google Auth error:", err);
      const errVal = err as { message?: string };
      alert(errVal.message || "Google Sign-In failed.");
    }
  };

  return (
    <AnimatePresence>
      {isOpen && (
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
              onClick={onClose}
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
  );
};
export default AuthModal;
