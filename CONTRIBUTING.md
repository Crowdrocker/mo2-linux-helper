# Contributing to MO2 Linux Helper

Thanks for wanting to contribute! Here's how to get started.

## Development Setup

```bash
git clone https://github.com/Crowdrocker/mo2-linux-helper.git
cd mo2-linux-helper
npm install
npm run tauri dev   # starts hot-reload dev server
```

## Project Structure

```
mo2-linux-helper/
├── src/                    # React frontend
│   ├── App.jsx             # Main app component
│   ├── pages/              # Page components
│   │   ├── Setup.jsx
│   │   ├── Dependencies.jsx
│   │   ├── Games.jsx
│   │   ├── NXM.jsx
│   │   ├── Shortcut.jsx
│   │   ├── Flatpak.jsx
│   │   ├── Backend.jsx
│   │   ├── Portable.jsx
│   │   └── Plugins.jsx
│   ├── data/               # Game/dep definitions
│   │   ├── games.js
│   │   └── deps.js
│   └── hooks/              # Shared hooks
│       └── usePersist.js
├── src-tauri/              # Rust backend
│   ├── src/
│   │   ├── main.rs
│   │   ├── commands/       # Tauri IPC commands
│   │   │   ├── setup.rs
│   │   │   ├── deps.rs
│   │   │   ├── nxm.rs
│   │   │   └── shortcuts.rs
│   │   └── utils/
│   │       └── system.rs
│   └── tauri.conf.json
├── scripts/                # Shell/Python helper scripts
│   ├── mo2-setup.sh
│   ├── mo2-nxm.sh
│   ├── mo2-shortcut.py
│   └── mo2-flatpak-setup.sh
└── aur/                    # AUR package files
    └── PKGBUILD
```

## Adding a New Game Profile

Edit `src/data/games.js` and add an entry:

```js
{
  id: "yourgame",
  icon: "🎮",
  name: "Your Game",
  cat: "RPG",   // RPG | Action | Tool
  fixes: [
    "Fix description 1",
    "Fix description 2",
  ],
  deps: ["vcruntime140"],  // winetricks components needed
  envVars: {
    PROTON_NO_D3D12: "1",  // optional Proton env vars
  }
}
```

Then add the corresponding native plugin entry in `src/data/plugins.js`:

```js
{ name: "libgame_yourgame.so", ver: "1.0.0", status: "ok" }
```

## Adding a Backend Script

1. Add your script to `scripts/`
2. Register it in `src/pages/Backend.jsx` in the `TABS` array
3. Add the script content to the `SCRIPTS` object as a string array

## Tauri Commands

Backend commands live in `src-tauri/src/commands/`. Each command:

```rust
#[tauri::command]
pub async fn your_command(arg: String) -> Result<String, String> {
    // implementation
    Ok("done".to_string())
}
```

Register in `main.rs`:
```rust
.invoke_handler(tauri::generate_handler![your_command])
```

Call from frontend:
```js
import { invoke } from '@tauri-apps/api/tauri';
const result = await invoke('your_command', { arg: 'value' });
```

## Code Style

- React: functional components, hooks only
- Rust: `cargo fmt` before committing
- Shell: `shellcheck` clean, `set -euo pipefail`
- Commit messages: `type(scope): description` e.g. `feat(games): add Oblivion Remastered profile`

## Pull Request Process

1. Fork the repo
2. Create a branch: `git checkout -b feat/your-feature`
3. Make changes and test
4. Run `npm run lint` and `cargo clippy`
5. Open a PR with a clear description

## Reporting Issues

Please include:
- Arch Linux version / kernel
- Steam and Proton-GE versions
- MO2 version
- What you were trying to do
- Full error output from the terminal
