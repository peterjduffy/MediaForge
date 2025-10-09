import { db, auth } from './firebase'
import { doc, collection, updateDoc, serverTimestamp, getDoc, query, where, getDocs } from 'firebase/firestore'
import { getIdToken } from 'firebase/auth'
import { getUserTeam, deductTeamCredits } from './team-service'
import { getCreditsForResolution } from './credits'

interface GenerationRequest {
  userId: string
  prompt: string
  styleId: string
  styleName: string
  width?: number
  height?: number
}

interface GenerationResponse {
  success: boolean
  imageURL?: string
  thumbnailURL?: string
  generationTime?: number
  error?: string
  illustrationId?: string
}

interface BrandData {
  id: string
  name: string
  status: 'preparing' | 'queued' | 'training' | 'ready' | 'failed'
  loraModelPath?: string
  colors?: Array<{ hex: string; name?: string }>
}

// Toggle between mock and real generation
const MOCK_GENERATION = false

// Service endpoints - ASYNC ARCHITECTURE (Phase 5C)
// Using Firebase Hosting rewrite to proxy to private Cloud Run service
// This avoids CORS issues and org policy restrictions
const API_GATEWAY_ENDPOINT = '/api'

// Model selection is now handled by the API Gateway and Worker
// Frontend just submits jobs and listens to Firestore for status updates

/**
 * Generate an illustration using AI with transparent model selection
 */
export async function generateIllustration(
  request: GenerationRequest
): Promise<GenerationResponse> {
  let illustrationId: string | undefined

  try {
    // Check if user is part of a team
    const team = await getUserTeam(request.userId)

    // Calculate credits based on resolution
    const width = request.width || 1024
    const height = request.height || 1024
    const creditsUsed = getCreditsForResolution(width, height)

    // Check if user/team has sufficient credits BEFORE generation
    if (team) {
      if (team.credits < creditsUsed) {
        return {
          success: false,
          error: 'Insufficient team credits'
        }
      }
    }

    // NOTE: Illustration document is now created by API Gateway with 'queued' status
    // We don't create it here anymore - the gateway handles that

    if (MOCK_GENERATION) {
      // Mock mode not supported with async architecture
      // Use the real async flow for testing
      throw new Error('Mock generation not supported in async architecture. Set MOCK_GENERATION = false')
    } else {
      // NEW ASYNC ARCHITECTURE: Call API Gateway to queue job
      // The gateway returns immediately with jobId, Firestore listeners handle status updates

      // Get Firebase Auth token for authenticated request
      const currentUser = auth.currentUser
      if (!currentUser) {
        console.error('No authenticated user found')
        throw new Error('User not authenticated')
      }

      console.log('Getting auth token for user:', currentUser.uid)
      const idToken = await getIdToken(currentUser)
      console.log('Auth token obtained, length:', idToken?.length)

      const endpoint = `${API_GATEWAY_ENDPOINT}/generate`
      console.log('Calling API Gateway:', endpoint)

      const response = await fetch(endpoint, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${idToken}`
        },
        body: JSON.stringify({
          userId: request.userId,
          prompt: request.prompt,
          styleId: request.styleId,
          styleName: request.styleName,
          width,
          height
        })
      })

      console.log('API Gateway response status:', response.status, response.statusText)

      if (!response.ok) {
        const error = await response.json()
        console.error('API Gateway error response:', error)
        throw new Error(error.error || 'Failed to queue generation job')
      }

      const result = await response.json()
      console.log('API Gateway success response:', result)

      // Return immediately - the worker will process async and update Firestore
      // Frontend listeners will pick up the status changes (queued → processing → completed)
      return {
        success: true,
        illustrationId: result.illustrationId
      }
    }
  } catch (error) {
    console.error('Generation error:', error)
    const errorMessage = error instanceof Error ? error.message : 'Failed to generate illustration'

    // Note: We don't update Firestore here because:
    // 1. The API Gateway creates the illustration document, not the frontend
    // 2. If the request fails before reaching the gateway, there's no illustrationId
    // 3. The gateway/worker will handle status updates for queued jobs

    return {
      success: false,
      error: errorMessage
    }
  }
}

/**
 * Start brand training for Business tier users
 */
export async function startBrandTraining(
  userId: string,
  brandName: string,
  brandColors: Array<{ hex: string; name?: string }>,
  trainingImages: string[]
): Promise<{ success: boolean; brandId?: string; error?: string }> {
  try {
    // Verify user is Business tier
    const userDoc = await getDoc(doc(db, 'users', userId))
    const userData = userDoc.data()
    const isBusinessTier = userData?.tier === 'business' || userData?.subscription?.plan === 'business'

    if (!isBusinessTier) {
      return {
        success: false,
        error: 'Brand training is only available for Business tier users'
      }
    }

    // Check if user already has a brand (first one is free)
    const brandsQuery = query(collection(db, 'users', userId, 'brands'))
    const brandsSnapshot = await getDocs(brandsQuery)
    const existingBrands = brandsSnapshot.size

    if (existingBrands > 0 && !userData?.additionalBrandsPurchased) {
      return {
        success: false,
        error: 'You have already used your free brand training. Additional brands cost $29 each.'
      }
    }

    // NEW ASYNC ARCHITECTURE: Call API Gateway to queue training job

    // Get Firebase Auth token for authenticated request
    const currentUser = auth.currentUser
    if (!currentUser) {
      throw new Error('User not authenticated')
    }

    const idToken = await getIdToken(currentUser)

    const response = await fetch(`${API_GATEWAY_ENDPOINT}/train-brand`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${idToken}`
      },
      body: JSON.stringify({
        userId,
        brandName,
        brandColors,
        trainingImages
      })
    })

    if (!response.ok) {
      const error = await response.json()
      throw new Error(error.error || 'Failed to start training')
    }

    const result = await response.json()

    return {
      success: true,
      brandId: result.brandId
    }
  } catch (error) {
    console.error('Brand training error:', error)
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Failed to start brand training'
    }
  }
}

/**
 * Check brand training status
 */
export async function checkBrandStatus(
  userId: string,
  brandId: string
): Promise<{
  status: 'preparing' | 'queued' | 'training' | 'ready' | 'failed'
  name?: string
  progress?: number
}> {
  try {
    const brandRef = doc(db, 'users', userId, 'brands', brandId)
    const brandDoc = await getDoc(brandRef)

    if (!brandDoc.exists()) {
      return { status: 'failed' }
    }

    const data = brandDoc.data()

    // Calculate progress based on status
    let progress = 0
    switch (data.status) {
      case 'preparing': progress = 10; break
      case 'queued': progress = 20; break
      case 'training': progress = 50; break
      case 'ready': progress = 100; break
    }

    return {
      status: data.status,
      name: data.name,
      progress
    }
  } catch (error) {
    console.error('Status check error:', error)
    return { status: 'failed' }
  }
}

/**
 * Get user's trained brands
 */
export async function getUserBrands(userId: string): Promise<BrandData[]> {
  try {
    const brandsQuery = query(
      collection(db, 'users', userId, 'brands'),
      where('status', '==', 'ready')
    )
    const snapshot = await getDocs(brandsQuery)

    return snapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    } as BrandData))
  } catch (error) {
    console.error('Error fetching brands:', error)
    return []
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