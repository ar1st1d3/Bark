# 🐶 Bark

> **Compagnon de bureau & Hub de contrôle pour Google Antigravity & Hermes Agent (Nous Research)**
> *Inspiré du concept de Coucou, réimplémenté de zéro sous Linux (X11 / Wayland) avec Tauri 2, React 19 et Rust.*

---

## 🌟 Présentation

**Bark** vit discrètement en haut de votre écran sous la forme d'une **encoche (« Notch ») matérielle opaque** dotée d'une **mascotte carlin (Pug) interactive**. Il sert de tableau de bord et de centre de commande tout-en-un pour piloter vos sessions d'agents IA sans quitter votre flux de travail :

- **Google Antigravity & Hermes Agent** : suivi en direct des sessions, métriques, diffs de code et approbation en direct.
- **Encoche Fermée Ultra-Compacte** : petite encoche de ~84x42px au sommet de l'écran avec uniquement la tête animée du carlin qui vous regarde.
- **Double-Carte Ouverte** :
  - **Carte de gauche** : grand carlin animé, métriques clés (`DIFFS`, `ÉTAPES`), activités récentes horodatées, et panneau d'approbation d'outils.
  - **Carte de droite** : grille de pilules pour changer instantanément d'agent ou de modèle (`Antigravity`, `Hermes`, `VS Code`, `GitHub`, `n8n`, `Vercel`, etc.).
- **Mascotte Carlin interactive** : yeux qui suivent le curseur, clignements, respiration, sons synthétisés Web Audio API.

---

## 🚀 Démarrage Rapide

```bash
# Installation des dépendances
npm install

# Lancement en développement (Tauri 2)
npm run tauri dev

# Ou aperçu web :
npm run dev
```

### Tester avec le socket
```bash
python3 scripts/test-bark-socket.py antigravity
```
