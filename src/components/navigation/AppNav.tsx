/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable @typescript-eslint/no-unused-vars */
'use client'

import Link from 'next/link'
import { useState, useEffect } from 'react'
import { auth, db } from '@/lib/firebase'
import { onAuthStateChanged, signOut } from 'firebase/auth'
import { doc, onSnapshot } from 'firebase/firestore'
import { ChevronDown, User, Settings, CreditCard, LogOut } from 'lucide-react'
import Logo from '@/components/Logo'

export default function AppNav() {
  const [user, setUser] = useState<any>(null)
  const [credits, setCredits] = useState<{ remaining: number; total: number }>({ remaining: 5, total: 5 })
  const [isDropdownOpen, setIsDropdownOpen] = useState(false)
  const [isTeam, setIsTeam] = useState(false)

  useEffect(() => {
    const unsubscribeAuth = onAuthStateChanged(auth, async (firebaseUser) => {
      if (firebaseUser) {
        setUser(firebaseUser)

        // Listen to user document
        const userDocRef = doc(db, 'users', firebaseUser.uid)
        const unsubscribeUser = onSnapshot(userDocRef, (userDoc) => {
          if (userDoc.exists()) {
            const userData = userDoc.data()
            const teamId = userData.teamId

            if (teamId) {
              // User is on a team - listen to team credits
              setIsTeam(true)
              const teamDocRef = doc(db, 'teams', teamId)
              const unsubscribeTeam = onSnapshot(teamDocRef, (teamDoc) => {
                if (teamDoc.exists()) {
                  const teamData = teamDoc.data()
                  setCredits({
                    remaining: teamData.credits || 0,
                    total: 200 // Business tier allocation
                  })
                }
              })
              // Clean up team listener when component unmounts
              return () => unsubscribeTeam()
            } else {
              // User is not on a team - use personal credits
              setIsTeam(false)
              const plan = userData.subscriptionTier || 'free'
              const creditsPerMonth = getCreditsForPlan(plan)
              setCredits({
                remaining: creditsPerMonth - (userData.creditsUsed || 0),
                total: creditsPerMonth
              })
            }
          }
        })

        return () => unsubscribeUser()
      } else {
        setUser(null)
        setCredits({ remaining: 5, total: 5 })
      }
    })

    return () => unsubscribeAuth()
  }, [])

  const getCreditsForPlan = (plan: string) => {
    switch(plan) {
      case 'starter': return 100
      case 'pro': return 300
      case 'business': return 700
      default: return 5 // free
    }
  }

  const handleSignOut = async () => {
    await signOut(auth)
    window.location.href = '/'
  }

  const creditsPercentage = (credits.remaining / credits.total) * 100

  return (
    <nav className="border-b border-gray-200 bg-white">
      <div className="px-6 mx-auto">
        <div className="flex justify-between items-center h-16">
          {/* Left: Logo */}
          <Link href="/app" className="flex items-center">
            <Logo size="md" />
          </Link>

          {/* Right: Generate button, Credits, User menu */}
          <div className="flex items-center gap-4">
            {/* Generate Button */}
            <Link
              href="/app"
              className="px-4 py-2 bg-pink-600 text-white rounded-lg hover:bg-pink-700 transition-colors font-medium"
            >
              + Generate
            </Link>

            {/* Credits Display */}
            <div className="flex items-center gap-2 px-3 py-1.5 bg-gray-50 rounded-lg group cursor-help">
              <span className="text-2xl">💎</span>
              <span className="font-medium text-gray-700">
                {credits.remaining}/{credits.total}
              </span>
              {isTeam && <span className="text-gray-500">👥</span>}

              {/* Tooltip */}
              <div className="invisible group-hover:visible absolute top-14 right-32 bg-gray-900 text-white text-sm rounded-lg p-3 z-50 w-48">
                <div className="font-medium mb-1">
                  {isTeam ? 'Team Credits' : 'Personal Credits'}
                </div>
                <div className="text-gray-300">
                  {credits.remaining} of {credits.total} remaining
                </div>
                <div className="text-gray-400 text-xs mt-1">
                  Resets on {new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toLocaleDateString('en-US', {
                    month: 'short',
                    day: 'numeric',
                    year: 'numeric'
                  })}
                </div>
                {isTeam && (
                  <div className="text-gray-400 text-xs mt-1">
                    Shared across your team
                  </div>
                )}
              </div>
            </div>

            {/* User Menu */}
            <div className="relative">
              <button
                onClick={() => setIsDropdownOpen(!isDropdownOpen)}
                className="flex items-center gap-2 px-3 py-1.5 hover:bg-gray-50 rounded-lg transition-colors"
              >
                <div className="w-8 h-8 bg-gradient-to-br from-pink-400 to-pink-600 rounded-full flex items-center justify-center text-white font-medium">
                  {user?.displayName?.charAt(0) || user?.email?.charAt(0) || 'U'}
                </div>
                <ChevronDown className="w-4 h-4 text-gray-500" />
              </button>

              {/* Dropdown */}
              {isDropdownOpen && (
                <>
                  <div
                    className="fixed inset-0 z-40"
                    onClick={() => setIsDropdownOpen(false)}
                  />
                  <div className="absolute right-0 mt-2 w-56 bg-white rounded-lg shadow-lg border border-gray-200 py-2 z-50">
                    <div className="px-4 py-2 border-b border-gray-100">
                      <div className="font-medium text-gray-900">
                        {user?.displayName || 'User'}
                      </div>
                      <div className="text-sm text-gray-500">{user?.email}</div>
                    </div>

                    <Link
                      href="/settings"
                      className="flex items-center gap-3 px-4 py-2 hover:bg-gray-50 text-gray-700"
                      onClick={() => setIsDropdownOpen(false)}
                    >
                      <Settings className="w-4 h-4" />
                      Settings
                    </Link>

                    <Link
                      href="/billing"
                      className="flex items-center gap-3 px-4 py-2 hover:bg-gray-50 text-gray-700"
                      onClick={() => setIsDropdownOpen(false)}
                    >
                      <CreditCard className="w-4 h-4" />
                      Billing & Plan
                    </Link>

                    {isTeam && (
                      <Link
                        href="/team"
                        className="flex items-center gap-3 px-4 py-2 hover:bg-gray-50 text-gray-700"
                        onClick={() => setIsDropdownOpen(false)}
                      >
                        <User className="w-4 h-4" />
                        Team
                      </Link>
                    )}

                    <div className="border-t border-gray-100 mt-2 pt-2">
                      <button
                        onClick={handleSignOut}
                        className="flex items-center gap-3 px-4 py-2 hover:bg-gray-50 text-gray-700 w-full text-left"
                      >
                        <LogOut className="w-4 h-4" />
                        Sign out
                      </button>
                    </div>
                  </div>
                </>
              )}
            </div>
          </div>
        </div>
      </div>
    </nav>
  )
}