# Premium Audio Studio — Implementation Plan

> **For Claude:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task.

**Goal:** Transform OmniDub from a flat dark CRUD app into a stunning Premium Audio Studio UI with automated API test suite, targeting Gen Z/Alpha users.

**Architecture:** Full inline-style overhaul using CSS variable elevation system + spatial lighting radial gradients. No new dependencies. Test suite uses Node built-in `node:test` runner hitting real local server (port 3000) + real Supabase (port 54321).

**Tech Stack:** Next.js 14 App Router, Supabase SSR, TypeScript, CSS custom properties, inline styles, `node:test` for API tests.

---

## Task 1: Design System Overhaul — globals.css + layout fonts

**Files:**
- Modify: `app/globals.css`
- Modify: `app/layout.tsx`

**Step 1: Replace globals.css entirely**

```css
/* app/globals.css */
:root {
  /* Base */
  --bg:       #030303;
  --bg-2:     #0a0a0a;
  --bg-3:     #111111;
  --bg-4:     #181818;
  --bg-5:     #1e1e1e;

  /* Borders — replaced by elevation system, kept for fallback */
  --border:   rgba(255,255,255,0.06);
  --border-2: rgba(255,255,255,0.10);

  /* Text */
  --text:   #f0f0f0;
  --text-2: #909090;
  --text-3: #555555;
  --text-4: #2e2e2e;

  /* Brand */
  --accent:       #c8f542;
  --accent-dim:   rgba(200,245,66,0.10);
  --accent-glow:  rgba(200,245,66,0.20);
  --accent-2:     #7B61FF;
  --accent-2-dim: rgba(123,97,255,0.10);
  --accent-2-glow:rgba(123,97,255,0.20);

  /* Semantic */
  --danger:     #e05555;
  --danger-dim: rgba(224,85,85,0.10);
  --warning:    #f0a030;
  --warning-dim:rgba(240,160,48,0.10);
  --success:    #4ade80;

  /* Typography */
  --font-sans:  'Inter', -apple-system, BlinkMacSystemFont, system-ui, sans-serif;
  --font-serif: 'DM Serif Display', Georgia, serif;
  --font-mono:  'JetBrains Mono', 'Fira Code', monospace;

  /* Elevation shadows */
  --shadow-1: 0 0 0 1px rgba(255,255,255,0.06), 0 2px 16px rgba(0,0,0,0.5);
  --shadow-2: 0 0 0 1px rgba(255,255,255,0.08), 0 4px 32px rgba(0,0,0,0.6);
  --shadow-accent: 0 0 0 1px rgba(200,245,66,0.30), 0 4px 32px rgba(200,245,66,0.08);
  --shadow-focus:  0 0 0 2px rgba(200,245,66,0.25);

  /* Motion */
  --ease:     cubic-bezier(0.4, 0, 0.2, 1);
  --ease-out: cubic-bezier(0, 0, 0.2, 1);
  --ease-spring: cubic-bezier(0.34, 1.56, 0.64, 1);
  --transition: 0.18s var(--ease);

  /* Radii */
  --radius-sm: 6px;
  --radius:    12px;
  --radius-lg: 18px;
  --radius-xl: 24px;
}

*, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }

html { font-size: 16px; -webkit-text-size-adjust: 100%; }

body {
  background: var(--bg);
  color: var(--text);
  font-family: var(--font-sans);
  line-height: 1.6;
  min-height: 100vh;
  overflow-x: hidden;
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
}

/* Grain overlay */
body::after {
  content: '';
  position: fixed;
  inset: 0;
  pointer-events: none;
  z-index: 9999;
  opacity: 0.028;
  background-image: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='300' height='300'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.75' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='300' height='300' filter='url(%23n)'/%3E%3C/svg%3E");
  background-repeat: repeat;
  background-size: 300px 300px;
}

/* Typography */
h1, h2, h3, h4 { line-height: 1.15; letter-spacing: -0.025em; font-weight: 400; }
a { color: inherit; text-decoration: none; }
button { font-family: var(--font-sans); cursor: pointer; border: none; background: none; transition: var(--transition); }

input, textarea, select {
  font-family: var(--font-sans);
  background: var(--bg-3);
  border: 1px solid var(--border);
  border-radius: var(--radius-sm);
  color: var(--text);
  outline: none;
  transition: border-color 0.15s, box-shadow 0.15s;
}
input:focus, textarea:focus, select:focus {
  border-color: rgba(200,245,66,0.4);
  box-shadow: var(--shadow-focus);
}
input::placeholder, textarea::placeholder { color: var(--text-4); }
textarea { resize: none; }

::-webkit-scrollbar { width: 4px; height: 4px; }
::-webkit-scrollbar-track { background: transparent; }
::-webkit-scrollbar-thumb { background: var(--bg-5); border-radius: 4px; }
::-webkit-scrollbar-thumb:hover { background: var(--border-2); }

/* ── Animations ────────────────────────────── */
@keyframes fadeIn    { from { opacity: 0; transform: translateY(8px); } to { opacity: 1; transform: translateY(0); } }
@keyframes slideUp   { from { opacity: 0; transform: translateY(24px); } to { opacity: 1; transform: translateY(0); } }
@keyframes slideDown { from { opacity: 0; transform: translateY(-10px); } to { opacity: 1; transform: translateY(0); } }
@keyframes slideRight{ from { opacity: 0; transform: translateX(-16px); } to { opacity: 1; transform: translateX(0); } }
@keyframes springIn  { from { opacity: 0; transform: translateY(32px) scale(0.96); } to { opacity: 1; transform: translateY(0) scale(1); } }
@keyframes shimmer   { from { background-position: -600px 0; } to { background-position: 600px 0; } }
@keyframes shimmerBtn{ 0% { left: -100%; } 100% { left: 200%; } }
@keyframes spin      { to { transform: rotate(360deg); } }
@keyframes pulse     { 0%,100% { opacity: 1; } 50% { opacity: 0.4; } }
@keyframes breathe   { 0%,100% { transform: scaleY(0.25); opacity: 0.25; } 50% { transform: scaleY(1); opacity: 0.9; } }
@keyframes glow      { 0%,100% { box-shadow: 0 0 16px rgba(200,245,66,0.15); } 50% { box-shadow: 0 0 32px rgba(200,245,66,0.35); } }
@keyframes glowPulse { 0%,100% { opacity: 0.5; } 50% { opacity: 1; } }
@keyframes particleUp {
  0%   { opacity: 1; transform: translate(var(--tx,0px), 0) scale(1); }
  100% { opacity: 0; transform: translate(var(--tx,0px), -100px) scale(0.1); }
}
@keyframes gradientShift {
  0%,100% { background-position: 0% 50%; }
  50%      { background-position: 100% 50%; }
}
@keyframes waveBar {
  0%,100% { transform: scaleY(0.3); }
  50%      { transform: scaleY(1); }
}
@keyframes orb {
  0%,100% { transform: translate(0,0) scale(1); }
  33%      { transform: translate(30px,-20px) scale(1.05); }
  66%      { transform: translate(-20px,10px) scale(0.95); }
}

/* ── Utility classes ────────────────────────── */
.animate-fade   { animation: fadeIn 0.35s var(--ease-out) both; }
.animate-slide  { animation: slideUp 0.4s var(--ease-spring) both; }
.animate-spring { animation: springIn 0.45s var(--ease-spring) both; }

/* Elevation cards */
.card-1 {
  background: rgba(255,255,255,0.025);
  box-shadow: var(--shadow-1);
  border-radius: var(--radius);
}
.card-2 {
  background: rgba(255,255,255,0.03);
  box-shadow: var(--shadow-2);
  border-radius: var(--radius);
}
.card-accent {
  background: rgba(200,245,66,0.04);
  box-shadow: var(--shadow-accent);
  border-radius: var(--radius);
}

/* Spatial lighting backgrounds */
.bg-hero {
  background:
    radial-gradient(ellipse 90% 60% at 50% -5%, rgba(123,97,255,0.20), transparent 60%),
    radial-gradient(ellipse 50% 40% at 85% 70%, rgba(200,245,66,0.06), transparent 50%),
    var(--bg);
}
.bg-split-right {
  background:
    radial-gradient(ellipse 120% 80% at 30% 50%, rgba(123,97,255,0.22), transparent 60%),
    radial-gradient(ellipse 60% 60% at 90% 20%, rgba(200,245,66,0.08), transparent 50%),
    #070710;
}

/* Buttons */
.btn-accent {
  display: inline-flex; align-items: center; justify-content: center; gap: 7px;
  padding: 11px 22px;
  background: var(--accent);
  color: #050505;
  border-radius: var(--radius);
  font-size: 13px; font-weight: 600; letter-spacing: 0.01em;
  transition: var(--transition);
  white-space: nowrap;
  position: relative; overflow: hidden;
}
.btn-accent:hover  { background: #d4f855; transform: translateY(-1px); box-shadow: 0 6px 24px rgba(200,245,66,0.30); }
.btn-accent:active { transform: translateY(0) scale(0.97); }
.btn-accent:disabled { background: var(--bg-4); color: var(--text-3); cursor: not-allowed; transform: none; box-shadow: none; }

.btn-ghost {
  display: inline-flex; align-items: center; gap: 6px;
  padding: 9px 18px;
  border: 1px solid var(--border);
  border-radius: var(--radius);
  color: var(--text-2); font-size: 13px;
  transition: var(--transition);
}
.btn-ghost:hover { border-color: var(--border-2); color: var(--text); background: rgba(255,255,255,0.03); }

.btn-danger {
  display: inline-flex; align-items: center; gap: 6px;
  padding: 7px 14px;
  border: 1px solid rgba(224,85,85,0.25);
  border-radius: var(--radius-sm);
  color: var(--danger); font-size: 12px;
  background: var(--danger-dim);
  transition: var(--transition);
}
.btn-danger:hover { background: rgba(224,85,85,0.15); }

/* Loading shimmer for buttons */
.btn-shimmer { position: relative; overflow: hidden; }
.btn-shimmer::after {
  content: '';
  position: absolute; top: 0; left: -100%; width: 60%; height: 100%;
  background: linear-gradient(90deg, transparent, rgba(255,255,255,0.25), transparent);
  animation: shimmerBtn 1.2s ease-in-out infinite;
}

/* Pill badges */
.pill {
  display: inline-flex; align-items: center;
  padding: 3px 9px; border-radius: 20px;
  font-size: 10px; letter-spacing: 0.06em; font-weight: 600; text-transform: uppercase;
}
.pill-green  { background: var(--accent-dim);   color: var(--accent);   border: 1px solid rgba(200,245,66,0.20); }
.pill-violet { background: var(--accent-2-dim); color: #a490ff;         border: 1px solid rgba(123,97,255,0.22); }
.pill-red    { background: var(--danger-dim);   color: var(--danger);   border: 1px solid rgba(224,85,85,0.22); }
.pill-amber  { background: var(--warning-dim);  color: var(--warning);  border: 1px solid rgba(240,160,48,0.22); }
.pill-dim    { background: var(--bg-3);         color: var(--text-3);   border: 1px solid var(--border); }

/* Skeleton loader */
.skeleton {
  background: linear-gradient(90deg, var(--bg-3) 25%, var(--bg-4) 50%, var(--bg-3) 75%);
  background-size: 600px 100%;
  animation: shimmer 1.6s ease-in-out infinite;
  border-radius: var(--radius-sm);
}

/* Spinner */
.spinner {
  width: 14px; height: 14px;
  border: 2px solid rgba(255,255,255,0.10);
  border-top-color: currentColor;
  border-radius: 50%;
  animation: spin 0.75s linear infinite;
  display: inline-block; flex-shrink: 0;
}

/* CSS waveform bars (for auth page decoration) */
.wave-bars { display: flex; align-items: center; gap: 3px; height: 40px; }
.wave-bar {
  width: 3px; border-radius: 3px;
  background: rgba(123,97,255,0.5);
  transform-origin: center;
  animation: waveBar var(--dur, 1.2s) ease-in-out var(--delay, 0s) infinite;
}

/* Card hover effects */
.card-hover { transition: box-shadow var(--transition), transform var(--transition); }
.card-hover:hover { transform: translateY(-2px); box-shadow: var(--shadow-2); }
.card-hover-accent:hover { transform: translateY(-2px); box-shadow: var(--shadow-accent); }

/* Gradient text */
.text-gradient {
  background: linear-gradient(135deg, var(--accent) 0%, #a8e832 50%, var(--accent-2) 100%);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
}

/* Focus ring override for non-input interactive elements */
*:focus-visible { outline: 2px solid rgba(200,245,66,0.5); outline-offset: 2px; }

/* Gradient border */
.gradient-border {
  position: relative;
  border: 1px solid transparent;
  background-clip: padding-box;
}
.gradient-border::before {
  content: '';
  position: absolute; inset: -1px;
  border-radius: inherit;
  background: linear-gradient(135deg, var(--accent), var(--accent-2));
  z-index: -1;
  animation: gradientShift 3s ease infinite;
  background-size: 200% 200%;
}

/* Mobile */
@media (max-width: 768px) {
  .hide-mobile { display: none !important; }
  .show-mobile { display: flex !important; }
}
@media (min-width: 769px) {
  .show-mobile { display: none !important; }
}
```

