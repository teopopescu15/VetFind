# Documentație tehnică – Aplicația SMA / VetFinder

Acest document descrie stack-ul tehnic, arhitectura și detaliile de implementare ale aplicației (frontend React Native + backend Node.js + baza de date PostgreSQL), pentru prezentare tehnică.

---

## 1. Prezentare generală

- **Tip aplicație:** multiplatformă (mobile + web) – pet owners (programări la clinici veterinaire) și clinici veterinaire (gestionare servicii, programări, recenzii).
- **Arhitectură:** client–server; frontend React Native (Expo), backend REST API Node.js, baza de date PostgreSQL.
- **Deployment:** development pe localhost (frontend port 8081, backend port 5000); production URL configurabil.

---

## 2. Frontend (React Native)

### 2.1 Stack principal

| Tehnologie | Versiune / Detalii | Rol |
|------------|--------------------|-----|
| **React Native** | 0.81.5 | Framework UI cross-platform (iOS, Android, Web) |
| **Expo** | ~54.0.24 | Build, tooling, OTA; rulează pe port 8081 |
| **React** | 19.1.0 | Library UI |
| **TypeScript** | ~5.9.2 | Tipizare statică (tsconfig: `expo/tsconfig.base`, `strict: true`) |

### 2.2 Navigare

| Pachet | Rol |
|--------|-----|
| `@react-navigation/native` | Container navigare |
| `@react-navigation/stack` | Stack navigator (ecrane push/pop) |
| `react-native-screens` | Native stack screens |
| `react-native-safe-area-context` | Safe area (notch, etc.) |

- **Structură:** un **Stack** principal; după autentificare, rute diferite pentru **user** (pet owner) vs **vetcompany** (clinici). Auth: `AuthNavigator` (Login/Signup); post-login: `AppNavigator` cu ecrane: Dashboard (User/Company), BookAppointment, MyAppointments, CreateCompany, CompanyDashboard, Settings, ManageServices, ManagePhotos, Reviews etc.

### 2.3 UI și stilizare

| Tehnologie | Rol |
|------------|-----|
| **React Native Paper** | Componente Material Design 3 (Button, Card, TextInput, Dialog, Chip, etc.) |
| **expo-linear-gradient** / **react-native-linear-gradient** | Gradienturi |
| **@expo/vector-icons** / **react-native-vector-icons** | Icoane (MaterialCommunityIcons, Ionicons) |

- **Teme:** `src/theme/` – culori, spacing, responsive (breakpoints); hook `useTheme()` pentru culori și layout adaptiv.
- **Accesibilitate:** utilitare în `src/utils/accessibility.ts` (labels, roles).

### 2.4 State management și context

- **React Context API** (fără Redux/MobX):
  - **AuthContext** – utilizator curent, login/logout, token, refresh token, persistare sesiune.
  - **CompanyContext** – datele companiei pentru utilizatorul tip vetcompany; cache în state + `refreshCompany()` pentru reîmprospătare.
- **State local:** `useState`, `useRef` în ecrane și componente; fără librărie globală de state.

### 2.5 Servicii și API

| Fișier / modul | Rol |
|----------------|-----|
| **`src/services/api.ts`** | Serviciu principal: `fetch` către backend; autentificare Bearer (token din localStorage pe web / AsyncStorage pe mobile); endpoint-uri pentru users, companies, services, appointments, routes, etc. |
| **`src/services/vetApi.ts`** | Wrapper peste API pentru „vet”: clinici, servicii, recenzii, programări (endpoint-uri `/api/vet/...`). |
| **`config/api.config.ts`** | Configurare `BASE_URL` (dev: `http://localhost:5000/api`; production: configurabil). |

- **Timeout:** 30s în config; header `Content-Type: application/json`; token atașat la requesturi autentificate.

### 2.6 Persistență și storage (frontend)

