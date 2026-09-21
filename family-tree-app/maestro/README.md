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
