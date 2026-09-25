# Sprint 5 — Onboarding, polish, Figma parity checklist

Paste after Sprints 1–4.

---

**Scope:**
1. **Onboarding** — Kuriosity hero (logo + Family Tree), Figma-toned copy, pill CTAs, **“Start as Kay Hassan”** preview archive (registers showcase household, keeps pedigree mock when ≤1 member).
2. **Showcase tree rule** — `shouldShowShowcasePedigree` when local mode and **≤1** member (Kay-only archives still see Omar→Kay canvas).
3. **UI polish** — tab bar labels, `ProfileSegmentBar` for person segments, onboarding/account invite → `/add-member`.
4. **Docs** — [`FIGMA_IMPLEMENTATION_STATUS.md`](../FIGMA_IMPLEMENTATION_STATUS.md) checklist for all 8 screens.
5. **Tests** — `kuriosityFigmaParity.test.ts` (tokens + showcase data smoke).

**Out of scope:** Rebrand package id, removing legacy Tools routes.

**Verify:** `npm test`; fresh onboarding → Kay path → Home + Tree showcase.
