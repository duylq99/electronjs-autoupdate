# Electron Auto-Update Demo

Desktop app demo using React + shadcn/ui + Tailwind + TypeScript, demonstrating auto-update via GitHub Releases with `electron-updater`.

## Quick Start

```bash
npm install --legacy-peer-deps
npm run dev
```

## Setup Auto-Update (GitHub Releases)

### 1. Configure `electron-builder.yml`

Replace `GITHUB_USERNAME_PLACEHOLDER` with your GitHub username:

```yaml
publish:
  provider: github
  owner: your-github-username
  repo: electronjs-autoupdate
```

### 2. Create GitHub Personal Access Token

Go to https://github.com/settings/tokens → Generate new token → Select `repo` scope.

```bash
# Copy .env.example and fill in your token
cp .env.example .env
# Edit .env:
# GH_TOKEN=ghp_your_token_here
```

### 3. Release v1.0.0

```bash
# Build and publish to GitHub Releases
GH_TOKEN=ghp_... npm run dist
```

### 4. Test Auto-Update

1. Install v1.0.0 from GitHub Releases
2. Bump version in `package.json` to `1.1.0`
3. `GH_TOKEN=ghp_... npm run dist` — publishes v1.1.0
4. Open installed v1.0.0 → click "Check for Updates" → update appears
5. Download → Install & Restart → app reopens as v1.1.0

## Scripts

| Command | Description |
|---------|-------------|
| `npm run dev` | Start in development mode |
| `npm run build` | Build all processes |
| `npm run dist` | Build + package installer |
| `npm run dist:win` | Windows NSIS installer |
| `npm run dist:mac` | macOS DMG |
| `npm run dist:linux` | Linux AppImage |

## Architecture

```
src/
  main/           # Electron main process
    index.ts      # BrowserWindow + IPC handlers
    updater.ts    # electron-updater integration
  preload/
    index.ts      # contextBridge → window.electronAPI
  shared/
    types.ts      # Shared TypeScript types
  renderer/
    src/
      hooks/
        useAutoUpdate.ts     # Update state machine
      components/
        UpdatePanel/         # Auto-update UI
        layout/              # TopNav, ColorBlockSection, Footer
      App.tsx                # Root layout
      globals.css            # Design tokens (CSS vars)
```

## Update Flow

```
idle → checking → available → downloading → ready → (restart)
                └→ not-available
         *      └→ error
```

## Notes

- Auto-update only runs in **packaged builds** (`app.isPackaged === true`)
- In dev mode, "Check for Updates" returns a mock "up to date" response
- Code signing required for production (macOS Gatekeeper, Windows SmartScreen)