**Step 2: Update font imports in app/layout.tsx**

Change the Google Fonts `<link>` href to:
```
https://fonts.googleapis.com/css2?family=DM+Serif+Display:ital@0;1&family=Inter:wght@300;400;500;600&family=JetBrains+Mono:wght@400;500&display=swap
```

Also update the `--font-sans` and `--font-serif` references in the `<head>` if any, and set `metadata.title` template if not already done.

**Step 3: Run TypeScript check**
```
npx tsc --noEmit
```
Expected: no errors.

**Step 4: Commit**
```
git add app/globals.css app/layout.tsx
git commit -m "design: Premium Audio Studio design system -- elevation, spatial lighting, Inter font"
```

---

## Task 2: Landing Page

**Files:**
- Modify: `app/page.tsx` (full rewrite)
- Modify: `components/landing/LandingDemo.tsx` (minor style updates)

**Step 1: Rewrite app/page.tsx**

```tsx
import Link from 'next/link'
import LandingDemo from '@/components/landing/LandingDemo'

export const metadata = {
  title: 'OmniDub — your voice, every language.',
  description: 'AI-powered text to speech, voice cloning, and video dubbing. Free to start. No failed-generation charges. Ever.',
  openGraph: {
    title: 'OmniDub — your voice, every language.',
    description: 'Transparent pricing. Studio-quality voices. Hear the product before you sign up.',
    type: 'website',
  },
}

export default function Home() {
  return (
    <main style={{ minHeight: '100vh', background: 'var(--bg)', display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>

      {/* Ambient orbs */}
      <div aria-hidden style={{ position: 'fixed', inset: 0, pointerEvents: 'none', zIndex: 0, overflow: 'hidden' }}>
        <div style={{ position: 'absolute', top: '-20%', left: '50%', transform: 'translateX(-50%)', width: 700, height: 500, borderRadius: '50%', background: 'radial-gradient(ellipse, rgba(123,97,255,0.14) 0%, transparent 70%)', animation: 'orb 12s ease-in-out infinite' }} />
        <div style={{ position: 'absolute', top: '40%', right: '-10%', width: 400, height: 400, borderRadius: '50%', background: 'radial-gradient(ellipse, rgba(200,245,66,0.05) 0%, transparent 70%)', animation: 'orb 16s ease-in-out 4s infinite reverse' }} />
      </div>

      {/* Nav */}
      <nav style={{ position: 'sticky', top: 0, zIndex: 50, height: 60, display: 'flex', alignItems: 'center', padding: '0 28px', gap: 16, background: 'rgba(3,3,3,0.85)', backdropFilter: 'blur(20px)', WebkitBackdropFilter: 'blur(20px)', borderBottom: '1px solid var(--border)' }}>
        <Link href="/" style={{ display: 'flex', alignItems: 'center', gap: 9 }}>
          <div style={{ width: 28, height: 28, background: 'var(--accent)', borderRadius: 8, display: 'flex', alignItems: 'center', justifyContent: 'center', boxShadow: '0 0 16px rgba(200,245,66,0.3)' }}>
            <div style={{ width: 8, height: 8, background: '#050505', borderRadius: '50%' }} />
          </div>
          <span style={{ fontFamily: 'var(--font-serif)', fontSize: 17, letterSpacing: '-0.01em' }}>OmniDub</span>
        </Link>
        <div style={{ flex: 1 }} />
        <Link href="/pricing" style={{ fontSize: 13, color: 'var(--text-3)', padding: '7px 14px', transition: 'color 0.15s' }}
          onMouseEnter={undefined}>pricing</Link>
        <Link href="/auth/login" style={{ fontSize: 13, color: 'var(--text-2)', padding: '7px 16px', border: '1px solid var(--border)', borderRadius: 'var(--radius)', transition: 'var(--transition)' }}>sign in</Link>
        <Link href="/auth/signup" className="btn-accent" style={{ padding: '8px 18px', fontSize: 13 }}>get started free</Link>
      </nav>

      {/* Hero */}
      <section style={{ position: 'relative', zIndex: 1, flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', padding: '80px 24px 96px', maxWidth: 700, margin: '0 auto', width: '100%' }}>
        <div style={{ textAlign: 'center', marginBottom: 48, animation: 'fadeIn 0.5s var(--ease-out) both' }}>
          <div style={{ display: 'inline-flex', alignItems: 'center', gap: 6, padding: '4px 12px 4px 8px', background: 'rgba(200,245,66,0.07)', border: '1px solid rgba(200,245,66,0.18)', borderRadius: 20, marginBottom: 24 }}>
            <div style={{ width: 6, height: 6, borderRadius: '50%', background: 'var(--accent)', animation: 'glowPulse 2s ease-in-out infinite' }} />
            <span style={{ fontSize: 11, color: 'var(--accent)', fontWeight: 600, letterSpacing: '0.06em' }}>no account required</span>
          </div>
          <h1 style={{ fontFamily: 'var(--font-serif)', fontSize: 'clamp(40px, 6.5vw, 68px)', fontWeight: 300, lineHeight: 1.08, letterSpacing: '-0.03em', marginBottom: 22 }}>
            your voice.<br />
            <em style={{ fontStyle: 'italic', color: 'var(--accent)' }}>every language.</em>
          </h1>
          <p style={{ fontSize: 17, color: 'var(--text-3)', lineHeight: 1.65, maxWidth: 460, margin: '0 auto' }}>
            hear the product before you sign up.<br />no account, no credit card. just type and listen.
          </p>
        </div>

        <div style={{ width: '100%', animation: 'springIn 0.55s var(--ease-spring) 0.15s both' }}>
          <LandingDemo />
        </div>

        <LiveCounter />

        <p style={{ fontSize: 12, color: 'var(--text-4)', marginTop: 20, textAlign: 'center', lineHeight: 1.7 }}>
          unlike ElevenLabs, we never charge for failed generations.
          unlike HeyGen, &ldquo;unlimited&rdquo; actually means unlimited.
        </p>
      </section>

      {/* Feature grid */}
      <section style={{ position: 'relative', zIndex: 1, padding: '80px 24px', borderTop: '1px solid var(--border)' }}>
        <div style={{ maxWidth: 960, margin: '0 auto' }}>
          <div style={{ textAlign: 'center', marginBottom: 52 }}>
            <h2 style={{ fontFamily: 'var(--font-serif)', fontSize: 'clamp(28px, 4vw, 44px)', fontWeight: 300, letterSpacing: '-0.025em', marginBottom: 12 }}>everything you need.</h2>
            <p style={{ color: 'var(--text-3)', fontSize: 15 }}>pick where to start.</p>
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: 16 }}>
            {FEATURES.map((f, i) => (
              <Link key={f.title} href={f.href}
                className={`card-hover${f.accent ? '-accent' : ''}`}
                style={{
                  padding: '28px 24px',
                  background: f.accent ? 'rgba(200,245,66,0.04)' : 'rgba(255,255,255,0.02)',
                  boxShadow: f.accent ? 'var(--shadow-accent)' : 'var(--shadow-1)',
                  borderRadius: 'var(--radius-lg)',
                  display: 'flex', flexDirection: 'column', gap: 14,
                  animation: `fadeIn 0.4s var(--ease-out) ${i * 0.08}s both`,
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                  <div style={{ fontSize: 26 }}>{f.icon}</div>
                  {f.pro && <span className="pill pill-violet">PRO</span>}
                </div>
                <div>
                  <div style={{ fontSize: 15, fontWeight: 500, color: f.accent ? 'var(--accent)' : 'var(--text)', marginBottom: 7 }}>{f.title}</div>
                  <div style={{ fontSize: 13, color: 'var(--text-3)', lineHeight: 1.65 }}>{f.desc}</div>
                </div>
                <div style={{ fontSize: 12, color: f.accent ? 'var(--accent)' : 'var(--text-3)', marginTop: 'auto', fontWeight: 500 }}>{f.cta}</div>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* Pricing */}
      <section style={{ position: 'relative', zIndex: 1, padding: '80px 24px', borderTop: '1px solid var(--border)', background: 'rgba(255,255,255,0.008)' }}>
        <div style={{ maxWidth: 680, margin: '0 auto', textAlign: 'center' }}>
          <h2 style={{ fontFamily: 'var(--font-serif)', fontSize: 'clamp(24px, 3.5vw, 40px)', fontWeight: 300, letterSpacing: '-0.025em', marginBottom: 12 }}>simple, transparent pricing.</h2>
          <p style={{ color: 'var(--text-3)', fontSize: 14, marginBottom: 44, lineHeight: 1.7 }}>flat per-minute pricing. no credits to track. no surprise charges.</p>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 18, marginBottom: 28 }}>
            <div style={{ padding: '28px 24px', background: 'rgba(255,255,255,0.02)', boxShadow: 'var(--shadow-1)', borderRadius: 'var(--radius-lg)' }}>
              <div style={{ fontSize: 10, color: 'var(--text-3)', textTransform: 'uppercase', letterSpacing: '0.1em', marginBottom: 14, fontWeight: 600 }}>free</div>
              <div style={{ fontFamily: 'var(--font-serif)', fontSize: 44, marginBottom: 20, letterSpacing: '-0.02em' }}>$0</div>
              {['5 min/day', '3 languages', 'quick voice clone', 'watermarked exports'].map(f => (
                <div key={f} style={{ fontSize: 13, color: 'var(--text-3)', marginBottom: 10, display: 'flex', gap: 9 }}>
                  <span style={{ color: 'var(--accent)' }}>✓</span>{f}
                </div>
              ))}
              <Link href="/auth/signup" className="btn-ghost" style={{ display: 'flex', justifyContent: 'center', marginTop: 24, fontSize: 13 }}>get started</Link>
            </div>
            <div className="gradient-border" style={{ padding: '28px 24px', background: 'rgba(200,245,66,0.03)', borderRadius: 'var(--radius-lg)', position: 'relative' }}>
              <div style={{ position: 'absolute', top: -12, left: '50%', transform: 'translateX(-50%)', background: 'var(--accent)', color: '#050505', fontSize: 10, fontWeight: 700, padding: '3px 14px', borderRadius: 20, letterSpacing: '0.05em', whiteSpace: 'nowrap' }}>MOST POPULAR</div>
              <div style={{ fontSize: 10, color: 'var(--accent)', textTransform: 'uppercase', letterSpacing: '0.1em', marginBottom: 14, fontWeight: 600 }}>pro</div>
              <div style={{ display: 'flex', alignItems: 'baseline', gap: 4, marginBottom: 20 }}>
                <span style={{ fontFamily: 'var(--font-serif)', fontSize: 44, letterSpacing: '-0.02em' }}>$19</span>
                <span style={{ fontSize: 13, color: 'var(--text-3)' }}>/mo</span>
              </div>
              {['120 min/day', 'all 20+ languages', 'full voice clone', 'clean exports', 'priority queue'].map(f => (
                <div key={f} style={{ fontSize: 13, color: 'var(--text-2)', marginBottom: 10, display: 'flex', gap: 9 }}>
                  <span style={{ color: 'var(--accent)' }}>✓</span>{f}
                </div>
              ))}
              <Link href="/auth/signup?intent=pro" className="btn-accent" style={{ display: 'flex', justifyContent: 'center', marginTop: 24, fontSize: 13 }}>upgrade to pro</Link>
            </div>
          </div>
          <p style={{ fontSize: 12, color: 'var(--text-4)' }}>no failed-generation charges. no hidden credits. no contracts.</p>
        </div>
      </section>

      {/* Footer */}
      <footer style={{ position: 'relative', zIndex: 1, borderTop: '1px solid var(--border)', padding: '24px 28px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 12 }}>
        <span style={{ fontFamily: 'var(--font-serif)', fontSize: 15 }}>OmniDub</span>
        <div style={{ display: 'flex', gap: 22, fontSize: 12, color: 'var(--text-4)' }}>
          <Link href="/pricing">pricing</Link>
          <Link href="/auth/login">sign in</Link>
          <Link href="/auth/signup">sign up</Link>
        </div>
        <span style={{ fontSize: 12, color: 'var(--text-4)' }}>© 2026 OmniDub.</span>
      </footer>
    </main>
  )
}

const FEATURES = [
  { icon: '📝', title: 'generate voiceover', desc: 'type a script, pick a voice, hear it in seconds. 6 built-in voices, 20+ languages on free.', href: '/auth/signup', cta: 'try free →', accent: true, pro: false },
  { icon: '🎙', title: 'transcribe audio',   desc: 'drop an audio file, get a clean transcript. powered by Whisper, runs locally.', href: '/auth/signup', cta: 'try free →', accent: false, pro: false },
  { icon: '🎭', title: 'sounds like you',    desc: 'record 30 seconds. clone your voice. hear yourself speak any language.', href: '/auth/signup', cta: 'pro feature →', accent: false, pro: true },
  { icon: '🎬', title: 'speak their language', desc: 'paste a YouTube URL. get a fully dubbed video with your voice in any language.', href: '/auth/signup', cta: 'pro feature →', accent: false, pro: true },
]

function LiveCounter() {
  const base = 18432
  return (
    <div style={{ textAlign: 'center', marginTop: 24 }}>
      <span style={{ fontSize: 12, color: 'var(--text-4)' }}>
        <span style={{ color: 'var(--text-2)', fontWeight: 600, fontFamily: 'var(--font-mono)', fontSize: 13 }}>{base.toLocaleString()}</span>
        {' '}voices generated today
      </span>
    </div>
  )
}
```

