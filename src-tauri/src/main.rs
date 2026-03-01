// MO2 Linux Helper — Tauri Backend
// Real shell execution, dependency detection, NXM registration, shortcut writing

#![cfg_attr(not(debug_assertions), windows_subsystem = "windows")]

mod updater;
pub use updater::{check_for_updates, install_proton_ge, open_url};

use std::collections::HashMap;
use std::fs;
use std::path::{Path, PathBuf};
use std::process::Command;

use anyhow::Result;
use dirs::home_dir;
use serde::{Deserialize, Serialize};
use tauri::{AppHandle, Manager};

// ─── DATA TYPES ──────────────────────────────────────────────────────────────

#[derive(Serialize, Deserialize, Debug, Clone)]
pub struct DepCheckResult {
    pub id: String,
    pub name: String,
    pub status: String, // "ok" | "warn" | "missing"
    pub version: Option<String>,
    pub path: Option<String>,
}

#[derive(Serialize, Deserialize, Debug, Clone)]
pub struct CommandResult {
    pub success: bool,
    pub stdout: String,
    pub stderr: String,
    pub exit_code: i32,
}

#[derive(Serialize, Deserialize, Debug, Clone)]
pub struct PortableInstance {
    pub id: String,
    pub path: String,
    pub game: String,
    pub profile: String,
    pub ini_path: String,
}

#[derive(Serialize, Deserialize, Debug, Clone)]
pub struct NativePlugin {
    pub filename: String,
    pub game: String,
    pub status: String,
    pub path: Option<String>,
}

#[derive(Serialize, Deserialize, Debug)]
pub struct ShortcutConfig {
    pub mo2_path: String,
    pub proton_version: String,
    pub launch_options: String,
    pub app_name: String,
}

#[derive(Serialize, Deserialize, Debug)]
pub struct SetupConfig {
    pub mo2_path: String,
    pub steam_app_id: Option<String>,
    pub proton_version: String,
    pub dry_run: bool,
}

// ─── HELPERS ─────────────────────────────────────────────────────────────────

fn run_cmd(cmd: &str, args: &[&str]) -> CommandResult {
    match Command::new(cmd).args(args).output() {
        Ok(out) => CommandResult {
            success: out.status.success(),
            stdout: String::from_utf8_lossy(&out.stdout).into(),
            stderr: String::from_utf8_lossy(&out.stderr).into(),
            exit_code: out.status.code().unwrap_or(-1),
        },
        Err(e) => CommandResult {
            success: false,
            stdout: String::new(),
            stderr: format!("Failed to run '{}': {}", cmd, e),
            exit_code: -1,
        },
    }
}

fn which(cmd: &str) -> Option<PathBuf> {
    which::which(cmd).ok()
}

fn get_version(cmd: &str, args: &[&str]) -> Option<String> {
    Command::new(cmd)
        .args(args)
        .output()
        .ok()
        .map(|out| String::from_utf8_lossy(&out.stdout).lines().next().unwrap_or("").trim().to_string())
        .filter(|s| !s.is_empty())
}

// ─── TAURI COMMANDS ──────────────────────────────────────────────────────────

/// Check all dependencies and return their real status
#[tauri::command]
async fn check_dependencies() -> Vec<DepCheckResult> {
    let checks: Vec<(&str, &str, &str, &[&str])> = vec![
        ("proton-ge",     "Proton-GE",        "protonup",      &["-l"]),
        ("protontricks",  "protontricks",      "protontricks",  &["--version"]),
        ("winetricks",    "winetricks",        "winetricks",    &["--version"]),
        ("wine",          "wine",              "wine",          &["--version"]),
        ("wine-mono",     "wine-mono",         "wine",          &["--version"]),
        ("dotnet",        ".NET 6 Runtime",    "dotnet",        &["--version"]),
        ("dxvk",          "DXVK",              "bash",          &["-c", "pacman -Qi dxvk 2>/dev/null | grep Version"]),
        ("vkd3d",         "vkd3d-proton",      "bash",          &["-c", "pacman -Qi vkd3d-proton-mingw 2>/dev/null | grep Version"]),
        ("steam",         "Steam",             "steam",         &["-version"]),
        ("flatpak",       "Flatpak",           "flatpak",       &["--version"]),
    ];

    checks.into_iter().map(|(id, name, cmd, args)| {
        let found = which(cmd).is_some();
        let version = if found { get_version(cmd, args) } else { None };

        // Special case: check if proton-ge has any GE builds installed
        let (status, ver) = if id == "proton-ge" {
            let ge_path = home_dir()
                .map(|h| h.join(".steam/root/compatibilitytools.d"))
                .filter(|p| p.exists());
            match ge_path {
                Some(p) => {
                    let ge_builds: Vec<String> = fs::read_dir(&p)
                        .ok()
                        .map(|entries| entries
                            .filter_map(|e| e.ok())
                            .filter(|e| e.file_name().to_string_lossy().starts_with("GE-Proton"))
                            .map(|e| e.file_name().to_string_lossy().to_string())
                            .collect())
                        .unwrap_or_default();
                    if ge_builds.is_empty() {
                        ("missing".to_string(), None)
                    } else {
                        ("ok".to_string(), Some(ge_builds.into_iter().last().unwrap_or_default()))
                    }
                }
                None => ("missing".to_string(), None),
            }
        } else if found {
            ("ok".to_string(), version)
        } else {
            ("missing".to_string(), None)
        };

        DepCheckResult {
            id: id.to_string(),
            name: name.to_string(),
            status,
            version: ver,
            path: which(cmd).map(|p| p.to_string_lossy().to_string()),
        }
    }).collect()
}

