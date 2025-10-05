# 📋 PRODUCT REQUIREMENTS DOCUMENT

## MediaForge - AI Illustration Platform for SaaS Teams

**Version:** 1.0 MVP  
**Last Updated:** September 2025  
**Document Owner:** Product Team  
**Status:** Ready for Development
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

- **Primary:** SaaS marketing teams (5-50 people)
- **Secondary:** Solo founders, content creators, agencies
- **Use Cases:** Blog headers, social posts, presentations, documentation, landing pages

### 1.3 Value Proposition

**"Unbland Your Imagery"**

- ⚡ **Speed:** From prompt to publish in seconds
- 🎨 **Consistency:** One look across all channels
- 🏢 **On-brand:** Match your guidelines (colors, style)
- 👥 **Team-friendly:** Simple for everyone to use

### 1.4 Key Differentiators

1. **Brand Styles:** Upload examples, train custom styles (not just presets)
2. **SaaS-focused:** Styles designed for professional B2B use cases
3. **Team collaboration:** Shared credits, shared library
4. **Quality over quantity:** Curated styles vs. endless generic options

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
- Team association (if applicable)

**Account Settings:**

- Update name/email
- Change password
- Delete account

---

### 2.2 ILLUSTRATION STYLES

#### 2.2.1 Preset Styles (5)

MediaForge launches with 5 professionally curated styles:

| Style Name | Description | Use Cases |
|------------|-------------|-----------|
| **Google** | Clean, modern illustrations with vibrant colors and geometric shapes | Marketing pages, social media, presentations |
| **Notion** | Friendly, approachable illustrations perfect for documentation and guides | Help docs, tutorials, knowledge bases |
| **SaaSthetic** | Professional line art with clean, minimalist aesthetic | B2B marketing, corporate content |
| **Clayframe** | 3D rendered style with depth and realism | Premium products, hero sections, differentiation |
| **Flat 2D** | Simple, flat design with bold colors and minimalist aesthetic | Icons, diagrams, simple graphics |

**Each style includes:**

- Name and description
- 6 thumbnail examples
- 3 hardcoded example prompts (shown inline when selected)

**Example prompts by style:**

```
const styleExamples = {
  'google': [
    'a team collaborating around a whiteboard',
    'person analyzing data on laptop',
    'customer service representative helping client'
  ],
  'notion': [
    'person organizing tasks on desktop',
    'team reviewing documentation together',
    'workflow diagram with connected steps'
  ],
  'saasthetic': [
    'professional business meeting',
    'data dashboard with charts',
    'remote work setup with laptop'
  ],
  'clayframe': [
    '3D character celebrating success',
    'realistic office environment with team',
    'product showcase with depth'
  ],
  'flat2d': [
    'simple icon of person at computer',
    'minimalist workflow diagram',
    'bold geometric pattern illustration'
  ]
}
```

#### 2.2.2 Brand Styles (Custom - Premium Feature)

**Available on:** Starter, Pro, Business plans

**Create Brand Style Flow:**

1. Navigate to Styles page → "My Styles" tab → "Create Brand Style" button
2. Fill out form:
    - **Brand Name** (required, 1-50 chars)
    - **Brand Colors** (optional, up to 5 colors via hex input)
    - **Upload Images** (required, 10-30 images, min 1024x1024px)
3. Click "Create Brand Style"
4. Training begins (~15-30 minutes)
5. Style appears in "My Styles" with status indicator
6. When ready, appears in style picker alongside presets

**Brand Style Form UI:**