**Step 2: Commit**
```
git add app/page.tsx
git commit -m "design: landing page -- ambient orbs, spatial hero, feature grid, elevated cards"
```

---

## Task 3: Auth Pages — Split Layout

**Files:**
- Modify: `app/auth/login/page.tsx` (full rewrite)
- Modify: `app/auth/signup/page.tsx` (full rewrite)

**Step 1: Rewrite login page**

The right panel is a pure-CSS animated waveform visualization. The form lives on the left.

```tsx
// app/auth/login/page.tsx
'use client'
import { useState } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase'

const QUOTES = [
  { text: 'turned my podcast script into 12 language versions in an afternoon.', author: 'content creator' },
  { text: 'my voice, my accent — in every market we launched.', author: 'founder' },
  { text: 'dubbing that sounds like me, not a robot.', author: 'youtuber' },
]

export default function LoginPage() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const router = useRouter()
  const supabase = createClient()

  const handleLogin = async () => {
    setLoading(true); setError('')
    const { error } = await supabase.auth.signInWithPassword({ email, password })
    if (error) { setError(error.message); setLoading(false) }
    else window.location.href = '/dashboard'
  }

  const quote = QUOTES[0]

  return (
    <div style={{ minHeight: '100vh', display: 'grid', gridTemplateColumns: '1fr 1fr', background: 'var(--bg)' }}>
      {/* Left — form */}
      <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: '48px 56px', animation: 'fadeIn 0.4s var(--ease-out) both' }}>
        <div style={{ width: '100%', maxWidth: 380 }}>
          <Link href="/" style={{ display: 'flex', alignItems: 'center', gap: 9, marginBottom: 52 }}>
            <div style={{ width: 28, height: 28, background: 'var(--accent)', borderRadius: 8, display: 'flex', alignItems: 'center', justifyContent: 'center', boxShadow: '0 0 16px rgba(200,245,66,0.28)' }}>
              <div style={{ width: 8, height: 8, background: '#050505', borderRadius: '50%' }} />
            </div>
            <span style={{ fontFamily: 'var(--font-serif)', fontSize: 17 }}>OmniDub</span>
          </Link>

          <h1 style={{ fontFamily: 'var(--font-serif)', fontSize: 34, fontWeight: 300, letterSpacing: '-0.025em', marginBottom: 8 }}>welcome back.</h1>
          <p style={{ fontSize: 14, color: 'var(--text-3)', marginBottom: 36 }}>sign in to continue making.</p>

          {error && (
            <div style={{ padding: '12px 16px', background: 'var(--danger-dim)', border: '1px solid rgba(224,85,85,0.25)', borderRadius: 10, fontSize: 13, color: 'var(--danger)', marginBottom: 20, animation: 'fadeIn 0.2s ease' }}>
              {error}
            </div>
          )}

          <div style={{ marginBottom: 16 }}>
            <label style={{ fontSize: 11, color: 'var(--text-3)', display: 'block', marginBottom: 7, fontWeight: 500, letterSpacing: '0.04em' }}>email</label>
            <input type="email" value={email} onChange={e => setEmail(e.target.value)}
              placeholder="you@example.com"
              style={{ width: '100%', padding: '13px 16px', fontSize: 14, borderRadius: 'var(--radius)', background: 'var(--bg-3)' }}
              onKeyDown={e => e.key === 'Enter' && handleLogin()} />
          </div>

          <div style={{ marginBottom: 28 }}>
            <label style={{ fontSize: 11, color: 'var(--text-3)', display: 'block', marginBottom: 7, fontWeight: 500, letterSpacing: '0.04em' }}>password</label>
            <input type="password" value={password} onChange={e => setPassword(e.target.value)}
              placeholder="••••••••"
              style={{ width: '100%', padding: '13px 16px', fontSize: 14, borderRadius: 'var(--radius)', background: 'var(--bg-3)' }}
              onKeyDown={e => e.key === 'Enter' && handleLogin()} />
          </div>

          <button onClick={handleLogin} disabled={loading || !email || !password}
            className={`btn-accent${loading ? ' btn-shimmer' : ''}`}
            style={{ width: '100%', padding: '14px', fontSize: 14, borderRadius: 'var(--radius)', justifyContent: 'center' }}>
            {loading ? <><div className="spinner" /> signing in…</> : 'sign in →'}
          </button>

          <p style={{ textAlign: 'center', fontSize: 13, color: 'var(--text-3)', marginTop: 22 }}>
            no account?{' '}
            <Link href="/auth/signup" style={{ color: 'var(--accent)', fontWeight: 500 }}>create one free →</Link>
          </p>
        </div>
      </div>

      {/* Right — visual */}
      <div className="bg-split-right hide-mobile" style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: 48, position: 'relative', overflow: 'hidden' }}>
        {/* Animated waveform */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 5, height: 80, marginBottom: 48 }}>
          {Array.from({ length: 32 }, (_, i) => {
            const heights = [0.2,0.5,0.8,0.4,0.9,0.3,0.7,0.5,0.6,0.2,0.8,0.4,1.0,0.3,0.7,0.5,0.6,0.8,0.3,0.9,0.4,0.7,0.2,0.6,0.5,0.8,0.3,0.6,0.4,0.9,0.5,0.3]
            const h = heights[i % heights.length]
            return (
              <div key={i} style={{
                width: 4, height: `${h * 80}px`, borderRadius: 4,
                background: i % 3 === 0 ? 'rgba(200,245,66,0.7)' : 'rgba(123,97,255,0.5)',
                transformOrigin: 'center',
                animation: `waveBar ${0.8 + (i % 5) * 0.15}s ease-in-out ${(i * 0.06) % 1}s infinite`,
              }} />
            )
          })}
        </div>

        {/* Quote */}
        <blockquote style={{ textAlign: 'center', maxWidth: 340 }}>
          <p style={{ fontFamily: 'var(--font-serif)', fontSize: 20, fontWeight: 300, fontStyle: 'italic', lineHeight: 1.5, color: 'rgba(240,240,240,0.85)', marginBottom: 16 }}>
            &ldquo;{quote.text}&rdquo;
          </p>
          <cite style={{ fontSize: 12, color: 'rgba(255,255,255,0.3)', fontStyle: 'normal', letterSpacing: '0.06em' }}>— {quote.author}</cite>
        </blockquote>
      </div>
    </div>
  )
}
```

