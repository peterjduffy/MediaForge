'use client'

import React, { useState, useEffect } from 'react'
import { useAuth } from '@/contexts/AuthContext'
import { useRouter } from 'next/navigation'
import {
  getUserTeam,
  createTeamInvite,
  removeMember
} from '@/lib/team-service'
import { Team } from '@/types/team'

export default function TeamPage() {
  const { user, loading: authLoading } = useAuth()
  const router = useRouter()
  const [team, setTeam] = useState<Team | null>(null)
  const [loading, setLoading] = useState(true)
  const [inviteEmail, setInviteEmail] = useState('')
  const [inviteLoading, setInviteLoading] = useState(false)
  const [inviteSuccess, setInviteSuccess] = useState(false)
  const [error, setError] = useState('')

  const loadTeamData = async () => {
    try {
      setLoading(true)
      const userTeam = await getUserTeam(user!.uid)

      if (!userTeam) {
        setError('You are not part of a team')
        setLoading(false)
        return
      }

      setTeam(userTeam)
      setLoading(false)
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to load team data'
      setError(errorMessage)
      setLoading(false)
    }
  }

  useEffect(() => {
    if (authLoading) return
    if (!user) {
      router.push('/auth/signin')
      return
    }

    loadTeamData()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user, authLoading])

  async function handleInvite(e: React.FormEvent) {
    e.preventDefault()
    setError('')
    setInviteSuccess(false)

    if (!inviteEmail.trim()) {
      setError('Please enter an email address')
      return
    }

    // Validate email
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    if (!emailRegex.test(inviteEmail)) {
      setError('Please enter a valid email address')
      return
    }

    try {
      setInviteLoading(true)
      const invite = await createTeamInvite(team!.id, inviteEmail, user!.uid)

      // In production, send email with invite link
      const inviteLink = `${window.location.origin}/team/accept?token=${invite.token}`

      // For now, just show success and copy link to clipboard
      navigator.clipboard.writeText(inviteLink)

      setInviteSuccess(true)
      setInviteEmail('')
      setTimeout(() => setInviteSuccess(false), 3000)

    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to create invite'
      setError(errorMessage)
    } finally {
      setInviteLoading(false)
    }
  }

  async function handleRemoveMember(memberUserId: string) {
    if (!confirm('Are you sure you want to remove this member?')) return

    try {
      const result = await removeMember(team!.id, user!.uid, memberUserId)
      if (result.success) {
        await loadTeamData()
      } else {
        setError(result.error || 'Failed to remove member')
      }
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to remove member'
      setError(errorMessage)
    }
  }

  if (authLoading || loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-600 mb-4"></div>
          <p className="text-gray-600">Loading team...</p>
        </div>
      </div>
    )
  }

  if (!team) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center max-w-md mx-auto px-4">
          <h1 className="text-2xl font-bold text-gray-900 mb-2">No Team Found</h1>
          <p className="text-gray-600 mb-6">
            {error || 'You need to upgrade to a Business plan to access teams.'}
          </p>
          <button
            onClick={() => router.push('/app')}
            className="px-6 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700"
          >
            Go to Dashboard
          </button>
        </div>
      </div>
    )
  }

  const isOwner = team.ownerId === user?.uid
  const currentMember = team.members.find(m => m.userId === user?.uid)

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">{team.name}</h1>
          <p className="text-gray-600">
            {isOwner ? 'You are the team owner' : 'You are a team member'}
          </p>
        </div>

        {/* Credits Overview */}
        <div className="bg-white rounded-lg shadow-sm p-6 mb-8">
          <h2 className="text-xl font-semibold text-gray-900 mb-4">Team Credits</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div>
              <p className="text-sm text-gray-600 mb-1">Available Credits</p>
              <p className="text-3xl font-bold text-indigo-600">{team.credits}</p>
            </div>
            <div>
              <p className="text-sm text-gray-600 mb-1">Monthly Allocation</p>
              <p className="text-3xl font-bold text-gray-900">200</p>
            </div>
            <div>
              <p className="text-sm text-gray-600 mb-1">Resets On</p>
              <p className="text-lg font-semibold text-gray-900">
                {new Date(team.creditsResetDate).toLocaleDateString()}
              </p>
            </div>
          </div>
        </div>

        {/* Owner View: Invite Members */}
        {isOwner && (
          <div className="bg-white rounded-lg shadow-sm p-6 mb-8">
            <h2 className="text-xl font-semibold text-gray-900 mb-4">Invite Team Members</h2>
            <p className="text-sm text-gray-600 mb-4">
              Invite unlimited team members to share credits and brand styles. They&apos;ll receive an email with an invite link.
            </p>
            <form onSubmit={handleInvite} className="flex gap-3">
              <input
                type="email"
                value={inviteEmail}
                onChange={(e) => setInviteEmail(e.target.value)}
                placeholder="teammate@company.com"
                className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                disabled={inviteLoading}
              />
              <button
                type="submit"
                disabled={inviteLoading}
                className="px-6 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {inviteLoading ? 'Sending...' : 'Send Invite'}
              </button>
            </form>
            {inviteSuccess && (
              <div className="mt-3 p-3 bg-green-50 border border-green-200 rounded-lg">
                <p className="text-sm text-green-800">
                  ✓ Invite sent! The invite link has been copied to your clipboard.
                </p>
              </div>
            )}
            {error && (
              <div className="mt-3 p-3 bg-red-50 border border-red-200 rounded-lg">
                <p className="text-sm text-red-800">{error}</p>
              </div>
            )}
          </div>
        )}

        {/* Team Members */}
        <div className="bg-white rounded-lg shadow-sm p-6">
          <h2 className="text-xl font-semibold text-gray-900 mb-4">
            Team Members ({team.members.length})
          </h2>
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead>
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Member
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Role
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Joined
                  </th>
                  {isOwner && (
                    <>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Usage This Month
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Actions
                      </th>
                    </>
                  )}
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {team.members.map((member) => (
                  <tr key={member.userId}>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div>
                        <div className="text-sm font-medium text-gray-900">
                          {member.name}
                          {member.userId === user?.uid && (
                            <span className="ml-2 text-xs text-gray-500">(You)</span>
                          )}
                        </div>
                        <div className="text-sm text-gray-500">{member.email}</div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`px-2 py-1 inline-flex text-xs leading-5 font-semibold rounded-full ${
                        member.role === 'owner'
                          ? 'bg-indigo-100 text-indigo-800'
                          : 'bg-gray-100 text-gray-800'
                      }`}>
                        {member.role}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {new Date(member.joinedAt).toLocaleDateString()}
                    </td>
                    {isOwner && (
                      <>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                          {member.usageThisMonth} credits
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm">
                          {member.role !== 'owner' && (
                            <button
                              onClick={() => handleRemoveMember(member.userId)}
                              className="text-red-600 hover:text-red-900"
                            >
                              Remove
                            </button>
                          )}
                        </td>
                      </>
                    )}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Member's Personal Stats */}
        {!isOwner && currentMember && (
          <div className="bg-white rounded-lg shadow-sm p-6 mt-8">
            <h2 className="text-xl font-semibold text-gray-900 mb-4">Your Usage This Month</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <p className="text-sm text-gray-600 mb-1">Credits Used</p>
                <p className="text-3xl font-bold text-indigo-600">{currentMember.usageThisMonth}</p>
              </div>
              <div>
                <p className="text-sm text-gray-600 mb-1">Joined On</p>
                <p className="text-lg font-semibold text-gray-900">
                  {new Date(currentMember.joinedAt).toLocaleDateString()}
                </p>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