| Mecanism | Utilizare |
|----------|-----------|
| **AsyncStorage** (`@react-native-async-storage/async-storage`) | Mobile: `accessToken`, `refreshToken`, `userData` (setate din AuthContext). |
| **localStorage** (web) | Web: aceleași chei pentru token și userData; folosit și în `api.ts` pentru a citi tokenul la requesturi. |

- **Scop:** sesiune persistentă (reîncărcare, închidere browser/app); nu este cache pentru date de business (ex. liste clinici).

### 2.7 Caching pe frontend

- **Distanțe rute (Google Routes):**
  - **Hook:** `src/hooks/useRouteDistance.ts`.
  - **Implementare:** cache în memorie cu `useRef<Map<string, RouteDistance>>` – cheie `companyId`, valoare distanță/durată.
  - **Comportament:** la `fetchDistances(userLocation, companyIds, token)` se cer doar ID-urile care nu sunt deja în cache; rezultatele se adaugă în cache. Nu există TTL; cache-ul se golește explicit cu `clearCache()`.
  - **Utilizare:** în `UserDashboardScreen` – la pull-to-refresh se apelează `clearRouteCache()` apoi se refac fetch-urile.
- **Company (vetcompany):**
  - **Context:** `CompanyContext` păstrează în state obiectul `company` după prima încărcare; la `loadCompany()` se evită re-fetch dacă datele sunt deja încărcate. `refreshCompany()` forțează reîmprospătarea de la API.

Nu există React Query, SWR sau alt cache cu TTL/invalidare automată pentru restul datelor (clinici, programări etc.).

### 2.8 Hooks și utilitare

| Hook / Util | Locație | Rol |
|-------------|----------|-----|
| `useRouteDistance` | `src/hooks/useRouteDistance.ts` | Fetch + cache distanțe rute (Google Routes API). |
| `useLocation` | `src/hooks/useLocation.ts` | Locația utilizatorului (expo-location), permisiuni, refresh. |
| `useTheme` | `src/hooks/useTheme.ts` | Tema (culori, responsive). |
| `formatPriceRange` / `formatPrice` | `src/utils/currency.ts` | Afișare prețuri în lei (RON). |
| `dateHelpers`, `validation`, `romanianValidation` | `src/utils/` | Formatare date, validări, telefon/CUI românesc. |

### 2.9 Alte biblioteci frontend

- **expo-location** – geolocație (coordonate user pentru „clinici apropiate” și distanțe).
- **expo-image-picker** – alegere imagini (poze clinici).
- **Firebase (JavaScript SDK)** – doar **Firebase Storage**: încărcare imagini (poze companii); URL-urile returnate se salvează în backend. Config din `EXPO_PUBLIC_FIREBASE_*`.
- **Leaflet** + **@types/leaflet** – hărți pe **web** (componenta `LeafletMapWeb`).
- **@react-google-maps/api** – integrare Google Maps (dacă este folosită în anumite ecrane).
- **axios** – eventual requesturi HTTP (în paralel cu `fetch` din `api.ts`).
- **react-native-gesture-handler** – gesturi; folosit la rădăcină în `App.tsx` (`GestureHandlerRootView`).
- **react-native-webview** – WebView unde e nevoie.

### 2.10 Build și rulare

- **Scripturi (package.json):**
  - `npm run web` – Expo web pe port 8081.
  - `npm run android` / `npm run ios` – mobile.
  - `npm run start` – Expo dev server.
  - `npm run dev` – backend + frontend web concurent (concurrently).
- **Metro** – bundler React Native (`metro.config.js`).

---

## 3. Backend (Node.js)

### 3.1 Stack principal

| Tehnologie | Versiune | Rol |
|------------|----------|-----|
| **Node.js** | (runtime) | Server HTTP |
| **Express** | ^5.1.0 | Framework web, rute, middleware |
| **TypeScript** | ^5.9.3 | Cod sursă; compilat în `dist/` |
| **ts-node / tsx** | - | Rulare migrații și scripturi TS |

- **Config TypeScript (backend):** `target: ES2022`, `module: commonjs`, `outDir: ./dist`, `rootDir: ./src`, `strict: true`, `noImplicitAny`, `esModuleInterop`, etc.

