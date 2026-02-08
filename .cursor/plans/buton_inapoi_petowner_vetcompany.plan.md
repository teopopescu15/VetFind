# Plan: Buton Înapoi pe toate paginile (în afară de Dashboard)

## Scop
Pe profilul **Pet Owner** și **Vet Company**, toate paginile în afară de dashboard să aibă un **buton Înapoi** în partea de sus stânga care redirecționează utilizatorul către pagina de pe care a venit. Pe **Dashboard** (UserDashboard / CompanyDashboard) nu se afișează niciun buton de înapoi.

## Context tehnic
- **Navigare**: React Navigation (Stack), `headerShown: false` global în `AppNavigator.tsx`, deci fiecare ecran își desenează propriul header.
- **Redirecționare**: `navigation.goBack()` – revine la ecranul anterior din stack (pagina de pe care a venit utilizatorul).

---

## 1. Ecrane care AU deja buton Înapoi (nu necesită modificări)

| Ecran | Rol | Locație buton |
|-------|-----|----------------|
| **MyAppointmentsScreen** | Pet Owner | Header cu `TouchableOpacity` + `navigation.goBack?.()` |
| **VetCompanyDetailScreen** | Pet Owner | `headerBar` cu `navigation.goBack()` |
| **BookAppointmentScreen** | Pet Owner | `headerSection` cu `navigation.goBack()` |
| **CompanyManageAppointmentsScreen** | Vet Company | Header cu `IconButton` + `navigation.goBack()` |
| **CompanyAddAppointmentScreen** | Vet Company | Header cu `IconButton` + `navigation.goBack()` |
| **CompanyReviewsScreen** | Vet Company | Header cu `TouchableOpacity` + `navigation.goBack()` |

---

## 2. Ecrane fără buton Înapoi – de modificat

### 2.1 Pet Owner

| Ecran | Fișier | Modificare |
|-------|--------|------------|
| **UserSettingsScreen** | `src/screens/UserSettingsScreen.tsx` | Adaugă o bară de header deasupra conținutului (SafeAreaView) cu buton în stânga: icon `arrow-back` sau `chevron-back`, `onPress={() => navigation.goBack()}`. Titlul „Setări” rămâne în dreapta butonului. Folosește `useNavigation()` din `@react-navigation/native` dacă ecranul nu primește `navigation` din props. |

### 2.2 Vet Company

| Ecran | Fișier | Modificare |
|-------|--------|------------|
| **CompanySettingsScreen** | `src/screens/CompanySettingsScreen.tsx` | La fel ca UserSettingsScreen: header cu buton în stânga (arrow-back) + titlu „Setări clinică”, `navigation.goBack()`. Adaugă `useNavigation()` dacă e cazul. |
| **ManageServicesScreen** | `src/screens/ManageServicesScreen.tsx` | În `headerSection` (Surface), adaugă în stânga un `TouchableOpacity` sau `IconButton` cu săgeată înapoi care apelează `navigation.goBack()`. Folosește `useNavigation()`. |
| **ManagePricesScreen** | `src/screens/ManagePricesScreen.tsx` | În `headerSection`, adaugă buton înapoi în stânga (icon arrow-back + `navigation.goBack()`). Adaugă `useNavigation()`. |
| **ManagePhotosScreen** | `src/screens/ManagePhotosScreen.tsx` | În `header`, adaugă în stânga un buton înapoi (icon arrow-back) cu `navigation.goBack()`. Asigură-te că ecranul folosește `useNavigation()` (verifică dacă există deja). |
| **CreateCompanyScreen** | `src/screens/CreateCompanyScreen.tsx` | Adaugă o bară de header fixă în partea de sus a ecranului (deasupra step-urilor) cu un singur buton în stânga: săgeată înapoi, `onPress={() => navigation.goBack()}`. Butonul „Înapoi” de jos rămâne pentru „pasul anterior”; noul buton din header închide wizard-ul și revine la ecranul anterior (ex. Dashboard). |

### 2.3 Ecrane speciale (fără buton Înapoi din design)

| Ecran | Motiv |
|-------|--------|
| **CompanyCreatedSuccessScreen** | După crearea companiei există doar „View Dashboard”; nu se expune buton Înapoi (gestureEnabled: false deja în navigator). Poți lăsa așa. |
| **Dashboard** (root), **UserDashboardScreen**, **CompanyDashboardScreen** | Conform cerinței: pe dashboard nu există buton de înapoi. |

---

## 3. Implementare recomandată

