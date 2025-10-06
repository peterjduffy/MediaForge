'use client'

import { useState, useEffect } from 'react'
import { useAuth } from '@/contexts/AuthContext'
import { useRouter } from 'next/navigation'
import { getUserBrands, checkBrandStatus } from '@/lib/ai-generation'
import { doc, getDoc } from 'firebase/firestore'
import { db } from '@/lib/firebase'
import BrandTrainingModal from '@/components/BrandTrainingModal'
// import { toast } from 'react-hot-toast'
// Mock toast for now
const toast = {
  success: (msg: string) => console.log('Success:', msg),
  error: (msg: string) => console.error('Error:', msg)
}

interface UserData {
  tier?: string
  subscription?: {
    plan: string
    status: string
  }
  credits?: number
  email?: string
  name?: string
}

interface Brand {
  id: string
  name: string
  status: 'preparing' | 'queued' | 'training' | 'ready' | 'failed'
  colors?: Array<{ hex: string; name?: string }>
  createdAt?: Date | { seconds: number; nanoseconds: number }
}

export default function SettingsPage() {
  const { user } = useAuth()
  const router = useRouter()
  const [userData, setUserData] = useState<UserData | null>(null)
  const [brands, setBrands] = useState<Brand[]>([])
  const [loading, setLoading] = useState(true)
  const [showBrandTraining, setShowBrandTraining] = useState(false)
  const [trainingBrand, setTrainingBrand] = useState<Brand | null>(null)

  useEffect(() => {
    if (!user) {
      router.push('/auth/signin')
      return
    }

    loadUserData()
    loadBrands()
  }, [user, router])

  const loadUserData = async () => {
    if (!user) return

    try {
      const userDoc = await getDoc(doc(db, 'users', user.uid))
      if (userDoc.exists()) {
        setUserData(userDoc.data() as UserData)
      }
    } catch (error) {
      console.error('Error loading user data:', error)
    } finally {
      setLoading(false)
    }
  }

  const loadBrands = async () => {
    if (!user) return

    try {
      const userBrands = await getUserBrands(user.uid)
      setBrands(userBrands as Brand[])

      // Check for any training brands
      const trainingBrand = userBrands.find(b =>
        b.status === 'preparing' || b.status === 'queued' || b.status === 'training'
      )

      if (trainingBrand) {
        setTrainingBrand(trainingBrand as Brand)
        // Poll for status updates
        pollBrandStatus(trainingBrand.id)
      }
    } catch (error) {
      console.error('Error loading brands:', error)
    }
  }

  const pollBrandStatus = async (brandId: string) => {
    if (!user) return

    const interval = setInterval(async () => {
      const status = await checkBrandStatus(user.uid, brandId)

      if (status.status === 'ready') {
        clearInterval(interval)
        toast.success(`Your brand "${status.name}" is ready! 🎉`)
        setTrainingBrand(null)
        loadBrands()
      } else if (status.status === 'failed') {
        clearInterval(interval)
        toast.error('Brand training failed. Please try again.')
        setTrainingBrand(null)
        loadBrands()
      }
    }, 5000) // Poll every 5 seconds
  }

  const isBusinessTier = userData?.tier === 'business' || userData?.subscription?.plan === 'business'

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading settings...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-4xl mx-auto px-4 py-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-8">Settings</h1>

        {/* Account Section */}
        <div className="bg-white rounded-lg shadow-sm p-6 mb-6">
          <h2 className="text-xl font-semibold text-gray-900 mb-4">Account</h2>
          <div className="space-y-3">
            <div>
              <label className="text-sm text-gray-600">Email</label>
              <p className="text-gray-900">{user?.email}</p>
            </div>
            <div>
              <label className="text-sm text-gray-600">Plan</label>
              <p className="text-gray-900 font-medium">
                {isBusinessTier ? (
                  <span className="text-purple-600">Business ($29/mo)</span>
                ) : (
                  <span>Free</span>
                )}
              </p>
            </div>
            <div>
              <label className="text-sm text-gray-600">Credits Remaining</label>
              <p className="text-gray-900">{userData?.credits || 0}</p>
            </div>
          </div>
        </div>

        {/* Brand Styles Section (Business tier only) */}
        {isBusinessTier && (
          <div className="bg-white rounded-lg shadow-sm p-6 mb-6">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-xl font-semibold text-gray-900">Brand Styles</h2>
              {brands.length === 0 && !trainingBrand && (
                <span className="text-sm text-green-600 bg-green-50 px-3 py-1 rounded-full">
                  1 free training included
                </span>
              )}
            </div>

            {/* Training in progress */}
            {trainingBrand && (
              <div className="mb-4 p-4 bg-blue-50 border border-blue-200 rounded-lg">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="font-medium text-blue-900">
                      Training &ldquo;{trainingBrand.name}&rdquo;
                    </p>
                    <p className="text-sm text-blue-700 mt-1">
                      {trainingBrand.status === 'preparing' && 'Preparing dataset...'}
                      {trainingBrand.status === 'queued' && 'Queued for training...'}
                      {trainingBrand.status === 'training' && 'Training in progress (15-30 minutes)...'}
                    </p>
                  </div>
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
                </div>
              </div>
            )}

            {/* Existing brands */}
            {brands.length > 0 ? (
              <div className="space-y-3 mb-4">
                {brands.map((brand) => (
                  <div key={brand.id} className="flex items-center justify-between p-3 border rounded-lg">
                    <div className="flex items-center space-x-3">
                      <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                      <span className="font-medium">{brand.name}</span>
                      {brand.colors && brand.colors.length > 0 && (
                        <div className="flex space-x-1">
                          {brand.colors.map((color, i) => (
                            <div
                              key={i}
                              className="w-6 h-6 rounded border border-gray-300"
                              style={{ backgroundColor: color.hex }}
                              title={color.hex}
                            />
                          ))}
                        </div>
                      )}
                    </div>
                    <span className="text-sm text-gray-600">Ready</span>
                  </div>
                ))}
              </div>
            ) : (
              !trainingBrand && (
                <p className="text-gray-600 mb-4">
                  No brand styles yet. Train your first brand for free!
                </p>
              )
            )}

            {/* Train brand button */}
            <button
              onClick={() => setShowBrandTraining(true)}
              disabled={!!trainingBrand}
              className={`w-full py-2 px-4 rounded-lg font-medium transition-colors ${
                trainingBrand
                  ? 'bg-gray-100 text-gray-400 cursor-not-allowed'
                  : 'bg-purple-600 text-white hover:bg-purple-700'
              }`}
            >
              {brands.length === 0
                ? 'Train Your Brand (Free)'
                : 'Train Additional Brand ($29)'}
            </button>

            <p className="text-xs text-gray-500 mt-2">
              Brand training takes 15-30 minutes. You can continue generating while training.
            </p>
          </div>
        )}

        {/* Upgrade Section (Free tier only) */}
        {!isBusinessTier && (
          <div className="bg-gradient-to-r from-purple-50 to-indigo-50 rounded-lg p-6 border border-purple-200">
            <h3 className="text-lg font-semibold text-gray-900 mb-2">
              Upgrade to Business
            </h3>
            <p className="text-gray-700 mb-4">
              Train your AI on your brand for perfect consistency. Get 200 credits/month, unlimited team members, and your first brand training free.
            </p>
            <button
              onClick={() => router.push('/pricing')}
              className="bg-purple-600 text-white px-6 py-2 rounded-lg font-medium hover:bg-purple-700 transition-colors"
            >
              Upgrade for $29/mo
            </button>
          </div>
        )}

        {/* Billing Section */}
        <div className="bg-white rounded-lg shadow-sm p-6">
          <h2 className="text-xl font-semibold text-gray-900 mb-4">Billing</h2>
          {isBusinessTier ? (
            <div className="space-y-3">
              <button className="text-purple-600 hover:text-purple-700 font-medium">
                Manage Subscription →
              </button>
              <button className="text-purple-600 hover:text-purple-700 font-medium block">
                Purchase Credit Pack ($5/100) →
              </button>
            </div>
          ) : (
            <p className="text-gray-600">
              You&apos;re on the free plan. Upgrade to access billing options.
            </p>
          )}
        </div>
      </div>

      {/* Brand Training Modal */}
      {showBrandTraining && (
        <BrandTrainingModal
          onClose={() => setShowBrandTraining(false)}
          onTrainingStarted={() => {
            setShowBrandTraining(false)
            toast.success('Brand training started! This will take 15-30 minutes.')
            loadBrands()
          }}
          isFirstBrand={brands.length === 0}
        />
      )}
    </div>
  )
}