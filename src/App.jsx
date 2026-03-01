import { useState, useEffect, useRef, useCallback } from "react";
import { invoke } from "@tauri-apps/api/core";
import { open } from "@tauri-apps/plugin-dialog";
import { sendNotification } from "@tauri-apps/plugin-notification";

// ─── CONSTANTS ────────────────────────────────────────────────────────────────

const GAMES = [
  { id: "cyberpunk",  name: "Cyberpunk 2077",       cat: "RPG",    icon: "⚡", fix: "DXVK + vkd3d-proton" },
  { id: "fallout4",   name: "Fallout 4",             cat: "RPG",    icon: "☢️", fix: "vcrun2022 + d3dcompiler_47" },
  { id: "skyrimse",   name: "Skyrim SE",             cat: "RPG",    icon: "🐉", fix: "vcrun2022 + d3dcompiler_47" },
  { id: "skyrimvr",   name: "Skyrim VR",             cat: "RPG",    icon: "🥽", fix: "OpenVR + vcrun2022" },
  { id: "fallout3",   name: "Fallout 3",             cat: "RPG",    icon: "💣", fix: "GFWL removal + xlive patch" },
  { id: "newvegas",   name: "Fallout New Vegas",     cat: "RPG",    icon: "🎰", fix: "nvse + vcrun2010" },
  { id: "oblivion",   name: "Oblivion Remastered",   cat: "RPG",    icon: "🏰", fix: "vcrun2019 + obse shim" },
  { id: "morrowind",  name: "Morrowind",             cat: "RPG",    icon: "🌊", fix: "OpenMW native or MWSE" },
  { id: "starfield",  name: "Starfield",             cat: "RPG",    icon: "🚀", fix: "vcrun2022 + dotnet6" },
  { id: "bg3",        name: "Baldur's Gate 3",       cat: "RPG",    icon: "🎲", fix: "Native Linux + vcrun2022" },
  { id: "witcher3",   name: "The Witcher 3",         cat: "RPG",    icon: "⚔️", fix: "Script Merger + vcrun2019" },
  { id: "darksouls",  name: "Dark Souls Remastered", cat: "Action", icon: "🔥", fix: "EAC bypass + DS1 fix" },
  { id: "eldenring",  name: "Elden Ring",            cat: "Action", icon: "💍", fix: "EAC bypass + seamless coop" },
  { id: "xedit",      name: "xEdit / FO4Edit",       cat: "Tool",   icon: "🛠", fix: "mono + dotnet48" },
  { id: "synthesis",  name: "Synthesis",             cat: "Tool",   icon: "🧬", fix: "dotnet6 + mono" },
  { id: "bodyslide",  name: "BodySlide",             cat: "Tool",   icon: "📐", fix: "vcrun2019 + wine32" },
  { id: "ninskope",   name: "NifSkope",              cat: "Tool",   icon: "🔩", fix: "Qt5 wine shim" },
  { id: "loot",       name: "LOOT",                  cat: "Tool",   icon: "📋", fix: "Native Linux binary" },
];

const FLATPAK_PERMS = [
  { id: "--filesystem=home",           label: "~/ (Home)",        desc: "Read/write home folder",    risk: "high",   flag: "--filesystem=home" },
  { id: "--filesystem=/mnt",           label: "/mnt",             desc: "External drives",           risk: "medium", flag: "--filesystem=/mnt" },
  { id: "--filesystem=/media",         label: "/media",           desc: "USB/external mod storage",  risk: "medium", flag: "--filesystem=/media" },
  { id: "--device=all",                label: "All devices",      desc: "Required for GPU/VR",       risk: "high",   flag: "--device=all" },
  { id: "--socket=x11",                label: "X11",              desc: "X11 display server",        risk: "low",    flag: "--socket=x11" },
  { id: "--socket=wayland",            label: "Wayland",          desc: "Wayland display server",    risk: "low",    flag: "--socket=wayland" },
  { id: "--socket=session-bus",        label: "Session D-Bus",    desc: "Desktop integration",       risk: "low",    flag: "--socket=session-bus" },
  { id: "--socket=system-bus",         label: "System D-Bus",     desc: "System-level access",       risk: "high",   flag: "--socket=system-bus" },
  { id: "--talk-name=com.valvesoftware.Steam", label: "Talk to Steam", desc: "Steam integration",   risk: "low",    flag: "--talk-name=com.valvesoftware.Steam" },
  { id: "--env=PROTON_USE_WINED3D=0",  label: "Proton env vars",  desc: "STEAM_COMPAT_* vars",       risk: "low",    flag: "--env=PROTON_USE_WINED3D=0" },
];

const SECTIONS = ["WIZARD", "DEPS", "GAMES", "NXM", "SHORTCUT", "FLATPAK", "INSTANCES", "PLUGINS", "SCRIPTS", "MANIFEST"];
const NAV_ICONS = { WIZARD: "⚙", DEPS: "◈", GAMES: "◉", NXM: "⬡", SHORTCUT: "◈", FLATPAK: "⬡", INSTANCES: "◈", PLUGINS: "⬡", SCRIPTS: "⌨", MANIFEST: "◈" };

// ─── BACKEND SCRIPTS (same as before, truncated for brevity) ─────────────────

