# Saans — Demo Script

A 2-minute walkthrough of the key features for evaluators and judges.

---

## Setup (30 seconds)

1. Open the live URL: `https://<your-firebase-project>.web.app`
2. The app loads instantly — onboarding begins immediately with no login required.

---

## 01 · Location & Onboarding (20 seconds)

- Click **"Use my location"** — the browser asks for permission; coordinates are rounded to 2 decimal places before any use.
- Or type a city name (e.g. **Delhi**, **Lahore**, **Beijing**) and select from the geocoded suggestions.
- Quick-pick pills for smog-prone cities appear below the search bar.
- Step 2: Check relevant **household sensitivities** (children, respiratory conditions, etc.).
- Step 3: Select **commute mode** and **cooking fuel** — these personalize every recommendation.
- Click **Skip** on any step to proceed with defaults.

---

## 02 · Live Dashboard (20 seconds)

- The **AQI hero card** shows the current US AQI with a colour-and-pattern category badge (never colour-alone).
- A plain-language sentence explains what this AQI means for *this* household.
- **Pollutant breakdown** cards show PM2.5, PM10, NO₂, O₃, SO₂, CO with icons and values.
- The **48h hourly chart** highlights the best outdoor window in green; a data-table alternative is below the chart for screen-reader users.

---

## 03 · Today's Low-Emission Routine (15 seconds)

- Navigate to **Plan** in the bottom nav.
- Six time blocks (early morning → night) are shown with outdoor-safe indicators.
- The best outdoor window is highlighted.
- **Ask Saans to personalise** — Gemini streams a narrative summary and per-block rationale directly in the UI.

---

## 04 · Indoor Air Hacks (15 seconds)

- Navigate to **Indoor** tab.
- Actions are ranked by impact × feasibility (seal gaps → run purifier → avoid incense, etc.).
- Each card shows cost tier (Free / Low-cost / Investment), effort level, and an evidence note.

---

## 05 · Ask Saans Chat (20 seconds)

- Navigate to **Chat**.
- Suggested questions appear as chips (e.g. "Why is PM2.5 dangerous for my child?").
- Type a question — responses stream in real time, grounded in current AQI + your profile.
- Gemini never invents numbers; it only explains what the domain engine computed.
- If Gemini is unavailable, the app shows a friendly banner and falls back to templated answers.

---

## 06 · Community Kit (10 seconds)

- Navigate to **Community**.
- A one-page advisory is generated for schools, housing societies, or workplaces.
- **Print** button opens the browser print dialog — optimized print CSS included.

---

## Fallback / Offline Behaviour

- Disconnect network → reload → the app shows a banner but renders deterministic recommendations from the action catalog without calling any API.

---

## Key Technical Highlights

| Dimension | Detail |
|-----------|--------|
| AI model | `gemini-2.5-flash` via Firebase AI Logic + App Check |
| AQI data | Open-Meteo Air Quality API (free, no key) |
| Privacy | Coordinates rounded to 2dp; profile flags only — no names or emails sent to AI |
| Offline | Full graceful degradation; never a blank screen |
| Accessibility | WCAG 2.2 AA; skip link; aria-live for plan + chat; full keyboard |
| Bundle | vendor ~81 kB gz; firebase ~20 kB gz; total page < 160 kB gz |
| Tests | 99 tests, 12 test files, domain coverage ≥ 85% branches / ≥ 90% lines |

---

*Medical disclaimer: Saans provides general air quality guidance. It is not a medical device and does not provide medical advice. Consult a healthcare professional for health concerns.*
