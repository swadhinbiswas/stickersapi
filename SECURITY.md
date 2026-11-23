# Security Policy

## Reporting a vulnerability

Email **mail@stickerapi.sbs** with the subject **"Security"**.

Please do not open a public GitHub issue for a vulnerability. Include:

- The affected file, endpoint or package.
- Steps to reproduce.
- The impact you believe it has.
- A safe way to contact you.

We will acknowledge reports as soon as possible and coordinate a fix before any public disclosure.

## Scope

This repository contains the SDK, the Discord bot example and the OpenAPI document. The hosted API, production Worker and data pipeline are not part of this repository.

## Secrets

Never commit:

- `.env` or `.dev.vars`
- Discord bot tokens
- Telegram bot tokens
- Upstash Redis URLs or tokens
- Cloudflare API tokens or account IDs

If a secret is exposed, rotate it immediately and report it by email.
