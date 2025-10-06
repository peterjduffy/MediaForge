export interface TeamMember {
  userId: string
  email: string
  name: string
  role: 'owner' | 'member'
  joinedAt: Date
  usageThisMonth: number // Credits used this billing cycle
}

export interface TeamInvite {
  id: string
  teamId: string
  email: string
  invitedBy: string
  invitedAt: Date
  expiresAt: Date
  token: string
  status: 'pending' | 'accepted' | 'expired'
}

export interface Team {
  id: string
  name: string
  ownerId: string
  createdAt: Date
  members: TeamMember[]
  credits: number // Shared credit pool
  creditsResetDate: Date
  billingCycleStart: Date
  plan: 'business' // Only Business tier has teams

  // Brand styles are shared across team
  brandStyleIds: string[]

  // Daily rate limits for fair use
  dailyGenerationLimit: number // e.g., 500 per day
  dailyGenerationsUsed: number
  dailyLimitResetDate: Date
}

export interface TeamUsageStats {
  userId: string
  userName: string
  generationsThisMonth: number
  creditsUsedThisMonth: number
  lastGeneratedAt?: Date
}
