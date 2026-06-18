https://github.com/copilot/share/4a030106-4160-84c0-b140-500a00d4617b





# PulseRun 🏃

A gamified fitness and location tracker built with **React Native + Expo**.  
Records runs using the device's physical Accelerometer (step counting) and GPS (distance), captures a victory selfie, and stores all workout history locally via AsyncStorage.

---

## Tech Stack

| Layer | Implementation |
|---|---|
| UI / Views | React Native core components, Flexbox, Dimensions API |
| Navigation | React Navigation — Stack + Bottom Tab |
| State (local) | `useState`, `useReducer` |
| State (global) | Context API (`WorkoutContext`) |
| Persistence | `AsyncStorage` via `StorageService` wrapper |
| Sensors | `expo-sensors` Accelerometer, `expo-location` GPS |
| Camera | `expo-camera` |
| Networking | Axios + request/response interceptors (Open-Meteo weather) |
| Testing | Jest + React Native Testing Library |
| Build | Expo Application Services (EAS Build) |

---

## Architecture (MVVM)

```
src/
├── context/          # ViewModel — WorkoutContext (useReducer + actions)
├── hooks/            # Reusable sensor abstractions (useAccelerometer, useLocation)
├── screens/          # Views — dumb renderers, consume hooks & context
├── components/       # Shared UI components (WorkoutCard, StatBadge)
├── services/
│   ├── StorageService.js       # Model — AsyncStorage I/O
│   └── api/
│       ├── axiosClient.js      # Centralised Axios instance + interceptors
│       └── weatherApi.js       # Open-Meteo API calls
├── navigation/       # AppNavigator (Tab + Stack)
└── utils/            # Pure utility functions (calculations.js)
__tests__/            # Jest unit tests
```

---

## How to Run

### Prerequisites
- Node.js ≥ 18
- Expo CLI: `npm install -g expo-cli`
- Expo Go app on your Android device (Samsung Galaxy A06 or similar)

### Steps

```bash
# 1. Clone and install
git clone https://github.com/<your-username>/PulseRun.git
cd PulseRun
npm install

# 2. Start the development server
npx expo start

# 3. Scan the QR code with Expo Go on your Android device
```

### Required Permissions (prompted at runtime)
- **Location** (foreground) — for GPS distance tracking
- **Camera** — for victory selfie capture
- **Physical Activity** — for accelerometer access

---

## Running Tests

```bash
npx jest
# or for watch mode:
npx jest --watchAll
```

---

## Key Dependencies

```bash
npx expo install expo-sensors expo-location expo-camera
npx expo install @react-native-async-storage/async-storage
npm install @react-navigation/native @react-navigation/bottom-tabs @react-navigation/native-stack
npm install react-native-screens react-native-safe-area-context
npm install axios
```

---

## Features

### Core
- ✅ Real-time step counting via Accelerometer (5 Hz throttled)
- ✅ GPS distance tracking with Haversine calculation
- ✅ Live elapsed timer
- ✅ Calories & pace estimation
- ✅ Victory selfie capture at run completion
- ✅ Persistent workout history (AsyncStorage)
- ✅ Optimised FlatList with `removeClippedSubviews`

### Bonus
- ✅ Weather conditions fetched at run-start GPS location (Open-Meteo API)
- ✅ Axios interceptors for automatic logging + error routing
- ✅ Background-safe cleanup on all sensor subscriptions

---

## Performance Optimisations

| Risk | Mitigation |
|---|---|
| Accelerometer at 100 Hz flooding JS thread | Pinned to 5 Hz (`setUpdateInterval(200)`) |
| GPS polling draining battery | `timeInterval: 3000`, `distanceInterval: 5 m`, `Accuracy.Balanced` |
| FlatList re-renders on large history | `removeClippedSubviews`, `maxToRenderPerBatch={5}`, `keyExtractor` by id |
| Camera images bloating AsyncStorage | Only file URI stored (not base64); images stay in device cache |
| Floating-point accumulation in distance | `toFixed(4)` + `parseFloat()` on every GPS segment sum |

---

## Challenges & Future Enhancements

**Challenge:** Step counting accuracy varies by walk vs. run cadence.  
**Solution:** Tuned `STEP_THRESHOLD` (1.2g) + `STEP_COOLDOWN_MS` (400 ms) empirically on device.

**Future:** Integrate MapView route visualisation, heart-rate BLE sensor pairing, and cloud sync via a Node.js/Express backend.

---

## License
MIT
