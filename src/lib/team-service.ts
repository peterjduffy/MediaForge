/* eslint-disable @typescript-eslint/no-unused-vars */
import { db } from './firebase'
import {
  collection,
  doc,
  getDoc,
  getDocs,
  setDoc,
  updateDoc,
  deleteDoc,
  query,
  where,
  arrayUnion,
  arrayRemove,
  increment,
  Timestamp,
  runTransaction
} from 'firebase/firestore'
import { Team, TeamMember, TeamInvite, TeamUsageStats } from '@/types/team'
import { v4 as uuidv4 } from 'uuid'

/**
 * Create a new team (called when user upgrades to Business plan)
 */
export async function createTeam(
  ownerId: string,
  ownerEmail: string,
  ownerName: string,
  teamName?: string
): Promise<string> {
  const teamId = uuidv4()
  const now = new Date()

  const team: Team = {
    id: teamId,
    name: teamName || `${ownerName}'s Team`,
    ownerId,
    createdAt: now,
    members: [
      {
        userId: ownerId,
        email: ownerEmail,
        name: ownerName,
        role: 'owner',
        joinedAt: now,
        usageThisMonth: 0
      }
    ],
    credits: 200, // Business tier starts with 200 credits
    creditsResetDate: new Date(now.getTime() + 30 * 24 * 60 * 60 * 1000), // 30 days
    billingCycleStart: now,
    plan: 'business',
    brandStyleIds: [],
    dailyGenerationLimit: 500, // Fair use limit
    dailyGenerationsUsed: 0,
    dailyLimitResetDate: new Date(now.getTime() + 24 * 60 * 60 * 1000)
  }

  await setDoc(doc(db, 'teams', teamId), {
    ...team,
    createdAt: Timestamp.fromDate(team.createdAt),
    creditsResetDate: Timestamp.fromDate(team.creditsResetDate),
    billingCycleStart: Timestamp.fromDate(team.billingCycleStart),
    dailyLimitResetDate: Timestamp.fromDate(team.dailyLimitResetDate),
    members: team.members.map(m => ({
      ...m,
      joinedAt: Timestamp.fromDate(m.joinedAt)
    }))
  })

  // Update user document with team reference
  await updateDoc(doc(db, 'users', ownerId), {
    teamId,
    teamRole: 'owner'
  })

  return teamId
}

/**
 * Get team by ID
 */
export async function getTeam(teamId: string): Promise<Team | null> {
  const teamDoc = await getDoc(doc(db, 'teams', teamId))
  if (!teamDoc.exists()) return null

  const data = teamDoc.data()
  return {
    ...data,
    createdAt: data.createdAt.toDate(),
    creditsResetDate: data.creditsResetDate.toDate(),
    billingCycleStart: data.billingCycleStart.toDate(),
    dailyLimitResetDate: data.dailyLimitResetDate.toDate(),
    members: data.members.map((m: { joinedAt: { toDate: () => Date } }) => ({
      ...m,
      joinedAt: m.joinedAt.toDate()
    }))
  } as Team
}

/**
 * Get user's team (if they're on one)
 */
export async function getUserTeam(userId: string): Promise<Team | null> {
  const userDoc = await getDoc(doc(db, 'users', userId))
  if (!userDoc.exists()) return null

  const userData = userDoc.data()
  if (!userData.teamId) return null

  return getTeam(userData.teamId)
}

/**
 * Create team invite
 */
export async function createTeamInvite(
  teamId: string,
  email: string,
  invitedBy: string
): Promise<TeamInvite> {
  const inviteId = uuidv4()
  const token = uuidv4()
  const now = new Date()
  const expiresAt = new Date(now.getTime() + 7 * 24 * 60 * 60 * 1000) // 7 days

  const invite: TeamInvite = {
    id: inviteId,
    teamId,
    email: email.toLowerCase(),
    invitedBy,
    invitedAt: now,
    expiresAt,
    token,
    status: 'pending'
  }

  await setDoc(doc(db, 'teamInvites', inviteId), {
    ...invite,
    invitedAt: Timestamp.fromDate(invite.invitedAt),
    expiresAt: Timestamp.fromDate(invite.expiresAt)
  })

  return invite
}

