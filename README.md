# CraveWise

A React Native / Expo nutrition app built on the **Abbey's Kitchen Hunger Crushing Combo** framework. CraveWise helps users make balanced, satisfying food choices through a conversational, AI-powered interface — without calorie counting or restriction.

---

## Table of Contents

1. [Product Overview](#product-overview)
2. [About CraveWise](#about-cravewise)
3. [Architecture](#architecture)
4. [Project Structure](#project-structure)
5. [Tech Stack](#tech-stack)
6. [Navigation](#navigation)
7. [API & Backend](#api--backend)
8. [Content Guardrails](#content-guardrails)
9. [Ads (AdMob)](#ads-admob)
10. [Local Development](#local-development)
11. [Release Build](#release-build)
12. [Environment Variables](#environment-variables)
13. [Key Decisions & Notes](#key-decisions--notes)

---

## Product Overview

CraveWise provides five core user journeys:

| Screen | Purpose |
|---|---|
| **I'm Eating** | Analyse a meal and receive personalised Hunger Crushing Combo suggestions |
| **I'm Hungry Now** | Multi-step wizard (hunger level → context → time → effort → cravings) to generate meal ideas |
| **Here's What I Have** | Pantry-based meal suggestions from ingredients on hand |
| **Eating Out** | Food-first pairing and ordering advice for restaurant situations |
| **Explore** | Dynamic educational cards personalised to the user's recent history |

Plus **Saved** (bookmarked combinations) and **Profile** (dietary preferences, allergies, cooking confidence).

---

## About CraveWise

### Philosophy

CraveWise is a **flexible nutrition app**, not a diet app. It is built on the principles of [Abbey Sharp's](https://www.abbeyskitchen.com) **Hunger Crushing Combo™** framework — the idea that satisfying, nourishing meals are built from a combination of protein, fat, and fibre-rich foods that work together to crush hunger and prevent the cycle of restriction and overeating. There are no calorie counts, no forbidden foods, and no guilt. The app meets users where they are — whether they're standing in front of an open fridge, scrolling a restaurant menu, or just feeling peckish at 10 pm.

### The Hunger Crushing Combo Framework

Every suggestion CraveWise generates is shaped by three pillars:

- **Protein** — keeps you full and supports muscle maintenance (chicken, eggs, lentils, tofu, Greek yogurt…)
- **Fat** — provides sustained energy and makes food satisfying (avocado, nuts, olive oil, cheese…)
- **Fibre** — slows digestion, feeds gut bacteria, and prevents blood sugar spikes (vegetables, legumes, wholegrains, fruit…)

The Gemini-powered backend is prompted to always recommend a combination that hits all three pillars, personalised to the user's dietary preference, allergies, dislikes, and cooking confidence — not just a generic healthy meal list.

### Core Features

#### 🍽 I'm Eating
The user describes what they're currently eating or about to eat (e.g. "having toast for breakfast", "chicken stir fry for dinner"). CraveWise analyses the meal against the Hunger Crushing Combo framework and suggests what to **add, swap, or pair** to make it more satisfying and balanced — without throwing away what they already planned.

#### 😋 I'm Hungry Now
A guided five-step wizard that takes the guesswork out of meal decisions:
1. **How hungry are you?** — a little hungry / hungry / very hungry
2. **What's the context?** — breakfast / lunch / dinner / snack / late-night
3. **How much time do you have?** — 5 min / 15 min / 30 min / 1 hr+
4. **How much effort?** — zero effort / minimal / moderate / going all out
5. **What are you craving?** — warm, cold, crunchy, creamy, savoury, sweet, spicy, or whatever

The result is a personalised meal idea that respects the user's current energy level, available time, and craving type — all within the Hunger Crushing Combo structure.

#### 🥦 Here's What I Have
Users build a persistent pantry list of ingredients they have on hand. CraveWise suggests complete meals from those ingredients — reducing food waste and solving the classic "I have eggs, cheese, and half a bag of spinach — now what?" problem. The pantry is saved locally and persists across sessions.

#### 🍜 Eating Out
Designed for restaurant situations. The user enters what food or dish they're considering, optionally adds the cuisine type and occasion (e.g. "work lunch", "dinner date"), and CraveWise provides food-first advice on what to order, what to add, or what to pair to make the meal more satisfying — without restriction or calorie talk.

#### 🌍 Explore
A curated, AI-generated feed of short educational cards personalised to the user's dietary profile and recent meal history. Cards cover topics like understanding hunger signals, building a balanced breakfast, the role of fibre, eating out strategies, and more — all grounded in evidence-based, non-diet nutrition.

#### 🔖 Saved
Any recommended Hunger Crushing Combo can be bookmarked with a single tap. Saved combinations are stored locally and displayed in a dedicated tab so users can revisit their favourite meals.

#### 👤 Profile
Users set their personal context once and it is included with every API request:
- **Dietary preference** — omnivore, vegetarian, vegan, pescatarian, gluten-free, etc.
- **Allergies** — nut, dairy, shellfish, gluten, egg, soy, etc.
- **Foods they dislike** — free-text; the AI will avoid them
- **Cooking confidence** — beginner / home cook / confident cook
- **Budget preference** — budget-friendly / mid-range / no limit

### What CraveWise Is NOT

- ❌ Not a calorie counter
- ❌ Not a macro tracker
- ❌ Not a weight-loss app
- ❌ Not a meal-plan subscription
- ❌ Not a recipe database

It is a **conversational nutrition assistant** that gives contextual, personalised guidance in the moment — the food equivalent of asking a knowledgeable friend what they would eat.

---

## Architecture

```
┌─────────────────────────────────────────────────────────┐
│                   CraveWise Mobile App                  │
│              React Native 0.86 + Expo 57                │
│                  New Architecture (JSI)                 │
│                                                         │
│  ┌──────────┐  ┌──────────┐  ┌──────────┐  ┌────────┐  │
│  │  Home /  │  │  Explore │  │  Saved   │  │Profile │  │
│  │  Stack   │  │   Tab    │  │   Tab    │  │  Tab   │  │
│  └──────────┘  └──────────┘  └──────────┘  └────────┘  │
│        │                                                │
│  ┌─────▼──────────────────────────────────────────────┐ │
│  │              Client-side Guardrails                │ │
│  │   Allowlist-first — instant feedback, no network  │ │
│  └─────────────────────────┬──────────────────────────┘ │
│                            │ fetch (HTTPS)               │
│  ┌─────────────────────────▼──────────────────────────┐ │
│  │                  apiClient.ts                      │ │
│  │    Builds UserContext from AsyncStorage profile    │ │
│  │    POST /api/* with typed request/response         │ │
│  └────────────────────────────────────────────────────┘ │
│                                                         │
│  ┌────────────────────────────────────────────────────┐ │
│  │              AsyncStorage (local)                  │ │
│  │     profile · saved combinations · pantry items   │ │
│  └────────────────────────────────────────────────────┘ │
│                                                         │
│  ┌────────────────────────────────────────────────────┐ │
│  │           AdMob (react-native-google-mobile-ads)   │ │
│  │     5 banner placements · test IDs in __DEV__      │ │
│  └────────────────────────────────────────────────────┘ │
└────────────────────────────┬────────────────────────────┘
                             │ HTTPS
         ┌───────────────────▼────────────────────┐
         │         cravewise-api (Node/Express)    │
         │         Google Cloud Run (serverless)   │
         │                                        │
         │  ┌──────────────────────────────────┐  │
         │  │     Server-side Guardrails        │  │
         │  │  Authoritative allowlist-first    │  │
         │  └────────────────┬─────────────────┘  │
         │                   │                    │
         │  ┌────────────────▼─────────────────┐  │
         │  │         Gemini API (Google AI)    │  │
         │  │    gemini-1.5-flash / pro         │  │
         │  └──────────────────────────────────┘  │
         └────────────────────────────────────────┘
```

### Data flow for a typical request

1. User fills in a screen (e.g. meal description in "I'm Eating")
2. **Client guardrail** runs synchronously — rejects non-food input immediately with inline error, no network call
3. `apiClient.ts` reads stored profile/pantry/saved from AsyncStorage to build a `UserContext`
4. `POST /api/recommend` (or relevant endpoint) sent to Cloud Run with full context
5. **Server guardrail** re-validates the input — blocks prompt injection and off-topic requests
6. Gemini generates a structured JSON response following the Hunger Crushing Combo framework
7. Typed response rendered on the result screen; user can save the combination to AsyncStorage

---

## Project Structure

```
cravewise/
├── App.tsx                        # Root — AdsContext provider, AdMob init, splash gate
├── index.ts                       # Expo entry point
├── app.json                       # Expo config — package name, versionCode, AdMob app ID
├── metro.config.js                # Metro bundler config
├── .env                           # EXPO_PUBLIC_API_URL (gitignored — use .env.example)
├── .env.example                   # Template with Cloud Run URL
│
├── src/
│   ├── components/
│   │   ├── AdBanner.tsx           # AdMob banner — adsInitialized gate + 15s timeout
│   │   └── UI.tsx                 # Shared UI primitives (Button, Chip, LoadingState…)
│   ├── constants/
│   │   ├── adUnits.ts             # 5 AdMob banner unit IDs; auto-switches test/prod
│   │   └── theme.ts               # Design tokens — colours, typography, spacing, radii
│   ├── navigation/
│   │   └── AppNavigator.tsx       # Bottom tabs + HomeStack (native-stack)
│   ├── screens/
│   │   ├── Home/HomeScreen.tsx
│   │   ├── Eating/EatingScreen.tsx
│   │   ├── Eating/RecommendationResultScreen.tsx
│   │   ├── HungryNow/HungryNowScreen.tsx
│   │   ├── WhatIHave/WhatIHaveScreen.tsx
│   │   ├── EatingOut/EatingOutScreen.tsx
│   │   ├── Explore/ExploreScreen.tsx
│   │   ├── Saved/SavedScreen.tsx
│   │   ├── Profile/ProfileScreen.tsx
│   │   └── Splash/SplashScreen.tsx
│   ├── store/
│   │   └── storage.ts             # AsyncStorage helpers — profile, saved, pantry
│   ├── types/
│   │   ├── index.ts               # App-wide TypeScript types
│   │   └── api.ts                 # Request/response types for all API endpoints
│   └── utils/
│       ├── apiClient.ts           # fetch wrapper + UserContext builder
│       └── guardrails.ts          # Client-side allowlist-first input validation
│
├── android/
│   ├── app/
│   │   ├── build.gradle           # applicationId, versionCode, release signing config
│   │   └── src/main/
│   │       ├── AndroidManifest.xml        # AdMob App ID meta-data
│   │       └── java/com/cravewise/app/
│   │           ├── MainActivity.kt
│   │           └── MainApplication.kt
│   ├── gradle.properties          # Signing credentials (gitignored — see .example)
│   ├── gradle.properties.example  # Safe template
│   └── settings.gradle
│
└── __tests__/
    └── engine.test.ts
```

---

## Tech Stack

| Layer | Technology | Version |
|---|---|---|
| Framework | React Native | 0.86.3 |
| Build toolchain | Expo | ~57.0.18 |
| Language | TypeScript | ~6.0.3 |
| JS engine | Hermes | bundled with RN 0.86 |
| Architecture | New Architecture (JSI/TurboModules) | enabled |
| Navigation | React Navigation | v7 (native-stack + bottom-tabs) |
| Local storage | AsyncStorage | 2.2.0 |
| Ads | react-native-google-mobile-ads | ^17.0.0 |
| Icons | @expo/vector-icons (Ionicons) | ^15.0.2 |
| Backend | Node.js / Express on Google Cloud Run | — |
| AI | Google Gemini API | gemini-1.5-flash |
| Package manager | npm | — |
| Min Android SDK | 24 (Android 7.0) | — |
| Target Android SDK | 36 | — |

---

## Navigation

```
RootTabNavigator (bottom tabs)
├── Home (HomeNavigator — NativeStack)
│   ├── HomeMain          ← dashboard with action cards
│   ├── Eating            ← meal description input
│   ├── HungryNow         ← multi-step hunger wizard
│   ├── WhatIHave         ← pantry ingredient manager
│   ├── EatingOut         ← restaurant food/cuisine picker
│   └── RecommendationResult ← Hunger Crushing Combo result
├── Explore               ← AI-generated educational cards
├── Saved                 ← bookmarked combinations
└── Profile               ← dietary prefs, allergies, cooking confidence
```

---

## API & Backend

**Base URL (production):** `https://cravewise-api-362411373876.us-central1.run.app`

The URL is baked into the JS bundle via `EXPO_PUBLIC_API_URL` at Metro build time.

### Endpoints

| Method | Path | Screen |
|---|---|---|
| POST | `/api/recommend` | I'm Eating |
| POST | `/api/hungry-now` | I'm Hungry Now |
| POST | `/api/eating-out` | Eating Out |
| POST | `/api/pantry-meals` | Here's What I Have |
| POST | `/api/explore/cards` | Explore |
| POST | `/api/weekly-reflection` | Profile |

### UserContext

Every request includes a `UserContext` built from AsyncStorage at call time:

```ts
{
  dietaryPreference: string,   // e.g. "omnivore", "vegan"
  allergies: string[],
  dislikes: string[],
  cookingConfidence: string,   // e.g. "beginner", "confident"
  budgetPreference: string,
  recentSaved: string[],       // last 5 saved combination names
  pantryItems: string[],       // current pantry
}
```

---

## Content Guardrails

Two-layer validation — client for instant UX, server as the authoritative gate.

### Strategy: Allowlist-first (strict opt-in)

Input must contain **at least one** food/nutrition signal **AND** must not match any blocked pattern. Everything else is rejected.

**Allowlist signals include:** food names, ingredients, cuisines, eating verbs, hunger/craving words, nutritional terms, meal contexts, dietary labels, cooking equipment.

**Hard-blocked categories:**
- Adult / explicit content
- Violence / self-harm
- Programming / tech topics
- Finance / investing
- Medical / clinical (drug dosages, diagnoses)
- Legal / political
- Academic dishonesty
- Hate speech / slurs
- Relationship advice

Both the mobile client (`src/utils/guardrails.ts`) and the API server (`cravewise-api/src/utils/guardrails.ts`) implement identical logic. Client-side runs synchronously before any network call; server-side re-validates as the authoritative check.

---

## Ads (AdMob)

- **SDK:** `react-native-google-mobile-ads` v17 (compatible with RN 0.86 New Architecture)
- **AdMob App ID:** `ca-app-pub-1122116225493671~4131510172` (set in `AndroidManifest.xml`)
- **5 banner placements**, one per screen that shows results:

| Slot key | Placement |
|---|---|
| `bannerHome` | Home dashboard |
| `bannerResult` | Recommendation result |
| `bannerHungry` | Hungry Now results |
| `bannerPantry` | What I Have results |
| `bannerEatingOut` | Eating Out results |

- **Debug builds** (`__DEV__ === true`) automatically use Google's official test banner ID — no real ads are served during development.
- **Release builds** use the real production unit IDs from `src/constants/adUnits.ts`.
- `mobileAds().initialize()` is called once in `App.tsx`; banners are gated behind an `AdsContext` and will not render until initialisation completes (no race condition).
- A 15-second watchdog in `AdBanner.tsx` hides the "Loading ad…" placeholder if neither `onAdLoaded` nor `onAdFailedToLoad` fires.

---

## Local Development

### Prerequisites

- Node.js 18+
- Android Studio + Android SDK (for device/emulator builds)
- A USB-connected Android device **or** an Android emulator
- Java 17 (required by Gradle)

### Setup

```bash
git clone https://github.com/sur01pat/cravewise.git
cd cravewise
npm install

# Copy the env template and set your local API URL
cp .env.example .env
# Edit .env — for a physical device, use your machine's LAN IP:
# EXPO_PUBLIC_API_URL=http://192.168.x.x:3000

# Copy the Android signing template (only needed for release builds)
cp android/gradle.properties.example android/gradle.properties
# Edit android/gradle.properties — fill in keystore path and passwords
```

### Run on device / emulator

```bash
# Start Metro + build debug APK and launch on connected device
npm run android

# Or explicitly target a device serial
ANDROID_SERIAL=<device-serial> npx expo run:android
```

### Run tests

```bash
npm test
```

---

## Release Build

> ⚠️ **Set `EXPO_PUBLIC_API_URL` to the Cloud Run URL in `.env` before building for Play Store.**
> The URL is baked into the JS bundle by Metro at build time.

```bash
# 1. Ensure .env points at production
echo "EXPO_PUBLIC_API_URL=https://cravewise-api-362411373876.us-central1.run.app" > .env

# 2. Bump versionCode and versionName in android/app/build.gradle and app.json

# 3. Clear cached bundle to force Metro re-bundle with new env
rm -rf android/app/build/generated/assets/react/release/

# 4. Build signed AAB
cd android && ./gradlew bundleRelease

# Output: android/app/build/outputs/bundle/release/app-release.aab
```

### Signing

The release keystore lives **outside** the repository at:
```
/Users/sur01pat/cravewise/mobile/android/keystores/cravewise-upload-key.jks
```

Credentials are read from `android/gradle.properties` (gitignored):
```properties
CRAVEWISE_RELEASE_STORE_FILE=/Users/sur01pat/cravewise/mobile/android/keystores/cravewise-upload-key.jks
CRAVEWISE_RELEASE_STORE_PASSWORD=<password>
CRAVEWISE_RELEASE_KEY_ALIAS=cravewise-upload
CRAVEWISE_RELEASE_KEY_PASSWORD=<password>
```

### Current version history

| versionCode | versionName | Notes |
|---|---|---|
| 1 | 1.0.0 | Initial Play Store submission |
| 2 | 1.0.1 | Package name fixed to `com.cravewise.app` |
| 3 | 1.0.2 | AdMob race condition fixed; ads init gate |
| 4 | 1.0.3 | Cloud Run URL baked correctly; production baseline |

---

## Environment Variables

| Variable | Description | Example |
|---|---|---|
| `EXPO_PUBLIC_API_URL` | Backend base URL — baked into bundle at build time | `https://cravewise-api-362411373876.us-central1.run.app` |

All `EXPO_PUBLIC_*` variables are resolved by Metro at bundle time. There is no runtime config injection — changing `.env` requires a full Metro re-bundle to take effect.

---

## Key Decisions & Notes

**New Architecture (JSI)** is enabled (`newArchEnabled=true`). `react-native-google-mobile-ads` v17 is required — v14 and earlier are incompatible with RN 0.86 as they rely on removed bridge APIs.

**`EXPO_PUBLIC_*` baked at build time.** Unlike server-side env vars, these are statically embedded by Metro. Always clear `android/app/build/generated/assets/react/release/` before a release build when the URL has changed — Gradle's incremental build will not re-bundle otherwise.

**AdMob inventory latency.** New AdMob accounts and ad units take 24–48 hours to fill with real inventory. "Loading ad…" appearing on a fresh account is expected and not a bug.

**Keystore.** The upload keystore is stored outside the repo. A backup lives at `~/Desktop/CraveWise-Keystore-Backup-*/`. The SHA-1 fingerprint for the current signing certificate is `22:97:F2:2E:61:4E:0A:A6:68:FE:87:B0:37:37:3D:95:F3:C6:07:58`.

**`gradle.properties` is gitignored.** Copy `android/gradle.properties.example` to `android/gradle.properties` and fill in your credentials before building a release. Never commit this file.

**Stale deleted-file notifications** for `com/cravewise/mobile/MainActivity.kt` and `MainApplication.kt` appear in some editors — these are from an old package name (`com.cravewise.mobile`) that was removed. The active sources are under `com/cravewise/app/`.
