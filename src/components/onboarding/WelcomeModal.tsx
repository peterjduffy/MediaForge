'use client'

import { X } from 'lucide-react'

interface WelcomeModalProps {
  isOpen: boolean
  onClose: () => void
  onGetStarted: () => void
}

export default function WelcomeModal({ isOpen, onClose, onGetStarted }: WelcomeModalProps) {
  if (!isOpen) return null

  return (
    <>
      {/* Backdrop */}
      <div className="fixed inset-0 bg-black/50 z-40" onClick={onClose} />

      {/* Modal */}
      <div className="fixed top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 bg-white rounded-xl p-8 z-50 max-w-md w-full shadow-xl">
        <button
          onClick={onClose}
          className="absolute top-4 right-4 p-2 hover:bg-gray-100 rounded-lg transition-colors"
        >
          <X className="w-5 h-5 text-gray-500" />
        </button>

        <div className="text-center">
          <div className="w-16 h-16 bg-gradient-to-br from-pink-500 to-pink-600 rounded-full flex items-center justify-center mx-auto mb-4">
            <span className="text-3xl">🎨</span>
          </div>

          <h2 className="text-2xl font-bold text-gray-900 mb-3">
            Welcome to MediaForge!
          </h2>

          <p className="text-gray-600 mb-6">
            Let&apos;s create your first illustration in seconds.
          </p>

          <div className="bg-gray-50 rounded-lg p-4 mb-6">
            <p className="text-sm text-gray-700">
              You have <span className="font-semibold">5 free illustrations</span> to explore.
              <br />
              No credit card required.
            </p>
          </div>

          <button
            onClick={onGetStarted}
            className="w-full py-3 bg-pink-600 text-white rounded-lg font-medium hover:bg-pink-700 transition-colors"
          >
            Get Started →
          </button>
        </div>
      </div>
    </>
  )
}