`┌─ Create Your Brand Style ────────────────────────┐ │ │ │ Brand Name * │ │ ┌─────────────────────────────────────────────┐ │ │ │ e.g. Acme Corp, MyStartup Brand │ │ │ └─────────────────────────────────────────────┘ │ │ │ │ Brand Colors (optional but recommended) │ │ Add up to 5 colors that represent your brand │ │ │ │ Color 1: [#FF5733 ] [x] │ │ Color 2: [#3498DB ] [x] │ │ Color 3: [ ] (empty) │ │ [+ Add Color] │ │ │ │ Upload Brand Examples * │ │ Upload 10-30 images of your existing brand style │ │ ┌─────────────────────────────────────────────┐ │ │ │ 📤 Upload Icon │ │ │ │ Drag and Drop or │ │ │ │ Choose files to upload │ │ │ └─────────────────────────────────────────────┘ │ │ │ │ 0 images selected (10-30 recommended) │ │ │ │ ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━ │ │ │ │ ⏱️ Training takes approximately 15-30 minutes │ │ Your custom brand style will be ready to use │ │ across all your illustrations. │ │ │ │ [Cancel] [Create Brand Style] │ └───────────────────────────────────────────────────┘`

**Guidelines Sidebar (Right Panel):**

`┌─ Guidelines for Best Results ────────────────────┐ │ │ │ 📊 Brand Consistency │ │ Upload examples from your existing brand │ │ materials - website illustrations, marketing │ │ graphics, or slides. Keep them consistent in │ │ style. Mixed styles reduce output quality. │ │ │ │ 🎨 Brand Colors │ │ Adding your brand colors helps the AI │ │ incorporate them naturally into your │ │ illustrations. You can add 1-5 colors. │ │ │ │ 📸 Upload Enough Examples │ │ You can upload up to 30 images. We recommend │ │ 15-20 high-quality examples. If you only have │ │ 10 great ones, that works too - quality over │ │ quantity. │ │ │ │ 🔍 Image Quality │ │ Images should be at least 1024x1024px for │ │ best results. Lower resolution or blurry │ │ images reduce the quality of your outputs. │ └───────────────────────────────────────────────────┘`

**Training Status Display:**

`┌─ My Brand Styles ─────────────────────────────────┐ │ │ │ ┌────────────────────────────────────────────┐ │ │ │ Acme Corp │ │ │ │ │ │ │ │ ⏱️ Training in progress... │ │ │ │ Started 8 minutes ago │ │ │ │ Estimated completion: ~15 minutes │ │ │ │ │ │ │ │ Brand colors: 🔴 🔵 ⚫ │ │ │ │ │ │ │ │ [View Details] │ │ │ └────────────────────────────────────────────┘ │ │ │ │ ┌────────────────────────────────────────────┐ │ │ │ MyStartup Brand ✓ Ready │ │ │ │ [6 thumbnail examples] │ │ │ │ │ │ │ │ Brand colors: 🟢 🟡 🟣 │ │ │ │ Created: 5 days ago │ │ │ │ │ │ │ │ [Use Style] [Edit] [Delete] │ │ │ └────────────────────────────────────────────┘ │ └────────────────────────────────────────────────────┘`

**Plan Limits for Brand Styles:**


- **Free:** Cannot create brand styles
- **Paid Plans (Starter, Pro, Business):** Create unlimited brand styles
  - One-time LoRA training cost per style (~$0.10-0.25)
  - No artificial limits - differentiation is by generation credits (100/300/700)

---

### 2.3 GENERATION

#### 2.3.1 Generation Interface

**Page:** `/generate`

**Layout:** Left panel (config) + Right panel (preview/recent)

**Left Panel Components:**

`┌─ Generate Illustration ───────────────────────────┐ │ │ │ Choose Your Style │ │ ┌──────────┐ ┌──────────┐ ┌──────────┐ │ │ │ Google │ │ Notion │ │ Acme ✓ │ │ │ │ [thumb] │ │ [thumb] │ │ [thumb] │ │ │ │ Preset │ │ Preset │ │ Your Brand│ │ │ └──────────┘ └──────────┘ └──────────┘ │ │ │ │ [View All Styles] │ │ │ │ 💡 Try: "team meeting" • "person at laptop" • More│ │ │ │ Prompt │ │ ┌────────────────────────────────────────────┐ │ │ │ Describe the illustration you want... │ │ │ │ │ │ │ │ │ │ │ └────────────────────────────────────────────┘ │ │ │ │ Size & Format │ │ ○ Square (1:1) - Social posts, icons │ │ [Additional ratios if technically feasible] │ │ │ │ [Cancel] [Generate] │ │ Press ⌘+Enter │ └────────────────────────────────────────────────────┘`