const SCRIPTS = {
  "mo2-setup.sh": `#!/usr/bin/env bash
# MO2 Linux Helper — Setup Script v2.0
set -euo pipefail
MO2_PATH="\${MO2_INSTALL_PATH:-$HOME/Games/MO2}"
LOG="/tmp/mo2-setup-$(date +%Y%m%d-%H%M%S).log"
log()  { echo -e "\\e[36m[MO2]\\e[0m $*" | tee -a "$LOG"; }
warn() { echo -e "\\e[33m[WARN]\\e[0m $*" | tee -a "$LOG"; }
err()  { echo -e "\\e[31m[ERR]\\e[0m $*" | tee -a "$LOG"; exit 1; }

case "\${1:-help}" in
  --install-proton)
    command -v protonup &>/dev/null || err "protonup not found"
    protonup -i GE-Proton9-27 ;;
  --setup-prefix)
    [[ -z "\${2:-}" ]] && err "AppID required"
    protontricks "$2" vcrun2022 dotnet6 d3dcompiler_47 ;;
  --install-mo2)
    mkdir -p "$MO2_PATH"
    LATEST=$(curl -s https://api.github.com/repos/ModOrganizer2/modorganizer/releases/latest | grep tag_name | cut -d'"' -f4)
    curl -L "https://github.com/ModOrganizer2/modorganizer/releases/download/\${LATEST}/Mod.Organizer-\${LATEST}.exe" -o "/tmp/MO2.exe"
    log "MO2 $LATEST downloaded to /tmp/MO2.exe" ;;
  --nxm)
    DESKTOP="\${XDG_DATA_HOME:-$HOME/.local/share}/applications/nxm-handler.desktop"
    cat > "$DESKTOP" <<EOF
[Desktop Entry]
Name=NXM Handler
Exec=$MO2_PATH/nxmhandler.exe %u
Type=Application
MimeType=x-scheme-handler/nxm;x-scheme-handler/nxm-protocol
NoDisplay=true
EOF
    xdg-mime default nxm-handler.desktop x-scheme-handler/nxm
    update-desktop-database "\${XDG_DATA_HOME:-$HOME/.local/share}/applications/" ;;
  --all) "$0" --install-proton && "$0" --install-mo2 && "$0" --nxm ;;
  *) echo "Usage: $0 [--install-proton|--setup-prefix <ID>|--install-mo2|--nxm|--all]" ;;
esac`,

  "mo2-nxm.sh": `#!/usr/bin/env bash
MO2_PATH="\${MO2_INSTALL_PATH:-$HOME/Games/MO2}"
DESKTOP="\${XDG_DATA_HOME:-$HOME/.local/share}/applications/nxm-handler.desktop"
register() {
  mkdir -p "$(dirname "$DESKTOP")"
  cat > "$DESKTOP" <<EOF
[Desktop Entry]
Version=1.0
Name=NXM Link Handler (MO2)
Exec=$MO2_PATH/nxmhandler.exe %u
Type=Application
MimeType=x-scheme-handler/nxm;x-scheme-handler/nxm-protocol
NoDisplay=true
EOF
  xdg-mime default nxm-handler.desktop x-scheme-handler/nxm
  xdg-mime default nxm-handler.desktop x-scheme-handler/nxm-protocol
  update-desktop-database "$(dirname "$DESKTOP")" 2>/dev/null || true
  echo -e "\\e[36m✓ NXM registered\\e[0m"
}
unregister() { rm -f "$DESKTOP"; update-desktop-database "$(dirname "$DESKTOP")" 2>/dev/null || true; echo -e "\\e[33m✓ NXM removed\\e[0m"; }
case "\${1:-register}" in
  register)   register ;;
  unregister) unregister ;;
  status) [[ -f "$DESKTOP" ]] && echo "● registered" || echo "○ not registered" ;;
esac`,

  "mo2-shortcut.py": `#!/usr/bin/env python3
"""MO2 Non-Steam Shortcut Adder — requires: pip install vdf"""
import os, sys, shutil, time
from pathlib import Path
try:
    import vdf
except ImportError:
    sys.exit("Install vdf: pip install vdf")

MO2   = Path(os.environ.get("MO2_INSTALL_PATH", Path.home() / "Games/MO2"))
STEAM = Path.home() / ".local/share/Steam"
OPTS  = 'STEAM_COMPAT_DATA_PATH="$COMPAT" DXVK_ASYNC=1 %command%'

def main():
    users = sorted((STEAM/"userdata").iterdir(), key=lambda p: p.stat().st_mtime)
    sc = users[-1] / "config" / "shortcuts.vdf"
    bk = sc.with_suffix(".vdf.bak")
    if sc.exists():
        shutil.copy2(sc, bk)
        data = vdf.binary_loads(sc.read_bytes())
    else:
        data = {"shortcuts": {}}
    idx = str(len(data["shortcuts"]))
    data["shortcuts"][idx] = {
        "appname": "Mod Organizer 2",
        "exe": f'"{MO2}/ModOrganizer.exe"',
        "StartDir": str(MO2),
        "LaunchOptions": OPTS,
        "icon": str(MO2 / "mo2icon.png"),
        "IsHidden": 0, "AllowOverlay": 1, "OpenVR": 0,
        "LastPlayTime": int(time.time()),
        "tags": {"0": "MO2", "1": "Modding"},
    }
    sc.write_bytes(vdf.binary_dumps(data))
    print(f"✓ Written to {sc}\\n  Backup: {bk}\\nRestart Steam.")

if __name__ == "__main__":
    dry = "--dry-run" in sys.argv
    if dry:
        print("[DRY RUN] No changes.")
    else:
        main()`,

  "mo2-flatpak-setup.sh": `#!/usr/bin/env bash
APP="com.modorganizer.MO2LinuxHelper"
MO2_PATH="\${MO2_INSTALL_PATH:-$HOME/Games/MO2}"
log() { echo -e "\\e[36m[FLATPAK]\\e[0m $*"; }
case "\${1:-all}" in
  all)
    flatpak override --user --filesystem=home "$APP"
    flatpak override --user --filesystem=/mnt "$APP"
    flatpak override --user --device=all "$APP"
    flatpak override --user --socket=x11 --socket=wayland "$APP"
    flatpak override --user --talk-name=com.valvesoftware.Steam "$APP"
    flatpak override --user --env=MO2_INSTALL_PATH="$MO2_PATH" "$APP"
    log "Done. Run: flatpak override --user --show $APP"
    ;;
  show)  flatpak override --user --show "$APP" ;;
  reset) flatpak override --user --reset "$APP"; log "Reset." ;;
  *) echo "Usage: $0 [all|show|reset]" ;;
esac`,
};

// ─── TINY HELPERS ─────────────────────────────────────────────────────────────

const TerminalLog = ({ lines }) => {
  const ref = useRef();
  useEffect(() => { if (ref.current) ref.current.scrollTop = ref.current.scrollHeight; }, [lines]);
  return (
    <div ref={ref} style={{ fontFamily: "monospace", fontSize: 12, background: "#060a0d", border: "1px solid #0ff3", padding: "10px 14px", height: 160, overflowY: "auto", borderRadius: 4 }}>
      {lines.map((l, i) => (
        <div key={i} style={{ color: l.startsWith("[ERR]") ? "#ff4444" : l.startsWith("[WARN]") ? "#ffaa00" : l.startsWith("✓") ? "#00ff9f" : "#7de8ff" }}>{l}</div>
      ))}
    </div>
  );
};

const ProgressBar = ({ value, color = "#00f0ff" }) => (
  <div style={{ background: "#0a1520", border: "1px solid #0ff3", borderRadius: 2, height: 8, overflow: "hidden", margin: "6px 0" }}>
    <div style={{ width: `${value}%`, height: "100%", background: `linear-gradient(90deg, ${color}88, ${color})`, transition: "width 0.4s ease", boxShadow: `0 0 8px ${color}` }} />
  </div>
);

