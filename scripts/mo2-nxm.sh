#!/usr/bin/env bash
# mo2-nxm.sh — Register nxm:// and nxms:// URI scheme handlers for MO2
# Part of MO2 Linux Helper: https://github.com/yourusername/mo2-linux-helper

set -euo pipefail

MO2_PATH="${MO2_PATH:-$HOME/.local/share/modorganizer2}"
WINEPREFIX="${WINEPREFIX:-$HOME/.wine-mo2}"
DESKTOP_DIR="$HOME/.local/share/applications"
DESKTOP_FILE="$DESKTOP_DIR/nxm-handler.desktop"

C_GREEN='\e[32m'; C_CYAN='\e[36m'; C_RESET='\e[0m'
ok()  { echo -e "${C_GREEN}  ✓${C_RESET} $*"; }
log() { echo -e "${C_CYAN}[NXM]${C_RESET} $*"; }

# ── Write .desktop file ───────────────────────────────────────────────────────
log "Writing $DESKTOP_FILE..."
mkdir -p "$DESKTOP_DIR"

cat > "$DESKTOP_FILE" << EOF
[Desktop Entry]
Name=NXM Handler (MO2)
Exec=env WINEPREFIX=${WINEPREFIX} wine "${MO2_PATH}/ModOrganizer.exe" "%u"
Type=Application
NoDisplay=true
MimeType=x-scheme-handler/nxm;x-scheme-handler/nxms
Categories=Game;
StartupNotify=false
EOF

chmod +x "$DESKTOP_FILE"
ok ".desktop file written"

# ── Register MIME types ───────────────────────────────────────────────────────
log "Registering MIME types..."
xdg-mime default nxm-handler.desktop x-scheme-handler/nxm
xdg-mime default nxm-handler.desktop x-scheme-handler/nxms
ok "MIME types registered"

# ── Update desktop database ───────────────────────────────────────────────────
log "Updating desktop database..."
update-desktop-database "$DESKTOP_DIR" 2>/dev/null || true
ok "Desktop database updated"

# ── Verify ────────────────────────────────────────────────────────────────────
RESULT=$(xdg-mime query default x-scheme-handler/nxm 2>/dev/null || echo "unknown")
if [[ "$RESULT" == "nxm-handler.desktop" ]]; then
  echo ""
  echo -e "${C_GREEN}✅ NXM handler registered successfully!${C_RESET}"
  echo "   Clicking 'Mod Manager Download' on NexusMods will now open MO2."
else
  echo "  ⚠ Verification failed — result: $RESULT"
  echo "  Try logging out and back in, or run: xdg-mime default nxm-handler.desktop x-scheme-handler/nxm"
fi