/// Install a single dependency via pacman / pipx / protonup
#[tauri::command]
async fn install_dependency(dep_id: String) -> CommandResult {
    let install_cmds: HashMap<&str, Vec<&str>> = HashMap::from([
        ("proton-ge",    vec!["bash", "-c", "protonup -i GE-Proton9-27"]),
        ("protontricks", vec!["bash", "-c", "pipx install protontricks || pip install protontricks"]),
        ("winetricks",   vec!["bash", "-c", "sudo pacman -S --noconfirm winetricks"]),
        ("wine",         vec!["bash", "-c", "sudo pacman -S --noconfirm wine"]),
        ("wine-mono",    vec!["bash", "-c", "sudo pacman -S --noconfirm wine-mono"]),
        ("dotnet",       vec!["bash", "-c", "sudo pacman -S --noconfirm dotnet-runtime-6.0"]),
        ("dxvk",         vec!["bash", "-c", "sudo pacman -S --noconfirm dxvk-bin"]),
        ("vkd3d",        vec!["bash", "-c", "sudo pacman -S --noconfirm vkd3d-proton-mingw"]),
        ("steam",        vec!["bash", "-c", "flatpak install -y flathub com.valvesoftware.Steam"]),
        ("flatpak",      vec!["bash", "-c", "sudo pacman -S --noconfirm flatpak"]),
    ]);

    match install_cmds.get(dep_id.as_str()) {
        Some(cmd) => run_cmd(cmd[0], &cmd[1..]),
        None => CommandResult {
            success: false,
            stdout: String::new(),
            stderr: format!("Unknown dependency: {}", dep_id),
            exit_code: 1,
        },
    }
}

/// Run the full setup wizard
#[tauri::command]
async fn run_setup(config: SetupConfig) -> Vec<String> {
    let mut log = Vec::new();

    log.push(format!("[MO2] Starting setup (dry_run={})", config.dry_run));
    log.push(format!("[MO2] Install path: {}", config.mo2_path));

    let mo2_path = Path::new(&config.mo2_path);

    // Step 1: Create directory
    if !config.dry_run {
        match fs::create_dir_all(mo2_path) {
            Ok(_) => log.push(format!("✓ Created directory: {}", config.mo2_path)),
            Err(e) => log.push(format!("[ERR] Failed to create dir: {}", e)),
        }
    } else {
        log.push(format!("[DRY] Would create: {}", config.mo2_path));
    }

    // Step 2: Check Proton-GE
    let ge_path = home_dir()
        .map(|h| h.join(".steam/root/compatibilitytools.d"))
        .unwrap_or_default();
    if ge_path.exists() {
        log.push(format!("✓ Proton-GE directory found: {}", ge_path.display()));
    } else {
        log.push("[WARN] Proton-GE directory not found. Install protonup first.".to_string());
    }

    // Step 3: Wine prefix via protontricks
    if let Some(app_id) = &config.steam_app_id {
        if !app_id.is_empty() {
            log.push(format!("[MO2] Configuring Wine prefix for AppID: {}", app_id));
            if !config.dry_run {
                let result = run_cmd("protontricks", &[app_id, "vcrun2022", "dotnet6", "d3dcompiler_47"]);
                if result.success {
                    log.push("✓ Wine prefix configured via protontricks".to_string());
                } else {
                    log.push(format!("[WARN] protontricks returned error: {}", result.stderr));
                }
            } else {
                log.push(format!("[DRY] Would run: protontricks {} vcrun2022 dotnet6 d3dcompiler_47", app_id));
            }
        }
    }

    // Step 4: Write config
    let config_dir = home_dir()
        .map(|h| h.join(".config/mo2-linux-helper"))
        .unwrap_or_default();
    if !config.dry_run {
        let _ = fs::create_dir_all(&config_dir);
        let config_json = serde_json::json!({
            "mo2Path": config.mo2_path,
            "protonVersion": config.proton_version,
            "steamAppId": config.steam_app_id,
        });
        match fs::write(config_dir.join("config.json"), config_json.to_string()) {
            Ok(_) => log.push("✓ Config written to ~/.config/mo2-linux-helper/config.json".to_string()),
            Err(e) => log.push(format!("[ERR] Config write failed: {}", e)),
        }
    } else {
        log.push("[DRY] Would write config to ~/.config/mo2-linux-helper/config.json".to_string());
    }

    log.push(if config.dry_run {
        "[DRY RUN] No changes made. Remove --dry-run to apply.".to_string()
    } else {
        "✓ Setup complete!".to_string()
    });

    log
}

