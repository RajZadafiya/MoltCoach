# Molt Coach 🏋️‍♂️

A React Native mobile application built for fitness coaches to track client body-measurement progress, monitor weight and girth trends, and manage entries with optimistic updates and resilient error handling.

---

## 1. Project Overview & Repository

- **Repository:** [GitHub Repository](https://github.com/RajZadafiya/MoltCoach)
- **Tech Stack:** React Native CLI 0.88, React 19, TypeScript, React Navigation v7 (Native Stack, Bottom Tabs), React Query v3, Axios, Formik, Jest.
- **Architecture Highlights:**
  - Strict separation of server state (React Query) and UI state.
  - Optimistic updates with rollback on network/server errors.
  - Pure unit conversion and delta calculation utilities with 100% test coverage.
  - Comprehensive loading, empty, and hostile error state recovery.

---

## 2. How to Run It (Commands in Order)

Follow these step-by-step instructions to run the backend and the mobile app locally:

### Step 1: Start the Fake Backend Server

The mock server runs locally with zero external npm dependencies:

```bash
cd task-files
node server.js
```

> The server will start on **`http://localhost:4000`**.  
> _Note:_ If the mock data is older than a week, regenerate fresh dates before starting:
>
> ```bash
> node generate-db.js
> node server.js
> ```

---

### Step 2: Install App Dependencies

In a new terminal window from the project root (`MoltCoach`):

```bash
npm install
```

_(The `postinstall` script will automatically apply any patches and run `pod install` for iOS)._

---

### Step 3: Start the Metro Bundler

From the project root:

```bash
npm start
```

---

### Step 4: Launch the App

#### On iOS Simulator:

```bash
npm run ios
```

_Note: Make sure Xcode and CocoaPods are installed. The app connects automatically to `http://localhost:4000` on iOS Simulator._

#### On Android Emulator:

```bash
npm run android
```

_Note: Android automatically connects to `http://10.0.2.2:4000` to access the mock backend running on your host machine._

#### On a Physical Device:

If testing on a physical iOS or Android device connected to your local Wi-Fi:

1. Open [`src/api/client.ts`](file:///Users/rajzadafiya/Projects/MoltCoach/src/api/client.ts).
2. Set `BASE_URL` to your computer's local IP address (e.g., `http://192.168.1.100:4000`).

---

### Step 5: Run Unit Tests

To run Jest unit tests (testing conversion utilities, deltas, and edge cases):

```bash
npm test
```

---

### Test Credentials

- **Email:** `coach@molt.app`
- **Password:** `molt1234`

---

## 3. What Was Finished & What Was Not

All core requirements through **Priority 1, 2, 3, and 4** were completed. Priority 5 items were deliberately skipped per the task brief instructions.

| Priority       | Feature / Requirement                             |   Status    | Notes                                                                                                                                                                                                                                              |
| :------------- | :------------------------------------------------ | :---------: | :------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| **Priority 1** | **Login Screen (L1–L6)**                          | ✅ Complete | Formik validation, masked password, in-flight debounce, readable error mapping (401 vs 503 vs offline), persistent auth token in AsyncStorage, conditional auth tree preventing back navigation.                                                   |
| **Priority 1** | **Clients List (C1–C5)**                          | ✅ Complete | Alphabetical sorting to eliminate hostile server randomisation, pull-to-refresh, full loading/error states with retry button, navigation to progress screen.                                                                                       |
| **Priority 1** | **Weight Progress (P1–P4)**                       | ✅ Complete | Sorted newest first, range filtering (`7D`, `30D`, `90D`, `All`) with re-fetch via `from` query param, latest weight summary card.                                                                                                                 |
| **Priority 2** | **Add Weight (A1–A8)**                            | ✅ Complete | Date picker (future dates disabled), numeric keyboard, client-side validation (20–400 kg), 422 duplicate date field mapping, optimistic item addition with pending "Saving..." badge, rollback on failure, reconciliation with server-assigned ID. |
| **Priority 2** | **Delete Weight (D1–D3)**                         | ✅ Complete | Long-press to delete with confirmation alert, instant optimistic row removal, automatic rollback restoring original entry and order if server returns error.                                                                                       |
| **Priority 3** | **Loading / Error / Empty States (E1–E5)**        | ✅ Complete | No infinite spinners; retry affordance on failed reads; rollback on failed writes; global 401 interceptor logging user out cleanly; offline/hostile server downtime handled gracefully.                                                            |
| **Priority 3** | **Unit Toggle (P7–P8)**                           | ✅ Complete | `kg` ↔ `lb` display toggle with 1 decimal rounding; underlying storage and payloads remain strictly kilograms.                                                                                                                                     |
| **Priority 3** | **Progress Deltas & Edge Cases (P5, P6, P9–P11)** | ✅ Complete | Total change with `+`/`-` sign; row-by-row deltas compared to chronologically preceding entry; zero entries empty state; single entry showing `—` (no fake `0.0`); distinct empty state for range filter with no data.                             |
| **Priority 4** | **Girth Sub-Tab (P13–P16)**                       | ✅ Complete | Read-only view; site selector (`waist`, `chest`, `hip`, `arm`, `thigh`); mm to cm conversion (`1012 mm` -> `101.2 cm`); empty state for missing site data (e.g., client `c1` arm).                                                                 |
| **Priority 4** | **Bottom Tabs & Profile (N1–N4)**                 | ✅ Complete | React Navigation bottom tabs (`Clients` & `Profile`), strongly typed route params (`no any`), Profile tab with coach details, server status, and sign-out confirmation.                                                                            |
| **Priority 5** | **Charts (P12)**                                  | ⏭️ Skipped  | Explicitly excluded per task brief to focus on list correctness, edge cases, and resilient rollback.                                                                                                                                               |
| **Priority 5** | **Dark Mode & Complex Animations**                | ⏭️ Skipped  | Out of scope for the 4–5 hour time budget.                                                                                                                                                                                                         |
| **Priority 5** | **Offline Queue**                                 | ⏭️ Skipped  | Handled transient failures with optimistic rollback rather than a full persistent offline queue.                                                                                                                                                   |

---

## 4. The Three Decisions I Am Least Sure About, and Why

### 1. React Query v3 Cache Keys vs. A Normalized Client Store for Optimistic Reconciliations

- **The Decision:** Used React Query (`useQuery` and `useMutation`) with manual query-cache modifications (`setQueryData`, `cancelQueries`, and `invalidateQueries`) inside [`src/hooks/useWeight.ts`](file:///Users/rajzadafiya/Projects/MoltCoach/src/hooks/useWeight.ts).
- **Why I made it:** React Query keeps server state separate from UI state (criterion T2), handles cache eviction, and natively provides `onMutate` rollback context without boilerplate.
- **Why I am least sure about it:** When a weight entry is added optimistically with a temporary ID (`temp_123`), it is appended to the specific range key (e.g. `['weight', clientId, '7D']`). If the user quickly toggles range filters or another fetch completes before the mutation settles, reconciling the temporary entry across query keys can cause subtle race conditions. A centralized normalized store (e.g. Zustand or Redux Toolkit with RTK Query) might have provided more explicit ID-reconciliation control across multiple active queries.

### 2. Client-Side Dynamic Delta Calculations vs. Storing Derived Deltas

- **The Decision:** Because the backend returns entries unsorted and in randomized order, all chronologically ordered deltas (total range change and row-by-row deltas) are computed purely in memory via [`calculateWeightStats()`](file:///Users/rajzadafiya/Projects/MoltCoach/src/utils/conversions.ts) on every query data update.
- **Why I made it:** It ensures single-source-of-truth semantics. When switching units between `kg` and `lb`, changing range filters, or rolling back an optimistic entry, deltas immediately recompute correctly without the risk of stale derived data. It is also 100% unit-tested in [`__tests__/conversions.test.ts`](file:///Users/rajzadafiya/Projects/MoltCoach/__tests__/conversions.test.ts).
- **Why I am least sure about it:** For small datasets (10–50 entries), this is computationally trivial (<1ms). However, if a client had hundreds of entries spanning several years, computing deltas sequentially on the JavaScript thread during render could cause frame drops. If scaling to large histories, this calculation should be memoized or computed during data ingestion.

### 3. Static Platform-Based Base URL Resolution vs. In-App Environment Switcher

- **The Decision:** Configured `BASE_URL` in [`src/api/client.ts`](file:///Users/rajzadafiya/Projects/MoltCoach/src/api/client.ts) to detect `Platform.OS === 'android' ? 'http://10.0.2.2:4000' : 'http://localhost:4000'`.
- **Why I made it:** To provide a zero-configuration experience for evaluators testing on standard iOS Simulators and Android Emulators without requiring extra environment variable configuration libraries (`react-native-dotenv` / `react-native-config`).
- **Why I am least sure about it:** If an evaluator chooses to test on a physical device over a local Wi-Fi network, they still have to edit the host IP in code. An in-app debug modal or developer setting in the Profile screen allowing dynamic runtime IP changes would have been friendlier for physical device testing.

---

## 5. Anything I Would Do Differently with Two More Days

1. **Persistent Offline Queue & Sync Engine:**
   - Integrate `@tanstack/react-query-persist-client` backed by MMKV or SQLite. If the coach enters a gym basement with zero signal, logs would be queued locally and synced automatically with exponential backoff when connection returns.
2. **Gesture-Driven Interactions (Swipe to Delete):**
   - Replace the long-press delete with `react-native-gesture-handler` and `react-native-reanimated` swipe-to-reveal delete actions, paired with haptic feedback (`react-native-haptic-feedback`) on delete and save events.
3. **Device-Specific Screen Layout & Android Navigation Handling:**
   - Completed all screens with device-specific UI handling, including addressing Android gesture and button navigation bar compatibility issues with the custom bottom tab navigation.
4. **Client Details Screen – Add Weight Button Visibility Improvement:**
   - I'll fix the issue where the **Add Weight** button appeared twice when no data was available on the Client Details screen by hiding the main bottom button when no data is found.
5. **Authentication & Global State Management Optimization with Redux:**
   - Replace React Context for authentication tokens and shared helper methods with a centralized Redux store to simplify state management and improve performance by minimizing unnecessary component re-renders, optimizing state subscriptions, and ensuring components update only when the specific state they depend on changes.
6. Client-Side Pagination & Data Loading Optimization:
   - Implement pagination on the app side to improve performance and scalability as the number of clients and the volume of client details increase in the future. Load data in smaller batches instead of rendering all records at once, reducing memory usage, initial loading time, and UI rendering overhead while ensuring a smoother user experience.

---

## 6. Screen Recording

- **Walkthrough Duration:** ~5 minutes.
- **Recording Link / Video:** [Screen Recording Video](./walkthrough.mp4)
- **Key Scenarios Demonstrated:**
  1. **Authentication Flow:** Client-side validation, logging in with `coach@molt.app`, and session persistence across app kill and relaunch.
  2. **Clients List & Navigation:** Sorting clients alphabetically, pull-to-refresh, and tapping into client progress.
  3. **Weight Progress:** Range filter toggling (`7D`, `30D`, `90D`, `All`), `kg` ↔ `lb` unit toggle, and row-by-row deltas.
  4. **Edge Cases:** Single entry client (`c2` - Meera Iyer) showing `—` delta instead of `0.0`; range filter showing "Nothing in selected range".
  5. **Girth Tab:** Site selector (`waist`, `chest`, `arm`, etc.), millimeter to centimeter conversion (`1012 mm` -> `101.2 cm`), and handling missing site data.
  6. **Deliberate Failure & Optimistic Rollback:**
     - Adding a weight entry while the hostile server fails writes (15% failure rate / chaos toggle) or entering a duplicate date (server `422`).
     - Showing the optimistic row appear immediately with a pending "Saving..." badge.
     - Showing the server write failure trigger a clean rollback where the row is removed, original data is restored, and an error alert is shown.
  7. **Optimistic Delete & Rollback:**
     - Long-press to delete, instant row removal, and restoration if the server write fails.

---

## 7. Time Spent

- **Total Time Spent:** Approximately **6 hours** of focused implementation and testing.
  - ~1 hour: Architecture setup, navigation hierarchy, API client, authentication, and token persistence.
  - ~1.5 hours: Clients list, sorting logic, Weight tab, range filtering, and unit conversions.
  - ~1.5 hours: Add & Delete weight mutations with optimistic updates, rollback handlers, and 422 field error mappings.
  - ~1 hours: Girth tab, Profile tab, Jest unit tests, and documentation.
  - ~1 hours: Updated readme file and recorded a proper video that shows all the required cases.
