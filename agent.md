# GigShield AI - AI Coding Agent Guidelines

Welcome, AI Agent. This file contains the critical context, rules, and architectural guidelines required to maintain and develop the **GigShield AI** project. Read this thoroughly before making any modifications to the codebase.

---

## 🏗️ Project Overview

**GigShield AI** is an AI-powered parametric insurance and live disruption monitoring platform built specifically for gig economy workers (e.g., Zomato, Swiggy drivers). It uses a mix of real-time APIs and simulated ML algorithms to instantly trigger automated insurance payouts when gig workers' environments become hostile or unsafe.

### Tech Stack & Versions (Pinned)

| Technology          | Version      | Notes                                    |
| ------------------- | ------------ | ---------------------------------------- |
| Expo SDK            | `~54.0.0`    | Must match Expo Go client on device      |
| React               | `19.1.0`     |                                          |
| React Native        | `0.81.5`     |                                          |
| Expo Router         | `~6.0.23`    | File-based routing                       |
| TypeScript          | `~5.9.2`     | Strict mode enabled (`tsconfig.json`)    |
| Node.js             | `>=18.x`     | LTS recommended                          |
| npm                 | `>=9.x`      |                                          |

> ⚠️ **SDK Compatibility**: The Expo Go app installed on the physical test device **must** match the project's SDK version (`~54`). Mismatches cause "Project is incompatible with this version of Expo Go" errors. If upgrading, run `npx expo install --fix` to realign all Expo packages.

### Styling & UI
- **Styling**: Standard `StyleSheet.create` (Custom Design System — **NO Tailwind**)
- **State/Storage**: React `useState`/`useEffect` + `AsyncStorage`
- **Icons**: `lucide-react-native` (see § Known Traps for import rules)

---

## 📁 Project Directory Structure

```
GigShieldAI/
├── app/                          # Expo Router — File-based routes
│   ├── _layout.tsx               # Root layout (font loading, splash, auth gate)
│   ├── index.tsx                 # Entry redirect (→ auth or tabs)
│   ├── camera.tsx                # Evidence capture screen
│   ├── evidence-history.tsx      # Saved evidence gallery
│   ├── map.tsx                   # Web3-styled Leaflet disruption map
│   ├── (auth)/                   # Auth group (unauthenticated)
│   │   ├── login.tsx             # Login screen (mock "Judge Simulator")
│   │   └── register.tsx          # Registration screen
│   └── (tabs)/                   # Main app tab group (authenticated)
│       ├── _layout.tsx           # Tab bar layout & navigation config
│       ├── home.tsx              # Dashboard — disruption overview
│       ├── monitor.tsx           # Live trigger monitoring
│       ├── claims.tsx            # Claim history & payout tracking
│       ├── policy.tsx            # Policy details & coverage info
│       ├── premium.tsx           # Premium calculator
│       └── profile.tsx           # User profile & settings
├── components/
│   └── SettingsMenu.tsx          # Reusable settings/logout menu
├── constants/
│   ├── theme.ts                  # 🎨 Design system tokens (colors, spacing, fonts)
│   └── triggers.ts               # Trigger type definitions & config
├── services/
│   ├── auth.ts                   # Auth helper (AsyncStorage read/write)
│   ├── cameraService.ts          # expo-camera capture + GPS embedding
│   ├── claimEngine.ts            # Multi-step claim verification pipeline
│   ├── premiumEngine.ts          # Dynamic premium calculation logic
│   ├── storage.ts                # AsyncStorage wrapper utilities
│   ├── triggerApis.ts            # 5 parametric trigger evaluators
│   └── weatherApi.ts             # OpenWeatherMap fetch + rate-limit fallbacks
├── assets/                       # App icons, splash screens, favicon
├── .env                          # 🔒 API keys (NEVER commit)
├── .env.example                  # Template for required env vars
├── app.json                      # Expo configuration
├── eas.json                      # EAS Build profiles
├── babel.config.js               # Babel preset (expo)
├── tsconfig.json                 # TypeScript config (strict: true)
├── index.ts                      # Expo entry point
└── package.json                  # Dependencies & scripts
```