**Right Panel:**

`┌─ Preview ─────────────────────────────────────────┐ │ │ │ [Before generation] │ │ No illustration generated yet │ │ │ │ [After generation] │ │ ┌──────────────────────────────────────────┐ │ │ │ │ │ │ │ [Generated Image] │ │ │ │ │ │ │ └──────────────────────────────────────────┘ │ │ │ │ [⬇ Download PNG] [📋 Copy] [🔄 Regenerate] │ │ │ │ Recent (3 thumbnails with style labels) │ │ ┌────┐ ┌────┐ ┌────┐ │ │ │IMG │ │IMG │ │IMG │ │ │ └────┘ └────┘ └────┘ │ └────────────────────────────────────────────────────┘`

#### 2.3.2 Generation Logic

**When user clicks "Generate":**

1. Validate:
    
    - User has credits remaining (personal or team)
    - Style selected
    - Prompt not empty (min 10 chars)
2. Build prompt:
    

```
function buildFinalPrompt(userPrompt, style) {
  let prompt = userPrompt;
  
  // Add style-specific guidance
  if (style.type === 'preset') {
    prompt = `${stylePrompts[style.id].prefix}${userPrompt}${stylePrompts[style.id].suffix}`;
  }
  
  // If brand style with colors
  if (style.type === 'brand' && style.brandColors && style.brandColors.length > 0) {
    const colorString = style.brandColors.map(c => c.hex).join(', ');
    prompt += `, incorporating brand colors ${colorString} naturally`;
  }
  
  return prompt;
}
```

1. Call Imagen API (Nano Banana)
2. Show loading state: "Generating your illustration..." (10-30 seconds)
3. Deduct 1 credit
4. Save to database
5. Display result

**Loading State:**

`┌─ Generating... ───────────────────────────────────┐ │ │ │ [Animated spinner or progress bar] │ │ │ │ Creating your illustration... │ │ This usually takes 15-20 seconds │ │ │ │ [Cancel] │ └────────────────────────────────────────────────────┘`

#### 2.3.3 Aspect Ratios

**MVP:** Start with **1:1 (square) only** unless Imagen API makes other ratios trivial

**Post-MVP (if easy):** Add 16:9 landscape, 9:16 portrait

---

### 2.4 LIBRARY

**Page:** `/library`

**Purpose:** View all generated illustrations, search, filter, download

**Layout:**

`┌─ Library ─────────────────────────────────────────┐ │ │ │ 📊 47 illustrations • 253 credits remaining │ │ │ │ ┌────────────────────────────────────────────┐ │ │ │ Search illustrations... 🔍 │ │ │ └────────────────────────────────────────────┘ │ │ │ │ Style: [All Styles ▾] | Sort: [Newest First ▾] │ │ │ │ ┌──────┐ ┌──────┐ ┌──────┐ ┌──────┐ │ │ │ IMG │ │ IMG │ │ IMG │ │ IMG │ │ │ │ │ │ │ │ │ │ │ │ │ │Google│ │Acme │ │Notion│ │Google│ │ │ └──────┘ └──────┘ └──────┘ └──────┘ │ │ 2d ago 5d ago 1w ago 2w ago │ │ │ │ ┌──────┐ ┌──────┐ ┌──────┐ ┌──────┐ │ │ │ IMG │ │ IMG │ │ IMG │ │ IMG │ │ │ └──────┘ └──────┘ └──────┘ └──────┘ │ │ │ │ [Load More] │ └────────────────────────────────────────────────────┘`

**Features:**

