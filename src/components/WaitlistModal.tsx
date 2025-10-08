'use client'

import { useState } from 'react'
import { X } from 'lucide-react'
import { db } from '@/lib/firebase'
import { collection, addDoc, serverTimestamp } from 'firebase/firestore'

interface WaitlistModalProps {
  isOpen: boolean
  onClose: () => void
}

export default function WaitlistModal({ isOpen, onClose }: WaitlistModalProps) {
  const [email, setEmail] = useState('')
  const [useCase, setUseCase] = useState('')
  const [teamSize, setTeamSize] = useState('1')
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [isSuccess, setIsSuccess] = useState(false)
  const [error, setError] = useState('')

  if (!isOpen) return null

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsSubmitting(true)
    setError('')

    try {
      // Validate email
      if (!email || !email.includes('@')) {
        throw new Error('Please enter a valid email address')
      }

      if (!useCase || useCase.trim().length < 10) {
        throw new Error('Please describe your use case (at least 10 characters)')
      }

      // Add to waitlist collection
      await addDoc(collection(db, 'waitlist'), {
        email: email.toLowerCase().trim(),
        useCase: useCase.trim(),
        teamSize: teamSize,
        status: 'pending',
        createdAt: serverTimestamp(),
        source: 'mediaforge.dev'
      })

      setIsSuccess(true)

      // Reset form after 3 seconds and close
      setTimeout(() => {
        setEmail('')
        setUseCase('')
        setTeamSize('1')
        setIsSuccess(false)
        onClose()
      }, 3000)

    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to join waitlist. Please try again.')
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <>
      {/* Backdrop */}
      <div className="fixed inset-0 bg-black/50 z-[100]" onClick={onClose} />

      {/* Modal */}
      <div className="fixed top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 bg-white rounded-xl p-8 z-[101] max-w-md w-full shadow-xl">
        <button
          onClick={onClose}
          className="absolute top-4 right-4 p-2 hover:bg-gray-100 rounded-lg transition-colors"
          disabled={isSubmitting}
        >
          <X className="w-5 h-5 text-gray-500" />
        </button>

        {isSuccess ? (
          <div className="text-center py-6">
            <div className="w-16 h-16 bg-gradient-to-br from-green-500 to-green-600 rounded-full flex items-center justify-center mx-auto mb-4">
              <span className="text-3xl">✓</span>
            </div>
            <h2 className="text-2xl font-bold text-gray-900 mb-3">
              You&apos;re on the list!
            </h2>
            <p className="text-gray-600">
              We&apos;re selecting 10 beta users this week. Check your email soon!
            </p>
          </div>
        ) : (
          <>
            <div className="text-center mb-6">
              <div className="w-16 h-16 bg-gradient-to-br from-pink-500 to-pink-600 rounded-full flex items-center justify-center mx-auto mb-4">
                <span className="text-3xl">🎨</span>
              </div>
              <h2 className="text-2xl font-bold text-gray-900 mb-2">
                Request Beta Access
              </h2>
              <p className="text-sm text-gray-600">
                We&apos;re giving 10 early users <strong>free Business access</strong> for 3 months in exchange for feedback.
              </p>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-1">
                  Email address
                </label>
                <input
                  id="email"
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="you@company.com"
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-pink-500 focus:border-transparent"
                  required
                  disabled={isSubmitting}
                />
              </div>

              <div>
                <label htmlFor="useCase" className="block text-sm font-medium text-gray-700 mb-1">
                  What will you use MediaForge for?
                </label>
                <textarea
                  id="useCase"
                  value={useCase}
                  onChange={(e) => setUseCase(e.target.value)}
                  placeholder="e.g., Creating illustrations for our marketing site and blog posts..."
                  rows={3}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-pink-500 focus:border-transparent resize-none"
                  required
                  disabled={isSubmitting}
                />
              </div>

              <div>
                <label htmlFor="teamSize" className="block text-sm font-medium text-gray-700 mb-1">
                  Team size
                </label>
                <select
                  id="teamSize"
                  value={teamSize}
                  onChange={(e) => setTeamSize(e.target.value)}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-pink-500 focus:border-transparent"
                  disabled={isSubmitting}
                >
                  <option value="1">Just me</option>
                  <option value="2-5">2-5 people</option>
                  <option value="6-10">6-10 people</option>
                  <option value="11+">11+ people</option>
                </select>
              </div>

              {error && (
                <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg text-sm">
                  {error}
                </div>
              )}

              <button
                type="submit"
                disabled={isSubmitting}
                className="w-full bg-gradient-to-r from-pink-500 to-pink-600 text-white font-semibold py-3 px-6 rounded-lg hover:from-pink-600 hover:to-pink-700 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isSubmitting ? 'Submitting...' : 'Request Access'}
              </button>
            </form>
          </>
        )}
      </div>
    </>
  )
}
