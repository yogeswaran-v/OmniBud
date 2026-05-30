# OmniDub — Crextio × Gen Z UI/UX Revamp Plan
**Date:** 2026-05-30
**Direction:** Dual-theme (Crextio warm light as default + studio dark toggle) + Crextio structural patterns + missing Gen Z engagement patterns

---

## Source learnings

### From Crextio screenshots (the look to match)
1. **Giant stat numbers** — `91 · 104 · 185`, `264.00 hrs`, `9.7` as oversized hero typography
2. **Bento grid** — asymmetric cards of varying sizes in one composition
3. **Mixed-theme cards** — white, black, and accent (yellow) cards coexist in one view
4. **Circular progress donuts** — big number centered in a ring
5. **Striped/hatched states** — diagonal line texture for incomplete/locked segments
6. **Heavy rounding** — ~20-24px radius everywhere; pill nav with black active tab; pill buttons
7. **Onboarding checklist card** — "Onboarding Task 2/8" with checkmarks (dark card)
8. **Warm gradient backgrounds** — cream → butter-yellow diagonal washes
9. **Real photos / avatars** — headshots, breaking card boundaries

### From Gen Z research (the patterns we're missing)
1. **Live animated counters** — numbers that count up / feel alive
2. **Job completion celebration** — completion is an *event*, not a div appearing
3. **Auto-playing ambient demo** — zero-click "wow" on landing
4. **Onboarding ramp not gate** — first-run checklist, dismissible, chunked
5. **Instant feedback micro-interactions** — every action confirms visually
6. **Theme personalization** — Gen Z loves choosing their look (→ the toggle)
7. **Bite-sized, scannable** — big numbers + short labels over dense text

---

## Color systems

### Light theme (Crextio — DEFAULT)
```
--bg:        #f0ede6   (warm off-white base)
--bg-grad:   linear-gradient(135deg, #efeae1 0%, #f3ecd9 50%, #f7edc8 100%)
--bg-2:      #ffffff   (white cards)
--bg-3:      #faf8f3   (subtle raised)
--surface-contrast: #1a1a1a  (black cards)
--accent:    #f5c842   (golden yellow — highlights, active)
--accent-strong: #1a1a1a (black — primary CTA on light)
--text:      #1a1a1a
--text-2:    #6b6b6b
--text-3:    #9a9a9a
--border:    rgba(0,0,0,0.08)
```

### Dark theme (Studio — TOGGLE)
```
--bg:        #08080f
--bg-grad:   radial mesh navy
--bg-2:      #0d0d1a
--surface-contrast: #f5c842 (amber accent cards)
--accent:    #f97316   (amber)
--text:      #eef0f3
(existing studio dark tokens)
```

---

## Implementation phases

### Phase 1 — Dual-theme foundation
- `app/globals.css`: split tokens into `[data-theme="light"]` (default `:root`) and `[data-theme="dark"]`
- `components/ui/ThemeToggle.tsx`: sun/moon toggle, writes `localStorage` + `document.documentElement.dataset.theme`
- `app/layout.tsx`: inline anti-FOUC script in `<head>` that sets theme before paint; default `light`
- Convert remaining hardcoded colors to variables

### Phase 2 — Crextio structural components (shared)
- `components/ui/GiantStat.tsx` — oversized number + small label
- `components/ui/Bento.tsx` — bento grid wrapper + cells
- `components/ui/Donut.tsx` — circular progress with centered number (enhance UsageRing)
- `components/ui/OnboardingChecklist.tsx` — "get started N/4" dismissible card
- `.hatched` CSS utility — diagonal stripe texture for locked/incomplete

### Phase 3 — Gen Z engagement patterns
- `components/ui/LiveCounter.tsx` — count-up animation with digit feel
- Job completion moment — celebratory reveal in TTSTool (scale + glow + counter bump)
- `components/landing/LandingDemo.tsx` — auto-playing ambient waveform
- Richer gradient backgrounds via `--bg-grad`

### Phase 4 — Apply across screens
- Landing: giant headline + live counter + bento feature grid
- Dashboard home: bento layout (giant stats row + donut + onboarding checklist + recent)
- TTS: completion celebration, mixed-theme output card
- Auth: warm gradient split (light) / studio (dark)
- Pricing: 3-tier with black "popular" card (Crextio style)
- History, voices, transcription: themed cards

### Phase 5 — Verify
- `npx tsc --noEmit` clean
- API tests still pass
- Both themes visually correct, toggle persists, no FOUC

---

## Theme architecture (anti-FOUC)
Inline script in `<head>`:
```js
(function(){try{var t=localStorage.getItem('omnidub-theme')||'light';document.documentElement.dataset.theme=t}catch(e){document.documentElement.dataset.theme='light'}})()
```
All components read CSS variables only — never hardcoded hex. Toggle flips `dataset.theme` + persists.
