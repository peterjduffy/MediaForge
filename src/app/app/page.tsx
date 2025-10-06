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

// Style definitions
const styles = [
  {
    id: 'google',
    name: 'Google',
    description: 'Clean, modern illustrations',
    thumbnail: '/styles/google-thumb.jpg',
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
    thumbnail: '/styles/notion-thumb.jpg',
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
    thumbnail: '/styles/saasthetic-thumb.jpg',
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
    thumbnail: '/styles/clayframe-thumb.jpg',
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
    thumbnail: '/styles/flat2d-thumb.jpg',
    type: 'preset',
    examples: [
      'simple icon of person at computer',
      'minimalist workflow diagram',
      'bold geometric pattern illustration'
    ]
  }
]

export default function AppPage() {
  const [allStyles, setAllStyles] = useState(styles)
  const [selectedStyle, setSelectedStyle] = useState(styles[0])
  const [prompt, setPrompt] = useState('')
  const [isGenerating, setIsGenerating] = useState(false)
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
        }

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
      }
    })

    return () => unsubscribe()
  }, [])

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
      updateDoc(doc(db, 'users', user.uid), {
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

    // Call the AI generation service
    const result = await generateIllustration({
      userId: user?.uid || 'anonymous',
      prompt: prompt,
      styleId: selectedStyle.id,
      styleName: selectedStyle.name
    })

    if (result.success && result.imageURL) {
      // Set the generated image
      setGeneratedImage({
        url: result.imageURL,
        thumbnailUrl: result.thumbnailURL,
        prompt: prompt,
        styleId: selectedStyle.id,
        styleName: selectedStyle.name,
        createdAt: new Date(),
        illustrationId: result.illustrationId
      })

      // Update credits
      if (user) {
        await updateDoc(doc(db, 'users', user.uid), {
          creditsUsed: credits.used + 1
        })
        setCredits(prev => ({ ...prev, used: prev.used + 1 }))
      }

      // Show success modal if it's the first generation
      if (isFirstGeneration) {
        handleFirstGenerationSuccess()
      }
    } else {
      alert(result.error || 'Failed to generate illustration')
    }

    setIsGenerating(false)
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
                <div className="aspect-square bg-gradient-to-br from-gray-100 to-gray-200 rounded mb-2" />
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
              <div className="text-gray-600 font-medium">Creating your illustration...</div>
              <div className="text-gray-500 text-sm">This usually takes 15-20 seconds</div>
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