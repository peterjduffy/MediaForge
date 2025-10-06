# MediaForge Task List

## Current Tasks



- [ ] A/B test waitlist conversion

### Phase 2B: App Interface - Generation & Library ✅ COMPLETED
- [x] Create /app/ route with minimal layout
- [x] Build AppNav component (logo, credits display with tooltip, user menu)
- [x] Build generation interface with left/right panel layout:
  - [x] Left panel: Style picker (grid of thumbnails), prompt textarea, size selector
  - [x] Right panel: Preview area, recent generations (3 thumbnails)
  - [x] Style picker with preset styles (Google, Notion, SaaSthetic, Clayframe, Flat 2D)
  - [x] Example prompts shown inline when style selected
  - [x] Generate button with loading state (15-20 sec)
  - [x] Download PNG, Copy, Regenerate actions
- [x] Build library/gallery page (/library):
  - [x] Grid layout (4 columns, responsive)
  - [x] Search by prompt text
  - [x] Filter by style dropdown
  - [x] Sort by newest/oldest
  - [x] Image detail modal with download/copy/delete
  - [x] Pagination or infinite scroll

### Phase 2C: Onboarding Flow (60-Second Time to Value) ✅ COMPLETED
- [x] Create welcome modal after email verification
- [x] Pre-fill first generation (Google style + example prompt)
- [x] Add tooltip pointing to Generate button
- [x] Show success modal after first generation
- [x] Track onboarding completion in user profile

### Phase 3: AI Integration (Google-Native Stack with $2000 Credits) ✅ COMPLETED
- [x] Set up Vertex AI APIs and authentication
- [x] Create AI generation service module with mock generation
- [x] Update frontend to use async generation service
- [x] Implement credit tracking and deduction in Firestore
- [x] Add generation status tracking (processing/completed/failed)
- [x] Implement Imagen 3 API integration with style-enhanced prompts
- [x] Configure 5 preset styles via prompt modifiers (Google, Notion, SaaSthetic, Clayframe, Flat 2D)
- [x] Deploy Cloud Run service with Imagen 3 generation
- [x] Update frontend to use real Cloud Run service (disable mock mode)
- [x] Deployed to production at https://mediaforge-957e4.web.app

### Phase 4: Brand Style Training with LoRA (Business Tier Only) ✅ MVP COMPLETED
- [x] Set up Cloud Storage buckets for training data and LoRA models
- [x] Create Cloud Tasks queue for async training job orchestration
- [x] Build LoRA training Docker container (SDXL + Diffusers + PyTorch)
- [x] Create async brand training flow for Business tier:
  - [x] Brand upload interface (10-30 images, 1024x1024px min) - BrandTrainingModal component
  - [x] Brand color picker (up to 5 colors) with hex/RGB input
  - [x] Brand name and description
  - [x] "Training in background" notification (user can continue generating)
  - [x] Background training status indicator with real-time polling
  - [x] Toast notification when training completes (configurable delay)
- [x] Build Settings page brand training flow (/settings)
- [x] Add "My Brand Styles" management in Settings with trained models
- [x] Implement brand style selector in generation interface
- [x] Deploy mock training service for MVP user testing (30-second simulation)
- [x] Implement transparent model selection in ai-generation.ts:
  - [x] Free tier: Preset styles with Imagen 3
  - [x] Business tier: Automatically uses best model (Imagen 3 → SDXL + LoRA when ready)
  - [x] User sees "Your Brand" in style picker seamlessly
- [x] Set up LoRA model storage and versioning in Cloud Storage
- [ ] Deploy real LoRA training to Vertex AI (deferred until 5-10 Business users for cost efficiency)
- [ ] Deploy SDXL inference service on Cloud Run with GPU (deferred until revenue validates)
- [ ] Optional onboarding step: "Upload your brand (optional, skip for now)" (Phase 5)
- [ ] Pricing: First brand training included in Business tier ($29 value), additional brands $29 each, brand refresh $5 (Phase 5)

