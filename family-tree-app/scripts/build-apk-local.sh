#!/usr/bin/env bash
set -euo pipefail

ROOT="$(cd "$(dirname "$0")/.." && pwd)"
cd "$ROOT"

if [[ -z "${ANDROID_HOME:-}" ]]; then
  echo "Set ANDROID_HOME to your Android SDK (install via Android Studio or cmdline-tools)."
  exit 1
fi

if [[ -f .env ]]; then
  set -a
  # shellcheck disable=SC1091
  source .env
  set +a
fi

echo "EXPO_PUBLIC_API_URL=${EXPO_PUBLIC_API_URL:-<not set — online mode needs this at build time>}"

npx expo prebuild --platform android --no-install

export PATH="$ANDROID_HOME/platform-tools:$ANDROID_HOME/cmdline-tools/latest/bin:$PATH"
cd android
./gradlew assembleRelease --no-daemon

APK="$ROOT/android/app/build/outputs/apk/release/app-release.apk"
echo ""
echo "APK: $APK"
ls -lh "$APK"
