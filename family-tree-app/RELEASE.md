# Android APK downloads

Release APKs are built on GitHub Actions (local Gradle — no EAS).

## Latest build

1. Open **[Actions → Android APK release](https://github.com/kashifyounus/family-tree-structure/actions/workflows/android-apk.yml)**.
2. Pick the newest successful run.
3. Download **`mughals-family-tree-apk`** from **Artifacts**.

Tagged releases (`app-v*`) also attach the APK on the **[Releases](https://github.com/kashifyounus/family-tree-structure/releases)** page.

## Install

```bash
adb install -r Mughals-Family-Tree-*-release.apk
```

Or copy the APK to your phone and open it (allow installs from unknown sources if prompted).

## After install

- **Private archive** works offline with no setup.
- **Shared online**: Account → Shared online → enter your family website URL → **Test connection** → **Save address** → sign in.

## Build locally

```bash
cd family-tree-app
export ANDROID_HOME=...   # Android SDK
./scripts/build-apk-local.sh
```

Output: `family-tree-app/dist/Mughals-Family-Tree-<version>-release.apk`
