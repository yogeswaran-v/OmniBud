# OmniDub — Product Strategy
**Date:** 2026-05-30 | **Status:** Active

## Positioning

**One sentence:** The only AI dubbing tool that shows you the cost before you click, sounds like you actually recorded it, and works on videos with more than one speaker.

**Counter-position to:** HeyGen (pricing deception) + ElevenLabs (credit opacity + voice clone friction)

**Target user:** Multilingual content creators (YouTube, LinkedIn, TikTok, podcast hosts) producing 5–60 min videos who need reliable dubbing at a price they can predict.

---

## Pricing Model

### Rationale
ElevenLabs' effective cost is 2.2–3× advertised due to credit burn on failures/regenerations. HeyGen hides lip-sync costs behind premium credits. Both create structural user dissatisfaction. OmniDub's pricing advantage is *transparency*, not necessarily lower absolute price.

### Proposed Tiers

| Tier | Price | Limits | Key Gate |
|---|---|---|---|
| Free | $0 | 5 min/day TTS, 1 min video dub/day (watermarked), 1 Quick Clone | Watermark + commercial rights |
| Creator | $19/mo | 120 min/day TTS, 30 min/day dubbing (no watermark), 3 voice profiles, 20 languages | Commercial rights, Full Clone, lip-sync clean output |
| Pro | $49/mo | Unlimited TTS, 120 min/day dubbing, unlimited profiles, all 20+ languages, API | Multi-speaker (up to 8), API, priority queue |
| Business | $149/mo | Everything Pro + 5 seats, team profiles, Human Review credits | Team features, SLA support |

**Flat per-minute dubbing pricing on-screen before every job.** No credits. No surprises.

### Free Tier Design
Give enough to complete one real project (not just a demo):
- 1 min/day video dub with watermark → user sees the product work on their actual content
- 5 min/day TTS → enough to produce a real short voiceover
- Quick Clone (30-sec sample) → lets them hear their own voice; quality difference vs Full Clone creates upgrade pull

---

## Onboarding Flow (Target: <90 seconds to aha moment)

```
Landing page
  └─ Pre-signup demo: "Paste a YouTube URL" or "Upload a 60-sec clip"
       └─ Processes → shows dubbed output, watermarked, no account needed
            └─ "Save your result / create more" → sign up gate
                 └─ 3-question intent survey:
                      "What do you create?" (video / podcast / voiceover / other)
                      "Primary language pair?" (e.g. English → Spanish)
                      "How often?" (just trying it / weekly / daily)
                 └─ Routed to most relevant template:
                      Video creator → "Dub my video" flow
                      Podcaster → "Clone + transcribe" flow
                      Marketer → "Generate voiceover" flow
```

**Why this works:** HeyGen's own UX research identified "wrong primary CTA" and "choice overload" as its #1 onboarding failure. We ship the fix: intent-based routing, demo before friction.

---

## UX Non-Negotiables

These ship with every feature, not as polish-later additions:

1. **Pre-generation cost preview.** Every job shows "This will use X minutes from your plan" before the user confirms. No exceptions.

2. **No charge for failed jobs.** If OmniDub fails, the user pays nothing. Show this explicitly in UI ("You are never charged for failed jobs").

3. **Segment-level regeneration.** Re-render one sentence, not the whole file. Charge only for the re-processed segment.

4. **Confidence score per output.** Every dubbed segment shows a confidence indicator. Below 80% is flagged for user review.

5. **Pre-clone audio quality check.** Before training a voice clone, score the uploaded sample (noise, clipping, reverb) and surface specific guidance. Do not let a user train a low-quality clone and blame the product.

---

## Differentiated Features (Build Order)

### Phase 2 — Conversion Foundation
1. Pre-generation cost estimator (blocks HeyGen's #1 complaint)
2. No-login demo on landing page (converts before account creation)
3. Intent survey + routed onboarding (3 paths: dub / clone / voiceover)
4. Pre-clone audio quality checker
5. Quick Clone tier (30-sec sample → usable voice in 60 sec)

### Phase 3 — Pro Conversion
1. Multi-speaker diarization (up to 8 speakers, color-coded tracks)
2. Per-speaker voice clone assignment in editor
3. Segment-level speaker re-assignment
4. Speaker timeline aligned to video waveform

### Phase 4 — Revenue Expansion
1. Human Review add-on (freelance reviewer network)
2. In-platform annotation (reviewer ↔ user segment comments)
3. Confidence score auto-flagging for review
4. Play.ht migration landing page (capture orphaned user base)

### Phase 5 — Enterprise
1. Team seats + shared voice library
2. API access (developer/agency segment)
3. SSO + brand kit
4. SLA support tier

---

## Revenue Model

**Primary:** Monthly subscriptions (Creator $19, Pro $49, Business $149)
**Secondary:** Human Review add-on (per-job service fee, 20–30% margin)
**Tertiary:** API usage overage (above plan limits, per-minute rate)

**Anti-patterns to avoid:**
- No premium credit obfuscation
- No charging for failed generations
- No gating lip-sync behind credits (it's the core aha moment — it goes on free tier with watermark)
- No annual-billing sleight-of-hand ("24 hrs/year" sounds like a lot; "2 hrs/month" does not)

---

## Metrics to Track

| Metric | Target | Notes |
|---|---|---|
| Time to first dubbed output | < 90 sec | From landing page, no account |
| Free→Paid conversion | > 8% | Industry avg 2–5%; targeting higher via aha moment design |
| Month-1 churn | < 15% | Primary driver: billing surprise prevention |
| NPS | > 40 | ElevenLabs NPS estimated 20–30 based on review sentiment |
| Support ticket rate | < 5% of MAU | Target: users don't need support because the UI answers their question |