/// Register or unregister the nxm:// protocol handler
#[tauri::command]
async fn set_nxm_handler(register: bool, mo2_path: String) -> CommandResult {
    let desktop_dir = home_dir()
        .map(|h| h.join(".local/share/applications"))
        .unwrap_or_else(|| PathBuf::from("/tmp"));

    let desktop_file = desktop_dir.join("nxm-handler.desktop");

    if !register {
        match fs::remove_file(&desktop_file) {
            Ok(_) => {
                let _ = run_cmd("update-desktop-database", &[&desktop_dir.to_string_lossy()]);
                return CommandResult { success: true, stdout: "NXM handler removed".into(), stderr: String::new(), exit_code: 0 };
            }
            Err(e) => return CommandResult { success: false, stdout: String::new(), stderr: e.to_string(), exit_code: 1 },
        }
    }

    let _ = fs::create_dir_all(&desktop_dir);

    let content = format!(
        "[Desktop Entry]\nVersion=1.0\nName=NXM Link Handler (MO2)\nComment=Handle NexusMods nxm:// links for Mod Organizer 2\nExec={}/nxmhandler.exe %u\nType=Application\nMimeType=x-scheme-handler/nxm;x-scheme-handler/nxm-protocol\nNoDisplay=true\nCategories=Game;\n",
        mo2_path
    );

    match fs::write(&desktop_file, &content) {
        Err(e) => return CommandResult { success: false, stdout: String::new(), stderr: e.to_string(), exit_code: 1 },
        Ok(_) => {}
    }

    let _ = run_cmd("xdg-mime", &["default", "nxm-handler.desktop", "x-scheme-handler/nxm"]);
    let _ = run_cmd("xdg-mime", &["default", "nxm-handler.desktop", "x-scheme-handler/nxm-protocol"]);
    let r = run_cmd("update-desktop-database", &[&desktop_dir.to_string_lossy()]);

    CommandResult {
        success: true,
        stdout: format!("NXM handler registered at {}", desktop_file.display()),
        stderr: r.stderr,
        exit_code: 0,
    }
}

/// Apply game fix via protontricks
#[tauri::command]
async fn apply_game_fix(game_id: String, steam_app_id: String, enable: bool) -> CommandResult {
    if !enable {
        return CommandResult { success: true, stdout: format!("Fix disabled for {}", game_id), stderr: String::new(), exit_code: 0 };
    }

    let fixes: HashMap<&str, Vec<&str>> = HashMap::from([
        ("cyberpunk",  vec!["dxvk", "vkd3d"]),
        ("fallout4",   vec!["vcrun2022", "d3dcompiler_47"]),
        ("skyrimse",   vec!["vcrun2022", "d3dcompiler_47"]),
        ("bg3",        vec!["vcrun2022"]),
        ("xedit",      vec!["mono", "dotnet48"]),
        ("synthesis",  vec!["dotnet6"]),
        ("bodyslide",  vec!["vcrun2019", "wine32"]),
        ("newvegas",   vec!["nvse", "vcrun2010"]),
        ("starfield",  vec!["vcrun2022", "dotnet6"]),
        ("witcher3",   vec!["vcrun2019"]),
    ]);

    match fixes.get(game_id.as_str()) {
        Some(args) => {
            let mut all_args = vec![steam_app_id.as_str()];
            all_args.extend(args.iter().copied());
            run_cmd("protontricks", &all_args)
        }
        None => CommandResult {
            success: false,
            stdout: String::new(),
            stderr: format!("No fix defined for game: {}", game_id),
            exit_code: 1,
        },
    }
}

