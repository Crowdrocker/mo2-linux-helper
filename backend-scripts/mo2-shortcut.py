#!/usr/bin/env python3
# MO2 Linux Helper - Steam Shortcut Generator
# This script generates Steam shortcuts for MO2 and games

import os
import sys
import struct
from pathlib import Path

def generate_vdf(shortcuts):
    """Generate VDF content for Steam shortcuts"""
    vdf = '"shortcuts"\n{\n'
    
    for i, shortcut in enumerate(shortcuts):
        vdf += f'  "{i}"\n'
        vdf += '  {\n'
        vdf += f'    "appid"    "{shortcut["appid"]}"\n'
        vdf += f'    "name"    "{shortcut["name"]}"\n'
        vdf += f'    "exe"    "{shortcut["exe"]}"\n'
        vdf += f'    "StartDir"    "{shortcut["start_dir"]}"\n'
        vdf += f'    "LaunchOptions"    "{shortcut["launch_options"]}"\n'
        vdf += '  }\n'
    
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
    main()