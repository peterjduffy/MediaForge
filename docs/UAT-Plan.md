# MediaForge UAT Plan (5-10 Beta Users)

## Overview
**You (solo founder)** will run User Acceptance Testing with 5-10 external beta users from your waitlist before launching payments. Goal: Validate product-market fit and refine pricing/features based on real user feedback.

**No internal UAT team** - just you collecting feedback from real users.

## Timeline (10 Weeks)

### Week 1-2: Waitlist Building
**Goal**: 50-100 signups at [mediaforge.dev](https://mediaforge.dev)

**Promotion Channels:**
- Twitter/X: "Building an AI illustration tool that doesn't look like everyone else's. Giving 10 early users free Business access (3 months, $87 value) for feedback. Join waitlist: mediaforge.dev"
- LinkedIn: Post targeting marketing teams, SaaS founders
- Indie Hackers: "Show IH" post
- Reddit: r/SaaS, r/entrepreneur, r/startups
- Product Hunt: Ship (pre-launch page)

**Waitlist Data Collected:**
- Email
- Use case (minimum 10 characters)
- Team size (Just me, 2-5, 6-10, 11+)

### Week 3: Beta User Selection

**Selection Criteria (Ranked):**
1. **Responsive** (10 points): Replies to follow-up email within 24h
2. **Specific Use Case** (8 points): Clear, detailed description of how they'll use it
3. **Has Team** (5 points): 2+ people = tests team features
4. **Active on Social** (3 points): Active Twitter/LinkedIn = word-of-mouth potential

**Your Selection Process:**
1. Review waitlist submissions in Firebase Console (Firestore → `waitlist` collection)
2. Email responsive ones: "Thanks for joining! Quick question: what's your #1 use case for MediaForge?"
3. Score responses based on criteria above (simple spreadsheet)
4. Pick top 5-10 candidates
5. Send personalized invites: "You're in! Sign up here: https://mediaforge-957e4.web.app/auth/signin"

### Week 4: Onboarding (You + Beta Users)

**Your 1:1 Calls (30min each - Optional but Recommended):**
- Schedule via Calendly or just email back-and-forth
- Optional: Record with permission (Zoom/Loom) - or just take notes
- **Watch, don't guide** - see where they get stuck
- Ask at end: "What would make this worth $29/month to you?"

**Alternative: Async Onboarding (If You're Busy):**
- Just email: "You're in! Try generating 3 images and reply with feedback"
- Faster but less insight

**Your Checklist per User:**
- [ ] Onboarding call completed (or async email sent)
- [ ] Notes captured in Google Doc (pain points, feature requests)
- [ ] Optional: Invite sent to Slack/Discord (or just use email)
- [ ] Confirmed they created first generation

### Week 4-10: Active UAT (Your Feedback Loop)

**Weekly Check-ins (Easiest for You):**
Send simple email or Google Form every Monday:
1. How many images did you generate this week?
2. What worked well?
3. What frustrated you?
4. What's missing?
5. Would you pay $29/month for this? Why/why not?

Takes you ~15min/week to review responses.

**Optional Group Calls (If You Have Time):**
- Bi-weekly 30min Zoom to show updates
- Get live feedback
- Build community

**Communication Options (Pick What Works for You):**
- **Easiest**: Just email - reply to their feedback
- **Medium**: Shared Slack/Discord for quick bug reports (~5min/day monitoring)
- **Optional**: Public Trello board for feature requests (transparency builds trust)

### Week 8-10: Payment Launch Prep

**Based on UAT Feedback:**
1. Fix critical bugs
2. Ship 1-2 most requested features
3. Finalize pricing (confirm $29/mo works)
4. Build Stripe integration

**Founder's Pricing Offer:**
Email beta users: "Thanks for your feedback! You've been invaluable. As a thank you, we're offering Founder's Pricing: $19/month forever (or $199/year). Offer expires in 7 days."

## Key Metrics to Track

### Activation (Goal: 80%+)
- % who generate first image within 5 minutes of signup
- **Red flag**: <50% = onboarding broken

### Engagement (Goal: 10+ images/week)
- Average images generated per user per week
- **Red flag**: <5 images/week = not enough value

### Retention (Goal: 80% @ 2 weeks, 60% @ 4 weeks)
- % still active after 2 weeks
- % still active after 4 weeks
- **Red flag**: <40% @ 2 weeks = value prop broken

### Team Adoption (Goal: 50%+)
- % who invite at least 1 teammate
- **Red flag**: <20% = not solving team problem

### Brand Training (Goal: 40%+)
- % who upload brand assets
- **Red flag**: <10% = feature over-engineered or unclear value

### Willingness to Pay (Goal: 60%+)
- % who say "yes" to $29/month in weekly surveys
- **Red flag**: <40% = pricing too high or value too low

## Red Flags & Responses

| Red Flag | Response |
|----------|----------|
| No one uses brand training | Consider simplifying or removing for MVP |
| Everyone maxes out credits | Increase to 300/month or charge more |
| No one invites teammates | Focus on solo users, de-prioritize team features |
| People ghost after Week 1 | Core value prop broken - investigate onboarding |
| <50% would pay $29/mo | Either lower price or increase value (more credits, better features) |

## Success Criteria

**Must Have (Launch Blockers):**
- [ ] 80%+ activation rate
- [ ] 60%+ retention @ 2 weeks
- [ ] 60%+ would pay $29/month
- [ ] 0 critical bugs

**Nice to Have (Post-Launch):**
- [ ] 50%+ team adoption
- [ ] 40%+ brand training usage
- [ ] 10+ images/week average

## Post-UAT: Payment Launch (Week 10)

**Your Launch Checklist:**
1. [ ] Deploy Stripe integration (Phase 5C)
2. [ ] Email 5-10 beta users with Founder's Pricing ($19/mo forever, 7-day deadline)
3. [ ] Convert 3-5 beta users to paying (50%+ = success)
4. [ ] Email remaining waitlist: "Now open! $29/mo"
5. [ ] Optional: Product Hunt launch, Twitter announcement

**Minimum Success = 3 Paying Customers**
- 3 users × $19/mo = $57/month recurring revenue
- Validates people will pay
- Enough feedback to iterate
- Launch publicly once you have proof

---

*Created: 2025-10-06*
*Owner: Solo Founder*
*Status: Week 1 - Waitlist building*
*Your Time: ~5-10 hours/week during UAT (mostly calls & email)*
