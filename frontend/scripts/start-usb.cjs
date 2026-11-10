const { existsSync } = require('node:fs');
const { join, resolve } = require('node:path');
const { spawn, spawnSync } = require('node:child_process');

const sdk = process.env.ANDROID_HOME || process.env.ANDROID_SDK_ROOT ||
  join(process.env.LOCALAPPDATA || '', 'Android', 'Sdk');
const candidate = join(sdk, 'platform-tools', process.platform === 'win32' ? 'adb.exe' : 'adb');
const adb = process.env.ADB_PATH || (existsSync(candidate) ? candidate : 'adb');
function runAdb(args) {
  const result = spawnSync(adb, args, { encoding: 'utf8' });
  if (result.error || result.status !== 0) {
    console.error(result.error?.message || result.stderr);
    process.exit(1);
  }
  return result.stdout;
}

const devices = runAdb(['devices']).split(/\r?\n/)
  .filter(line => /\sdevice$/.test(line)).map(line => line.split(/\s/)[0]);
const serial = process.env.ANDROID_SERIAL || (devices.length === 1 ? devices[0] : null);
if (!serial || !devices.includes(serial)) {
  console.error('Connect and authorize one Android phone with USB debugging. For multiple devices, set ANDROID_SERIAL.');
  process.exit(1);
}
for (const port of [8081, 5002]) {
  runAdb(['-s', serial, 'reverse', `tcp:${port}`, `tcp:${port}`]);
}
async function startMetro() {
  let response;
  try {
    response = await fetch('http://127.0.0.1:8081/', {
      headers: { 'expo-platform': 'android', accept: 'application/expo+json' },
      signal: AbortSignal.timeout(5000),
    });
  } catch (error) {
    if (error.cause?.code !== 'ECONNREFUSED') throw error;
  }
  if (response) {
    const manifest = await response.json();
    const root = manifest.extra?.expoClient?._internal?.projectRoot;
    const bundle = manifest.launchAsset?.url;
    if (!root || resolve(root).toLowerCase() !== resolve(__dirname, '..').toLowerCase() ||
        !bundle?.startsWith('http://127.0.0.1:8081/')) {
      throw new Error('Port 8081 belongs to another server or a non-USB Metro session. Stop that server with Ctrl+C, then run start:usb again.');
    }
    console.log('This project is already running on USB. Reusing Metro; keep its original terminal open.');
    runAdb(['-s', serial, 'shell', 'am', 'start', '-a', 'android.intent.action.VIEW',
      '-d', 'exp://127.0.0.1:8081', '-p', 'host.exp.exponent']);
    return;
  }
console.log('USB ready: Metro 8081 and API 5002 forwarded. Open exp://127.0.0.1:8081 in Expo Go.');
// Windows may resolve localhost to ::1; ADB forwards to IPv4 127.0.0.1.
const child = spawn(process.execPath, ['--use-system-ca', '--dns-result-order=ipv4first', require.resolve('expo/bin/cli'), 'start',
  '--localhost', '--go', '--port', '8081', ...process.argv.slice(2)], {
  stdio: 'inherit',
  env: { ...process.env, EXPO_PUBLIC_API_URL: 'http://127.0.0.1:5002/api' },
});
child.on('error', error => { console.error(error.message); process.exitCode = 1; });
child.on('exit', code => { process.exitCode = code ?? 1; });
}

startMetro().catch(error => {
  console.error(`Cannot start USB Metro: ${error.message}`);
  process.exitCode = 1;
});
