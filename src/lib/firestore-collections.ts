import {
  collection,
  doc,
  addDoc,
  setDoc,
  getDoc,
  getDocs,
  updateDoc,
  query,
  where,
  orderBy,
  limit,
  Timestamp
} from 'firebase/firestore';
import { db } from './firebase';
import { User, Generation, StylePack, Transaction } from '../types';

// Collection references
export const usersCollection = collection(db, 'users');
export const generationsCollection = collection(db, 'generations');
export const stylePacksCollection = collection(db, 'stylePacks');
export const transactionsCollection = collection(db, 'transactions');
export const jobQueueCollection = collection(db, 'jobQueue');

// Helper function to convert Firestore timestamps to Date objects
const convertTimestamps = <T>(data: Record<string, unknown>): T => {
  const converted = { ...data };
  Object.keys(converted).forEach(key => {
    if (converted[key] instanceof Timestamp) {
      converted[key] = (converted[key] as Timestamp).toDate();
    }
    if (converted[key] && typeof converted[key] === 'object' && !Array.isArray(converted[key])) {
      Object.keys(converted[key] as Record<string, unknown>).forEach(subKey => {
        if ((converted[key] as Record<string, unknown>)[subKey] instanceof Timestamp) {
          (converted[key] as Record<string, unknown>)[subKey] = ((converted[key] as Record<string, unknown>)[subKey] as Timestamp).toDate();
        }
      });
    }
  });
  return converted as T;
};

// Users CRUD operations
export const createUser = async (userId: string, userData: Omit<User, 'id'>) => {
  const userRef = doc(usersCollection, userId);
  await setDoc(userRef, {
    ...userData,
    createdAt: new Date(),
    updatedAt: new Date()
  });
  return userRef;
};

export const getUser = async (userId: string): Promise<User | null> => {
  const userRef = doc(usersCollection, userId);
  const userSnap = await getDoc(userRef);

  if (userSnap.exists()) {
    return convertTimestamps<User>({ id: userSnap.id, ...userSnap.data() });
  }
  return null;
};

export const updateUser = async (userId: string, updates: Partial<User>) => {
  const userRef = doc(usersCollection, userId);
  await updateDoc(userRef, {
    ...updates,
    updatedAt: new Date()
  });
};

// Generations CRUD operations
export const createGeneration = async (generationData: Omit<Generation, 'id'>) => {
  const generationRef = await addDoc(generationsCollection, {
    ...generationData,
    createdAt: new Date()
  });
  return generationRef;
};

export const getGeneration = async (generationId: string): Promise<Generation | null> => {
  const generationRef = doc(generationsCollection, generationId);
  const generationSnap = await getDoc(generationRef);

  if (generationSnap.exists()) {
    return convertTimestamps<Generation>({ id: generationSnap.id, ...generationSnap.data() });
  }
  return null;
};

export const getUserGenerations = async (userId: string, limitCount = 20): Promise<Generation[]> => {
  const q = query(
    generationsCollection,
    where('userId', '==', userId),
    orderBy('createdAt', 'desc'),
    limit(limitCount)
  );

  const querySnapshot = await getDocs(q);
  return querySnapshot.docs.map(doc =>
    convertTimestamps<Generation>({ id: doc.id, ...doc.data() })
  );
};

export const updateGeneration = async (generationId: string, updates: Partial<Generation>) => {
  const generationRef = doc(generationsCollection, generationId);
  await updateDoc(generationRef, updates);
};

// Style Packs CRUD operations
export const createStylePack = async (stylePackData: Omit<StylePack, 'id'>) => {
  const stylePackRef = await addDoc(stylePacksCollection, {
    ...stylePackData,
    createdAt: new Date(),
    updatedAt: new Date()
  });
  return stylePackRef;
};

export const getStylePack = async (stylePackId: string): Promise<StylePack | null> => {
  const stylePackRef = doc(stylePacksCollection, stylePackId);
  const stylePackSnap = await getDoc(stylePackRef);

  if (stylePackSnap.exists()) {
    return convertTimestamps<StylePack>({ id: stylePackSnap.id, ...stylePackSnap.data() });
  }
  return null;
};

export const getPublicStylePacks = async (): Promise<StylePack[]> => {
  const q = query(
    stylePacksCollection,
    where('isPublic', '==', true),
    orderBy('createdAt', 'desc')
  );

  const querySnapshot = await getDocs(q);
  return querySnapshot.docs.map(doc =>
    convertTimestamps<StylePack>({ id: doc.id, ...doc.data() })
  );
};

export const getUserStylePacks = async (userId: string): Promise<StylePack[]> => {
  const q = query(
    stylePacksCollection,
    where('ownerId', '==', userId),
    orderBy('createdAt', 'desc')
  );

  const querySnapshot = await getDocs(q);
  return querySnapshot.docs.map(doc =>
    convertTimestamps<StylePack>({ id: doc.id, ...doc.data() })
  );
};

export const updateStylePack = async (stylePackId: string, updates: Partial<StylePack>) => {
  const stylePackRef = doc(stylePacksCollection, stylePackId);
  await updateDoc(stylePackRef, {
    ...updates,
    updatedAt: new Date()
  });
};

// Transactions CRUD operations (read-only for client)
export const getUserTransactions = async (userId: string, limitCount = 50): Promise<Transaction[]> => {
  const q = query(
    transactionsCollection,
    where('userId', '==', userId),
    orderBy('createdAt', 'desc'),
    limit(limitCount)
  );

  const querySnapshot = await getDocs(q);
  return querySnapshot.docs.map(doc =>
    convertTimestamps<Transaction>({ id: doc.id, ...doc.data() })
  );
};

export const getTransaction = async (transactionId: string): Promise<Transaction | null> => {
  const transactionRef = doc(transactionsCollection, transactionId);
  const transactionSnap = await getDoc(transactionRef);

  if (transactionSnap.exists()) {
    return convertTimestamps<Transaction>({ id: transactionSnap.id, ...transactionSnap.data() });
  }
  return null;
};