// src-tauri/src/updater.rs
// Real GitHub Releases API polling for MO2, Proton-GE, and the app itself

use serde::{Deserialize, Serialize};
use std::time::{SystemTime, UNIX_EPOCH};

// ─── TYPES ───────────────────────────────────────────────────────────────────

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct ReleaseAsset {
    pub name: String,
    pub browser_download_url: String,
    pub size: u64,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct GithubRelease {
    pub tag_name: String,
    pub name: String,
    pub body: String,
    pub html_url: String,
    pub published_at: String,
    pub assets: Vec<ReleaseAsset>,
    pub prerelease: bool,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct UpdateInfo {
    pub component: String,       // "app" | "proton-ge" | "mo2"
    pub current: String,
    pub latest: String,
    pub update_available: bool,
    pub release_url: String,
    pub release_notes: String,
    pub published_at: String,
    pub download_url: Option<String>,
    pub download_size_mb: Option<f64>,
    pub checked_at: u64,         // unix timestamp
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct AllUpdates {
    pub app: Option<UpdateInfo>,
    pub proton_ge: Option<UpdateInfo>,
    pub mo2: Option<UpdateInfo>,
    pub errors: Vec<String>,
}

// ─── VERSION COMPARISON ──────────────────────────────────────────────────────

/// Simple semver-ish comparison. Returns true if `latest` > `current`.
pub fn is_newer(current: &str, latest: &str) -> bool {
    let clean = |s: &str| s.trim_start_matches(['v', 'V']).to_string();
    let parse = |s: &str| -> Vec<u64> {
        clean(s).split('.').filter_map(|p| p.parse().ok()).collect()
    };
    let c = parse(current);
    let l = parse(latest);
    let max_len = c.len().max(l.len());
    for i in 0..max_len {
        let cv = c.get(i).copied().unwrap_or(0);
        let lv = l.get(i).copied().unwrap_or(0);
        if lv > cv { return true; }
        if lv < cv { return false; }
    }
    false
}

fn now_unix() -> u64 {
    SystemTime::now().duration_since(UNIX_EPOCH).unwrap_or_default().as_secs()
}

// ─── GITHUB API HELPERS ──────────────────────────────────────────────────────

/// Fetch latest release from GitHub API using ureq (sync, no async needed here)
/// We use tokio::task::spawn_blocking in the command handlers.
pub fn fetch_latest_release(owner: &str, repo: &str) -> Result<GithubRelease, String> {
    let url = format!("https://api.github.com/repos/{}/{}/releases/latest", owner, repo);

    // Use std::process::Command to call curl — avoids adding ureq/reqwest deps
    // This keeps the binary small and works everywhere curl is available (it is on Arch)
    let output = std::process::Command::new("curl")
        .args([
            "-s",
            "-H", "Accept: application/vnd.github+json",
            "-H", "X-GitHub-Api-Version: 2022-11-28",
            "--max-time", "10",
            "--user-agent", "mo2-linux-helper/2.0",
            &url,
        ])
        .output()
        .map_err(|e| format!("curl failed: {}", e))?;

    if !output.status.success() {
        return Err(format!("curl exited {}", output.status));
    }

    let body = String::from_utf8_lossy(&output.stdout);
    if body.contains("\"message\"") && body.contains("rate limit") {
        return Err("GitHub API rate limit exceeded. Try again in a minute.".to_string());
    }

    serde_json::from_str(&body).map_err(|e| format!("JSON parse error: {} — body: {}", e, &body[..body.len().min(200)]))
}

// ─── INDIVIDUAL UPDATE CHECKERS ──────────────────────────────────────────────

pub fn check_app_update(current_version: &str) -> Result<UpdateInfo, String> {
    let release = fetch_latest_release("yourusername", "mo2-linux-helper")?;
    let latest = release.tag_name.trim_start_matches('v').to_string();

    // Find the linux .AppImage asset
    let appimage = release.assets.iter().find(|a| a.name.ends_with(".AppImage"));

    Ok(UpdateInfo {
        component: "app".to_string(),
        current: current_version.to_string(),
        latest: latest.clone(),
        update_available: is_newer(current_version, &latest),
        release_url: release.html_url,
        release_notes: release.body.lines().take(8).collect::<Vec<_>>().join("\n"),
        published_at: release.published_at,
        download_url: appimage.map(|a| a.browser_download_url.clone()),
        download_size_mb: appimage.map(|a| a.size as f64 / 1_048_576.0),
        checked_at: now_unix(),
    })
}

pub fn check_proton_ge_update(current: &str) -> Result<UpdateInfo, String> {
    let release = fetch_latest_release("GloriousEggroll", "proton-ge-custom")?;
    let latest = release.tag_name.trim_start_matches('v').to_string();

    // Find the .tar.gz asset (the actual Proton build, not the sha512sum)
    let tarball = release.assets.iter().find(|a| a.name.ends_with(".tar.gz"));

    Ok(UpdateInfo {
        component: "proton-ge".to_string(),
        current: current.to_string(),
        latest: latest.clone(),
        update_available: latest != current,  // GE uses its own versioning
        release_url: release.html_url,
        release_notes: release.body.lines().take(10).collect::<Vec<_>>().join("\n"),
        published_at: release.published_at,
        download_url: tarball.map(|a| a.browser_download_url.clone()),
        download_size_mb: tarball.map(|a| a.size as f64 / 1_048_576.0),
        checked_at: now_unix(),
    })
}

pub fn check_mo2_update(current: &str) -> Result<UpdateInfo, String> {
    let release = fetch_latest_release("ModOrganizer2", "modorganizer")?;
    let latest = release.tag_name.trim_start_matches('v').to_string();

    let installer = release.assets.iter()
        .find(|a| a.name.starts_with("Mod.Organizer") && a.name.ends_with(".exe"));

    Ok(UpdateInfo {
        component: "mo2".to_string(),
        current: current.to_string(),
        latest: latest.clone(),
        update_available: is_newer(current, &latest),
        release_url: release.html_url,
        release_notes: release.body.lines().take(8).collect::<Vec<_>>().join("\n"),
        published_at: release.published_at,
        download_url: installer.map(|a| a.browser_download_url.clone()),
        download_size_mb: installer.map(|a| a.size as f64 / 1_048_576.0),
        checked_at: now_unix(),
    })
}

// ─── TAURI COMMANDS ──────────────────────────────────────────────────────────

/// Check all components for updates in parallel
#[tauri::command]
pub async fn check_for_updates(
    app_version: String,
    proton_version: String,
    mo2_version: String,
) -> AllUpdates {
    // Spawn all three checks concurrently
    let av = app_version.clone();
    let pv = proton_version.clone();
    let mv = mo2_version.clone();

    let (app_res, proton_res, mo2_res) = tokio::join!(
        tokio::task::spawn_blocking(move || check_app_update(&av)),
        tokio::task::spawn_blocking(move || check_proton_ge_update(&pv)),
        tokio::task::spawn_blocking(move || check_mo2_update(&mv)),
    );

    let mut errors = Vec::new();

    let app = match app_res {
        Ok(Ok(info)) => Some(info),
        Ok(Err(e))   => { errors.push(format!("App update check: {}", e)); None }
        Err(e)       => { errors.push(format!("App update task: {}", e)); None }
    };

    let proton_ge = match proton_res {
        Ok(Ok(info)) => Some(info),
        Ok(Err(e))   => { errors.push(format!("Proton-GE check: {}", e)); None }
        Err(e)       => { errors.push(format!("Proton-GE task: {}", e)); None }
    };

    let mo2 = match mo2_res {
        Ok(Ok(info)) => Some(info),
        Ok(Err(e))   => { errors.push(format!("MO2 check: {}", e)); None }
        Err(e)       => { errors.push(format!("MO2 task: {}", e)); None }
    };

    AllUpdates { app, proton_ge, mo2, errors }
}

/// Download Proton-GE and install it via protonup
#[tauri::command]
pub async fn install_proton_ge(tag: String) -> crate::CommandResult {
    tokio::task::spawn_blocking(move || {
        // Try protonup first
        if which::which("protonup").is_ok() {
            return crate::run_cmd("protonup", &["-i", &tag]);
        }
        // Fallback: download manually
        let home = dirs::home_dir().unwrap_or_default();
        let dest = home.join(".steam/root/compatibilitytools.d");
        let _ = std::fs::create_dir_all(&dest);
        let url = format!(
            "https://github.com/GloriousEggroll/proton-ge-custom/releases/download/{0}/{0}.tar.gz",
            tag
        );
        crate::run_cmd("bash", &["-c", &format!(
            "curl -L '{}' | tar -xz -C '{}'",
            url, dest.display()
        )])
    }).await.unwrap_or_else(|e| crate::CommandResult {
        success: false,
        stdout: String::new(),
        stderr: e.to_string(),
        exit_code: -1,
    })
}

/// Open a URL in the default browser (for release notes)
#[tauri::command]
pub async fn open_url(url: String) -> crate::CommandResult {
    crate::run_cmd("xdg-open", &[&url])
}

// ─── TESTS ───────────────────────────────────────────────────────────────────

#[cfg(test)]
mod tests {
    use super::*;

    #[test]
    fn test_version_comparison() {
        assert!(is_newer("2.0.0", "2.0.1"));
        assert!(is_newer("1.9.9", "2.0.0"));
        assert!(!is_newer("2.0.1", "2.0.0"));
        assert!(!is_newer("2.0.0", "2.0.0"));
        assert!(is_newer("GE-Proton9-27", "GE-Proton9-28"));
    }
}
