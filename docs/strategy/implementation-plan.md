# OmniDub — Implementation Plan
**Date:** 2026-05-30 | **Status:** Active

## Current State (as of 2026-05-30)

**Done:**
- Auth (Supabase SSR), billing (Stripe), job queue
- TTS via RunPod Serverless (production working)
- Local dev stack: Supabase + OmniVoice Docker + Whisper Docker
- Phase 1 (branch `claude/bold-pascal-yJHzc`): Voice Profiles, TTS History, Transcription UI

**Local stack:**
```
npx supabase start                                    # :54321
docker compose -f docker-compose.omnivoice.yml up -d  # :3900 (TTS), :9000 (Whisper)
npm run dev                                           # :3000
```

---

## Phase 2 — Conversion Foundation
**Goal:** Ship the features that directly counter HeyGen/ElevenLabs' top complaints and get users to the aha moment faster.

### 2A — Pre-Generation Cost Estimator
**Why:** ElevenLabs' #1 churn driver. Users burn credits on unknowns. OmniDub shows cost before job starts.
- [ ] Add `estimated_minutes` calculation before job submit (based on text length or video duration)
- [ ] Show "This job will use ~X min from your X min/day plan" in the TTS and dub submit UI
- [ ] Show remaining daily minutes in job submit UI (not just the sidebar bar)
- [ ] Add "No charge if this job fails" copy next to every submit button

### 2B — No-Login Demo on Landing Page
**Why:** 40% of top AI tools deliver value before signup. HeyGen and ElevenLabs don't.
- [ ] Add a TTS demo widget to `app/page.tsx` (home page) — no auth required
- [ ] Accept text input + language select → call a public `/api/demo/tts` route
- [ ] Rate-limit: 1 demo per IP per hour (via Supabase edge function or middleware check)
- [ ] Watermark demo output with "OmniDub — omnidub.com" burned into filename/tags
- [ ] After playback: "Create your free account to keep this + get 5 min/day" CTA

### 2C — Pre-Clone Audio Quality Checker
**Why:** ElevenLabs' undisclosed prerequisite (pro-grade mic) is a primary churn driver. Users blame the product, not their recording.
- [ ] Add `/api/voices/check-quality` route: accept audio file, return quality score
  - Metrics: noise floor, clipping %, sample rate, duration
  - Use WebAudio API in browser for real-time feedback; server-side for uploaded files
- [ ] Block clone creation if score < 40, warn if 40–70, allow with confidence badge if 70+
- [ ] Show specific guidance: "Too much background noise → move to a quieter space"
- [ ] Add in-app mic test on the Voice Profiles page (record 5 sec → instant score)

### 2D — Quick Clone Tier
**Why:** 30-sec sample → usable voice in 60 sec. The "hear my own voice" aha moment should be immediate.
- [ ] Add `clone_tier` field to voice_profiles: `quick | standard | pro`
- [ ] Quick Clone: 30-sec audio, 1 language, lower fidelity → show "Quick" badge
- [ ] Standard Clone: 3 min audio, 5 languages, full fidelity
- [ ] Show fidelity comparison: Quick vs Standard output sample of same sentence

### 2E — Intent Survey at Signup
**Why:** HeyGen is #1 for onboarding because of guided routing. Blank dashboard → choice paralysis → churn.
- [ ] Add onboarding survey to `/auth/callback` (after first login only, check `profiles.onboarded` flag)
- [ ] 3 questions: "What do you create?" / "Primary language pair?" / "How often?"
- [ ] Store answer in `profiles.onboarding_answers` (JSONB)
- [ ] Route to starting template: video creators → dub page; podcasters → transcription+clone page; marketers → TTS page

---

## Phase 3 — Pro Conversion (Multi-Speaker)
**Why:** Every tool caps at 1–3 speakers. Podcasts, interviews, webinars, panels are blocked. These are the highest-LTV professional users.

- [ ] Integrate speaker diarization model (pyannote.audio or whisper-diarization via Docker)
- [ ] API route `/api/jobs/diarize` → returns speaker segments with timestamps
- [ ] Diarization UI: color-coded speaker tracks (up to 8) aligned to waveform
- [ ] Per-speaker voice clone assignment (dropdown: "Use my clone" / "Select from library" / "Auto-generate")
- [ ] Segment-level speaker re-assignment (drag speaker label to reassign a segment)
- [ ] Gate multi-speaker (3+) behind Pro tier; show greyed-out version on Creator

---

## Phase 4 — Revenue Expansion

### Human Review Add-On
- [ ] Add `review_requested` field to jobs
- [ ] Review request UI at job completion: "Want a human to verify this translation? Quick Review $X | Full Review $Y"
- [ ] Stripe one-time payment flow for review add-on
- [ ] Reviewer interface: `/dashboard/review` (internal, role-gated)
- [ ] Annotation system: reviewer comments on segments → user accept/reject
- [ ] Confidence score per segment (from Whisper word-level confidence)

### Play.ht Migration Page
- [ ] Landing page at `/migrate/play-ht`
- [ ] "Moving from Play.ht? Import your voice clones + get 3 months Pro free" offer
- [ ] SEO: target "Play.ht alternative", "Play.ht replacement", "Play.ht migration"

---

## Phase 5 — Enterprise
- [ ] Team seats (invite flow, shared voice library)
- [ ] API access with key management
- [ ] SSO (Supabase supports SAML)
- [ ] Brand kit (logo, colors applied to watermarked outputs)
- [ ] SLA support tier (Crisp/Intercom integration)

---

## UX Rules (apply to every feature we ship)

These are not "nice to have" — they are pre-ship requirements learned from competitor mistakes:

1. **Show cost before confirming.** Every job submit shows minutes it will consume.
2. **No charge for failures.** Failed job → usage_log not incremented. Code: check job status before updating usage_log.
3. **Segment regeneration only.** Never force a full re-render for a single bad sentence.
4. **Confidence score on output.** Dubbing and TTS both show a quality indicator.
5. **Audio quality gate for cloning.** Pre-clone checker runs before training is allowed.
6. **Greyed-out paywalled features.** Show what's behind the paywall — don't hide it.
7. **In-context upgrade modal.** "You've used X of Y minutes today — upgrade for more" shown during the job, not after.

---

## DB Migrations Needed

```sql
-- Phase 2
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS onboarded BOOLEAN DEFAULT FALSE;
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS onboarding_answers JSONB;
ALTER TABLE public.voice_profiles ADD COLUMN IF NOT EXISTS clone_tier TEXT DEFAULT 'standard' CHECK (clone_tier IN ('quick', 'standard', 'pro'));
ALTER TABLE public.voice_profiles ADD COLUMN IF NOT EXISTS quality_score INT;

-- Phase 3
ALTER TABLE public.jobs ADD COLUMN IF NOT EXISTS speaker_count INT;
ALTER TABLE public.jobs ADD COLUMN IF NOT EXISTS speakers JSONB;

-- Phase 4
ALTER TABLE public.jobs ADD COLUMN IF NOT EXISTS confidence_score DECIMAL(4,3);
ALTER TABLE public.jobs ADD COLUMN IF NOT EXISTS review_requested BOOLEAN DEFAULT FALSE;
ALTER TABLE public.jobs ADD COLUMN IF NOT EXISTS review_status TEXT CHECK (review_status IN ('pending', 'in_review', 'completed'));
```