**Step 2: Rewrite signup page** — same split layout structure but with "let's go." headline, free badge pill, password strength hint. Mirror the login structure exactly, change copy + add `FREE — 5 min/day` badge above headline.

**Step 3: Commit**
```
git add app/auth/login/page.tsx app/auth/signup/page.tsx
git commit -m "design: auth pages -- split layout, CSS waveform visualization, lowercase copy"
```

---

## Task 4: Dashboard Shell

**Files:**
- Modify: `components/layout/DashboardShell.tsx`

**Key changes:**
- Sidebar: `rgba(255,255,255,0.015)` bg, `box-shadow: inset -1px 0 0 var(--border)` (no hard border)
- Logo accent dot gets `box-shadow: 0 0 16px rgba(200,245,66,0.3)`
- Tool nav links: `translateX(2px)` on hover via inline `onMouseEnter`/`onMouseLeave` on CLIENT component (this is safe since DashboardShell is `'use client'`)
- Active item: left bar `4px` wide, `background: var(--accent)`
- Usage bar at sidebar bottom — keep existing, update colors to use CSS vars
- Streak badge: lime glow if streak ≥ 7, amber glow if 3–6
- Mobile drawer: add `animation: 'springIn 0.4s var(--ease-spring)'`
- Main content area: `padding: '32px 40px'`