---

## 📦 Dependencies Manifest

### Core Dependencies (Required)

| Package                                    | Purpose                                |
| ------------------------------------------ | -------------------------------------- |
| `expo`                                     | Core Expo framework                    |
| `expo-router`                              | File-based routing                     |
| `react` / `react-native`                   | UI framework                           |
| `@react-native-async-storage/async-storage`| Persistent local key-value storage     |
| `lucide-react-native`                      | Icon library (sole icon source)        |
| `react-native-webview`                     | WebView for Leaflet map                |
| `react-native-svg`                         | SVG rendering support                  |
| `@expo-google-fonts/inter`                 | Inter font family                      |

### Expo Modules (Required)

| Package                | Purpose                                |
| ---------------------- | -------------------------------------- |
| `expo-camera`          | Photo evidence capture                 |
| `expo-location`        | GPS coordinate embedding               |
| `expo-media-library`   | Save evidence to device gallery        |
| `expo-file-system`     | Local file I/O                         |
| `expo-font`            | Custom font loading                    |
| `expo-linear-gradient` | Gradient backgrounds                   |
| `expo-haptics`         | Tactile feedback                       |
| `expo-splash-screen`   | Splash screen control                  |
| `expo-status-bar`      | Status bar styling                     |
| `expo-constants`       | App constants & env access             |
| `expo-linking`         | Deep linking                           |
| `expo-web-browser`     | In-app browser                         |
| `expo-crypto`          | Cryptographic utilities                |
| `expo-dev-client`      | Dev build support                      |
| `expo-auth-session`    | OAuth session management               |

### Animation & Navigation (Required)

| Package                           | Purpose                          |
| --------------------------------- | -------------------------------- |
| `react-native-reanimated`         | Performant animations            |
| `react-native-gesture-handler`    | Gesture recognition              |
| `react-native-screens`            | Native screen containers         |
| `react-native-safe-area-context`  | Safe area insets                 |
| `react-native-worklets`           | Worklet threading for animations |

### Dev Dependencies

| Package         | Purpose                     |
| --------------- | --------------------------- |
| `@babel/core`   | Babel transpiler core       |
| `@types/react`  | React type definitions      |
| `typescript`    | TypeScript compiler         |

---

## 🎨 Visual Identity & Brand Guidelines (CRITICAL)

The project recently underwent a major UI overhaul to match the **"Arounda Web3 Crypto Glow"** aesthetic.
You must **STRICTLY** adhere to these design parameters:

### The Color Palette (`constants/theme.ts`)
- **Background (Pitch Black)**: `#0A0B0A` (or slightly elevated `#111211` for cards/inputs).
- **Primary Accent (Neon Lime)**: `#A4E367`
- **Primary Accent Alt (Cyber Lime)**: `#CBFF00`
- **Secondary Accent (Muted Teal)**: `#3CAF8D`
- **Tertiary Accent (Neon Purple)**: `#bf5fff`
- **Error/Destructive**: `#FF3B30`
- **Text**: `textPrimary` (`#FFFFFF`), `textSecondary` (`rgba(255,255,255,0.6)`), `textTertiary` (`rgba(255,255,255,0.4)`).

### Design Rules
1. **Never use standard white backgrounds** or light themes. The app is permanently locked in Dark Mode.
2. **Glassmorphism & Borders**: Cards and inputs must use subtle borders (`borderWidth: 1, borderColor: 'rgba(255,255,255,0.1)'`) with deep background colors to simulate frosted glass.
3. **Typography**: The app mimics "SF Pro Display" but uses `Inter` weights (Medium `500` / SemiBold `600` / ExtraBold `800`).
4. **Spacing**: Avoid cluttered interfaces. Embrace padding and edge-to-edge layouts (especially on Auth screens).
5. **Animations**: Use `react-native-reanimated` for performant, 60fps micro-animations. Avoid `Animated` from core React Native for complex sequences.

---

## ⚙️ Core Architecture & Features

