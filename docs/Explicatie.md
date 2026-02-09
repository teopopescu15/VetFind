# Documentație: User Flow și Use Case-uri — VetFinder

Acest document descrie **fluxurile utilizator** (user flow) și **use case-urile** aplicației VetFinder, fără detalii de implementare tehnică.

---

## 1. Prezentare generală

**VetFinder** este o aplicație two-sided (două tipuri de utilizatori):

| Rol            | Denumire în UI              | Scop principal                                                                 |
|----------------|-----------------------------|-----------------------------------------------------------------------------------|
| **user**       | Stăpân de animal            | Găsește clinici veterinare, vede servicii și prețuri, face programări, lasă recenzii |
| **vetcompany** | Clinica veterinară          | Își creează profilul clinicii, gestionează servicii, prețuri, programări și recenzii  |

Rolul se alege **la înregistrare** și nu se poate schimba ulterior. După login, aplicația afișează un dashboard diferit în funcție de rol și, pentru clinici, în funcție de faptul dacă au deja un profil de companie.

---

## 2. User flow — rezumat

### 2.1 Utilizator neautentificat

```
[Deschide app] → [Login] sau [Înregistrare]
                          ↓
         (La înregistrare: alegi rol — Stăpân de animal sau Clinica veterinară)
                          ↓
         [Autentificare reușită]
                          ↓
         [Dashboard — în funcție de rol]
```

### 2.2 După login — ce vede utilizatorul

- **Stăpân de animal:** Dashboard cu listă de clinici, filtre, hartă, programări și setări.
- **Clinica veterinară fără profil:** Ecran care îi oferă să creeze profilul companiei (un singur buton principal: „Create Company Profile”) și buton de deconectare.
- **Clinica veterinară cu profil:** Dashboard-ul companiei (profil, servicii, prețuri, programări, recenzii, setări).

---

## 3. User flow — Stăpân de animal (user)

| Pas | Ecran / Acțiune |
|-----|------------------|
| 1 | **Login** sau **Înregistrare** — alegi rolul „Stăpân de animal”. Opțional la înregistrare: adresa de acasă (pentru filtrare pe distanță). |
| 2 | **Dashboard** — vezi lista de clinici (carduri cu nume, rating, distanță, prețuri). |
| 3 | **Filtrare și sortare** — poți filtra după distanță (500 m, 1 km, 5 km, 10 km), sorta după distanță, preț sau rating, sau căuta după text. |
| 4 | **Hartă** — vezi clinici pe hartă și locația ta; dai click pe o clinică pentru a merge la detalii. |
| 5 | **Detalii clinică** — vezi fotografii, descriere, servicii pe categorii, prețuri, program, facilități și metode de plată. |
| 6 | **Programare** — alegi serviciul, data din calendar și un slot orar disponibil, eventual adaugi note; confirmi programarea. |
| 7 | **Programările mele** — vezi programările viitoare și trecute; poți anula unde este cazul. |
| 8 | **Recenzie** — după o vizită, poți lăsa un rating (1–5 stele) și un comentariu la clinică (o recenzie per clinică). |
| 9 | **Setări** — îți poți actualiza numele, adresa de acasă și alte date de profil. |

---

## 4. User flow — Clinica veterinară (vetcompany)

| Pas | Ecran / Acțiune |
|-----|------------------|
| 1 | **Login** sau **Înregistrare** — alegi rolul „Clinica veterinară”. |
| 2 | **Fără profil** — dacă nu ai încă un profil de companie, vezi ecranul care te încurajează să îl creezi („Create Company Profile”). |
| 3 | **Creare profil companie** — parcurgi cei 4 pași: **Pas 1** (nume, logo, email, telefon, descriere, CUI), **Pas 2** (adresă completă, județ, localitate, cod poștal, program pe zile), **Pas 3** (tip clinică, categorii și specializări, facilități, metode de plată), **Pas 4** (prețuri și durate per serviciu, încărcare fotografii). La final trimiți și profilul este creat. |
| 4 | **Dashboard companie** — vezi cardul companiei, procentul de completare a profilului și butoane rapide: Servicii, Prețuri, Fotografii, Setări. |
| 5 | **Gestionare servicii** — adaugi, editezi sau ștergi servicii oferite de clinică. |
| 6 | **Gestionare prețuri** — actualizezi prețurile min/max și durata pentru fiecare serviciu. |
| 7 | **Gestionare fotografii** — încarci sau ștergi fotografii ale clinicii. |
| 8 | **Programări** — vezi toate programările; poți adăuga manual o programare, edita sau anula. |
| 9 | **Recenzii** — vezi recenziile și ratingurile lăsate de clienți. |
| 10 | **Setări companie** — editezi datele de profil ale companiei. |

