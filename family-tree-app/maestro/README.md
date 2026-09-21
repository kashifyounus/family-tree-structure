# Maestro end-to-end tests (Android)

[Maestro](https://maestro.mobile.dev) runs UI flows on a real emulator, device, or cloud device farm.

## Prerequisites

1. Install Maestro CLI: https://maestro.mobile.dev/docs/getting-started/installing-maestro  
2. Install the app on the device (`com.mughals.familytree`):
   - Development build: `npx expo run:android`
   - Or install the release APK from `scripts/build-apk-local.sh`
3. Start an Android emulator (or connect a phone with USB debugging).

## Run all flows

From `family-tree-app`:

```bash
npm run test:e2e
```

Run one flow:

```bash
maestro test maestro/flows/01-onboarding-private-archive.yaml
```

## Flow order

| Flow | What it checks |
|------|----------------|
| `01-onboarding-private-archive` | Fresh install → private archive setup → home |
| `02-add-marriage-spouse` | Open first member → add spouse → marriage visible |
| `03-tools-backup-export` | Tools screen → export backup (no crash) |
| `04-reports-insights` | Reports screen loads |

Run `01` before `02` on a clean install. Flows `03` and `04` assume onboarding completed.

## CI

Use Maestro Cloud or a self-hosted emulator job with the APK artifact. Set `MAESTRO_APP_ID` if you use a different application id.

## Cloud Agent / headless Linux notes

Validated in the Cursor cloud Android SDK environment (`ANDROID_HOME` with NDK, emulator, API 30 + 35 images):

| Step | Result |
|------|--------|
| `npm test` | Pass |
| `npx expo prebuild` + `./gradlew assembleDebug` | Pass (~232MB `app-debug.apk`) |
| Emulator with **KVM** (`mughals_test`, API 35 x86_64) | QEMU starts but stays **adb offline** (guest never boots) |
| Emulator with **software CPU** (`api30_test`, `-accel off` + Xvfb) | Boots in ~8–16 minutes; `adb` **device** |
| `adb push` + `pm install` | Success (streamed `adb install` can fail or hang on slow guests) |
| Maestro driver startup | **Times out** on software CPU; use hardware-accelerated nested KVM or a physical device |

**Recommended local/cloud script:** from `family-tree-app`, run `scripts/test-android-env.sh` for unit tests + debug APK. For install on a running emulator: `START_EMULATOR=1 BOOT_TIMEOUT_SEC=1200 scripts/test-android-env.sh`. Create `api30_test` once with:

```bash
avdmanager create avd -n api30_test -k "system-images;android-30;google_apis;x86" -d pixel_4
```

Ensure the `ubuntu` user can use `/dev/kvm` (group or permissions) when KVM boot works on your host. Maestro E2E is realistic only after the emulator reaches `adb shell getprop sys.boot_completed` **1** within a few minutes.
