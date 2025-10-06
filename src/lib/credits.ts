/**
 * Credit management utilities
 * Central source of truth for credit allocations and pricing
 */

// Credit allocations per plan (as defined in CLAUDE.md)
export const PLAN_CREDITS = {
  free: 10, // 10 credits/month
  business: 200, // 200 credits/month + unlimited team members
} as const

export type PlanTier = keyof typeof PLAN_CREDITS

/**
 * Get monthly credit allocation for a given plan
 * @param plan - The subscription tier ('free' or 'business')
 * @returns Number of credits per month
 */
export function getCreditsForPlan(plan: string): number {
  // Normalize plan name
  const normalizedPlan = plan.toLowerCase() as PlanTier

  // Return credits for known plans, default to free tier
  return PLAN_CREDITS[normalizedPlan] ?? PLAN_CREDITS.free
}

/**
 * Calculate credits needed for a generation based on resolution
 * @param width - Image width in pixels
 * @param height - Image height in pixels
 * @returns Number of credits required (1 or 2)
 */
export function getCreditsForResolution(width: number, height: number): number {
  // 2048px images cost 2 credits, all others cost 1 credit
  return (width === 2048 || height === 2048) ? 2 : 1
}

/**
 * Check if user has sufficient credits
 * @param creditsRemaining - Credits available
 * @param creditsNeeded - Credits required
 * @returns True if user has enough credits
 */
export function hasEnoughCredits(creditsRemaining: number, creditsNeeded: number): boolean {
  return creditsRemaining >= creditsNeeded
}
