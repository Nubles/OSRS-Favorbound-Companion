# OSRS Favorbound Companion

A local-first companion app for the **Favorbound** Old School RuneScape playthrough concept.

Favorbound is a faction-locked account idea: your account begins loyal to one faction, can only use content that fits that faction, and earns **Favor** to forge alliances with other factions.

## V2 Companion

- Choose a starting faction and run name.
- Track total Favor, per-faction Favor, and rank thresholds.
- Advance faction duties with progress counters.
- Unlock alliances once the run reaches the required Favor threshold.
- Review allowed, conditional, and locked content across regions, skills, gear, and themes.
- Use a rulebook-style faction guide and history feed.
- Adjust manual Favor gains and strict-mode settings.
- Export and import local save files.
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