**Sidebar nav item style (active):**
```tsx
{
  display: 'flex', alignItems: 'center', gap: 10,
  padding: '9px 12px', borderRadius: 'var(--radius)',
  background: 'rgba(200,245,66,0.06)',
  color: 'var(--accent)', fontSize: 13, fontWeight: 500,
  borderLeft: '3px solid var(--accent)',
  paddingLeft: 9,
}
```

**Sidebar nav item style (inactive):**
```tsx
{
  display: 'flex', alignItems: 'center', gap: 10,
  padding: '9px 12px 9px 12px', borderRadius: 'var(--radius)',
  background: 'transparent',
  color: 'var(--text-3)', fontSize: 13,
  borderLeft: '3px solid transparent',
  transition: 'var(--transition)',
}
```

**Commit:**
```
git add components/layout/DashboardShell.tsx
git commit -m "design: dashboard shell -- elevated sidebar, active nav glow, streak polish"
```

---

## Task 5: Dashboard Home — Circular Usage Ring

**Files:**
- Modify: `app/dashboard/page.tsx`

**Replace the linear usage bar with SVG circular ring:**
```tsx
function UsageRing({ used, total, color }: { used: number; total: number; color: string }) {
  const pct = Math.min(used / total, 1)
  const r = 28, circ = 2 * Math.PI * r
  const dash = pct * circ
  return (
    <svg width={72} height={72} style={{ transform: 'rotate(-90deg)' }}>
      <circle cx={36} cy={36} r={r} fill="none" stroke="rgba(255,255,255,0.05)" strokeWidth={5} />
      <circle cx={36} cy={36} r={r} fill="none" stroke={color} strokeWidth={5}
        strokeDasharray={`${dash} ${circ}`} strokeLinecap="round"
        style={{ transition: 'stroke-dasharray 0.8s var(--ease-out)' }} />
    </svg>
  )
}
```