### 3.2 Pachete backend

| Pachet | Rol |
|--------|-----|
| **pg** | Client PostgreSQL (connection pool). |
| **dotenv** | Variabile de mediu (`.env`). |
| **cors** | CORS pentru frontend (localhost 8081/8082, Expo, IP-uri locale). |
| **helmet** | Securitate headers HTTP; `crossOriginResourcePolicy` pentru imagini. |
| **morgan** | Logging requesturi HTTP. |
| **compression** | Comprimare răspunsuri. |
| **jsonwebtoken** | JWT pentru access token. |
| **bcryptjs** | Hash parole. |
| **multer** | Upload fișiere (poze companii pe disc). |
| **sharp** | Procesare imagini (redimensionare/optimizare la upload). |

### 3.3 Structură aplicație backend

- **Punct intrare:** `server.ts` – încarcă `.env`, conectează la baza de date, pornește `app` pe `0.0.0.0:5000`, health check, graceful shutdown (SIGTERM/SIGINT), închidere pool DB.
- **App Express:** `app.ts` – middleware (helmet, cors, compression, morgan, json, urlencoded), servire statică `/uploads`, rute API, `notFound` și `errorHandler`.

### 3.4 Rute API (prefix `/api`)

| Prefix | Fișier rute | Descriere |
|--------|--------------|-----------|
| `/api/auth` | auth.routes | Login, signup, refresh token, verify, logout. |
| `/api/users` | user.routes | CRUD user (profil, update). |
| `/api/companies` | company.routes, companyService.routes | CRUD companii; servicii per companie. |
| `/api/services` | companyService.routes (+ services) | Servicii, template-uri. |
| `/api/service-categories` | serviceCategory | Categorii și specializări servicii. |
| `/api/appointments` | appointments | Creare programări, listare, update, anulare, disponibilitate (slots). |
| `/api/routes` | routes | Distanțe/durată rută (Google Routes API). |
| `/api/vet` | vet.routes | Endpoint-uri „vet”: clinici (listă, by id, by city, nearby), recenzii, programări – compatibilitate cu frontend vet. |

### 3.5 Autentificare și autorizare

- **JWT (jsonwebtoken):**
  - **Access token** – emis la login/signup/refresh; folosit în header `Authorization: Bearer <token>`.
  - **Refresh token** – stocat în DB (`refresh_tokens`), folosit pentru a obține access token nou; expirare separată.
- **Middleware:** `auth.middleware.ts` – verifică Bearer token, decode JWT, atașează `req.user` (id, email, role). `requireRole(...roles)` restricționează după rol (ex. `vetcompany`, `user`).
- **Secret:** `JWT_SECRET` din `.env` (obligatoriu în producție).

### 3.6 Upload și imagini

- **Multer** – stocare pe disc în `uploads/companies/<companyId>/`; nume fișier: `photo_<timestamp>.<ext>`.
- **Sharp** – (opțional) redimensionare/optimizare la upload (ex. WebP).
- **Firebase Storage** – folosit din frontend pentru încărcare; backend poate primi doar URL-uri de la frontend și le salvează în DB (ex. `photo_urls` / câmpuri companie).

---

## 4. Baza de date (PostgreSQL)

### 4.1 Configurare

- **Client:** `pg` (Pool); config în `backend/src/config/database.ts`.
- **Variabile:** `DB_HOST`, `DB_PORT`, `DB_NAME`, `DB_USER`, `DB_PASSWORD` sau `DATABASE_URL`. Nume default DB: `VetFind`. Pool: max 20 clienți, idle timeout 30s, connection timeout 2s. SSL opțional în producție.

### 4.2 Migrări

- **Motor:** script Node `run-migrations.ts` (tsx) rulează fișiere SQL în ordine.
- **Locație:** `backend/src/migrations/`.
- **Fișiere relevante:** `001_create_database.sql` … `022_add_company_emergency_fields.sql` (inclusiv `005_create_vetfinder_tables.sql`, `011_create_appointments_reviews.sql`, etc.). Există și `verify-schema.sql` pentru verificare schema.

