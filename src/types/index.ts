export interface User {
  id: string;
  email: string;
  displayName?: string;
  photoURL?: string;
  credits: number;
  subscription?: {
    id: string;
    status: 'active' | 'canceled' | 'past_due';
    plan: 'free' | 'basic' | 'pro';
    currentPeriodEnd: Date;
  };
  createdAt: Date;
  updatedAt: Date;
}

export interface Generation {
  id: string;
  userId: string;
  prompt: string;
  style: string;
  stylePackId?: string;
  status: 'pending' | 'processing' | 'completed' | 'failed';
  imageUrl?: string;
  vectorUrl?: string;
  exports?: {
    png?: string;
    svg?: string;
    eps?: string;
    pdf?: string;
  };
  metadata?: {
    width: number;
    height: number;
    model: string;
    seed?: number;
  };
  error?: string;
  creditsUsed: number;
  createdAt: Date;
  completedAt?: Date;
}

export interface StylePack {
  id: string;
  name: string;
  description: string;
  thumbnail: string;
  examples: string[];
  category: 'illustration' | 'icon' | 'logo' | 'pattern' | 'custom';
  isPublic: boolean;
  ownerId?: string;
  modelEndpoint?: string;
  loraPath?: string;
  baseModel: string;
  parameters?: {
    guidanceScale?: number;
    inferenceSteps?: number;
    negativePrompt?: string;
  };
  creditsPerGeneration: number;
  createdAt: Date;
  updatedAt: Date;
}

export interface Transaction {
  id: string;
  userId: string;
  type: 'credit_purchase' | 'generation' | 'subscription' | 'refund';
  amount: number;
  credits?: number;
  description: string;
  status: 'pending' | 'completed' | 'failed';
  stripePaymentIntentId?: string;
  metadata?: Record<string, unknown>;
  createdAt: Date;
}

export interface JobQueue {
  id: string;
  type: 'generation' | 'training' | 'vectorization';
  userId: string;
  status: 'queued' | 'processing' | 'completed' | 'failed';
  priority: number;
  payload: Record<string, unknown>;
  result?: Record<string, unknown>;
  error?: string;
  attempts: number;
  maxAttempts: number;
  createdAt: Date;
  startedAt?: Date;
  completedAt?: Date;
}