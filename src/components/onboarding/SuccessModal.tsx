'use client'

import { Download, RefreshCw, Sparkles } from 'lucide-react'

interface SuccessModalProps {
  isOpen: boolean
  onClose: () => void
  onDownload: () => void
  onGenerateAnother: () => void
  creditsRemaining: number
}

export default function SuccessModal({
  isOpen,
  onClose,
  onDownload,
  onGenerateAnother,
  creditsRemaining
}: SuccessModalProps) {
  if (!isOpen) return null

  return (
    <>
      {/* Backdrop */}
      <div className="fixed inset-0 bg-black/50 z-40" onClick={onClose} />

      {/* Modal */}
      <div className="fixed top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 bg-white rounded-xl p-8 z-50 max-w-md w-full shadow-xl">
        <div className="text-center">
          <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <Sparkles className="w-8 h-8 text-green-600" />
          </div>

          <h2 className="text-2xl font-bold text-gray-900 mb-3">
            🎉 You created your first illustration!
          </h2>

          <p className="text-gray-600 mb-2">
            You have <span className="font-semibold text-pink-600">{creditsRemaining} credits</span> remaining.
          </p>

          <div className="bg-gray-50 rounded-lg p-4 mb-6 text-left">
            <p className="text-sm font-medium text-gray-700 mb-2">Next steps:</p>
            <ul className="text-sm text-gray-600 space-y-1">
              <li>• Download your illustration</li>
              <li>• Try a different style</li>
              <li>• Create your brand style (paid plans)</li>
            </ul>
          </div>

          <div className="flex gap-3">
            <button
              onClick={onDownload}
              className="flex-1 py-2 px-4 bg-gray-900 text-white rounded-lg hover:bg-gray-800 transition-colors flex items-center justify-center gap-2"
            >
              <Download className="w-4 h-4" />
              Download
            </button>
            <button
              onClick={onGenerateAnother}
              className="flex-1 py-2 px-4 bg-pink-600 text-white rounded-lg hover:bg-pink-700 transition-colors flex items-center justify-center gap-2"
            >
              <RefreshCw className="w-4 h-4" />
              Generate Another
            </button>
          </div>
        </div>
      </div>
    </>
  )
}