/// Write Non-Steam shortcut to Steam's shortcuts.vdf
#[tauri::command]
async fn write_steam_shortcut(cfg: ShortcutConfig) -> CommandResult {
    // Use the Python script for VDF manipulation
    let script = format!(r#"
import sys, os, shutil
try:
    import vdf
except ImportError:
    print("vdf module not found. Install with: pip install vdf", file=sys.stderr)
    sys.exit(1)

import struct, hashlib, time
from pathlib import Path

steam_root = Path.home() / ".local/share/Steam"
userdata = steam_root / "userdata"
users = sorted([d for d in userdata.iterdir() if d.is_dir() and d.name.isdigit()], key=lambda p: p.stat().st_mtime)
if not users:
    print("No Steam users found", file=sys.stderr)
    sys.exit(1)

user = users[-1]
shortcuts_path = user / "config" / "shortcuts.vdf"
backup = shortcuts_path.with_suffix(".vdf.bak")

if shortcuts_path.exists():
    shutil.copy2(shortcuts_path, backup)
    data = vdf.binary_loads(shortcuts_path.read_bytes())
else:
    data = {{"shortcuts": {{}}}}

idx = str(len(data["shortcuts"]))
data["shortcuts"][idx] = {{
    "appname":          "{}",
    "exe":              '"{}"',
    "StartDir":         "{}",
    "LaunchOptions":    "{}",
    "icon":             "{}/mo2icon.png",
    "IsHidden":         0,
    "AllowDesktopConfig": 1,
    "AllowOverlay":     1,
    "OpenVR":           0,
    "LastPlayTime":     int(time.time()),
    "tags":             {{"0": "MO2", "1": "Modding"}},
}}

shortcuts_path.write_bytes(vdf.binary_dumps(data))
print(f"✓ Shortcut written to {{shortcuts_path}}")
print(f"  Backup: {{backup}}")
print("Restart Steam to see the shortcut.")
"#,
        cfg.app_name,
        cfg.mo2_path + "/ModOrganizer.exe",
        cfg.mo2_path,
        cfg.launch_options,
        cfg.mo2_path,
    );

    let tmp = "/tmp/mo2_write_shortcut.py";
    match fs::write(tmp, &script) {
        Err(e) => return CommandResult { success: false, stdout: String::new(), stderr: e.to_string(), exit_code: 1 },
        Ok(_) => {}
    }

    run_cmd("python3", &[tmp])
}

/// Apply flatpak permission overrides
#[tauri::command]
async fn apply_flatpak_overrides(permissions: Vec<String>) -> CommandResult {
    if which("flatpak").is_none() {
        return CommandResult { success: false, stdout: String::new(), stderr: "flatpak not found".into(), exit_code: 1 };
    }

    let app_id = "com.modorganizer.MO2LinuxHelper";
    let _ = run_cmd("flatpak", &["override", "--user", "--reset", app_id]);

    let mut errors = Vec::new();
    for perm in &permissions {
        let result = run_cmd("flatpak", &["override", "--user", perm, app_id]);
        if !result.success {
            errors.push(result.stderr);
        }
    }

    if errors.is_empty() {
        CommandResult { success: true, stdout: format!("Applied {} permission(s) to {}", permissions.len(), app_id), stderr: String::new(), exit_code: 0 }
    } else {
        CommandResult { success: false, stdout: String::new(), stderr: errors.join("\n"), exit_code: 1 }
    }
}

/// Scan filesystem for portable MO2 instances (ModOrganizer.ini)
#[tauri::command]
async fn scan_portable_instances() -> Vec<PortableInstance> {
    let search_dirs = [
        home_dir().map(|h| h.join("Games")),
        Some(PathBuf::from("/mnt")),
        Some(PathBuf::from("/media")),
        home_dir().map(|h| h.join(".local/share")),
    ];

    let mut instances = Vec::new();

    for dir in search_dirs.iter().flatten() {
        if !dir.exists() { continue; }
        scan_dir_for_instances(dir, &mut instances, 0);
    }

    instances
}

