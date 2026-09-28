import React, { createContext, useContext, useEffect, useState } from 'react';
import {
  User as FirebaseUser,
  onAuthStateChanged,
  signInWithPopup,
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  signOut,
  sendPasswordResetEmail,
  sendEmailVerification,
  updateProfile
} from 'firebase/auth';
import { doc, getDoc, setDoc, updateDoc } from 'firebase/firestore';
import { auth, db, googleProvider } from '../firebase/config';
import { handleFirestoreError, OperationType, getFriendlyErrorMessage } from '../firebase/errors';
import { UserProfile } from '../types';

interface AuthContextType {
  user: UserProfile | null;
  firebaseUser: FirebaseUser | null;
  loading: boolean;
  isAdmin: boolean;
  signInWithGoogle: () => Promise<void>;
  signInWithEmail: (email: string, pass: string) => Promise<void>;
  registerWithEmail: (name: string, email: string, pass: string) => Promise<void>;
  logout: () => Promise<void>;
  resetPassword: (email: string) => Promise<void>;
  updateUserProfile: (data: Partial<UserProfile>) => Promise<void>;
  authError: string | null;
  clearAuthError: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

// Admin identifier specified in the user request & security rules
const ADMIN_EMAILS = ['hariharinath55260@gmail.com'];

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [firebaseUser, setFirebaseUser] = useState<FirebaseUser | null>(null);
  const [user, setUser] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [isAdmin, setIsAdmin] = useState(false);
  const [authError, setAuthError] = useState<string | null>(null);

  const clearAuthError = () => setAuthError(null);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (fbUser) => {
      setFirebaseUser(fbUser);
      if (fbUser) {
        try {
          const userDocRef = doc(db, 'users', fbUser.uid);
          let userDoc = null;
          try {
            userDoc = await getDoc(userDocRef);
          } catch (err) {
            console.warn('Could not fetch user doc:', err);
          }

          const isUserAdmin = Boolean(
            (fbUser.email && ADMIN_EMAILS.includes(fbUser.email.toLowerCase())) ||
            (userDoc?.exists() && userDoc.data()?.role === 'admin')
          );
          setIsAdmin(isUserAdmin);

          if (userDoc && userDoc.exists()) {
            const data = userDoc.data() as UserProfile;
            setUser({
              ...data,
              id: fbUser.uid,
              email: fbUser.email || data.email,
              displayName: data.displayName || fbUser.displayName || 'Culture Explorer',
              photoUrl: data.photoUrl || fbUser.photoURL || undefined,
              role: isUserAdmin ? 'admin' : (data.role || 'user')
            });
          } else {
            // First time sign-in: create user profile in Firestore
            const newProfile: UserProfile = {
              id: fbUser.uid,
              email: fbUser.email || '',
              displayName: fbUser.displayName || 'Culture Explorer',
              photoUrl: fbUser.photoURL || undefined,
              bio: 'Passionate about exploring world traditions, cuisine, and heritage on GoGlobal.',
              country: 'Global Citizen',
              role: isUserAdmin ? 'admin' : 'user',
              createdAt: new Date().toISOString(),
              updatedAt: new Date().toISOString()
            };

            try {
              await setDoc(userDocRef, newProfile);
            } catch (err) {
              console.warn('User profile create bypassed or restricted by rules:', err);
            }
            setUser(newProfile);
          }
        } catch (err) {
          console.error('Error synchronizing user profile:', err);
        }
      } else {
        setUser(null);
        setIsAdmin(false);
      }
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  const signInWithGoogle = async () => {
    clearAuthError();
    try {
      await signInWithPopup(auth, googleProvider);
    } catch (err: any) {
      const msg = getFriendlyErrorMessage(err);
      setAuthError(msg);
      throw new Error(msg);
    }
  };

  const signInWithEmail = async (email: string, pass: string) => {
    clearAuthError();
    try {
      await signInWithEmailAndPassword(auth, email.trim(), pass);
    } catch (err: any) {
      const msg = getFriendlyErrorMessage(err);
      setAuthError(msg);
      throw new Error(msg);
    }
  };

  const registerWithEmail = async (name: string, email: string, pass: string) => {
    clearAuthError();
    try {
      const cred = await createUserWithEmailAndPassword(auth, email.trim(), pass);
      if (cred.user) {
        await updateProfile(cred.user, { displayName: name.trim() });
        try {
          await sendEmailVerification(cred.user);
        } catch (vErr) {
          console.warn('Verification email not sent or delayed:', vErr);
        }

        const isUserAdmin = Boolean(email && ADMIN_EMAILS.includes(email.toLowerCase()));
        const newProfile: UserProfile = {
          id: cred.user.uid,
          email: email.trim(),
          displayName: name.trim() || 'Culture Explorer',
          bio: 'Exploring cultures worldwide on GoGlobal.',
          country: 'Global Citizen',
          role: isUserAdmin ? 'admin' : 'user',
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString()
        };

        try {
          await setDoc(doc(db, 'users', cred.user.uid), newProfile);
        } catch (err) {
          handleFirestoreError(err, OperationType.WRITE, `users/${cred.user.uid}`);
        }
        setUser(newProfile);
      }
    } catch (err: any) {
      const msg = getFriendlyErrorMessage(err);
      setAuthError(msg);
      throw new Error(msg);
    }
  };

  const logout = async () => {
    clearAuthError();
    try {
      await signOut(auth);
    } catch (err: any) {
      const msg = getFriendlyErrorMessage(err);
      setAuthError(msg);
      throw new Error(msg);
    }
  };

  const resetPassword = async (email: string) => {
    clearAuthError();
    try {
      await sendPasswordResetEmail(auth, email.trim());
    } catch (err: any) {
      const msg = getFriendlyErrorMessage(err);
      setAuthError(msg);
      throw new Error(msg);
    }
  };

  const updateUserProfile = async (data: Partial<UserProfile>) => {
    if (!firebaseUser) throw new Error('You must be signed in to update your profile.');
    try {
      const userRef = doc(db, 'users', firebaseUser.uid);
      const updates = {
        ...data,
        updatedAt: new Date().toISOString()
      };
      await updateDoc(userRef, updates);
      setUser(prev => prev ? { ...prev, ...updates } : null);
    } catch (err: any) {
      handleFirestoreError(err, OperationType.UPDATE, `users/${firebaseUser.uid}`);
    }
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        firebaseUser,
        loading,
        isAdmin,
        signInWithGoogle,
        signInWithEmail,
        registerWithEmail,
        logout,
        resetPassword,
        updateUserProfile,
        authError,
        clearAuthError
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
