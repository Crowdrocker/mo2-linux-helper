// src-tauri/src/main.rs
// MO2 Linux Helper — Tauri Rust backend
// Prevents a console window on Windows (not needed on Linux, but keeps things clean)
#![cfg_attr(not(debug_assertions), windows_subsystem = "windows")]

mod commands;
mod utils;

use commands::{deps, nxm, setup, shortcuts, system, update};

fn main() {
    env_logger::init();

    tauri::Builder::default()
        .invoke_handler(tauri::generate_handler![
            // System detection
            system::detect_system,
            system::find_steam,
            system::find_proton_versions,
            system::find_mo2,
            // Setup
            setup::run_full_setup,
            setup::install_mo2,
            setup::dry_run,
            // Dependencies
            deps::list_deps,
            deps::install_dep,
            deps::install_all_deps,
            deps::check_dep_status,
            // NXM handler
            nxm::register_nxm_handler,
            nxm::unregister_nxm_handler,
            nxm::check_nxm_registered,
            // Steam shortcut
            shortcuts::add_steam_shortcut,
            shortcuts::remove_steam_shortcut,
            shortcuts::find_shortcuts_vdf,
            // Update checker
            update::check_for_updates,
            update::get_latest_mo2_version,
            update::get_latest_proton_ge,
        ])
        .run(tauri::generate_context!())
        .expect("error while running tauri application");
}
