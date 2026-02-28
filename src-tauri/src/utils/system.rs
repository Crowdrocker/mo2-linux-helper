// src-tauri/src/utils/system.rs
// Shared system utility functions used across commands

use std::path::PathBuf;
use std::process::Command;

/// Returns the home directory or panics with a clear message
pub fn home() -> PathBuf {
    dirs::home_dir().expect("Could not determine home directory")
}

/// Returns the default Wine prefix path for MO2
pub fn default_wineprefix() -> PathBuf {
    home().join(".wine-mo2")
}

/// Returns the default MO2 install path
pub fn default_mo2_path() -> PathBuf {
    home().join(".local/share/modorganizer2")
}

/// Returns the default Steam path
pub fn default_steam_path() -> PathBuf {
    home().join(".local/share/Steam")
}

/// Check if a command is available on PATH
pub fn command_exists(cmd: &str) -> bool {
    Command::new("which")
        .arg(cmd)
        .output()
        .map(|o| o.status.success())
        .unwrap_or(false)
}

/// Expand a ~ path to an absolute path
pub fn expand_tilde(path: &str) -> String {
    if path.starts_with("~/") {
        format!("{}/{}", home().to_string_lossy(), &path[2..])
    } else if path == "~" {
        home().to_string_lossy().to_string()
    } else {
        path.to_string()
    }
}
