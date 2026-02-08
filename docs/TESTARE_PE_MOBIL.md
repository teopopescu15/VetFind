# Testare pe mobil (fără hosting)

Poți rula aplicația pe telefon sau emulator **fără să o hostezi** – totul rulează de pe calculatorul tău.

---

## 1. Expo Go pe telefon (recomandat)

### Ce ai nevoie
- Telefon (Android sau iPhone) și calculatorul pe **același Wi‑Fi**
- Pe telefon: aplicația **Expo Go** ([Android](https://play.google.com/store/apps/details?id=host.exp.exponent) / [iOS](https://apps.apple.com/app/expo-go/id982107779))

### Pași

1. **Pornește backend-ul** (în un terminal):
   ```bash
   npm run backend
   ```

2. **Pornește Expo** (în alt terminal):
   ```bash
   npm start
   ```
   Sau, dacă vrei direct pe Android:
   ```bash
   npm run android
   ```
   Sau pe iOS (doar pe Mac):
   ```bash
   npm run ios
   ```

3. **Pe telefon:**
   - Deschide **Expo Go**
   - **Android:** scanează codul QR din terminal sau din browser (Metro bundler)
   - **iPhone:** scanează cu camera și apasă pe linkul care apare

4. **Important – API pe rețea locală**  
   Backend-ul rulează pe `localhost:5000`. Pe telefon, `localhost` este telefonul, nu PC-ul. Trebuie să folosești IP-ul calculatorului:
   - Creează în root un fișier `.env` (sau `.env.local`) cu:
     ```
     EXPO_PUBLIC_API_URL=http://IP_TAU:5000/api
     ```
     Înlocuiește `IP_TAU` cu IP-ul PC-ului pe Wi‑Fi (ex: `192.168.1.10`). Găsești IP-ul cu:
     - Windows: `ipconfig` → „IPv4 Address”
     - Mac/Linux: `ifconfig` sau `ip addr`
   - Repornește Expo (`npm start`) după ce salvezi `.env`.

---

## 2. Mod tunnel (telefon și PC pe rețele diferite)

Dacă telefonul nu e pe același Wi‑Fi sau QR code nu merge:

```bash
npm run start:tunnel
```

sau (cu backend pornit în paralel):

```bash
npm run dev:tunnel
```

Expo folosește un tunnel (ngrok) și generează un URL public temporar. Scanezi QR code-ul cu Expo Go și aplicația se încarcă de pe PC prin tunnel – **tot fără hosting**.

**API în tunnel:** și aici, pe telefon, `localhost` nu e PC-ul. Fie folosești IP-ul PC-ului pe rețea (dacă e accesibil), fie expui temporar backend-ul prin tunnel (ex: ngrok pentru portul 5000) și pui în `.env`:
`EXPO_PUBLIC_API_URL=https://xxx.ngrok.io/api`.

---

## 3. Emulator / simulator (fără telefon fizic)

### Android
- Instalează [Android Studio](https://developer.android.com/studio) și creează un AVD (Device Manager → Create Virtual Device).
- Pornește emulatorul, apoi în proiect:
  ```bash
  npm run android
  ```
  Sau `npm start` și apasă `a` în terminal.

### iOS (doar pe Mac)
- Xcode instalat.
- Pornește simulatorul din Xcode sau după `npm start` apasă `i` în terminal.

În emulator, `localhost` este tot calculatorul, dar uneori trebuie `10.0.2.2:5000` (Android) sau `localhost:5000` (iOS Simulator). Dacă API-ul nu merge, pune în `.env`:
- Android emulator: `EXPO_PUBLIC_API_URL=http://10.0.2.2:5000/api`
- iOS Simulator: `EXPO_PUBLIC_API_URL=http://localhost:5000/api`

---

## Rezumat

| Metodă              | Comandă              | Hosting? |
|---------------------|----------------------|----------|
| Telefon + Wi‑Fi     | `npm start` + QR      | Nu       |
| Telefon + tunnel    | `npm run start:tunnel` | Nu     |
| Android emulator    | `npm run android`    | Nu       |
| iOS Simulator (Mac) | `npm run ios`        | Nu       |

Toate variantele rulează bundle-ul de pe PC; **nu e nevoie să hostezi** aplicația pe un server.
