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
/app/                → Main application with tabbed interface:
                     - Generate section (default)
                     - Styles browser
                     - Gallery/history view
                     - Settings (future: separate /app/settings)
                     - Billing (future: separate /app/billing)
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
- **AI Generation**: Vertex AI Model Garden (SDXL) + Imagen 3 hybrid approach
- **Style Training**: Vertex AI Training for LoRA fine-tuning
- **Job Queue**: Cloud Tasks for asynchronous processing
- **Payments**: Stripe for subscriptions and credit purchases
- **Budget**: $2000 Google Cloud credits (4-5 month runway)

### Infrastructure
- **Hosting**: Firebase Hosting with Cloud CDN
- **Vector Processing**: Cloud Run containers with VTracer + Inkscape
- **Security**: Firebase Auth tokens, storage rules, Firestore security rules

## Data Architecture

### Firestore Collections
```
users/               → User profiles, credits, subscription status
generations/         → Generated illustrations with metadata
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
│   ├── AppNav.tsx                 → Minimal nav for app interface
│   └── Footer.tsx                 → Marketing footer component
├── ui/                            → Reusable UI components
├── generation/                    → Generation interface components
└── gallery/                       → Gallery and history components
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

### AI Generation Pipeline (Hybrid Approach)
- **Primary**: Vertex AI Model Garden (SDXL) - $0.002/image, 2-5s generation
- **Premium**: Imagen 3 - $0.02/image, better quality for final exports
- **Style Training**: Vertex AI Training for LoRA fine-tuning ($10-20/style)
- **Processing**: Asynchronous via Cloud Tasks with cost-aware routing
- **Storage**: LoRA weights and generated images in Cloud Storage

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
*Next review: After AI integration Phase 3*