fn scan_dir_for_instances(dir: &Path, instances: &mut Vec<PortableInstance>, depth: usize) {
    if depth > 4 { return; }
    let Ok(entries) = fs::read_dir(dir) else { return };

    for entry in entries.flatten() {
        let path = entry.path();
        if path.is_dir() {
            let ini = path.join("ModOrganizer.ini");
            if ini.exists() {
                let game = parse_game_from_ini(&ini).unwrap_or_else(|| "Unknown".to_string());
                instances.push(PortableInstance {
                    id: path.to_string_lossy().to_string(),
                    path: path.to_string_lossy().to_string(),
                    game,
                    profile: "Default".to_string(),
                    ini_path: ini.to_string_lossy().to_string(),
                });
            } else {
                scan_dir_for_instances(&path, instances, depth + 1);
            }
        }
    }
}

fn parse_game_from_ini(ini_path: &Path) -> Option<String> {
    let content = fs::read_to_string(ini_path).ok()?;
    for line in content.lines() {
        if line.starts_with("gameName=") {
            return Some(line["gameName=".len()..].trim().to_string());
        }
    }
    None
}

/// Scan for libgame_*.so native plugins
#[tauri::command]
async fn scan_native_plugins(mo2_path: String) -> Vec<NativePlugin> {
    let plugins_dir = Path::new(&mo2_path).join("plugins");
    let mut plugins = Vec::new();

    let expected = vec![
        ("libgame_fallout4.so", "Fallout 4"),
        ("libgame_skyrimse.so", "Skyrim SE"),
        ("libgame_cyberpunk.so", "Cyberpunk 2077"),
        ("libgame_fallout3.so", "Fallout 3"),
        ("libgame_newvegas.so", "Fallout New Vegas"),
        ("libgame_starfield.so", "Starfield"),
        ("libgame_bg3.so", "Baldur's Gate 3"),
        ("libgame_witcher3.so", "The Witcher 3"),
        ("libgame_oblivion.so", "Oblivion"),
        ("libgame_morrowind.so", "Morrowind"),
    ];

    for (filename, game) in expected {
        let full_path = plugins_dir.join(filename);
        let (status, path) = if full_path.exists() {
            ("ok".to_string(), Some(full_path.to_string_lossy().to_string()))
        } else {
            ("missing".to_string(), None)
        };

        plugins.push(NativePlugin { filename: filename.to_string(), game: game.to_string(), status, path });
    }

    plugins
}

// check_for_updates, install_proton_ge, open_url live in updater.rs

/// Open file/directory in system file manager
#[tauri::command]
async fn open_in_files(path: String) -> CommandResult {
    run_cmd("xdg-open", &[&path])
}

/// Launch an MO2 instance
#[tauri::command]
async fn launch_mo2_instance(path: String, proton_version: String) -> CommandResult {
    let exe = format!("{}/ModOrganizer.exe", path);
    let compat = format!("{}/.steam/root/compatibilitytools.d/{}", 
        home_dir().map(|h| h.to_string_lossy().to_string()).unwrap_or_default(),
        proton_version);

    run_cmd("bash", &["-c", &format!(
        "STEAM_COMPAT_DATA_PATH={} STEAM_COMPAT_CLIENT_INSTALL_PATH=$HOME/.steam/steam {} &",
        compat, exe
    )])
}

// ─── MAIN ────────────────────────────────────────────────────────────────────

fn main() {
    env_logger::init();

    tauri::Builder::default()
        .plugin(tauri_plugin_shell::init())
        .plugin(tauri_plugin_dialog::init())
        .plugin(tauri_plugin_fs::init())
        .plugin(tauri_plugin_notification::init())
        .invoke_handler(tauri::generate_handler![
            check_dependencies,
            install_dependency,
            run_setup,
            set_nxm_handler,
            apply_game_fix,
            write_steam_shortcut,
            apply_flatpak_overrides,
            scan_portable_instances,
            scan_native_plugins,
            check_for_updates,
            install_proton_ge,
            open_url,
            open_in_files,
            launch_mo2_instance,
        ])
        .run(tauri::generate_context!())
        .expect("error while running tauri application");
}
