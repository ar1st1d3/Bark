#!/usr/bin/env bash
set -e

DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
cd "$DIR"

echo "=== Lancement de Bark (Encoche supérieure) ==="
echo "1. Serveur Unix Socket sur : ${XDG_RUNTIME_DIR:-/tmp}/bark.sock"
echo "2. Mascotte Carlin & Sélecteur d'agents"
echo ""

npm run tauri dev
