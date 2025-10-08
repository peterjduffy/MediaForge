# Claude Configuration - MediaForge

## Project Overview
- **Name**: MediaForge
- **Type**: IllustrationsAI.com clone - Google native Next.js application
- **AI Stack**: Imagen 3 (primary for all users), SDXL + LoRA (Business tier with trained brands only), Vertex AI Training for brand styles
- **Main Branch**: main
- **Current Working Directory**: /home/user/mediaforge
- **Reference**: https://illustrationsai.com/
- **Live Site**: https://mediaforge-957e4.web.app
- **Status**: Phase 5B+ complete - Pre-UAT fixes deployed (error handling, status tracking, event logging)

## Key Commands
```bash
# Development
npm run dev          # Start development server with Turbopack
npm run build        # Build for production with Turbopack (creates static export in out/)
npm run start        # Start production server
npm run lint         # Run ESLint

# Deployment (KEYLESS - uses Cloud Workstation ADC)
firebase logout --non-interactive || true  # Clear stale CLI sessions
firebase deploy --project mediaforge-957e4 --only hosting --non-interactive

# Git
git status           # Check working tree status
git diff             # Show unstaged changes
git log --oneline    # Show commit history
```

## Project Structure
```
/home/user/mediaforge/
├── src/
│   ├── app/
│   │   ├── (marketing)/        # Route group - public pages with full nav
│   │   │   ├── layout.tsx      # Marketing layout (nav + footer)
│   │   │   ├── page.tsx        # Landing page (/)
│   │   │   ├── styles/         # (/styles) - full gallery
│   │   │   ├── pricing/        # (/pricing) - when ready
│   │   │   ├── blog/           # (/blog) - content marketing
│   │   │   └── [legal pages]   # (/privacy, /terms, /security)
│   │   ├── app/
│   │   │   ├── layout.tsx      # App layout (minimal nav, AppNav)
│   │   │   └── page.tsx        # Generation interface (left/right panels)
│   │   ├── auth/
│   │   │   ├── layout.tsx      # Auth layout (logo only)
│   │   │   ├── signin/         # (/auth/signin)
│   │   │   └── verify/         # (/auth/verify)
│   │   └── layout.tsx          # Root layout (AuthProvider)
│   ├── components/
│   │   ├── auth/               # Auth components (ProtectedRoute, etc.)
│   │   ├── navigation/         # AppNav, MarketingNav components
│   │   ├── onboarding/         # WelcomeModal, SuccessModal
│   │   └── [other components]
│   ├── lib/
│   │   ├── firebase.ts         # Firebase configuration
│   │   └── ai-generation.ts    # AI generation service (mock + real)
├── public/                     # Static assets
├── docs/                       # Documentation
└── [config files]
```

## Key Features
- AI-powered illustration generation with transparent model selection (Imagen 3 + SDXL with LoRA)
- PNG/JPG output, AI-optimized vectors later (Phase 7)
- **Simplified 2-tier pricing** (YC best practice):
  - Free Forever: 10 credits/month (no rollover, no purchases)
  - Business: $29/mo, 200 credits/month (use it or lose it) + 1 brand training + 1 free refresh/month + Teams
- Business tier includes optional async brand training
  - Upload brand during onboarding or skip and add later
  - Training happens in background (15-30 min) while you generate
  - Automatically switches to trained model when ready
  - No mode selection - seamless "Your Brand" style
- Unlimited team members with shared credits (fair-use)
- Resolution-based pricing (1024/1536 = 1 credit, 2048 = 2 credits)
- Pre-trained style packs for instant generation (Google, Notion, Flat 2D, etc.)

## Architecture
Single Next.js application with route group organization:
- **Marketing Routes** (`(marketing)/`): Full nav + footer for public pages
- **App Route** (`/app`): Minimal nav, tabbed interface (Generate, Styles, Gallery)
- **Auth Routes** (`/auth/*`): Minimal layout focused on conversion
- **Navigation Strategy**: Context-aware layouts for different user states
- **Tech Stack**: Next.js 15.5.2, Firebase Auth, Firestore, Cloud Storage
- **AI Pipeline**:
  - Imagen 3 (primary) - Free tier + Business tier preset styles
  - SDXL + LoRA (Business tier only) - Trained brand styles
  - Vertex AI Training - Brand LoRA fine-tuning
