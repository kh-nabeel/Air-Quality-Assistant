# Saans System Architecture & Engineering Standards

This document describes the architectural principles, component structure, design patterns, and engineering standards implemented in **Saans** following Google's production code guidelines.

---

## 1. Architectural Overview

Saans follows a strict **Clean Architecture (Hexagonal Architecture)** model with unidirectional dependencies pointing inward toward domain entities:

```
┌─────────────────────────────────────────────────────────────┐
│                      Presentation Layer                     │
│    React 19 Components · Features · Design Tokens · i18n   │
└──────────────────────────────┬──────────────────────────────┘
                               │ depends on
┌──────────────────────────────▼──────────────────────────────┐
│                      Application Hooks                      │
│    useAirQuality · useGemini · useGeocoding · useProfile    │
└──────────────────────────────┬──────────────────────────────┘
                               │ depends on
┌──────────────────────────────▼──────────────────────────────┐
│                      Services & Adapters                    │
│    Firebase AI Logic · Open-Meteo APIs · Cache · Zod        │
└──────────────────────────────┬──────────────────────────────┘
                               │ depends on
┌──────────────────────────────▼──────────────────────────────┐
│                         Domain Core                         │
│   Pure TypeScript · Zero I/O · 100% Deterministic Engine    │
│   AQI Classification · Risk Scoring · Routine Builder       │
└─────────────────────────────────────────────────────────────┘
```

### Dependency Rules:

1. **Domain Core (`src/domain/`)**: Pure TypeScript functions and type definitions with zero I/O and zero external dependencies. Completely deterministic and unit-tested in isolation.
2. **Services (`src/services/`)**: External integrations (Open-Meteo, Firebase AI Logic, Geocoding). All network payloads are strictly validated at the boundary using Zod schemas and wrapped in typed `Result<T, E>` types.
3. **Features (`src/features/`)**: Independent vertical slices representing functional domains (Dashboard, Plan, Indoor, Alternatives, Impact, Chat, Community, Onboarding).
4. **Components (`src/components/`)**: Reusable UI primitives conforming to the TinkerHub neo-brutalist design system.

---

## 2. SOLID Principles in Practice

| Principle                       | Application in Saans                                                                                                                                                                                                                |
| :------------------------------ | :---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| **Single Responsibility (SRP)** | Each domain module handles one exact domain concern (e.g., `classifyAqi.ts` only categorizes pollutants; `findBestOutdoorWindow.ts` only analyzes hourly windows). Component files are strictly decoupled from presentation styles. |
| **Open/Closed (OCP)**           | The action catalog (`actionCatalog.ts`) and pollutant scoring tables are open for extension by adding catalog items, but closed for modification—ranking algorithms dynamically adapt to new actions without code modification.     |
| **Liskov Substitution (LSP)**   | All cache implementations (`MemoryCache`, `SessionCache`, `AqiCache`) adhere to a uniform caching interface, enabling interchangeable caching layers without modifying consuming services.                                          |
| **Interface Segregation (ISP)** | Granular TypeScript interfaces (`HourlyAqiData`, `AqiData`, `RankedAction`, `HouseholdProfile`) prevent components from depending on unused data fields.                                                                            |
| **Dependency Inversion (DIP)**  | High-level presentation hooks depend on abstract service functions and domain models, not low-level SDK instances. External APIs can be mocked or swapped without touching UI logic.                                                |

---

## 3. Design Patterns

- **Result Pattern (`Result<T, E>`)**: Rather than throwing uncaught runtime exceptions across network boundaries, operations return `{ ok: true, value: T }` or `{ ok: false, error: E }`, enforcing explicit handling.
- **Circuit Breaker & Graceful Fallback**: The GenAI layer (`generatePlan`, `chat`) utilizes a multi-tiered failover pipeline: Primary (`gemini-3.5-flash-lite`) $\rightarrow$ Fallback (`gemini-3.8-flash`) $\rightarrow$ Offline Grounded Engine. The application **never** renders a blank or broken state.
- **Multi-Layer Cache Pattern**: `AqiCache` incorporates an in-memory L1 cache with microsecond access alongside a `sessionStorage` L2 cache with TTL validation to prevent redundant network requests.
- **Debounced Execution Pattern**: Geocoding search inputs utilize a clean `debounce()` wrapper with cancellation support to prevent API saturation.

---

## 4. Code Quality & Google TypeScript Standards

- **Strict Type Checking**: Enabled `noUncheckedIndexedAccess`, `strict: true`, `noUnusedLocals`, and `noUnusedParameters` in `tsconfig.json`.
- **Zero Inline Styles**: Component layout and aesthetics are separated into typed `styles` dictionaries with `satisfies CSSProperties`.
- **JSDoc Everywhere**: 100% of exported functions, interfaces, types, and constants are documented with descriptive JSDoc comments, `@param`, and `@returns` tags.
- **Strict Immutability**: All domain models and component props utilize `readonly` modifiers to enforce unidirectional data flow.
- **Accessible & Screen-Reader Tested**: WCAG 2.1 AA compliant with zero axe violations, semantic landmark tags, and accessible contrast ratios.

---

## 5. Security Architecture

- **Firebase App Check with Google Cloud Fraud Defense**: Enforces attestation via `ReCaptchaEnterpriseProvider` to prevent unauthorized scraping and API abuse.
- **Prompt Injection Defense**: All user inputs undergo control-character removal, length limiting, and XML tag stripping in `src/utils/sanitize.ts` before reaching LLM context templates.
- **Zero Known Vulnerabilities**: Regular dependency auditing ensures 0 known CVEs across transitive packages via explicit package overrides.
- **Content Security Policy (CSP)**: Hardened headers in `firebase.json` restricting script execution, frame embedding (`frame-ancestors 'none'`), and external connections.
