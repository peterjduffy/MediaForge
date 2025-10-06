# MediaForge Architecture

## Overview
MediaForge is a Next.js application for AI-powered illustration generation, following a single-app architecture with clear route separation between public marketing content and the protected application.

## Route Architecture

MediaForge uses Next.js route groups to organize routes by purpose while maintaining clean URL structure. Route groups (in parentheses) don't affect URLs but enable different layouts for different site sections.

### Public Routes (Marketing Layout)
```
(marketing)/         → Route group with full navigation + footer
├── /                → Comprehensive landing page with:
│                     - Hero section
│                     - Features (6 core capabilities)
│                     - Popular Styles preview (3 styles)
│                     - Use Cases (4 target scenarios)
│                     - How it Works (4-step process)
│                     - FAQ section (addresses concerns)
│                     - Waitlist signup CTA
├── /styles          → Full gallery of available illustration styles
├── /pricing         → Detailed pricing plans (when ready)
├── /blog            → Content marketing and thought leadership
├── /privacy         → Privacy policy
├── /terms           → Terms of service
└── /security        → Security and compliance information

Note: As a new product without social proof, the homepage retains
comprehensive content to build trust and understanding before
visitors commit to signing up.
```

### Protected Routes (App Layout)
```
/app/                → Main generation interface with:
                     - Left panel: Style picker, prompt, settings
                     - Right panel: Preview, recent generations
/library             → Gallery of all generated illustrations
                     - Grid view with search/filter/sort
                     - Detail modal with download/copy/delete
                     - Team context: Shows all team illustrations
/team                → Team management (Business tier only)
                     - Owner: Member list, invite form, usage breakdown
                     - Member: Team info, personal stats
/team/accept         → Team invite acceptance page
/settings            → User settings & brand management (live)
/billing             → Billing and plan management (planned)
```

### Auth Routes (Minimal Layout)
```
/auth/signin         → Login/signup page
/auth/verify         → Email verification page
```

### Backend Endpoints (Future)
Currently, the site is a static export on Firebase Hosting with no Next.js API runtime. As backend needs arise, endpoints will be implemented on Cloud Functions or Cloud Run and accessed from the client.
```
Auth callbacks / webhooks     → Cloud Functions/Run (when implemented)
Generation orchestration      → Cloud Run + Cloud Tasks (when implemented)
Uploads and processing        → Signed URLs + Cloud Run (when implemented)
```

## System Architecture

### Frontend
- **Framework**: Next.js 15.5.2 with React 19.1.0
- **Styling**: Tailwind CSS 4
- **Build Tool**: Turbopack for fast development
- **Authentication**: Firebase Auth (email link + Google OAuth)
- **State Management**: React Context for auth, local state for UI

### Backend Services (Google-Native Stack)
- **Database**: Firestore for user data, generations, transactions
- **Storage**: Cloud Storage with 7 specialized buckets
- **AI Generation**: Hybrid approach
  - Imagen 3 on Cloud Run: Free tier and Business Quick Mode ($0.03/image)
  - SDXL + LoRA on Cloud Run with GPU: Business Brand Mode ($0.01-0.02/image)
- **Style Training**: Vertex AI Training for LoRA fine-tuning (~$1/brand, charged $29)
- **Job Queue**: Cloud Tasks for asynchronous processing
- **Payments**: Stripe for subscriptions ($29/mo Business) and one-time purchases (brand training $29, credit packs $5/100)
- **Budget**: $2000 Google Cloud credits (4-5 month runway)

### Infrastructure
- **Hosting**: Firebase Hosting with Cloud CDN
- **Vector Processing**: Cloud Run containers with VTracer + Inkscape
- **Security**: Firebase Auth tokens, storage rules, Firestore security rules

## Data Architecture

