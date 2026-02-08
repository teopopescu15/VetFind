# Pitch & Demo Aplicație VetFinder — 7 minute

Document pentru prezentarea aplicației: **scop**, **diferentiatori**, **utilizare**, **monetizare** și **script demo** de 7 minute.

---

## 1. Scopul aplicației

**VetFinder** este o platformă two-sided care leagă **stăpânii de animale** de **clinici / cabinete veterinare** din România.

- **Pentru stăpânii de animale:** Găsești rapid clinici veterinare apropiate, vezi servicii și prețuri, programezi programări și lași recenzii.
- **Pentru clinici:** Îți creezi un profil complet (locație, servicii, prețuri, program), primești programări și îți construiești reputația prin recenzii.

**Problema rezolvată:** În România lipsește un hub centralizat unde proprietarii să compare clinici după locație, specializări, prețuri și rating, iar clinici să fie vizibile și ușor de contactat/rezervat.

---

## 2. Diferentiatori

| Diferentiator | Descriere |
|---------------|-----------|
| **Focalizare 100% România** | Adresă pe județ, localitate, cod poștal, CUI, validare telefon românesc; interfață și etichete în română (inclusiv traduceri pentru categorii/specializări). |
| **Structură servicii clară** | Categorii (îngrijire de rutină, dentară, diagnostice, urgențe, chirurgicale, toaletare) + specializări cu preț min/max și durată; servicii personalizate (custom) per clinică. |
| **Căutare pe distanță** | Filtru pe rază (500 m, 1 km, 5 km, 10 km) față de locația utilizatorului; sortare după distanță, preț sau rating. |
| **Hartă** | Hartă Leaflet cu puncte pentru clinici și locația utilizatorului; fără cheie Google Maps. |
| **Programări cu sloturi** | Calendar + sloturi orare disponibile; programări confirmate/anulate/trecute; gestionare din dashboard-ul clinici. |
| **Recenzii și rating** | Rating 1–5 stele + comentariu per utilizator per clinică; rating mediu și număr recenzii afișate pe carduri și pe pagina clinicii. |
| **Profil clinică complet** | Un singur flux în 4 pași: date de bază → locație & program → servicii & specializări → prețuri & poze; indicator de completare profil. |
| **Cross-platform** | Aplicație React Native (Expo): web, iOS, Android din același cod; deep links pentru web. |
| **Două roluri clare** | La înregistrare: „Stăpân de animal” sau „Clinica veterinară”; dashboard-uri dedicate (User vs Company). |

---

## 3. Utilizare (user flows)

### 3.1 Stăpân de animal (User)

1. **Înregistrare / Login** — alegi rol „Stăpân de animal”, opțional adresă de acasă (pentru distanță).
2. **Dashboard** — listă clinici (carduri cu nume, rating, distanță, prețuri); filtru distanță; căutare; hartă; sortare (distanță, preț, rating).
3. **Detalii clinică** — foto, descriere, servicii pe categorii, prețuri, program, facilități, metode de plată; buton „Programează”.
4. **Programare** — alegi serviciul, data din calendar, slot orar; note opționale; confirmare.
5. **Programările mele** — listă programări viitoare / trecute; anulare unde e cazul.
6. **Recenzie** — după vizită, poți lăsa rating + comentariu la clinică (o recenzie per user per clinică).

### 3.2 Clinica veterinară (VetCompany)

1. **Înregistrare / Login** — alegi rol „Clinica veterinară”.
2. **Creare profil (dacă nu există)** — ecran „Your Vet Company Awaits!” → „Create Company Profile”.
3. **Flux în 4 pași:**
   - **Pas 1:** Nume, logo, email, telefon, descriere, CUI.
   - **Pas 2:** Adresă (stradă, nr, bloc, apartament, oraș, județ, cod poștal), site, program (L–D).
   - **Pas 3:** Tip clinică, categorii & specializări (din lista din baza de date), facilități, metode de plată.
   - **Pas 4:** Prețuri per serviciu/specializare (min/max), durată; încărcare poze.
4. **Dashboard companie** — card companie, % completare profil, statistici, acțiuni rapide: Servicii, Prețuri, Fotografii, Setări.
5. **Gestionare programări** — listă programări; adăugare programare manuală; editare/anulare.
6. **Recenzii** — vizualizare recenzii primite (Company Reviews).
7. **Setări** — editare profil, logout.

---

## 4. Monetizare

În cod **nu există încă** logică de abonament sau plată în aplicație. **Metode de plată** din app se referă la ce acceptă clinica (numerar, card, mobil etc.), nu la monetizarea platformei.

**Opțiuni viitoare de monetizare:**

| Model | Descriere |
|-------|-----------|
| **Abonament lunar/anual pentru clinici** | Tier Basic (listare + programări) vs Premium (promovare, badge „Recomandat”, statistici avansate). |
| **Comision per programare** | % din valoarea programării sau taxă fixă per rezervare (opțional, la integrare plăți online). |
| **Promovare / listing plătit** | Clinici plătite apar mai sus în listă sau în secțiune „Recomandate” pe județ/locație. |
| **Anunțuri / parteneriate** | Bannere sau parteneriate cu produse pentru animale (mâncări, asigurări). |

**Pentru pitch:** Poți spune că aplicația este gata pentru utilizare (gratuit pentru utilizatori și, în versiunea actuală, și pentru clinici), iar monetizarea este planificată prin abonamente pentru clinici și/sau promovare, fără a afecta experiența stăpânilor de animale.

