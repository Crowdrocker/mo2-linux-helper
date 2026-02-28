import React, { useState } from 'react';
import { 
  Code, 
  Copy, 
  Download, 
  Play, 
  FileText,
  Terminal,
  CheckCircle
} from 'lucide-react';

function BackendScripts() {
  const [copiedScript, setCopiedScript] = useState(null);

  const scripts = [
    {
      id: 'mo2-setup',
      name: 'mo2-setup.sh',
      description: 'Main MO2 installation script',
      language: 'bash',
      content: `#!/bin/bash
# MO2 Linux Helper - Setup Script
# This script installs Mod Organizer 2 and dependencies on Linux

set -e

echo "=== MO2 Linux Helper Setup ==="
echo ""

# Check if running as root
if [ "\$EUID" -eq 0 ]; then 
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

echo "Detected distribution: \$DISTRO"

# Install dependencies based on distribution
case \$DISTRO in
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
MO2_URL="https://github.com/ModOrganizer2/modorganizer/releases/download/v\${MO2_VERSION}/Mod.Organizer-\${MO2_VERSION}-7z.7z"

echo "Downloading Mod Organizer 2..."
wget -O /tmp/mo2.7z "\$MO2_URL"

echo "✓ MO2 downloaded"

# Extract MO2
INSTALL_DIR="\$HOME/.modorganizer2"
mkdir -p "\$INSTALL_DIR"
7z x -y -o"\$INSTALL_DIR" /tmp/mo2.7z

echo "✓ MO2 extracted to \$INSTALL_DIR"

# Set up NXM link handler
cat > ~/.local/share/applications/mo2-nxm-handler.desktop <<EOF
[Desktop Entry]
Name=Mod Organizer 2
Comment=Mod Organizer 2 for Linux
Exec=\$INSTALL_DIR/ModOrganizer.exe %u
Icon=\$INSTALL_DIR/mo2.ico
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
echo "MO2 is now installed at: \$INSTALL_DIR"
echo "You can launch it from your application menu or by running:"
echo "\$INSTALL_DIR/ModOrganizer.exe"`
    },
    {
      id: 'mo2-nxm',
      name: 'mo2-nxm.sh',
      description: 'NXM link handler setup script',
      language: 'bash',
      content: `#!/bin/bash
# MO2 Linux Helper - NXM Link Handler Setup
# This script sets up the NXM link handler for Nexus Mods

set -e

MO2_PATH="\${1:-\$HOME/.modorganizer2}"

echo "=== NXM Link Handler Setup ==="
echo "MO2 Path: \$MO2_PATH"
echo ""

# Create desktop file
DESKTOP_FILE="\$HOME/.local/share/applications/mo2-nxm-handler.desktop"

cat > "\$DESKTOP_FILE" <<EOF
[Desktop Entry]
Name=Mod Organizer 2
Comment=Mod Organizer 2 for Linux
Exec=\$MO2_PATH/ModOrganizer.exe %u
Icon=\$MO2_PATH/mo2.ico
Type=Application
Categories=Game;
MimeType=x-scheme-handler/nxm;
Terminal=false
StartupNotify=true
EOF

echo "✓ Desktop file created: \$DESKTOP_FILE"

# Update desktop database
update-desktop-database ~/.local/share/applications/

echo "✓ Desktop database updated"

# Set as default handler
xdg-mime default mo2-nxm-handler.desktop x-scheme-handler/nxm

echo "✓ NXM handler registered"

echo ""
echo "=== Setup Complete ==="
echo "NXM links will now open in Mod Organizer 2"`
    },
    {
      id: 'mo2-shortcut',
      name: 'mo2-shortcut.py',
      description: 'Steam shortcut generator for MO2',
      language: 'python',
      content: `#!/usr/bin/env python3
# MO2 Linux Helper - Steam Shortcut Generator
# This script generates Steam shortcuts for MO2 and games

import os
import sys
import struct
from pathlib import Path

def generate_vdf(shortcuts):
    """Generate VDF content for Steam shortcuts"""
    vdf = '"shortcuts"\\n{\\n'
    
    for i, shortcut in enumerate(shortcuts):
        vdf += f'  "{i}"\\n'
        vdf += '  {\\n'
        vdf += f'    "appid"    "{shortcut["appid"]}"\\n'
        vdf += f'    "name"    "{shortcut["name"]}"\\n'
        vdf += f'    "exe"    "{shortcut["exe"]}"\\n'
        vdf += f'    "StartDir"    "{shortcut["start_dir"]}"\\n'
        vdf += f'    "LaunchOptions"    "{shortcut["launch_options"]}"\\n'
        vdf += '  }\\n'
    
    vdf += '}'
    return vdf

def main():
    # Steam shortcuts path
    steam_path = Path.home() / '.steam' / 'steam'
    user_data = steam_path / 'userdata'
    
    # Find first user ID
    user_ids = [d for d in user_data.iterdir() if d.is_dir() and d.name.isdigit()]
    if not user_ids:
        print("Error: No Steam user found")
        sys.exit(1)
    
    user_id = user_ids[0]
    shortcuts_vdf = user_id / 'config' / 'shortcuts.vdf'
    
    # Define shortcuts
    mo2_path = os.environ.get('MO2_PATH', str(Path.home() / '.modorganizer2'))
    
    shortcuts = [
        {
            'appid': 1,
            'name': 'Mod Organizer 2',
            'exe': f'"{mo2_path}/ModOrganizer.exe"',
            'start_dir': f'"{mo2_path}"',
            'launch_options': 'PROTON_NO_ESYNC=1 PROTON_NO_FSYNC=1 %command%'
        }
    ]
    
    # Generate VDF
    vdf_content = generate_vdf(shortcuts)
    
    # Write to file
    shortcuts_vdf.parent.mkdir(parents=True, exist_ok=True)
    with open(shortcuts_vdf, 'w') as f:
        f.write(vdf_content)
    
    print(f"✓ Shortcuts written to: {shortcuts_vdf}")
    print("Restart Steam to see the shortcuts")

if __name__ == '__main__':
    main()`
    },
    {
      id: 'mo2-flatpak-setup',
      name: 'mo2-flatpak-setup.sh',
      description: 'Flatpak configuration and setup script',
      language: 'bash',
      content: `#!/bin/bash
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
flatpak override --user --env=STEAM_COMPAT_DATA_PATH="\$HOME/.steam/steam/steamapps/compatdata" com.modorganizer.MO2

# D-Bus access
flatpak override --user --talk-name=org.freedesktop.Notifications com.modorganizer.MO2

echo "✓ Flatpak overrides configured"

echo ""
echo "=== Setup Complete ==="
echo "MO2 Flatpak is now configured with the necessary permissions"`
    }
  ];

  const copyToClipboard = (scriptId, content) => {
    navigator.clipboard.writeText(content);
    setCopiedScript(scriptId);
    setTimeout(() => setCopiedScript(null), 2000);
  };

  const downloadScript = (scriptId, name, content) => {
    const blob = new Blob([content], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = name;
    a.click();
    URL.revokeObjectURL(url);
  };

  const runScript = (scriptId) => {
    console.log('Running script:', scriptId);
    alert(`In a real application, this would execute ${scriptId}`);
  };

  return (
    <div className="backend-scripts">
      <div className="flex justify-between items-center mb-4">
        <div>
          <h1>Backend Scripts</h1>
          <p className="text-muted">Shell and Python scripts for MO2 configuration</p>
        </div>
      </div>

      <div className="grid grid-2">
        {scripts.map((script) => (
          <div key={script.id} className="card">
            <div className="card-header">
              <div className="flex items-center gap-2">
                <Code size={24} className="text-cyan" />
                <div>
                  <h3 className="card-title">{script.name}</h3>
                  <p className="text-muted text-sm">{script.description}</p>
                </div>
              </div>
              <span className="badge badge-info">{script.language}</span>
            </div>
            <div className="card-body">
              <pre className="terminal" style={{ maxHeight: '300px', marginBottom: '1rem' }}>
                <code>{script.content}</code>
              </pre>
              <div className="flex gap-2">
                <button 
                  className="btn btn-sm flex-1"
                  onClick={() => copyToClipboard(script.id, script.content)}
                >
                  {copiedScript === script.id ? (
                    <>
                      <CheckCircle size={16} className="mr-2" />
                      Copied!
                    </>
                  ) : (
                    <>
                      <Copy size={16} className="mr-2" />
                      Copy
                    </>
                  )}
                </button>
                <button 
                  className="btn btn-sm flex-1"
                  onClick={() => downloadScript(script.id, script.name, script.content)}
                >
                  <Download size={16} className="mr-2" />
                  Download
                </button>
                <button 
                  className="btn btn-sm btn-primary flex-1"
                  onClick={() => runScript(script.id)}
                >
                  <Play size={16} className="mr-2" />
                  Run
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>

      <div className="card mt-4">
        <div className="card-header">
          <h3 className="card-title">
            <Terminal size={20} className="mr-2" />
            Usage Instructions
          </h3>
        </div>
        <div className="card-body">
          <ol className="text-muted" style={{ paddingLeft: '1.5rem' }}>
            <li className="mb-2">Download the script you need using the Download button</li>
            <li className="mb-2">Make it executable: <code className="text-cyan">chmod +x script.sh</code></li>
            <li className="mb-2">Run it: <code className="text-cyan">./script.sh</code></li>
            <li>For Python scripts: <code className="text-cyan">python3 script.py</code></li>
          </ol>
        </div>
      </div>
    </div>
  );
}

export default BackendScripts;