### 3.1 Componentă reutilizabilă (opțional, recomandat)
Crearea unui component **BackHeader** sau **ScreenHeaderWithBack** în `src/components/`:
- Props: `title?: string`, `onBack?: () => void` (default: `navigation.goBack()`), eventual `titleStyle`, `backgroundColor`.
- Conține: un `TouchableOpacity` / `Pressable` în stânga cu icon `Ionicons name="arrow-back"` (sau `chevron-back`) și opțional un `Text` pentru titlu.
- Utilizare: pe ecranele care nu au header custom complex, înlocuiești zona de header cu `<BackHeader title="Setări" />`.

Beneficii: aspect uniform, un singur loc pentru accesibilitate (accessibilityLabel „Înapoi”) și pentru eventuale ajustări viitoare.

### 3.2 Pași concreti pe fiecare ecran

1. **UserSettingsScreen**
   - Import: `useNavigation` din `@react-navigation/native`, `TouchableOpacity` din `react-native`, `Ionicons`.
   - Înainte de `<View style={styles.header}>`, adaugă un rând cu buton înapoi (stânga) + icon settings + titlu „Setări” (sau pune butonul în același rând cu icon și titlu).
   - Exemplu structură: `[TouchableOpacity back] [Icon] [Text Setări]`.

2. **CompanySettingsScreen**
   - Același pattern ca la UserSettingsScreen: header cu back + icon + „Setări clinică”.

3. **ManageServicesScreen**
   - În `headerSection`, schimbă layout-ul la: `[IconButton/TouchableOpacity back] [Icon clipboard-text] [View cu title + subtitle]`.
   - `useNavigation<StackNavigationProp<RootStackParamList, 'ManageServices'>>()` și `goBack()` la press.

4. **ManagePricesScreen**
   - În `headerSection`: adaugă în stânga un buton înapoi, păstrează icon + „Update Prices”.
   - `useNavigation()` + `goBack()`.

5. **ManagePhotosScreen**
   - În `header`: layout `[TouchableOpacity back] [Text title]`.
   - Verifică dacă există deja `useNavigation`; dacă nu, adaugă-l și folosește `goBack()`.

6. **CreateCompanyScreen**
   - Adaugă un View fix în top (sub SafeAreaView dacă există, sau primul copil al containerului) cu înălțime ~48–56, background alb/gri, flexDirection row, alignItems center, paddingHorizontal 16.
   - Un singur element în stânga: TouchableOpacity cu Ionicons arrow-back, onPress: `() => navigation.goBack()`.
   - Conținutul step-urilor rămâne dedesubt; butoanele „Înapoi” / „Următorul” de jos rămân neschimbate.

### 3.3 Consistență vizuală
- Icon: `Ionicons name="arrow-back"` sau `"chevron-back"` (ca pe MyAppointmentsScreen / VetCompanyDetailScreen).
- Mărime: 22–24px.
- Culoare: aliniată la tema ecranului (alb pe header colorat, gri închis pe fundal alb).
- Zone de atingere: minim ~44px înălțime/lățime pentru accesibilitate.

### 3.4 Edge cases
- **Web / deep link**: La `goBack()`, dacă nu există ecran în stack, React Navigation poate face pop până la rădăcină; pe web, dacă utilizatorul a deschis direct un URL (ex. `/dashboard/user/settings`), `goBack()` poate duce în afara app-ului. Opțional: pe ecrane critice poți verifica `navigation.canGoBack()` și dacă e false să afișezi alt comportament (ex. navigare explicită la UserDashboard sau CompanyDashboard).
- **CreateCompany**: Butonul din header închide wizard-ul; dacă vrei confirmare „Sigur vrei să ieși?”, poți folosi `Alert.alert` înainte de `goBack()`.

---

## 4. Rezumat checklist

- [ ] UserSettingsScreen – buton înapoi stânga sus
- [ ] CompanySettingsScreen – buton înapoi stânga sus
- [ ] ManageServicesScreen – buton înapoi în headerSection
- [ ] ManagePricesScreen – buton înapoi în headerSection
- [ ] ManagePhotosScreen – buton înapoi în header
- [ ] CreateCompanyScreen – bară header cu buton înapoi (închide wizard)
- [ ] (Opțional) Componentă BackHeader pentru refolosire și consistență
- [ ] Fără modificări pe UserDashboard, CompanyDashboard, Dashboard, CompanyCreatedSuccess (conform cerinței)
- [ ] Ecranele care au deja buton (MyAppointments, VetCompanyDetail, BookAppointment, CompanyManageAppointments, CompanyAddAppointment, CompanyReviews) – doar verificate, fără schimbări

După implementare, testează pe ambele profile (pet owner și vet company) că pe toate paginile (în afară de dashboard) butonul Înapoi apare și redirecționează corect către pagina anterioară.
