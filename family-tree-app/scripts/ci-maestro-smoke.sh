#!/usr/bin/env bash
# Run on a host with adb + booted emulator (e.g. GitHub Actions android-emulator-runner script).
set -euo pipefail

ROOT="$(cd "$(dirname "$0")/.." && pwd)"
cd "$ROOT"

APK="${APK:-${GITHUB_WORKSPACE:-$ROOT}/family-tree-app/android/app/build/outputs/apk/debug/app-debug.apk}"
if [[ ! -f "$APK" ]]; then
  APK="$ROOT/android/app/build/outputs/apk/debug/app-debug.apk"
fi

DEFAULT_CI_FLOWS="maestro/flows/01-onboarding-private-archive.yaml,maestro/flows/09-demo-onboarding-kay.yaml,maestro/flows/08-figma-kuriosity-smoke.yaml,maestro/flows/10-archive-lane-switch.yaml,maestro/flows/11-demo-clear-restart.yaml,maestro/flows/12-tree-load-more.yaml"
export MAESTRO_CI_FLOWS="${MAESTRO_CI_FLOWS:-$DEFAULT_CI_FLOWS}"
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
wait_for_package_manager() {
  local deadline=$(( $(date +%s) + ${PM_READY_TIMEOUT_SEC:-300} ))
  while [[ $(date +%s) -lt $deadline ]]; do
    if adb shell pm path android >/dev/null 2>&1 \
      && adb shell pm list packages -s >/dev/null 2>&1; then
      return 0
    fi
    sleep 3
  done
  echo "Package manager not ready after ${PM_READY_TIMEOUT_SEC:-300}s"
  return 1
}

echo "Waiting for package manager..."
wait_for_package_manager

adb shell settings put global window_animation_scale 0 >/dev/null 2>&1 || true
adb shell settings put global transition_animation_scale 0 >/dev/null 2>&1 || true
adb shell settings put global animator_duration_scale 0 >/dev/null 2>&1 || true

echo "Installing $APK (push + pm install — reliable on slow emulators)"
adb push "$APK" /data/local/tmp/family-tree-debug.apk

install_ok=false
for attempt in 1 2 3 4 5; do
  wait_for_package_manager || true
  if adb shell pm install -r -g /data/local/tmp/family-tree-debug.apk; then
    install_ok=true
    break
  fi
  echo "pm install attempt $attempt failed; retrying in 10s..."
  sleep 10
done
if [[ "$install_ok" != true ]]; then
  echo "APK install failed after retries"
  exit 1
fi

echo "Preparing device UI for Maestro (wake + keyguard)..."
adb shell input keyevent 224 >/dev/null 2>&1 || true
adb shell input keyevent 82 >/dev/null 2>&1 || true
adb shell wm dismiss-keyguard >/dev/null 2>&1 || true
sleep 15

export MAESTRO_DRIVER_STARTUP_TIMEOUT="${MAESTRO_DRIVER_STARTUP_TIMEOUT:-900000}"
echo "MAESTRO_DRIVER_STARTUP_TIMEOUT=${MAESTRO_DRIVER_STARTUP_TIMEOUT}ms"

APP_ID="${MAESTRO_APP_ID:-com.kuriosity.engineering}"
echo "Clearing app data for $APP_ID before Maestro..."
adb shell pm clear "$APP_ID" >/dev/null 2>&1 || true

if ! command -v maestro >/dev/null; then
  echo "Installing Maestro CLI..."
  curl -Ls "https://get.maestro.mobile.dev" | bash
fi
export PATH="$PATH:$HOME/.maestro/bin"

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