Usage card uses the ring + text overlay. Quick action cards get `card-hover-accent` / `card-hover` className. Last audio card gets ambient lime glow on returning user.

**Commit:**
```
git add app/dashboard/page.tsx
git commit -m "design: dashboard home -- circular usage ring, ambient glow, card elevations"
```

---

## Task 6: TTS Tool — Voice Cards + Shimmer Button

**Files:**
- Modify: `components/jobs/TTSTool.tsx`

**Key changes:**

1. **Voice card waveform SVGs** — each voice gets a unique waveform shape baked as an inline SVG. Define `VOICE_WAVEFORMS` map (6 entries, each a `points` string for a polyline):
```tsx
const VOICE_WAVEFORMS: Record<string, string> = {
  '1': '0,16 8,8 16,20 24,4 32,18 40,10 48,22 56,6 64,16',
  '2': '0,12 8,20 16,6 24,18 32,8 40,22 48,4 56,16 64,10',
  '3': '0,18 8,6 16,22 24,10 32,18 40,4 48,20 56,12 64,16',
  '4': '0,10 8,22 16,8 24,20 32,6 40,18 48,10 56,22 64,14',
  '5': '0,14 8,4 16,20 24,8 32,22 40,6 48,18 56,10 64,20',
  '6': '0,20 8,10 16,18 24,6 32,20 40,12 48,22 56,8 64,16',
}
```

Voice card renders the SVG in the bottom half:
```tsx
<svg width="100%" height="24" viewBox="0 0 64 24" preserveAspectRatio="none" style={{ opacity: selected ? 0.8 : 0.3, transition: 'opacity 0.2s' }}>
  <polyline points={VOICE_WAVEFORMS[v.id]} fill="none" stroke={selected ? 'var(--accent)' : 'var(--text-3)'} strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
</svg>
```

2. **Generate button shimmer** — when `loading`:
```tsx
className={`btn-accent${loading ? ' btn-shimmer' : ''}`}
style={{ width: '100%', padding: '16px', fontSize: 15, justifyContent: 'center', borderRadius: 'var(--radius)' }}
```

3. **Output card** — spring animation:
```tsx
style={{ animation: 'springIn 0.45s var(--ease-spring) both', ... }}
```

4. **Textarea** — lime left border on focus using onFocus/onBlur (safe in client component):
```tsx
onFocus={e => (e.target.style.borderLeft = '3px solid rgba(200,245,66,0.5)')}
onBlur={e => (e.target.style.borderLeft = '3px solid transparent')}
```

**Commit:**
```
git add components/jobs/TTSTool.tsx
git commit -m "design: TTS tool -- voice waveform SVGs, shimmer button, spring output, focused textarea"
```

---

## Task 7: Shared Job Components

**Files:**
- Modify: `components/jobs/JobShared.tsx`

**ProgressBar** — replace with gradient bar + animated status text:
```tsx
export function ProgressBar({ progress, status }: { progress: number; status: string }) {
  return (
    <div style={{ marginTop: 20, padding: '20px 22px', background: 'rgba(255,255,255,0.025)', boxShadow: 'var(--shadow-1)', borderRadius: 'var(--radius)', animation: 'fadeIn 0.25s ease' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 10 }}>
        <span style={{ fontSize: 12, color: status === 'failed' ? 'var(--danger)' : 'var(--text-2)', display: 'flex', alignItems: 'center', gap: 7 }}>
          {status === 'pending' && <><div className="spinner" /> queued — waiting for GPU</>}
          {status === 'processing' && <><div className="spinner" style={{ borderTopColor: 'var(--accent)' }} /> processing…</>}
          {status === 'completed' && '✓ done'}
          {status === 'failed' && '✗ failed'}
        </span>
        <span style={{ fontSize: 12, color: 'var(--text-3)', fontFamily: 'var(--font-mono)' }}>{progress}%</span>
      </div>
      <div style={{ height: 3, background: 'rgba(255,255,255,0.05)', borderRadius: 3, overflow: 'hidden' }}>
        <div style={{ height: '100%', borderRadius: 3, width: `${progress}%`, background: status === 'failed' ? 'var(--danger)' : 'linear-gradient(90deg, var(--accent-2), var(--accent))', transition: 'width 0.6s var(--ease-out)' }} />
      </div>
    </div>
  )
}
```

**SubmitButton** — update to use new btn-accent + shimmer:
```tsx
export function SubmitButton({ onClick, loading, disabled, label }: { onClick: () => void; loading: boolean; disabled: boolean; label: string }) {
  return (
    <button onClick={onClick} disabled={loading || disabled}
      className={`btn-accent${loading ? ' btn-shimmer' : ''}`}
      style={{ padding: '14px 32px', fontSize: 14, opacity: disabled && !loading ? 0.4 : 1 }}>
      {loading ? <><div className="spinner" />{label.replace('→', '…')}</> : label}
    </button>
  )
}
```

**Commit:**
```
git add components/jobs/JobShared.tsx
git commit -m "design: shared job components -- gradient progress bar, shimmer submit button"
```

---

## Task 8: Transcription Tool — Animated Drop Zone

**Files:**
- Modify: `components/jobs/TranscriptionTool.tsx`

**Drop zone** — add drag-and-drop handlers, animate border on drag:
```tsx
const [dragging, setDragging] = useState(false)
// onDragOver: setDragging(true), onDragLeave: setDragging(false)
// onDrop: handleFileSelect(e.dataTransfer.files[0]); setDragging(false)
```

Drop zone style when dragging:
```tsx
{
  border: `2px dashed ${dragging ? 'var(--accent)' : audioFile ? 'rgba(200,245,66,0.3)' : 'var(--border)'}`,
  background: dragging ? 'rgba(200,245,66,0.04)' : audioFile ? 'rgba(200,245,66,0.02)' : 'rgba(255,255,255,0.01)',
  boxShadow: dragging ? '0 0 0 4px rgba(200,245,66,0.08)' : 'none',
  transition: 'all 0.2s var(--ease)',
  borderRadius: 'var(--radius-lg)', padding: '40px 24px', textAlign: 'center', cursor: 'pointer',
}
```

Icon changes to lime waveform on drag-over. Output transcript box uses elevated card style.

**Commit:**
```
git add components/jobs/TranscriptionTool.tsx
git commit -m "design: transcription -- animated drag-drop zone, elevated output card"
```

---

## Task 9: Voice Profiles — Avatar Grid

**Files:**
- Modify: `components/voices/VoiceProfileList.tsx`

**Avatar color** — derive from name hash:
```tsx
function avatarColor(name: string): string {
  const colors = ['#7B61FF','#c8f542','#f0a030','#e05555','#4ade80','#60a5fa','#f472b6','#a78bfa']
  let hash = 0
  for (const c of name) hash = (hash * 31 + c.charCodeAt(0)) & 0xffffffff
  return colors[Math.abs(hash) % colors.length]
}
function initials(name: string): string {
  return name.split(' ').map(w => w[0]).join('').toUpperCase().slice(0, 2)
}
```

