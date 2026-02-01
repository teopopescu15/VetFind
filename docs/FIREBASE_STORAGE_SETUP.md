# Firebase Storage – setări pentru logo și poze

Aplicația încarcă **logo-ul companiei** și **fotografiile de prezentare** în Firebase Storage, pe căile:

- **Logo:** `companies/{companyId}/logo/...`
- **Poze:** `companies/{companyId}/photos/...`

**Dacă pozele se încarcă dar logo-ul dă 403 (storage/unauthorized)**, înseamnă că regulile permit doar calea `photos` și nu și `logo`. Trebuie să adaugi și calea pentru logo (vezi mai jos).

---

## Ce trebuie făcut în Firebase Console

### 1. Storage activat

- În [Firebase Console](https://console.firebase.google.com) → proiectul tău → **Build** → **Storage**.
- Dacă Storage nu e activat, apasă **Get started** și urmează pașii (modul „production” sau „test” conform politicii tale).

### 2. Reguli de securitate (Rules) – obligatoriu pentru logo și poze

În **Storage** → **Rules**, trebuie să fie permise **ambele** căi: `companies/{id}/photos/...` **și** `companies/{id}/logo/...`.

**Variantă recomandată** (același nivel de acces pentru logo și poze; aplicația folosește autentificare propriă, nu Firebase Auth, deci `request.auth` e adesea null):

Copiază în **Firebase Console → Storage → Rules** exact acest bloc și apasă **Publish**:

```
rules_version = '2';
service firebase.storage {
  match /b/{bucket}/o {
    match /companies/{companyId}/photos/{fileName} {
      allow read, write: if true;
    }
    match /companies/{companyId}/logo/{fileName} {
      allow read, write: if true;
    }
  }
}
```

- `companies/{companyId}/photos/{fileName}` – pentru imaginile de prezentare (secțiunea „Adaugă imagini de prezentare”).
- `companies/{companyId}/logo/{fileName}` – pentru logo (secțiunea „Schimbă logo-ul”).

Fără regula pentru **logo**, upload-ul la logo dă **403 / storage/unauthorized**.

**Pentru producție** (dacă mai târziu folosești Firebase Auth și vrei restricționare):

```
match /companies/{companyId}/photos/{fileName} {
  allow read: if true;
  allow write: if request.auth != null;
}
match /companies/{companyId}/logo/{fileName} {
  allow read: if true;
  allow write: if request.auth != null;
}
```

Salvează regulile după editare (**Publish**).

Regulile de mai sus sunt și în proiect în **`firebase/storage.rules`** – le poți copia de acolo sau din acest doc.

### 3. CORS (doar dacă ai erori la afișare în browser)

Aplicația afișează imaginile Firebase fără `crossOrigin`, astfel că browserul nu cere header-e CORS pentru **afișare** – imaginile ar trebui să se vadă și fără setări CORS pe bucket.

Dacă totuși apar erori CORS (ex. la citirea imaginii în canvas sau la alte cereri):

- În [Google Cloud Console](https://console.cloud.google.com) → **Cloud Storage** → bucket-ul proiectului (ex. `vetfind-58a2b.firebasestorage.app`) → **Permissions** / **CORS**.
- Sau folosește `gsutil cors set cors.json gs://BUCKET_NAME` cu un fișier `cors.json`:

```json
[
  {
    "origin": ["http://localhost:8081", "http://localhost:19006", "https://yourdomain.com"],
    "method": ["GET", "HEAD"],
    "maxAgeSeconds": 3600,
    "responseHeader": ["Content-Type", "Content-Length"]
  }
]
```

Adaugă toate origin-urile tale (localhost pentru dev, domeniul pentru producție).

### 4. Nimic suplimentar pentru „logo”

Nu există o setare separată în consolă doar pentru logo. Logo-ul folosește același Storage și aceleași reguli ca și pozele, doar că pe subcalea `companies/{id}/logo/...`. Dacă regulile permit scrierea la `companies/{companyId}/**`, logo-ul și pozele vor funcționa.

---

## Rezumat

| Pas | Unde | Ce faci |
|-----|------|--------|
| 1 | Firebase Console → Storage | Pornești Storage dacă nu e pornit |
| 2 | Storage → Rules | Adaugi/actualizezi reguli pentru `companies/{companyId}/**` (read/write) |
| 3 | (Opțional) CORS | Doar pentru web, dacă apar erori CORS la încărcare |

După acești pași, nu mai e nevoie de alte setări în consolă specifice pentru logo.
