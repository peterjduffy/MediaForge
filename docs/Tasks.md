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
- [ ] Build styles browser page (/styles):
  - [ ] "Preset Styles" section with 5 curated styles
  - [ ] "My Styles" tab (placeholder for Phase 5)
  - [ ] 6 thumbnail examples per style
- [ ] Add user settings page (/settings) accessible via user menu
- [ ] Add billing page (/billing) with plan display and upgrade options

### Phase 2C: Onboarding Flow (60-Second Time to Value) ✅ COMPLETED
- [x] Create welcome modal after email verification
- [x] Pre-fill first generation (Google style + example prompt)
- [x] Add tooltip pointing to Generate button
- [x] Show success modal after first generation
- [x] Track onboarding completion in user profile

### Phase 3: AI Integration (Google-Native Stack with $2000 Credits) ⚙️ IN PROGRESS
- [x] Set up Vertex AI APIs and authentication
- [x] Create AI generation service module with mock generation
- [x] Update frontend to use async generation service
- [x] Implement credit tracking and deduction in Firestore
- [x] Add generation status tracking (processing/completed/failed)
- [ ] Deploy SDXL model on Vertex AI Model Garden
- [ ] Configure 5 pre-trained LoRA styles (Google, Notion, Flat 2D, etc.)
- [ ] Replace mock with real SDXL generation on Cloud Run
- [ ] Add Imagen 3 as premium generation option
- [ ] Implement cost monitoring and alerts ($100/month limit)

### Phase 4: Payment & Credits (Revenue Before Credits Expire)
- [ ] Integrate Stripe subscriptions and one-time purchases
- [ ] Set up webhook handlers (Cloud Functions 2nd gen)
- [ ] Implement credit system with transactional decrements
- [ ] Add usage tracking and per-image cost monitoring
- [ ] Create billing dashboard with self-serve plan changes
- [ ] Set pricing:
  - Free: 5 credits/month
  - Starter: $19/month, 100 credits/month
  - Pro: $49/month, 300 credits/month
  - Business: $99/month, 700 credits/month + Teams

### Phase 4B: Teams Feature (Business Plan)
- [ ] Create teams collection and data model in Firestore
- [ ] Build team management page (/team):
  - [ ] Owner view: member list with usage breakdown, invite form, credit pool display
  - [ ] Member view: team info, personal usage stats, read-only
- [ ] Implement team invite flow:
  - [ ] Email invitation system with token-based links
  - [ ] Accept invite page (/accept-invite)
  - [ ] Auto-join for existing users, signup+join for new users
- [ ] Update generation logic to use team credits when user is on team
- [ ] Update library to show all team illustrations (with creator labels)
- [ ] Add team indicator in header credits display
- [ ] Implement team-scoped brand styles (shared across team)

### Phase 5: Brand Style Creation & LoRA Training
- [ ] Set up Vertex AI Training for custom LoRA fine-tuning
- [ ] Create brand style upload interface (10-30 images, 1024x1024px min)
- [ ] Implement brand color picker (up to 5 colors)
- [ ] Add LoRA training job queue (15-30 min training time)
- [ ] Build training status display with progress tracking
- [ ] Set up style versioning and storage in Cloud Storage
- [ ] Add "My Styles" management interface
- [ ] Feature available on all paid tiers (Starter+), no artificial limits on number of styles

### Phase 6: Vector Conversion Pipeline (Post-Revenue)
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
- **SDXL Generation**: $0.002 per image (~95%+ margin)
- **Imagen Premium**: $0.02 per image (Business tier only)
- **LoRA Training**: $0.10-0.25 per custom style (one-time cost)
- **Break-even**: ~$40-60/month revenue (2-3 Starter users for infrastructure)
- **Sustainable**: $200+/month (10+ paying users)
- **Profitable**: $500+/month (25+ paying users)

## Future Considerations
- [ ] Terraform/IaC for production environments
- [ ] CI/CD with preview channels
- [ ] Advanced observability (beyond basic logging)
- [ ] Multi-model orchestration (DALL-E, Midjourney fallbacks)
- [ ] Multi-region deployment for global scaling

## Important Notes

### Key Architectural Decisions
- **Google-Native Stack**: Vertex AI Model Garden (SDXL) + Imagen 3 for hybrid generation
- **Route Groups**: Use Next.js route groups for clean separation between marketing and app interfaces
- **Navigation Strategy**: Context-aware navigation (full nav for marketing, minimal for app)
- **Cost-Efficient Generation**: SDXL (~$0.002) as default, Imagen 3 (~$0.02) as premium
- **Style Strategy**: LoRA fine-tuning on Vertex AI Training, not prompt engineering
- **Pricing Philosophy**: Generous credits focused on customer value, not artificial style limits
  - Free: 5 credits/month (try before buy)
  - Starter: $19/mo, 100 credits (~$0.19/credit)
  - Pro: $49/mo, 300 credits (~$0.16/credit, better value)
  - Business: $99/mo, 700 credits (~$0.14/credit) + Teams
  - Brand styles available on all paid tiers without limits
- **Credit Runway**: 4-5 months with $2000 Google Cloud credits, prioritize revenue
- **Vector Reality Check**: "AI-optimized vectors" not "professional vectors" - set expectations
- **Revenue First**: Payment integration in Phase 4, before vector conversion
- **Security & Budgets**: App Check, billing alerts, and cost monitoring to prevent overruns

### Development Principles
- **Credit-Conscious**: Every decision optimized for $2000 runway efficiency
- **Revenue Focus**: Prioritize monetization over advanced features
- **Customer Value**: Generous pricing (100 credits for $19) builds trust and retention
- **Google Ecosystem**: Leverage Google Cloud credits and managed services
- **Realistic Expectations**: Be honest about AI limitations, especially vectors
- **Start Simple**: PNG/JPG generation first, add complexity based on user demand
- **Measure Everything**: Track credit burn rate and user engagement closely
- **60-Second Onboarding**: Get users to first successful generation within 60 seconds

---

*Last updated: 2025-10-05 (Updated pricing, added onboarding, expanded Teams and brand styles)*