---

## 5. Script demo 7 minute (cu trecere prin funcționalități)

**Regula:** ~30–45 secunde per ecran/flow; nu te opri prea mult pe detalii tehnice; accent pe „ce vede utilizatorul” și pe diferențiatori.

---

### Minute 0:00 – 0:45 — Intro + Scop

- **0:00** „Bună, [nume]. Îți prezint VetFinder: o aplicație care conectează stăpânii de animale cu clinici veterinare în România.”
- **0:15** „Scopul: să găsești rapid clinici după locație, servicii și prețuri, și să poți programa o vizită; clinicile își fac profil, primesc programări și recenzii.”
- **0:30** „Aplicația are două tipuri de utilizatori: stăpân de animal și clinică veterinară. Încep cu partea de stăpân de animal.”

---

### Minute 0:45 – 2:15 — Stăpân de animal: Login → Dashboard → Detalii

- **0:45** **Login** — „La intrare, utilizatorul se loghează. La înregistrare alege rol: Stăpân de animal sau Clinica veterinară.”
- **1:00** **Dashboard user** — „După login, vede lista de clinici: carduri cu nume, rating, distanță, prețuri. Poate filtra după distanță — 500 m, 1 km, 5 km, 10 km — și sorta după distanță, preț sau rating.”
- **1:25** „Aici e și harta: clinici pe hartă, locația utilizatorului; poate da click pe o clinică și merge la detalii.”
- **1:40** **Detalii clinică** — „Deschid o clinică: fotografii, descriere, servicii grupate pe categorii, cu prețuri și durate. Toate etichetele sunt în română. La final: program, facilități, metode de plată.”

---

### Minute 2:15 – 3:30 — Programare + Programările mele + Recenzie

- **2:15** **Programare** — „Buton «Programează». Aleg serviciul, data în calendar, un slot orar disponibil, eventual note. Confirm — programarea e făcută.”
- **2:45** **Programările mele** — „Din meniu merg la «Programările mele»: viitoare și trecute; pot anula unde e cazul.”
- **3:00** **Recenzie** — „După o vizită, pot lăsa o recenzie: rating 1–5 stele și un comentariu. Ratingul se reflectă pe cardul clinicii și pe pagina de detalii.”

---

### Minute 3:30 – 5:30 — Clinica veterinară: Înregistrare + Creare profil (4 pași)

- **3:30** „Trec la perspectiva clinici. Mă loghez cu un cont de tip «Clinica veterinară».”
- **3:45** **Fără profil** — „Dacă nu am încă profil, văd ecranul «Your Vet Company Awaits!»: beneficii — vizibilitate, programări, reputație — și un singur buton: «Create Company Profile».”
- **4:00** **Pas 1** — „Pas 1: nume, logo, email, telefon, descriere, opțional CUI.”
- **4:15** **Pas 2** — „Pas 2: adresă completă românească — județ, localitate, cod poștal — plus program de lucru pe zile.”
- **4:30** **Pas 3** — „Pas 3: tip de clinică, apoi categorii și specializări din listă — de exemplu îngrijire dentară, vaccinare, ecografie — plus facilități și metode de plată.”
- **4:50** **Pas 4** — „Pas 4: prețuri pentru fiecare serviciu ales — min/max, durată — și încărcare fotografii. Trimit — profilul e creat.”

---

### Minute 5:30 – 6:30 — Dashboard companie + Programări + Recenzii

- **5:30** **Dashboard companie** — „Dashboard-ul companiei: card cu nume și adresă, procent de completare a profilului, butoane rapide: Servicii, Prețuri, Fotografii, Setări.”
- **5:45** **Programări** — „La Programări văd toate programările: pot adăuga una manual, edita sau anula. Programările vin de la utilizatori care au rezervat din app.”
- **6:00** **Recenzii** — „La Recenzii văd ce au scris clienții: rating și comentarii. Asta ajută la construirea încrederii în aplicație.”

---

### Minute 6:30 – 7:00 — Diferentiatori + Monetizare + Încheiere

- **6:30** „Diferentiatori pe scurt: focus România — adresă, CUI, română; servicii și prețuri clare; căutare pe distanță și hartă; programări cu sloturi; recenzii; un singur flux de 4 pași pentru clinici; același app pe web, iOS și Android.”
- **6:45** „Monetizarea este planificată pentru clinici: abonamente sau promovare în listă, fără cost pentru stăpânii de animale. Aplicația este gata de utilizare în stadiul actual.”
- **7:00** „Întrebări?”

---

## 6. Checklist înainte de demo

- [ ] Backend pornit (`npm run backend` sau `cd backend && npm run dev`).
- [ ] Frontend pornit (`npm run web` sau `expo start`).
- [ ] Date de test: cel puțin 1 utilizator „user”, 1 „vetcompany” cu clinică completă, 1–2 clinici cu servicii și (opțional) programări și recenzii.
- [ ] Locație / permisiuni (pentru demo distanță/hartă pe device real dacă e cazul).
- [ ] Rehearsal o dată cu cronometrul pentru a ajusta ritmul (tăieri sau extinderi pe secțiuni).

---

## 7. Rezumat one-liner pentru pitch

**VetFinder:** *„Platformă pentru găsirea și programarea la clinici veterinare în România: stăpânii filtrează după locație și preț, clinicile își fac profil în 4 pași și primesc programări și recenzii.”*

---

*Document generat pe baza analizei codului din SMA-NEW (VetFinder).*