---

## 5. Use case-uri

### 5.1 Autentificare

| ID | Use case | Actor | Precondiții | Flux principal | Postcondiții |
|----|----------|--------|--------------|----------------|---------------|
| UC-A1 | Login | Stăpân de animal / Clinica | Cont existent | Introdu email și parolă → confirmă → aplicația îl autentifică și îl duce la Dashboard | Utilizator autentificat; vede Dashboard-ul corespunzător rolului |
| UC-A2 | Înregistrare | Stăpân de animal / Clinica | Email necunoscut | Introdu nume, email, parolă, alege rol (Stăpân / Clinica) → confirmă → cont creat și redirecționat la Dashboard | Cont creat; utilizator autentificat |
| UC-A3 | Logout | Utilizator autentificat | - | Alege Deconectare → sesiunea se încheie → este dus la ecranul de Login | Utilizator neautentificat |

### 5.2 Stăpân de animal (user)

| ID | Use case | Actor | Precondiții | Flux principal | Postcondiții |
|----|----------|--------|--------------|----------------|---------------|
| UC-U1 | Vizualizare listă clinici | Stăpân de animal | Autentificat | Deschide Dashboard → vede carduri cu clinici (rating, distanță, prețuri) | Listă de clinici afișată |
| UC-U2 | Filtrare după distanță | Stăpân de animal | Autentificat | Alege o rază (500 m – 10 km) → lista se actualizează după distanță | Listă filtrată |
| UC-U3 | Vizualizare detalii clinică | Stăpân de animal | - | Dă click pe o clinică → vede pagina de detalii (servicii, program, prețuri, contact) | Pagină de detalii clinică afișată |
| UC-U4 | Programare la clinică | Stăpân de animal | Autentificat, a ales o clinică | Din detalii clinică → Programează → alege serviciu, dată, slot orar, note → confirmă | Programare creată; apare în „Programările mele” |
| UC-U5 | Vizualizare și anulare programări | Stăpân de animal | Autentificat | Mergi la Programările mele → vezi viitoare/trecute → poți anula o programare viitoare | Listă actualizată |
| UC-U6 | Lăsare recenzie | Stăpân de animal | Autentificat | După o vizită, pe pagina clinicii sau din flux dedicat → pune rating 1–5 și comentariu → trimite | Recenzie salvată; ratingul clinicii se actualizează |
| UC-U7 | Actualizare profil (adresă acasă) | Stăpân de animal | Autentificat | Setări → editează adresa și alte date → salvează | Profil actualizat |

### 5.3 Clinica veterinară (vetcompany)

| ID | Use case | Actor | Precondiții | Flux principal | Postcondiții |
|----|----------|--------|--------------|----------------|---------------|
| UC-V1 | Creare profil companie | Clinica | Autentificată, fără profil | Ecran „Create Company Profile” → parcurge cei 4 pași (date de bază, locație, servicii, prețuri și poze) → trimite | Profil companie creat; redirecționare la Dashboard companie |
| UC-V2 | Vizualizare dashboard companie | Clinica | Autentificată, cu profil | Deschide app după login → vede dashboard-ul cu card companie, procent completare, acțiuni rapide | Dashboard afișat |
| UC-V3 | Gestionare servicii | Clinica | Autentificată, are companie | Mergi la Servicii → adaugi, editezi sau ștergi servicii | Servicii actualizate |
| UC-V4 | Gestionare prețuri | Clinica | Autentificată, are servicii | Mergi la Prețuri → actualizezi preț și durată per serviciu | Prețuri actualizate |
| UC-V5 | Gestionare programări | Clinica | Autentificată | Mergi la Programări → vezi listă → adaugi programare manuală, editezi sau anulezi | Programări actualizate |
| UC-V6 | Vizualizare recenzii | Clinica | Autentificată | Mergi la Recenzii → vezi ratinguri și comentarii ale clienților | Listă de recenzii afișată |
| UC-V7 | Actualizare profil companie | Clinica | Autentificată | Setări companie → editezi datele companiei → salvezi | Profil companie actualizat |

