// src-tauri/src/commands/deps.rs
use serde::{Deserialize, Serialize};
use std::process::Command;

#[derive(Serialize, Deserialize, Debug, Clone)]
pub struct DepStatus {
    pub name: String,
    pub status: String, // "ok" | "missing" | "warn"
}

#[tauri::command]
pub async fn list_deps() -> Result<Vec<DepStatus>, String> {
    let components = vec![
        "vcruntime140", "dotnet48", "d3dcompiler_47",
        "d3dx9", "xact", "win10", "physx", "mfc140",
    ];
    let home = dirs::home_dir().unwrap_or_default();
    let wineprefix = format!("{}/.wine-mo2", home.to_string_lossy());

    let mut results = vec![];
    for comp in components {
        // Basic check: see if the DLL file exists in the wine prefix
        let dll_path = format!("{}/drive_c/windows/system32/{}.dll", wineprefix, comp);
        let status = if std::path::Path::new(&dll_path).exists() {
            "ok"
        } else {
            "missing"
        };
        results.push(DepStatus {
            name: comp.to_string(),
            status: status.to_string(),
        });
    }
    Ok(results)
}

#[tauri::command]
pub async fn install_dep(name: String) -> Result<bool, String> {
    let home = dirs::home_dir().unwrap_or_default();
    let wineprefix = format!("{}/.wine-mo2", home.to_string_lossy());

    let status = Command::new("env")
        .env("WINEPREFIX", &wineprefix)
        .args(["winetricks", "-q", &name])
        .status()
        .map_err(|e| e.to_string())?;

    Ok(status.success())
}

#[tauri::command]
pub async fn install_all_deps() -> Result<bool, String> {
    let home = dirs::home_dir().unwrap_or_default();
    let wineprefix = format!("{}/.wine-mo2", home.to_string_lossy());

    let status = Command::new("env")
        .env("WINEPREFIX", &wineprefix)
        .args(["winetricks", "-q",
               "vcruntime140", "dotnet48", "d3dcompiler_47", "xact", "mfc140"])
        .status()
        .map_err(|e| e.to_string())?;

    Ok(status.success())
}

#[tauri::command]
pub async fn check_dep_status(name: String) -> Result<String, String> {
    let home = dirs::home_dir().unwrap_or_default();
    let wineprefix = format!("{}/.wine-mo2", home.to_string_lossy());
    let dll_path = format!("{}/drive_c/windows/system32/{}.dll", wineprefix, name);

    if std::path::Path::new(&dll_path).exists() {
        Ok("ok".to_string())
    } else {
        Ok("missing".to_string())
    }
}
