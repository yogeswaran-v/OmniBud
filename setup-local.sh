#!/usr/bin/env bash
# ─────────────────────────────────────────────────────────────────
# OmniDub — Local Dev Setup
# Run this once after cloning the repo.
# ─────────────────────────────────────────────────────────────────
set -euo pipefail

RED='\033[0;31m'; GREEN='\033[0;32m'; YELLOW='\033[1;33m'; CYAN='\033[0;36m'; NC='\033[0m'
ok()   { echo -e "${GREEN}✓${NC} $1"; }
warn() { echo -e "${YELLOW}⚠${NC}  $1"; }
err()  { echo -e "${RED}✗${NC}  $1"; }
step() { echo -e "\n${CYAN}▶ $1${NC}"; }

REPO_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
cd "$REPO_DIR"

echo -e "${CYAN}"
echo "  ╔══════════════════════════════════╗"
echo "  ║   OmniDub — Local Dev Setup      ║"
echo "  ╚══════════════════════════════════╝"
echo -e "${NC}"

# ─── 1. Prerequisites ────────────────────────────────────────────
step "Checking prerequisites"

MISSING=0
for cmd in git node npm docker; do
  if command -v "$cmd" &>/dev/null; then ok "$cmd found ($(${cmd} --version 2>&1 | head -1))";
  else err "$cmd not found"; MISSING=1; fi
done

if docker compose version &>/dev/null 2>&1; then
  ok "docker compose found"
elif docker-compose --version &>/dev/null 2>&1; then
  ok "docker-compose found (legacy)"
else
  err "docker compose not found"
  MISSING=1
fi

# NVIDIA check
if command -v nvidia-smi &>/dev/null; then
  GPU=$(nvidia-smi --query-gpu=name --format=csv,noheader 2>/dev/null | head -1)
  ok "NVIDIA GPU: $GPU"
else
  warn "nvidia-smi not found — GPU services will be skipped"
  warn "Install nvidia-container-toolkit: https://docs.nvidia.com/datacenter/cloud-native/container-toolkit/install-guide.html"
fi

if [ "$MISSING" -eq 1 ]; then
  err "Install missing prerequisites and re-run."
  exit 1
fi

# Node version check
NODE_VER=$(node -e "process.exit(parseInt(process.version.slice(1)) < 18 ? 1 : 0)" 2>/dev/null && echo "ok" || echo "old")
if [ "$NODE_VER" = "old" ]; then
  warn "Node.js 18+ recommended. Current: $(node --version)"
fi

# ─── 2. .env.local ───────────────────────────────────────────────
step "Checking .env.local"

if [ ! -f ".env.local" ]; then
  if [ -f ".env.local.example" ]; then
    cp .env.local.example .env.local
    warn ".env.local created from .env.local.example"
    warn "Fill in the blank values in .env.local, then re-run this script."
    echo ""
    echo "  At minimum you need:"
    echo "    NEXT_PUBLIC_SUPABASE_URL"
    echo "    NEXT_PUBLIC_SUPABASE_ANON_KEY"
    echo "    SUPABASE_SERVICE_ROLE_KEY"
    echo ""
    exit 1
  else
    err ".env.local not found. Create it from .env.local.example"
    exit 1
  fi
fi

# Validate required vars are set
REQUIRED_VARS=(NEXT_PUBLIC_SUPABASE_URL NEXT_PUBLIC_SUPABASE_ANON_KEY SUPABASE_SERVICE_ROLE_KEY)
for var in "${REQUIRED_VARS[@]}"; do
  val=$(grep "^${var}=" .env.local | cut -d= -f2- | tr -d ' ')
  if [ -z "$val" ]; then
    err "$var is not set in .env.local"
    MISSING=1
  else
    ok "$var is set"
  fi
done
[ "$MISSING" -eq 1 ] && exit 1

# Load env vars for use in this script
export $(grep -v '^#' .env.local | grep -v '^$' | xargs)

# ─── 3. npm install ──────────────────────────────────────────────
step "Installing npm dependencies"
npm install --silent
ok "npm dependencies installed"

# ─── 4. Apply DB migration ───────────────────────────────────────
step "Applying Phase 1 database migration"

MIGRATION_SQL="$(cat supabase/migrations/20260529000001_phase1.sql)"

# Check if voice_profiles table already exists
HTTP_STATUS=$(curl -s -o /dev/null -w "%{http_code}" \
  "${NEXT_PUBLIC_SUPABASE_URL}/rest/v1/voice_profiles?limit=1" \
  -H "apikey: ${NEXT_PUBLIC_SUPABASE_ANON_KEY}" \
  -H "Authorization: Bearer ${SUPABASE_SERVICE_ROLE_KEY}" 2>/dev/null || echo "000")