---

## 6. Diagramă a fluxului după login

```
                    [Login / Înregistrare]
                                |
                    [Autentificare reușită]
                                |
                        [Dashboard]
                                |
         +----------------------+----------------------+
         |                                               |
   Stăpân de animal                            Clinica veterinară
         |                                               |
   [Dashboard user]                          [Are deja profil?]
   • Listă clinici                                  |
   • Filtre, hartă                    +--------------+--------------+
   • Programări mele                  |                             |
   • Setări                    Nu (fără profil)              Da (cu profil)
                                        |                             |
                              [Creează profil companie]    [Dashboard companie]
                              (4 pași)                       • Servicii, Prețuri
                                        |                    • Programări
                              [Dashboard companie]           • Recenzii, Setări
```

---

## 7. Detalii tehnice: distanțe, coordonate, hartă

Această secțiune explică **cum se calculează distanțele**, **cum se obțin și stochează coordonatele** și **cum funcționează harta** în aplicație.

### 7.1 Coordonate (latitude, longitude)

**Unde se folosesc**

- **Clinici:** fiecare companie are în baza de date câmpurile `latitude` și `longitude`. Ele sunt folosite pentru filtrare pe rază, pentru afișarea pe hartă și pentru calculul distanțelor.
- **Stăpân de animal:** poate salva o adresă de acasă (în Setări sau la înregistrare); din adresă se pot obține coordonate, folosite ca „punct de plecare” la filtrare pe distanță și pe hartă.

**Cum se obțin coordonatele**

| Context | Metodă | Detalii |
|--------|--------|--------|
| **Locația curentă (dispozitiv)** | **Expo Location** (`expo-location`) | Pe mobil: `Location.getCurrentPositionAsync()` cu `Accuracy.Balanced`. Pe web: `navigator.geolocation.getCurrentPosition()`. Returnează direct `latitude` și `longitude`. |
| **Adresă → coordonate (geocoding)** | **OpenStreetMap Nominatim** sau **Expo Location** | **Nominatim:** frontend-ul apelează `https://nominatim.openstreetmap.org/search` cu adresa ca parametru `q`; răspunsul JSON conține `lat` și `lon`. Folosit în Setări user, Setări companie și la înregistrare (buton „Obține coordonate din adresă”). **Expo:** la crearea companiei, dacă utilizatorul a completat adresa dar nu a introdus coordonate, la validarea Pas 2 se apelează `Location.geocodeAsync(adresa)` și se completează automat lat/lng. |
| **Formare adresă pentru geocoding** | Util `buildAddressForGeocoding()` | Din câmpurile românești (stradă, număr, bloc, apartament, oraș, județ, cod poștal, țară) se construiește un string de adresă, folosit la Nominatim sau la Expo geocode. |

Coordonatele sunt validate: latitudine între -90 și 90, longitudine între -180 și 180. Clinici fără coordonate nu apar în filtrele pe distanță și nu sunt incluse în calculul rutat (Google Routes).

---

### 7.2 Calculul distanței

În aplicație există **două moduri** de a obține „distanța” până la o clinică.

#### A) Distanță „în linie dreaptă” (Haversine)

- **Unde:** în **frontend** (hook `useLocation`) și în **backend** la căutarea cliniciilor pe rază.
- **Formula:** Haversine — distanța pe sfera terestră între două puncte (lat1, lon1) și (lat2, lon2). Raza Pământului folosită: **6371 km**.
- **Frontend:** funcția `calculateDistance(lat1, lon1, lat2, lon2)` returnează distanța în km, rotunjită la o zecimală. Folosită când nu e disponibilă distanța rutată (ex. listă simplă, sortare rapidă).
- **Backend:** la **filtrarea pe rază** (când user-ul alege 500 m, 1 km etc.), interogarea SQL folosește aceeași formulă Haversine în `WHERE`: se calculează distanța de la (lat, lon) utilizator la fiecare clinică și se păstrează doar clinici cu `distance_km <= radius_km`. Rezultatul include și câmpul `distance_km` pentru sortare (cele mai apropiate primele).