/**
 * Get invite by token
 */
export async function getInviteByToken(token: string): Promise<TeamInvite | null> {
  const invitesRef = collection(db, 'teamInvites')
  const q = query(invitesRef, where('token', '==', token))
  const snapshot = await getDocs(q)

  if (snapshot.empty) return null

  const doc = snapshot.docs[0]
  const data = doc.data()

  return {
    ...data,
    invitedAt: data.invitedAt.toDate(),
    expiresAt: data.expiresAt.toDate()
  } as TeamInvite
}

/**
 * Accept team invite
 */
export async function acceptTeamInvite(
  userId: string,
  email: string,
  name: string,
  inviteToken: string
): Promise<{ success: boolean; teamId?: string; error?: string }> {
  try {
    const invite = await getInviteByToken(inviteToken)

    if (!invite) {
      return { success: false, error: 'Invalid invite link' }
    }

    if (invite.status !== 'pending') {
      return { success: false, error: 'This invite has already been used' }
    }

    if (new Date() > invite.expiresAt) {
      return { success: false, error: 'This invite has expired' }
    }

    if (invite.email.toLowerCase() !== email.toLowerCase()) {
      return { success: false, error: 'This invite is for a different email address' }
    }

    // Use transaction to ensure consistency
    await runTransaction(db, async (transaction) => {
      const teamRef = doc(db, 'teams', invite.teamId)
      const teamDoc = await transaction.get(teamRef)

      if (!teamDoc.exists()) {
        throw new Error('Team not found')
      }

      const team = teamDoc.data() as Team

      // Check if user is already a member
      if (team.members.some(m => m.userId === userId)) {
        throw new Error('You are already a member of this team')
      }

      const newMember: TeamMember = {
        userId,
        email,
        name,
        role: 'member',
        joinedAt: new Date(),
        usageThisMonth: 0
      }

      // Add member to team
      transaction.update(teamRef, {
        members: arrayUnion({
          ...newMember,
          joinedAt: Timestamp.fromDate(newMember.joinedAt)
        })
      })

      // Update user with team reference
      transaction.update(doc(db, 'users', userId), {
        teamId: invite.teamId,
        teamRole: 'member'
      })

      // Mark invite as accepted
      transaction.update(doc(db, 'teamInvites', invite.id), {
        status: 'accepted'
      })
    })

    return { success: true, teamId: invite.teamId }
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : 'Failed to accept invite'
    return { success: false, error: errorMessage }
  }
}

/**
 * Remove member from team (owner only)
 */
export async function removeMember(
  teamId: string,
  ownerId: string,
  memberUserId: string
): Promise<{ success: boolean; error?: string }> {
  try {
    await runTransaction(db, async (transaction) => {
      const teamRef = doc(db, 'teams', teamId)
      const teamDoc = await transaction.get(teamRef)

      if (!teamDoc.exists()) {
        throw new Error('Team not found')
      }

      const team = teamDoc.data() as Team

      // Verify caller is owner
      if (team.ownerId !== ownerId) {
        throw new Error('Only team owner can remove members')
      }

      // Can't remove owner
      if (memberUserId === ownerId) {
        throw new Error('Cannot remove team owner')
      }

      // Find member to remove
      const member = team.members.find(m => m.userId === memberUserId)
      if (!member) {
        throw new Error('Member not found')
      }

      // Remove member from team
      transaction.update(teamRef, {
        members: arrayRemove({
          ...member,
          joinedAt: Timestamp.fromDate(member.joinedAt)
        })
      })

      // Remove team reference from user
      transaction.update(doc(db, 'users', memberUserId), {
        teamId: null,
        teamRole: null
      })
    })

    return { success: true }
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : 'Failed to remove member'
    return { success: false, error: errorMessage }
  }
}

/**
 * Leave team (member only)
 */
