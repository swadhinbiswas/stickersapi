# Contributing

Thanks for helping improve StickersAPI.

## What belongs here

This repository contains:

- The TypeScript SDK in `sdk/`
- The Discord bot example in `examples/discord-bot/`
- The OpenAPI document in `openapi.json`

The production Worker, scraping, caching and rate-limit code are not part of this repository. Issues and pull requests about those belong in a private channel; use email for security or commercial topics.

## Before opening a pull request

1. Keep the SDK zero-dependency at runtime.
2. Keep method names and response types backward compatible.
3. Run the SDK build:

   ```bash
   cd sdk
   npm ci
   npm run build
   ```

4. Syntax-check the bot:

   ```bash
   node --check examples/discord-bot/index.js
   ```

5. Do not commit secrets, `.env` files, tokens or generated credentials.
6. Update `sdk/README.md` or `CHANGELOG.md` when behavior changes.

## Issues

Use the issue templates for bugs and feature requests. Include the SDK version, Node version and a minimal reproduction when possible.

For security reports, follow [SECURITY.md](SECURITY.md) instead.
