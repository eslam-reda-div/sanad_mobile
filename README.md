# SANAD Mobile App

**SANAD** — Patient Home Monitoring Mobile Application

A React Native mobile app for patients to manage their home monitoring devices, helpers, and calls. Built with **Expo** (SDK 54), TypeScript, and file-based routing.

---

## 📋 Project Overview

This app allows patients to:

- Register and log in securely using JWT tokens stored in secure storage
- Scan device QR codes to assign devices
- Trigger calls to home monitoring devices
- Manage helpers (add, edit, delete, reorder)
- View calls list (customer calls and helper calls)
- View and manage devices
- Edit profile and logout

---

## 🛠 Tech Stack

- **React Native** (Expo SDK ~54)
- **Expo Router** (file-based routing)
- **TypeScript**
- **Zustand** (state management)
- **React Query** (optional for API caching)
- **React Hook Form + Yup** (form validation)
- **Axios** (API client)
- **Expo Secure Store** (token storage)
- **Expo Barcode Scanner** (QR scanning)
- **React Native Draggable Flatlist** (helpers reorder)
- **Jest + React Testing Library** (unit/integration tests)

---

## 📦 Installation & Setup

### Prerequisites

- **Node.js** >= 18
- **npm** or **yarn**
- **Expo CLI** (optional, but recommended)

### Steps

1. **Clone the repository** (or extract the project):

   ```powershell
   cd c:\Users\eslam\Desktop\sanad\sanad_mobile
   ```

2. **Install dependencies**:

   ```powershell
   npm install
   ```

   or

   ```powershell
   yarn install
   ```

   > **Note**: Some packages like `expo-barcode-scanner`, `react-hook-form`, `yup`, `@hookform/resolvers`, `zustand`, `axios`, and `expo-secure-store` have been added to `package.json` but must be installed using the command above.

3. **Environment Variables (optional)**:

   Create a `.env` file at the project root if you want to override the API base URL:

   ```
   API_BASE_URL=https://your-api-endpoint.com
   ```

   By default, the API client points to `https://api.example.com` (which is a placeholder). You can modify `src/api/client.ts` to use your real backend.

4. **Start the development server**:

   ```powershell
   npm start
   ```

   or

   ```powershell
   expo start
   ```

   This will open the Expo Dev Tools in your browser. You can run the app on:

   - **iOS Simulator** (macOS only)
   - **Android Emulator** (or physical device)
   - **Web** (for quick testing)

5. **Run on device/emulator**:

   - For Android: `npm run android` or `expo start --android`
   - For iOS: `npm run ios` or `expo start --ios`
   - For Web: `npm run web` or `expo start --web`

---

## 🗂 Project Structure

```
sanad_mobile/
├── app/                     # Expo Router file-based routes
│   ├── _layout.tsx          # Root layout with auth check
│   ├── (tabs)/              # Bottom tabs group
│   │   ├── _layout.tsx      # Tabs layout (6 tabs)
│   │   ├── home.tsx         # Home screen
│   │   ├── helpers.tsx      # Helpers list/manage
│   │   ├── calls.tsx        # Customer calls list
│   │   ├── helpers-calls.tsx# Helper calls list
│   │   ├── devices.tsx      # Devices list/manage
│   │   └── profile.tsx      # Profile & logout
│   ├── auth/                # Auth stack
│   │   ├── _layout.tsx      # Auth layout
│   │   ├── splash.tsx       # Splash screen (token check)
│   │   ├── login.tsx        # Login form
│   │   └── register.tsx     # Registration form
│   ├── modal.tsx            # Example modal
│   └── +not-found.tsx       # 404 screen
├── components/              # Reusable UI components
│   ├── QRScannerModal.tsx   # QR scanner modal (stub)
│   ├── Themed.tsx           # Themed components
│   └── ...
├── src/
│   ├── api/
│   │   ├── client.ts        # Axios API client
│   │   └── mockServer.ts    # Mock API functions (for dev)
│   └── store/
│       └── authStore.ts     # Zustand auth store
├── constants/               # Colors, theme
├── assets/                  # Images, fonts
├── package.json
├── tsconfig.json
├── app.json                 # Expo config
└── README.md                # This file
```

---

## 🔑 Authentication & Secure Storage

- **Auth flow**: On app launch, the root layout checks for a token in secure storage (`expo-secure-store`).
- **Login/Register**: Forms validate with `react-hook-form` + `yup`. On success, token and user are stored and the app navigates to Home.
- **Logout**: Clears token and navigates to login screen.
- **Navigation Guard**: Uses Expo Router segments to redirect unauthenticated users to `/auth/login`.

---

## 📡 API Integration

### Current Setup (Mock)

The app uses in-memory mock functions (`src/api/mockServer.ts`) to simulate backend responses. This allows UI development without a real backend.

### Switching to Real API

