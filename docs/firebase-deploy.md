# Firebase Hosting Deploy Runbook

## Purpose
Keep Firebase Hosting deploys keyless and repeatable from the Cloud Workstation that lives in project `monospace-3` while targeting the production Firebase project `mediaforge-957e4`.

## One-time project setup
1. Create (or reuse) a dedicated deployer service account inside `mediaforge-957e4`:
   ```bash
   gcloud iam service-accounts create firebase-deployer \
     --display-name="Firebase Deployer" \
     --description="Firebase deploys from Cloud Workstation" \
     --project mediaforge-957e4
   ```
2. Grant the service account the minimum roles required for Hosting and rule pushes:
   ```bash
   gcloud projects add-iam-policy-binding mediaforge-957e4 \
     --member=serviceAccount:firebase-deployer@mediaforge-957e4.iam.gserviceaccount.com \
     --role=roles/firebasehosting.admin

   gcloud projects add-iam-policy-binding mediaforge-957e4 \
     --member=serviceAccount:firebase-deployer@mediaforge-957e4.iam.gserviceaccount.com \
     --role=roles/firebase.admin

   gcloud projects add-iam-policy-binding mediaforge-957e4 \
     --member=serviceAccount:firebase-deployer@mediaforge-957e4.iam.gserviceaccount.com \
     --role=roles/storage.admin
   ```
   Add `roles/firebasedatabase.admin` or others here only when you need them.
3. Allow your user identity to impersonate the service account so you can manage it from the workstation:
   ```bash
   gcloud iam service-accounts add-iam-policy-binding \
     firebase-deployer@mediaforge-957e4.iam.gserviceaccount.com \
     --member=user:peter@mediaforge.dev \
     --role=roles/iam.serviceAccountTokenCreator \
     --project mediaforge-957e4
   gcloud projects add-iam-policy-binding mediaforge-957e4 \
     --member=user:peter@mediaforge.dev \
     --role=roles/iam.serviceAccountUser
   ```

## Attach the identity to Cloud Workstation (preferred)
1. In the Google Cloud console open **Cloud Workstations ▸ Configurations** and edit the config that backs this workstation.
2. Set **Service account** to `firebase-deployer@mediaforge-957e4.iam.gserviceaccount.com` (or another deployer account).
3. Restart the workstation so the new identity flows into the metadata server.
4. Confirm the metadata server now exposes the deployer address:
   ```bash
   curl -s -H "Metadata-Flavor: Google" \
     http://metadata.google.internal/computeMetadata/v1/instance/service-accounts/default/email
   # → firebase-deployer@mediaforge-957e4.iam.gserviceaccount.com
   ```

Once the workstation runs under that service account, the Firebase CLI will automatically use Application Default Credentials; no stored user tokens or JSON keys are necessary.

## Deployment workflow (per run)
1. Ensure the repo has the production build ready:
   ```bash
   cd /home/user/mediaforge
   npm run build
   ```
   The static export lands in `out/` via `firebase.json`.
2. Clear any stale Firebase CLI session (harmless if already logged out):
   ```bash
   firebase logout --non-interactive || true
   ```
3. Deploy Hosting (add `firestore,storage` as needed):
   ```bash
   firebase deploy --project mediaforge-957e4 --only hosting --non-interactive
   ```
4. Verify the release URL reported by the CLI, and check the Firebase console if you need to confirm version history.

## Verification and troubleshooting
- Confirm ADC is healthy:
  ```bash
  gcloud auth application-default print-access-token >/dev/null && echo "ADC ready"
  firebase projects:list --project mediaforge-957e4 --non-interactive
  ```
- If the CLI complains about expiring credentials, run `firebase logout --non-interactive` to purge cached user tokens so it falls back to ADC again.
- Role errors usually mean the workstation identity is missing `firebasehosting.admin` or `storage.admin`. Re-run the IAM binding commands above and allow a few minutes for propagation.
- To test impersonation without switching the workstation identity, mint a short-lived token:
  ```bash
  gcloud auth print-access-token \
    --impersonate-service-account=firebase-deployer@mediaforge-957e4.iam.gserviceaccount.com
  ```
  (Requires the `roles/iam.serviceAccountTokenCreator` grant from the setup section.)

## Future automation
When you are ready for unattended releases, reuse the same service account in Cloud Build or GitHub Actions. Mount the identity as ADC (Secret Manager or Workload Identity Federation) and call the identical `firebase deploy` command. No additional Firebase configuration is required.
