#!/usr/bin/env bash
# Run unit tests + native Android debug build in this environment.
# Optional: boot emulator and install APK (see maestro/README.md for E2E).
set -euo pipefail

ROOT="$(cd "$(dirname "$0")/.." && pwd)"
cd "$ROOT"

if [[ -z "${ANDROID_HOME:-}" ]]; then
  echo "Set ANDROID_HOME to the Android SDK (e.g. /workspace/.android-sdk)."
  exit 1
fi

export PATH="$ANDROID_HOME/emulator:$ANDROID_HOME/platform-tools:$ANDROID_HOME/cmdline-tools/latest/bin:$PATH"

echo "== Jest unit tests =="
npm test

echo "== Expo prebuild (android) =="
npx expo prebuild --platform android --no-install

echo "== Gradle assembleDebug =="
cd android
./gradlew assembleDebug --no-daemon
APK="$ROOT/android/app/build/outputs/apk/debug/app-debug.apk"
ls -lh "$APK"

if [[ "${START_EMULATOR:-0}" != "1" ]]; then
  echo ""
  echo "Debug APK built. To boot emulator + install: START_EMULATOR=1 $0"
  exit 0
fi

AVD_NAME="${ANDROID_AVD:-api30_test}"
echo "== Starting emulator AVD=${AVD_NAME} (software CPU; first boot can take 10–20 min) =="
pkill -f qemu-system-x86_64 2>/dev/null || true
sleep 2

LOG="/tmp/family-tree-emulator.log"
if command -v xvfb-run >/dev/null; then
  nohup xvfb-run -a emulator -avd "$AVD_NAME" -no-audio -gpu swiftshader_indirect -accel off -no-boot-anim \
    >"$LOG" 2>&1 &
else
  nohup emulator -avd "$AVD_NAME" -no-window -no-audio -gpu swiftshader_indirect -accel off -no-boot-anim \
    >"$LOG" 2>&1 &
fi

echo "Waiting for adb device (up to ${BOOT_TIMEOUT_SEC:-1200}s)..."
deadline=$(( $(date +%s) + ${BOOT_TIMEOUT_SEC:-1200} ))
while [[ $(date +%s) -lt $deadline ]]; do
  if adb devices | awk '/emulator-/{print $2}' | grep -q '^device$'; then
    if adb shell getprop sys.boot_completed 2>/dev/null | grep -q 1; then
      break
    fi
  fi
  sleep 15
done

if ! adb shell getprop sys.boot_completed 2>/dev/null | grep -q 1; then
  echo "Emulator did not finish boot. See $LOG"
  exit 1
fi

echo "Waiting for PackageManager..."
while ! adb shell pm path android >/dev/null 2>&1; do sleep 10; done

echo "== Installing APK (push + pm install) =="
adb push "$APK" /data/local/tmp/family-tree-debug.apk
adb shell pm install -r -g /data/local/tmp/family-tree-debug.apk

echo "== Launch smoke =="
adb shell am start -n com.mughals.familytree/.MainActivity || true

if [[ "${RUN_MAESTRO:-0}" == "1" ]]; then
  if ! command -v maestro >/dev/null; then
    echo "Maestro CLI not on PATH. Install: https://maestro.mobile.dev/docs/getting-started/installing-maestro"
    exit 1
  fi
  echo "== Maestro smoke (needs a responsive emulator; KVM strongly recommended) =="
  maestro test --config maestro/config.yaml maestro/flows --include-tags smoke
fi

echo "Done."
