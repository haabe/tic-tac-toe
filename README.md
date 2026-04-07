---
title: Tic Tac Toe
emoji: ⭕
colorFrom: purple
colorTo: red
sdk: docker
app_port: 7860
pinned: false
license: mit
---

# Tic Tac Toe

A fun, intuitive tic-tac-toe webapp designed for ages 5+. Play against the CPU, with a friend on the same device, or online across devices using secret codes.

**[Play now](https://haabe-tic-tac-toe.hf.space)**

## Features

- **🤖 vs CPU** — Easy mode (random) and Hard mode (unbeatable minimax)
- **👫 Local 2 Players** — Pass-and-play on the same device
- **🌐 Online** — Play across devices with 6-digit secret codes (no accounts needed)
- **📊 Session Scoreboard** — Track wins across rematches
- **🔄 Fair Play** — Starting player swaps each round
- **♿ Accessible** — Keyboard navigation, screen reader support, WCAG 2.1 AA
- **🔒 Private** — No ads, no tracking, no data collection, no accounts
- **📱 Responsive** — Works on mobile and desktop

## Tech Stack

- **Frontend**: React + TypeScript (Vite)
- **Backend**: Node.js + `ws` (WebSocket)
- **Hosting**: Hugging Face Spaces (Docker)
- **Tests**: Vitest + React Testing Library (40 tests)

## Development

```bash
npm install
npm run dev          # Frontend (Vite dev server on :5173)
npm run dev:server   # Backend (WebSocket server on :3000)
npm test             # Run all tests
npm run build        # Production build
```

For online mode in dev, run both the frontend and backend. Vite proxies `/ws` to the backend automatically.

## Deployment

The app deploys to Hugging Face Spaces via Docker. Push to the `space` remote to deploy:

```bash
git push space main
```

## Built with Mycelium

This project was built using [Mycelium](https://github.com/haabe/mycelium), a theory-guided product development framework for AI-assisted development. The `.claude/` directory contains the canvas files, decision logs, and product artifacts from the development process.

## License

MIT
