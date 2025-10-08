'use client'

import { useState, useRef } from 'react'
import { X, Upload, Plus, Check, AlertCircle } from 'lucide-react'
import { useAuth } from '@/components/auth/AuthProvider'
import { startBrandTraining } from '@/lib/ai-generation'
// import { toast } from 'react-hot-toast'
// Mock toast for now
const toast = {
  error: (msg: string) => console.error('Error:', msg)
}

interface BrandTrainingModalProps {
  onClose: () => void
  onTrainingStarted: (brandId: string) => void
  isFirstBrand: boolean
  skipMode?: boolean  // For onboarding flow
}

interface BrandColor {
  hex: string
  name?: string
}

export default function BrandTrainingModal({
  onClose,
  onTrainingStarted,
  isFirstBrand,
  skipMode = false
}: BrandTrainingModalProps) {
  const { user } = useAuth()
  const fileInputRef = useRef<HTMLInputElement>(null)

  const [step, setStep] = useState(1)
  const [brandName, setBrandName] = useState('')
  const [brandColors, setBrandColors] = useState<BrandColor[]>([])
  const [newColor, setNewColor] = useState('#')
  const [trainingImages, setTrainingImages] = useState<File[]>([])
  // const [uploading, setUploading] = useState(false)
  const [submitting, setSubmitting] = useState(false)

  const handleAddColor = () => {
    if (newColor && newColor !== '#' && brandColors.length < 5) {
      setBrandColors([...brandColors, { hex: newColor }])
      setNewColor('#')
    }
  }

  const handleRemoveColor = (index: number) => {
    setBrandColors(brandColors.filter((_, i) => i !== index))
  }

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || [])
    const validFiles = files.filter(file =>
      file.type === 'image/jpeg' || file.type === 'image/png' || file.type === 'image/jpg'
    )

    if (validFiles.length + trainingImages.length > 30) {
      toast.error('Maximum 30 images allowed')
      return
    }

    setTrainingImages([...trainingImages, ...validFiles])
  }

  const handleRemoveImage = (index: number) => {
    setTrainingImages(trainingImages.filter((_, i) => i !== index))
  }

  const handleSubmit = async () => {
    if (!user) return

    if (!brandName || trainingImages.length < 10) {
      toast.error('Please provide a brand name and at least 10 images')
      return
    }

    setSubmitting(true)

    try {
      // In a real app, upload images to Cloud Storage first
      // For now, we'll simulate with URLs
      const imageUrls = trainingImages.map((file) =>
        URL.createObjectURL(file)
      )

      const result = await startBrandTraining(
        user.id,
        brandName,
        brandColors,
        imageUrls
      )

      if (result.success && result.brandId) {
        onTrainingStarted(result.brandId)
      } else {
        toast.error(result.error || 'Failed to start training')
      }
    } catch (error) {
      console.error('Training error:', error)
      toast.error('Failed to start brand training')
    } finally {
      setSubmitting(false)
    }
  }

  const canProceed = () => {
    switch (step) {
      case 1: return brandName.length > 0
      case 2: return true // Colors are optional
      case 3: return trainingImages.length >= 10
      default: return false
    }
  }

  if (skipMode) {
    return (
      <div className="fixed inset-0 z-50 bg-black/50 flex items-center justify-center p-4">
        <div className="bg-white rounded-2xl max-w-md w-full p-8">
          <h2 className="text-2xl font-bold mb-4">Train Your Brand (Optional)</h2>
          <p className="text-gray-600 mb-6">
            Upload your brand assets and we&apos;ll train your AI in the background (15-30 minutes).
            You can start generating immediately with preset styles.
          </p>
          <div className="space-y-4">
            <button
              onClick={() => {
                setStep(1)
                // Switch to full modal mode
              }}
              className="w-full bg-purple-600 text-white py-3 px-4 rounded-lg font-medium hover:bg-purple-700 transition-colors"
            >
              Upload Brand Assets
            </button>
            <button
              onClick={onClose}
              className="w-full bg-gray-100 text-gray-700 py-3 px-4 rounded-lg font-medium hover:bg-gray-200 transition-colors"
            >
              Skip for Now
            </button>
          </div>
          <p className="text-xs text-gray-500 mt-4 text-center">
            You can always add your brand later from Settings
          </p>
        </div>
      </div>
    )
  }

  return (
    <div className="fixed inset-0 z-50 bg-black/50 flex items-center justify-center p-4 overflow-y-auto">
      <div className="bg-white rounded-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="sticky top-0 bg-white border-b px-6 py-4 flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <h2 className="text-xl font-bold">Train Your Brand</h2>
            {!isFirstBrand && (
              <span className="text-sm text-gray-600 bg-gray-100 px-2 py-1 rounded">
                $29
              </span>
            )}
          </div>
          <button onClick={onClose} className="text-gray-500 hover:text-gray-700">
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Progress Steps */}
        <div className="px-6 py-4 border-b">
          <div className="flex items-center justify-between">
            {[1, 2, 3].map((s) => (
              <div key={s} className="flex items-center">
                <div
                  className={`w-8 h-8 rounded-full flex items-center justify-center font-medium ${
                    step >= s
                      ? 'bg-purple-600 text-white'
                      : 'bg-gray-200 text-gray-600'
                  }`}
                >
                  {step > s ? <Check className="w-5 h-5" /> : s}
                </div>
                <span className={`ml-2 text-sm ${step >= s ? 'text-gray-900' : 'text-gray-500'}`}>
                  {s === 1 && 'Brand Name'}
                  {s === 2 && 'Brand Colors'}
                  {s === 3 && 'Training Images'}
                </span>
                {s < 3 && <div className="flex-1 h-0.5 bg-gray-200 mx-4" />}
              </div>
            ))}
          </div>
        </div>

        {/* Content */}
        <div className="p-6">
          {/* Step 1: Brand Name */}
          {step === 1 && (
            <div>
              <h3 className="text-lg font-semibold mb-2">What&apos;s your brand name?</h3>
              <p className="text-gray-600 mb-4">
                This helps the AI understand your brand identity.
              </p>
              <input
                type="text"
                value={brandName}
                onChange={(e) => setBrandName(e.target.value)}
                placeholder="e.g., Acme Corp"
                className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
                autoFocus
              />
            </div>
          )}

          {/* Step 2: Brand Colors */}
          {step === 2 && (
            <div>
              <h3 className="text-lg font-semibold mb-2">Brand Colors (Optional)</h3>
              <p className="text-gray-600 mb-4">
                Add up to 5 brand colors. The AI will incorporate these naturally.
              </p>

              <div className="space-y-4">
                {/* Color list */}
                {brandColors.length > 0 && (
                  <div className="flex flex-wrap gap-3">
                    {brandColors.map((color, i) => (
                      <div key={i} className="flex items-center space-x-2 bg-gray-50 px-3 py-2 rounded-lg">
                        <div
                          className="w-6 h-6 rounded border border-gray-300"
                          style={{ backgroundColor: color.hex }}
                        />
                        <span className="text-sm font-mono">{color.hex}</span>
                        <button
                          onClick={() => handleRemoveColor(i)}
                          className="text-gray-500 hover:text-red-600"
                        >
                          <X className="w-4 h-4" />
                        </button>
                      </div>
                    ))}
                  </div>
                )}

                {/* Add color input */}
                {brandColors.length < 5 && (
                  <div className="flex space-x-2">
                    <input
                      type="text"
                      value={newColor}
                      onChange={(e) => setNewColor(e.target.value)}
                      placeholder="#FF5733"
                      className="flex-1 px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
                    />
                    <button
                      onClick={handleAddColor}
                      className="px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700"
                    >
                      <Plus className="w-5 h-5" />
                    </button>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Step 3: Training Images */}
          {step === 3 && (
            <div>
              <div className="flex items-start justify-between mb-4">
                <div>
                  <h3 className="text-lg font-semibold mb-2">Upload Training Images</h3>
                  <p className="text-gray-600">
                    Upload 10-30 high-quality images that represent your brand&apos;s visual style.
                  </p>
                </div>
                <a
                  href="/docs/brand-training-guide"
                  target="_blank"
                  className="text-sm text-purple-600 hover:text-purple-700 underline whitespace-nowrap ml-4"
                >
                  Full Guide →
                </a>
              </div>

              {/* Best Practices */}
              <div className="mb-4 p-4 bg-blue-50 border border-blue-200 rounded-lg">
                <h4 className="text-sm font-semibold text-blue-900 mb-2">✓ Good Training Images:</h4>
                <ul className="text-sm text-blue-800 space-y-1">
                  <li>• Clear, high-resolution (1024px+ minimum)</li>
                  <li>• Consistent illustration style across all images</li>
                  <li>• Variety of subjects (people, objects, scenes)</li>
                  <li>• Clean backgrounds, minimal text</li>
                  <li>• Your actual brand illustrations or similar style</li>
                </ul>
              </div>

              <div className="mb-4 p-4 bg-red-50 border border-red-200 rounded-lg">
                <h4 className="text-sm font-semibold text-red-900 mb-2">✗ Avoid:</h4>
                <ul className="text-sm text-red-800 space-y-1">
                  <li>• Photos (use illustrations only)</li>
                  <li>• Screenshots with UI elements</li>
                  <li>• Heavily watermarked images</li>
                  <li>• Mixed styles (stick to one consistent look)</li>
                  <li>• Low resolution or blurry images</li>
                </ul>
              </div>

              {/* Upload area */}
              <div
                onClick={() => fileInputRef.current?.click()}
                className="border-2 border-dashed border-gray-300 rounded-lg p-8 text-center hover:border-purple-500 cursor-pointer transition-colors"
              >
                <Upload className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                <p className="text-gray-700 font-medium">Click to upload images</p>
                <p className="text-sm text-gray-500 mt-1">PNG or JPG, min 1024×1024px</p>
                <input
                  ref={fileInputRef}
                  type="file"
                  multiple
                  accept="image/png,image/jpeg,image/jpg"
                  onChange={handleFileSelect}
                  className="hidden"
                />
              </div>

              {/* Image grid */}
              {trainingImages.length > 0 && (
                <div className="mt-4">
                  <p className="text-sm text-gray-600 mb-2">
                    {trainingImages.length} images selected (minimum 10 required)
                  </p>
                  <div className="grid grid-cols-6 gap-2">
                    {trainingImages.map((file, i) => (
                      <div key={i} className="relative group">
                        {/* eslint-disable-next-line @next/next/no-img-element */}
                        <img
                          src={URL.createObjectURL(file)}
                          alt={`Training ${i + 1}`}
                          className="w-full h-20 object-cover rounded"
                        />
                        <button
                          onClick={() => handleRemoveImage(i)}
                          className="absolute top-1 right-1 bg-red-600 text-white rounded-full p-1 opacity-0 group-hover:opacity-100 transition-opacity"
                        >
                          <X className="w-3 h-3" />
                        </button>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {trainingImages.length < 10 && trainingImages.length > 0 && (
                <div className="mt-4 p-3 bg-yellow-50 border border-yellow-200 rounded-lg flex items-start space-x-2">
                  <AlertCircle className="w-5 h-5 text-yellow-600 mt-0.5" />
                  <p className="text-sm text-yellow-800">
                    Please upload at least {10 - trainingImages.length} more images for optimal training.
                  </p>
                </div>
              )}
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="sticky bottom-0 bg-white border-t px-6 py-4 flex justify-between">
          {step > 1 ? (
            <button
              onClick={() => setStep(step - 1)}
              className="px-4 py-2 text-gray-700 hover:text-gray-900"
            >
              Back
            </button>
          ) : (
            <div />
          )}

          {step < 3 ? (
            <button
              onClick={() => setStep(step + 1)}
              disabled={!canProceed()}
              className={`px-6 py-2 rounded-lg font-medium transition-colors ${
                canProceed()
                  ? 'bg-purple-600 text-white hover:bg-purple-700'
                  : 'bg-gray-200 text-gray-400 cursor-not-allowed'
              }`}
            >
              Next
            </button>
          ) : (
            <button
              onClick={handleSubmit}
              disabled={!canProceed() || submitting}
              className={`px-6 py-2 rounded-lg font-medium transition-colors ${
                canProceed() && !submitting
                  ? 'bg-purple-600 text-white hover:bg-purple-700'
                  : 'bg-gray-200 text-gray-400 cursor-not-allowed'
              }`}
            >
              {submitting ? 'Starting Training...' : 'Start Training'}
            </button>
          )}
        </div>
      </div>
    </div>
  )
}