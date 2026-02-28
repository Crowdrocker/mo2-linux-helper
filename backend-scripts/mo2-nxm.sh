#!/bin/bash
# MO2 Linux Helper - NXM Link Handler Setup
# This script sets up the NXM link handler for Nexus Mods

set -e

MO2_PATH="${1:-$HOME/.modorganizer2}"

echo "=== NXM Link Handler Setup ==="
echo "MO2 Path: $MO2_PATH"
echo ""

# Create desktop file
DESKTOP_FILE="$HOME/.local/share/applications/mo2-nxm-handler.desktop"

cat > "$DESKTOP_FILE" <<EOF
[Desktop Entry]
Name=Mod Organizer 2
Comment=Mod Organizer 2 for Linux
Exec=$MO2_PATH/ModOrganizer.exe %u
Icon=$MO2_PATH/mo2.ico
Type=Application
Categories=Game;
MimeType=x-scheme-handler/nxm;
Terminal=false
StartupNotify=true
EOF

echo "✓ Desktop file created: $DESKTOP_FILE"

# Update desktop database
update-desktop-database ~/.local/share/applications/

echo "✓ Desktop database updated"

# Set as default handler
xdg-mime default mo2-nxm-handler.desktop x-scheme-handler/nxm

echo "✓ NXM handler registered"

echo ""
echo "=== Setup Complete ==="
echo "NXM links will now open in Mod Organizer 2"