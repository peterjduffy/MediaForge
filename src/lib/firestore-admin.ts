// Server-side Firestore operations (for API routes and server actions)
import { db } from './firebase';
import {
  collection,
  doc,
  addDoc,
  getDoc,
  getDocs,
  updateDoc,
  query,
  where,
  orderBy,
  limit,
  Timestamp
} from 'firebase/firestore';
import { User, Generation, Transaction, JobQueue } from '../types';

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

// Transaction operations (server-only)
export const createTransaction = async (transactionData: Omit<Transaction, 'id'>) => {
  const transactionRef = await addDoc(collection(db, 'transactions'), {
    ...transactionData,
    createdAt: new Date()
  });
  return transactionRef;
};

export const updateTransaction = async (transactionId: string, updates: Partial<Transaction>) => {
  const transactionRef = doc(db, 'transactions', transactionId);
  await updateDoc(transactionRef, updates);
};

// Job Queue operations (server-only)
export const createJob = async (jobData: Omit<JobQueue, 'id'>) => {
  const jobRef = await addDoc(collection(db, 'jobQueue'), {
    ...jobData,
    createdAt: new Date(),
    attempts: 0
  });
  return jobRef;
};

export const getJob = async (jobId: string): Promise<JobQueue | null> => {
  const jobRef = doc(db, 'jobQueue', jobId);
  const jobSnap = await getDoc(jobRef);

  if (jobSnap.exists()) {
    return convertTimestamps<JobQueue>({ id: jobSnap.id, ...jobSnap.data() });
  }
  return null;
};

export const updateJob = async (jobId: string, updates: Partial<JobQueue>) => {
  const jobRef = doc(db, 'jobQueue', jobId);
  await updateDoc(jobRef, updates);
};

export const getQueuedJobs = async (type?: string, limitCount = 10): Promise<JobQueue[]> => {
  let q = query(
    collection(db, 'jobQueue'),
    where('status', '==', 'queued'),
    orderBy('priority', 'desc'),
    orderBy('createdAt', 'asc'),
    limit(limitCount)
  );

  if (type) {
    q = query(
      collection(db, 'jobQueue'),
      where('status', '==', 'queued'),
      where('type', '==', type),
      orderBy('priority', 'desc'),
      orderBy('createdAt', 'asc'),
      limit(limitCount)
    );
  }

  const querySnapshot = await getDocs(q);
  return querySnapshot.docs.map(doc =>
    convertTimestamps<JobQueue>({ id: doc.id, ...doc.data() })
  );
};

// Credit management operations
export const deductCredits = async (userId: string, amount: number): Promise<boolean> => {
  const userRef = doc(db, 'users', userId);
  const userSnap = await getDoc(userRef);

  if (!userSnap.exists()) {
    throw new Error('User not found');
  }

  const userData = userSnap.data() as User;
  if (userData.credits < amount) {
    return false; // Insufficient credits
  }

  await updateDoc(userRef, {
    credits: userData.credits - amount,
    updatedAt: new Date()
  });

  // Create transaction record
  await createTransaction({
    userId,
    type: 'generation',
    amount: -amount,
    credits: amount,
    description: `Used ${amount} credits for generation`,
    status: 'completed',
    createdAt: new Date()
  });

  return true;
};

export const addCredits = async (userId: string, amount: number, description: string): Promise<void> => {
  const userRef = doc(db, 'users', userId);
  const userSnap = await getDoc(userRef);

  if (!userSnap.exists()) {
    throw new Error('User not found');
  }

  const userData = userSnap.data() as User;
  await updateDoc(userRef, {
    credits: userData.credits + amount,
    updatedAt: new Date()
  });

  // Create transaction record
  await createTransaction({
    userId,
    type: 'credit_purchase',
    amount: amount,
    credits: amount,
    description,
    status: 'completed',
    createdAt: new Date()
  });
};

// Admin operations
export const getAllUsers = async (limitCount = 100): Promise<User[]> => {
  const q = query(
    collection(db, 'users'),
    orderBy('createdAt', 'desc'),
    limit(limitCount)
  );

  const querySnapshot = await getDocs(q);
  return querySnapshot.docs.map(doc =>
    convertTimestamps<User>({ id: doc.id, ...doc.data() })
  );
};

export const getAllGenerations = async (limitCount = 100): Promise<Generation[]> => {
  const q = query(
    collection(db, 'generations'),
    orderBy('createdAt', 'desc'),
    limit(limitCount)
  );

  const querySnapshot = await getDocs(q);
  return querySnapshot.docs.map(doc =>
    convertTimestamps<Generation>({ id: doc.id, ...doc.data() })
  );
};