### Phase 5a: Teams Feature (Business Plan - Unlimited Members) ✅ COMPLETED
- [x] Create teams collection and data model in Firestore
- [x] Build team management page (/team):
  - [x] Owner view: member list with usage breakdown, invite form, shared credit pool display
  - [x] Member view: team info, personal usage stats, read-only
- [x] Implement team invite flow:
  - [x] Email invitation system with token-based links
  - [x] Accept invite page (/team/accept)
  - [x] Auto-join for existing users, signup+join for new users
- [x] Update generation logic to use team credits when user is on team (200 credits shared)
- [x] Update library to show all team illustrations (with creator labels)
- [x] Add team indicator in header credits display
- [x] Implement team-scoped brand styles (shared across unlimited team members, fair-use)
- [x] Add light daily rate limits per team to keep infrastructure snappy (500/day)

### Phase 5b: Payment & Credits (After Teams - Revenue Before Credits Expire) - NEXT PRIORITY
- [ ] Integrate Stripe subscriptions and one-time purchases
- [ ] Set up webhook handlers (Cloud Functions 2nd gen)
- [ ] Implement credit system with transactional decrements and 30-day rollover
- [ ] Add usage tracking and per-image cost monitoring
- [ ] Implement resolution-based credit pricing (1024/1536 = 1 credit, 2048 = 2 credits)
- [ ] Build user settings page (/settings):
  - [ ] Plan display and upgrade options
  - [ ] Brand training access (if skipped during onboarding)
  - [ ] Usage stats and credit history
- [ ] Create billing dashboard (/billing) with self-serve plan changes
- [ ] Build credit pack purchase system ($5 per 100 credits)
- [ ] Build styles browser page (/styles):
  - [ ] "Preset Styles" section with 5 curated styles
  - [ ] "My Brand Styles" tab for Business tier
  - [ ] 6 thumbnail examples per style
- [ ] Set pricing:
  - Free: 10 credits on signup, then 10/month
  - Business: $29/month, 200 credits/month + one-time brand training included + Teams

### Phase 7: Vector Conversion Pipeline (Post-Revenue)
- [ ] Create Cloud Run container with VTracer (acceptable quality)
- [ ] Implement SVGO optimization pipeline
- [ ] Add EPS/PDF conversion with Inkscape (separate container)
- [ ] Set up caching in Cloud Storage with signed URLs
- [ ] Add "AI-optimized vectors" messaging (realistic expectations)

## Completed Tasks

*Completed phases are documented in detail in Journal.md*

- **Phase 0 & 1**: Foundation and security essentials (Completed 2025-09-22)
- **Phase 2A**: Marketing validation with functional waitlist (Completed 2025-09-24)
- **Phase 2B**: App Interface with generation and library pages (Completed 2025-10-05)
- **Phase 2C**: Onboarding flow with 60-second time to value (Completed 2025-10-05)
- **Phase 3**: AI Integration - Imagen 3 deployed on Cloud Run (Completed 2025-10-05)
- **Phase 4**: Brand Style Training MVP - Mock training + full UI (Completed 2025-10-06)
- **Phase 5A**: Teams Feature - Unlimited members with shared credits (Completed 2025-10-06)

## Phase 7: Hardening & Growth
- [ ] Set up Firebase App Check for bot protection
- [ ] Configure GCP budgets and billing alerts
- [ ] Implement Secret Manager for production service credentials
- [ ] Add content policy checks for prompts
- [ ] Add Cloud CDN for Cloud Storage assets (via HTTPS Load Balancer)
- [ ] Set up Cloud Armor for advanced security (if needed)
- [ ] Implement Remote Config A/B testing
- [ ] Create admin console for monitoring
- [ ] Add rate limiting and abuse controls
- [ ] Export tooling for user data

## Credit Budget & Runway ($2000 Google Cloud Credits)

### Monthly Budget Allocation
- **Development & Testing** (Months 1-2): $400/month
  - Vertex AI Endpoints: $200
  - Cloud Run/Functions: $50
  - Storage & Firestore: $50
  - Testing generations: $100

