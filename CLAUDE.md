# Claude Configuration - MediaForge

## Project Overview
- **Name**: MediaForge
- **Type**: IllustrationsAI.com clone - Google native Next.js application
- **AI Stack**: Vertex AI Imagen 3/4 for generation, LoRA for custom styles
- **Main Branch**: main
- **Current Working Directory**: /home/user/mediaforge
- **Reference**: https://illustrationsai.com/

## Key Commands
```bash
# Development
npm run dev          # Start development server with Turbopack
npm run build        # Build for production with Turbopack
npm run start        # Start production server
npm run lint         # Run ESLint

# Git
git status           # Check working tree status
git diff             # Show unstaged changes
git log --oneline    # Show commit history
```

## Project Structure
```
/home/user/mediaforge/
├── src/             # Source code
├── public/          # Static assets
├── docs/            # Documentation
├── .next/           # Next.js build output
├── node_modules/    # Dependencies
└── package.json     # Project configuration
```

## Key Features
- AI-powered illustration generation in multiple styles
- Vector output (SVG, EPS, PDF) with AI labeling
- Custom brand style training via LoRA/DreamBooth
- Credit-based system with subscriptions
- Style packs and consistency across generations
- Raster to vector conversion pipeline

## Architecture
Single Next.js application with route separation:
- **Public Routes**: Landing, pricing, styles (`/`, `/pricing`, `/styles`)
- **Protected Routes**: Main app interface (`/app/*`)
- **Tech Stack**: Next.js 15.5.2, Firebase Auth, Firestore, Cloud Storage
- **AI Pipeline**: Vertex AI Imagen 3/4, VTracer vectorization, Cloud Tasks queue
- **Detailed docs**: See `docs/Architecture.md` for complete system design

## Dependencies
- **Framework**: Next.js 15.5.2 with React 19.1.0
- **Backend**: Firebase 12.3.0
- **AI**: Vertex AI (Imagen), Custom models via LoRA
- **Additional**: OpenAI 5.22.0 (secondary)
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

## Notes
- Google native application leveraging Google AI tools
- Uses Turbopack for both dev and build commands
- Firebase debug logs present (firebase-debug.log)
- Recent initialization with Firebase Studio
- Visual identity is as per @Visual_identity.md
- tasks are stored in tasks.md