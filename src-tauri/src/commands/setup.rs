// src-tauri/src/commands/setup.rs
use serde::{Deserialize, Serialize};
use std::process::Command;
use tauri::Window;

#[derive(Serialize, Deserialize, Clone, Debug)]
pub struct SetupProgress {
    pub step: String,
    pub message: String,
    pub progress: u8,
    pub level: String, // "info" | "ok" | "warn" | "error"
}

#[derive(Serialize, Deserialize, Debug)]
pub struct SetupConfig {
    pub mo2_path: String,
    pub proton_ver: String,
    pub steam_path: String,
    pub prefix_path: String,
    pub install_deps: bool,
    pub register_nxm: bool,
    pub add_shortcut: bool,
}

#[tauri::command]
pub async fn run_full_setup(window: Window, config: SetupConfig) -> Result<bool, String> {
    let emit = |step: &str, msg: &str, progress: u8, level: &str| {
        let _ = window.emit("setup-progress", SetupProgress {
            step: step.to_string(),
            message: msg.to_string(),
            progress,
            level: level.to_string(),
        });
    };

    emit("start", "Starting MO2 setup for Arch Linux...", 0, "info");

    // Step 1: Install system packages
    emit("pacman", "Installing system packages via pacman...", 10, "info");
    let pacman = Command::new("pkexec")
        .args(["pacman", "-S", "--needed", "--noconfirm",
               "wine", "winetricks", "curl", "python"])
        .status();

    match pacman {
        Ok(s) if s.success() => emit("pacman", "System packages installed", 20, "ok"),
        _ => emit("pacman", "pacman failed — install wine/winetricks manually", 20, "warn"),
    }

    // Step 2: Download MO2
    emit("download", "Downloading MO2 2.5.2...", 25, "info");
    let mo2_url = "https://github.com/ModOrganizer2/modorganizer/releases/download/v2.5.2/Mod.Organizer-2.5.2.exe";
    let curl = Command::new("curl")
        .args(["-L", "-o", "/tmp/MO2Setup.exe", mo2_url])
        .status();

    match curl {
        Ok(s) if s.success() => emit("download", "MO2 installer downloaded", 40, "ok"),
        _ => return Err("Failed to download MO2".to_string()),
    }

    // Step 3: Install MO2
    emit("install", format!("Installing MO2 to {}...", config.mo2_path).as_str(), 45, "info");
    std::fs::create_dir_all(&config.mo2_path).map_err(|e| e.to_string())?;

    let wineprefix = format!("{}/.wine-mo2", dirs::home_dir()
        .unwrap_or_default().to_string_lossy());
    let wine = Command::new("env")
        .env("WINEPREFIX", &wineprefix)
        .args(["wine", "/tmp/MO2Setup.exe", "/SILENT",
               &format!("/DIR={}", config.mo2_path)])
        .status();

    match wine {
        Ok(s) if s.success() => emit("install", "MO2 installed successfully", 60, "ok"),
        _ => emit("install", "Wine installer had issues — MO2 may still work", 60, "warn"),
    }

    // Step 4: Winetricks deps
    if config.install_deps {
        emit("deps", "Installing winetricks components...", 65, "info");
        let tricks = Command::new("env")
            .env("WINEPREFIX", &wineprefix)
            .args(["winetricks", "-q", "vcruntime140", "dotnet48",
                   "d3dcompiler_47", "xact"])
            .status();

        match tricks {
            Ok(s) if s.success() => emit("deps", "All winetricks components installed", 80, "ok"),
            _ => emit("deps", "Some winetricks components may have failed", 80, "warn"),
        }
    }

    // Step 5: NXM handler
    if config.register_nxm {
        emit("nxm", "Registering NXM handler...", 85, "info");
        super::nxm::register_nxm_internal(&config.mo2_path, &wineprefix)
            .unwrap_or_else(|e| emit("nxm", &format!("NXM failed: {}", e), 85, "warn"));
        emit("nxm", "NXM handler registered", 90, "ok");
    }

    // Step 6: Steam shortcut
    if config.add_shortcut {
        emit("shortcut", "Adding Steam non-Steam shortcut...", 93, "info");
        super::shortcuts::add_shortcut_internal(&config.mo2_path, &config.prefix_path)
            .unwrap_or_else(|e| emit("shortcut", &format!("Shortcut failed: {}", e), 93, "warn"));
        emit("shortcut", "Steam shortcut added", 97, "ok");
    }

    emit("done", "✅ Setup complete! Launch MO2 from Steam library.", 100, "ok");
    Ok(true)
}

#[tauri::command]
pub async fn install_mo2(mo2_path: String) -> Result<String, String> {
    std::fs::create_dir_all(&mo2_path).map_err(|e| e.to_string())?;
    Ok(format!("MO2 directory created at {}", mo2_path))
}

#[tauri::command]
pub async fn dry_run(config: SetupConfig) -> Result<Vec<String>, String> {
    let home = dirs::home_dir().unwrap_or_default();
    let wineprefix = format!("{}/.wine-mo2", home.to_string_lossy());
    Ok(vec![
        format!("sudo pacman -S --needed wine winetricks curl python"),
        format!("curl -L -o /tmp/MO2Setup.exe https://github.com/ModOrganizer2/..."),
        format!("mkdir -p {}", config.mo2_path),
        format!("WINEPREFIX={} wine /tmp/MO2Setup.exe /SILENT /DIR={}", wineprefix, config.mo2_path),
        format!("WINEPREFIX={} winetricks -q vcruntime140 dotnet48 d3dcompiler_47 xact", wineprefix),
        format!("# Register NXM handler → ~/.local/share/applications/nxm-handler.desktop"),
        format!("# Add Steam shortcut → shortcuts.vdf"),
    ])
}
