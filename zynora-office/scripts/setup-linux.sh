#!/usr/bin/env bash
# Dépendances système de ZYNORA OFFICE sous Debian/Ubuntu (Tauri 2 + tests de bout en bout).
set -euo pipefail
sudo apt-get update
sudo apt-get install -y \
  build-essential file libssl-dev libxdo-dev \
  libwebkit2gtk-4.1-dev libgtk-3-dev librsvg2-dev libayatana-appindicator3-dev \
  xvfb webkit2gtk-driver
if ! command -v tauri-driver >/dev/null; then
  cargo install tauri-driver --locked
fi
echo "Dépendances installées. Suite : pnpm install && pnpm dev"
