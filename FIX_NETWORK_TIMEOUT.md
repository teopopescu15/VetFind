# Network Timeout Fix - Quick Guide

## Problem
Mobile app shows: `ERROR API request error: [TypeError: Network request timed out]`

## Root Cause
Expo tunnel mode only tunnels the Metro bundler (frontend), NOT the backend API.
Mobile device cannot reach `http://192.168.1.196:5000` when using tunnel mode.

## Solution: Use LAN Mode Instead

### Steps:
1. Stop current process (Ctrl+C)
2. Run: `npm run dev` (uses LAN mode, not tunnel)
3. Ensure phone is on **same WiFi** as PC
4. Scan QR code with Expo Go
5. Try login

### If LAN Mode Doesn't Work (Different WiFi):
You'll need to tunnel the backend too - see main guide for details.

## Quick Test
```bash
# Check backend is accessible
curl http://192.168.1.196:5000/health

# Should return: {"status":"OK"...}
```
