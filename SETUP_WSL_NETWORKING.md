# WSL2 Port Forwarding Setup Guide

## Problem
Backend runs in WSL2 but mobile device can't reach it via Windows IP (192.168.1.196).

## Root Cause
WSL2 uses a virtual network adapter. Windows host IP doesn't automatically forward to WSL.

## Solution: Windows Port Forwarding

### Automatic Setup (Recommended)

1. **Open PowerShell as Administrator**
   - Press Win + X
   - Select "Windows PowerShell (Admin)" or "Terminal (Admin)"

2. **Run the setup script**
   ```powershell
   cd C:\Users\Teo\Desktop\SMA-NEW
   .\setup-port-forwarding.ps1
   ```

3. **Verify it works**
   ```powershell
   curl http://192.168.1.196:5000/health
   ```

### Manual Setup

If the script doesn't work, run these commands in PowerShell as Administrator:

```powershell
# Get WSL IP
$wslIp = bash.exe -c "hostname -I | awk '{print `$1}'"

# Add port forwarding
netsh interface portproxy add v4tov4 listenport=5000 listenaddress=0.0.0.0 connectport=5000 connectaddress=$wslIp

# Add firewall rule
New-NetFirewallRule -DisplayName "WSL Backend Port 5000" -Direction Inbound -LocalPort 5000 -Protocol TCP -Action Allow

# Verify
netsh interface portproxy show all
```

## Testing

After setup, test from WSL:
```bash
curl http://192.168.1.196:5000/health
```

Should return: `{"status":"OK"...}`

## Troubleshooting

### Port forwarding not working?
```powershell
# Check existing rules
netsh interface portproxy show all

# Remove all rules
netsh interface portproxy reset

# Try manual setup again
```

### Firewall blocking?
```powershell
# Check firewall rule
Get-NetFirewallRule -DisplayName "WSL Backend Port 5000"

# Or temporarily disable firewall (testing only!)
Set-NetFirewallProfile -Profile Domain,Public,Private -Enabled False
```

### WSL IP changes after reboot?
WSL2 IP can change. Re-run the setup script after each Windows restart.

## Alternative: Use WSL IP Directly

Update `.env` to use WSL IP instead:
```bash
EXPO_PUBLIC_API_URL=http://172.23.126.178:5000/api
```

**Downside**: WSL IP changes on reboot, requires updating .env each time.