### 1. The 5 Parametric Triggers (`services/triggerApis.ts`)
The app automatically evaluates 5 distinct disruption triggers:
- **Heavy Rain** (Real API via OpenWeatherMap)
- **Extreme Heat** (Real API via OpenWeatherMap)
- **AQI Spike** (Real API via OpenWeatherMap / CPCB)
- **Flooding** (Simulated IMD/NDMA dataset)
- **Civil Curfew / Bandh** (Real API via GNews breaking news feeds)

### 2. Evidence Capture (`services/cameraService.ts`)
- Utilizes `expo-camera` to capture physical proof of claim events.
- Embeds GPS coordinates using `expo-location`.
- Saves Local URIs and Metadata via `AsyncStorage` under `@gigshield_evidence_history`.

### 3. Claims & Payout Engine (`services/claimEngine.ts`)
- Mocks a multi-step verification pipeline (Disruption Detected -> Parametric Validation -> Location Verified -> Fraud Check Passed -> Payout Sent).
- Tracks whether claims are `detected`, `validating`, `paid`, or `rejected`.

### 4. Premium Calculator (`services/premiumEngine.ts`)
- Dynamically computes insurance premiums based on city risk profiles and trigger severity.

### 5. Custom Auth (The "Judge Simulator") (`app/(auth)/login.tsx`)
- To facilitate instant Hackathon demonstrations, we bypass standard OAuth architectures (e.g., Firebase/Supabase).
- Users manually input a Display Name via `<TextInput>`, which is immediately serialized into `AsyncStorage('@gigshield_user')`.
- All downstream components (like `app/(tabs)/profile.tsx` and the Settings Header) strictly use `useState`/`useEffect` to dynamically lift and render this mock context.

> 📌 **Migration Note**: The current auth is a hackathon shortcut. For production, migrate to a proper auth provider (e.g., Supabase Auth, Firebase Auth, or Clerk). Key steps:
> 1. Replace `AsyncStorage`-based auth in `services/auth.ts` with provider SDK.
> 2. Update `app/_layout.tsx` auth gate logic to use provider session tokens.
> 3. Replace `@gigshield_user` reads across `profile.tsx`, `SettingsMenu.tsx`, and `home.tsx`.
> 4. The Google Sign-In packages (`@react-native-google-signin/google-signin`, `expo-auth-session`) are already installed for future use.

### 6. Web3 Cartography (`app/map.tsx`)
- We bypass Google Maps API Key requirements explicitly by utilizing **CartoDB Dark Matter** tiles injected inside `react-native-webview` running OpenStreetMap's Leaflet.js.
- **The Neon Glow Vector Hack**: Do not use standard lines. Draw two stacked `L.polyline` vectors: one thick neon base (`weight: 16`, `opacity: 0.15`) underneath a sharp core (`weight: 3`, `opacity: 1`) to simulate a high-end emission glow map.

### 7. Rate-Limit Fallbacks (`services/weatherApi.ts`)
- Since free-tier APIs (OpenWeatherMap, GNews) fail aggressively, every single API fetch **must** be wrapped in a `try/catch`. 
- The `catch` block must perfectly mimic the API by returning isolated `getMockAQI()` or `getMockWeather()` dictionary results mapped specific to the user's selected City (e.g., overriding Delhi to 44°C/450 AQI).

> ⚠️ **Mock Data Maintenance**: The hardcoded fallback values (e.g., Delhi at 44°C / 450 AQI) are demo-optimized. If target cities change, update the mock dictionaries in `services/weatherApi.ts` and `services/triggerApis.ts` accordingly.

---

## 🛠️ Environment Variables (`.env`)

The app relies on `.env` injected via Expo's `EXPO_PUBLIC_` prefix. See `.env.example` for the template.

### Variable Classification

| Variable                                | Required | Purpose                            |
| --------------------------------------- | -------- | ---------------------------------- |
| `EXPO_PUBLIC_OPENWEATHER_API_KEY`       | **Yes**  | Weather, AQI, heat data fetching. App falls back to mock data without it, but real-time monitoring is disabled. |
| `EXPO_PUBLIC_GNEWS_API_KEY`             | **Yes**  | Civil curfew / bandh news feed trigger. Falls back to mock without it. |
| `EXPO_PUBLIC_GOOGLE_WEB_CLIENT_ID`      | No       | Google OAuth (web). Currently unused — reserved for production auth migration. |
| `EXPO_PUBLIC_GOOGLE_ANDROID_CLIENT_ID`  | No       | Google OAuth (Android). Currently unused — reserved for production auth migration. |

