/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable @typescript-eslint/no-unused-vars */
/* eslint-disable @next/next/no-img-element */
'use client'

import { useState, useEffect } from 'react'
import { Loader2, Download, Copy, RefreshCw, Sparkles, ArrowDown } from 'lucide-react'
import { auth, db } from '@/lib/firebase'
import { onAuthStateChanged } from 'firebase/auth'
import { doc, getDoc, updateDoc, collection, query, where, orderBy, limit, onSnapshot } from 'firebase/firestore'
import WelcomeModal from '@/components/onboarding/WelcomeModal'
import SuccessModal from '@/components/onboarding/SuccessModal'
import { generateIllustration, getUserBrands } from '@/lib/ai-generation'
import { getCreditsForPlan } from '@/lib/credits'
import { logFirstGenerationStarted, logGenerationCompleted, logGenerationFailed } from '@/lib/events'

// Style definitions
const styles = [
  {
    id: 'google',
    name: 'Google',
    description: 'Clean, modern illustrations',
    thumbnail: '/styles/google-thumb.png',
    type: 'preset',
    examples: [
      'a team collaborating around a whiteboard',
      'person analyzing data on laptop',
      'customer service representative helping client'
    ]
  },
  {
    id: 'notion',
    name: 'Notion',
    description: 'Friendly, approachable style',
    thumbnail: '/styles/notion-thumb.png',
    type: 'preset',
    examples: [
      'person organizing tasks on desktop',
      'team reviewing documentation together',
      'workflow diagram with connected steps'
    ]
  },
  {
    id: 'saasthetic',
    name: 'SaaSthetic',
    description: 'Professional line art',
    thumbnail: '/styles/saasthetic-thumb.png',
    type: 'preset',
    examples: [
      'professional business meeting',
      'data dashboard with charts',
      'remote work setup with laptop'
    ]
  },
  {
    id: 'clayframe',
    name: 'Clayframe',
    description: '3D rendered style',
    thumbnail: '/styles/clayframe-thumb.png',
    type: 'preset',
    examples: [
      '3D character celebrating success',
      'realistic office environment with team',
      'product showcase with depth'
    ]
  },
  {
    id: 'flat2d',
    name: 'Flat 2D',
    description: 'Simple, minimalist design',
    thumbnail: '/styles/flat2d-thumb.png',
    type: 'preset',
    examples: [
      'simple icon of person at computer',
      'minimalist workflow diagram',
      'bold geometric pattern illustration'
    ]
  }
]

// Map backend errors to user-friendly messages
function getUserFriendlyError(error: string): string {
  const errorLower = error.toLowerCase()

  // Credit-related errors
  if (errorLower.includes('insufficient') && errorLower.includes('credit')) {
    return "You're out of credits! Upgrade to Business for 200 credits/month at just $29."
  }
  if (errorLower.includes('no credits')) {
    return "You've used all your credits for this month. Upgrade to Business to get 200 credits/month!"
  }

  // Brand training errors
  if (errorLower.includes('brand') && errorLower.includes('not ready')) {
    return "Your brand is still training (usually 15-30 minutes). Try a preset style while you wait!"
  }
  if (errorLower.includes('brand not found')) {
    return "Brand style not found. Please select a preset style or train a new brand in Settings."
  }
  if (errorLower.includes('brand training not complete')) {
    return "Your brand is still training. Try again in a few minutes or use a preset style!"
  }

  // Generation errors
  if (errorLower.includes('generation failed')) {
    return "Image generation failed. Please try again with a different prompt or style."
  }
  if (errorLower.includes('timeout')) {
    return "Generation took too long. Please try again - our servers might be busy."
  }

  // Network/API errors
  if (errorLower.includes('network') || errorLower.includes('fetch')) {
    return "Network error. Please check your internet connection and try again."
  }

  // Default friendly message
  return `Something went wrong: ${error}. Please try again or contact support if this persists.`
}

