#!/usr/bin/env python3
"""
mo2-shortcut.py — Add MO2 as a Steam non-Steam shortcut by writing shortcuts.vdf
Part of MO2 Linux Helper: https://github.com/yourusername/mo2-linux-helper

Usage:
  python3 mo2-shortcut.py [--exe PATH] [--start-dir DIR] [--proton VERSION] [--remove]
"""

import argparse
import glob
import os
import struct
import sys
import time
import zlib

# ── VDF binary format helpers ─────────────────────────────────────────────────

def encode_string(key: str, value: str) -> bytes:
    """Encode a VDF string entry: \x01 + key + \x00 + value + \x00"""
    return b'\x01' + key.encode('utf-8') + b'\x00' + value.encode('utf-8') + b'\x00'

def encode_int32(key: str, value: int) -> bytes:
    """Encode a VDF int32 entry: \x02 + key + \x00 + 4-byte LE int"""
    return b'\x02' + key.encode('utf-8') + b'\x00' + struct.pack('<I', value)

def build_shortcut_entry(index: int, exe: str, name: str, start_dir: str,
                          launch_options: str, icon: str) -> bytes:
    """Build a single shortcuts.vdf entry in Valve binary format."""
    app_id = generate_app_id(exe, name)

    entry  = b'\x00' + str(index).encode() + b'\x00'
    entry += encode_int32('appid', app_id)
    entry += encode_string('AppName', name)
    entry += encode_string('Exe', f'"{exe}"')
    entry += encode_string('StartDir', f'"{start_dir}"')
    entry += encode_string('icon', icon)
    entry += encode_string('ShortcutPath', '')
    entry += encode_string('LaunchOptions', launch_options)
    entry += encode_int32('IsHidden', 0)
    entry += encode_int32('AllowDesktopConfig', 1)
    entry += encode_int32('AllowOverlay', 1)
    entry += encode_int32('OpenVR', 0)
    entry += encode_int32('Devkit', 0)
    entry += encode_string('DevkitGameID', '')
    entry += encode_int32('LastPlayTime', int(time.time()))
    entry += b'\x08\x08'  # end of entry

    return entry

def generate_app_id(exe: str, name: str) -> int:
    """Generate a unique app ID from exe path and name (matches Steam's algorithm)."""
    key = f'"{exe}"{name}'
    top = zlib.crc32(key.encode('utf-8')) | 0x80000000
    return (top << 32) | 0x02000000

def read_shortcuts_vdf(path: str) -> bytes:
    """Read existing shortcuts.vdf or return minimal valid header."""
    if os.path.exists(path):
        with open(path, 'rb') as f:
            return f.read()
    return b'\x00shortcuts\x00'

def find_shortcut_count(data: bytes) -> int:
    """Count existing shortcut entries."""
    count = 0
    i = 0
    while i < len(data):
        if data[i:i+1] == b'\x00':
            # Try to find numeric index
            j = i + 1
            while j < len(data) and data[j:j+1] not in (b'\x00',):
                j += 1
            candidate = data[i+1:j]
            if candidate.isdigit():
                count = max(count, int(candidate) + 1)
        i += 1
    return count

def remove_mo2_shortcut(data: bytes) -> bytes:
    """Remove MO2 entry from shortcuts data."""
    # Simple approach: remove everything between MO2 markers
    mo2_marker = b'Mod Organizer 2'
    if mo2_marker not in data:
        return data
    print("  ⚠ Automatic VDF editing not yet implemented — edit manually")
    return data

# ── Main ──────────────────────────────────────────────────────────────────────

def find_shortcuts_vdf() -> list[str]:
    steam_root = os.path.expanduser("~/.local/share/Steam")
    pattern = os.path.join(steam_root, "userdata", "*", "config", "shortcuts.vdf")
    return glob.glob(pattern)

def main():
    parser = argparse.ArgumentParser(description='Add MO2 as a Steam non-Steam shortcut')
    parser.add_argument('--exe', default=os.path.expanduser(
        '~/.local/share/modorganizer2/ModOrganizer.exe'))
    parser.add_argument('--start-dir', default=os.path.expanduser(
        '~/.local/share/modorganizer2'))
    parser.add_argument('--proton', default='Proton-GE-Proton9-20')
    parser.add_argument('--name', default='Mod Organizer 2')
    parser.add_argument('--remove', action='store_true')
    parser.add_argument('--list', action='store_true', help='List found shortcuts.vdf files')
    args = parser.parse_args()

    vdf_files = find_shortcuts_vdf()

    if not vdf_files:
        print("✗ No shortcuts.vdf found — is Steam installed and has been run at least once?")
        print(f"  Expected: ~/.local/share/Steam/userdata/<uid>/config/shortcuts.vdf")
        sys.exit(1)

    if args.list:
        print("Found shortcuts.vdf files:")
        for f in vdf_files:
            print(f"  {f}")
        return

    launch_options = (
        f"PROTON_USE_WINED3D=0 "
        f"STEAM_COMPAT_CLIENT_INSTALL_PATH=~/.local/share/Steam "
        f"STEAM_COMPAT_DATA_PATH=~/.steam/steam/steamapps/compatdata/MO2 "
        f"%command%"
    )
    icon = os.path.join(args.start_dir, "ModOrganizer.ico")

    for vdf_path in vdf_files:
        print(f"Processing {vdf_path}...")
        data = read_shortcuts_vdf(vdf_path)

        if args.remove:
            data = remove_mo2_shortcut(data)
            print("  ✓ MO2 shortcut removed")
        else:
            idx = find_shortcut_count(data)

            # Strip trailing \x08\x08 end markers before appending
            if data.endswith(b'\x08\x08'):
                data = data[:-2]

            entry = build_shortcut_entry(
                index=idx,
                exe=args.exe,
                name=args.name,
                start_dir=args.start_dir,
                launch_options=launch_options,
                icon=icon,
            )
            data = data + entry + b'\x08\x08'
            print(f"  ✓ Shortcut appended (index {idx}, appid {generate_app_id(args.exe, args.name)})")

        # Backup before writing
        backup = vdf_path + '.bak'
        if os.path.exists(vdf_path):
            import shutil
            shutil.copy2(vdf_path, backup)
            print(f"  ✓ Backup saved to {backup}")

        with open(vdf_path, 'wb') as f:
            f.write(data)
        print(f"  ✓ Written to {vdf_path}")

    print("")
    print("✅ Done! Restart Steam to see 'Mod Organizer 2' in your library.")
    print(f"   Set Proton version to {args.proton} in the game's Properties > Compatibility.")

if __name__ == '__main__':
    main()
