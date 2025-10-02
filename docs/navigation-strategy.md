# MediaForge Navigation Strategy

## Overview

MediaForge implements a context-aware navigation system using Next.js route groups to provide optimal user experiences across different sections of the application. This strategy balances marketing needs, user productivity, and technical maintainability.

## Route Group Architecture

### Marketing Group `(marketing)/`
**Purpose**: Public-facing pages for user acquisition, education, and trust building
**Layout**: Full navigation + comprehensive footer
**Target**: Prospective users, SEO, brand building

```
(marketing)/
├── /                    → Comprehensive landing page with:
│                         - Hero section with clear value prop
│                         - Features (6 core capabilities)
│                         - Popular Styles preview (3 styles)
│                         - Use Cases (4 target scenarios)
│                         - How it Works (4-step process)
│                         - FAQ section (trust-building)
│                         - Waitlist signup CTA
├── /styles              → Full gallery of available styles
├── /pricing             → Pricing plans (when ready)
├── /blog                → Content marketing and thought leadership
├── /privacy             → Privacy policy
├── /terms               → Terms of service
└── /security            → Security and compliance info
```

### App Group `/app`
**Purpose**: Focused workspace for authenticated users
**Layout**: Minimal navigation to maximize workspace
**Target**: Active users creating illustrations

```
/app/                    → Single-page application with sections:
├── Generate (default)   → Main creation interface
├── Styles              → Browse available styles
├── Gallery             → User's generation history
└── (Future sections)    → Settings, billing via tabs or modal
```

### Auth Group `/auth`
**Purpose**: Authentication flow with minimal distractions
**Layout**: Logo only, focused on conversion
**Target**: Users in signup/login process

```
/auth/
├── /signin              → Email link + Google OAuth
└── /verify              → Email verification flow
```

## Navigation Components

### Marketing Navigation
**File**: `components/navigation/MarketingNav.tsx`
**Features**:
- MediaForge logo (links to `/`)
- Primary nav: Styles, Pricing, Blog (simplified for MVP)
- Secondary nav: Privacy, Terms, Security (in footer)
- CTA button: "Join the waitlist" → `/auth/signin`

### App Navigation
**File**: `components/navigation/AppNav.tsx`
**Features**:
- MediaForge logo (links to `/app`)
- Credits display: "25 credits" (prominent)
- User menu dropdown:
  - Generate (current page indicator)
  - Settings → `/app` with settings tab active
  - Billing → `/app` with billing tab active
  - Sign out

### Footer
**File**: `components/navigation/Footer.tsx`
**Used by**: Marketing pages only
**Content**:
- Company info and copyright
- Legal links: Privacy, Terms, Security
- Product links: Styles, Pricing, Blog
- Note: Keeps footer simple for MVP launch

## User Journey Flows

### New User Acquisition (Pre-Launch)
```
/ (comprehensive landing) → /styles (explore) → /pricing (evaluate) → /auth/signin → /app (create)
```

### Content-Driven Discovery
```
Google Search → /blog/post → / (landing with full info) → /auth/signin
```

### Direct Landing
```
/ (landing) → scroll through sections (features, use cases, FAQ) → /auth/signin
```

Note: The comprehensive homepage serves as the primary conversion tool for a new product without established social proof.

## Navigation Behavior

### Route Transitions
- **Marketing to Marketing**: Client-side navigation (fast)
- **Marketing to App**: Full page load (context switch)
- **App to Marketing**: Full page load (back to marketing mindset)
- **Within App**: Tab switching (instant, preserves state)

### State Management
- **Marketing**: Stateless, SSR-optimized for SEO
- **App**: Stateful, client-side rendering for interactivity
- **Auth**: Minimal state, focused on conversion

## Mobile Considerations

### Marketing Navigation (Mobile)
- Hamburger menu for secondary navigation
- Prominent CTA button always visible
- Footer remains comprehensive

### App Navigation (Mobile)
- Fixed bottom tab bar for app sections
- Credits in top bar
- User menu accessible via profile icon

## SEO Strategy (MVP Focus)

### Marketing Pages
- Homepage optimized for primary keywords ("AI illustration generation", "brand illustrations")
- Styles page targets style-specific searches ("Google style illustrations", "Notion graphics")
- Blog for content marketing and thought leadership
- Legal pages for compliance and trust

### App Pages
- Protected behind auth, not indexed
- Focus on user experience over SEO
- Fast client-side transitions

### Trust-Building for New Products
- Technology credibility ("Powered by Google AI", "Vertex AI")
- Security commitments ("Your data stays private")
- Early access incentives ("First 100 users get lifetime benefits")
- Founder story and mission (when appropriate)

## Implementation Notes

### Layout Hierarchy
```
app/layout.tsx                    → Root (AuthProvider only)
├── (marketing)/layout.tsx        → MarketingNav + Footer
├── app/layout.tsx               → AppNav (minimal)
└── auth/layout.tsx              → Logo only
```

### Shared Components
- `UserMenu.tsx` used in both app and marketing (when logged in)
- `Button.tsx`, form components shared across layouts
- Auth logic abstracted in `AuthProvider.tsx`

### Future Enhancements (Post-Launch)
- Additional marketing pages (About, Contact, Examples) as social proof builds
- Team workspaces → Add team switcher to app nav
- Admin panel → New route group `(admin)/`
- Developer documentation → Add to marketing group (future)
- Status page → Separate subdomain or marketing group

### MVP Launch Strategy
For the initial launch, the simplified page structure focuses on:
1. **Homepage** as primary conversion tool with comprehensive content
2. **Styles page** to showcase capabilities
3. **Essential legal pages** for compliance
4. **Blog** for early thought leadership

Additional pages can be added as the product gains traction and user feedback.

---

*Navigation strategy documented: 2025-09-24*
*Updated for MVP launch strategy: 2025-09-24*
*Next review: After Phase 2 UI implementation*
