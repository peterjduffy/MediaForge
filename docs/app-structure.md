# MediaForge App Structure

## Overview

The MediaForge app interface (`/app`) is designed as a consolidated workspace where authenticated users can generate illustrations, browse styles, and manage their gallery. This single-page approach maximizes productivity by minimizing context switching while providing easy access to all core features.

## App Layout Structure

### Navigation
**File**: `/app/layout.tsx`
**Purpose**: Minimal navigation optimized for focused work

```tsx
AppLayout
├── AppNav                        → components/navigation/AppNav.tsx
│   ├── MediaForge logo          → Links back to /app (home)
│   ├── Credits display          → "25 credits" (prominent)
│   └── UserMenu                 → Profile, settings, billing, sign out
└── {children}                   → App content area
```

### Main App Interface
**File**: `/app/page.tsx`
**Purpose**: Tabbed/sectioned interface for all app functionality

```tsx
AppPage
├── Section Navigation           → Tabs or sidebar
│   ├── Generate (default)       → Active tab indicator
│   ├── Styles                  → Browse available styles
│   └── Gallery                 → User's generation history
└── Content Area
    ├── Generate Section         → Generation interface when active
    ├── Styles Section          → Style browser when active
    └── Gallery Section         → History view when active
```

## Section Breakdown

### Generate Section (Default)
**State**: Active by default, accessed via `/app`
**Purpose**: Primary illustration generation interface

**Components**:
- Prompt input field (large textarea)
- Style selector dropdown
- Generation settings (aspect ratio, etc.)
- Generate button (shows credit cost)
- Generation status/progress
- Result display area
- Export options (PNG, SVG, EPS, PDF)

**User Flow**:
1. User lands on `/app` → Generate section active
2. Enter prompt text
3. Select style from dropdown
4. Click "Generate" (deducts credits)
5. View result and export options
6. Download in preferred format

### Styles Section
**State**: Activated via tab/section navigation
**Purpose**: Browse and preview available illustration styles

**Components**:
- Style grid with preview images
- Style categories/filters
- Style details modal/panel
- Example generations for each style
- "Use this style" button → switches to Generate with style selected

**Features**:
- Google, Notion, Flat 2D presets
- Custom uploaded styles (future)
- Preview examples for each style
- Credit cost per style visible

### Gallery Section
**State**: Activated via tab/section navigation
**Purpose**: User's generation history and download management

**Components**:
- Grid of user's generated illustrations
- Filter/sort options (date, style, prompt)
- Search functionality
- Bulk selection and export
- Delete/archive options
- Generation metadata (prompt, style, date)

**Features**:
- Infinite scroll or pagination
- Quick re-download in different formats
- Regenerate with same prompt button
- Share/copy functionality

## Component Architecture

### Shared Components
```
components/
├── generation/
│   ├── PromptInput.tsx          → Textarea with character count
│   ├── StyleSelector.tsx        → Dropdown with preview
│   ├── GenerationSettings.tsx   → Aspect ratio, quality options
│   ├── GenerateButton.tsx       → Shows credit cost, loading states
│   ├── ResultDisplay.tsx        → Generated image with export options
│   └── ExportOptions.tsx        → Format selection and download
├── styles/
│   ├── StyleGrid.tsx            → Grid layout for style browsing
│   ├── StyleCard.tsx            → Individual style preview
│   ├── StyleModal.tsx           → Detailed style information
│   └── StyleFilter.tsx          → Category and search filters
└── gallery/
    ├── GalleryGrid.tsx          → User's generations grid
    ├── GalleryItem.tsx          → Individual generation card
    ├── GalleryFilters.tsx       → Sort and filter options
    └── GalleryActions.tsx       → Bulk actions toolbar
```

### State Management

**App-Level State**:
- Current active section (generate/styles/gallery)
- User credits (updated in real-time)
- Current generation status
- Selected style for generation

**Section-Specific State**:
- Generate: Form data, generation progress, results
- Styles: Selected filters, modal state
- Gallery: Filter settings, selection state

## Navigation Patterns

### Section Switching
**Implementation**: Client-side tab switching (no full page load)
**State**: Preserved between sections
**URL**: Remains `/app` with query params or hash for bookmarking

**Example**:
- `/app` → Generate section (default)
- `/app?section=styles` → Styles section
- `/app?section=gallery` → Gallery section

### Mobile Considerations
- Fixed bottom tab bar for section navigation
- Swipeable sections for touch interfaces
- Collapsible generation settings on mobile
- Responsive grid layouts for styles/gallery

## User Experience Principles

### Productivity Focus
- Single-page app eliminates loading between features
- Minimal navigation chrome maximizes workspace
- Quick access to all tools without context loss

### Credit Awareness
- Credit count always visible in top nav
- Generation costs shown before creation
- Low credit warnings and upgrade prompts

### Generation Workflow
- Default to last used style
- Auto-save prompt drafts
- Quick regeneration with variations
- Seamless export flow

## Technical Implementation

### State Architecture
```tsx
// App-level context
const AppContext = {
  user: User,
  credits: number,
  activeSection: 'generate' | 'styles' | 'gallery',
  currentGeneration: Generation | null
}

// Section-specific contexts
const GenerateContext = { /* generation state */ }
const StylesContext = { /* style browsing state */ }
const GalleryContext = { /* gallery state */ }
```

### Performance Considerations
- Lazy load sections not currently active
- Virtual scrolling for large galleries
- Image optimization and progressive loading
- Efficient Firestore queries with pagination

### Accessibility
- Keyboard navigation between sections
- Screen reader support for generation status
- High contrast mode support
- Focus management during async operations

## Future Enhancements

### Phase 2 Additions
- Settings tab within app (account, preferences)
- Billing management tab
- Advanced generation options

### Phase 3 Possibilities
- Team workspaces (workspace switcher in nav)
- Collaboration features (shared galleries)
- Advanced style customization interface
- Batch generation capabilities

---

*App structure documented: 2025-09-24*
*Next review: After initial implementation*