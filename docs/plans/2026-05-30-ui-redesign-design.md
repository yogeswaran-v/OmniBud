# OmniDub UI Redesign — Design Doc
**Date:** 2026-05-30 | **Status:** Approved → Building

## Positioning
User-centric, conversion-optimised, Gen Z/Alpha aesthetic.
Counter-position: transparent pricing vs HeyGen deception, value-before-signup vs ElevenLabs friction.

## Design Tokens
- Background: `#080808` with 4% grain overlay
- Surface: `#0f0f0f`, `#141414`
- Border: `#1e1e1e`, `#2a2a2a`
- Text: `#e8e8e8`, `#888`, `#444`
- Accent primary: `#c8f542` (acid green)
- Accent secondary: `#7B61FF` (electric violet)
- Danger: `#e05555` | Warning: `#f0a030`

## Aesthetic Language
- Grain/noise texture overlay at 4% opacity (premium, not flat)
- Glassmorphism: `backdrop-filter: blur(20px)` on modals/overlays
- Gradient borders on selected states (green → violet sweep)
- Breathing idle animations on waveform bars
- Lowercase copy, period-terminated headlines ("your voice. every language.")
- First-win particle burst on job #1 completion
- Streak badge in dashboard header

## Pages & Components

### Landing Page (`app/page.tsx`)
- Demo-first hero: text area + voice selector + "generate" button, no login required
- Rate limit: 1 generation/IP/hour; on limit show countdown + signup CTA
- After generation: CSS waveform player inline, "save & get 5 min/day free →" gate
- Live counter: "X voices generated today" with CSS increment animation
- Below fold: 3-column feature strip, transparent pricing vs competitors, footer
- OG metadata for social unfurl

### Dashboard Home (`app/dashboard/page.tsx`)
- Welcome + streak badge ("🔥 4-day streak")
- Today's usage bar (amber >80%, red >95%)
- 3 quick-action cards: Generate TTS / Transcribe / Clone Voice
- Recent jobs (last 3) with inline mini waveform for completed TTS
- Return-visit hook: last completed audio shown prominently if >1 day ago

### Dashboard Shell (`components/layout/DashboardShell.tsx`)
- Desktop: sidebar 210px with all tools listed
- Locked tools (Voice Clone, Video Dub): dimmed + 🔒 icon, clicking → upgrade modal
- Usage states: 50% = sidebar text nudge, 80% = amber banner, 100% = red banner + "Upgrade or come back tomorrow"
- Mobile: bottom nav bar (5 icons), sidebar collapses
- Streak badge in top nav

### TTS Tool (`components/jobs/TTSTool.tsx`)
- Voice cards grid (2×3), each with name/accent/tone + ▶ preview button (pre-recorded sample)
- Pro voices (2 of 6): visible, preview works, selecting shows inline "requires Pro" message
- Language pills: 3 free highlighted, rest shown + locked with tooltip
- Text area with live char count + estimated minutes ("~0.3 min")
- Pre-generation cost line: "uses 0.3 of your 4.7 min remaining · Pro gets 120 min/day"
- Waveform output: 30 animated bars, play/pause, duration, Download, Regenerate, Share
- Keyboard: Cmd+Enter = submit, Space = play/pause, R = regenerate
- First job ever: particle burst on completion

### History (`components/jobs/HistoryList.tsx`)
- Stat line: "you've generated X min of audio this week"
- Filter: All / TTS / Transcription tabs
- TTS rows: expand to waveform player + download + share
- Transcription rows: expand to full transcript + copy button
- Failed rows: error reason + "Try again" (pre-fills same input)
- Empty state: "nothing yet — let's fix that" + quick-action links

### Upgrade Modal (`components/ui/UpgradeModal.tsx`)
- Glassmorphism panel, backdrop blur
- Contextual headline based on trigger (daily limit / locked voice / locked feature)
- Side-by-side Free vs Pro comparison, triggered feature highlighted green on Pro side
- Annual toggle pre-selected ("Save 20% — most popular")
- CTA: "Upgrade to Pro — $19/mo" + "Cancel anytime. No contracts." below

### Share Page (`app/share/[id]/page.tsx`)
- Public page, no auth
- Waveform player with the shared audio
- Text that was generated shown below
- "Make your own on OmniDub →" CTA with signup link
- OG image tag with waveform preview

## New API Routes
- `POST /api/demo/tts` — no-auth TTS, IP rate limited, watermarked filename
- `GET /api/share/[id]` — returns public completed job data

## DB Migration
```sql
ALTER TABLE public.profiles
  ADD COLUMN IF NOT EXISTS streak_count INT NOT NULL DEFAULT 0,
  ADD COLUMN IF NOT EXISTS last_active_date DATE;
```

## Components
- `GrainOverlay` — fixed SVG filter noise overlay
- `WaveformPlayer` — reusable audio player with 30 animated bars + Web Audio visualisation
- `VoiceCard` — voice card with preview playback
- `Skeleton` — animated loading placeholders
- `Toast` — bottom-right auto-dismiss notifications
- `ParticleBurst` — 20 acid-green particles on first completion
