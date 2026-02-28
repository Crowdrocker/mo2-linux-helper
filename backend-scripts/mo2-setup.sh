#!/bin/bash
# MO2 Linux Helper - Setup Script
# This script installs Mod Organizer 2 and dependencies on Linux

set -e

echo "=== MO2 Linux Helper Setup ==="
echo ""

# Check if running as root
if [ "$EUID" -eq 0 ]; then 
    echo "Please do not run as root"
    exit 1
fi

# Detect distribution
if [ -f /etc/arch-release ]; then
    DISTRO="arch"
elif [ -f /etc/debian_version ]; then
    DISTRO="debian"
else
    echo "Unsupported distribution"
    exit 1
fi

echo "Detected distribution: $DISTRO"

# Install dependencies based on distribution
case $DISTRO in
    arch)
        echo "Installing dependencies for Arch Linux..."
        sudo pacman -S --needed wine winetricks protontricks python3 git
        ;;
    debian)
        echo "Installing dependencies for Debian/Ubuntu..."
        sudo apt update
        sudo apt install -y wine winetricks python3 git
        # Install protontricks from pip
        pip3 install protontricks --break-system-packages
        ;;
esac

echo "✓ Dependencies installed"

# Download MO2
MO2_VERSION="2.5.2"
MO2_URL="https://github.com/ModOrganizer2/modorganizer/releases/download/v${MO2_VERSION}/Mod.Organizer-${MO2_VERSION}-7z.7z"

echo "Downloading Mod Organizer 2..."
wget -O /tmp/mo2.7z "$MO2_URL"

echo "✓ MO2 downloaded"

# Extract MO2
INSTALL_DIR="$HOME/.modorganizer2"
mkdir -p "$INSTALL_DIR"
7z x -y -o"$INSTALL_DIR" /tmp/mo2.7z

echo "✓ MO2 extracted to $INSTALL_DIR"

# Set up NXM link handler
cat > ~/.local/share/applications/mo2-nxm-handler.desktop <<EOF
[Desktop Entry]
Name=Mod Organizer 2
Comment=Mod Organizer 2 for Linux
Exec=$INSTALL_DIR/ModOrganizer.exe %u
Icon=$INSTALL_DIR/mo2.ico
Type=Application
Categories=Game;
MimeType=x-scheme-handler/nxm;
Terminal=false
StartupNotify=true
EOF

update-desktop-database ~/.local/share/applications/

echo "✓ NXM link handler registered"

echo ""
echo "=== Setup Complete ==="
echo "MO2 is now installed at: $INSTALL_DIR"
echo "You can launch it from your application menu or by running:"
echo "$INSTALL_DIR/ModOrganizer.exe"