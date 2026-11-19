import { initializeApp } from 'firebase/app';
import {
  type AppCheck,
  initializeAppCheck,
  ReCaptchaEnterpriseProvider,
  ReCaptchaV3Provider,
} from 'firebase/app-check';
import { getAI, GoogleAIBackend } from 'firebase/ai';
import { env } from './env';

/** Firebase configuration derived from environment variables. */
const firebaseConfig = {
  apiKey: env.firebaseApiKey,
  authDomain: env.firebaseAuthDomain,
  projectId: env.firebaseProjectId,
  storageBucket: env.firebaseStorageBucket,
  messagingSenderId: env.firebaseMessagingSenderId,
  appId: env.firebaseAppId,
};

/** Firebase application instance initialised with project configuration. */
export const firebaseApp = initializeApp(firebaseConfig);

/** Firebase App Check singleton — protects backend APIs from abuse. */
let appCheckInstance: AppCheck | null = null;

/** Global augmentation for Firebase App Check debug token (dev only). */
declare global {
  // eslint-disable-next-line no-var
  var FIREBASE_APPCHECK_DEBUG_TOKEN: boolean | string | undefined;
}

/**
 * Initialise Firebase App Check with reCAPTCHA provider.
 *
 * In development or localhost environments the debug token is automatically
 * set so that App Check does not block local requests. The provider type
 * (`enterprise` or `v3`) is determined by the `VITE_APP_CHECK_PROVIDER` env
 * variable.
 *
 * @returns The `AppCheck` instance, or `null` if initialisation is skipped
 *   (e.g. server-side rendering or missing reCAPTCHA site key).
 */
export function initAppCheck(): AppCheck | null {
  if (typeof window === 'undefined') return null;
  if (appCheckInstance) return appCheckInstance;
  if (!env.recaptchaSiteKey) return null;

  try {
    if (
      env.appCheckDebugToken ||
      env.isDev ||
      (typeof window !== 'undefined' &&
        (window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1'))
    ) {
      globalThis.FIREBASE_APPCHECK_DEBUG_TOKEN = env.appCheckDebugToken || true;
    }

    const provider =
      env.appCheckProvider === 'v3'
        ? new ReCaptchaV3Provider(env.recaptchaSiteKey)
        : new ReCaptchaEnterpriseProvider(env.recaptchaSiteKey);

    appCheckInstance = initializeAppCheck(firebaseApp, {
      provider,
      isTokenAutoRefreshEnabled: true,
    });

    return appCheckInstance;
  } catch (err) {
    console.warn('[Saans] App Check initialization warning:', err);
    return null;
  }
}

// Auto-initialize App Check immediately in browser environments
if (typeof window !== 'undefined') {
  initAppCheck();
}

/**
 * Retrieve (or lazily initialise) the Firebase App Check instance.
 *
 * @returns The `AppCheck` instance, or `null` if unavailable.
 */
export const getAppCheck = initAppCheck;

/** Firebase AI Logic instance backed by the Gemini Developer API. */
export const ai = getAI(firebaseApp, { backend: new GoogleAIBackend() });
