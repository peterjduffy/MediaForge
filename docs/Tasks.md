# MediaForge Task List

## Current Tasks

### Phase 2: Core UI Development
- [x] Create landing page with hero and styles showcase (/)
- [ ] Build main generation interface (/app)
- [ ] Implement illustration gallery/history view (/app/gallery)
- [ ] Create user settings and billing pages (/app/settings, /app/billing)
- [ ] Add download options UI (PNG first, then SVG, EPS, PDF)

### Phase 3: AI Integration
- [ ] Set up Vertex AI Imagen 3/4 connection (prioritize Imagen 4)
- [ ] Implement text-to-image generation API with Imagen 4/3 fallback
- [ ] Create job queue with Cloud Tasks
- [ ] Add generation status tracking in Firestore
- [ ] Implement idempotent retry logic for failed generations

### Phase 4: Vector Conversion Pipeline
- [ ] Create Cloud Run container with VTracer (better color support than Potrace)
- [ ] Implement SVGO optimization pipeline
- [ ] Add EPS/PDF conversion with Inkscape (separate container due to size)
- [ ] Set up caching in Cloud Storage with signed URLs
- [ ] Add AI labeling for Illustrator compatibility

### Phase 5: Style Customization
- [ ] Implement Imagen 3 style customization (not LoRA - use Vertex AI's native style/subject customization)
- [ ] Create style upload interface for reference images
- [ ] Set up style versioning and governance
- [ ] Deploy style reference management system
- [ ] Add style mixing capabilities with multiple reference images

### Phase 6: Payment & Credits
- [ ] Integrate Stripe subscriptions
- [ ] Set up webhook handlers (Cloud Functions 2nd gen)
- [ ] Implement credit system with transactional decrements
- [ ] Add usage tracking and per-image cost monitoring
- [ ] Create billing dashboard with self-serve plan changes

## Completed Tasks

*Completed phases are documented in detail in Journal.md*

- **Phase 0 & 1**: Foundation and security essentials (Completed 2025-09-22)

## Phase 7: Hardening & Growth
- [ ] Set up Firebase App Check for bot protection
- [ ] Configure GCP budgets and billing alerts
- [ ] Implement Secret Manager for production API keys
- [ ] Add content policy checks for prompts
- [ ] Add Cloud CDN for Cloud Storage assets (via HTTPS Load Balancer)
- [ ] Set up Cloud Armor for advanced security (if needed)
- [ ] Implement Remote Config A/B testing
- [ ] Create admin console for monitoring
- [ ] Add rate limiting and abuse controls
- [ ] Export tooling for user data

## Future Considerations
- [ ] Terraform/IaC for production environments
- [ ] CI/CD with preview channels
- [ ] Advanced observability (beyond basic logging)
- [ ] Memorystore for high-traffic caching
- [ ] Multi-region deployment

## Important Notes

### Key Architectural Decisions
- **Imagen 4 Priority**: Use Imagen 4 where available (better typography), fallback to Imagen 3
- **VTracer over Potrace**: VTracer handles full-color illustrations better than Potrace (B&W only)
- **CDN Strategy**: Firebase Hosting has built-in CDN; Cloud Storage needs explicit CDN setup if asset egress spikes
- **Security First**: App Check, budgets, and transactional credit operations prevent abuse and cost overruns
- **Style Customization**: Use Vertex AI's native style/subject customization APIs, not LoRA fine-tuning

### Development Principles
- Start with MVP functionality, expand based on usage
- Prioritize security and cost controls early
- Use managed services over custom infrastructure initially
- "Inspired by" existing designs, avoid direct cloning for IP reasons

---

*Last updated: 2025-09-22 (Revised based on ChatGPT feedback)*