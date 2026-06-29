---
description: "This project uses Node.js and npm for installs, scripts, and tooling."
alwaysApply: true
---

# Node.js Environment

This project uses **Node.js 24.x** and **npm**. Lockfile: **`package-lock.json`**.

## Main rule

Use **`npm`**, **`npx`**, and **`node`** for installs, scripts, and one-off tools.

## Common commands

| Task | Command |
|------|---------|
| Install dependencies | `npm install` |
| Reproducible install | `npm ci` |
| Run a script | `npm run <script>` |
| Run tests | `npm test` |
| One-off package | `npx <package>` |
| Run a file | `node <file>` |
| Add dependency | `npm install <package>` |
| Add dev dependency | `npm install -D <package>` |
| Remove dependency | `npm uninstall <package>` |

## Notes

- `package.json` scripts are invoked with `npm run <script>` (except `npm test`, which maps to the `test` script).
- Keep **`package-lock.json`** committed and in sync with `package.json`.
