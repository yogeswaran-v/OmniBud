# GPU Cost Monitoring — Design Spec
**Date:** 2026-05-28
**Status:** Approved

## Problem

The owner of OmniDub has no visibility into real-time GPU spend on Vast.ai. Instances can be left running idle, or monthly costs can accumulate unnoticed. A dedicated monitoring view is needed.

## Scope

- Owner-only (protected by existing session auth on `/dashboard/*`)
- No alerts — monitoring only
- No other GPU providers for now (Vast.ai only)

## Approach: Live + Vast.ai Invoice History (Option C)

Poll Vast.ai's API live every 30 seconds for instance state and burn rate. Pull Vast.ai's own invoice endpoint for historical spend. No new Supabase tables, no cron jobs.

---

## Architecture

```
/dashboard/gpu                   (new page — client component)
  └── polls every 30s
        ↓
/api/gpu/costs                   (new API route — server-side)
  ├── GET /api/v0/instances/      → running instances, $/hr, uptime
  ├── GET /api/v0/users/current   → account balance + credit
  └── GET /api/v0/invoices        → charge history
  returns: merged JSON payload
```

The API route runs all three Vast.ai calls in parallel with `Promise.allSettled`. Each zone degrades independently if one call fails. `VAST_API_KEY` never reaches the browser.

The existing middleware only covers `/dashboard/*`, not `/api/*`. The `/api/gpu/costs` route must verify the session itself using `createServerSupabase().auth.getSession()` and return 401 if unauthenticated.

---

## API Response Shape

```ts
// GET /api/gpu/costs

type CostsResponse = {
  instances: {
    id: number
    label: string         // instance name
    status: string        // 'running' | 'stopped' | 'loading'
    gpu_name: string      // e.g. "RTX 4090"
    dph_total: number     // dollars per hour
    uptime_secs: number   // seconds running this session
    session_cost: number  // computed: dph_total * (uptime_secs / 3600)
    machine_id: number
  }[]
  balance: number         // Vast.ai account balance ($)
  credit: number          // promotional credit ($)
  spend: {
    today: number
    this_month: number
    all_time: number
    recent: { date: string; amount: number }[]  // last 30 days
  }
  fetchedAt: string       // ISO timestamp — used for "last updated" counter
}
```

---

## UI Layout

```
/dashboard/gpu

┌─────────────────────────────────────────────────┐
│  LIVE INSTANCES          [Last updated: 14s ago] │
│  ┌──────────────────────────────────────────┐   │
│  │ 🟢 RTX 4090 · Running · $0.38/hr        │   │
│  │    Session: 2h 14m · Session cost: $0.85 │   │
│  └──────────────────────────────────────────┘   │
│  (or: "No active instances — no GPU cost")       │
│                                                  │
│  ACCOUNT BALANCE                                 │
│  $12.40 remaining  ($3.20 credit)               │
│                                                  │
│  SPEND                                           │
│  Today $0.85  │  This month $14.20  │  All-time │
│  ▬▬▬▬▬▬▬▬ 30-day bar chart ▬▬▬▬▬▬▬▬▬▬▬▬▬▬    │
└─────────────────────────────────────────────────┘
```

- Green dot = running, grey = stopped/loading
- Stale data stays visible on fetch failure with a warning badge
- No instance running → "No active instances — not incurring GPU cost"

---

## Files

### New files
| File | Purpose |
|---|---|
| `app/app/api/gpu/costs/route.ts` | Server route — fans out 3 Vast.ai calls, returns merged JSON |
| `app/app/dashboard/gpu/page.tsx` | Client page — 30s polling, renders 3 zones |
| `app/components/gpu/InstanceCard.tsx` | Single instance status card |
| `app/components/gpu/SpendChart.tsx` | 30-day CSS bar chart (no extra library) |

### Modified files
| File | Change |
|---|---|
| `app/components/layout/DashboardShell.tsx` | Add "GPU Costs" nav link |

---

## Polling & Error Handling

- `useEffect` with `setInterval(fetch, 30_000)` + immediate first call on mount
- "Last updated X seconds ago" counter ticks every second client-side
- `Promise.allSettled` in the API route — instances, balance, and spend zones each degrade independently
- On network error: stale data shown with a subtle warning badge, not a full error screen

---

## Explicitly Out of Scope

- Alerts or threshold notifications (future)
- Multi-user cost attribution (future)
- Other GPU providers (future)
- Storing cost history in Supabase (Vast.ai invoices are the source of truth)
- Chart library (CSS bars keep bundle size minimal)
