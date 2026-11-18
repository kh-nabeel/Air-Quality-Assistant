# Security Policy

## Supported Versions

Saans is a single-page application deployed to Firebase Hosting. The main branch is the only supported version.

## Reporting a Vulnerability

If you discover a security vulnerability, please open a GitHub issue marked **[Security]** or email the maintainer directly. Do not publish vulnerability details publicly until a fix is released.

## Security Controls

### Client-Side

| Control | Implementation |
|---|---|
| Content Security Policy | `firebase.json` — strict CSP, no inline scripts |
| No `dangerouslySetInnerHTML` | Enforced by code review and linting |
| Input sanitisation | `src/utils/sanitize.ts` — all user input stripped before use |
| Zod validation | All API responses validated against strict schemas |
| Prompt injection resistance | User input XML-delimited; never obeyed as instructions |
| Input length cap | 500 characters max for Gemini input |
| Output token cap | 1024 tokens max Gemini output |

### Infrastructure

| Control | Implementation |
|---|---|
| Firebase App Check | reCAPTCHA v3 provider; debug token for localhost only |
| No secrets in repo | Only public Firebase web config in env vars |
| `.env.example` committed | No real values ever committed |
| Security headers | HSTS, X-Frame-Options, Referrer-Policy, Permissions-Policy, X-Content-Type-Options |
| Permissions-Policy | Geolocation limited; camera/microphone denied |

### Headers (`firebase.json`)

```
Content-Security-Policy: default-src 'self'; script-src 'self'; style-src 'self' https://fonts.googleapis.com; font-src https://fonts.gstatic.com; connect-src 'self' https://air-quality-api.open-meteo.com https://geocoding-api.open-meteo.com https://firebaseinstallations.googleapis.com https://identitytoolkit.googleapis.com https://generativelanguage.googleapis.com; img-src 'self' data:; frame-ancestors 'none'
Strict-Transport-Security: max-age=31536000; includeSubDomains
X-Frame-Options: DENY
X-Content-Type-Options: nosniff
Referrer-Policy: strict-origin-when-cross-origin
Permissions-Policy: geolocation=(self), camera=(), microphone=()
```

## Privacy

- **Location**: Rounded to 2 decimal places before any use. Never stored server-side.
- **Profile**: Stored only in localStorage on the user's device. Never transmitted to any server except anonymised flags to Gemini.
- **AI prompts**: Free-tier Gemini prompts may be used by Google to improve their products. This is disclosed in-app.
- **No analytics**: No tracking, no cookies beyond localStorage.
