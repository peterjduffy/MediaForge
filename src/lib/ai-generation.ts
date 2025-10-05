import { db } from './firebase'
import { doc, addDoc, collection, updateDoc, serverTimestamp, getDoc } from 'firebase/firestore'

interface GenerationRequest {
  userId: string
  prompt: string
  styleId: string
  styleName: string
}

interface GenerationResponse {
  success: boolean
  imageURL?: string
  thumbnailURL?: string
  generationTime?: number
  error?: string
  illustrationId?: string
}

// For now, we'll use a mock generation that still tracks in Firestore
// This will be replaced with a real Cloud Function call later
const MOCK_GENERATION = true

/**
 * Generate an illustration using AI
 * Initially uses mock generation, will be upgraded to real Vertex AI
 */
export async function generateIllustration(
  request: GenerationRequest
): Promise<GenerationResponse> {
  try {
    // Create illustration document in Firestore first
    const illustrationData = {
      userId: request.userId,
      prompt: request.prompt,
      styleId: request.styleId,
      styleName: request.styleName,
      status: 'processing',
      createdAt: serverTimestamp(),
      finalPrompt: `${request.styleName} style: ${request.prompt}`,
      creditsUsed: 1
    }

    const docRef = await addDoc(collection(db, 'illustrations'), illustrationData)
    const illustrationId = docRef.id

    if (MOCK_GENERATION) {
      // Mock generation with picsum
      const delay = Math.floor(Math.random() * 3000) + 12000 // 12-15 seconds

      // Simulate processing delay
      await new Promise(resolve => setTimeout(resolve, delay))

      // Generate mock URLs
      const seed = `${request.styleId}${Date.now()}`
      const imageURL = `https://picsum.photos/seed/${seed}/1024/1024`
      const thumbnailURL = `https://picsum.photos/seed/${seed}/256/256`

      // Update illustration with generated data
      await updateDoc(doc(db, 'illustrations', illustrationId), {
        status: 'completed',
        imageURL,
        thumbnailURL,
        generationTime: Math.floor(delay / 1000),
        modelUsed: 'mock-picsum',
        width: 1024,
        height: 1024,
        completedAt: serverTimestamp()
      })

      return {
        success: true,
        imageURL,
        thumbnailURL,
        generationTime: Math.floor(delay / 1000),
        illustrationId
      }
    } else {
      // Real Cloud Function call (to be implemented)
      const functionUrl = `https://us-central1-mediaforge-957e4.cloudfunctions.net/generateImage`

      const response = await fetch(functionUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          userId: request.userId,
          prompt: request.prompt,
          styleId: request.styleId,
          illustrationId
        })
      })

      if (!response.ok) {
        const error = await response.json()
        throw new Error(error.details || 'Generation failed')
      }

      const result = await response.json()

      return {
        success: true,
        imageURL: result.imageURL,
        thumbnailURL: result.thumbnailURL,
        generationTime: result.generationTime,
        illustrationId
      }
    }
  } catch (error) {
    console.error('Generation error:', error)
    const errorMessage = error instanceof Error ? error.message : 'Failed to generate illustration'

    return {
      success: false,
      error: errorMessage
    }
  }
}

/**
 * Check if user has available credits
 */
export async function checkCredits(userId: string): Promise<{ hasCredits: boolean; creditsRemaining: number }> {
  try {
    const userDocRef = doc(db, 'users', userId)
    const userData = await getDoc(userDocRef)

    if (!userData.exists()) {
      return { hasCredits: false, creditsRemaining: 0 }
    }

    const data = userData.data()
    const plan = data.subscriptionTier || 'free'
    const creditsUsed = data.creditsUsed || 0
    const maxCredits = getCreditsForPlan(plan)
    const creditsRemaining = maxCredits - creditsUsed

    return {
      hasCredits: creditsRemaining > 0,
      creditsRemaining
    }
  } catch (error) {
    console.error('Error checking credits:', error)
    return { hasCredits: false, creditsRemaining: 0 }
  }
}

function getCreditsForPlan(plan: string): number {
  switch(plan) {
    case 'starter': return 100
    case 'pro': return 300
    case 'business': return 700
    default: return 5
  }
}