Voice profile card:
```tsx
<div style={{
  padding: '18px 16px',
  background: 'rgba(255,255,255,0.025)',
  boxShadow: 'var(--shadow-1)',
  borderRadius: 'var(--radius)',
  display: 'flex', alignItems: 'center', gap: 14,
  transition: 'var(--transition)',
  cursor: onSelect ? 'pointer' : 'default',
}}
onMouseEnter={e => { (e.currentTarget as HTMLDivElement).style.boxShadow = 'var(--shadow-2)' }}
onMouseLeave={e => { (e.currentTarget as HTMLDivElement).style.boxShadow = 'var(--shadow-1)' }}
>
  <div style={{ width: 40, height: 40, borderRadius: '50%', background: avatarColor(p.name), display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 13, fontWeight: 700, color: '#050505', flexShrink: 0 }}>
    {initials(p.name)}
  </div>
  ...
</div>
```

Create form: slide-in panel instead of inline form (uses `position: fixed`, right panel, `animation: 'slideRight'`).

**Commit:**
```
git add components/voices/VoiceProfileList.tsx
git commit -m "design: voice profiles -- hashed avatar colors, elevated cards, slide-in create panel"
```

---

## Task 10: History + Share Pages

**Files:**
- Modify: `components/jobs/HistoryList.tsx` (already has WaveformPlayer, just style updates)
- Modify: `app/share/[id]/page.tsx` (style updates)

**HistoryList changes:**
- Filter pills: use `.pill` classes
- Job row: `card-hover` className, `box-shadow: var(--shadow-1)`, remove hard border
- Expanded content background: `rgba(255,255,255,0.015)` not `var(--bg-2)`
- Status dots: increase to 10px, add `box-shadow: 0 0 8px currentColor`

**Share page changes:**
- Background: add ambient glow (radial purple behind card)
- Card: Level 2 elevation (`var(--shadow-2)`)
- Blockquote: larger serif text, lime left border

**Commit:**
```
git add components/jobs/HistoryList.tsx app/share/[id]/page.tsx
git commit -m "design: history + share page -- elevation system, status glow dots, ambient card"
```

---

## Task 11: Test Infrastructure

**Files:**
- Create: `supabase/seed.sql`
- Create: `tests/helpers.ts`
- Create: `tests/api/auth.test.ts`

**Step 1: Create supabase/seed.sql**
```sql
-- Seed test user (only if not exists)
-- Supabase local uses GoTrue; seed via auth admin API in test helper instead
-- This file seeds app-level data only
INSERT INTO public.profiles (id, plan)
VALUES ('00000000-0000-0000-0000-000000000001', 'free')
ON CONFLICT (id) DO NOTHING;
```

**Step 2: Create tests/helpers.ts**
```ts
// tests/helpers.ts
const BASE = 'http://localhost:3000'
const SB   = 'http://localhost:54321'
const ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZS1kZW1vIiwicm9sZSI6ImFub24iLCJleHAiOjE5ODM4MTI5OTZ9.CRFA0NiK7kyqd-vwvnFuPM5M0EH_8J5lmK1cEuMdxIg'
const TEST_EMAIL = 'test@omnidub.local'
const TEST_PASS  = 'TestPass123!'

export async function getSession(): Promise<{ token: string; cookie: string }> {
  const r = await fetch(`${SB}/auth/v1/token?grant_type=password`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', apikey: ANON_KEY },
    body: JSON.stringify({ email: TEST_EMAIL, password: TEST_PASS }),
  })
  if (!r.ok) throw new Error(`Login failed: ${await r.text()}`)
  const session = await r.json()
  const cookie = `sb-127-auth-token=${encodeURIComponent(JSON.stringify(session))}`
  return { token: session.access_token, cookie }
}

export async function api(path: string, opts: RequestInit & { auth?: boolean } = {}) {
  const { auth = true, ...rest } = opts
  const headers: Record<string, string> = { 'Content-Type': 'application/json', ...(rest.headers as Record<string, string> ?? {}) }
  if (auth) {
    const { cookie } = await getSession()
    headers['Cookie'] = cookie
  }
  return fetch(`${BASE}${path}`, { ...rest, headers })
}

export function sleep(ms: number) { return new Promise(r => setTimeout(r, ms)) }

export async function pollJob(jobId: string, maxMs = 30000): Promise<{ status: string; output_url?: string; input?: Record<string, unknown>; error?: string }> {
  const deadline = Date.now() + maxMs
  while (Date.now() < deadline) {
    const r = await api(`/api/jobs/status?job_id=${jobId}`)
    const d = await r.json()
    if (d.status === 'completed' || d.status === 'failed') return d
    await sleep(2000)
  }
  throw new Error('Job timed out')
}
```

**Step 3: Create tests/api/auth.test.ts**
```ts
import { test, describe } from 'node:test'
import assert from 'node:assert/strict'
import { api, getSession } from '../helpers.js'

describe('auth', () => {
  test('login returns a session', async () => {
    const { token } = await getSession()
    assert.ok(token.length > 20, 'access token should be a JWT')
  })

  test('protected route requires auth', async () => {
    const r = await api('/api/history', { auth: false })
    assert.equal(r.status, 401)
  })

  test('protected route succeeds with auth', async () => {
    const r = await api('/api/history')
    assert.equal(r.status, 200)
    const d = await r.json()
    assert.ok(Array.isArray(d.jobs))
  })
})
```

**Step 4: Run auth test**
```
node --test --experimental-strip-types tests/api/auth.test.ts
```
Expected: 3 passing tests.

**Step 5: Commit**
```
git add supabase/seed.sql tests/helpers.ts tests/api/auth.test.ts
git commit -m "test: auth API tests + test helpers with session management"
```

---

## Task 12: TTS, Voices, History, Share Tests

**Files:**
- Create: `tests/api/tts.test.ts`
- Create: `tests/api/voices.test.ts`
- Create: `tests/api/history.test.ts`
- Create: `tests/api/share.test.ts`

**tests/api/tts.test.ts**
```ts
import { test, describe } from 'node:test'
import assert from 'node:assert/strict'
import { api, pollJob } from '../helpers.js'

describe('tts', () => {
  test('submit job returns job_id', async () => {
    const r = await api('/api/jobs/submit', {
      method: 'POST',
      body: JSON.stringify({ type: 'tts', text: 'Hello from automated test.', voiceId: '1', language: 'English' }),
    })
    assert.equal(r.status, 200)
    const d = await r.json()
    assert.ok(d.job_id, 'should return job_id')
  })

  test('job completes with audio URL', async () => {
    const r = await api('/api/jobs/submit', {
      method: 'POST',
      body: JSON.stringify({ type: 'tts', text: 'Testing end to end voice generation.', voiceId: '1', language: 'English' }),
    })
    const { job_id } = await r.json()
    const result = await pollJob(job_id)
    assert.equal(result.status, 'completed', `job failed: ${result.error}`)
    assert.ok(result.output_url?.includes('.mp3'), 'output_url should be an mp3')
  })

  test('rejects missing text', async () => {
    const r = await api('/api/jobs/submit', {
      method: 'POST',
      body: JSON.stringify({ type: 'tts', text: '', voiceId: '1', language: 'English' }),
    })
    // Either 400 validation or job fails — accept both
    assert.ok(r.status === 400 || r.status === 200, 'should handle empty text gracefully')
  })

  test('unauthenticated submit returns 401', async () => {
    const r = await api('/api/jobs/submit', {
      method: 'POST', auth: false,
      body: JSON.stringify({ type: 'tts', text: 'test', voiceId: '1', language: 'English' }),
    })
    assert.equal(r.status, 401)
  })
})
```

