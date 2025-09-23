
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
  try {
    connectAuthEmulator(auth, 'http://localhost:9099');
  } catch (error) {
    // Already connected or other error
  }

  try {
    connectFirestoreEmulator(db, 'localhost', 8080);
  } catch (error) {
    // Already connected or other error
  }

  try {
    connectStorageEmulator(storage, 'localhost', 9199);
  } catch (error) {
    // Already connected or other error
  }
}

export default app;
