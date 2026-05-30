# OmniDub — Premium Audio Studio Redesign
**Date:** 2026-05-30  
**Approach:** A — Premium Audio Studio × Gen Z/Alpha  
**Scope:** Full product — every screen, automated test suite

---

## Design System

### Typography
- Headlines: `DM Serif Display` — 56–72px landing, 32–40px in-app, italic emphasis, tracking -0.03em
- Body: `Inter` (replaces DM Sans — tighter at small sizes)
- Mono: `JetBrains Mono` for counters, stats, durations
- Google Fonts import: `Inter:wght@300;400;500;600&family=DM+Serif+Display:ital@0;1&family=JetBrains+Mono:wght@400;500`

### Color Rules
- `--accent: #c8f542` — CTAs, active states, one hero accent per page only
- `--accent-2: #7B61FF` — ambient glow, radial gradients, NOT text
- Base: `#030303` (deeper than current `#080808`)
- Cards: `rgba(255,255,255,0.03)` — visible via glow, not hard borders
- Borders replaced with: `box-shadow: 0 0 0 1px rgba(255,255,255,0.06)`

### Spatial Lighting (key differentiator)
Every major surface gets a radial gradient light source:
```css
/* Hero ambient */
background:
  radial-gradient(ellipse 80% 50% at 50% -10%, rgba(123,97,255,0.18), transparent),
  radial-gradient(ellipse 60% 40% at 80% 60%, rgba(200,245,66,0.06), transparent),
  #030303;
```

### Elevation System
- Level 0: page background `#030303`
- Level 1: cards — `background: rgba(255,255,255,0.025); box-shadow: 0 0 0 1px rgba(255,255,255,0.06), 0 4px 24px rgba(0,0,0,0.4)`
- Level 2: active/focused — `box-shadow: 0 0 0 1px rgba(200,245,66,0.3), 0 8px 32px rgba(200,245,66,0.08)`
- Level 3: modals — `backdrop-filter: blur(40px); background: rgba(8,8,8,0.92)`

### Motion
- Page entry: `fadeIn` 0.4s, 6px Y translate
- Hover: `translateY(-2px)` + shadow intensify, 0.15s
- Press: `scale(0.97)`, 0.1s
- Loading: shimmer sweep across button surface
- State transitions: 0.18s `cubic-bezier(0.4,0,0.2,1)`

### Gen Z/Alpha Principles
- All copy lowercase, personality-first
- Streaks, counters, social proof ambient throughout
- Every state change has a microanimation
- Loud on first impression, calm on repeat use
- 48px touch targets, thumb-first mobile
- No corporate language anywhere

---

## Pages

### Landing Page
- Full-viewport hero: `#030303` + radial purple glow behind demo widget
- DM Serif Display 64px+ headline: `"your voice."` / italic lime `"every language."`
- Demo widget: Level 2 elevated card, voice selector as pills, waveform output with lime glow
- Social proof strip: animated counter + use case list
- Feature cards: 2×2 grid, hover lifts + glow
- Pricing: 2-col, Pro gets gradient border animation
- Nav: frosted glass sticky, more opaque on scroll

### Auth Pages (Login / Signup)
- Split layout: 55% form / 45% animated CSS waveform visualization + rotating quote
- Input focus: `box-shadow: 0 0 0 2px rgba(200,245,66,0.25)`
- Copy: `"welcome back."` / `"let's go."` — lowercase, terse
- Error: inline field-level, red glow
- Full-width lime submit button, `scale(1.02)` hover

### Dashboard Shell
- Sidebar 200px: `rgba(255,255,255,0.015)` bg, inset right shadow instead of border
- Tool nav: left accent bar on active, `translateX(2px)` on hover
- Usage bar at sidebar bottom
- Amber/red ambient top strip at 80%/95% usage
- Streak badge `🔥 N` in header, amber glow when active
- Mobile: bottom nav 4 tabs + spring-eased "more" drawer

### Dashboard Home
- `"hey, [name]."` serif 28px welcome
- Circular usage ring (not bar)
- Last audio: waveform player card with ambient glow if returning user
- Quick actions: 3 cards, `translateY(-3px)` hover, Level 2 glow
- Recent jobs: compact list, expandable

### TTS Tool (highest polish)
- Voice cards 3×2: unique abstract waveform SVG per voice
- Selected: lime ring + Level 2 glow
- Preview button pulses while playing
- Textarea: lime left-border on focus, live char counter
- Cost preview: single muted line
- Generate: 48px, full-width, shimmer loading animation
- Output: spring slide-down, WaveformPlayer + Download + Share + Regenerate
- Watermark notice inline for free users

### Transcription Tool
- Large drag-drop zone, animated border on drag
- File info card after upload
- Animated progress bar
- Output: large scrollable text + copy button

### Voice Profiles
- Card grid: initials avatar (hashed color), name, status pill
- Create: slide-in overlay panel from right

### History
- Expandable rows with inline WaveformPlayer
- Filter pills, weekly stats
- Transcript preview on transcription rows

### Share Page
- Centered single card, blockquote, WaveformPlayer, "make your own →" CTA

---

## Testing Strategy

### API Tests (`tests/api/`) — Node built-in test runner
- `tts.test.ts` — submit → poll → assert completed + output_url
- `transcription.test.ts` — submit → assert completed + transcript non-empty
- `voices.test.ts` — create → list → delete → 404
- `history.test.ts` — list → assert structure
- `auth.test.ts` — signup → login → protected route → signout → 401
- `share.test.ts` — complete job → share → GET public → allowlist fields only

### Type Check
- `npx tsc --noEmit` — runs clean, gates commits

### Pre-commit Hook
- `tsc --noEmit` → API tests → pass = commit allowed

### GitHub Actions CI
- Every push: type check + API tests vs ephemeral local Supabase
- Blocks merge if red

### Test Infrastructure
- `supabase/seed.sql` — test user `test@omnidub.local` / `TestPass123!`
- Tests use real local server (port 3000) + real Supabase (port 54321)
- No mocks — integration tests only
