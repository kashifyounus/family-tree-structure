# Family tree visualization (mobile)

## Problem

The native React Native graph (Reanimated + manual layout) was prone to gesture crashes and layout glitches on large trees.

## Chosen approach: embedded WebView canvas

**Local (SQLite) mode** now renders the same graph payload through `GraphWebView`:

- Pan and zoom on a **canvas** inside `react-native-webview` (no network).
- Graph nodes/edges come from the existing `FamilyGraph` builder (same as before).
- Offline-safe; no dependency on the family website.

**Online mode** can continue using the website tree (`/(tabs)/tree` with remote embed) for parity with the web React Flow view.

## Future upgrade (optional)

1. **Hybrid:** WebView loads `${apiUrl}/tree/${code}?embed=1` when online; falls back to canvas when offline.
2. **Native:** `@shopify/react-native-skia` + shared layout from `shared/marriageTreeLayout` if we need 60fps on very large trees without WebView.

## Trade-offs

| Approach | Pros | Cons |
|----------|------|------|
| WebView canvas | Stable zoom, quick to ship | Node tap → profile needs bridge (not yet wired) |
| React Flow in WebView | Pixel parity with web | Heavier bundle, needs bundled JS |
| Native Skia | Best performance | Highest engineering cost |