1. Update `src/api/client.ts` with your real API base URL.
2. Replace calls to `mockServer.*` in screens with calls to your API client (using axios).
3. Handle token refresh and error handling (401, 403, etc.) in `client.ts`.

### Example Endpoints (as per spec)

- `POST /auth/register` → `{ token, user }`
- `POST /auth/login` → `{ token, user }`
- `GET /users/me` → `{ user }`
- `GET /helpers` → `[{ id, name, phone, relationship, priority }]`
- `POST /helpers` → `{ helper }`
- `PUT /helpers/:id` → `{ helper }`
- `DELETE /helpers/:id`
- `PUT /helpers/reorder` → `{ success }`
- `GET /devices` → `[{ uuid, image, version, customer_id }]`
- `POST /devices/assign` → `{ device }`
- `DELETE /devices/:uuid`
- `GET /calls` → `[call objects]`
- `POST /calls/trigger` → `{ uuid, twilio_call_sid, status }`
- `GET /helpers-calls` → `[helper call objects]`

---

## 📱 Screens & Features

### Home (`/home`)

- Summary card showing helpers and devices count
- **Trigger Call** button (calls `POST /calls/trigger`)
- **Scan Device QR** button (opens QR scanner modal)

### Helpers (`/helpers`)

- List of helpers with add/edit/delete actions
- Modal form for adding/editing helper (name, phone, relationship, priority)
- **Fully functional drag-and-drop reorder** with react-native-draggable-flatlist
- Reorder persists via API call to `reorderHelpers`
- Visual feedback when dragging (cardActive style)

### Calls (`/calls`)

- List of customer calls as cards showing key fields
- Navigate to **Call Detail Screen** with all 16+ fields
- Pull-to-refresh functionality
- Pagination ready (currently loads all calls)

### Helpers Calls (`/helpers-calls`)

- List of helper calls as cards
- Navigate to **Helper Call Detail Screen** with all fields
- Pull-to-refresh functionality

### Devices (`/devices`)

- Grid/list of devices (uuid, version, delete button)
- Delete device with confirmation dialog
- **Fully functional QR scanner** using expo-barcode-scanner
- Camera permissions configured for iOS & Android
- UUID validation before device assignment
- Success/error feedback with alerts

### Profile (`/profile`)

- Display all user profile fields (name, email, phone, age, disability, location)
- **Edit Profile** modal with validation for all editable fields
- **Change Password** modal with old/new/confirm password validation
- **Logout** button with confirmation dialog
- Profile updates sync with auth store automatically

### Auth Screens (`/auth/login`, `/auth/register`)

- **Login**: email + password with yup validation
- **Register**: Complete form with 8 fields:
  - name, email, phone, age, disability, location
  - password + confirm password matching validation
- All fields properly validated with react-hook-form + yup
- User data including age, disability, location stored on registration
- Automatic navigation to Home on success
- TypeScript type-safe throughout

---

## 🧪 Testing

### Unit Tests

The project is configured with **Jest** and **React Testing Library**.

Run tests:

```powershell
npm test
```

or

```powershell
yarn test
```

### E2E Tests (Optional)

You can add Detox or use Expo's E2E testing tools for integration tests.

---

## 🎨 UI & Accessibility

- **Color scheme**: Calming blues, soft grays, white. Accent color for CTAs.
- **Accessible**: All interactive elements have `accessibilityLabel` and `accessibilityRole`.
- **Large touch targets** (>= 44px) for elderly users.
- **Loading states**, **error handling**, **confirmation dialogs** for destructive actions.

---

## 🚀 Build & Deployment

### Development Build (local)

```powershell
npm start
```

### Production Build

1. **EAS Build** (recommended):

   ```powershell
   npm install -g eas-cli
   eas login
   eas build --platform all
   ```

2. **Expo Build** (classic):

   ```powershell
   expo build:android
   expo build:ios
   ```