- **Detailed docs**: See `docs/Architecture.md`, `docs/navigation-strategy.md`, and `docs/app-structure.md`

## Dependencies
- **Framework**: Next.js 15.5.2 with React 19.1.0
- **Backend**: Firebase 12.3.0
- **AI**: SDXL + LoRA (via Cloud Run + Vertex AI Training), Imagen 3 (fallback)
- **Budget**: $2000 Google Cloud credits (4-5 month runway)
- **Styling**: Tailwind CSS 4
- **Language**: TypeScript 5

## Environment
- **Hosting**: Firebase hosted environment
- **Runtime**: Node.js with npm
- **Bundler**: Turbopack for faster builds
- **Deployment**: Firebase integration enabled

## Firebase Configuration
- **Project ID**: mediaforge-957e4
- **Web App**: Configured with Firebase SDK
- **Config Location**: src/lib/firebase.ts
- **Services**: Auth, Firestore, Storage
- **Live URL**: https://mediaforge-957e4.web.app
- **Deployment**: Keyless via firebase-deployer@mediaforge-957e4.iam.gserviceaccount.com
- **Build Output**: Static export configured in next.config.ts (output: 'export')

## Deployment Workflow
1. **Build**: `npm run build` (creates static export in `out/` directory)
2. **Deploy**: `firebase deploy --project mediaforge-957e4 --only hosting --non-interactive`
3. **Authentication**: Uses Cloud Workstation's Application Default Credentials (keyless)
4. **Service Account**: firebase-deployer@mediaforge-957e4.iam.gserviceaccount.com with Firebase Hosting Admin + Storage Admin roles
5. **Details**: See `docs/firebase-deploy.md` for complete runbook

## Current Status (2025-10-06)
- **Completed Phases**:
  - Phase 2B: App Interface (Generation, Library pages)
  - Phase 2C: Onboarding Flow (60-second time to value)
  - Phase 3: AI Integration - Imagen 3 deployed on Cloud Run
  - Phase 4: Brand Style Training MVP - Mock training + full UI deployed
  - Phase 5A: Teams Feature - Unlimited members with shared credits
  - Phase 5B: Waitlist & UAT Setup - Gated signup at mediaforge.dev
- **Simplified Pricing** (YC-style - "so simple a drunk person could understand it"):
  - Free Forever: 10 credits/month (no rollover, no purchases, preset styles, 1024px only)
  - Business: $29/mo, 200 credits/month (use it or lose it) + 1 brand + 1 refresh/month + Teams
  - Resolution pricing: 1024/1536 = 1 credit, 2048 = 2 credits
  - NO rollover (creates urgency)
  - NO credit purchases (prevents gaming)
  - NO add-ons (need multiple brands? retrain or get 2nd account)
- **Generation**: Imagen 3 live at $0.03/image (Phase 3 complete)
- **Brand Training**: Mock training deployed for user testing (Phase 4 MVP complete)
  - Live: [/settings](https://mediaforge-957e4.web.app/settings) page with brand management
  - Mock service: 30-second simulation
  - Production LoRA: Ready to deploy when 5-10 Business users
- **Teams**: Full teams feature deployed (Phase 5A complete)
  - Live: [/team](https://mediaforge-957e4.web.app/team) page with invite system
  - Unlimited members, shared credits (200/month)
  - Daily rate limits (500/day)
  - Team library with creator attribution
- **Waitlist**: Live at [mediaforge.dev](https://mediaforge.dev)
  - Modal collects email + use case + team size
  - Stores in Firestore `waitlist` collection
  - Manual approval for 5-10 beta users
  - Target: 50-100 signups in Week 1-2
- **Next Steps**:
  1. Promote waitlist (Week 1-2)
  2. Select & onboard 5-10 beta users (Week 3-4)
  3. Active UAT with feedback collection (Week 4-10)
  4. Launch Stripe payments with Founder's pricing for beta users (Week 8-10)

## Notes
- Google native application leveraging Google AI tools
- Uses Turbopack for both dev and build commands
- Firebase debug logs present (firebase-debug.log)
- Visual identity as per @Visual_identity.md
- Tasks tracked in docs/Tasks.md
 - i like the Y Combinator approach. as we launch and grow, consider how YC would advise approaching any particular issue.
  -   the production url is mediaforge.dev

  