### 4.3 Entități principale (după migrări)

| Tabel / tip | Descriere |
|-------------|-----------|
| **users** | Utilizatori (email, parolă hash, rol: user / vetcompany, nume, telefon, adresă, coordonate, setări). |
| **refresh_tokens** | Token-uri de refresh (user_id, hash, expires_at). |
| **companies** | Clinici veterinaire (user_id owner, nume, adresă, coordonate, program, logo, poze, completed, emergency, rating, review_count etc.). |
| **company_services** | Servicii per companie (nume, preț min/max, durată, categorie/specializare, description). |
| **service_categories** / **specializations** | Categorii și specializări pentru servicii. |
| **appointments** | Programări (company_id, user_id, service_id, appointment_date, status: pending/confirmed/cancelled/completed/expired, notes, total_duration_minutes, deleted). |
| **appointment_services** | Legătură programări – servicii (pentru programări cu mai multe servicii). |
| **reviews** | Recenzii (company_id, user_id, rating, comment, appointment_id, professionalism, efficiency, friendliness, category etc.). |

- **Enum:** `appointment_status`: pending, confirmed, cancelled, completed, expired (după migrarea 017).

### 4.4 Indexuri (exemple)

- Appointments: company_id, user_id, service_id, appointment_date, status, (user_id, status), (company_id, appointment_date).
- Reviews: company_id, user_id.
- Companies: user_id, locație, etc.

---

## 5. Servicii externe

| Serviciu | Utilizare |
|----------|-----------|
| **Google Routes API** | Backend: `backend/src/services/googleRoutes.ts` – distanță/durată rută între punctul utilizator și clinici. Frontend: apelează `/api/routes` și folosește hook-ul `useRouteDistance` cu cache. |
| **Firebase Storage** | Frontend: încărcare imagini (poze companii); URL-uri persistate în backend. Config: `EXPO_PUBLIC_FIREBASE_*`. |

---

## 6. Sistem de caching – rezumat

| Locație | Tip | Ce se cachează | Invalidare |
|---------|-----|----------------|------------|
| **Frontend – useRouteDistance** | Cache în memorie (Map) | Distanțe/durata rută per companyId | `clearCache()` (ex. la pull-to-refresh pe dashboard). |
| **Frontend – CompanyContext** | State React | Company curent (vetcompany) | `refreshCompany()` sau logout. |
| **Frontend – Auth** | AsyncStorage / localStorage | Token + userData | La logout. |
| **Backend** | - | Nu există Redis sau cache aplicație; fiecare request citește din DB (sau din fișiere) conform logicii rutei. |

---

## 7. Securitate

- **Helmet** – securitate headers.
- **CORS** – origini permise explicit (localhost, Expo, IP-uri locale).
- **JWT** – access token scurt; refresh token în DB cu expirare.
- **Parole** – hash cu bcrypt.
- **Auth middleware** – protecție rute; roluri cu `requireRole`.

---

## 8. Mediu și deployment

- **Development:** Backend: `PORT=5000` (default), frontend Expo 8081; API URL: `http://localhost:5000/api` (sau `EXPO_PUBLIC_API_URL`).
- **Variabile importante backend:** `DB_*`, `DATABASE_URL`, `JWT_SECRET`, `PORT`, `NODE_ENV`; pentru Google Routes: config API key/credentials.
- **Variabile frontend:** `EXPO_PUBLIC_API_URL`, `EXPO_PUBLIC_FIREBASE_*`.

---

## 9. Testare și calitate cod

- **Playwright** – config în `playwright.config.ts` (teste E2E pe web).
- **TypeScript** – strict pe frontend și backend; tipuri în `src/types/` (auth, company, appointment, routes, vet, etc.).

---

Acest document poate fi folosit ca suport pentru o prezentare tehnică a aplicației (stack frontend/backend, baza de date, caching, autentificare, servicii externe și arhitectură generală).
