# Claude Configuration - MediaForge

## Project Overview
- **Name**: MediaForge
- **Type**: IllustrationsAI.com clone - Google native Next.js application
- **AI Stack**: SDXL + LoRA (primary), Imagen 3 (fallback), Vertex AI Training for brand styles
- **Main Branch**: main
- **Current Working Directory**: /home/user/mediaforge
- **Reference**: https://illustrationsai.com/
- **Live Site**: https://mediaforge-957e4.web.app
- **Status**: Phase 3 complete - Imagen 3 deployed, Phase 4 next (LoRA training)

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
- PNG/JPG output, AI-optimized vectors later (Phase 6)
- Simple 2-tier pricing: Free (test) and Business (use)
- Business tier includes optional async brand training ($29 value)
  - Upload brand during onboarding or skip and add later
  - Training happens in background (15-30 min) while you generate
  - Automatically switches to trained model when ready
  - No mode selection - seamless "Your Brand" style
- Unlimited team members with shared credits (fair-use)
- Resolution-based pricing (1024/1536 = 1 credit, 2048 = 2 credits)
- 30-day credit rollover
- Pre-trained style packs for instant generation (Google, Notion, Flat 2D, etc.)

## Architecture
Single Next.js application with route group organization:
- **Marketing Routes** (`(marketing)/`): Full nav + footer for public pages
- **App Route** (`/app`): Minimal nav, tabbed interface (Generate, Styles, Gallery)
- **Auth Routes** (`/auth/*`): Minimal layout focused on conversion
- **Navigation Strategy**: Context-aware layouts for different user states
- **Tech Stack**: Next.js 15.5.2, Firebase Auth, Firestore, Cloud Storage
- **AI Pipeline**: SDXL + LoRA on Cloud Run (primary), Imagen 3 (fallback), Vertex AI Training for brands
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
- **Pricing Structure** (Simple 2-Tier):
  - Free: 10 credits on signup, then 10/month (preset styles, 1024px only)
  - Business: $29/month, 200 credits + one-time brand training included + unlimited team members
  - Add-ons: Extra credits $5/100, additional brands $29, brand refresh $5
  - Resolution pricing: 1024/1536 = 1 credit, 2048 = 2 credits
  - 30-day credit rollover
- **Generation**: Imagen 3 live at $0.03/image (Phase 3 complete)
- **Brand Training**: Mock training deployed for user testing (Phase 4 MVP complete)
  - Live: /settings page with brand management
  - Mock service: 30-second simulation
  - Production LoRA: Ready to deploy when 5-10 Business users
- **Teams**: Full teams feature deployed (Phase 5A complete)
  - Live: /team page with invite system
  - Unlimited members, shared credits (200/month)
  - Daily rate limits (500/day)
  - Team library with creator attribution
- **Next Steps**: Phase 5B - Payment integration (Stripe) for revenue generation before credits expire

## Notes
- Google native application leveraging Google AI tools
- Uses Turbopack for both dev and build commands
- Firebase debug logs present (firebase-debug.log)
- Visual identity as per @Visual_identity.md
- Tasks tracked in docs/Tasks.md