- **Grid layout:** 4 columns on desktop, responsive
- **Search:** Filter by prompt text (client-side or server-side)
- **Filter by style:** Dropdown showing all styles user has used
- **Sort:** Newest first (default), Oldest first
- **Infinite scroll or Load More:** Pagination for performance
- **Click image:** Opens detail modal

**Image Detail Modal:**

`┌─ Illustration Details ────────────────────────────┐ │ [X Close] │ │ │ │ [Large Image Preview] │ │ │ │ Created: 2 days ago │ │ Style: Acme Corp (Your Brand) │ │ Size: 1024x1024 │ │ │ │ Prompt: │ │ "a team collaborating around a whiteboard with │ │ charts and sticky notes" │ │ │ │ [⬇ Download PNG] [📋 Copy to Clipboard] [🗑 Delete]│ │ │ │ [← Previous] [Next →] │ └────────────────────────────────────────────────────┘`

**Team Context:**

- If user is on a team, library shows **all team illustrations**
- Each image shows who created it: "Created by: Mike" (small label)
- Filter still works the same

---

### 2.5 CREDITS SYSTEM

#### 2.5.1 How Credits Work

- **1 credit = 1 generated illustration**
- Credits reset monthly on billing cycle date
- Personal plan: Credits belong to user
- Team plan: Credits pooled, shared across team
- **Credit Policy: Use or lose** - unused credits do not roll over to the next billing period and are non-refundable

#### 2.5.2 Credit Display

**Header (always visible):**

`┌─ Header ──────────────────────────────────────────┐ │ [Logo] Create Gallery Styles Pricing │ │ │ │ [+ Generate] 💎 247/500 [👤] │ └────────────────────────────────────────────────────┘ If on team: [+ Generate] 💎 247/500 👥 [👤] ↑ Team indicator`

**Hover tooltip on credit count:**

`Personal: "247 of 500 credits remaining Resets on Jan 15, 2025" Team: "Team has 247 credits remaining You've used 67 this month (27%)"`

#### 2.5.3 Out of Credits

**When user tries to generate with 0 credits:**

`┌─ Out of Credits ──────────────────────────────────┐ │ │ │ You've used all your credits for this month. │ │ │ │ Upgrade your plan to keep creating: │ │ │ │ • Starter: 100 credits/month - $19 │ │ • Pro: 300 credits/month - $49 │ │ • Business: 700 credits/month - $99 │ │ │ │ Credits reset on Jan 15, 2025 │ │ │ │ [View All Plans] │ └────────────────────────────────────────────────────┘`

**No other upgrade prompts** - keep it friction-free until they actually need more.

---

### 2.6 TEAMS (Business Plan)

#### 2.6.1 Team Structure

**Model:** Minimal but professional

- **Business plan only**
- **2 roles:** Owner and Member
- **Pooled credits:** Everyone shares one credit pool
- **Shared library:** Everyone sees all team generations
- **Owner privileges:** Billing, invites, usage visibility
- **Member privileges:** Generate illustrations, view library

#### 2.6.2 Team Management Interface

**Page:** `/team` (only visible if user is on a team)

**Owner View:**

`┌─ Team Settings ───────────────────────────────────┐ │ │ │ Business Plan: 700 credits/month │ │ Resets: Jan 15, 2025 │ │ │ │ ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━ │ │ │ │ Team Members (4) │ │ │ │ ┌──────────────────────────────────────────────┐ │ │ │ Sarah Jones (you) │ │ │ │ sarah@company.com Owner │ │ │ │ Joined: Jan 2024 • Generated: 127 this month │ │ │ └──────────────────────────────────────────────┘ │ │ │ │ ┌──────────────────────────────────────────────┐ │ │ │ Mike Chen │ │ │ │ mike@company.com Member │ │ │ │ Joined: Jan 2024 • Generated: 89 this month │ │ │ └──────────────────────────────────────────────┘ │ │ │ │ ┌──────────────────────────────────────────────┐ │ │ │ Jessica Lee │ │ │ │ jessica@company.com Member │ │ │ │ Joined: Feb 2024 • Generated: 37 this month │ │ │ └──────────────────────────────────────────────┘ │ │ │ │ ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━ │ │ │ │ Invite Team Member │ │ ┌──────────────────────────────────────────────┐ │ │ │ team-member@company.com │ │ │ └──────────────────────────────────────────────┘ │ │ [Send Invitation] │ │ │ │ ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━ │ │ │ │ Usage This Month │ │ │ │ 253 of 700 credits used (36%) │ │ ━━━━━━━━━░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░ │ │ │ │ Breakdown: │ │ Sarah (you) 127 (50%) ████████████░░░░░ │ │ Mike 89 (35%) ████████░░░░░░░░░ │ │ Jessica 37 (15%) ███░░░░░░░░░░░░░░ │ │ │ └────────────────────────────────────────────────────┘`

