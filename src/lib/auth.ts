import {
  signInWithEmailLink,
  sendSignInLinkToEmail,
  isSignInWithEmailLink,
  signInWithPopup,
  GoogleAuthProvider,
  signOut,
  onAuthStateChanged,
  User as FirebaseUser,
  ActionCodeSettings
} from 'firebase/auth';
import { auth } from './firebase';
import { createUser, getUser } from './firestore-collections';
import { User } from '../types';

// Configure email link sign-in
const actionCodeSettings: ActionCodeSettings = {
  // URL you want to redirect back to. The domain (www.example.com) for this
  // URL must be in the authorized domains list in the Firebase Console.
  url: process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000/auth/verify',
  // This must be true.
  handleCodeInApp: true,
  // Optional: Configure additional state
  dynamicLinkDomain: undefined, // Will use default domain
};

// Google provider
const googleProvider = new GoogleAuthProvider();
googleProvider.addScope('email');
googleProvider.addScope('profile');

// Send email link for sign-in
export const sendEmailLink = async (email: string): Promise<void> => {
  try {
    await sendSignInLinkToEmail(auth, email, actionCodeSettings);
    // Save email to localStorage for when user returns
    if (typeof window !== 'undefined') {
      window.localStorage.setItem('emailForSignIn', email);
    }
  } catch (error) {
    console.error('Error sending email link:', error);
    throw error;
  }
};

// Sign in with email link
export const signInWithLink = async (url: string, email?: string): Promise<User> => {
  try {
    // Check if the link is valid
    if (!isSignInWithEmailLink(auth, url)) {
      throw new Error('Invalid sign-in link');
    }

    // Get email from parameter or localStorage
    let emailForSignIn = email;
    if (!emailForSignIn && typeof window !== 'undefined') {
      emailForSignIn = window.localStorage.getItem('emailForSignIn');
    }

    if (!emailForSignIn) {
      throw new Error('Email is required for email link sign-in');
    }

    // Sign in with email link
    const result = await signInWithEmailLink(auth, emailForSignIn, url);

    // Clear email from localStorage
    if (typeof window !== 'undefined') {
      window.localStorage.removeItem('emailForSignIn');
    }

    // Create or get user record
    const user = await ensureUserRecord(result.user);
    return user;
  } catch (error) {
    console.error('Error signing in with email link:', error);
    throw error;
  }
};

// Sign in with Google
export const signInWithGoogle = async (): Promise<User> => {
  try {
    const result = await signInWithPopup(auth, googleProvider);
    const user = await ensureUserRecord(result.user);
    return user;
  } catch (error) {
    console.error('Error signing in with Google:', error);
    throw error;
  }
};

// Sign out
export const signOutUser = async (): Promise<void> => {
  try {
    await signOut(auth);
  } catch (error) {
    console.error('Error signing out:', error);
    throw error;
  }
};

// Create or update user record in Firestore
const ensureUserRecord = async (firebaseUser: FirebaseUser): Promise<User> => {
  try {
    // Check if user already exists
    let user = await getUser(firebaseUser.uid);

    if (!user) {
      // Create new user record
      const userData: Omit<User, 'id'> = {
        email: firebaseUser.email!,
        displayName: firebaseUser.displayName || undefined,
        photoURL: firebaseUser.photoURL || undefined,
        credits: 10, // Give new users 10 free credits
        createdAt: new Date(),
        updatedAt: new Date()
      };

      await createUser(firebaseUser.uid, userData);
      user = await getUser(firebaseUser.uid);
    }

    if (!user) {
      throw new Error('Failed to create user record');
    }

    return user;
  } catch (error) {
    console.error('Error ensuring user record:', error);
    throw error;
  }
};

// Auth state observer
export const onAuthStateChange = (callback: (user: User | null) => void) => {
  return onAuthStateChanged(auth, async (firebaseUser) => {
    if (firebaseUser) {
      try {
        const user = await getUser(firebaseUser.uid);
        callback(user);
      } catch (error) {
        console.error('Error getting user data:', error);
        callback(null);
      }
    } else {
      callback(null);
    }
  });
};

// Get current user
export const getCurrentUser = async (): Promise<User | null> => {
  const firebaseUser = auth.currentUser;
  if (!firebaseUser) return null;

  try {
    return await getUser(firebaseUser.uid);
  } catch (error) {
    console.error('Error getting current user:', error);
    return null;
  }
};

// Check if user is authenticated
export const isAuthenticated = (): boolean => {
  return !!auth.currentUser;
};