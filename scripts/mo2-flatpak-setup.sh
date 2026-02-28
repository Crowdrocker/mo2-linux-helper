#!/usr/bin/env bash
# mo2-flatpak-setup.sh — Configure Flatpak permissions for MO2
# Part of MO2 Linux Helper: https://github.com/Crowdrocker/mo2-linux-helper
# Usage: bash mo2-flatpak-setup.sh [--steam] [--home] [--wayland] [--devices] [--remove]

set -euo pipefail

APP_ID="com.modorganizer.ModOrganizer2"
OPT_STEAM=1
OPT_HOME=1
OPT_RUN=0
OPT_WAYLAND=0
OPT_DEVICES=0
REMOVE=0

while [[ $# -gt 0 ]]; do
  case $1 in
    --steam)   OPT_STEAM=1;   shift ;;
    --home)    OPT_HOME=1;    shift ;;
    --run)     OPT_RUN=1;     shift ;;
    --wayland) OPT_WAYLAND=1; shift ;;
    --devices) OPT_DEVICES=1; shift ;;
    --remove)  REMOVE=1;      shift ;;
    *) echo "Unknown arg: $1"; exit 1 ;;
  esac
done

C_GREEN='\e[32m'; C_CYAN='\e[36m'; C_YELLOW='\e[33m'; C_RESET='\e[0m'
log()  { echo -e "${C_CYAN}[Flatpak]${C_RESET} $*"; }
ok()   { echo -e "${C_GREEN}  ✓${C_RESET} $*"; }
warn() { echo -e "${C_YELLOW}  ⚠${C_RESET} $*"; }

if ! command -v flatpak &>/dev/null; then
  warn "flatpak not found — install it first: sudo pacman -S flatpak"
  exit 1
fi

if [[ $REMOVE -eq 1 ]]; then
  log "Removing overrides for $APP_ID..."
  flatpak override --user --reset "$APP_ID"
  ok "Overrides reset"
  exit 0
fi

log "Applying overrides for $APP_ID..."

ARGS=(flatpak override --user)
ARGS+=(--socket=x11 --device=dri --share=network --share=ipc)

[[ $OPT_STEAM   -eq 1 ]] && ARGS+=(--filesystem="${HOME}/.local/share/Steam")
[[ $OPT_HOME    -eq 1 ]] && ARGS+=(--filesystem=home)
[[ $OPT_RUN     -eq 1 ]] && ARGS+=(--talk-name=org.freedesktop.Flatpak)
[[ $OPT_WAYLAND -eq 1 ]] && ARGS+=(--socket=wayland)
[[ $OPT_DEVICES -eq 1 ]] && ARGS+=(--device=all)

ARGS+=("$APP_ID")

"${ARGS[@]}"
ok "Overrides applied"

echo ""
echo -e "${C_GREEN}✅ Done!${C_RESET} Run MO2 with:"
echo "   flatpak run $APP_ID"
