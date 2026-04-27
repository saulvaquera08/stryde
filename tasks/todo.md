# STRYDE — Master Build Plan

> Fitness training app (Whoop + Runna hybrid)
> Stack: Next.js 14 · Supabase · Tailwind · shadcn/ui · Claude API · Vercel

---

## Design Tokens (NEVER change)

| Token | Value |
|---|---|
| Background | `#0A0A0A` |
| Surface / Cards | `#141414` |
| Primary Accent | `#C8FF00` (lime green) |
| Text Primary | `#FFFFFF` |
| Text Secondary | `#888888` |
| Border | `#222222` |
| Font | Inter / Geist |
| CTA Button | bg `#C8FF00` · text `#000000` · bold · rounded-lg |
| Cards | bg `#141414` · border `#222222` · radius 12px |
| Bottom Nav | 5 tabs: Today / Plan / Progress / More |

---

## Training Logic Source of Truth

File: `/stryde-rules.json` — **never invent exercises, always use templates from this file.**

Key rules:
- Max 2 consecutive high-intensity days
- Min 1 Z2 session/week, min 2 strength sessions, min 1 HYROX session
- 6-week progression: build_volume → increase_intensity → peak_simulation → taper
- Multi-goal: closest event = primary, others = maintenance only

---

## Phase 1 — Foundation ✅ (current)

- [x] Create `tasks/todo.md`
- [ ] `npx create-next-app@latest . --typescript --tailwind --app --eslint`
- [ ] Install: `@supabase/supabase-js @supabase/ssr shadcn/ui lucide-react`
- [ ] `npx shadcn@latest init` with dark theme, CSS vars
- [ ] `/supabase/migrations/001_initial.sql` — 5 tables (see schema below)
- [ ] `/lib/supabase/client.ts` — browser client
- [ ] `/lib/supabase/server.ts` — server client (RSC + Route Handlers)
- [ ] `/lib/supabase/middleware.ts` — session refresh
- [ ] `/.env.local.example` — all required env vars

### DB Schema

```sql
-- users profile (extends auth.users)
users (id uuid PK → auth.users, age int, weight numeric, height numeric,
       level text, available_days int[], equipment text[], injuries text[],
       current_5k_time interval, current_10k_time interval, created_at timestamptz)

-- goals
goals (id uuid PK, user_id uuid → users, 
       type enum['hyrox','21k','5k','10k','strength','recomp'],
       race_date date, priority int, created_at timestamptz)

-- generated plans
plans (id uuid PK, user_id uuid → users, start_date date, end_date date,
       total_weeks int, structure JSONB, created_at timestamptz)

-- individual workouts within a plan
workouts (id uuid PK, plan_id uuid → plans, user_id uuid → users,
          scheduled_date date, week_number int, day_type text,
          blocks JSONB, duration_minutes int,
          intensity enum['low','moderate','high'],
          goals_tags text[], is_rest_day bool)

-- workout completion log
completed_workouts (id uuid PK, workout_id uuid → workouts,
                    user_id uuid → users, completed_at timestamptz,
                    rating int, notes text, metrics JSONB)
```

---

## Phase 2 — Auth & Onboarding

- [ ] `/app/(auth)/login/page.tsx` — email + Google OAuth
- [ ] `/app/(auth)/signup/page.tsx`
- [ ] `/app/auth/callback/route.ts` — Supabase OAuth callback
- [ ] `/middleware.ts` — protect `/app/(app)/**` routes
- [ ] `/app/(onboarding)/page.tsx` — multi-step form:
  - Step 1: Basic info (age, weight, height)
  - Step 2: Fitness level + available days
  - Step 3: Equipment + injuries
  - Step 4: Goals (type + race date + priority)
  - Step 5: Current performance (5K/10K times)
- [ ] On complete → insert `users` + `goals` rows → redirect to plan generation

---

## Phase 3 — AI Plan Generation

- [ ] `/lib/claude.ts` — Anthropic SDK client (with prompt caching)
- [ ] `/app/api/generate-plan/route.ts` — POST handler:
  - Reads user profile + goals from DB
  - Loads `stryde-rules.json` as system context
  - Calls Claude claude-sonnet-4-6 to generate structured 6-week plan
  - Validates output against rules (no consecutive high days, etc.)
  - Saves `plans` + `workouts` rows to Supabase
- [ ] `/app/(app)/generating/page.tsx` — loading screen with progress

---

## Phase 4 — Core UI (App Shell)

- [ ] `/app/(app)/layout.tsx` — bottom nav shell + auth guard
- [ ] `/components/bottom-nav.tsx` — 5-tab nav (Today/Plan/Progress/More)

### Today Tab
- [ ] `/app/(app)/today/page.tsx`
  - Today's workout card (day type, intensity badge, duration)
  - Block breakdown (expandable exercise list from `stryde-rules.json`)
  - "Start Workout" CTA → execution flow
  - Rest day state

### Plan Tab
- [ ] `/app/(app)/plan/page.tsx`
  - 6-week calendar grid
  - Week overview (intensity distribution bar)
  - Tap day → workout detail sheet

### Workout Execution
- [ ] `/app/(app)/workout/[id]/page.tsx`
  - Block-by-block progression
  - Set/rep logger for strength
  - Timer for intervals/runs
  - Finish → rating modal → save `completed_workouts`

---

## Phase 5 — Progress & Analytics

- [ ] `/app/(app)/progress/page.tsx`
  - Weekly volume chart (recharts or Tremor)
  - Intensity distribution pie
  - Streak counter
  - Recent completed workouts list
- [ ] `/app/api/progress/route.ts` — aggregate query on `completed_workouts`

---

## Phase 6 — AI Coach (More Tab)

- [ ] `/app/(app)/more/page.tsx` — settings, profile, coach entry
- [ ] `/app/(app)/more/coach/page.tsx` — streaming chat
- [ ] `/app/api/coach/route.ts` — Claude streaming endpoint:
  - System prompt includes user profile + recent workouts + `stryde-rules.json`
  - Responds to questions about training, recovery, pacing

---

## Phase 7 — Deploy

- [ ] Configure Vercel project (env vars, build settings)
- [ ] Run Supabase migrations on production project
- [ ] Enable Supabase Auth providers (Email + Google)
- [ ] Set `NEXT_PUBLIC_APP_URL` for OAuth redirects
- [ ] Smoke test full flow: signup → onboarding → plan gen → today → complete workout

---

## Environment Variables

```
NEXT_PUBLIC_SUPABASE_URL=
NEXT_PUBLIC_SUPABASE_ANON_KEY=
SUPABASE_SERVICE_ROLE_KEY=
ANTHROPIC_API_KEY=
NEXT_PUBLIC_APP_URL=http://localhost:3000
```
