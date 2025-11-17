# VetFinder - Localhost Configuration ✅

**All services now run on localhost within WSL - No IP forwarding needed!**

## System Architecture

```
┌────────────────────────────────────────┐
│         WSL Environment                │
│                                        │
│  ┌──────────────┐                     │
│  │  Expo App    │──────localhost──────│
│  │  Port 8082   │     API calls       │
│  └──────────────┘         │           │
│                           ▼           │
│                  ┌──────────────────┐ │
│                  │ Backend Express  │ │
│                  │   Port 5000      │ │
│                  └────────┬─────────┘ │
│                           │           │
│                           ▼           │
│                  ┌──────────────────┐ │
│                  │   PostgreSQL     │ │
│                  │   Port 5432      │ │
│                  └──────────────────┘ │
└────────────────────────────────────────┘
```

## Service Configuration

| Service | Port | URL | Status |
|---------|------|-----|--------|
| **PostgreSQL** | 5432 | localhost:5432/VetFind | ✅ Running |
| **Backend API** | 5000 | http://localhost:5000/api | ✅ Running |
| **Frontend Expo** | 8082 | http://localhost:8082 | ✅ Running |

## Configuration Files Updated

### 1. `src/services/api.ts` (line 25)
```typescript
const BASE_URL = process.env.EXPO_PUBLIC_API_URL || 'http://localhost:5000/api';
```

### 2. `.env` (root)
```env
API_URL=http://localhost:5000/api
```

### 3. `config/api.config.ts`
```typescript
const getApiUrl = () => {
  if (__DEV__) {
    return 'http://localhost:5000/api';
  }
  return 'https://your-production-api.com/api';
};
```

### 4. `backend/.env` (unchanged)
```env
PORT=5000
DATABASE_URL=postgresql://postgres:Teodora44@localhost:5432/VetFind
```

## Health Check Results

### ✅ PostgreSQL Database
- **Status:** Accepting connections
- **Database:** VetFind - Connected ✅
- **Connection String:** `postgresql://postgres:Teodora44@localhost:5432/VetFind`

### ✅ Backend API
- **Health Endpoint:** http://localhost:5000/health
- **API Endpoint:** http://localhost:5000/api
- **Status:** Running in development mode
- **Database Connection:** ✅ Connected to VetFind

### ✅ Frontend Expo
- **Dev Server:** http://localhost:8082
- **Status:** Running (HTTP 200)
- **Metro Bundler:** Active

### ✅ Frontend → Backend Communication
- **Test:** API call from localhost:8082 → localhost:5000
- **Result:** ✅ Working (CORS configured correctly)
- **Response:** `{"success":false,"message":"No token provided"}` (Expected - auth endpoint)

## Quick Start Commands

### Start All Services
```bash
# Terminal 1: Backend
cd backend && npm run dev

# Terminal 2: Frontend
npm start
```

### Health Check
```bash
# Run the health check script
./health-check.sh
```

### Manual Health Tests
```bash
# Test Database
pg_isready -h localhost -p 5432
PGPASSWORD=Teodora44 psql -h localhost -U postgres -d VetFind -c "SELECT version();"

# Test Backend
curl http://localhost:5000/health
curl http://localhost:5000/api

# Test Frontend
curl -I http://localhost:8082
```

## Benefits of Localhost Setup

1. **✅ Simpler Configuration:** No IP address management
2. **✅ Faster Communication:** Direct localhost connections
3. **✅ More Reliable:** No network issues or WSL networking quirks
4. **✅ Easier Testing:** Standard localhost URLs
5. **✅ Better Security:** Services not exposed to network by default

## CORS Configuration

Backend CORS allows:
- ✅ `http://localhost:8082` (Expo dev server)
- ✅ `http://localhost:8081` (Expo alternative port)
- ✅ `http://localhost:19006` (Expo web)
- ✅ All development origins with flexible regex patterns

## Running Processes

### Backend
- `nodemon` watching `src/**/*.ts`
- `tsx` executing TypeScript server
- Connected to PostgreSQL on localhost:5432

### Frontend
- `expo start --port 8082`
- Metro bundler active
- Dev server on localhost:8082

## Troubleshooting

### If Backend Can't Connect to Database
```bash
# Check PostgreSQL status
pg_isready -h localhost -p 5432

# Test manual connection
PGPASSWORD=Teodora44 psql -h localhost -U postgres -d VetFind
```

### If Frontend Can't Reach Backend
```bash
# Verify backend is running
curl http://localhost:5000/health

# Check CORS in backend logs
tail -f backend.log | grep CORS
```

### If Expo Won't Start
```bash
# Clear cache and restart
npm run clean-start
```

## Environment Variables

### Root `.env`
```env
API_URL=http://localhost:5000/api
DB_HOST=localhost
DB_PORT=5432
DB_NAME=vetfinder_db
DB_USER=vetfinder_user
DB_PASSWORD=vetfinder_pass
JWT_SECRET=your-super-secret-jwt-key-change-this-in-production
```

### `backend/.env`
```env
NODE_ENV=development
PORT=5000
DATABASE_URL=postgresql://postgres:Teodora44@localhost:5432/VetFind
DB_HOST=localhost
DB_PORT=5432
DB_NAME=VetFind
DB_USER=postgres
DB_PASSWORD=Teodora44
JWT_SECRET=5bb45269415903c9774ef48fa09b5a6203ce750ab4a64d923734ebe5c44914cb479985514cb83d25b5890931f3635b29ba3ff0794860e920b536eb830657cee2
JWT_EXPIRE=30d
CORS_ORIGIN=http://localhost:3000
```

## Next Steps

Now that all services are running on localhost:

1. **Test Authentication:** Try login/signup from the app
2. **Test Company Features:** Create/update vet company profiles
3. **Test Services:** Add services to companies
4. **Test Location:** Test location-based clinic search

---

**Date:** 2025-11-17
**Status:** ✅ All services configured and running on localhost
**No WSL IP forwarding needed!**
