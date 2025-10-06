
import { initializeApp } from "firebase/app";
import { getAuth, connectAuthEmulator } from "firebase/auth";
import { getFirestore, connectFirestoreEmulator } from "firebase/firestore";
import { getStorage, connectStorageEmulator } from "firebase/storage";

const firebaseConfig = {
  projectId: "mediaforge-957e4",
  appId: "1:261323568725:web:5dc33d4e9b22635c4986dc",
  storageBucket: "mediaforge-957e4.firebasestorage.app",
  apiKey: "AIzaSyBcBk7fWcKiI3WugE0hLJof4Ura7Nu9iV4",
  authDomain: "mediaforge-957e4.firebaseapp.com",
  messagingSenderId: "261323568725",
  measurementId: "G-T4VLRX5078"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);

// Initialize services
export const auth = getAuth(app);
export const db = getFirestore(app);
export const storage = getStorage(app);

// Connect to emulators in development
if (process.env.NODE_ENV === 'development' && typeof window !== 'undefined') {
  let authConnected = false;
  let firestoreConnected = false;
  let storageConnected = false;

  try {
    connectAuthEmulator(auth, 'http://localhost:9099', { disableWarnings: true });
    authConnected = true;
    console.log('🔧 Connected to Auth Emulator');
  } catch (error) {
    if (error instanceof Error && error.message.includes('already')) {
      authConnected = true;
    } else {
      console.warn('⚠️  Failed to connect to Auth Emulator:', error);
      console.warn('   Make sure Firebase emulators are running: firebase emulators:start');
    }
  }

  try {
    connectFirestoreEmulator(db, 'localhost', 8080);
    firestoreConnected = true;
    console.log('🔧 Connected to Firestore Emulator');
  } catch (error) {
    if (error instanceof Error && error.message.includes('already')) {
      firestoreConnected = true;
    } else {
      console.warn('⚠️  Failed to connect to Firestore Emulator:', error);
    }
  }

  try {
    connectStorageEmulator(storage, 'localhost', 9199);
    storageConnected = true;
    console.log('🔧 Connected to Storage Emulator');
  } catch (error) {
    if (error instanceof Error && error.message.includes('already')) {
      storageConnected = true;
    } else {
      console.warn('⚠️  Failed to connect to Storage Emulator:', error);
    }
  }

  // Warn if running in development without emulators
  if (!authConnected || !firestoreConnected || !storageConnected) {
    console.warn('⚠️  Running in DEVELOPMENT mode but not all emulators are connected!');
    console.warn('   This may connect to PRODUCTION Firebase. To use emulators, run:');
    console.warn('   → firebase emulators:start');
  }
}

export default app;
