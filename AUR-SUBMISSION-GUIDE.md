# AUR Submission Guide — mo2-linux-helper-git

## One-time AUR setup

```bash
# 1. Create an AUR account at https://aur.archlinux.org

# 2. Add your SSH key to your AUR profile
ssh-keygen -t ed25519 -C "your@email.com"
# Add ~/.ssh/id_ed25519.pub contents to https://aur.archlinux.org/account

# 3. Configure SSH for AUR
cat >> ~/.ssh/config <<EOF
Host aur.archlinux.org
  IdentityFile ~/.ssh/id_ed25519
  User aur
EOF
```

## Create the AUR package

```bash
# Clone the (empty) AUR repo for your package
git clone ssh://aur@aur.archlinux.org/mo2-linux-helper-git.git
cd mo2-linux-helper-git

# Copy in your files
cp /path/to/PKGBUILD .
cp /path/to/.SRCINFO .

# Always regenerate .SRCINFO from PKGBUILD before pushing
makepkg --printsrcinfo > .SRCINFO

# Test the build locally first!
makepkg -si

# Commit and push to AUR
git add PKGBUILD .SRCINFO
git commit -m "Initial release: mo2-linux-helper-git 2.0.0"
git push origin master
```

## Update the package (after new releases)

```bash
cd mo2-linux-helper-git

# Edit PKGBUILD — bump pkgrel if same version, update source if new tag
vim PKGBUILD

# Regenerate .SRCINFO
makepkg --printsrcinfo > .SRCINFO

# Test locally
makepkg -si --noconfirm

# Push
git add PKGBUILD .SRCINFO
git commit -m "Update to 2.1.0"
git push
```

## Install for users (once published)

```bash
# With yay
yay -S mo2-linux-helper-git

# With paru
paru -S mo2-linux-helper-git

# Manual
git clone https://aur.archlinux.org/mo2-linux-helper-git.git
cd mo2-linux-helper-git
makepkg -si
```

## Package naming conventions

- `mo2-linux-helper-git`  — tracks git HEAD (this package)
- `mo2-linux-helper`      — tracks stable releases (future)
- `mo2-linux-helper-bin`  — pre-built binary (future, if you publish AppImage)

## Checklist before submission

- [ ] `makepkg -si` succeeds cleanly
- [ ] `namcap PKGBUILD` shows no errors
- [ ] `namcap mo2-linux-helper-*.pkg.tar.zst` shows no errors  
- [ ] All deps listed in `depends=()` are correct
- [ ] `pkgver()` function works: `makepkg --nodeps -g`
- [ ] Package installs binary to `/usr/bin/mo2-linux-helper`
- [ ] Scripts installed to `/usr/bin/mo2-{setup,nxm,shortcut,flatpak-setup}`
- [ ] `.desktop` file present in `/usr/share/applications/`
- [ ] `LICENSE` file present

## Promoting on Reddit

Post to:
- r/linux_gaming — "MO2 Linux Helper: GUI tool for setting up Mod Organizer 2 on Linux with Proton/Wine"
- r/Nexusmods — mention NXM link handling
- r/modorganizerforvortex / r/skyrimmods / r/fo4
- Nexus Forums Linux board