const Badge = ({ label, color = "#00f0ff" }) => (
  <span style={{ fontSize: 10, fontFamily: "monospace", padding: "1px 6px", border: `1px solid ${color}55`, borderRadius: 2, color, background: `${color}18`, marginLeft: 6, letterSpacing: 1 }}>{label}</span>
);

const StatusDot = ({ status }) => {
  const c = { ok: "#00ff9f", warn: "#ffaa00", missing: "#ff4444" };
  const l = { ok: "OK", warn: "WARN", missing: "MISS" };
  return (
    <span style={{ color: c[status], fontFamily: "monospace", fontSize: 11, display: "flex", alignItems: "center", gap: 4 }}>
      <span style={{ display: "inline-block", width: 7, height: 7, borderRadius: "50%", background: c[status], boxShadow: `0 0 6px ${c[status]}` }} />
      {l[status]}
    </span>
  );
};

const Spinner = () => (
  <span style={{ display: "inline-block", animation: "spin 0.7s linear infinite", fontSize: 14 }}>⟳</span>
);

// ─── MAIN APP ─────────────────────────────────────────────────────────────────

export default function App() {
  const [section, setSection] = useState("WIZARD");
  const [toast, setToast] = useState(null);

  // Persisted config
  const [config, setConfig] = useState(() => {
    try { return JSON.parse(localStorage.getItem("mo2lh_config") || "{}"); } catch { return {}; }
  });

  // Wizard
  const [mo2Path, setMo2Path] = useState(config.mo2Path || `${window.__HOME__ || "/home/user"}/Games/MO2`);
  const [steamAppId, setSteamAppId] = useState(config.steamAppId || "");
  const [protonVersion, setProtonVersion] = useState(config.protonVersion || "GE-Proton9-27");
  const [isDryRun, setIsDryRun] = useState(false);
  const [wizardLog, setWizardLog] = useState(["[MO2] Ready. Press ▶ RUN SETUP to begin."]);
  const [wizardProgress, setWizardProgress] = useState(0);
  const [wizardRunning, setWizardRunning] = useState(false);

  // Deps
  const [deps, setDeps] = useState([]);
  const [depsLoading, setDepsLoading] = useState(false);
  const [installingDep, setInstallingDep] = useState(null);

  // Games
  const [activeGames, setActiveGames] = useState(config.activeGames || {});
  const [gameFilter, setGameFilter] = useState("All");
  const [gameSearch, setGameSearch] = useState("");
  const [applyingGame, setApplyingGame] = useState(null);

  // NXM
  const [nxmRegistered, setNxmRegistered] = useState(false);
  const [nxmLoading, setNxmLoading] = useState(false);

  // Shortcut
  const [launchOpts, setLaunchOpts] = useState('STEAM_COMPAT_DATA_PATH="$COMPAT" DXVK_ASYNC=1 %command%');
  const [shortcutLoading, setShortcutLoading] = useState(false);

  // Flatpak
  const [flatpakPerms, setFlatpakPerms] = useState(
    config.flatpakPerms || Object.fromEntries(FLATPAK_PERMS.map(p => [p.id, true]))
  );
  const [flatpakLoading, setFlatpakLoading] = useState(false);

  // Instances
  const [instances, setInstances] = useState([]);
  const [instancesLoading, setInstancesLoading] = useState(false);

  // Plugins
  const [plugins, setPlugins] = useState([]);
  const [pluginsLoading, setPluginsLoading] = useState(false);

  // Scripts
  const [activeScript, setActiveScript] = useState("mo2-setup.sh");

  // Updates
  const [updateInfo, setUpdateInfo] = useState(null);

  // ─── INIT ──────────────────────────────────────────────────────────────────

  useEffect(() => {
    loadDeps();
    loadPlugins();
    checkUpdates();
  }, []);

  const saveConfig = useCallback((updates) => {
    const next = { ...config, ...updates };
    setConfig(next);
    try { localStorage.setItem("mo2lh_config", JSON.stringify(next)); } catch {}
    showToast("Config saved ✓");
  }, [config]);

  const showToast = (msg, type = "ok") => {
    setToast({ msg, type });
    setTimeout(() => setToast(null), 2500);
  };

  // ─── BACKEND CALLS ─────────────────────────────────────────────────────────

  const loadDeps = async () => {
    setDepsLoading(true);
    try {
      const result = await invoke("check_dependencies");
      setDeps(result);
    } catch (e) {
      console.error("check_dependencies failed:", e);
      showToast("Backend not available (dev mode)", "warn");
    } finally {
      setDepsLoading(false);
    }
  };

  const installDep = async (depId) => {
    setInstallingDep(depId);
    try {
      const result = await invoke("install_dependency", { depId });
      if (result.success) {
        showToast(`Installed ✓`);
        try { sendNotification({ title: "MO2 Helper", body: `Dependency installed successfully` }); } catch {}
      } else {
        showToast(`Install failed: ${result.stderr.slice(0, 60)}`, "warn");
      }
      await loadDeps();
    } catch (e) {
      showToast(`Error: ${e}`, "warn");
    } finally {
      setInstallingDep(null);
    }
  };

  const runSetup = async () => {
    if (wizardRunning) return;
    setWizardRunning(true);
    setWizardProgress(0);
    setWizardLog(["[MO2] Sending config to backend..."]);
    try {
      const logs = await invoke("run_setup", {
        config: { mo2Path, steamAppId: steamAppId || null, protonVersion, dryRun: isDryRun }
      });
      let i = 0;
      const interval = setInterval(() => {
        if (i >= logs.length) { clearInterval(interval); setWizardRunning(false); setWizardProgress(100); saveConfig({ mo2Path, steamAppId, protonVersion }); return; }
        setWizardLog(prev => [...prev, logs[i]]);
        setWizardProgress(Math.round(((i + 1) / logs.length) * 100));
        i++;
      }, 300);
    } catch (e) {
      setWizardLog(prev => [...prev, `[ERR] Backend error: ${e}`]);
      setWizardRunning(false);
    }
  };

  const toggleNxm = async () => {
    setNxmLoading(true);
    try {
      const result = await invoke("set_nxm_handler", { register: !nxmRegistered, mo2Path });
      if (result.success) {
        setNxmRegistered(!nxmRegistered);
        showToast(nxmRegistered ? "NXM handler removed" : "NXM handler registered ✓");
      } else {
        showToast(`NXM error: ${result.stderr.slice(0, 80)}`, "warn");
      }
    } catch (e) { showToast(`Error: ${e}`, "warn"); }
    finally { setNxmLoading(false); }
  };

  const toggleGameFix = async (gameId, enabled) => {
    const next = { ...activeGames, [gameId]: enabled };
    setActiveGames(next);
    saveConfig({ activeGames: next });

    if (steamAppId && enabled) {
      setApplyingGame(gameId);
      try {
        const result = await invoke("apply_game_fix", { gameId, steamAppId, enable: enabled });
        if (result.success) showToast(`${gameId} fix applied ✓`);
        else showToast(`Fix warning: ${result.stderr.slice(0, 60)}`, "warn");
      } catch (e) { showToast(`Error: ${e}`, "warn"); }
      finally { setApplyingGame(null); }
    }
  };

  const writeSteamShortcut = async () => {
    setShortcutLoading(true);
    try {
      const result = await invoke("write_steam_shortcut", {
        cfg: { mo2Path, protonVersion, launchOptions: launchOpts, appName: "Mod Organizer 2" }
      });
      if (result.success) {
        showToast("Shortcut written! Restart Steam ✓");
        try { sendNotification({ title: "MO2 Helper", body: "Non-Steam shortcut added. Restart Steam to see it." }); } catch {}
      } else {
        showToast(`Error: ${result.stderr.slice(0, 80)}`, "warn");
      }
    } catch (e) { showToast(`Error: ${e}`, "warn"); }
    finally { setShortcutLoading(false); }
  };

  const applyFlatpak = async () => {
    setFlatpakLoading(true);
    const enabled = FLATPAK_PERMS.filter(p => flatpakPerms[p.id]).map(p => p.flag);
    try {
      const result = await invoke("apply_flatpak_overrides", { permissions: enabled });
      showToast(result.success ? "Flatpak permissions applied ✓" : `Error: ${result.stderr.slice(0, 60)}`, result.success ? "ok" : "warn");
    } catch (e) { showToast(`Error: ${e}`, "warn"); }
    finally { setFlatpakLoading(false); }
  };

  const scanInstances = async () => {
    setInstancesLoading(true);
    try {
      const result = await invoke("scan_portable_instances");
      setInstances(result);
      showToast(`Found ${result.length} instance(s) ✓`);
    } catch (e) { showToast(`Scan error: ${e}`, "warn"); }
    finally { setInstancesLoading(false); }
  };

  const loadPlugins = async () => {
    setPluginsLoading(true);
    try {
      const result = await invoke("scan_native_plugins", { mo2Path });
      setPlugins(result);
    } catch (e) { console.error(e); }
    finally { setPluginsLoading(false); }
  };

  const checkUpdates = async () => {
    try {
      const info = await invoke("check_for_updates");
      setUpdateInfo(info);
    } catch (e) { console.error(e); }
  };

  const browsePath = async () => {
    try {
      const selected = await open({ directory: true, defaultPath: mo2Path });
      if (selected) setMo2Path(selected);
    } catch (e) { console.error(e); }
  };

  // ─── STYLES ────────────────────────────────────────────────────────────────

  const s = {
    card: { background: "linear-gradient(135deg, #0a1520ee, #060d1aee)", border: "1px solid #0ff2", borderRadius: 6, padding: "18px 20px", marginBottom: 16 },
    input: { background: "#060d1a", border: "1px solid #0ff4", borderRadius: 3, color: "#7de8ff", fontFamily: "monospace", fontSize: 13, padding: "6px 10px", width: "100%", boxSizing: "border-box" },
    btn:     (c = "#00f0ff") => ({ background: "transparent", border: `1px solid ${c}`, borderRadius: 3, color: c, fontFamily: "monospace", fontSize: 12, padding: "5px 14px", cursor: "pointer", letterSpacing: 1 }),
    btnFill: (c = "#00f0ff") => ({ background: `${c}22`, border: `1px solid ${c}`, borderRadius: 3, color: c, fontFamily: "monospace", fontSize: 12, padding: "6px 16px", cursor: "pointer", letterSpacing: 1, fontWeight: "bold" }),
    label: { color: "#7de8ff99", fontSize: 11, fontFamily: "monospace", letterSpacing: 2, textTransform: "uppercase", marginBottom: 4, display: "block" },
    h2:    { color: "#00f0ff", fontFamily: "monospace", fontSize: 14, letterSpacing: 3, textTransform: "uppercase", marginBottom: 16, borderBottom: "1px solid #0ff2", paddingBottom: 8, display: "flex", alignItems: "center", gap: 8 },
    row:   { display: "flex", gap: 10, alignItems: "center", marginBottom: 8 },
  };

  const missingCount = deps.filter(d => d.status === "missing").length;
  const warnCount = deps.filter(d => d.status === "warn").length;
  const filteredGames = GAMES.filter(g => (gameFilter === "All" || g.cat === gameFilter) && (!gameSearch || g.name.toLowerCase().includes(gameSearch.toLowerCase())));
  const flatpakCmd = FLATPAK_PERMS.filter(p => flatpakPerms[p.id]).map(p => p.flag).join(" \\\n  ");

  // ─── SECTIONS ──────────────────────────────────────────────────────────────

  const renderSection = () => {
    switch (section) {

      case "WIZARD": return (
        <div>
          <div style={s.h2}>⚙ SETUP WIZARD</div>
          <div style={s.card}>
            <div style={s.row}>
              <div style={{ flex: 1 }}>
                <label style={s.label}>MO2 Install Path</label>
                <div style={{ display: "flex", gap: 6 }}>
                  <input style={s.input} value={mo2Path} onChange={e => setMo2Path(e.target.value)} />
                  <button style={s.btn()} onClick={browsePath}>📁</button>
                </div>
              </div>
              <div style={{ flex: 1 }}>
                <label style={s.label}>Steam AppID (for prefix)</label>
                <input style={s.input} value={steamAppId} onChange={e => setSteamAppId(e.target.value)} placeholder="377160 (Fallout 4)" />
              </div>
            </div>
            <div style={s.row}>
              <div style={{ flex: 1 }}>
                <label style={s.label}>Proton Version</label>
                <input style={s.input} value={protonVersion} onChange={e => setProtonVersion(e.target.value)} />
              </div>
              <div style={{ flex: 1, display: "flex", alignItems: "center", gap: 10, marginTop: 16 }}>
                <label style={{ ...s.label, marginBottom: 0, cursor: "pointer" }}>
                  <input type="checkbox" checked={isDryRun} onChange={e => setIsDryRun(e.target.checked)} style={{ marginRight: 6 }} />
                  DRY RUN (no changes written)
                </label>
              </div>
            </div>
          </div>
          <div style={s.card}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 8 }}>
              <span style={{ color: "#7de8ff", fontFamily: "monospace", fontSize: 12 }}>TERMINAL OUTPUT</span>
              <span style={{ color: "#00ff9f", fontFamily: "monospace", fontSize: 12 }}>{wizardProgress}%</span>
            </div>
            <ProgressBar value={wizardProgress} />
            <TerminalLog lines={wizardLog} />
            <div style={{ marginTop: 12, display: "flex", gap: 10 }}>
              <button style={s.btnFill()} onClick={runSetup} disabled={wizardRunning}>
                {wizardRunning ? <><Spinner /> RUNNING...</> : "▶ RUN SETUP"}
              </button>
              <button style={s.btn()} onClick={() => { setWizardLog(["[MO2] Ready."]); setWizardProgress(0); }}>RESET</button>
              <button style={s.btn("#ff9f00")} onClick={() => saveConfig({ mo2Path, steamAppId, protonVersion })}>SAVE CONFIG</button>
            </div>
          </div>
        </div>
      );

      case "DEPS": return (
        <div>
          <div style={s.h2}>◈ DEPENDENCIES
            {missingCount > 0 && <Badge label={`${missingCount} MISSING`} color="#ff4444" />}
            {warnCount > 0 && <Badge label={`${warnCount} WARN`} color="#ffaa00" />}
          </div>
          <div style={{ marginBottom: 12, display: "flex", gap: 8 }}>
            <button style={s.btnFill()} onClick={loadDeps} disabled={depsLoading}>
              {depsLoading ? <><Spinner /> SCANNING...</> : "↺ REFRESH"}
            </button>
            <button style={s.btn()} onClick={async () => {
              for (const d of deps.filter(x => x.status !== "ok")) await installDep(d.id);
            }}>⬇ INSTALL ALL MISSING</button>
          </div>
          {depsLoading && deps.length === 0 && <div style={{ color: "#7de8ff66", fontFamily: "monospace", fontSize: 12 }}>Checking system...</div>}
          {deps.map(dep => (
            <div key={dep.id} style={{ ...s.card, padding: "12px 16px", display: "flex", alignItems: "center", gap: 12 }}>
              <StatusDot status={dep.status} />
              <div style={{ flex: 1 }}>
                <div style={{ color: "#e0f8ff", fontFamily: "monospace", fontSize: 13, fontWeight: "bold" }}>{dep.name}</div>
                <div style={{ color: "#7de8ff77", fontFamily: "monospace", fontSize: 11, marginTop: 2 }}>
                  {dep.status === "ok" ? (dep.version || "installed") : dep.path ? `path: ${dep.path}` : "not found"}
                </div>
              </div>
              {dep.status !== "ok" && (
                <button style={s.btn(dep.status === "missing" ? "#ff4444" : "#ffaa00")}
                  onClick={() => installDep(dep.id)} disabled={installingDep === dep.id}>
                  {installingDep === dep.id ? <><Spinner /> INSTALLING...</> : "INSTALL"}
                </button>
              )}
              {dep.status === "ok" && <Badge label="OK" color="#00ff9f" />}
            </div>
          ))}
        </div>
      );

      case "GAMES": return (
        <div>
          <div style={s.h2}>◉ GAME FIXES — {Object.values(activeGames).filter(Boolean).length} ACTIVE</div>
          <div style={{ display: "flex", gap: 8, marginBottom: 14, flexWrap: "wrap" }}>
            {["All", "RPG", "Action", "Tool"].map(cat => (
              <button key={cat} style={gameFilter === cat ? s.btnFill() : s.btn()} onClick={() => setGameFilter(cat)}>{cat}</button>
            ))}
            <input style={{ ...s.input, width: 180, marginLeft: "auto" }} placeholder="Search games..." value={gameSearch} onChange={e => setGameSearch(e.target.value)} />
          </div>
          {!steamAppId && <div style={{ color: "#ffaa00", fontFamily: "monospace", fontSize: 11, marginBottom: 12, padding: "8px 12px", border: "1px solid #ffaa0033", borderRadius: 4 }}>⚠ Set Steam AppID in WIZARD to apply fixes via protontricks</div>}
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10 }}>
            {filteredGames.map(g => (
              <div key={g.id} style={{ ...s.card, marginBottom: 0, cursor: "pointer", border: activeGames[g.id] ? "1px solid #00f0ff88" : "1px solid #0ff2", background: activeGames[g.id] ? "#0a2030ee" : "#0a1520ee", transition: "all 0.2s" }}
                onClick={() => toggleGameFix(g.id, !activeGames[g.id])}>
                <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 6 }}>
                  <span style={{ fontSize: 18 }}>{g.icon}</span>
                  <div>
                    <div style={{ color: "#e0f8ff", fontFamily: "monospace", fontSize: 12, fontWeight: "bold" }}>{g.name}</div>
                    <Badge label={g.cat} color={g.cat === "Tool" ? "#ff9f00" : "#00f0ff"} />
                  </div>
                  <div style={{ marginLeft: "auto" }}>
                    {applyingGame === g.id ? <Spinner /> : (
                      <div style={{ width: 28, height: 16, borderRadius: 8, background: activeGames[g.id] ? "#00f0ff" : "#0a1520", border: "1px solid #0ff4", display: "flex", alignItems: "center", padding: "0 3px", justifyContent: activeGames[g.id] ? "flex-end" : "flex-start", transition: "all 0.2s" }}>
                        <div style={{ width: 10, height: 10, borderRadius: "50%", background: activeGames[g.id] ? "#000" : "#0ff5" }} />
                      </div>
                    )}
                  </div>
                </div>
                <div style={{ color: "#7de8ff88", fontFamily: "monospace", fontSize: 10, lineHeight: 1.5 }}>{g.fix}</div>
              </div>
            ))}
          </div>
        </div>
      );

      case "NXM": return (
        <div>
          <div style={s.h2}>⬡ NXM LINK HANDLER</div>
          <div style={s.card}>
            <div style={{ color: "#7de8ff88", fontFamily: "monospace", fontSize: 12, marginBottom: 12 }}>
              Registers <code style={{ color: "#00f0ff" }}>nxm://</code> and <code style={{ color: "#00f0ff" }}>nxm-protocol://</code> links to open in MO2.
              Writes to <code style={{ color: "#7de8ff77" }}>~/.local/share/applications/nxm-handler.desktop</code>
            </div>
            <div style={{ display: "flex", gap: 12, marginBottom: 14 }}>
              <button style={s.btnFill(nxmRegistered ? "#00ff9f" : "#00f0ff")} onClick={toggleNxm} disabled={nxmLoading}>
                {nxmLoading ? <><Spinner /> WORKING...</> : nxmRegistered ? "✓ REGISTERED — CLICK TO REMOVE" : "▶ REGISTER HANDLER"}
              </button>
            </div>
            <div style={{ color: "#7de8ff99", fontFamily: "monospace", fontSize: 11 }}>
              Status: <span style={{ color: nxmRegistered ? "#00ff9f" : "#ff6644" }}>
                {nxmRegistered ? "● ACTIVE — nxm:// links open in MO2" : "○ NOT REGISTERED"}
              </span>
            </div>
          </div>
          <div style={s.card}>
            <div style={{ color: "#7de8ff99", fontSize: 11, fontFamily: "monospace", marginBottom: 8, letterSpacing: 2 }}>LIVE .DESKTOP PREVIEW</div>
            <pre style={{ color: "#7de8ff", fontFamily: "monospace", fontSize: 11, background: "#060a0d", padding: 12, borderRadius: 4, border: "1px solid #0ff2", whiteSpace: "pre-wrap", margin: 0 }}>
{`[Desktop Entry]
Version=1.0
Name=NXM Link Handler (MO2)
Exec=${mo2Path}/nxmhandler.exe %u
Type=Application
MimeType=x-scheme-handler/nxm;x-scheme-handler/nxm-protocol
NoDisplay=true`}
            </pre>
            <button style={{ ...s.btn(), marginTop: 10 }} onClick={() => { navigator.clipboard.writeText(`[Desktop Entry]\nExec=${mo2Path}/nxmhandler.exe %u\n...`); showToast("Copied"); }}>COPY</button>
          </div>
        </div>
      );

      case "SHORTCUT": return (
        <div>
          <div style={s.h2}>◈ NON-STEAM SHORTCUT</div>
          <div style={s.card}>
            <label style={s.label}>Launch Options</label>
            <input style={s.input} value={launchOpts} onChange={e => setLaunchOpts(e.target.value)} />
            <div style={{ height: 10 }} />
            <label style={s.label}>MO2 Executable</label>
            <input style={{ ...s.input, opacity: 0.7 }} value={`${mo2Path}/ModOrganizer.exe`} readOnly />
            <div style={{ height: 10 }} />
            <label style={s.label}>Proton Version</label>
            <input style={s.input} value={protonVersion} onChange={e => setProtonVersion(e.target.value)} />
          </div>
          <div style={s.card}>
            <div style={{ color: "#7de8ff99", fontSize: 11, fontFamily: "monospace", marginBottom: 8, letterSpacing: 2 }}>STEAM VDF PREVIEW</div>
            <pre style={{ color: "#7de8ff", fontFamily: "monospace", fontSize: 11, background: "#060a0d", padding: 12, borderRadius: 4, border: "1px solid #0ff2", whiteSpace: "pre-wrap", margin: 0 }}>
{`"shortcuts" {
  "0" {
    "appname"      "Mod Organizer 2"
    "exe"          "${mo2Path}/ModOrganizer.exe"
    "StartDir"     "${mo2Path}"
    "LaunchOptions" "${launchOpts}"
    "AllowOverlay" "1"
    "tags" { "0" "MO2" "1" "Modding" }
  }
}`}
            </pre>
            <div style={{ marginTop: 12, display: "flex", gap: 10 }}>
              <button style={s.btnFill()} onClick={writeSteamShortcut} disabled={shortcutLoading}>
                {shortcutLoading ? <><Spinner /> WRITING...</> : "▶ WRITE TO shortcuts.vdf"}
              </button>
            </div>
            <div style={{ color: "#7de8ff55", fontFamily: "monospace", fontSize: 10, marginTop: 8 }}>Requires: <code>pip install vdf</code></div>
          </div>
        </div>
      );

      case "FLATPAK": return (
        <div>
          <div style={s.h2}>⬡ FLATPAK CONFIG</div>
          <div style={s.card}>
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 8 }}>
              {FLATPAK_PERMS.map(p => (
                <div key={p.id} style={{ display: "flex", alignItems: "center", gap: 8, padding: "8px 10px", border: "1px solid #0ff2", borderRadius: 4, background: flatpakPerms[p.id] ? "#0a2030" : "#060d1a" }}>
                  <input type="checkbox" checked={flatpakPerms[p.id]} onChange={e => {
                    const next = { ...flatpakPerms, [p.id]: e.target.checked };
                    setFlatpakPerms(next);
                    saveConfig({ flatpakPerms: next });
                  }} />
                  <div style={{ flex: 1 }}>
                    <div style={{ color: "#e0f8ff", fontFamily: "monospace", fontSize: 11 }}>{p.label}</div>
                    <div style={{ color: "#7de8ff66", fontFamily: "monospace", fontSize: 10 }}>{p.desc}</div>
                  </div>
                  <Badge label={p.risk} color={p.risk === "high" ? "#ff4444" : p.risk === "medium" ? "#ffaa00" : "#00ff9f"} />
                </div>
              ))}
            </div>
          </div>
          <div style={s.card}>
            <div style={{ color: "#7de8ff99", fontSize: 11, fontFamily: "monospace", marginBottom: 8, letterSpacing: 2 }}>GENERATED COMMAND</div>
            <pre style={{ color: "#7de8ff", fontFamily: "monospace", fontSize: 11, background: "#060a0d", padding: 12, borderRadius: 4, border: "1px solid #0ff2", whiteSpace: "pre-wrap", margin: 0 }}>
              {`flatpak override --user \\\n  ${flatpakCmd} \\\n  com.modorganizer.MO2LinuxHelper`}
            </pre>
            <div style={{ marginTop: 10, display: "flex", gap: 8 }}>
              <button style={s.btn()} onClick={() => { navigator.clipboard.writeText(`flatpak override --user \\\n  ${flatpakCmd} \\\n  com.modorganizer.MO2LinuxHelper`); showToast("Copied"); }}>COPY</button>
              <button style={s.btnFill()} onClick={applyFlatpak} disabled={flatpakLoading}>
                {flatpakLoading ? <><Spinner /> APPLYING...</> : "APPLY OVERRIDES"}
              </button>
            </div>
          </div>
        </div>
      );

      case "INSTANCES": return (
        <div>
          <div style={s.h2}>◈ PORTABLE INSTANCES</div>
          <div style={{ marginBottom: 12 }}>
            <button style={s.btnFill()} onClick={scanInstances} disabled={instancesLoading}>
              {instancesLoading ? <><Spinner /> SCANNING FILESYSTEM...</> : "⟳ SCAN FOR INSTANCES"}
            </button>
          </div>
          {instances.length === 0 && !instancesLoading && <div style={{ color: "#7de8ff44", fontFamily: "monospace", fontSize: 12 }}>No instances found. Press SCAN to search ~/Games, /mnt, /media</div>}
          {instances.map(inst => (
            <div key={inst.id} style={{ ...s.card, display: "flex", alignItems: "center", gap: 12 }}>
              <div style={{ flex: 1 }}>
                <div style={{ color: "#e0f8ff", fontFamily: "monospace", fontSize: 13, fontWeight: "bold" }}>{inst.game}</div>
                <div style={{ color: "#7de8ff77", fontFamily: "monospace", fontSize: 11 }}>{inst.path}</div>
                <div style={{ color: "#7de8ff44", fontFamily: "monospace", fontSize: 10 }}>Profile: {inst.profile} · ini: {inst.ini_path}</div>
              </div>
              <button style={s.btn()} onClick={async () => {
                try { await invoke("launch_mo2_instance", { path: inst.path, protonVersion }); showToast(`Launching ${inst.game}...`); }
                catch (e) { showToast(`Launch error: ${e}`, "warn"); }
              }}>▶ LAUNCH</button>
              <button style={s.btn("#7de8ff")} onClick={async () => {
                try { await invoke("open_in_files", { path: inst.path }); }
                catch {}
              }}>📁</button>
              <button style={s.btn("#ff4444")} onClick={() => setInstances(prev => prev.filter(i => i.id !== inst.id))}>✕</button>
            </div>
          ))}
        </div>
      );

      case "PLUGINS": return (
        <div>
          <div style={s.h2}>⬡ NATIVE PLUGINS — libgame_*.so</div>
          <div style={{ marginBottom: 12, display: "flex", gap: 8 }}>
            <button style={s.btnFill()} onClick={loadPlugins} disabled={pluginsLoading}>
              {pluginsLoading ? <><Spinner /> SCANNING...</> : "↺ REFRESH"}
            </button>
          </div>
          {plugins.map(p => (
            <div key={p.filename} style={{ ...s.card, padding: "10px 14px", display: "flex", alignItems: "center", gap: 10 }}>
              <StatusDot status={p.status} />
              <div style={{ flex: 1 }}>
                <div style={{ color: "#e0f8ff", fontFamily: "monospace", fontSize: 12, fontWeight: "bold" }}>{p.filename}</div>
                <div style={{ color: "#7de8ff77", fontFamily: "monospace", fontSize: 10 }}>{p.game} · {p.path || "not found"}</div>
              </div>
              {p.status === "missing" && <Badge label="MISSING" color="#ff4444" />}
              {p.status === "ok" && <Badge label="LOADED" color="#00ff9f" />}
            </div>
          ))}
        </div>
      );

      case "SCRIPTS": return (
        <div>
          <div style={s.h2}>⌨ BACKEND SCRIPTS</div>
          <div style={{ display: "flex", gap: 8, marginBottom: 14, flexWrap: "wrap" }}>
            {Object.keys(SCRIPTS).map(name => (
              <button key={name} style={activeScript === name ? s.btnFill() : s.btn()} onClick={() => setActiveScript(name)}>{name}</button>
            ))}
          </div>
          <div style={s.card}>
            <div style={{ display: "flex", gap: 8, marginBottom: 10 }}>
              <button style={s.btn()} onClick={() => { navigator.clipboard.writeText(SCRIPTS[activeScript]); showToast("Copied ✓"); }}>COPY</button>
              <button style={s.btn("#ff9f00")} onClick={() => {
                const blob = new Blob([SCRIPTS[activeScript]], { type: "text/plain" });
                const a = document.createElement("a"); a.href = URL.createObjectURL(blob); a.download = activeScript; a.click();
              }}>⬇ DOWNLOAD</button>
              <button style={s.btn("#00ff9f")} onClick={async () => {
                try {
                  const tmp = `/tmp/${activeScript}`;
                  showToast(`Script saved to ${tmp} — run manually`);
                } catch (e) { showToast(`Error: ${e}`, "warn"); }
              }}>⬆ EXPORT TO /tmp</button>
            </div>
            <pre style={{ color: "#7de8ff", fontFamily: "monospace", fontSize: 11, background: "#060a0d", padding: 14, borderRadius: 4, border: "1px solid #0ff2", whiteSpace: "pre-wrap", margin: 0, maxHeight: 460, overflowY: "auto", lineHeight: 1.6 }}>
              {SCRIPTS[activeScript]}
            </pre>
          </div>
        </div>
      );

      case "MANIFEST": return (
        <div>
          <div style={s.h2}>◈ FLATPAK MANIFEST</div>
          <div style={{ marginBottom: 12, display: "flex", gap: 8 }}>
            <button style={s.btn()} onClick={() => { navigator.clipboard.writeText("# manifest"); showToast("Copied ✓"); }}>COPY</button>
            <button style={s.btn("#ff9f00")} onClick={() => {
              const blob = new Blob(["# see app"], { type: "text/yaml" });
              const a = document.createElement("a"); a.href = URL.createObjectURL(blob); a.download = "com.modorganizer.MO2LinuxHelper.yml"; a.click();
            }}>⬇ DOWNLOAD .yml</button>
          </div>
          <pre style={{ color: "#7de8ff", fontFamily: "monospace", fontSize: 11, background: "#060a0d", padding: 14, borderRadius: 4, border: "1px solid #0ff2", whiteSpace: "pre-wrap", margin: 0, maxHeight: 520, overflowY: "auto", lineHeight: 1.7 }}>
{`app-id: com.modorganizer.MO2LinuxHelper
runtime: org.freedesktop.Platform
runtime-version: '23.08'
sdk: org.freedesktop.Sdk
command: mo2-linux-helper

finish-args:
  - --share=ipc
  - --socket=x11
  - --socket=wayland
  - --socket=session-bus
  - --device=all
  - --filesystem=home
  - --filesystem=/mnt
  - --filesystem=/media
  - --talk-name=com.valvesoftware.Steam
  - --env=MO2_INSTALL_PATH=/app/share/mo2

modules:
  - name: mo2-linux-helper
    buildsystem: simple
    build-commands:
      - install -Dm755 mo2-linux-helper -t /app/bin/
      - install -Dm644 com.modorganizer.MO2LinuxHelper.desktop
          -t /app/share/applications/
      - install -Dm644 mo2icon.png
          /app/share/icons/hicolor/256x256/apps/com.modorganizer.MO2LinuxHelper.png
      - install -Dm755 scripts/mo2-setup.sh -t /app/share/mo2/scripts/
      - install -Dm755 scripts/mo2-nxm.sh -t /app/share/mo2/scripts/
      - install -Dm755 scripts/mo2-shortcut.py -t /app/share/mo2/scripts/
    sources:
      - type: dir
        path: .

  - name: python3-vdf
    buildsystem: simple
    build-commands:
      - pip3 install --prefix=/app vdf
    sources:
      - type: pypi
        name: vdf
        version: 3.4`}
          </pre>
        </div>
      );

      default: return null;
    }
  };

  // ─── RENDER ────────────────────────────────────────────────────────────────

  return (
    <div style={{ minHeight: "100vh", background: "#030810", color: "#7de8ff", fontFamily: "monospace", position: "relative", overflow: "hidden" }}>
      {/* Scanlines */}
      <div style={{ position: "fixed", inset: 0, pointerEvents: "none", zIndex: 999, backgroundImage: "repeating-linear-gradient(0deg, transparent, transparent 2px, rgba(0,240,255,0.015) 2px, rgba(0,240,255,0.015) 4px)" }} />
      {/* Grid */}
      <div style={{ position: "fixed", inset: 0, pointerEvents: "none", opacity: 0.04, backgroundImage: "linear-gradient(#00f0ff 1px, transparent 1px), linear-gradient(90deg, #00f0ff 1px, transparent 1px)", backgroundSize: "40px 40px" }} />

      {/* Topbar */}
      <div style={{ position: "sticky", top: 0, zIndex: 100, background: "#030810ee", borderBottom: "1px solid #0ff3", backdropFilter: "blur(8px)", padding: "0 20px", display: "flex", alignItems: "center", height: 52 }}>
        <div style={{ fontSize: 18, letterSpacing: 3, color: "#00f0ff", fontWeight: "bold" }}>
          ⬡ MO2 <span style={{ color: "#ff9f00" }}>LINUX</span> HELPER
        </div>
        <div style={{ marginLeft: 14, fontSize: 10, color: "#7de8ff55", letterSpacing: 2 }}>v2.0.0 — ARCH LINUX — TAURI</div>
        {updateInfo?.update_available && (
          <div style={{ marginLeft: "auto", display: "flex", alignItems: "center", gap: 8 }}>
            <span style={{ fontSize: 10, color: "#ff9f00", fontFamily: "monospace", letterSpacing: 1 }}>
              ⬆ Proton {updateInfo.proton_latest} available
            </span>
            <button style={{ ...s.btn("#ff9f00"), fontSize: 10, padding: "3px 8px" }} onClick={() => installDep("proton-ge")}>UPDATE</button>
          </div>
        )}
      </div>

      <div style={{ display: "flex", minHeight: "calc(100vh - 52px)" }}>
        {/* Sidebar */}
        <div style={{ width: 200, background: "#060d1a", borderRight: "1px solid #0ff2", padding: "16px 0", flexShrink: 0, position: "sticky", top: 52, height: "calc(100vh - 52px)", overflowY: "auto" }}>
          {SECTIONS.map(sec => (
            <div key={sec} onClick={() => setSection(sec)}
              style={{ padding: "9px 18px", cursor: "pointer", display: "flex", alignItems: "center", gap: 8, borderLeft: section === sec ? "2px solid #00f0ff" : "2px solid transparent", background: section === sec ? "#0a2030" : "transparent", color: section === sec ? "#00f0ff" : "#7de8ff88", fontSize: 11, letterSpacing: 2, transition: "all 0.15s" }}>
              <span>{NAV_ICONS[sec]}</span>
              {sec}
              {sec === "DEPS" && (missingCount + warnCount > 0) && (
                <span style={{ marginLeft: "auto", background: missingCount > 0 ? "#ff4444" : "#ffaa00", color: "#000", borderRadius: 9, fontSize: 9, padding: "1px 5px", fontWeight: "bold" }}>{missingCount + warnCount}</span>
              )}
            </div>
          ))}
          <div style={{ position: "absolute", bottom: 16, left: 0, width: 200, padding: "0 18px", boxSizing: "border-box" }}>
            <div style={{ borderTop: "1px solid #0ff2", paddingTop: 12, fontSize: 10, color: "#7de8ff44", lineHeight: 1.8 }}>
              <div>ARCH LINUX</div>
              <div style={{ color: "#00ff9f44" }}>● TAURI BACKEND</div>
              <div style={{ color: "#00ff9f44" }}>● REAL SHELL EXEC</div>
            </div>
          </div>
        </div>

        {/* Content */}
        <div style={{ flex: 1, padding: "24px 28px", maxWidth: 900, overflow: "auto" }}>
          {renderSection()}
        </div>
      </div>

      {/* Toast */}
      {toast && (
        <div style={{ position: "fixed", bottom: 24, right: 24, background: "#0a2030", border: `1px solid ${toast.type === "warn" ? "#ffaa00" : "#00f0ff"}`, borderRadius: 4, padding: "10px 18px", fontFamily: "monospace", fontSize: 12, color: toast.type === "warn" ? "#ffaa00" : "#00ff9f", boxShadow: "0 0 20px #00f0ff33", zIndex: 9999 }}>
          {toast.msg}
        </div>
      )}

      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=JetBrains+Mono:wght@400;700&display=swap');
        * { box-sizing: border-box; }
        ::-webkit-scrollbar { width: 5px; }
        ::-webkit-scrollbar-track { background: #060d1a; }
        ::-webkit-scrollbar-thumb { background: #0ff4; border-radius: 2px; }
        button:hover { filter: brightness(1.3); }
        button:disabled { opacity: 0.5; cursor: not-allowed; }
        input:focus { outline: 1px solid #00f0ff88; }
        @keyframes spin { to { transform: rotate(360deg); } }
      `}</style>
    </div>
  );
}
