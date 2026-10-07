# Running on a physical Android phone from Windows

Use USB + Expo Go on this network. No emulator, Android Studio, or ngrok tunnel
is required. Verified with Node 24.15.0 and Expo Go 57.0.9.

## One-time setup

- Install Expo Go compatible with SDK 57 on the phone.
- Enable Developer options and USB debugging. Connect a data-capable USB cable
  and accept the phone's debugging authorization prompt.
- Android platform-tools are already at
  `%LOCALAPPDATA%\Android\Sdk\platform-tools` on this laptop. The USB script also
  checks ANDROID_HOME / ANDROID_SDK_ROOT, then PATH. ADB_PATH can override the
  full adb executable path. Only platform-tools are needed, not Android Studio.
- Keep backend credentials in backend/.env. Do not put secrets in
  EXPO_PUBLIC_API_URL, which is bundled into the app.

## Every time you reopen the project

Connect and authorize the phone. Stop any previous frontend server with Ctrl+C
before starting another one. Run the following in two terminals from the project root.

Backend:

```powershell
cd backend
node --use-system-ca src/server.js
```

Wait for `MongoDB connected successfully` and `Server running on port 5002`.
The Node flag trusts Windows-installed root certificates without disabling TLS
verification. The existing MongoDB public DNS workaround remains in place and
can be overridden with DNS_SERVERS (comma-separated IP addresses).

Frontend:

```powershell
cd frontend
npm.cmd run start:usb
```

Open `exp://127.0.0.1:8081` in Expo Go (or scan the new QR code). Keep the cable
connected and both terminals open. The first bundle may take longer; wait for
`Android Bundled`. The script selects the authorized phone, recreates both ADB
reverse mappings, uses IPv4 localhost, enables system CA trust, and sets
EXPO_PUBLIC_API_URL to `http://127.0.0.1:5002/api` for this session only.
For multiple phones, set ANDROID_SERIAL to the intended device's serial.

After reconnecting the cable, restart the USB command to recreate the mappings.
To rebuild the Metro cache when needed:

```powershell
npm.cmd run start:usb -- --clear
```

## Ports and checks

The script performs these mappings with the selected device:

```text
adb -s SERIAL reverse tcp:8081 tcp:8081
adb -s SERIAL reverse tcp:5002 tcp:5002
```

8081 carries the Expo manifest, JavaScript bundle, assets, and Metro connections.
5002 carries backend API requests. Reversing only 8081 does not connect the API.
On Windows, IPv4-first binding prevents Metro listening only on ::1 while ADB
connects to 127.0.0.1.

Check the backend without credentials or database writes:

```powershell
Invoke-RestMethod http://127.0.0.1:5002/
```

On the phone, opening `http://127.0.0.1:5002/` in its browser while USB forwarding
is active should return the same API-running message. Then return to Expo Go.

## Optional LAN mode

```powershell
npm.cmd run start:lan
```

Use a trusted Wi-Fi/hotspot that allows devices to communicate. Allow Node on
Windows Firewall's Private network if prompted. Axios follows Metro's current
host automatically on port 5002, so no fixed LAN IP is stored in source code.
EXPO_PUBLIC_API_URL in frontend/.env.local can explicitly override the API URL
for LAN or a deployed backend; restart Metro after changing it. The USB command
always sets its own localhost URL for consistency with its port mappings.

A Metro tunnel does not forward the backend's port 5002. Tunnel mode needs an
explicit backend URL reachable from the phone and is not the recommended mode
on this network.

## Verification and remaining checks

Expo install --check: dependencies up to date. Expo Doctor: 21/21 checks passed.
One React and one React Native installation; Reanimated/Worklets match SDK 57.
Expo's default Babel preset supplies the Worklets plugin; no custom Babel/Metro
configuration is needed. Existing AppEntry, React Navigation, Patient/Staff
screens, and contexts were retained.

Verified USB login screen, Metro Android bundling, MongoDB startup, and an Axios
GET from the running phone app returning HTTP 200 from the backend root endpoint.
The temporary request used for verification was removed afterward.

Typecheck still reports existing unused template component errors involving
expo-router and CSS imports. Lint cannot run without adding ESLint tooling; its
automatic installation failed on sandbox cache permissions. These are separate
from the successfully tested Android entry point and were not repaired as part
of this startup fix.
