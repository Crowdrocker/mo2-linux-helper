// src-tauri/src/commands/system.rs
use serde::{Deserialize, Serialize};
use std::path::PathBuf;
use std::process::Command;

#[derive(Serialize, Deserialize, Debug)]
pub struct SystemInfo {
    pub os: String,
    pub kernel: String,
    pub steam_path: Option<String>,
    pub proton_versions: Vec<String>,
    pub mo2_path: Option<String>,
    pub wine_version: Option<String>,
    pub winetricks_available: bool,
    pub protontricks_available: bool,
}

#[tauri::command]
pub async fn detect_system() -> Result<SystemInfo, String> {
    let kernel = Command::new("uname")
        .arg("-r")
        .output()
        .map(|o| String::from_utf8_lossy(&o.stdout).trim().to_string())
        .unwrap_or_else(|_| "unknown".to_string());

    let steam_path = find_steam_path();
    let proton_versions = find_proton_versions_internal(&steam_path);
    let mo2_path = find_mo2_path();
    let wine_version = get_wine_version();
    let winetricks_available = Command::new("which").arg("winetricks").status()
        .map(|s| s.success()).unwrap_or(false);
    let protontricks_available = Command::new("which").arg("protontricks").status()
        .map(|s| s.success()).unwrap_or(false);

    Ok(SystemInfo {
        os: "Arch Linux".to_string(),
        kernel,
        steam_path: steam_path.map(|p| p.to_string_lossy().to_string()),
        proton_versions,
        mo2_path: mo2_path.map(|p| p.to_string_lossy().to_string()),
        wine_version,
        winetricks_available,
        protontricks_available,
    })
}

#[tauri::command]
pub async fn find_steam() -> Result<Option<String>, String> {
    Ok(find_steam_path().map(|p| p.to_string_lossy().to_string()))
}

#[tauri::command]
pub async fn find_proton_versions() -> Result<Vec<String>, String> {
    let steam = find_steam_path();
    Ok(find_proton_versions_internal(&steam))
}

#[tauri::command]
pub async fn find_mo2() -> Result<Option<String>, String> {
    Ok(find_mo2_path().map(|p| p.to_string_lossy().to_string()))
}

// ── Internal helpers ────────────────────────────────────────────────────────

fn find_steam_path() -> Option<PathBuf> {
    let home = dirs::home_dir()?;
    let candidates = [
        home.join(".local/share/Steam"),
        home.join(".steam/steam"),
        PathBuf::from("/usr/share/steam"),
    ];
    candidates.into_iter().find(|p| p.exists())
}

fn find_proton_versions_internal(steam: &Option<PathBuf>) -> Vec<String> {
    let steam = match steam { Some(s) => s, None => return vec![] };
    let compat_dir = steam.join("compatibilitytools.d");
    let steam_dir = steam.join("steamapps/common");

    let mut versions = vec![];

    for dir in [&compat_dir, &steam_dir] {
        if let Ok(entries) = std::fs::read_dir(dir) {
            for entry in entries.flatten() {
                let name = entry.file_name().to_string_lossy().to_string();
                if name.to_lowercase().contains("proton") {
                    versions.push(name);
                }
            }
        }
    }

    versions.sort_by(|a, b| b.cmp(a)); // newest first
    versions
}

fn find_mo2_path() -> Option<PathBuf> {
    let home = dirs::home_dir()?;
    let candidates = [
        home.join(".local/share/modorganizer2"),
        home.join("Games/MO2"),
        home.join(".wine/drive_c/MO2"),
    ];
    candidates.into_iter().find(|p| p.join("ModOrganizer.exe").exists())
}

fn get_wine_version() -> Option<String> {
    Command::new("wine")
        .arg("--version")
        .output()
        .ok()
        .map(|o| String::from_utf8_lossy(&o.stdout).trim().to_string())
}
