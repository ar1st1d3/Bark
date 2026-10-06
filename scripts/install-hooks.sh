#!/usr/bin/env bash
set -e

DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
BIN_DIR="$HOME/.local/bin"
mkdir -p "$BIN_DIR"

HOOK_SRC="$DIR/integrations/antigravity/bark-hook.py"
HOOK_DEST="$BIN_DIR/bark-hook"

echo "=== Installation des hooks Bark pour Antigravity ==="

chmod +x "$HOOK_SRC"
chmod +x "$DIR/integrations/hermes/hermes_adapter.py"
chmod +x "$DIR/scripts/test-bark-socket.py"

ln -sf "$HOOK_SRC" "$HOOK_DEST"

echo "✓ 'bark-hook' installé dans $HOOK_DEST"
echo ""
echo "Pour activer la détection automatique dans votre projet Antigravity :"
echo "1. Créez un dossier .agents/ à la racine de votre projet :"
echo "   mkdir -p .agents"
echo "2. Copiez le fichier hooks.json :"
echo "   cp $DIR/integrations/antigravity/hooks.json .agents/hooks.json"
echo ""
echo "Bark interceptera alors automatiquement les actions d'Antigravity !"