**Member View:**

`┌─ Team Info ───────────────────────────────────────┐ │ │ │ You're part of: Sarah's MediaForge Team │ │ Managed by: sarah@company.com │ │ │ │ ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━ │ │ │ │ Team Members (4) │ │ Sarah Jones, Mike Chen, Jessica Lee, Tom Park │ │ │ │ ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━ │ │ │ │ Your Activity This Month │ │ │ │ • 67 illustrations generated │ │ • 13% of team usage │ │ │ │ Team Pool: 447 of 700 credits remaining │ │ Resets: Jan 15, 2025 │ │ │ │ ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━ │ │ │ │ Need to upgrade or manage billing? │ │ Contact sarah@company.com │ │ │ └────────────────────────────────────────────────────┘`

#### 2.6.3 Invite Flow

**Step 1: Owner sends invite**

1. Owner enters email on `/team` page
2. System creates invite record
3. Email sent to invitee

**Invitation Email:**

`Subject: You're invited to join Sarah's MediaForge team Hi there, Sarah Jones has invited you to join their MediaForge team. As a team member, you'll get: • Access to 700 shared credits/month • Generate unlimited illustrations • Collaborate with your team on brand styles [Accept Invitation & Create Account] This invitation expires in 7 days. If you already have a MediaForge account, you'll be added to the team automatically. --- MediaForge`

**Step 2: Invitee clicks link**

Link format: `https://app.mediaforge.dev/accept-invite?token=abc123xyz`

**If user doesn't have account:**

- Shows signup form
- After signup, automatically adds to team
- Redirects to dashboard with welcome message

**If user already has account:**

- Shows confirmation: "Join Sarah's team?"
- Click confirm → Added to team
- Redirects to dashboard

**Step 3: Confirmation**

`┌─ Welcome to the Team! ────────────────────────────┐ │ │ │ You're now part of Sarah's MediaForge team! │ │ │ │ You have access to: │ │ • 700 shared credits/month │ │ • All team brand styles │ │ • Shared library of illustrations │ │ │ │ [Start Creating →] │ └────────────────────────────────────────────────────┘`

#### 2.6.4 Team Credit Logic

**When team member generates:**

```
function generateIllustration(userId, prompt, styleId) {
  const user = await getUser(userId);
  
  // Check if user is on team
  if (user.teamId) {
    const team = await getTeam(user.teamId);
    
    // Check team credits
    if (team.creditsUsed >= team.creditsPerMonth) {
      throw new Error('Team out of credits');
    }
    
    // Generate illustration
    const illustration = await callImagenAPI(prompt, styleId);
    
    // Deduct from team pool
    await updateTeam(team.teamId, {
      creditsUsed: team.creditsUsed + 1
    });
    
    // Save with both userId and teamId
    await saveIllustration({
      ...illustration,
      userId: userId,      // Track who created it
      teamId: team.teamId  // For team library query
    });
    
    return illustration;
  } else {
    // Individual user logic
    // ... (check user credits, deduct from user)
  }
}
```

**Library query:**

