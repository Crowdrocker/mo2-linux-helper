#!/usr/bin/env bash
# mo2-setup.sh — Full MO2 + Proton setup for Arch Linux
# Part of MO2 Linux Helper: https://github.com/yourusername/mo2-linux-helper
# Usage: bash mo2-setup.sh [--mo2-path PATH] [--proton-ver VERSION] [--dry-run]

set -euo pipefail

# ── Defaults ──────────────────────────────────────────────────────────────────
MO2_PATH="${MO2_PATH:-$HOME/.local/share/modorganizer2}"
PROTON_VER="${PROTON_VER:-Proton-GE-Proton9-20}"
STEAM_PATH="${STEAM_PATH:-$HOME/.local/share/Steam}"
WINEPREFIX="${WINEPREFIX:-$HOME/.wine-mo2}"
DRY_RUN=0

# ── Argument parsing ───────────────────────────────────────────────────────────
while [[ $# -gt 0 ]]; do
  case $1 in
    --mo2-path)   MO2_PATH="$2";   shift 2 ;;
    --proton-ver) PROTON_VER="$2"; shift 2 ;;
    --steam-path) STEAM_PATH="$2"; shift 2 ;;
    --dry-run)    DRY_RUN=1;       shift   ;;
    *) echo "Unknown arg: $1"; exit 1 ;;
  esac
done

# ── Colors ─────────────────────────────────────────────────────────────────────
C_RESET='\e[0m'
C_CYAN='\e[36m'
C_GREEN='\e[32m'
C_YELLOW='\e[33m'
C_RED='\e[31m'

log()  { echo -e "${C_CYAN}[MO2]${C_RESET} $*"; }
ok()   { echo -e "${C_GREEN}  ✓${C_RESET} $*"; }
warn() { echo -e "${C_YELLOW}  ⚠${C_RESET} $*"; }
err()  { echo -e "${C_RED}  ✗${C_RESET} $*"; exit 1; }
run()  { if [[ $DRY_RUN -eq 1 ]]; then echo "  [dry] $*"; else "$@"; fi; }

# ── Pre-flight ─────────────────────────────────────────────────────────────────
echo ""
echo -e "${C_CYAN}╔════════════════════════════════════════╗${C_RESET}"
echo -e "${C_CYAN}║       MO2 Linux Helper Setup           ║${C_RESET}"
echo -e "${C_CYAN}║       Arch Linux + Proton Edition      ║${C_RESET}"
echo -e "${C_CYAN}╚════════════════════════════════════════╝${C_RESET}"
echo ""
log "MO2 path:      $MO2_PATH"
log "Proton ver:    $PROTON_VER"
log "Steam path:    $STEAM_PATH"
log "Wine prefix:   $WINEPREFIX"
[[ $DRY_RUN -eq 1 ]] && warn "DRY RUN — no changes will be made"
echo ""

# ── Step 1: Check distro ───────────────────────────────────────────────────────
log "Checking system..."
if ! command -v pacman &>/dev/null; then
  warn "pacman not found — you may not be on Arch. Proceeding anyway."
else
  ok "Arch Linux detected"
fi

if ! command -v steam &>/dev/null && [[ ! -d "$STEAM_PATH" ]]; then
  warn "Steam not found at $STEAM_PATH — NXM links won't work without it"
else
  ok "Steam found"
fi

# ── Step 2: Install system packages ───────────────────────────────────────────
log "Installing system packages..."
run sudo pacman -S --needed --noconfirm wine winetricks protontricks curl python3
ok "System packages installed"

# ── Step 3: Install Proton-GE (if not present) ────────────────────────────────
PROTON_DEST="$STEAM_PATH/compatibilitytools.d/$PROTON_VER"
if [[ -d "$PROTON_DEST" ]]; then
  ok "$PROTON_VER already installed"
else
  log "Installing $PROTON_VER..."
  PROTON_URL="https://github.com/GloriousEggroll/proton-ge-custom/releases/latest/download/${PROTON_VER}.tar.gz"
  run mkdir -p "$STEAM_PATH/compatibilitytools.d"
  run curl -L -o "/tmp/${PROTON_VER}.tar.gz" "$PROTON_URL"
  run tar -xzf "/tmp/${PROTON_VER}.tar.gz" -C "$STEAM_PATH/compatibilitytools.d/"
  ok "$PROTON_VER installed"
fi

# ── Step 4: Download MO2 ──────────────────────────────────────────────────────
MO2_VERSION="2.5.2"
MO2_EXE="/tmp/MO2Setup.exe"
if [[ ! -f "$MO2_EXE" ]]; then
  log "Downloading MO2 ${MO2_VERSION}..."
  MO2_URL="https://github.com/ModOrganizer2/modorganizer/releases/download/v${MO2_VERSION}/Mod.Organizer-${MO2_VERSION}.exe"
  run curl -L --progress-bar -o "$MO2_EXE" "$MO2_URL"
  ok "MO2 installer downloaded"
else
  ok "MO2 installer already cached at $MO2_EXE"
fi

# ── Step 5: Install MO2 via Wine ──────────────────────────────────────────────
log "Installing MO2 to $MO2_PATH..."
run mkdir -p "$MO2_PATH"
run env WINEPREFIX="$WINEPREFIX" wine "$MO2_EXE" /SILENT "/DIR=$MO2_PATH"
ok "MO2 installed"

# ── Step 6: Winetricks components ─────────────────────────────────────────────
log "Installing winetricks components..."
COMPONENTS=(vcruntime140 dotnet48 d3dcompiler_47 xact mfc140)
for comp in "${COMPONENTS[@]}"; do
  log "  Installing $comp..."
  run env WINEPREFIX="$WINEPREFIX" winetricks -q "$comp"
  ok "$comp installed"
done

# ── Step 7: NXM handler ───────────────────────────────────────────────────────
log "Registering NXM link handler..."
run bash "$(dirname "$0")/mo2-nxm.sh"
ok "NXM handler registered"

# ── Step 8: Steam shortcut ────────────────────────────────────────────────────
log "Adding Steam non-Steam shortcut..."
run python3 "$(dirname "$0")/mo2-shortcut.py" \
  --exe "$MO2_PATH/ModOrganizer.exe" \
  --start-dir "$MO2_PATH" \
  --proton "$PROTON_VER"
ok "Steam shortcut added"

# ── Done ──────────────────────────────────────────────────────────────────────
echo ""
echo -e "${C_GREEN}✅ MO2 setup complete!${C_RESET}"
echo ""
echo "  Next steps:"
echo "  1. Restart Steam"
echo "  2. Find 'Mod Organizer 2' in your Steam library"
echo "  3. Set Proton version to $PROTON_VER in Properties"
echo "  4. Launch MO2 and configure your game paths"
echo ""
