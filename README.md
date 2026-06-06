# OSRS Favorbound Companion

A local-first companion app for the **Favorbound** Old School RuneScape playthrough concept.

Favorbound is a faction-locked account idea: your account begins loyal to one faction, can only use content that fits that faction, and earns **Favor** to forge alliances with other factions.

## First Prototype

- Choose a starting faction and run name.
- Track Favor.
- Complete faction duties for Favor.
- Spend Favor to unlock alliances.
- See the combined allowed content from active factions.
- Keep a local action history.
- Copy a short run summary.
- Reset and start again.

This app is inspired by the structure of Fate Locked, but intentionally much smaller: no huge OSRS datasets, no integrity chain, no RuneLite plugin, and no wiki sync in the first version.

## Run Locally

```bash
npm install
npm run dev
```

## Build

```bash
npm run build
```

## Deployment

The app is a static Vite build and can be deployed to GitHub Pages.
