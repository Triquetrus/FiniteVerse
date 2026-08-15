# FiniteVerse

FiniteVerse is a Vite/React single-page application that uses Firebase Authentication (Google sign-in) and Firestore.

## Firebase deployment

This repository is configured for Firebase project `valiant-oasis-zn50x`. Before building, create a local `.env.production` from `.env.example` and set the `VITE_FIREBASE_*` values from `firebase-applet-config.json` (including its named Firestore database ID). These values are embedded in the browser build; do not use server secrets in `VITE_*` variables.

Then authenticate and publish:

```bash
npm install
firebase login --reauth
npm run lint
npm run build
firebase deploy --only hosting,firestore
```

`firebase.json` serves `dist` and rewrites every route to `index.html`, which is required for this SPA. The deploy command also publishes the user-scoped Firestore rules to database `ai-studio-finiteverse-382fd63f-185f-436b-853e-be9abe18583d`.

## Connect a custom domain

1. In Firebase Console, open **Hosting** for `valiant-oasis-zn50x` and choose **Add custom domain**.
2. Enter the exact hostname to serve, such as `app.example.com` or `example.com`, and add the DNS verification record Firebase gives you at your DNS provider.
3. Add Firebase's final DNS records, wait for SSL provisioning, and set the desired redirect between `www` and the apex domain.
4. In Firebase Console, open **Authentication → Settings → Authorized domains** and add every production hostname (for example, `example.com` and `www.example.com`). Google sign-in will otherwise fail with `auth/unauthorized-domain`.
5. Test Google sign-in and a Firestore-backed login on the final HTTPS URL.

The Firebase `authDomain` should remain the project’s `firebaseapp.com` domain unless a separate Firebase Authentication custom-domain setup is intentionally configured.
