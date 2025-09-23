import { Firestore } from '@google-cloud/firestore';
import type { User, Generation, StylePack, Transaction } from '@/types';

const firestore = new Firestore({
  projectId: process.env.GOOGLE_CLOUD_PROJECT,
});

export const collections = {
  users: firestore.collection('users'),
  generations: firestore.collection('generations'),
  styles: firestore.collection('styles'),
  transactions: firestore.collection('transactions'),
  jobs: firestore.collection('jobs'),
};

export const userService = {
  async get(userId: string): Promise<User | null> {
    const doc = await collections.users.doc(userId).get();
    return doc.exists ? (doc.data() as User) : null;
  },

  async create(user: Partial<User>): Promise<User> {
    const newUser: User = {
      id: user.id || '',
      email: user.email || '',
      credits: 10,
      createdAt: new Date(),
      updatedAt: new Date(),
      ...user,
    };
    await collections.users.doc(newUser.id).set(newUser);
    return newUser;
  },

  async updateCredits(userId: string, credits: number): Promise<void> {
    await collections.users.doc(userId).update({
      credits,
      updatedAt: new Date(),
    });
  },

  async deductCredits(userId: string, amount: number): Promise<boolean> {
    const user = await this.get(userId);
    if (!user || user.credits < amount) {
      return false;
    }
    await this.updateCredits(userId, user.credits - amount);
    return true;
  },
};

export const generationService = {
  async create(generation: Partial<Generation>): Promise<Generation> {
    const doc = collections.generations.doc();
    const newGeneration: Generation = {
      id: doc.id,
      status: 'pending',
      creditsUsed: 1,
      createdAt: new Date(),
      ...generation,
    } as Generation;
    await doc.set(newGeneration);
    return newGeneration;
  },

  async update(id: string, updates: Partial<Generation>): Promise<void> {
    await collections.generations.doc(id).update(updates);
  },

  async getUserGenerations(userId: string, limit = 20): Promise<Generation[]> {
    const snapshot = await collections.generations
      .where('userId', '==', userId)
      .orderBy('createdAt', 'desc')
      .limit(limit)
      .get();
    return snapshot.docs.map(doc => doc.data() as Generation);
  },
};

export const styleService = {
  async getPublicStyles(): Promise<StylePack[]> {
    const snapshot = await collections.styles
      .where('isPublic', '==', true)
      .get();
    return snapshot.docs.map(doc => doc.data() as StylePack);
  },

  async getUserStyles(userId: string): Promise<StylePack[]> {
    const snapshot = await collections.styles
      .where('ownerId', '==', userId)
      .get();
    return snapshot.docs.map(doc => doc.data() as StylePack);
  },

  async get(styleId: string): Promise<StylePack | null> {
    const doc = await collections.styles.doc(styleId).get();
    return doc.exists ? (doc.data() as StylePack) : null;
  },
};

export const transactionService = {
  async create(transaction: Partial<Transaction>): Promise<Transaction> {
    const doc = collections.transactions.doc();
    const newTransaction: Transaction = {
      id: doc.id,
      status: 'pending',
      createdAt: new Date(),
      ...transaction,
    } as Transaction;
    await doc.set(newTransaction);
    return newTransaction;
  },

  async getUserTransactions(userId: string, limit = 50): Promise<Transaction[]> {
    const snapshot = await collections.transactions
      .where('userId', '==', userId)
      .orderBy('createdAt', 'desc')
      .limit(limit)
      .get();
    return snapshot.docs.map(doc => doc.data() as Transaction);
  },
};