# Q5 — Emulator Maestro smoke (team artifact)

**Roadmap:** [`GENEALOGY_ROADMAP.md`](./GENEALOGY_ROADMAP.md) item 10 · [`FAMILY_TREE_MAP_STATUS.md`](./FAMILY_TREE_MAP_STATUS.md) Q5  
**CI workflow:** [`.github/workflows/mobile-maestro.yml`](../.github/workflows/mobile-maestro.yml)  
**Local driver:** [`family-tree-app/scripts/ci-maestro-smoke.sh`](../family-tree-app/scripts/ci-maestro-smoke.sh)

## Goal

On **`main` push** (and manual `workflow_dispatch`), GitHub Actions should:

1. Build a **debug APK**
2. Boot an **Android emulator** (API 33, software GPU on CI)
3. Run Maestro flows **01, 09, 10, 11, 12**

PRs still get **Maestro contracts** only (Jest — no emulator).

---

## Environment constraints (Cloud Agent / CI)

| Factor | Impact |
|--------|--------|
| **No KVM** (`/dev/kvm` missing) | x86_64 emulator uses **software CPU**; boot often **5–15+ min**; risk of **system ANR** (“Process system isn’t responding”). |
| **Cold boot + wipe** | First launch always hits **NavigationGate** + onboarding routing. |
| **Maestro driver** | Default startup timeout too low on slow emulators → set `MAESTRO_DRIVER_STARTUP_TIMEOUT=900000` (15 min). |

---

## 2026-10-08 retest (rebooted AVD `api33_ci`)

### Setup

- Cold boot: `emulator -avd api33_ci -wipe-data` (tmux session, `-accel off`, SwiftShader GPU)
- APK: `family-tree-app/android/app/build/outputs/apk/debug/app-debug.apk` (branch `cursor/add-member-marriage-rules-c2cc`, v1.0.15, `com.mughals.familytree`)
- Maestro **2.11.0**

### Results

| Step | Outcome |
|------|---------|
| Full CI smoke (flows 01…) | **Stalled** on `onboarding-screen`; emulator hit **system ANR** (see artifact `q5-emulator-system-anr.png`). |
| **Flow 08** (`08-figma-kuriosity-smoke`) after reboot | Maestro **connected**; **`home-screen` not visible** within 45s — expected on **fresh install** (no demo/onboarding completed). |
| **Flow 09** (`09-demo-onboarding-kay`) | Boot gate passed; **`onboarding-screen` assert failed** (~12 min wait) — likely **NavigationGate** overlay (`Opening onboarding…`) vs route not mounted yet (see `NavigationGate.tsx`). |

### Artifacts (Cloud Agent)

| File | Description |
|------|-------------|
| `/opt/cursor/artifacts/q5-emulator-system-anr.png` | System “isn’t responding” during first smoke attempt |
| `/opt/cursor/artifacts/q5-onboarding-assert-failed.png` | Maestro screenshot when `onboarding-screen` assert failed (flow 09) |
| `/opt/cursor/artifacts/maestro-q5-flow09-failure/` | Maestro debug bundle (`maestro.log`, step screenshots) |
| `~/.maestro/tests/2026-10-08_*` | Full Maestro run folders on the runner |

---

## Root cause hypothesis (onboarding / flow 01 & 09)

`NavigationGate` shows `GenealogyBootScreen` until `StorageContext` + preferences are ready, and again as an **overlay** while redirecting to `/onboarding`. Maestro may assert `onboarding-screen` while the overlay still shows `genealogy-boot-screen` (or neither testID is hittable).

**Related code:** `family-tree-app/components/NavigationGate.tsx`, `app/_layout.tsx` (`testID` on boot via `GenealogyBootScreen`).

**Prior fix themes (Q5):** longer `extendedWaitUntil`, `genealogy-boot-screen` not visible before onboarding, `emulator-boot-timeout` in workflow, avoid cancelling `main` Maestro jobs.

---

## How to run flow 08 locally (correct order)

Flow **08** assumes **home** is already available (demo or live onboarding done). It does **not** call `clearState`.

```bash
cd family-tree-app
export ANDROID_HOME=...   # Android SDK
export PATH="$ANDROID_HOME/platform-tools:$PATH:$HOME/.maestro/bin"
export MAESTRO_DRIVER_STARTUP_TIMEOUT=900000

# Emulator booted, APK installed (debug)
adb install -r android/app/build/outputs/apk/debug/app-debug.apk

# 1) Establish session (pick one)
maestro test --config maestro/config.yaml maestro/flows/09-demo-onboarding-kay.yaml
# or: maestro/flows/01-onboarding-private-archive.yaml

# 2) UI smoke without full onboarding form
maestro test --config maestro/config.yaml maestro/flows/08-figma-kuriosity-smoke.yaml
```

**Fast gate (no emulator):** `npm run test:maestro:contracts`

---

## Recommended next engineering steps

1. **NavigationGate / onboarding:** Expose a single stable `testID` when onboarding route is interactive (or delay overlay until `onboarding-screen` is mounted). Align with open PRs `fix-onboarding-gate-maestro-*` if present.
2. **Flow 08:** Document dependency in flow header comment, or add optional `runFlow` prerequisite in CI script.
3. **CI:** Keep `MAESTRO_DRIVER_STARTUP_TIMEOUT` and `emulator-boot-timeout: 1200` in `mobile-maestro.yml`; prefer **KVM** runners for Q5 green if available.
4. **Physical device:** Run `bash scripts/ci-maestro-smoke.sh` on a USB device for release sign-off ([`DEVICE_SMOKE_FAMILY_TREE.md`](./DEVICE_SMOKE_FAMILY_TREE.md)).

---

## Quick reference — env vars

| Variable | Typical value |
|----------|----------------|
| `MAESTRO_DRIVER_STARTUP_TIMEOUT` | `600000`–`900000` (ms) |
| `BOOT_TIMEOUT_SEC` | `600`–`1200` |
| `MAESTRO_APP_ID` | `com.mughals.familytree` (until U1 #55 ships `com.kuriosity.engineering`) |
| `MAESTRO_CI_FLOWS` | Comma-separated paths under `maestro/flows/` |
