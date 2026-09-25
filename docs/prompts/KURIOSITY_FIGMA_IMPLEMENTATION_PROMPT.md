# Kuriosity Family Tree — Figma implementation prompt (full)

Use with coding agents + Figma MCP. **This repo** already runs **Expo SDK 57 + Gluestack UI v5 (NativeWind)** and **expo-router** (not React Navigation config files). Adapt navigation wording to `app/(tabs)/*` and stack routes under `app/`.

**Figma:** https://www.figma.com/design/12fvzMXqrDJ9JtbCiBT2P9  
**HD screens:** node `10:10` · **Editable Home:** node `6:4`  
**Local PNG refs:** `docs/ui-samples/hd/kuriosity-hd-*.png`

---

## Prompt (paste below)

Build a React Native (Expo) app that matches the Kuriosity Family Tree HD mockups. Use **Gluestack UI** for primitives. Pixel-faithful to the design system — no improvising colors, spacing, or typography.

### App
- Name: **Kuriosity Family Tree**
- Purpose: private family genealogy archive
- Navigation: **expo-router** — `(tabs)` for Home / Tree / Members / Account + stack routes for detail flows
- Target: iPhone 15 Pro (393×852 logical)

### Design system (strict)

| Token | Value |
|--------|--------|
| Primary | `#1B4332` |
| Background | `#F6F1E7` |
| Surface / cards | `#FFFDF8` |
| Border / divider | `#DDD3C4` |
| Body text | `#1A1814` |
| Secondary text | `#5C5346` |
| Danger (Sign out) | soft red text only |

**Style:** Gluestack / iOS-like · cards/inputs `rounded-xl` (~16px) · inputs **48px** · primary buttons **pill** + soft shadow · horizontal padding **20px** · typography: title ~22px semibold, body 15px, labels 13px medium · active tab `#1B4332`

Map tokens in `global.css` + `theme/appTheme.ts` + `lib/design/kuriosityDesignSystem.ts`.

### Bottom tabs (4)
Home · Tree · Members · Account — outline inactive, primary active + optional dot indicator.

### Screens (8)
1. **Home** — header (logo, KH avatar, bell+2), greeting, stats (Members / Generations / Stories), search, recent activity, **Add family member** CTA  
2. **Tree** — pedigree canvas, Omar/Fatima → … → Kay (You), filter/zoom  
3. **Members** — search, chips All/Living/Generations, person rows  
4. **Account** — profile, archive toggle, preferences, sign out  
5. **Add member** — stack form, Save member  
6. **Person detail** — About/Photos/Stories, bio, Add relation  
7. **Notifications** — grouped Today/Earlier  
8. **Story detail** — Lahore wedding story, related people chips  

### Technical
- Expo + TypeScript · typed mock data module · reusable `StatCard`, `SearchField`, `PersonRow`, `SegmentedControl`  
- Safe areas · no gray placeholder boxes on finished UI · all routes reachable  

### Deliverables
Runnable app, theme tokens, 8 screens, README with run + folder map.

### Agent instructions
1. Call Figma `get_design_context` on node `10:10` (and `6:4` for Home) before coding.  
2. Reuse existing `family-tree-app/components/ui/*` before adding components.  
3. Preserve Maestro `testID`s on Home/Tree/Members.  
4. Match HD exports in `docs/ui-samples/hd/` when Figma MCP is unavailable.