### Firestore Collections
```
users/               → User profiles, credits, subscription status, teamId
  ├── brands/        → User's trained brand styles (subcollection)
generations/         → Generated illustrations with metadata, teamId
teams/               → Team documents (Business tier)
  ├── members[]      → Team members with usage tracking
  ├── credits        → Shared credit pool (200/month)
  ├── dailyLimitReset → Fair-use daily limit tracking
teamInvites/         → Team invitation tokens (7-day expiry)
stylePacks/          → Available illustration styles
transactions/        → Credit purchases, usage tracking
jobQueue/            → Background processing jobs
```

### Storage Buckets
```
user-uploads/        → Profile images, style references
generated-images/    → AI-generated raster images (PNG/JPG)
lora-weights/        → LoRA adapter weights for custom styles
vector-outputs/      → Converted SVG, EPS, PDF files (Phase 6+)
style-packs/         → Pre-trained style assets and examples
training-data/       → Custom style training datasets (20+ images)
temp-uploads/        → Temporary files (24h lifecycle)
public-assets/       → Public thumbnails, marketing assets
```

## Component Architecture

### Layout Structure
```
RootLayout (app/layout.tsx)           → Minimal root with AuthProvider
├── AuthProvider                     → Global auth state
├── (marketing)/layout.tsx           → Full nav + footer for public pages
│   ├── Landing (/) - comprehensive homepage
│   ├── Styles (/styles) - full gallery
│   ├── Pricing (/pricing) - when ready
│   ├── Blog (/blog) - content marketing
│   └── Legal pages (/privacy, /terms, /security)
├── /app/layout.tsx                  → Minimal nav (logo, credits, user)
│   └── /app/page.tsx               → Tabbed interface with sections
└── /auth/layout.tsx                 → Minimal layout (logo only)
    ├── signin/
    └── verify/
```

### Navigation Strategy

MediaForge implements distinct navigation experiences for different user contexts:

**Marketing Navigation** (Public pages):
- Simplified top navigation with core links (Styles, Pricing, Blog)
- Footer with legal links, blog, and company info
- Call-to-action buttons leading to waitlist signup
- SEO-optimized pages for organic discovery
- Trust-building elements for new product launch

**App Navigation** (Protected interface):
- Minimal top bar with MediaForge logo
- Credits display prominently
- User menu dropdown
- No footer (maximizes workspace)
- Internal navigation via tabs/sections within /app

**Auth Navigation** (Login/signup):
- Logo only
- Focused on authentication flow
- Minimal distractions

### Key Components
```
components/
├── auth/
│   ├── AuthProvider.tsx           → Auth context and state
│   ├── ProtectedRoute.tsx         → Route protection wrapper
│   ├── SignInForm.tsx             → Email/Google sign-in
│   └── UserMenu.tsx               → User dropdown menu
├── navigation/
│   ├── MarketingNav.tsx           → Full navigation for public pages
│   ├── AppNav.tsx                 → Minimal nav with credits display
│   └── Footer.tsx                 → Marketing footer component
├── onboarding/
│   ├── WelcomeModal.tsx           → First-time user welcome
│   └── SuccessModal.tsx           → First generation celebration
├── ui/                            → Reusable UI components
└── [other components]
```

## User Flow

### New User Journey
1. **Landing Page** (`/`) → Browse styles, see pricing
2. **Sign In** (`/auth/signin`) → Email link or Google OAuth
3. **Verification** (`/auth/verify`) → Email confirmation (if email link)
4. **Generation** (`/app`) → Immediate access to creation interface

### Returning User Journey
1. **Sign In** → Redirect to `/app` (Generate section active)
2. **Generate** → Create new illustrations within app
3. **Switch sections** → Navigate between Generate, Styles, Gallery via tabs
4. **Settings/Billing** → Access via user menu dropdown

## Security Model

### Authentication
- Firebase Auth with email link (passwordless) and Google OAuth
- Firebase Auth tokens for client access; backend calls (when added) will use bearer tokens
- Automatic user record creation with 10 free credits

### Authorization
- Firestore security rules enforce user-specific data access
- Storage rules control file access permissions
- Protected routes require valid auth tokens

### Data Protection
- User data isolated by Firebase Auth UID
- Signed URLs for private file access
- Credit transactions use Firestore transactions for consistency