if [ "$HTTP_STATUS" = "200" ] || [ "$HTTP_STATUS" = "406" ]; then
  ok "voice_profiles table already exists — skipping migration"
else
  # Try psql if available (needs DB_PASSWORD env var or interactive prompt)
  SUPABASE_REF=$(echo "$NEXT_PUBLIC_SUPABASE_URL" | sed 's|https://||' | cut -d. -f1)
  DB_URL="postgresql://postgres.${SUPABASE_REF}:${DB_PASSWORD:-}@aws-0-ap-southeast-1.pooler.supabase.com:6543/postgres"

  if command -v psql &>/dev/null && [ -n "${DB_PASSWORD:-}" ]; then
    echo "$MIGRATION_SQL" | psql "$DB_URL" -f - && ok "Migration applied via psql" || {
      warn "psql migration failed — see manual step below"
    }
  elif command -v supabase &>/dev/null; then
    warn "Supabase CLI found. Attempting: supabase db push"
    warn "You may be prompted for your DB password."
    supabase link --project-ref "$SUPABASE_REF" 2>/dev/null || true
    supabase db push && ok "Migration applied via supabase CLI" || {
      warn "supabase db push failed — see manual step below"
    }
  else
    warn "Could not apply migration automatically."
    echo ""
    echo -e "  ${YELLOW}ACTION REQUIRED — Run this SQL in your Supabase dashboard:${NC}"
    echo -e "  ${CYAN}https://supabase.com/dashboard/project/${SUPABASE_REF}/sql/new${NC}"
    echo ""
    echo "  ─── SQL to run ───────────────────────────────────"
    echo "$MIGRATION_SQL"
    echo "  ───────────────────────────────────────────────────"
    echo ""
    read -p "  Press ENTER once you've run the SQL, or Ctrl-C to abort: "
  fi
fi

# ─── 5. GPU Docker services ──────────────────────────────────────
step "Starting GPU Docker services (OmniVoice + Whisper)"

if command -v nvidia-smi &>/dev/null; then
  COMPOSE_CMD="docker compose"
  command -v "docker-compose" &>/dev/null && ! docker compose version &>/dev/null 2>&1 && COMPOSE_CMD="docker-compose"

  echo "  Pulling images (first run may take a few minutes)..."
  $COMPOSE_CMD -f docker-compose.omnivoice.yml pull --quiet 2>/dev/null || true

  $COMPOSE_CMD -f docker-compose.omnivoice.yml up -d
  ok "OmniVoice started on http://localhost:3900"
  ok "Whisper ASR started on http://localhost:9000"

  echo ""
  echo "  Waiting for OmniVoice to be ready (model loading takes ~60s first time)..."
  for i in $(seq 1 40); do
    if curl -sf http://localhost:3900/health &>/dev/null; then
      ok "OmniVoice is healthy"
      break
    fi
    printf "."
    sleep 3
  done
  echo ""

  # Enable local OmniVoice in .env.local if not already set
  if ! grep -q "^OMNIVOICE_LOCAL_URL=" .env.local; then
    echo "" >> .env.local
    echo "# Local GPU services" >> .env.local
    echo "OMNIVOICE_LOCAL_URL=http://localhost:3900" >> .env.local
    echo "WHISPER_LOCAL_URL=http://localhost:9000" >> .env.local
    ok "OMNIVOICE_LOCAL_URL + WHISPER_LOCAL_URL added to .env.local"
  elif grep -q "^# OMNIVOICE_LOCAL_URL=" .env.local; then
    # Uncomment if commented
    sed -i 's|^# OMNIVOICE_LOCAL_URL=|OMNIVOICE_LOCAL_URL=|' .env.local
    sed -i 's|^# WHISPER_LOCAL_URL=|WHISPER_LOCAL_URL=|' .env.local
    ok "OMNIVOICE_LOCAL_URL + WHISPER_LOCAL_URL uncommented in .env.local"
  else
    ok "OMNIVOICE_LOCAL_URL already set in .env.local"
  fi
else
  warn "No NVIDIA GPU detected — skipping GPU Docker services"
  warn "TTS will use RunPod (requires RUNPOD_API_KEY in .env.local)"
fi

# ─── 6. Summary ──────────────────────────────────────────────────
echo ""
echo -e "${GREEN}═══════════════════════════════════════════════${NC}"
echo -e "${GREEN}  Setup complete!${NC}"
echo -e "${GREEN}═══════════════════════════════════════════════${NC}"
echo ""
echo "  Start the dev server:"
echo -e "    ${CYAN}npm run dev${NC}"
echo ""
echo "  App:        http://localhost:3000"
echo "  OmniVoice:  http://localhost:3900"
echo "  Whisper:    http://localhost:9000"
echo ""
echo "  To stop GPU services:"
echo -e "    ${CYAN}docker compose -f docker-compose.omnivoice.yml down${NC}"
echo ""
