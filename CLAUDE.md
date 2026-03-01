# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

This is a Tauri v2 desktop application for downloading YouTube videos. It consists of:
- **Frontend**: React 19 + TypeScript + Vite + Tailwind CSS v4
- **Backend**: Rust with Tauri v2
- **Sidecar binaries**: yt-dlp, bun, ffmpeg (bundled with the application)

## Development Commands

### Frontend Development
```bash
npm run dev           # Start Vite dev server on port 1420
npm run build         # Build frontend (tsc && vite build)
npm run preview       # Preview production build
```

### Tauri Development
```bash
npm run tauri dev     # Run Tauri in development mode (starts frontend dev server automatically)
npm run tauri build   # Build production application
```

### Testing
```bash
npm test              # Run all tests with Vitest
vitest run <file>     # Run specific test file
vitest watch          # Run tests in watch mode
```

### Linting and Formatting
```bash
npm run lint          # Run oxlint on src directory
npm run lint:fix      # Run oxlint with auto-fix
npm run fmt           # Run oxfmt on src directory
npm run fmt:check     # Check formatting without applying changes
```

### Rust Backend
```bash
cd src-tauri
cargo test            # Run Rust tests
cargo build           # Build Rust backend
```

## Architecture

### Frontend-Backend Communication

The frontend communicates with the Rust backend via Tauri's IPC mechanism:

1. **Frontend** uses `invoke()` from `@tauri-apps/api/core` to call Rust commands
2. **Rust backend** exposes commands via `#[tauri::command]` macro
3. Commands are registered in `src-tauri/src/lib.rs` in the `invoke_handler`

**Example flow** (YouTube video info fetch):
- Frontend: `src/lib/api/youtube.service.ts` calls `invoke('cmd_get_video_info', { url })`
- Backend: `src-tauri/src/downloader.rs` executes `cmd_get_video_info` which spawns yt-dlp sidecar
- Data flows back as JSON string, parsed by frontend

### Sidecar Integration

The application bundles external binaries (yt-dlp, bun, ffmpeg) as sidecars:

- **Configuration**: Defined in `src-tauri/tauri.conf.json` under `bundle.externalBin`
- **Usage**: Rust code uses `tauri_plugin_shell` to spawn sidecar processes
- **Location**: Sidecars are placed adjacent to the executable during build

When working with sidecars:
- Use `app.shell().sidecar("binary-name")` to get a command
- Sidecar names in code don't include target triple suffix
- Handle both stdout and stderr via `CommandEvent`

### State Management

- **Zustand**: Client-side state (e.g., navigation state in `src/stores/navigation.ts`)
- **React Query**: Server state and data fetching (configured in `src/main.tsx`)

### Routing

Client-side routing is handled via Zustand store:
- Current route stored in `useNavigationStore`
- Route config in `src/config/navigation.tsx` maps route keys to components
- `App.tsx` reads current route and renders corresponding component

### UI Components

- Uses shadcn/ui components (Radix UI primitives + Tailwind styling)
- Components located in `src/components/ui/`
- Theme support via `src/components/theme-provider.tsx`

## Key Files

- `src-tauri/src/lib.rs` - Tauri command registration and app setup
- `src-tauri/src/downloader.rs` - YouTube download logic using yt-dlp sidecar
- `src/lib/api/youtube.service.ts` - Frontend API for YouTube operations
- `src/types/youtube.ts` - TypeScript interfaces for video data
- `src/App.tsx` - Main app component with sidebar layout
- `src-tauri/tauri.conf.json` - Tauri configuration (windows, sidecars, bundling)

## Important Notes

### Tauri Configuration
- Dev server runs on port 1420 (configured in both `vite.config.ts` and `tauri.conf.json`)
- Window uses overlay title bar style (macOS-specific)
- CSP is disabled (`csp: null`) for development convenience

### Testing
- Frontend tests use Vitest with jsdom environment
- Test setup file: `vitest.setup.ts` ( referenced in `vitest.config.ts`)
- Rust tests are inline in source files using `#[cfg(test)]` modules

### TypeScript Configuration
- Uses path aliases configured via `vite-tsconfig-paths` plugin
- Import paths like `@/components/...` resolve relative to `src/`

### External Dependencies
- `tauri-plugin-shell`: Required for sidecar execution
- `tauri-plugin-opener`: For opening URLs in default browser
- Radix UI components for accessible UI primitives