## Integration Points

### AI Generation Pipeline (Transparent Model Selection)
- **Current State**: Imagen 3 deployed on Cloud Run ($0.03/image) - Phase 3 complete
- **Service Module**: `lib/ai-generation.ts` handles all generation logic
- **Free Tier**: Imagen 3 only (preset styles, 1024px, $0.03/image)
- **Business Tier**: Transparent automatic model selection
  - Before brand training: Imagen 3 with saved brand colors/keywords ($0.03/image)
  - After brand training: SDXL + LoRA ($0.01-0.02/image)
  - User sees "Your Brand" style in picker, backend handles model routing
  - No "Quick Mode" vs "Brand Mode" - seamless UX
- **Brand Training**: Optional async LoRA fine-tuning - **Phase 4 MVP Complete** ✅
  - **Current**: Mock training service (30-second simulation, $0 cost)
  - **Deployed**: BrandTrainingModal, Settings page, brand management UI
  - **Live**: https://mediaforge-957e4.web.app/settings
  - **Production Ready**: LoRA container built, deferred until 5-10 Business users
  - Can upload during onboarding or skip and add later from Settings
  - Training runs in background (15-30 min in production)
  - User can generate with presets while training
  - Real-time status polling (5-second intervals)
  - Toast notification when training completes
  - Data: `users/{userId}/brands/{brandId}` with status tracking
  - Cost: ~$1 actual, charged $29
- **Brand Refresh**: $5 to update existing brand with new images
- **Resolution Pricing**: 1024/1536 = 1 credit, 2048 = 2 credits
- **Processing**: Async with Firestore status tracking
- **Storage**: Cloud Storage for generated images and LoRA model weights (permanent)

### Vector Conversion Pipeline (Phase 6+)
- **Reality Check**: "AI-optimized vectors" not professional-grade vectors
- **VTracer**: Acceptable quality raster-to-vector conversion
- **SVGO**: SVG optimization and compression
- **Inkscape**: EPS/PDF export (separate Cloud Run container)
- **Priority**: Implemented after revenue generation to manage costs

### Payment Processing
- **Stripe**: Subscription management and credit purchases
- **Webhooks**: Cloud Functions for payment event handling
- **Credits**: Firestore transactional decrements

## Deployment Strategy

### Single Application Approach
- **Development**: `npm run dev` with Turbopack
- **Production**: Firebase Hosting with automatic HTTPS
- **Scaling**: Cloud Run for backend processing
- **Monitoring**: Firebase Analytics + Error Reporting

### Future Scaling Options
- Split `/app/*` routes to separate subdomain if needed
- Implement Cloud CDN for high-traffic asset delivery
- Add Cloud Armor for advanced security features
- Migrate to microservices architecture for team scaling

## Development Principles

### MVP Focus
- Core generation functionality first
- Simple user flows over complex features
- Managed services over custom infrastructure
- Direct user value over administrative features

### Quality Standards
- TypeScript for type safety
- ESLint for code quality
- Firebase emulators for local development
- Comprehensive error handling and logging

### Performance Considerations
- Next.js SSR for public pages
- Client-side rendering for authenticated app
- Image optimization and lazy loading
- Efficient Firestore queries with proper indexing

### Cost Management ($2000 Credit Runway)
- **Smart Routing**: SDXL for bulk generation, Imagen for premium
- **Caching Strategy**: Duplicate prompt detection to prevent redundant generation
- **Budget Alerts**: Google Cloud billing alerts at $300, $500, $700 thresholds
- **Usage Monitoring**: Real-time credit burn rate tracking in Firestore
- **Revenue Priority**: Payment integration in Phase 4 (before credits expire)
- **Break-even Target**: 15-20 paying users ($200/month revenue)

---

*Architecture documented: 2025-09-22*
*Updated for Google-native stack: 2025-09-24*
*Updated with app implementation: 2025-10-05*
*Updated with teams feature: 2025-10-06*
*Next review: After payment integration (Phase 5B)*
