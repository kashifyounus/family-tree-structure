#!/usr/bin/env bash
# Boot emulator (if needed), install debug APK, screen-record + Maestro workflow with screenshots.
set -euo pipefail

ROOT="$(cd "$(dirname "$0")/.." && pwd)"
cd "$ROOT"
ARTIFACTS="${ARTIFACTS_DIR:-/opt/cursor/artifacts/android-e2e}"
mkdir -p "$ARTIFACTS/screenshots" "$ARTIFACTS/maestro-output"

if [[ -z "${ANDROID_HOME:-}" ]]; then
  if [[ -d /workspace/.android-sdk ]]; then
    export ANDROID_HOME=/workspace/.android-sdk
  else
    echo "Set ANDROID_HOME or install SDK to /workspace/.android-sdk"
    exit 1
  fi
fi

export PATH="$ANDROID_HOME/emulator:$ANDROID_HOME/platform-tools:$ANDROID_HOME/cmdline-tools/latest/bin:$PATH"

FLOW="${MAESTRO_FLOW:-maestro/flows/05-complete-family-workflow.yaml}"
RECORD_SEC="${SCREENRECORD_SEC:-180}"
AVD_NAME="${ANDROID_AVD:-api30_test}"

if [[ "${SKIP_BUILD:-0}" != "1" ]]; then
  echo "== Build debug APK =="
  START_EMULATOR=0 "$ROOT/scripts/test-android-env.sh"
fi

APK="$ROOT/android/app/build/outputs/apk/debug/app-debug.apk"
if [[ ! -f "$APK" ]]; then
  echo "Missing APK: $APK"
  exit 1
fi

if [[ "${START_EMULATOR:-1}" == "1" ]]; then
  if ! adb devices | awk '/emulator-/{print $2}' | grep -q '^device$'; then
    echo "== Starting emulator AVD=${AVD_NAME} =="
    pkill -f qemu-system-x86_64 2>/dev/null || true
    sleep 2
    LOG="/tmp/family-tree-emulator.log"
    EMU_ARGS=(-avd "$AVD_NAME" -no-audio -no-boot-anim)
    if [[ -r /dev/kvm ]] && [[ -w /dev/kvm ]]; then
      EMU_ARGS+=(-gpu swiftshader_indirect)
    else
      echo "KVM not writable; using software CPU (slow boot)."
      EMU_ARGS+=(-gpu swiftshader_indirect -accel off)
    fi
    if command -v xvfb-run >/dev/null; then
      nohup xvfb-run -a emulator "${EMU_ARGS[@]}" >"$LOG" 2>&1 &
    else
      nohup emulator -no-window "${EMU_ARGS[@]}" >"$LOG" 2>&1 &
    fi
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
      echo "Emulator boot failed. See $LOG"
      exit 1
    fi
  fi
fi

echo "== Install APK =="
adb push "$APK" /data/local/tmp/family-tree-debug.apk
adb shell pm install -r -g /data/local/tmp/family-tree-debug.apk

REMOTE_VIDEO="/sdcard/family_records_android_workflow.mp4"
echo "== Screen record (${RECORD_SEC}s max) =="
echo "== Maestro: $FLOW =="
export MAESTRO_CLI_ANALYSIS_NOTIFICATION_DISABLED=true

adb shell screenrecord --time-limit "$RECORD_SEC" "$REMOTE_VIDEO" &
RECORD_PID=$!
sleep 2

maestro test --config maestro/config.yaml "$FLOW" \
  --output "$ARTIFACTS/maestro-output" \
  || MAESTRO_EXIT=$?
MAESTRO_EXIT=${MAESTRO_EXIT:-0}

adb shell pkill -INT screenrecord 2>/dev/null || true
wait "$RECORD_PID" 2>/dev/null || true
sleep 2
adb pull "$REMOTE_VIDEO" "$ARTIFACTS/family_records_android_workflow.mp4" || true
adb shell rm -f "$REMOTE_VIDEO" || true

if [[ -d "$HOME/.maestro/tests" ]]; then
  latest_run="$(ls -td "$HOME/.maestro/tests"/*/ 2>/dev/null | head -1)"
  if [[ -n "$latest_run" ]]; then
    find "$latest_run" -name 'android_*.png' -exec cp -f {} "$ARTIFACTS/screenshots/" \; 2>/dev/null || true
  fi
fi
find "$ARTIFACTS/maestro-output" -name '*.png' -exec cp -n {} "$ARTIFACTS/screenshots/" \; 2>/dev/null || true

echo "Artifacts: $ARTIFACTS"
ls -la "$ARTIFACTS/screenshots" 2>/dev/null || true
ls -la "$ARTIFACTS/family_records_android_workflow.mp4" 2>/dev/null || true

exit "$MAESTRO_EXIT"
