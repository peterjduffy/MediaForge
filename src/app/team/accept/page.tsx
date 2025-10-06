'use client'

import React, { useState, useEffect, Suspense } from 'react'
import { useAuth } from '@/contexts/AuthContext'
import { useRouter, useSearchParams } from 'next/navigation'
import { getInviteByToken, acceptTeamInvite, getTeam } from '@/lib/team-service'
import { TeamInvite, Team } from '@/types/team'

function AcceptInvitePageContent() {
  const { user } = useAuth()
  const router = useRouter()
  const searchParams = useSearchParams()
  const token = searchParams.get('token')

  const [invite, setInvite] = useState<TeamInvite | null>(null)
  const [team, setTeam] = useState<Team | null>(null)
  const [loading, setLoading] = useState(true)
  const [accepting, setAccepting] = useState(false)
  const [error, setError] = useState('')

  const loadInviteData = async () => {
    try {
      setLoading(true)
      const inviteData = await getInviteByToken(token!)

      if (!inviteData) {
        setError('Invalid invite link')
        setLoading(false)
        return
      }

      if (inviteData.status !== 'pending') {
        setError('This invite has already been used')
        setLoading(false)
        return
      }

      if (new Date() > inviteData.expiresAt) {
        setError('This invite has expired')
        setLoading(false)
        return
      }

      setInvite(inviteData)

      // Load team info
      const teamData = await getTeam(inviteData.teamId)
      if (teamData) {
        setTeam(teamData)
      }

      setLoading(false)
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to load invite'
      setError(errorMessage)
      setLoading(false)
    }
  }

  useEffect(() => {
    if (!token) {
      setError('Invalid invite link')
      setLoading(false)
      return
    }

    loadInviteData()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [token])

  async function handleAccept() {
    if (!user) {
      // Redirect to signin with return URL
      const returnUrl = `/team/accept?token=${token}`
      router.push(`/auth/signin?returnUrl=${encodeURIComponent(returnUrl)}`)
      return
    }

    if (!invite) return

    try {
      setAccepting(true)
      setError('')

      const result = await acceptTeamInvite(
        user.uid,
        user.email!,
        user.displayName || user.email!.split('@')[0],
        token!
      )

      if (result.success) {
        router.push('/team')
      } else {
        setError(result.error || 'Failed to accept invite')
        setAccepting(false)
      }
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to accept invite'
      setError(errorMessage)
      setAccepting(false)
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-600 mb-4"></div>
          <p className="text-gray-600">Loading invite...</p>
        </div>
      </div>
    )
  }

  if (error && !invite) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center max-w-md mx-auto px-4">
          <div className="bg-white rounded-lg shadow-sm p-8">
            <div className="text-red-500 text-5xl mb-4">⚠️</div>
            <h1 className="text-2xl font-bold text-gray-900 mb-2">Invalid Invite</h1>
            <p className="text-gray-600 mb-6">{error}</p>
            <button
              onClick={() => router.push('/')}
              className="px-6 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700"
            >
              Go to Homepage
            </button>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center">
      <div className="max-w-md w-full mx-auto px-4">
        <div className="bg-white rounded-lg shadow-sm p-8">
          {/* Header */}
          <div className="text-center mb-6">
            <div className="text-indigo-600 text-5xl mb-4">👥</div>
            <h1 className="text-2xl font-bold text-gray-900 mb-2">Team Invitation</h1>
            {team && (
              <p className="text-gray-600">
                You&apos;ve been invited to join <strong>{team.name}</strong>
              </p>
            )}
          </div>

          {/* Invite Details */}
          {invite && (
            <div className="bg-gray-50 rounded-lg p-4 mb-6">
              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-gray-600">Invited to:</span>
                  <span className="font-medium text-gray-900">{invite.email}</span>
                </div>
                {team && (
                  <>
                    <div className="flex justify-between">
                      <span className="text-gray-600">Team:</span>
                      <span className="font-medium text-gray-900">{team.name}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">Members:</span>
                      <span className="font-medium text-gray-900">{team.members.length}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">Shared Credits:</span>
                      <span className="font-medium text-gray-900">{team.credits}</span>
                    </div>
                  </>
                )}
              </div>
            </div>
          )}

          {/* Auth Status */}
          {!user && (
            <div className="mb-6 p-4 bg-blue-50 border border-blue-200 rounded-lg">
              <p className="text-sm text-blue-800">
                You need to sign in or create an account to accept this invitation.
              </p>
            </div>
          )}

          {/* Email Mismatch Warning */}
          {user && invite && user.email?.toLowerCase() !== invite.email.toLowerCase() && (
            <div className="mb-6 p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
              <p className="text-sm text-yellow-800">
                ⚠️ This invite is for <strong>{invite.email}</strong>, but you&apos;re signed in as <strong>{user.email}</strong>. Please sign in with the correct email address.
              </p>
            </div>
          )}

          {/* Error Message */}
          {error && (
            <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg">
              <p className="text-sm text-red-800">{error}</p>
            </div>
          )}

          {/* Actions */}
          <div className="space-y-3">
            <button
              onClick={handleAccept}
              disabled={accepting || Boolean(user && invite && user.email?.toLowerCase() !== invite.email.toLowerCase())}
              className="w-full px-6 py-3 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 disabled:opacity-50 disabled:cursor-not-allowed font-medium"
            >
              {accepting
                ? 'Accepting...'
                : user
                ? 'Accept Invitation'
                : 'Sign In to Accept'
              }
            </button>
            <button
              onClick={() => router.push('/')}
              className="w-full px-6 py-3 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 font-medium"
            >
              Decline
            </button>
          </div>

          {/* Expires Notice */}
          {invite && (
            <p className="mt-6 text-xs text-gray-500 text-center">
              This invitation expires on {new Date(invite.expiresAt).toLocaleDateString()}
            </p>
          )}
        </div>
      </div>
    </div>
  )
}

export default function AcceptInvitePage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-600 mb-4"></div>
          <p className="text-gray-600">Loading...</p>
        </div>
      </div>
    }>
      <AcceptInvitePageContent />
    </Suspense>
  )
}
