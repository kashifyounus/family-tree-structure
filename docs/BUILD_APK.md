# Build Kuriosity Family Tree APK (after tests)

## 1. Run tests

```bash
cd family-tree-app
npm test
npm run test:maestro:contracts
```

Device E2E (optional, requires emulator + Maestro CLI):

```bash
maestro test maestro/flows/08-figma-kuriosity-smoke.yaml
```

## 2. Build release APK (local)

Requires `ANDROID_HOME` (Android SDK) and Java 17+.

```bash
cd family-tree-app
export ANDROID_HOME=/path/to/android-sdk   # e.g. ~/android-sdk
chmod +x scripts/build-apk-local.sh
./scripts/build-apk-local.sh
```

**Output:** `family-tree-app/dist/Kuriosity-Family-Tree-<version>-release.apk`

```bash
adb install -r family-tree-app/dist/Kuriosity-Family-Tree-1.0.0-release.apk
```

## 3. CI / GitHub

Push tag `app-v*` or run workflow **Android APK release** — artifact `kuriosity-family-tree-apk`.

See `family-tree-app/RELEASE.md`.