- **User Validation** (Months 3-4): $420/month
  - Infrastructure: $400
  - User testing (1000 users × 10 images): $20

- **Revenue Ramp** (Month 5): $500
  - First paying customers
  - Break-even target: 15-20 paying users

### Cost Targets
- **Imagen 3 Generation**: $0.03 per image (Free tier and Business tier before training)
- **SDXL + LoRA Generation**: ~$0.014 per image (Business tier after training, scale-to-zero)
- **LoRA Training**: ~$1 per brand (one-time cost, charged at $29)
- **Business Tier Margins (Realistic)**:
  - First month (with training): $29 revenue - $22 cost (200 credits @ $0.03 + $1 training) = $7 profit (24%)
  - Ongoing (mix of Imagen/SDXL): $29 revenue - $4 cost = $25 profit (86%)
  - After training adoption: Higher margins as SDXL usage increases
- **Infrastructure Costs**:
  - 10 Business users: ~$22/month (scale-to-zero with cold starts)
  - 100 Business users: ~$400/month (warm instances for better UX)
- **Break-even**: ~$200/month revenue (7 Business users)
- **Sustainable**: $500+/month (17+ Business users)
- **Profitable**: $1000+/month (35+ Business users)

## Future Considerations
- [ ] Terraform/IaC for production environments
- [ ] CI/CD with preview channels
- [ ] Advanced observability (beyond basic logging)
- [ ] Multi-model orchestration (DALL-E, Midjourney fallbacks)
- [ ] Multi-region deployment for global scaling

## Important Notes

### Key Architectural Decisions
- **Google-Native Stack**: Hybrid approach with Imagen 3 and SDXL + LoRA
- **Route Groups**: Use Next.js route groups for clean separation between marketing and app interfaces
- **Navigation Strategy**: Context-aware navigation (full nav for marketing, minimal for app)
- **Transparent Generation Strategy**:
  - Free tier: Preset styles with Imagen 3 ($0.03/image)
  - Business tier: Automatically uses best available model for "Your Brand" style
  - Backend intelligently switches: Imagen 3 (before training) → SDXL + LoRA (after training)
  - User never chooses between modes - seamless experience
- **Brand Strategy**: Optional async LoRA training during onboarding or later from Settings (Business tier only)
- **Simple 2-Tier Pricing**: Free (test) and Business (use)
  - Free: 10 credits on signup, then 10/month (preset styles, 1024px only)
  - Business: $29/mo, 200 credits/month + one-time brand training included + unlimited team members
  - Additional brand trainings: $29 each (one-time)
  - Brand refresh: $5 (update existing brand)
  - Credit packs: $5 per 100 credits
  - Resolution pricing: 1024/1536 = 1 credit, 2048 = 2 credits
  - 30-day credit rollover
- **Credit Runway**: 4-5 months with $2000 Google Cloud credits, prioritize revenue
- **Vector Reality Check**: "AI-optimized vectors" not "professional vectors" - set expectations
- **Revenue First**: Payment integration in Phase 4, before vector conversion
- **Security & Budgets**: App Check, billing alerts, and cost monitoring to prevent overruns

### Development Principles
- **Credit-Conscious**: Every decision optimized for $2000 runway efficiency
- **Revenue Focus**: Prioritize monetization over advanced features
- **Customer Value**: Simple, generous pricing (200 credits for $29 + brand training) builds trust and retention
- **Google Ecosystem**: Leverage Google Cloud credits and managed services
- **Realistic Expectations**: Be honest about AI limitations, especially vectors
- **Start Simple**: PNG/JPG generation first, add complexity based on user demand
- **Measure Everything**: Track credit burn rate and user engagement closely
- **Zero Friction UX**: Async training, instant value, transparent intelligence
- **60-Second Onboarding**: Get users to first successful generation within 60 seconds

---

*Last updated: 2025-10-06 (Phase 5A Teams completed - Phase 5B Payments next for revenue generation)*
