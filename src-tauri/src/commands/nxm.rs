// src-tauri/src/commands/nxm.rs
use std::fs;
use std::process::Command;

#[tauri::command]
pub async fn register_nxm_handler(mo2_path: String, wineprefix: String) -> Result<bool, String> {
    register_nxm_internal(&mo2_path, &wineprefix).map(|_| true)
}

pub fn register_nxm_internal(mo2_path: &str, wineprefix: &str) -> Result<(), String> {
    let home = dirs::home_dir().ok_or("No home dir")?;
    let desktop_dir = home.join(".local/share/applications");
    fs::create_dir_all(&desktop_dir).map_err(|e| e.to_string())?;

    let desktop_content = format!(
        r#"[Desktop Entry]
Name=NXM Handler
Exec=env WINEPREFIX={wineprefix} wine "{mo2_path}/ModOrganizer.exe" "%u"
Type=Application
NoDisplay=true
MimeType=x-scheme-handler/nxm;x-scheme-handler/nxms
Categories=Game;
"#
    );

    let desktop_path = desktop_dir.join("nxm-handler.desktop");
    fs::write(&desktop_path, desktop_content).map_err(|e| e.to_string())?;

    // Make executable
    Command::new("chmod")
        .args(["+x", &desktop_path.to_string_lossy()])
        .status()
        .map_err(|e| e.to_string())?;

    // Register MIME types
    for scheme in &["x-scheme-handler/nxm", "x-scheme-handler/nxms"] {
        Command::new("xdg-mime")
            .args(["default", "nxm-handler.desktop", scheme])
            .status()
            .map_err(|e| e.to_string())?;
    }

    // Update desktop database
    Command::new("update-desktop-database")
        .arg(desktop_dir.to_string_lossy().as_ref())
        .status()
        .map_err(|e| e.to_string())?;

    Ok(())
}

#[tauri::command]
pub async fn unregister_nxm_handler() -> Result<bool, String> {
    let home = dirs::home_dir().ok_or("No home dir")?;
    let desktop_path = home.join(".local/share/applications/nxm-handler.desktop");

    if desktop_path.exists() {
        std::fs::remove_file(&desktop_path).map_err(|e| e.to_string())?;
        Command::new("update-desktop-database")
            .arg(home.join(".local/share/applications").to_string_lossy().as_ref())
            .status()
            .map_err(|e| e.to_string())?;
    }

    Ok(true)
}

#[tauri::command]
pub async fn check_nxm_registered() -> Result<bool, String> {
    let home = dirs::home_dir().ok_or("No home dir")?;
    let desktop_path = home.join(".local/share/applications/nxm-handler.desktop");
    Ok(desktop_path.exists())
}
