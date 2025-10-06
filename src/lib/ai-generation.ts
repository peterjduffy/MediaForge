import { db, auth } from './firebase'
import { doc, addDoc, collection, updateDoc, serverTimestamp, getDoc, query, where, getDocs } from 'firebase/firestore'
import { getIdToken } from 'firebase/auth'
import { getUserTeam, deductTeamCredits } from './team-service'

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

// Service endpoints
const IMAGEN3_ENDPOINT = 'https://generateimage-261323568725.us-central1.run.app'
const SDXL_ENDPOINT = 'https://sdxl-lora-service.us-central1.run.app' // Will be deployed

/**
 * Check if user has a trained brand for the given style
 */
async function getUserBrand(userId: string, styleId: string): Promise<BrandData | null> {
  try {
    // Check if this is a brand style (starts with 'brand_')
    if (!styleId.startsWith('brand_')) {
      return null
    }

    const brandId = styleId.replace('brand_', '')
    const brandRef = doc(db, 'users', userId, 'brands', brandId)
    const brandDoc = await getDoc(brandRef)

    if (!brandDoc.exists()) {
      return null
    }

    return brandDoc.data() as BrandData
  } catch (error) {
    console.error('Error fetching brand:', error)
    return null
  }
}

/**
 * Determine which model to use based on user tier and brand training status
 */
async function selectGenerationModel(userId: string, styleId: string): Promise<{
  endpoint: string
  model: 'imagen3' | 'sdxl-lora'
  brandData?: BrandData
}> {
  // Check if user has Business tier (would be in user profile)
  const userDoc = await getDoc(doc(db, 'users', userId))
  const userData = userDoc.data()
  const isBusinessTier = userData?.tier === 'business' || userData?.subscription?.plan === 'business'

  // Free tier always uses Imagen 3
  if (!isBusinessTier) {
    return { endpoint: IMAGEN3_ENDPOINT, model: 'imagen3' }
  }

  // Business tier: check if brand is trained
  const brand = await getUserBrand(userId, styleId)

  if (brand && brand.status === 'ready' && brand.loraModelPath) {
    // Use SDXL + LoRA for trained brands
    return {
      endpoint: SDXL_ENDPOINT,
      model: 'sdxl-lora',
      brandData: brand
    }
  }

  // Default to Imagen 3
  return { endpoint: IMAGEN3_ENDPOINT, model: 'imagen3' }
}

/**
 * Generate an illustration using AI with transparent model selection
 */
export async function generateIllustration(
  request: GenerationRequest
): Promise<GenerationResponse> {
  try {
    // Check if user is part of a team
    const team = await getUserTeam(request.userId)

    // Determine which model to use (transparent to user)
    const { endpoint, model, brandData } = await selectGenerationModel(
      request.userId,
      request.styleId
    )

    console.log(`Using ${model} for generation`, { styleId: request.styleId, brandData })

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

    // Create illustration document in Firestore first
    const illustrationData = {
      userId: request.userId,
      teamId: team?.id || null,
      prompt: request.prompt,
      styleId: request.styleId,
      styleName: request.styleName,
      status: 'processing',
      createdAt: serverTimestamp(),
      finalPrompt: `${request.styleName} style: ${request.prompt}`,
      creditsUsed,
      width,
      height,
      modelToUse: model,
      brandId: brandData?.id
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

      // ✅ Deduct credits AFTER successful generation
      if (team) {
        await deductTeamCredits(team.id, request.userId, creditsUsed)
      }

      return {
        success: true,
        imageURL,
        thumbnailURL,
        generationTime: Math.floor(delay / 1000),
        illustrationId
      }
    } else {
      // Real generation with transparent model selection
      const requestBody = model === 'sdxl-lora' ? {
        // SDXL + LoRA request
        userId: request.userId,
        illustrationId,
        prompt: request.prompt,
        brandId: brandData?.id,
        width,
        height
      } : {
        // Imagen 3 request
        userId: request.userId,
        prompt: request.prompt,
        styleId: request.styleId,
        illustrationId
      }

      const response = await fetch(endpoint, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(requestBody)
      })

      if (!response.ok) {
        const error = await response.json()
        throw new Error(error.details || 'Generation failed')
      }

      const result = await response.json()

      // ✅ Deduct credits AFTER successful generation
      if (team) {
        await deductTeamCredits(team.id, request.userId, creditsUsed)
      }

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

    // Mark illustration as failed (don't deduct credits)
    // Note: illustrationId may not exist if error occurred before creation

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

    // Generate brand ID
    const brandId = `brand_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`

    // Call mock training endpoint on Cloud Run
    const trainingEndpoint = 'https://mock-training-261323568725.us-central1.run.app'

    // Get Firebase Auth token for authenticated request
    const currentUser = auth.currentUser
    let idToken = ''
    if (currentUser) {
      idToken = await getIdToken(currentUser)
    }

    const response = await fetch(trainingEndpoint, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${idToken}`
      },
      body: JSON.stringify({
        userId,
        brandId,
        brandName,
        brandColors,
        trainingImages
      })
    })

    if (!response.ok) {
      const error = await response.json()
      throw new Error(error.error || 'Failed to start training')
    }

    await response.json()

    return {
      success: true,
      brandId
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