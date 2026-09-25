#!/usr/bin/env bash
# Run on a host with adb + booted emulator (e.g. GitHub Actions android-emulator-runner script).
set -euo pipefail

ROOT="$(cd "$(dirname "$0")/.." && pwd)"
cd "$ROOT"

APK="${APK:-$ROOT/android/app/build/outputs/apk/debug/app-debug.apk}"
DEFAULT_FLOW="maestro/flows/01-onboarding-private-archive.yaml"
FLOW="${MAESTRO_CI_FLOW:-$DEFAULT_FLOW}"

if [[ ! -f "$APK" ]]; then
  echo "Missing debug APK at $APK"
  exit 1
fi

if [[ -z "${ANDROID_HOME:-}" ]]; then
  ANDROID_HOME="${ANDROID_SDK_ROOT:-}"
fi
export PATH="${ANDROID_HOME}/platform-tools:${PATH:-}"

echo "Waiting for emulator (ANDROID_HOME=$ANDROID_HOME)..."
adb wait-for-device
boot_deadline=$(( $(date +%s) + ${BOOT_TIMEOUT_SEC:-900} ))
while true; do
  if adb shell getprop sys.boot_completed 2>/dev/null | tr -d '\r' | grep -q 1; then
    break
  fi
  if [[ $(date +%s) -ge $boot_deadline ]]; then
    echo "Emulator boot timed out after ${BOOT_TIMEOUT_SEC:-900}s"
    exit 1
  fi
  sleep 3
done
while ! adb shell pm path android >/dev/null 2>&1; do sleep 2; done

echo "Installing $APK (push + pm install — reliable on slow emulators)"
adb push "$APK" /data/local/tmp/family-tree-debug.apk
adb shell pm install -r -g /data/local/tmp/family-tree-debug.apk

if ! command -v maestro >/dev/null; then
  echo "Installing Maestro CLI..."
  curl -Ls "https://get.maestro.mobile.dev" | bash
  export PATH="$PATH:$HOME/.maestro/bin"
fi

run_flow() {
  local path="$1"
  echo "Running Maestro flow: $path"
  maestro test --config maestro/config.yaml "$path"
}

if [[ -n "${MAESTRO_CI_FLOWS:-}" ]]; then
  IFS=',' read -ra EXTRA <<< "$MAESTRO_CI_FLOWS"
  for path in "${EXTRA[@]}"; do
    run_flow "$(echo "$path" | xargs)"
  done
else
  run_flow "$FLOW"
fi