export async function leaveTeam(
  teamId: string,
  userId: string
): Promise<{ success: boolean; error?: string }> {
  try {
    await runTransaction(db, async (transaction) => {
      const teamRef = doc(db, 'teams', teamId)
      const teamDoc = await transaction.get(teamRef)

      if (!teamDoc.exists()) {
        throw new Error('Team not found')
      }

      const team = teamDoc.data() as Team

      // Owner can't leave (must transfer ownership first)
      if (team.ownerId === userId) {
        throw new Error('Team owner cannot leave. Transfer ownership first.')
      }

      // Find member
      const member = team.members.find(m => m.userId === userId)
      if (!member) {
        throw new Error('You are not a member of this team')
      }

      // Remove member from team
      transaction.update(teamRef, {
        members: arrayRemove({
          ...member,
          joinedAt: Timestamp.fromDate(member.joinedAt)
        })
      })

      // Remove team reference from user
      transaction.update(doc(db, 'users', userId), {
        teamId: null,
        teamRole: null
      })
    })

    return { success: true }
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : 'Failed to leave team'
    return { success: false, error: errorMessage }
  }
}

/**
 * Deduct team credits for generation
 */
export async function deductTeamCredits(
  teamId: string,
  userId: string,
  credits: number
): Promise<{ success: boolean; error?: string }> {
  try {
    await runTransaction(db, async (transaction) => {
      const teamRef = doc(db, 'teams', teamId)
      const teamDoc = await transaction.get(teamRef)

      if (!teamDoc.exists()) {
        throw new Error('Team not found')
      }

      const team = teamDoc.data() as Team

      // Check if user is member
      if (!team.members.some(m => m.userId === userId)) {
        throw new Error('User is not a team member')
      }

      // Check credits
      if (team.credits < credits) {
        throw new Error('Insufficient team credits')
      }

      // Check daily limit
      const now = new Date()
      if (now > team.dailyLimitResetDate) {
        // Reset daily counter
        transaction.update(teamRef, {
          dailyGenerationsUsed: 1,
          dailyLimitResetDate: Timestamp.fromDate(
            new Date(now.getTime() + 24 * 60 * 60 * 1000)
          )
        })
      } else {
        if (team.dailyGenerationsUsed >= team.dailyGenerationLimit) {
          throw new Error('Daily generation limit reached. Try again tomorrow.')
        }
        transaction.update(teamRef, {
          dailyGenerationsUsed: increment(1)
        })
      }

      // Deduct credits
      transaction.update(teamRef, {
        credits: increment(-credits)
      })

      // Update member usage
      const updatedMembers = team.members.map(m => {
        if (m.userId === userId) {
          return {
            ...m,
            usageThisMonth: m.usageThisMonth + credits
          }
        }
        return m
      })

      transaction.update(teamRef, {
        members: updatedMembers.map(m => ({
          ...m,
          joinedAt: Timestamp.fromDate(m.joinedAt)
        }))
      })
    })

    return { success: true }
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : 'Failed to use credits'
    return { success: false, error: errorMessage }
  }
}

/**
 * Get team usage stats
 */
export async function getTeamUsageStats(teamId: string): Promise<TeamUsageStats[]> {
  const team = await getTeam(teamId)
  if (!team) return []

  return team.members.map(member => ({
    userId: member.userId,
    userName: member.name,
    generationsThisMonth: member.usageThisMonth,
    creditsUsedThisMonth: member.usageThisMonth
  }))
}

/**
 * Reset monthly credits (called by billing system)
 */
export async function resetMonthlyCredits(teamId: string): Promise<void> {
  const teamRef = doc(db, 'teams', teamId)
  const now = new Date()

  await updateDoc(teamRef, {
    credits: 200, // Business tier allocation
    creditsResetDate: Timestamp.fromDate(
      new Date(now.getTime() + 30 * 24 * 60 * 60 * 1000)
    ),
    // Reset member usage
    'members': await getTeam(teamId).then(team =>
      team?.members.map(m => ({
        ...m,
        usageThisMonth: 0,
        joinedAt: Timestamp.fromDate(m.joinedAt)
      })) || []
    )
  })
}