```
function getLibrary(userId) {
  const user = await getUser(userId);
  
  if (user.teamId) {
    // Show all team illustrations
    return await getIllustrations({ 
      teamId: user.teamId 
    }).orderBy('createdAt', 'desc');
  } else {
    // Show only user's illustrations
    return await getIllustrations({ 
      userId: userId 
    }).orderBy('createdAt', 'desc');
  }
}
```

---

### 2.7 ONBOARDING

**Goal:** Get new users to their first successful generation within 60 seconds

**Flow:**

**Step 1: After email verification**

Show welcome modal:

`┌─ Welcome to MediaForge! ──────────────────────────┐ │ [X Close] │ │ │ │ Let's create your first illustration in seconds. │ │ │ │ You have 5 free illustrations to explore. │ │ No credit card required. │ │ │ │ [Get Started →] │ └────────────────────────────────────────────────────┘`

**Step 2: Take to generation page**

- Google style pre-selected
- Example prompt pre-filled: "a team collaborating around a whiteboard"
- Tooltip pointing to Generate button

`👇 Click here to create your first illustration! [Generate]`

**Step 3: After first generation**

Show success message:

`┌─ Success! ────────────────────────────────────────┐ │ │ │ 🎉 You created your first illustration! │ │ │ │ You have 4 credits remaining. │ │ │ │ Next steps: │ │ • Download your illustration │ │ • Try a different style │ │ • Create your brand style (paid plans) │ │ │ │ [Download] [Generate Another] │ └────────────────────────────────────────────────────┘`

**That's it.** No multi-step wizard, no checklist, no friction.

---

## 3. USER FLOWS

### 3.1 New User Sign Up & First Generation

`1. User visits mediaforge.dev 2. Clicks "Join the waitlist" or "Sign up" 3. Enters email + password (or Google OAuth) 4. Receives verification email 5. Clicks verification link 6. Lands on app, sees welcome modal 7. Clicks "Get Started" 8. Taken to /generate with: - Google style selected - Example prompt filled in - Tooltip on Generate button 9. Clicks "Generate" 10. Waits 15-20 seconds 11. Sees generated illustration 12. Success modal appears 13. Downloads or generates another`

**Time to value: ~60 seconds**

### 3.2 Create Brand Style

`1. User navigates to /styles 2. Clicks "My Styles" tab 3. Clicks "Create Brand Style" button 4. Fills out form: - Brand name: "Acme Corp" - Colors: #FF5733, #3498DB (optional) - Uploads 18 images 5. Clicks "Create Brand Style" 6. Confirmation modal: "This will use 1 of your 3 brand style slots" 7. Clicks "Confirm" 8. Training begins 9. Status shown: "Training... ~15-30 minutes" 10. User receives email when ready: "Your Acme Corp brand style is ready!" 11. Style appears in "My Styles" with ✓ Ready badge 12. Can now select "Acme Corp" when generating`

### 3.3 Team Owner Invites Member

`1. Owner upgrades to Business plan 2. Navigates to /team 3. Enters member email: mike@company.com 4. Clicks "Send Invitation" 5. System sends email to Mike 6. Mike receives email, clicks "Accept Invitation" 7. Mike either: a) Has account → confirms joining, added to team b) No account → signs up, automatically added to team 8. Mike lands on dashboard with "Welcome to team!" message 9. Mike can now generate using team credits 10. Owner sees Mike in team member list 11. Owner sees Mike's usage in breakdown`

### 3.4 Generate with Brand Style

`1. User has created "Acme Corp" brand style (with red, blue, gray colors) 2. Navigates to /generate 3. Clicks "View All Styles" 4. Selects "Acme Corp" from "My Styles" section 5. Prompt: "a customer success manager helping a client" 6. Clicks "Generate" 7. System builds final prompt: "a customer success manager helping a client, incorporating brand colors #FF5733, #3498DB, #2C3E50 naturally" + applies Acme Corp trained model 8. Generation takes 15-20 seconds 9. Result shows illustration in Acme Corp style with brand colors 10. User downloads, shares with team`

---

## 4. TECHNICAL SPECIFICATIONS

### 4.1 Tech Stack

