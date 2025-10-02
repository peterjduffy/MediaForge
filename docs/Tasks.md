# MediaForge Task List

## Current Tasks

### Phase 2A: Marketing Validation (COMPLETED - Ready for User Testing)
- [x] Create landing page with hero and styles showcase (/)
- [x] Implement (marketing)/ route group structure
- [x] Extract and build MarketingNav component from homepage
- [x] Extract and build Footer component from homepage
- [x] Create legal pages: /privacy, /terms, /security (basic versions)
- [x] Implement functional waitlist with Firestore backend
- [x] Deploy to Firebase Hosting with proper hero image
- [ ] Add "Powered by Google AI" credibility elements
- [ ] Mobile optimization testing
- [ ] A/B test waitlist conversion

### Phase 2B: App Interface (After Marketing Validation)
- [ ] Create /app/ route with minimal layout
- [ ] Build AppNav component (logo, credits, user menu)
- [ ] Build main generation interface (/app with Generate section)
- [ ] Implement styles browser section within /app
- [ ] Implement gallery/history section within /app
- [ ] Add tabbed navigation between app sections
- [ ] Create user settings and billing access via user menu
- [ ] Add download options UI (PNG first, then SVG, EPS, PDF)

### Phase 3: AI Integration (Google-Native Stack with $2000 Credits)
- [ ] Set up Vertex AI Model Garden with SDXL deployment
- [ ] Configure 5 pre-trained LoRA styles (Google, Notion, Flat 2D, etc.)
- [ ] Implement SDXL generation service on Cloud Run with Cloud Tasks queue
- [ ] Add Imagen 3 as premium generation option
- [ ] Set up Cloud Storage for generated images and LoRA weights
- [ ] Add generation status tracking in Firestore
- [ ] Implement cost-efficient routing (SDXL default, Imagen premium)
- [ ] Add usage tracking for credit burn rate monitoring

### Phase 4: Payment & Credits (Revenue Before Credits Expire)
- [ ] Integrate Stripe subscriptions and one-time purchases
- [ ] Set up webhook handlers (Cloud Functions 2nd gen)
- [ ] Implement credit system with transactional decrements
- [ ] Add usage tracking and per-image cost monitoring
- [ ] Create billing dashboard with self-serve plan changes
- [ ] Set pricing: Free tier (10 images), Pro ($19/month), Premium ($49/month)

### Phase 5: Style Customization & LoRA Training
- [ ] Set up Vertex AI Training for custom LoRA fine-tuning
- [ ] Create style upload interface for reference images (20+ images required)
- [ ] Implement LoRA training job queue (15-30 min training time)
- [ ] Set up style versioning and governance in Cloud Storage
- [ ] Add custom style marketplace for enterprise users
- [ ] Price custom style training at $20-50 per style

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
- **SDXL Generation**: $0.002 per image
- **Imagen Premium**: $0.02 per image
- **LoRA Training**: $10-20 per custom style
- **Break-even**: $200/month revenue (10 Pro users)
- **Profitable**: $500+/month (25+ Pro users)

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
- **Single App Page**: Consolidate app functionality in /app with tabbed sections vs separate routes
- **Cost-Efficient Generation**: SDXL (~$0.002) as default, Imagen 3 (~$0.02) as premium
- **Style Strategy**: LoRA fine-tuning on Vertex AI Training, not prompt engineering
- **Credit Runway**: 4-5 months with $2000 Google Cloud credits, prioritize revenue
- **Vector Reality Check**: "AI-optimized vectors" not "professional vectors" - set expectations
- **Revenue First**: Payment integration in Phase 4, before vector conversion
- **Security & Budgets**: App Check, billing alerts, and cost monitoring to prevent overruns

### Development Principles
- **Credit-Conscious**: Every decision optimized for $2000 runway efficiency
- **Revenue Focus**: Prioritize monetization over advanced features
- **Google Ecosystem**: Leverage Google Cloud credits and managed services
- **Realistic Expectations**: Be honest about AI limitations, especially vectors
- **Start Simple**: PNG/JPG generation first, add complexity based on user demand
- **Measure Everything**: Track credit burn rate and user engagement closely

---

*Last updated: 2025-09-24 (Updated for Google-native stack and credit runway planning)*
