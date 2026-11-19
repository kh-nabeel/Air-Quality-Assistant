/**
 * Typed, centralised access to Vite environment variables.
 *
 * All Firebase and App Check configuration is surfaced here so that the rest
 * of the application never reads `import.meta.env` directly.
 */
export const env = {
  /** Firebase Web API key. */
  firebaseApiKey: import.meta.env.VITE_FIREBASE_API_KEY as string,
  /** Firebase Auth domain (e.g. `project-id.firebaseapp.com`). */
  firebaseAuthDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN as string,
  /** Firebase project identifier. */
  firebaseProjectId: import.meta.env.VITE_FIREBASE_PROJECT_ID as string,
  /** Firebase Cloud Storage bucket URL. */
  firebaseStorageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET as string,
  /** Firebase Cloud Messaging sender ID. */
  firebaseMessagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID as string,
  /** Firebase application ID. */
  firebaseAppId: import.meta.env.VITE_FIREBASE_APP_ID as string,
  /** reCAPTCHA site key used by App Check. */
  recaptchaSiteKey: import.meta.env.VITE_RECAPTCHA_SITE_KEY as string,
  /** App Check provider: `'enterprise'` (default, Google Cloud Fraud Defense) or `'v3'`. */
  appCheckProvider: (import.meta.env.VITE_APP_CHECK_PROVIDER as string) || 'enterprise',
  /** App Check debug token for local development (optional). */
  appCheckDebugToken: import.meta.env.VITE_APP_CHECK_DEBUG_TOKEN as string | undefined,
  /** Whether the app is running in Vite development mode. */
  isDev: import.meta.env.DEV,
} as const;
