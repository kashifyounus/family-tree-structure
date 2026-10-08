/**
 * U1 package id migration — runtime id stays legacy until a dedicated store release.
 * @see docs/APP_ID_MIGRATION.md
 */
export const ANDROID_PACKAGE_LEGACY = "com.mughals.familytree";
export const ANDROID_PACKAGE_TARGET = "com.kuriosity.engineering";
export const IOS_BUNDLE_LEGACY = "com.mughals.familytree";
export const IOS_BUNDLE_TARGET = "com.kuriosity.engineering";

/** Matches `app.json` until migration release. */
export const ACTIVE_ANDROID_PACKAGE = ANDROID_PACKAGE_LEGACY;