> ⚠️ **Cache Warning**: If updating `.env` keys mid-session, you **must** run `npx expo start -c` to wipe Metro's cache, or the new keys will fail silently.

---

## 🧪 Testing & Verification Guidelines

### Running the App
```bash
# Install dependencies
npm install

# Start dev server (clears cache)
npx expo start -c

# Platform-specific
npx expo start --android
npx expo start --ios
npx expo start --web
```

### Pre-Commit Checklist
Before committing any changes, verify:
1. **TypeScript compiles**: `npx tsc --noEmit` — zero errors.
2. **Metro bundles**: `npx expo start` launches without red-screen errors.
3. **Platform parity**: Test on both Android and Web if modifying platform-sensitive code (`Alert`, `Camera`, `Location`).
4. **API fallbacks work**: Temporarily remove `.env` keys and verify that mock data renders correctly on all trigger screens.

### Manual QA Flow
1. Fresh launch → Should redirect to `(auth)/login.tsx`.
2. Enter name → Should redirect to `(tabs)/home.tsx` with name displayed.
3. Navigate all tabs → No crashes, all data renders (mock or real).
4. Open Map → Dark CartoDB tiles load, neon glow polylines visible.
5. Camera → Permissions prompt, capture works, evidence appears in history.
6. Claim flow → Trigger detection → Validation animation → Payout status updates.

---

## 🪲 Known Traps & Quirks

1. **Expo Web vs Native Polyfills**:
   - `Alert.alert` with actionable "Delete/Cancel" buttons **FAILS SILENTLY** when compiled for the Web. Always use conditional rendering: `if (Platform.OS === 'web') { window.confirm(...) } else { Alert.alert(...) }`
2. **500 Internal Server Errors**:
   - Before editing UI elements in `register.tsx` or `login.tsx`, ensure you do not orphan routing states. A rogue undefined variable in `onPress` will fatally crash the Metro bundler.
3. **Icons & Components**:
   - We strictly use `lucide-react-native`. Do **NOT** attempt to import from `@expo/vector-icons` unless specifically requested.
4. **Reanimated Worklets**:
   - If adding new `react-native-reanimated` animations, ensure the Babel plugin is configured in `babel.config.js`. Worklet functions must be marked with `'worklet';` directive.
5. **AsyncStorage Key Collisions**:
   - All storage keys are prefixed with `@gigshield_`. Maintain this convention to avoid collisions. Current keys include: `@gigshield_user`, `@gigshield_evidence_history`.

---

## 📐 Coding Standards

### File Naming
- **Screens**: `camelCase.tsx` (e.g., `evidence-history.tsx`)
- **Components**: `PascalCase.tsx` (e.g., `SettingsMenu.tsx`)
- **Services**: `camelCase.ts` (e.g., `claimEngine.ts`)
- **Constants**: `camelCase.ts` (e.g., `theme.ts`)

### Component Patterns
- Use **functional components** with hooks exclusively. No class components.
- Keep screen files self-contained — styles defined at the bottom via `StyleSheet.create`.
- Extract reusable UI into `components/` directory with `PascalCase` naming.
- Type all props with explicit `interface` or `type` definitions.

### Import Order (Convention)
```typescript
// 1. React & React Native
import { View, Text, StyleSheet } from 'react-native';
// 2. Expo modules
import * as Location from 'expo-location';
// 3. Third-party libraries
import { Shield } from 'lucide-react-native';
// 4. Local imports (constants, services, components)
import { theme } from '../constants/theme';
import { claimEngine } from '../services/claimEngine';
```

---

**Objective Statement**: Your goal is to construct heavily-optimized, high-performance TypeScript components while maintaining the bleeding-edge Web3 crypto visual fidelity required for a highly-competitive hackathon submission. Keep it fast, keep it pitch-black, and keep it neon.
