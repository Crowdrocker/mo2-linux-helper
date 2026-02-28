#!/bin/bash
# MO2 Linux Helper - Flatpak Setup
# This script configures Flatpak for MO2

set -e

echo "=== MO2 Flatpak Setup ==="
echo ""

# Install Flatpak if not present
if ! command -v flatpak &> /dev/null; then
    echo "Installing Flatpak..."
    
    if [ -f /etc/arch-release ]; then
        sudo pacman -S flatpak
    elif [ -f /etc/debian_version ]; then
        sudo apt install flatpak
    fi
    
    echo "✓ Flatpak installed"
fi

# Add Flathub repository
echo "Adding Flathub repository..."
flatpak remote-add --if-not-exists flathub https://flathub.org/repo/flathub.flatpakrepo

echo "✓ Flathub repository added"

# Configure Flatpak overrides for MO2
echo "Configuring Flatpak overrides..."

# Filesystem access
flatpak override --user --filesystem=host com.modorganizer.MO2
flatpak override --user --filesystem=home com.modorganizer.MO2

# Device access
flatpak override --user --device=all com.modorganizer.MO2

# Socket access
flatpak override --user --socket=x11 com.modorganizer.MO2
flatpak override --user --socket=wayland com.modorganizer.MO2
flatpak override --user --socket=pulseaudio com.modorganizer.MO2

# Environment variables
flatpak override --user --env=STEAM_COMPAT_DATA_PATH="$HOME/.steam/steam/steamapps/compatdata" com.modorganizer.MO2

# D-Bus access
flatpak override --user --talk-name=org.freedesktop.Notifications com.modorganizer.MO2

echo "✓ Flatpak overrides configured"

echo ""
echo "=== Setup Complete ==="
echo "MO2 Flatpak is now configured with the necessary permissions"