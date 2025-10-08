import { db } from './firebase'
import { collection, addDoc, serverTimestamp } from 'firebase/firestore'

/**
 * Event types for UAT tracking
 */
export type EventType =
  | 'user_signup'
  | 'first_generation_started'
  | 'generation_completed'
  | 'generation_failed'
  | 'team_created'
  | 'team_invite_sent'
  | 'team_invite_accepted'
  | 'brand_training_started'
  | 'brand_training_completed'

interface EventData {
  userId?: string
  eventType: EventType
  metadata?: Record<string, unknown>
}

/**
 * Log an event to Firestore for UAT tracking
 */
export async function logEvent(data: EventData): Promise<void> {
  try {
    await addDoc(collection(db, 'events'), {
      ...data,
      timestamp: serverTimestamp(),
      createdAt: new Date().toISOString() // For immediate client-side use
    })
  } catch (error) {
    // Don't fail the user flow if event logging fails
    console.error('Failed to log event:', error)
  }
}

/**
 * Helper to log user signup
 */
export async function logUserSignup(userId: string, email: string): Promise<void> {
  await logEvent({
    userId,
    eventType: 'user_signup',
    metadata: { email }
  })
}

/**
 * Helper to log first generation started
 */
export async function logFirstGenerationStarted(userId: string): Promise<void> {
  await logEvent({
    userId,
    eventType: 'first_generation_started'
  })
}

/**
 * Helper to log generation completed
 */
export async function logGenerationCompleted(
  userId: string,
  illustrationId: string,
  metadata?: Record<string, unknown>
): Promise<void> {
  await logEvent({
    userId,
    eventType: 'generation_completed',
    metadata: {
      illustrationId,
      ...metadata
    }
  })
}

/**
 * Helper to log generation failed
 */
export async function logGenerationFailed(
  userId: string,
  error: string,
  metadata?: Record<string, unknown>
): Promise<void> {
  await logEvent({
    userId,
    eventType: 'generation_failed',
    metadata: {
      error,
      ...metadata
    }
  })
}

/**
 * Helper to log team invite sent
 */
export async function logTeamInviteSent(
  userId: string,
  teamId: string,
  inviteeEmail: string
): Promise<void> {
  await logEvent({
    userId,
    eventType: 'team_invite_sent',
    metadata: {
      teamId,
      inviteeEmail
    }
  })
}

/**
 * Helper to log team invite accepted
 */
export async function logTeamInviteAccepted(
  userId: string,
  teamId: string
): Promise<void> {
  await logEvent({
    userId,
    eventType: 'team_invite_accepted',
    metadata: {
      teamId
    }
  })
}

/**
 * Helper to log brand training started
 */
export async function logBrandTrainingStarted(
  userId: string,
  brandId: string
): Promise<void> {
  await logEvent({
    userId,
    eventType: 'brand_training_started',
    metadata: {
      brandId
    }
  })
}

/**
 * Helper to log brand training completed
 */
export async function logBrandTrainingCompleted(
  userId: string,
  brandId: string
): Promise<void> {
  await logEvent({
    userId,
    eventType: 'brand_training_completed',
    metadata: {
      brandId
    }
  })
}
