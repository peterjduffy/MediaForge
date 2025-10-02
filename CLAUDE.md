# Claude Configuration - MediaForge

## Project Overview
- **Name**: MediaForge
- **Type**: IllustrationsAI.com clone - Google native Next.js application
- **AI Stack**: Vertex AI Model Garden (SDXL) + Imagen 3 hybrid, LoRA for custom styles
- **Main Branch**: main
- **Current Working Directory**: /home/user/mediaforge
- **Reference**: https://illustrationsai.com/

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
│   │   │   ├── layout.tsx      # App layout (minimal nav)
│   │   │   └── page.tsx        # Main app with tabbed sections
│   │   ├── auth/
│   │   │   ├── layout.tsx      # Auth layout (logo only)
│   │   │   ├── signin/         # (/auth/signin)
│   │   │   └── verify/         # (/auth/verify)
│   │   └── layout.tsx          # Root layout (AuthProvider)
│   ├── components/
│   │   ├── auth/               # Auth components
│   │   ├── navigation/         # Nav components
│   │   ├── generation/         # Generation interface
│   │   └── gallery/            # Gallery components
│   └── lib/                    # Utilities and Firebase config
├── public/                     # Static assets
├── docs/                       # Documentation
└── [config files]
```

## Key Features
- AI-powered illustration generation with SDXL and Imagen 3
- PNG/JPG output (Phase 1), AI-optimized vectors later (Phase 6)
- Custom brand style training via LoRA fine-tuning
- Credit-based system optimized for $2000 runway
- Pre-trained style packs (Google, Notion, Flat 2D, etc.)
- Cost-efficient hybrid generation approach

## Architecture
Single Next.js application with route group organization:
- **Marketing Routes** (`(marketing)/`): Full nav + footer for public pages
- **App Route** (`/app`): Minimal nav, tabbed interface (Generate, Styles, Gallery)
- **Auth Routes** (`/auth/*`): Minimal layout focused on conversion
- **Navigation Strategy**: Context-aware layouts for different user states
- **Tech Stack**: Next.js 15.5.2, Firebase Auth, Firestore, Cloud Storage
- **AI Pipeline**: SDXL on Vertex AI (primary), Imagen 3 (premium), LoRA training, Cloud Tasks queue
- **Detailed docs**: See `docs/Architecture.md`, `docs/navigation-strategy.md`, and `docs/app-structure.md`

## Dependencies
- **Framework**: Next.js 15.5.2 with React 19.1.0
- **Backend**: Firebase 12.3.0
- **AI**: Vertex AI Model Garden (SDXL), Imagen 3, LoRA fine-tuning
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

## Notes
- Google native application leveraging Google AI tools
- Uses Turbopack for both dev and build commands
- Firebase debug logs present (firebase-debug.log)
- Recent initialization with Firebase Studio
- Visual identity is as per @Visual_identity.md
- tasks are stored in tasks.md