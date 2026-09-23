#!/usr/bin/env bash
set -euo pipefail

SDK_ROOT="${ANDROID_HOME:-/workspace/.android-sdk}"
mkdir -p "$SDK_ROOT/cmdline-tools"

if [[ ! -x "$SDK_ROOT/cmdline-tools/latest/bin/sdkmanager" ]]; then
  echo "Downloading Android command-line tools..."
  TMP="$(mktemp -d)"
  curl -fsSL -o "$TMP/cmdtools.zip" \
    "https://dl.google.com/android/repository/commandlinetools-linux-13114758_latest.zip"
  unzip -q "$TMP/cmdtools.zip" -d "$TMP"
  rm -rf "$SDK_ROOT/cmdline-tools/latest"
  mv "$TMP/cmdline-tools" "$SDK_ROOT/cmdline-tools/latest"
  rm -rf "$TMP"
fi

export ANDROID_HOME="$SDK_ROOT"
export PATH="$ANDROID_HOME/cmdline-tools/latest/bin:$ANDROID_HOME/platform-tools:$ANDROID_HOME/emulator:$PATH"

echo "Accepting SDK licenses..."
yes | sdkmanager --licenses >/dev/null

echo "Installing SDK packages..."
sdkmanager --install \
  "platform-tools" \
  "emulator" \
  "platforms;android-30" \
  "build-tools;35.0.0" \
  "system-images;android-30;google_apis;x86"

AVD_NAME="${ANDROID_AVD:-api30_test}"
if ! avdmanager list avd | grep -q "Name: $AVD_NAME"; then
  echo "Creating AVD $AVD_NAME..."
  echo no | avdmanager create avd -n "$AVD_NAME" \
    -k "system-images;android-30;google_apis;x86" \
    -d pixel_4
fi

if [[ -e /dev/kvm ]] && ! [[ -w /dev/kvm ]]; then
  echo "Note: /dev/kvm not writable for $(whoami); emulator will use -accel off unless you add kvm group."
fi

echo "ANDROID_HOME=$SDK_ROOT"
