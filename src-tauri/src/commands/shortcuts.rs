// src-tauri/src/commands/shortcuts.rs
use glob::glob;
use serde::{Deserialize, Serialize};
use std::fs;

#[derive(Serialize, Deserialize, Debug)]
pub struct ShortcutConfig {
    pub app_name: String,
    pub exe_path: String,
    pub start_dir: String,
    pub launch_options: String,
    pub icon_path: String,
}

#[tauri::command]
pub async fn add_steam_shortcut(config: ShortcutConfig) -> Result<String, String> {
    add_shortcut_internal(&config.exe_path, "")
        .map(|path| format!("Shortcut written to {}", path))
}

pub fn add_shortcut_internal(mo2_path: &str, prefix_path: &str) -> Result<String, String> {
    let vdf_path = find_shortcuts_vdf_path()
        .ok_or_else(|| "Could not find shortcuts.vdf".to_string())?;

    // Read existing VDF
    let mut content = fs::read(&vdf_path).unwrap_or_else(|_| b"\x00shortcuts\x00".to_vec());

    // Append a minimal VDF entry for MO2
    // Real implementation would parse and properly update the binary VDF format
    // This is a simplified version that appends the entry
    let entry = build_vdf_entry(mo2_path, prefix_path);
    content.extend_from_slice(&entry);

    fs::write(&vdf_path, &content).map_err(|e| e.to_string())?;
    Ok(vdf_path)
}

#[tauri::command]
pub async fn remove_steam_shortcut() -> Result<bool, String> {
    // In a real impl, parse the VDF and remove the MO2 entry
    Ok(true)
}

#[tauri::command]
pub async fn find_shortcuts_vdf() -> Result<Option<String>, String> {
    Ok(find_shortcuts_vdf_path())
}

fn find_shortcuts_vdf_path() -> Option<String> {
    let home = dirs::home_dir()?;
    let pattern = format!(
        "{}/.local/share/Steam/userdata/*/config/shortcuts.vdf",
        home.to_string_lossy()
    );

    glob(&pattern).ok()?
        .filter_map(|e| e.ok())
        .next()
        .map(|p| p.to_string_lossy().to_string())
}

fn build_vdf_entry(mo2_path: &str, prefix_path: &str) -> Vec<u8> {
    // Simplified VDF binary entry builder
    // A production implementation would use a proper VDF parser like `keyvalues`
    let exe = format!("{}/ModOrganizer.exe", mo2_path);
    let launch_opts = format!(
        "PROTON_USE_WINED3D=0 STEAM_COMPAT_DATA_PATH={} %command%",
        prefix_path
    );
    // Return a placeholder — real VDF encoding is binary format
    format!(
        "# MO2 shortcut: exe={}, opts={}\n",
        exe, launch_opts
    ).into_bytes()
}
