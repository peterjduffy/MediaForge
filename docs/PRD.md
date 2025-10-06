# 📋 PRODUCT REQUIREMENTS DOCUMENT

## MediaForge - AI Illustration Platform for SaaS Teams

**Version:** 2.1
**Last Updated:** October 2025
**Document Owner:** Product Team
**Status:** Phase 5A Complete (Teams Live), Phase 5B Next (Payments)
**Platform:** Desktop-first application (not optimized for mobile)

---

## TABLE OF CONTENTS

1. [Product Overview](#1-product-overview)
2. [Core Features](#2-core-features)
3. [User Flows](#3-user-flows)
4. [Technical Specifications](#4-technical-specifications)
5. [UI/UX Specifications](#5-uiux-specifications)
6. [Pricing & Monetization](#6-pricing--monetization)
7. [Success Metrics](#7-success-metrics)
8. [Phase 2 Features](#8-phase-2-features)

---

## 1. PRODUCT OVERVIEW

### 1.1 Product Vision

MediaForge enables SaaS teams to generate on-brand AI illustrations in seconds. Instead of generic stock images or expensive designer time, teams can create consistent, professional illustrations that match their brand guidelines.

### 1.2 Target Audience

- **Primary:** SaaS marketing teams (5-50 people)
- **Secondary:** Solo founders, content creators, agencies
- **Use Cases:** Blog headers, social posts, presentations, documentation, landing pages

### 1.3 Value Proposition

**"Your Brand's AI Illustrator"**

- ⚡ **Speed:** From prompt to publish in seconds
- 🎨 **Consistency:** One look across all channels
- 🏢 **On-brand:** Train AI on YOUR exact brand (Business tier)
- 👥 **Team-friendly:** Unlimited members, shared credits

### 1.4 Key Differentiators

1. **One-time Brand Training:** Upload examples, train once, use forever (not per-generation)
2. **Simple 2-Tier Pricing:** Free to test, Business to use ($29/mo)
3. **Transparent Intelligence:** AI automatically uses best model, no mode selection
4. **Zero Friction:** Optional async training, instant value after payment

---

## 2. CORE FEATURES

### 2.1 AUTHENTICATION & USER MANAGEMENT

**Sign Up / Sign In:**
- Email + password
- Google OAuth
- Email verification required

**User Profile:**
- Name
- Email
- Avatar (from Google or initials)
- Team association (if Business tier)

**Account Settings:**
- Update name/email
- Change password
- Upgrade plan
- Brand training access (Business tier)
- Delete account

---

### 2.2 ILLUSTRATION STYLES

#### 2.2.1 Preset Styles (5)

MediaForge includes 5 professionally curated styles available to all users:

| Style Name | Description | Use Cases |
|------------|-------------|-----------|
| **Google** | Clean, modern illustrations with vibrant colors and geometric shapes | Marketing pages, social media, presentations |
| **Notion** | Friendly, approachable illustrations perfect for documentation | Help docs, tutorials, knowledge bases |
| **SaaSthetic** | Professional line art with clean, minimalist aesthetic | B2B marketing, corporate content |
| **Clayframe** | 3D rendered style with depth and soft lighting | Premium products, hero sections |
| **Flat 2D** | Simple, flat design with bold colors and minimalist aesthetic | Icons, diagrams, simple graphics |

**Each style includes:**
- Name and description
- 6 thumbnail examples
- 3 hardcoded example prompts (shown inline when selected)

#### 2.2.2 Brand Styles (Business Tier Only)

**Your Brand Style:**
- One-time training process (15-30 minutes)
- First brand training included with Business tier ($29 value)
- Additional brands: $29 each (one-time)
- Brand refresh: $5 (update existing brand)

**Training Process (Async, Optional):**
1. Business signup → immediate access to preset styles
2. Optional: Upload brand assets during onboarding (can skip)
3. Upload 10-30 brand images (1024x1024 min)
4. Pick up to 5 brand colors (hex values)
5. Add brand name and description
6. Training runs in **background** (15-30 min)
7. User generates with presets while waiting
8. Toast notification when brand AI ready
9. "Your Brand" appears in style picker
10. Automatic model selection (transparent to user)

**Key UX Principles:**
- Training is optional (can add from Settings later)
- No forced waiting - instant value
- Transparent switching from Imagen 3 → SDXL + LoRA
- User never sees technical details

---

### 2.3 GENERATION INTERFACE

**Page:** `/app` or `/generate`

**Layout:**
```
┌─ Generate ─────────────────────────────────────────┐
│                                                      │
│ ┌─ Left Panel ──────┐  ┌─ Right Panel ────────────┐ │
│ │                    │  │                          │ │
│ │ Select Style:      │  │  [Preview Area]          │ │
│ │ ┌────┐ ┌────┐     │  │                          │ │
│ │ │ G  │ │ N  │     │  │                          │ │
│ │ └────┘ └────┘     │  │                          │ │
│ │ ┌────┐ ┌────┐     │  │                          │ │
│ │ │ S  │ │ C  │     │  │                          │ │
│ │ └────┘ └────┘     │  │                          │ │
│ │ ┌────┐ ┌────┐     │  │                          │ │
│ │ │ F  │ │Your│     │  │                          │ │
│ │ └────┘ │Brand│    │  │                          │ │
│ │        └────┘     │  │                          │ │
│ │                    │  │ Recent Generations:      │ │
│ │ Describe what     │  │ ┌──┐ ┌──┐ ┌──┐          │ │
│ │ you want:         │  │ └──┘ └──┘ └──┘          │ │
│ │ ┌────────────────┐│  └──────────────────────────┘ │
│ │ │                ││                               │
│ │ └────────────────┘│                               │
│ │                    │                               │
│ │ Size: 1024px ▾    │                               │
│ │                    │                               │
│ │ [Generate] (1 cr) │                               │
│ └────────────────────┘                               │
└──────────────────────────────────────────────────────┘
```

**Resolution-Based Credit Pricing:**
- 1024×1024: 1 credit
- 1536×1536: 1 credit
- 2048×2048: 2 credits

**Generation Process:**
1. User enters prompt
2. Selects style (preset or "Your Brand")
3. Clicks Generate
4. Loading state: "Creating your illustration..." (10-30 seconds)
5. Backend automatically selects best model:
   - Free tier: Always Imagen 3
   - Business (no brand): Imagen 3 with saved colors
   - Business (brand trained): SDXL + LoRA
6. Deduct credits based on resolution
7. Display result with download/copy/regenerate options

---

### 2.4 LIBRARY

**Page:** `/library`

**Features:**
- Grid layout (4 columns on desktop, responsive)
- Search by prompt text
- Filter by style (dropdown)
- Sort by newest/oldest
- Image detail modal with download/copy/delete
- Pagination or infinite scroll

**Team Context (Business Tier):**
- Shows all team illustrations
- Labels show creator: "Created by: Mike"
- Shared library for team collaboration

---

### 2.5 CREDITS SYSTEM

#### 2.5.1 How Credits Work

- **1 credit = 1 generated illustration** (at 1024px/1536px)
- **2 credits = 1 illustration at 2048px**
- Credits reset monthly on billing cycle date
- **30-day rollover policy** for paid credits
- Free tier: No rollover (use or lose)
- Business tier: Credits pooled, shared across unlimited team

#### 2.5.2 Credit Display

**Header (always visible):**
```
[Logo] Generate Library Styles          💎 47/200 👥 [👤]
                                         ↑        ↑
                                    Credits    Team
```

**Hover tooltip:**
- Shows remaining credits
- Reset date
- Team usage breakdown (if applicable)

---

### 2.6 TEAMS (Business Plan) ✅ LIVE

#### 2.6.1 Team Structure

- **Unlimited team members** (fair-use policy with 500 generations/day limit)
- Shared credit pool (200/month)
- Shared brand styles
- Shared illustration library
- Token-based email invitations (7-day expiry)

#### 2.6.2 Team Management

**Page:** `/team`

**Owner can:**
- Invite unlimited members via email (token-based links)
- View usage breakdown by member
- View team credit pool and reset date
- Remove members
- Manage brand trainings (shared across team)

**Members can:**
- Generate using team credits
- Use team's brand styles
- Access team library (all team illustrations)
- View own usage stats
- Leave team

**Invite Flow:**
- Owner enters email → invite created with unique token
- Token link copied to clipboard
- Recipient clicks link → validates email match
- Auto-join for existing users, sign-up flow for new users
- One-time use tokens with 7-day expiry

**Key Principle:** No artificial seat limits - credits are the natural limiter

**Fair-Use Protection:**
- Daily generation limit: 500/day per team
- Transactional credit deduction prevents race conditions
- Usage tracked per member for visibility

---

### 2.7 ONBOARDING

#### 2.7.1 Free Tier Onboarding

**Goal:** First generation within 60 seconds

1. Email verification → Welcome modal
2. Pre-filled example: Google style + sample prompt
3. Tooltip points to Generate button
4. First generation (10-15 seconds with Imagen 3)
5. Success modal with next steps

#### 2.7.2 Business Tier Onboarding

**Goal:** Instant value, optional brand training

1. Payment confirmation → Welcome
2. **Optional step:** "Upload your brand (or skip for now)"
   - If yes: Upload interface, training starts in background
   - If no: Direct to generation with presets
3. Generate immediately while training (if uploading)
4. Toast notification when brand ready (15-30 min)
5. "Your Brand" automatically appears in styles

---

## 3. USER FLOWS

### 3.1 Business User with Brand Training

```
1. Signs up for Business ($29/mo)
2. Sees: "Upload your brand (optional)"
3. Uploads 20 brand images
4. Picks brand colors: #FF5733, #3498DB
5. Names brand: "Acme Corp"
6. Sees: "Training in background (15-30 min)"
7. Redirected to generation page
8. Generates with Google style while waiting
9. 20 minutes later: Toast "Your brand is ready! 🎉"
10. "Acme Corp" appears in style picker
11. Selects "Acme Corp", enters prompt
12. Backend uses SDXL + LoRA (transparent)
13. Gets perfect on-brand illustration
```

### 3.2 Business User Skipping Training

```
1. Signs up for Business ($29/mo)
2. Sees: "Upload your brand (optional)"
3. Clicks "Skip for now"
4. Taken directly to generation
5. Uses preset styles immediately
6. Later: Goes to Settings
7. Clicks "Train your brand"
8. Uploads brand assets
9. Training runs in background
10. Continues generating while waiting
```

---

## 4. TECHNICAL SPECIFICATIONS

### 4.1 Tech Stack

**Frontend:**
- **Framework:** Next.js 15.5.2 with React 19
- **Styling:** Tailwind CSS 4
- **State Management:** React Context for auth
- **Deployment:** Firebase Hosting (static export)

**Backend:**
- **Auth:** Firebase Auth (email + Google OAuth)
- **Database:** Firestore
- **Storage:** Cloud Storage (7 buckets)
- **Generation:** Cloud Run services
- **Training:** Vertex AI Training (LoRA)
- **Queue:** Cloud Tasks for async jobs

### 4.2 AI Architecture (Hybrid Approach)

**Generation Models:**
- **Imagen 3:** Default for all users ($0.03/image)
- **SDXL + LoRA:** Business tier after training (~$0.014/image)

**Transparent Model Selection:**
```javascript
async function selectModel(user, style) {
  if (user.tier === 'free') {
    return 'imagen3';
  }
  if (style === 'brand' && user.brandTrained) {
    return 'sdxl-lora';
  }
  return 'imagen3';
}
```

**Infrastructure Strategy:**
- 10 Business users: Scale-to-zero (~$22/month)
- 100 Business users: Warm instances (~$400/month)
- Costs scale with revenue

---

## 5. UI/UX SPECIFICATIONS

### 5.1 Design Principles

1. **Zero Friction:** Every interaction should be instant or async
2. **Transparent Intelligence:** Hide technical complexity
3. **Business Focus:** Professional, clean, trustworthy
4. **Mobile Second:** Optimize for desktop creation workflow

### 5.2 Loading States

**Generation:** "Creating your illustration... (10-30 seconds)"
**Brand Training:** "Training your brand AI... You can keep generating!"
**Cold Start (if needed):** "Waking up your brand AI... (this may take a moment)"

---

## 6. PRICING & MONETIZATION

### 6.1 Pricing Tiers (Simple 2-Tier)

| Tier | Price | Credits | Brand Training | Teams | Target |
|------|-------|---------|----------------|-------|--------|
| **Free** | $0/mo | 10 on signup, 10/mo | ❌ | ❌ | Test quality |
| **Business** | $29/mo | 200/mo | ✅ First included | ✅ Unlimited | Real use |

**Add-ons:**
- Extra credits: $5 per 100 credits
- Additional brand training: $29 (one-time)
- Brand refresh: $5 (one-time)

### 6.2 Value Proposition

**Free Tier:**
- Try the quality
- No credit card required
- 1024px images only
- Preset styles only

**Business Tier ($29):**
- 200 credits/month (avg 10/workday)
- All resolutions
- One-time brand training included ($29 value)
- Train once, use forever
- Unlimited team members
- 30-day credit rollover
- Export presets

### 6.3 Revenue Projections

- **10 Business users:** $290/mo revenue, $22 costs = 92% margin
- **30 Business users:** $870/mo revenue, $90 costs = 90% margin
- **100 Business users:** $2,900/mo revenue, $400 costs = 86% margin

---

## 7. SUCCESS METRICS

### 7.1 North Star Metric

**Weekly Active Generators** - Users who generate at least 1 illustration per week

### 7.2 Key Metrics

**Activation:**
- Time to first generation < 60 seconds
- Free → Business conversion > 10%
- Brand training completion > 80%

**Engagement:**
- Avg generations per Business user > 50/month
- Team invite acceptance > 70%
- Brand style usage > 60% of generations

**Revenue:**
- MRR growth > 20% month-over-month
- Churn < 5% monthly
- LTV:CAC > 3:1

---

## 8. PHASE 2 FEATURES

### 8.1 Vector Export (Phase 6)

- SVG/EPS export
- "AI-optimized vectors" (set expectations)
- Premium add-on pricing

### 8.2 API Access

- Programmatic generation
- Webhook integrations
- Usage-based pricing

### 8.3 Advanced Brand Features

- Multiple brand profiles per account
- Brand style versioning
- Style mixing/blending

---

*Last Updated: October 2025 - Phase 5A complete: Teams feature live with unlimited members*