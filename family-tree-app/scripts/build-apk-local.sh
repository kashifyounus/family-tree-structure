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

echo "EXPO_PUBLIC_API_URL=${EXPO_PUBLIC_API_URL:-<not set — optional dev default; users set URL in Account>}"

npx expo prebuild --platform android --no-install

export PATH="$ANDROID_HOME/platform-tools:$ANDROID_HOME/cmdline-tools/latest/bin:$PATH"
cd android
./gradlew assembleRelease --no-daemon

APK="$ROOT/android/app/build/outputs/apk/release/app-release.apk"
OUT_NAME="Mughals-Family-Tree-$(node -p "require('${ROOT}/app.json').expo.version")-release.apk"
DIST="$ROOT/dist"
mkdir -p "$DIST"
cp "$APK" "$DIST/$OUT_NAME"

echo ""
echo "APK: $APK"
echo "Copy: $DIST/$OUT_NAME"
ls -lh "$APK" "$DIST/$OUT_NAME"
echo ""
echo "Install: adb install -r \"$DIST/$OUT_NAME\""
echo "Note: Release build uses debug keystore (fine for sideload). Configure a release keystore for Play Store."
echo "Online mode: users set or change the family website address in Account (no rebuild required)."