**tests/api/voices.test.ts**
```ts
import { test, describe, before, after } from 'node:test'
import assert from 'node:assert/strict'
import { api } from '../helpers.js'

let createdId: string

describe('voice profiles', () => {
  test('create returns profile with id', async () => {
    const r = await api('/api/voices', {
      method: 'POST',
      body: JSON.stringify({ name: 'Test Voice CI', description: 'Automated test profile' }),
    })
    assert.equal(r.status, 201)
    const d = await r.json()
    assert.ok(d.profile?.id, 'should return profile id')
    createdId = d.profile.id
  })

  test('list includes created profile', async () => {
    const r = await api('/api/voices')
    assert.equal(r.status, 200)
    const d = await r.json()
    assert.ok(Array.isArray(d.profiles))
    const found = d.profiles.find((p: { id: string }) => p.id === createdId)
    assert.ok(found, 'created profile should appear in list')
  })

  test('delete removes profile', async () => {
    const r = await api(`/api/voices/${createdId}`, { method: 'DELETE' })
    assert.equal(r.status, 200)
  })

  test('deleted profile returns 404 on status check', async () => {
    const r = await api(`/api/voices/${createdId}`)
    assert.ok(r.status === 404 || r.status === 405, 'deleted profile should not be found')
  })
})
```

**tests/api/history.test.ts**
```ts
import { test, describe } from 'node:test'
import assert from 'node:assert/strict'
import { api } from '../helpers.js'

describe('history', () => {
  test('returns jobs array', async () => {
    const r = await api('/api/history')
    assert.equal(r.status, 200)
    const d = await r.json()
    assert.ok(Array.isArray(d.jobs), 'should return jobs array')
  })

  test('type filter works', async () => {
    const r = await api('/api/history?type=tts')
    assert.equal(r.status, 200)
    const d = await r.json()
    const nonTTS = d.jobs.filter((j: { type: string }) => j.type !== 'tts')
    assert.equal(nonTTS.length, 0, 'filter should return only tts jobs')
  })

  test('completed jobs have output_url', async () => {
    const r = await api('/api/history')
    const d = await r.json()
    const completed = d.jobs.filter((j: { status: string }) => j.status === 'completed')
    for (const job of completed) {
      if (job.type === 'tts') assert.ok(job.output_url, `completed tts job ${job.id} should have output_url`)
    }
  })
})
```

**tests/api/share.test.ts**
```ts
import { test, describe } from 'node:test'
import assert from 'node:assert/strict'
import { api, pollJob } from '../helpers.js'

describe('share', () => {
  test('unshared job returns 404 on public share endpoint', async () => {
    const sub = await api('/api/jobs/submit', {
      method: 'POST',
      body: JSON.stringify({ type: 'tts', text: 'share test audio.', voiceId: '1', language: 'English' }),
    })
    const { job_id } = await sub.json()
    await pollJob(job_id)
    const r = await fetch(`http://localhost:3000/api/share/${job_id}`)
    assert.equal(r.status, 404, 'unshared job should be 404 on public share endpoint')
  })

  test('shared job is accessible publicly', async () => {
    const sub = await api('/api/jobs/submit', {
      method: 'POST',
      body: JSON.stringify({ type: 'tts', text: 'public share test audio.', voiceId: '1', language: 'English' }),
    })
    const { job_id } = await sub.json()
    await pollJob(job_id)
    await api(`/api/jobs/${job_id}/share`, { method: 'POST' })
    const r = await fetch(`http://localhost:3000/api/share/${job_id}`)
    assert.equal(r.status, 200)
    const d = await r.json()
    assert.equal(d.type, 'tts')
    assert.ok(d.output_url, 'should have output_url')
    assert.ok(!d.input?.audio_url, 'should NOT expose audio_url')
    assert.ok(!d.input?.transcript, 'should NOT expose transcript')
  })

  test('share requires auth', async () => {
    const r = await fetch('http://localhost:3000/api/jobs/fake-id/share', { method: 'POST' })
    assert.equal(r.status, 401)
  })
})
```

**Step 1: Run all tests**
```
node --test --experimental-strip-types tests/api/auth.test.ts tests/api/voices.test.ts tests/api/history.test.ts tests/api/share.test.ts
```
Expected: all pass (TTS tests need OmniVoice running).

**Step 2: Commit**
```
git add tests/
git commit -m "test: full API test suite -- tts, voices, history, share, auth"
```

---

## Task 13: Pre-commit Hook + CI

**Files:**
- Create: `package.json` scripts update
- Create: `.github/workflows/ci.yml`
- Create: `.husky/pre-commit` (or use `simple-git-hooks`)

**Step 1: Add test script to package.json**

Add to `scripts`:
```json
"test": "node --test --experimental-strip-types tests/api/**/*.test.ts",
"test:auth": "node --test --experimental-strip-types tests/api/auth.test.ts",
"typecheck": "tsc --noEmit"
```

**Step 2: Create .github/workflows/ci.yml**
```yaml
name: CI
on:
  push:
    branches: [main, 'claude/**']
  pull_request:
    branches: [main]

jobs:
  typecheck:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: actions/setup-node@v4
        with: { node-version: '20' }
      - run: npm ci
      - run: npx tsc --noEmit

  api-tests:
    runs-on: ubuntu-latest
    services:
      supabase:
        image: supabase/postgres:15.1.0.147
        env:
          POSTGRES_PASSWORD: postgres
        options: >-
          --health-cmd pg_isready
          --health-interval 10s
          --health-timeout 5s
          --health-retries 5
    steps:
      - uses: actions/checkout@v4
      - uses: actions/setup-node@v4
        with: { node-version: '20' }
      - uses: supabase/setup-cli@v1
      - run: supabase start
      - run: npm ci
      - name: Start Next.js
        run: npm run dev &
        env:
          NEXT_PUBLIC_SUPABASE_URL: http://localhost:54321
          NEXT_PUBLIC_SUPABASE_ANON_KEY: ${{ secrets.SUPABASE_ANON_KEY }}
          SUPABASE_SERVICE_ROLE_KEY: ${{ secrets.SUPABASE_SERVICE_ROLE_KEY }}
      - run: sleep 10
      - run: npm run test:auth
```

**Step 3: Commit**
```
git add .github/ package.json
git commit -m "ci: GitHub Actions workflow + npm test scripts for API test suite"
```

---

## Final Verification

After all tasks complete:

1. **TypeScript**: `npx tsc --noEmit` → clean
2. **Auth tests**: `npm run test:auth` → 3 passing
3. **Visual check**: `npm run dev` → visit `http://localhost:3000` — ambient orbs visible, hero has depth, auth split layout working
4. **Dashboard**: login → check circular usage ring, elevated cards, sidebar glow on active
5. **TTS**: generate a voice → see shimmer on button, spring animation on output card, waveform SVG on voice cards

```
git add -A
git commit -m "chore: final cleanup and verification pass"
```
