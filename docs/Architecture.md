# MediaForge Architecture

## Overview
MediaForge is a Next.js application for AI-powered illustration generation, following a single-app architecture with clear route separation between public marketing content and the protected application.

## Route Architecture

### Public Routes (No Authentication Required)
```
/                    → Landing page with hero, styles showcase, pricing
/pricing             → Detailed pricing comparison
/styles              → Browse all available illustration styles
/examples            → Gallery of featured illustrations
/auth/signin         → Login/signup page
/auth/verify         → Email verification page
```

### Protected Routes (Authentication Required)
```
/app/                → Main application (generation interface)
/app/gallery         → User's generated illustrations history
/app/settings        → Account settings, subscription management
/app/billing         → Billing and payment management
```

### API Routes
```
/api/auth/*          → Authentication endpoints
/api/generate        → AI illustration generation
/api/upload          → File upload handling
/api/webhooks/*      → External service webhooks (Stripe, etc.)
```

## System Architecture

### Frontend
- **Framework**: Next.js 15.5.2 with React 19.1.0
- **Styling**: Tailwind CSS 4
- **Build Tool**: Turbopack for fast development
- **Authentication**: Firebase Auth (email link + Google OAuth)
- **State Management**: React Context for auth, local state for UI

### Backend Services
- **Database**: Firestore for user data, generations, transactions
- **Storage**: Cloud Storage with 7 specialized buckets
- **AI Generation**: Vertex AI Imagen 3/4 with style customization
- **Job Queue**: Cloud Tasks for asynchronous processing
- **Payments**: Stripe for subscriptions and credit purchases

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
generated-images/    → AI-generated raster images
vector-outputs/      → Converted SVG, EPS, PDF files
style-packs/         → Style pack assets and examples
training-data/       → Custom style training images
temp-uploads/        → Temporary files (24h lifecycle)
public-assets/       → Public thumbnails, marketing assets
```

## Component Architecture

### Layout Structure
```
RootLayout (app/layout.tsx)
├── AuthProvider                    → Global auth state
├── Public Pages
│   ├── Landing (/)
│   ├── Pricing (/pricing)
│   └── Styles (/styles)
├── Auth Pages (/auth/*)
└── Protected App (/app/*)
    └── AppLayout                   → App-specific layout with navigation
```

### Key Components
```
components/
├── auth/
│   ├── AuthProvider.tsx           → Auth context and state
│   ├── ProtectedRoute.tsx         → Route protection wrapper
│   ├── SignInForm.tsx             → Email/Google sign-in
│   └── UserMenu.tsx               → User dropdown menu
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
1. **Sign In** → Redirect to `/app`
2. **Generate** → Create new illustrations
3. **Gallery** → View/download previous work

## Security Model

### Authentication
- Firebase Auth with email link (passwordless) and Google OAuth
- JWT tokens for API authentication
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

### Vertex AI Imagen
- **Primary**: Imagen 4 for better typography and quality
- **Fallback**: Imagen 3 for broader availability
- **Customization**: Style and subject customization APIs
- **Processing**: Asynchronous via Cloud Tasks

### Vector Conversion Pipeline
- **VTracer**: Raster to vector conversion (color support)
- **SVGO**: SVG optimization and compression
- **Inkscape**: EPS/PDF export (separate container)
- **Caching**: Results stored in Cloud Storage

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

---

*Architecture documented: 2025-09-22*
*Next review: After Phase 2 completion*