**Frontend:**

- **Framework:** React.js or Next.js
- **Styling:** Tailwind CSS (matches marketing site aesthetic)
- **UI Components:** Radix UI (modals, dropdowns) or Shadcn
- **State Management:** React Context or Zustand
- **Forms:** React Hook Form
- **File Upload:** React Dropzone

**Backend (Firebase):**

- **Authentication:** Firebase Auth (email/password + Google OAuth)
- **Database:** Firestore (document database)
- **Storage:** Firebase Storage (user uploads, generated images)
- **Functions:** Cloud Functions (serverless)
    - Generation webhook
    - Brand style training workflow
    - Stripe webhook handlers
    - Email notifications

**AI/ML (Hybrid Cost-Optimized Strategy):**

- **Primary Image Generation:** SDXL on Vertex AI Model Garden
  - Cost: ~$0.002 per generation
  - Used for: All standard generations (Free, Starter, Pro tiers)
  - Response time: 10-15 seconds
  - Quality: High quality, good prompt adherence

- **Premium Image Generation:** Imagen 3 on Vertex AI
  - Cost: ~$0.02 per generation (10x more expensive than SDXL)
  - Used for: Business tier only, or future premium quality upgrades
  - Response time: 5-10 seconds
  - Quality: Superior quality, excellent prompt adherence

- **Style Training:** LoRA fine-tuning on Vertex AI Training
  - Lightweight adaptation layers (5-10MB per style)
  - Training time: 15-30 minutes on T4 GPU
  - Cost: ~$0.10-0.25 per style training
  - Enables brand-specific style transfer without full model retraining
  - Input: 10-30 brand images (min 1024x1024px)

- **Cost Optimization:**
  - Budget: $2000 Google Cloud credits (4-5 month runway)
  - Default to SDXL for cost efficiency
  - Imagen 3 reserved for premium features only
  - LoRA enables affordable custom styles at scale

**Payments:**

- **Provider:** Stripe
- **Products:** Subscriptions with monthly billing
- **Webhooks:** Handle subscription lifecycle

**Email:**

- **Service:** Firebase Extensions for email
- **Templates:** Verification, invites, notifications

**Hosting:**

- **Frontend:** Firebase Hosting
- **Backend:** Firebase Cloud Functions
- **Assets:** Firebase Storage + CDN

### 4.2 Database Schema (Firestore)

#### Collection: `users`

```
{
  uid: string,                    // Firebase Auth UID
  email: string,
  displayName: string,
  photoURL: string | null,
  
  // Team association
  teamId: string | null,          // Reference to teams collection
  isTeamOwner: boolean,           // True if user owns the team
  
  // Personal subscription (if not on team)
  subscriptionTier: 'free' | 'starter' | 'pro' | 'business',
  creditsPerMonth: number,        // Based on tier
  creditsUsed: number,            // Reset monthly
  creditResetDate: timestamp,     // Next reset date
  
  // Stripe
  stripeCustomerId: string | null,
  stripeSubscriptionId: string | null,
  
  // Metadata
  createdAt: timestamp,
  lastLoginAt: timestamp,
  onboardingCompleted: boolean
}
```

#### Collection: `teams`

```
{
  teamId: string,                 // Auto-generated ID
  ownerUserId: string,            // Reference to users collection
  
  // Plan
  planType: 'business',           // Only business plan has teams
  creditsPerMonth: number,        // 700 for business
  creditsUsed: number,            // Shared pool
  creditResetDate: timestamp,
  
  // Stripe
  stripeCustomerId: string,
  stripeSubscriptionId: string,
  
  // Metadata
  createdAt: timestamp,
  updatedAt: timestamp
}
```

#### Collection: `teamInvites`

```
{
  inviteId: string,
  teamId: string,                 // Reference to teams
  invitedEmail: string,
  invitedBy: string,              // userId who sent invite
  
  status: 'pending' | 'accepted' | 'expired',
  token: string,                  // Unique token for invite link
  
  createdAt: timestamp,
  expiresAt: timestamp,           // 7 days from creation
  acceptedAt: timestamp | null
}
```

