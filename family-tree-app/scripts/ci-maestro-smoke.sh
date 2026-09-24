#!/usr/bin/env bash
# Run on a host with adb + booted emulator (e.g. GitHub Actions android-emulator-runner script).
set -euo pipefail

ROOT="$(cd "$(dirname "$0")/.." && pwd)"
cd "$ROOT"

APK="${APK:-$ROOT/android/app/build/outputs/apk/debug/app-debug.apk}"
FLOW="${MAESTRO_CI_FLOW:-maestro/flows/01-onboarding-private-archive.yaml}"

if [[ ! -f "$APK" ]]; then
  echo "Missing debug APK at $APK"
  exit 1
fi

export PATH="${ANDROID_HOME:-}/platform-tools:${PATH:-}"

echo "Waiting for emulator..."
adb wait-for-device
adb shell 'while [[ -z $(getprop sys.boot_completed 2>/dev/null | tr -d "\r") ]]; do sleep 2; done'

echo "Installing $APK (push + pm install — reliable on slow emulators)"
adb push "$APK" /data/local/tmp/family-tree-debug.apk
adb shell pm install -r -g /data/local/tmp/family-tree-debug.apk

if ! command -v maestro >/dev/null; then
  echo "Installing Maestro CLI..."
  curl -Ls "https://get.maestro.mobile.dev" | bash
  export PATH="$PATH:$HOME/.maestro/bin"
fi

echo "Running Maestro flow: $FLOW"
maestro test --config maestro/config.yaml "$FLOW"
