/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable @typescript-eslint/no-unused-vars */
/* eslint-disable @next/next/no-img-element */
'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { Search, Filter, Download, Copy, Trash2, X, ChevronLeft, ChevronRight } from 'lucide-react'
import { auth, db } from '@/lib/firebase'
import { onAuthStateChanged } from 'firebase/auth'
import { collection, query, where, orderBy, limit, onSnapshot, deleteDoc, doc, getDoc } from 'firebase/firestore'
import AppNav from '@/components/navigation/AppNav'
import { ProtectedRoute } from '@/components/auth/ProtectedRoute'
import { getCreditsForPlan } from '@/lib/credits'

export default function LibraryPage() {
  const [user, setUser] = useState<any>(null)
  const [illustrations, setIllustrations] = useState<any[]>([])
  const [filteredIllustrations, setFilteredIllustrations] = useState<any[]>([])
  const [searchQuery, setSearchQuery] = useState('')
  const [selectedStyle, setSelectedStyle] = useState('all')
  const [sortOrder, setSortOrder] = useState<'newest' | 'oldest'>('newest')
  const [selectedImage, setSelectedImage] = useState<any>(null)
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [stats, setStats] = useState({ total: 0, creditsRemaining: 0 })
  const [usedStyles, setUsedStyles] = useState<string[]>(['all'])

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (firebaseUser) => {
      if (firebaseUser) {
        setUser(firebaseUser)

        // Get user stats and check for team
        const userDoc = await getDoc(doc(db, 'users', firebaseUser.uid))
        let teamId = null
        if (userDoc.exists()) {
          const userData = userDoc.data()
          teamId = userData.teamId
          const plan = userData.subscriptionTier || 'free'
          const creditsPerMonth = getCreditsForPlan(plan)
          setStats({
            total: 0, // Will be updated from illustrations
            creditsRemaining: creditsPerMonth - (userData.creditsUsed || 0)
          })
        }

        // Load illustrations - show team illustrations if user is on a team
        let q
        if (teamId) {
          // Show all team illustrations
          q = query(
            collection(db, 'illustrations'),
            where('teamId', '==', teamId),
            orderBy('createdAt', 'desc')
          )
        } else {
          // Show only user's illustrations
          q = query(
            collection(db, 'illustrations'),
            where('userId', '==', firebaseUser.uid),
            orderBy('createdAt', 'desc')
          )
        }

        const unsubscribeIllustrations = onSnapshot(q, async (snapshot) => {
          const images = await Promise.all(snapshot.docs.map(async (docSnap) => {
            const data = docSnap.data()
            // Get creator name if different from current user
            let creatorName = 'You'
            if (data.userId !== firebaseUser.uid) {
              const creatorDoc = await getDoc(doc(db, 'users', data.userId))
              if (creatorDoc.exists()) {
                const creatorData = creatorDoc.data()
                creatorName = creatorData.name || creatorData.email || 'Team member'
              }
            }
            return {
              id: docSnap.id,
              ...data,
              creatorName
            }
          }))

          setIllustrations(images)
          setFilteredIllustrations(images)
          setStats(prev => ({ ...prev, total: images.length }))

          // Extract unique styles
          const styles = new Set(['all'])
          images.forEach((img: any) => {
            if (img.styleName) styles.add(img.styleName)
          })
          setUsedStyles(Array.from(styles))
        })

        return () => unsubscribeIllustrations()
      }
    })

    return () => unsubscribe()
  }, [])

  useEffect(() => {
    let filtered = [...illustrations]

    // Apply search filter
    if (searchQuery) {
      filtered = filtered.filter(img =>
        img.prompt?.toLowerCase().includes(searchQuery.toLowerCase())
      )
    }

    // Apply style filter
    if (selectedStyle !== 'all') {
      filtered = filtered.filter(img => img.styleName === selectedStyle)
    }

    // Apply sort
    filtered.sort((a, b) => {
      const aTime = a.createdAt?.toMillis?.() || a.createdAt?.seconds * 1000 || 0
      const bTime = b.createdAt?.toMillis?.() || b.createdAt?.seconds * 1000 || 0
      return sortOrder === 'newest' ? bTime - aTime : aTime - bTime
    })

    setFilteredIllustrations(filtered)
  }, [searchQuery, selectedStyle, sortOrder, illustrations])

  const handleDownload = async (image: any) => {
    const response = await fetch(image.imageURL)
    const blob = await response.blob()
    const url = window.URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `mediaforge-${image.id}.png`
    document.body.appendChild(a)
    a.click()
    a.remove()
    window.URL.revokeObjectURL(url)
  }

  const handleCopy = async (image: any) => {
    try {
      const response = await fetch(image.imageURL)
      const blob = await response.blob()
      await navigator.clipboard.write([
        new ClipboardItem({ 'image/png': blob })
      ])
      alert('Image copied to clipboard!')
    } catch (err) {
      alert('Failed to copy image')
    }
  }

  const handleDelete = async (imageId: string) => {
    if (confirm('Are you sure you want to delete this illustration?')) {
      await deleteDoc(doc(db, 'illustrations', imageId))
      setIsModalOpen(false)
      setSelectedImage(null)
    }
  }

  const openModal = (image: any) => {
    setSelectedImage(image)
    setIsModalOpen(true)
  }

  const navigateImage = (direction: 'prev' | 'next') => {
    const currentIndex = filteredIllustrations.findIndex(img => img.id === selectedImage.id)
    let newIndex = direction === 'next' ? currentIndex + 1 : currentIndex - 1

    if (newIndex < 0) newIndex = filteredIllustrations.length - 1
    if (newIndex >= filteredIllustrations.length) newIndex = 0

    setSelectedImage(filteredIllustrations[newIndex])
  }

  const formatDate = (timestamp: any) => {
    if (!timestamp) return ''
    const date = timestamp.toDate ? timestamp.toDate() : new Date(timestamp.seconds * 1000)
    const now = new Date()
    const diff = now.getTime() - date.getTime()
    const days = Math.floor(diff / (1000 * 60 * 60 * 24))

    if (days === 0) return 'Today'
    if (days === 1) return 'Yesterday'
    if (days < 7) return `${days}d ago`
    if (days < 30) return `${Math.floor(days / 7)}w ago`
    return date.toLocaleDateString()
  }

  return (
    <ProtectedRoute>
      <div className="min-h-screen bg-gray-50">
        <AppNav />

        <div className="max-w-7xl mx-auto px-6 py-8">
          {/* Header */}
          <div className="mb-8">
            <h1 className="text-2xl font-bold text-gray-900 mb-2">Library</h1>
            <div className="flex items-center gap-4 text-sm text-gray-600">
              <span className="flex items-center gap-1">
                📊 {stats.total} illustrations
              </span>
              <span className="flex items-center gap-1">
                💎 {stats.creditsRemaining} credits remaining
              </span>
            </div>
          </div>

          {/* Filters */}
          <div className="mb-6 space-y-4">
            {/* Search Bar */}
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search illustrations..."
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-pink-500 focus:border-transparent"
              />
            </div>

            {/* Filter Controls */}
            <div className="flex gap-4">
              <select
                value={selectedStyle}
                onChange={(e) => setSelectedStyle(e.target.value)}
                className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-pink-500 focus:border-transparent"
              >
                {usedStyles.map(style => (
                  <option key={style} value={style}>
                    {style === 'all' ? 'All Styles' : style}
                  </option>
                ))}
              </select>

              <select
                value={sortOrder}
                onChange={(e) => setSortOrder(e.target.value as 'newest' | 'oldest')}
                className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-pink-500 focus:border-transparent"
              >
                <option value="newest">Newest First</option>
                <option value="oldest">Oldest First</option>
              </select>
            </div>
          </div>

          {/* Image Grid */}
          {filteredIllustrations.length > 0 ? (
            <div className="grid grid-cols-4 gap-4">
              {filteredIllustrations.map((image) => (
                <div
                  key={image.id}
                  className="group relative bg-white rounded-lg overflow-hidden cursor-pointer hover:shadow-lg transition-shadow"
                  onClick={() => openModal(image)}
                >
                  <div className="aspect-square bg-gray-100">
                    <img
                      src={image.imageURL || image.thumbnailURL}
                      alt={image.prompt}
                      className="w-full h-full object-cover"
                    />
                  </div>
                  <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent opacity-0 group-hover:opacity-100 transition-opacity">
                    <div className="absolute bottom-0 left-0 right-0 p-3">
                      <div className="text-white text-sm font-medium truncate">
                        {image.prompt}
                      </div>
                      <div className="text-white/80 text-xs">
                        {image.styleName} • {formatDate(image.createdAt)}
                        {image.creatorName && image.creatorName !== 'You' && (
                          <> • by {image.creatorName}</>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-12">
              <div className="text-gray-500 mb-4">
                {searchQuery || selectedStyle !== 'all'
                  ? 'No illustrations found matching your filters'
                  : 'No illustrations yet'}
              </div>
              {!searchQuery && selectedStyle === 'all' && (
                <Link
                  href="/app"
                  className="inline-flex items-center px-4 py-2 bg-pink-600 text-white rounded-lg hover:bg-pink-700 transition-colors"
                >
                  Generate Your First Illustration
                </Link>
              )}
            </div>
          )}

          {/* Detail Modal */}
          {isModalOpen && selectedImage && (
            <>
              <div
                className="fixed inset-0 bg-black/50 z-40"
                onClick={() => setIsModalOpen(false)}
              />
              <div className="fixed inset-4 md:inset-8 lg:inset-16 bg-white rounded-xl z-50 flex flex-col">
                {/* Modal Header */}
                <div className="flex items-center justify-between p-4 border-b">
                  <h3 className="text-lg font-semibold">Illustration Details</h3>
                  <button
                    onClick={() => setIsModalOpen(false)}
                    className="p-2 hover:bg-gray-100 rounded-lg"
                  >
                    <X className="w-5 h-5" />
                  </button>
                </div>

                {/* Modal Content */}
                <div className="flex-1 flex">
                  {/* Image */}
                  <div className="flex-1 p-8 flex items-center justify-center bg-gray-50">
                    <img
                      src={selectedImage.imageURL}
                      alt={selectedImage.prompt}
                      className="max-w-full max-h-full object-contain rounded-lg shadow-lg"
                    />
                  </div>

                  {/* Details */}
                  <div className="w-96 p-6 overflow-y-auto">
                    <div className="space-y-4">
                      {selectedImage.creatorName && (
                        <div>
                          <label className="text-sm font-medium text-gray-500">Created By</label>
                          <div className="text-gray-900">{selectedImage.creatorName}</div>
                        </div>
                      )}

                      <div>
                        <label className="text-sm font-medium text-gray-500">Created</label>
                        <div className="text-gray-900">
                          {formatDate(selectedImage.createdAt)}
                        </div>
                      </div>

                      <div>
                        <label className="text-sm font-medium text-gray-500">Style</label>
                        <div className="text-gray-900">{selectedImage.styleName}</div>
                      </div>

                      <div>
                        <label className="text-sm font-medium text-gray-500">Size</label>
                        <div className="text-gray-900">
                          {selectedImage.width}×{selectedImage.height}
                        </div>
                      </div>

                      <div>
                        <label className="text-sm font-medium text-gray-500">Prompt</label>
                        <div className="text-gray-900 text-sm bg-gray-50 p-3 rounded-lg">
                          {selectedImage.prompt}
                        </div>
                      </div>

                      <div className="pt-4 space-y-2">
                        <button
                          onClick={() => handleDownload(selectedImage)}
                          className="w-full py-2 px-4 bg-gray-900 text-white rounded-lg hover:bg-gray-800 transition-colors flex items-center justify-center gap-2"
                        >
                          <Download className="w-4 h-4" />
                          Download PNG
                        </button>

                        <button
                          onClick={() => handleCopy(selectedImage)}
                          className="w-full py-2 px-4 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors flex items-center justify-center gap-2"
                        >
                          <Copy className="w-4 h-4" />
                          Copy to Clipboard
                        </button>

                        <button
                          onClick={() => handleDelete(selectedImage.id)}
                          className="w-full py-2 px-4 border border-red-300 text-red-600 rounded-lg hover:bg-red-50 transition-colors flex items-center justify-center gap-2"
                        >
                          <Trash2 className="w-4 h-4" />
                          Delete
                        </button>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Modal Footer - Navigation */}
                <div className="flex items-center justify-between p-4 border-t">
                  <button
                    onClick={() => navigateImage('prev')}
                    className="flex items-center gap-2 px-4 py-2 hover:bg-gray-100 rounded-lg transition-colors"
                  >
                    <ChevronLeft className="w-4 h-4" />
                    Previous
                  </button>
                  <button
                    onClick={() => navigateImage('next')}
                    className="flex items-center gap-2 px-4 py-2 hover:bg-gray-100 rounded-lg transition-colors"
                  >
                    Next
                    <ChevronRight className="w-4 h-4" />
                  </button>
                </div>
              </div>
            </>
          )}
        </div>
      </div>
    </ProtectedRoute>
  )
}