#### Collection: `styles`

```
{
  styleId: string,
  name: string,
  description: string,
  
  type: 'preset' | 'brand',
  
  // For preset styles
  isPreset: boolean,              // True for Google, Notion, etc.
  
  // For brand styles
  userId: string | null,          // Owner of brand style (null for presets)
  teamId: string | null,          // If created by team member
  
  brandColors: [
    { hex: '#FF5733', name: 'Primary' },
    { hex: '#3498DB', name: 'Secondary' }
  ] | null,
  
  uploadedImages: [string],       // URLs of training images
  thumbnails: [string],           // URLs of example outputs (6 images)
  
  // Training status
  status: 'training' | 'ready' | 'failed',
  trainingStartedAt: timestamp | null,
  trainingCompletedAt: timestamp | null,
  trainingError: string | null,
  
  // AI model
  modelId: string | null,         // Imagen fine-tuned model ID
  
  // Metadata
  createdAt: timestamp,
  updatedAt: timestamp
}
```

#### Collection: `illustrations`

```
{
  illustrationId: string,
  
  // Ownership
  userId: string,                 // Who created it
  teamId: string | null,          // If part of a team
  
  // Generation params
  prompt: string,                 // User's prompt
  finalPrompt: string,            // Actual prompt sent to API (with style prefix/suffix)
  styleId: string,                // Reference to styles
  styleName: string,              // Denormalized for display
  
  // Output
  imageURL: string,               // Firebase Storage URL
  thumbnailURL: string,           // Smaller version for grid
  width: number,
  height: number,
  aspectRatio: string,            // '1:1', '16:9', etc.
  
  // Metadata
  creditsUsed: number,            // Usually 1
  generationTime: number,         // Seconds
  createdAt: timestamp
}
```

#### Collection: `subscriptions`

```typescript
{
  subscriptionId: string,           // Unique subscription ID
  userId: string,                   // User who owns this subscription
  teamId: string | null,           // Team ID if team subscription

  // Plan details
  plan: 'free' | 'starter' | 'pro' | 'business',  // Subscription tier
  billingCycle: 'monthly' | 'yearly' | null, // null for free tier
  price: number,                   // Current price in cents (e.g., 1900 for $19.00)

  // Credits
  creditsAllocated: number,        // Monthly credit allocation based on plan
  creditsUsed: number,             // Credits used this billing period
  creditResetDate: Timestamp,      // When monthly credits reset

  // Billing
  status: 'active' | 'canceled' | 'past_due' | 'trialing',
  currentPeriodStart: Timestamp,   // Current billing period start
  currentPeriodEnd: Timestamp,     // Current billing period end
  cancelAtPeriodEnd: boolean,      // If subscription will cancel at period end

  // Stripe integration
  stripeCustomerId: string | null, // Stripe customer ID
  stripeSubscriptionId: string | null, // Stripe subscription ID
  stripePaymentMethodId: string | null, // Default payment method

  // Trial information
  trialEnd: Timestamp | null,      // When trial ends (null if not in trial)

  // Metadata
  createdAt: Timestamp,            // When subscription was created
  updatedAt: Timestamp,            // Last update time
  canceledAt: Timestamp | null,    // When subscription was canceled

  // Features based on plan
  maxBrandStyles: number,          // Number of brand styles allowed (0 for free, 1 for starter, 3 for pro, unlimited for business)
  maxGenerationsPerDay: number,    // Daily generation limit
  features: {
    pngExport: boolean,            // All tiers
    jpgExport: boolean,            // All tiers
    svgExport: boolean,            // Pro and Business only
    backgroundRemoval: boolean,    // Starter, Pro, and Business
    customStyles: boolean,          // Starter, Pro, and Business
    priorityGeneration: boolean,   // Pro and Business only
    teamCollaboration: boolean,    // Business only
  }
}
```