export default function AppPage() {
  const [allStyles, setAllStyles] = useState(styles)
  const [selectedStyle, setSelectedStyle] = useState(styles[0])
  const [prompt, setPrompt] = useState('')
  const [isGenerating, setIsGenerating] = useState(false)
  const [generationStatus, setGenerationStatus] = useState<'idle' | 'queued' | 'generating' | 'completed' | 'failed'>('idle')
  const [currentIllustrationId, setCurrentIllustrationId] = useState<string | null>(null)
  const [generatedImage, setGeneratedImage] = useState<any>(null)
  const [recentImages, setRecentImages] = useState<any[]>([])
  const [credits, setCredits] = useState({ used: 0, total: 5 })
  const [user, setUser] = useState<any>(null)

  // Onboarding state
  const [showWelcomeModal, setShowWelcomeModal] = useState(false)
  const [showSuccessModal, setShowSuccessModal] = useState(false)
  const [isFirstGeneration, setIsFirstGeneration] = useState(true)
  const [showTooltip, setShowTooltip] = useState(false)

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (firebaseUser) => {
      if (firebaseUser) {
        setUser(firebaseUser)

        try {
          // Get user's credit info
          const userDoc = await getDoc(doc(db, 'users', firebaseUser.uid))
          if (userDoc.exists()) {
            const userData = userDoc.data()
            const plan = userData.subscriptionTier || 'free'
            const creditsPerMonth = getCreditsForPlan(plan)
            setCredits({
              used: userData.creditsUsed || 0,
              total: creditsPerMonth
            })

            // Check if user has completed onboarding
            if (!userData.onboardingCompleted && userData.creditsUsed === 0) {
              setShowWelcomeModal(true)
              setIsFirstGeneration(true)
            }
          } else {
            // User document doesn't exist - this is a new user
            // Show welcome modal
            setShowWelcomeModal(true)
            setIsFirstGeneration(true)
          }
        } catch (error) {
          console.error('Error fetching user data:', error)
          alert('Failed to fetch user data. Please check your internet connection and try refreshing the page.')
          return
        }

        try {
          // Load user's trained brands
          const userBrands = await getUserBrands(firebaseUser.uid)
          const brandStyles = userBrands.map((brand: any) => ({
            id: `brand_${brand.id}`,
            name: brand.name,
            description: 'Your custom brand style',
            thumbnail: '/styles/custom-brand-thumb.jpg', // Placeholder
            type: 'brand',
            brandData: brand,
            examples: [
              `${brand.name} style illustration`,
              `professional content in ${brand.name} style`,
              `branded visual for ${brand.name}`
            ]
          }))

          // Combine preset styles with brand styles
          setAllStyles([...brandStyles, ...styles])
        } catch (error) {
          console.error('Error loading brands:', error)
          // Continue with just preset styles
        }

        try {
          // Load recent generations
          const q = query(
            collection(db, 'illustrations'),
            where('userId', '==', firebaseUser.uid),
            orderBy('createdAt', 'desc'),
            limit(3)
          )

          const unsubscribeImages = onSnapshot(q, (snapshot) => {
            const images = snapshot.docs.map(doc => ({
              id: doc.id,
              ...doc.data()
            }))
            setRecentImages(images)
          })

          return () => unsubscribeImages()
        } catch (error) {
          console.error('Error loading recent generations:', error)
          // Continue without recent images
        }
      }
    })

    return () => unsubscribe()
  }, [])

  // Real-time listener for current generation status
  useEffect(() => {
    if (!currentIllustrationId) return

    const unsubscribe = onSnapshot(
      doc(db, 'illustrations', currentIllustrationId),
      (docSnapshot) => {
        if (docSnapshot.exists()) {
          const data = docSnapshot.data()
          const status = data.status

          // Update generation status
          if (status === 'processing') {
            // Show "generating" after 10 seconds for better UX
            const startTime = data.createdAt?.toMillis() || Date.now()
            const elapsed = Date.now() - startTime
            setGenerationStatus(elapsed > 10000 ? 'generating' : 'queued')
          } else if (status === 'completed') {
            setGenerationStatus('completed')
            setIsGenerating(false)

            // Set the generated image
            setGeneratedImage({
              url: data.imageURL,
              thumbnailUrl: data.thumbnailURL,
              prompt: data.prompt,
              styleId: data.styleId,
              styleName: data.styleName,
              createdAt: data.createdAt?.toDate(),
              illustrationId: currentIllustrationId
            })

            // Update credits
            if (user) {
              setCredits(prev => ({ ...prev, used: prev.used + 1 }))
            }

            // Log generation completed
            if (user) {
              logGenerationCompleted(user.uid, currentIllustrationId, {
                styleId: data.styleId,
                model: data.modelUsed,
                generationTime: data.generationTime
              }).catch(console.error)
            }

            // Show success modal if it's the first generation
            if (isFirstGeneration) {
              setIsFirstGeneration(false)
              setShowSuccessModal(true)

              // Update user's onboarding status
              updateDoc(doc(db, 'users', user.uid), {
                onboardingCompleted: true
              }).catch(console.error)
            }

            // Reset current illustration
            setCurrentIllustrationId(null)
          } else if (status === 'failed') {
            setGenerationStatus('failed')
            setIsGenerating(false)

            // Show user-friendly error
            const errorMessage = getUserFriendlyError(data.error || 'Generation failed')
            alert(errorMessage)

            // Log generation failure
            if (user) {
              logGenerationFailed(user.uid, data.error || 'Generation failed', {
                illustrationId: currentIllustrationId
              }).catch(console.error)
            }

            // Reset current illustration
            setCurrentIllustrationId(null)
          }
        }
      },
      (error) => {
        console.error('Error listening to illustration status:', error)
        setIsGenerating(false)
        setGenerationStatus('idle')
        setCurrentIllustrationId(null)
      }
    )

    return () => unsubscribe()
  }, [currentIllustrationId, user, isFirstGeneration])

  // Onboarding handlers
  const handleWelcomeGetStarted = () => {
    setShowWelcomeModal(false)
    // Pre-fill with example
    setPrompt('a team collaborating around a whiteboard')
    setShowTooltip(true)

    // Hide tooltip after 5 seconds
    setTimeout(() => setShowTooltip(false), 5000)
  }

  const handleFirstGenerationSuccess = () => {
    setIsFirstGeneration(false)
    setShowSuccessModal(true)

    // Update user's onboarding status
    if (user) {
      updateDoc(doc(db, 'users', user.id), {
        onboardingCompleted: true
      })
    }
  }

  const handleGenerate = async () => {
    if (!prompt.trim() || prompt.length < 10) {
      alert('Please enter a prompt with at least 10 characters')
      return
    }

    if (credits.used >= credits.total) {
      alert('You have no credits remaining. Please upgrade your plan.')
      return
    }

    setIsGenerating(true)
    setGenerationStatus('queued')

    // Log first generation event
    if (user && isFirstGeneration) {
      logFirstGenerationStarted(user.uid).catch(console.error)
    }

    try {
      // Debug logging
      console.log('Starting generation:', {
        userId: user?.uid,
        prompt: prompt.substring(0, 50),
        styleId: selectedStyle.id
      })

      // Call the AI generation service
      const result = await generateIllustration({
        userId: user?.uid || 'anonymous',
        prompt: prompt,
        styleId: selectedStyle.id,
        styleName: selectedStyle.name
      })

      console.log('Generation result:', result)

      if (result.success && result.illustrationId) {
        // Start listening to real-time updates via Firestore
        // The listener (lines 226-313) will handle status updates
        setCurrentIllustrationId(result.illustrationId)
      } else {
        throw new Error(result.error || 'Unknown error')
      }
    } catch (error) {
      // Handle any errors during generation request
      console.error('Generation error caught:', error)

      setIsGenerating(false)
      setGenerationStatus('idle')

      const errorMessage = getUserFriendlyError(
        error instanceof Error ? error.message : 'Unknown error'
      )
      alert(errorMessage)

      // Log generation failure
      if (user) {
        logGenerationFailed(user.uid, error instanceof Error ? error.message : 'Unknown error', {
          prompt,
          styleId: selectedStyle.id
        }).catch(console.error)
      }
    }
  }

  const handleDownload = async () => {
    if (!generatedImage) return

    const response = await fetch(generatedImage.url)
    const blob = await response.blob()
    const url = window.URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `mediaforge-${Date.now()}.png`
    document.body.appendChild(a)
    a.click()
    a.remove()
    window.URL.revokeObjectURL(url)
  }

  const handleCopy = async () => {
    if (!generatedImage) return

    try {
      const response = await fetch(generatedImage.url)
      const blob = await response.blob()
      await navigator.clipboard.write([
        new ClipboardItem({ 'image/png': blob })
      ])
      alert('Image copied to clipboard!')
    } catch (err) {
      alert('Failed to copy image')
    }
  }

  return (
    <div className="flex h-[calc(100vh-4rem)]">
      {/* Left Panel */}
      <div className="w-[480px] border-r border-gray-200 bg-white p-6 overflow-y-auto">
        <h2 className="text-xl font-semibold mb-6">Generate Illustration</h2>

        {/* Style Picker */}
        <div className="mb-6">
          <label className="block text-sm font-medium text-gray-700 mb-3">
            Choose Your Style
          </label>
          <div className="grid grid-cols-3 gap-3">
            {allStyles.map((style) => (
              <button
                key={style.id}
                onClick={() => setSelectedStyle(style)}
                className={`p-3 rounded-lg border-2 transition-all ${
                  selectedStyle.id === style.id
                    ? 'border-pink-500 bg-pink-50'
                    : 'border-gray-200 hover:border-gray-300'
                }`}
              >
                <div className="aspect-square bg-gray-100 rounded mb-2 overflow-hidden">
                  <img
                    src={style.thumbnail}
                    alt={style.name}
                    className="w-full h-full object-cover"
                  />
                </div>
                <div className="text-xs font-medium">{style.name}</div>
                <div className="text-xs text-gray-500">{style.type === 'preset' ? 'Preset' : 'Your Brand'}</div>
              </button>
            ))}
          </div>
          <button className="mt-3 text-sm text-pink-600 hover:text-pink-700">
            View All Styles →
          </button>
        </div>

        {/* Example Prompts */}
        <div className="mb-6 p-3 bg-blue-50 rounded-lg">
          <div className="flex items-center gap-2 mb-2">
            <Sparkles className="w-4 h-4 text-blue-600" />
            <span className="text-sm font-medium text-blue-900">Try these prompts:</span>
          </div>
          <div className="flex flex-wrap gap-2">
            {selectedStyle.examples.map((example, i) => (
              <button
                key={i}
                onClick={() => setPrompt(example)}
                className="text-xs px-2 py-1 bg-white rounded border border-blue-200 hover:bg-blue-100 transition-colors"
              >
                {example}
              </button>
            ))}
          </div>
        </div>

        {/* Prompt Input */}
        <div className="mb-6">
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Prompt
          </label>
          <textarea
            value={prompt}
            onChange={(e) => setPrompt(e.target.value)}
            placeholder="Describe the illustration you want..."
            className="w-full h-32 p-3 border border-gray-300 rounded-lg resize-none focus:ring-2 focus:ring-pink-500 focus:border-transparent"
          />
          <div className="mt-1 text-xs text-gray-500">
            {prompt.length}/500 characters
          </div>
        </div>

        {/* Size Selector */}
        <div className="mb-6">
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Size & Format
          </label>
          <div className="space-y-2">
            <label className="flex items-center p-3 border border-gray-300 rounded-lg cursor-pointer hover:bg-gray-50">
              <input
                type="radio"
                name="size"
                value="square"
                checked={true}
                readOnly
                className="text-pink-600 focus:ring-pink-500"
              />
              <span className="ml-3">
                <span className="font-medium">Square (1:1)</span>
                <span className="text-gray-500 text-sm ml-2">Social posts, icons</span>
              </span>
            </label>
          </div>
        </div>

        {/* Generate Button */}
        <div className="relative">
          {showTooltip && (
            <div className="absolute -top-14 left-1/2 -translate-x-1/2 bg-gray-900 text-white text-sm px-4 py-2 rounded-lg whitespace-nowrap z-10">
              <ArrowDown className="w-4 h-4 inline mr-1" />
              Click here to create your first illustration!
              <div className="absolute bottom-0 left-1/2 -translate-x-1/2 translate-y-full">
                <div className="w-0 h-0 border-l-8 border-r-8 border-t-8 border-l-transparent border-r-transparent border-t-gray-900" />
              </div>
            </div>
          )}
          <button
            onClick={handleGenerate}
            disabled={isGenerating || !prompt.trim() || credits.used >= credits.total}
            className="w-full py-3 bg-pink-600 text-white rounded-lg font-medium hover:bg-pink-700 transition-colors disabled:bg-gray-400 disabled:cursor-not-allowed flex items-center justify-center gap-2"
          >
            {isGenerating ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                Generating...
              </>
            ) : (
              <>Generate</>
            )}
          </button>
        </div>

        <div className="mt-2 text-xs text-gray-500 text-center">
          Press ⌘+Enter
        </div>
      </div>

      {/* Right Panel */}
      <div className="flex-1 bg-gray-50 p-6 overflow-y-auto">
        <h2 className="text-xl font-semibold mb-6">Preview</h2>

        {/* Generated Image or Placeholder */}
        <div className="bg-white rounded-lg p-6 mb-6">
          {isGenerating ? (
            <div className="aspect-square bg-gray-100 rounded-lg flex flex-col items-center justify-center">
              <Loader2 className="w-8 h-8 animate-spin text-gray-400 mb-3" />
              <div className="text-gray-600 font-medium">
                {generationStatus === 'queued' && 'Queued...'}
                {generationStatus === 'generating' && 'Generating your illustration...'}
              </div>
              <div className="text-gray-500 text-sm">Usually takes 15-20 seconds</div>
            </div>
          ) : generatedImage ? (
            <div>
              <div className="aspect-square bg-gray-100 rounded-lg overflow-hidden mb-4">
                <img
                  src={generatedImage.url}
                  alt="Generated illustration"
                  className="w-full h-full object-cover"
                />
              </div>
              <div className="flex gap-2">
                <button
                  onClick={handleDownload}
                  className="flex-1 py-2 px-4 bg-gray-900 text-white rounded-lg hover:bg-gray-800 transition-colors flex items-center justify-center gap-2"
                >
                  <Download className="w-4 h-4" />
                  Download PNG
                </button>
                <button
                  onClick={handleCopy}
                  className="flex-1 py-2 px-4 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors flex items-center justify-center gap-2"
                >
                  <Copy className="w-4 h-4" />
                  Copy
                </button>
                <button
                  onClick={handleGenerate}
                  disabled={credits.used >= credits.total}
                  className="flex-1 py-2 px-4 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors flex items-center justify-center gap-2"
                >
                  <RefreshCw className="w-4 h-4" />
                  Regenerate
                </button>
              </div>
            </div>
          ) : (
            <div className="aspect-square bg-gray-100 rounded-lg flex items-center justify-center text-gray-500">
              No illustration generated yet
            </div>
          )}
        </div>

        {/* Recent Generations */}
        {recentImages.length > 0 && (
          <div>
            <h3 className="text-sm font-medium text-gray-700 mb-3">Recent</h3>
            <div className="grid grid-cols-3 gap-3">
              {recentImages.map((image) => (
                <button
                  key={image.id}
                  onClick={() => setGeneratedImage(image)}
                  className="aspect-square bg-gray-100 rounded-lg overflow-hidden hover:ring-2 hover:ring-pink-500 transition-all"
                >
                  <img
                    src={image.imageURL}
                    alt={image.prompt}
                    className="w-full h-full object-cover"
                  />
                  <div className="text-xs text-gray-500 mt-1">{image.styleName}</div>
                </button>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Onboarding Modals */}
      <WelcomeModal
        isOpen={showWelcomeModal}
        onClose={() => setShowWelcomeModal(false)}
        onGetStarted={handleWelcomeGetStarted}
      />

      <SuccessModal
        isOpen={showSuccessModal}
        onClose={() => setShowSuccessModal(false)}
        onDownload={handleDownload}
        onGenerateAnother={() => {
          setShowSuccessModal(false)
          setPrompt('')
        }}
        creditsRemaining={credits.total - credits.used}
      />
    </div>
  )
}