For more details, see [Expo Build Documentation](https://docs.expo.dev/build/introduction/).

---

## 📖 Additional Documentation

- **Expo Router**: [https://docs.expo.dev/router/](https://docs.expo.dev/router/)
- **React Hook Form**: [https://react-hook-form.com/](https://react-hook-form.com/)
- **Yup**: [https://github.com/jquense/yup](https://github.com/jquense/yup)
- **Zustand**: [https://zustand-demo.pmnd.rs/](https://zustand-demo.pmnd.rs/)
- **Expo Barcode Scanner**: [https://docs.expo.dev/versions/latest/sdk/bar-code-scanner/](https://docs.expo.dev/versions/latest/sdk/bar-code-scanner/)

---

## 📝 Current Status & Completed Features

### ✅ Fully Implemented

1. **Authentication System**

   - ✅ Login with email/password validation (react-hook-form + yup)
   - ✅ Registration with all 8 fields (name, email, phone, age, disability, location, password, confirmPassword)
   - ✅ Secure token storage with expo-secure-store
   - ✅ Auth guard in root layout with automatic navigation
   - ✅ Splash screen placeholder

2. **Navigation Structure**

   - ✅ 6 bottom tabs (Home, Helpers, Calls, Helper Calls, Devices, Profile)
   - ✅ Auth stack with login/register
   - ✅ Detail screens for calls and helper calls
   - ✅ Typed routes with expo-router
   - ✅ GestureHandlerRootView properly configured at root level

3. **Home Screen**

   - ✅ Summary card with helpers & devices count
   - ✅ Trigger Call button (integrated with mock API)
   - ✅ Scan QR button with fully functional QR scanner
   - ✅ Camera permissions configured in app.json

4. **Helpers Management**

   - ✅ List all helpers with add/edit/delete
   - ✅ Modal form with validation
   - ✅ **Drag-and-drop reorder** using react-native-draggable-flatlist (iOS/Android only)
   - ✅ Reorder API call to persist new order
   - ℹ️ Note: Drag-and-drop is disabled on web; use native apps (iOS/Android) for this feature
   - ✅ All CRUD operations work on all platforms

5. **Calls Management**

   - ✅ List customer calls with pagination support
   - ✅ Pull-to-refresh functionality
   - ✅ Navigate to detailed call view
   - ✅ Call detail screen showing all 16+ fields:
     - uuid, customer_id, device_id, twilio_call_sid, status
     - initiated_at, ringing_at, answered_at, completed_at
     - duration_seconds, help_requested, outcome
     - trigger_metadata, call_metadata, error_message, retry_count

6. **Helper Calls**

   - ✅ List helper calls
   - ✅ Navigate to detailed helper call view
   - ✅ Helper call detail screen with all fields:
     - uuid, helper_id, customer_id, customer_call_id
     - twilio_call_sid, reason, priority, status
     - timestamps, duration, accepted status, response

7. **Devices Management**

   - ✅ Grid view of assigned devices (uuid, version)
   - ✅ Delete device with confirmation dialog
   - ✅ QR scanner for assigning devices
   - ✅ expo-barcode-scanner fully integrated
   - ✅ UUID validation regex client-side
   - ✅ Camera permissions (iOS & Android) in app.json

8. **Profile Management**

   - ✅ View all profile fields (name, email, phone, age, disability, location)
   - ✅ **Edit profile** modal with validation
   - ✅ All fields editable (name, phone, age, disability, location)
   - ✅ **Change password** modal with old/new/confirm validation
   - ✅ Logout with confirmation dialog
   - ✅ Profile updates persist to auth store

9. **API & State Management**

   - ✅ Zustand store for auth state with secure storage
   - ✅ Mock API server with all endpoints implemented:
     - authLogin, authRegister, updateProfile, changePassword
     - getHelpers, addHelper, updateHelper, deleteHelper, reorderHelpers
     - getDevices, assignDevice, deleteDevice
     - getCalls, triggerCall, getHelpersCalls
   - ✅ Axios client with automatic token attachment
   - ✅ User type includes all fields (age, disability, location)

10. **Development & Testing**
    - ✅ Jest configuration
    - ✅ Sample test (HomeScreen.test.tsx)
    - ✅ TypeScript throughout with zero compile errors
    - ✅ Comprehensive README with setup instructions
    - ✅ All npm packages installed and configured

### 🔄 Optional Enhancements (Not Required by Spec)

- [ ] Avatar upload with image picker
- [ ] Push notifications for call alerts
- [ ] React Query for advanced caching
- [ ] Offline request queue
- [ ] Dark mode support
- [ ] Advanced filtering & search in calls lists
- [ ] Comprehensive E2E tests with Detox

---

## 📝 Migration to Real API

The app is fully functional with mock data. To connect to a real backend:

1. Update `src/api/client.ts` with your real API base URL
2. Replace `mockServer.*` calls in screens with API client calls
3. Ensure backend endpoints match the contract (see API Integration section)
4. Handle token refresh for 401 responses
5. Test all flows with real data

---

## 📝 TODO / Next Steps

- [x] Install packages and test auth flow
- [x] Implement QR scanner using `expo-barcode-scanner`
- [ ] Integrate real backend API endpoints
- [x] Add drag-and-drop reorder for helpers using `react-native-draggable-flatlist`
- [x] Implement profile edit and change password
- [ ] Add avatar upload with expo-image-picker
- [ ] Add push notifications for call alerts
- [x] Write basic unit tests for critical components
- [ ] Add dark mode support
- [ ] Implement offline caching with React Query

---

## 🙏 Acknowledgements

This app is built using **Expo** and **React Native** with a focus on accessibility, performance, and patient-friendly design.

**Author**: SANAD Development Team  
**License**: Private

---

## 📞 Support

For questions or issues, please contact the development team or open an issue in the repository.

---

**Enjoy building SANAD! 🎉**
