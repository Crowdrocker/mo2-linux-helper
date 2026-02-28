// src-tauri/src/commands/update.rs
use serde::{Deserialize, Serialize};

#[derive(Serialize, Deserialize, Debug)]
pub struct UpdateInfo {
    pub mo2_latest: String,
    pub proton_ge_latest: String,
    pub app_latest: String,
    pub mo2_update_available: bool,
    pub proton_update_available: bool,
    pub app_update_available: bool,
}

#[derive(Deserialize)]
struct GithubRelease {
    tag_name: String,
}

const CURRENT_MO2: &str = "2.5.2";
const CURRENT_APP: &str = env!("CARGO_PKG_VERSION");

#[tauri::command]
pub async fn check_for_updates() -> Result<UpdateInfo, String> {
    let mo2_ver = get_latest_mo2_version().await.unwrap_or_else(|_| CURRENT_MO2.to_string());
    let proton_ver = get_latest_proton_ge().await.unwrap_or_else(|_| "GE-Proton9-20".to_string());
    let app_ver = get_latest_app_version().await.unwrap_or_else(|_| CURRENT_APP.to_string());

    Ok(UpdateInfo {
        mo2_update_available: mo2_ver != CURRENT_MO2,
        proton_update_available: false, // compare with installed
        app_update_available: app_ver != CURRENT_APP,
        mo2_latest: mo2_ver,
        proton_ge_latest: proton_ver,
        app_latest: app_ver,
    })
}

#[tauri::command]
pub async fn get_latest_mo2_version() -> Result<String, String> {
    let client = reqwest::Client::new();
    let resp = client
        .get("https://api.github.com/repos/ModOrganizer2/modorganizer/releases/latest")
        .header("User-Agent", "mo2-linux-helper")
        .send()
        .await
        .map_err(|e| e.to_string())?
        .json::<GithubRelease>()
        .await
        .map_err(|e| e.to_string())?;

    // Strip "v" prefix if present
    Ok(resp.tag_name.trim_start_matches('v').to_string())
}

#[tauri::command]
pub async fn get_latest_proton_ge() -> Result<String, String> {
    let client = reqwest::Client::new();
    let resp = client
        .get("https://api.github.com/repos/GloriousEggroll/proton-ge-custom/releases/latest")
        .header("User-Agent", "mo2-linux-helper")
        .send()
        .await
        .map_err(|e| e.to_string())?
        .json::<GithubRelease>()
        .await
        .map_err(|e| e.to_string())?;

    Ok(resp.tag_name)
}

async fn get_latest_app_version() -> Result<String, String> {
    let client = reqwest::Client::new();
    let resp = client
        .get("https://api.github.com/repos/Crowdrocker/mo2-linux-helper/releases/latest")
        .header("User-Agent", "mo2-linux-helper")
        .send()
        .await
        .map_err(|e| e.to_string())?
        .json::<GithubRelease>()
        .await
        .map_err(|e| e.to_string())?;

    Ok(resp.tag_name.trim_start_matches('v').to_string())
}