#### B) Distanță rutată (mașină) — Google Routes API

- **Unde:** backend-ul apelează **Google Routes API** (Distance Matrix v2, `computeRouteMatrix`). Frontend-ul trimite locația user-ului și ID-urile clinicilor; backend-ul returnează distanță în metri și durată în secunde pentru fiecare pereche (user → clinică).
- **Cum:** 
  - Endpoint: **POST /api/routes/distances** (autentificat). Body: `{ userLocation: { latitude, longitude }, companyIds: string[] }`.
  - Backend preia coordonatele clinicilor din baza de date, construiește request-ul către Google (origin = user, destinations = clinici), mod de deplasare **DRIVE**, preferință **TRAFFIC_UNAWARE**.
  - Răspunsul este parsat (inclusiv format newline-delimited JSON dacă e cazul); pentru fiecare destinație se extrag `distanceMeters` și `duration` (ex. `"420s"`), convertite în km și text (ex. „7 min”).
- **Frontend:** hook-ul `useRouteDistance` păstrează un **cache** (Map companyId → rezultat); apelează `fetchDistances(userLocation, companyIds, accessToken)` doar pentru ID-uri care nu sunt deja în cache. Astfel se evită apeluri repetate la Google. Cache-ul se poate goli la schimbarea locației sau la pull-to-refresh.
- **Configurare:** este nevoie de **GOOGLE_MAPS_API_KEY** în mediul backend. Dacă cheia lipsește, serviciul nu e configurat și distanțele rutate nu sunt calculate; aplicația poate folosi doar Haversine.

Rezumat: **Haversine** = distanță geometrică (rapidă, fără API extern); **Google Routes** = distanță și durată pe șosea (mai realistă, necesită cheie API și este folosită opțional, cu cache).

---

### 7.3 Harta (Leaflet, „flat” / 2D)

Harta din dashboard-ul stăpânului de animal este o **hartă 2D** („flat” = fără 3D, fără relief), afișată cu **Leaflet**.

**Tehnologii**

- **Leaflet** (v1.9.4): bibliotecă JavaScript pentru hărți interactive. Se încarcă fie din npm (`require('leaflet')`), fie din CDN (`unpkg.com/leaflet`).
- **Tiles:** straturile de imagine ale hărții vin de la **OpenStreetMap**: URL-ul este `https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png` (sistemul standard de tile-uri OSM). Nu este nevoie de cheie API pentru acest layer.

**Unde se randează**

- **Pe web:** componenta **LeafletMapWeb**: un `<div>` cu ref; în `useEffect` se creează instanța `L.map(div)` cu centrul dat (lat, lon) și zoom 14, se adaugă tile layer-ul OSM, apoi markeri.
- **Pe mobil (iOS/Android):** nu există componentă Leaflet nativă; se folosește un **WebView** care încarcă un document HTML inline. În acel HTML sunt incluse CSS-ul și JS-ul Leaflet de pe CDN; logica este aceeași: `L.map`, tile OSM, markeri pentru user și pentru clinici. Comunicarea „click pe clinică” se face prin `postMessage` din WebView către React Native (eveniment `onMessage`).

**Ce se afișează**

- **Centru:** fie locația curentă a utilizatorului (GPS), fie adresa de acasă (coordonate din profil), cu etichete „You” / „Home” / „My Location”.
- **Markeri clinici:** doar clinici care au `latitude` și `longitude` valide. Fiecare e desenat ca **circleMarker** (cerc roșu); la click se deschide popup cu numele și se notifică aplicația (navigare la detalii clinică).
- **Fit bounds:** după adăugarea markerilor, se apelează `map.fitBounds(group.getBounds().pad(0.25))` astfel încât toate punctele (user + clinici) să fie vizibile în view, cu un mic padding.

**De ce „flat”:** harta folosește doar proiecție 2D (ecran) și tile-uri imagine; nu există mod 3D sau relief. Este o hartă clasică, ușor de integrat și fără dependențe de Google Maps în această parte.

---

*Document: User flow, use case-uri și detalii tehnice (distanțe, coordonate, hartă) — VetFinder.*
