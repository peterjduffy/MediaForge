# Repository Guidelines

## Architecture Overview
MediaForge is all-in on Google's managed stack. The Next.js frontend is deployed to Firebase Hosting with Cloud CDN, authenticated via Firebase Auth, and backed by Firestore plus multi-bucket Cloud Storage. Cloud Tasks orchestrates async work that lands in Cloud Run vector services, while Vertex AI Imagen handles illustration generation. Stripe is the lone external system; everything else stays inside the Google Cloud perimeter.

## Project Structure & Module Organization
Runtime code lives in `src`. App Router routes sit in `src/app` (e.g., `app/dashboard`), reusable UI in `src/components`, Firebase/Vertex/Stripe clients in `src/lib`, and callable service wrappers in `src/services`. Shared contracts belong in `src/types`. Product and architecture notes (see `docs/Architecture.md`) stay in `docs/`, while marketing assets live in `public/`. Keep Firebase config files (`firebase.json`, `firestore.rules`, `storage.rules`) mirrored with Studio edits.

## Build, Test, and Development Commands
- `npm run dev` – Turbopack dev server on `http://localhost:3000` with hot reload.
- `npm run build` – production bundle; run before deploying.
- `npm run start` – serve the built output for smoke testing.
- `npm run lint` – ESLint per `eslint.config.mjs`; append `--fix` when safe.
- `firebase emulators:start` – local Firestore/Storage/Auth verification prior to deploy.

## Coding Style & Naming Conventions
Use strict TypeScript with 2-space indentation and ASCII UTF-8. Components export `PascalCase`, hooks follow `useCamelCase`, helpers stay `camelCase`. Always route Firebase access through the factories in `src/lib` instead of instantiating SDK clients inline. Tailwind 4 utilities are preferred over custom CSS; constrain global tweaks to `src/app/globals.css`.

## Firebase Studio & Deployments
Sync Studio rule changes back to source before committing. Validate Firestore and Storage updates with the emulator suite, then deploy with `firebase deploy --only hosting,firestore,storage` once the build succeeds. Keep service account secrets in Firebase config or Next.js runtime env vars; never hardcode keys.

## Testing Guidelines
Automated tests are not yet wired in. When adding them, colocate specs beside modules (e.g., `src/services/__tests__/queue.test.ts`) and prefer Vitest or Jest with Next.js helpers. Until a runner lands, rely on lint, manual flows, and emulator checks; record coverage expectations in docs or future PR templates.

## Commit & Change Tracking
Even solo, keep commits small and imperative (e.g., "Add Cloud Tasks retry policy") for traceability. Reference related docs or TODOs in the body. Log manual test steps and emulator outcomes so Firebase Studio deployments map cleanly to git history, and tag releases before promoting production builds.
