# Buildkite setup

The pipeline lives in [`pipeline.yml`](pipeline.yml). It builds the SDK, checks the Discord bot and publishes the SDK to npm on version tags.

## 1. Create the pipeline

1. Open <https://buildkite.com/> and create a new pipeline.
2. Name it **stickersapi**.
3. Connect the GitHub repository **swadhinbiswas/stickersapi**.
4. Set the default branch to **main**.
5. Use the repository pipeline file **`.buildkite/pipeline.yml`**.

## 2. Add environment variables

In the pipeline settings, add:

| Name | Value | Secret |
|---|---|---|
| `NPM_TOKEN` | npm automation token with publish access | Yes |
| `NPM_USER_NAME` | `stickerapi` | No |

Never commit either value. The publish script reads them from the Buildkite environment and passes them to the Docker container.

## 3. Start an agent

The pipeline uses the `default` queue and the Docker plugin with `node:22`. The agent must have Docker.

```bash
buildkite-agent start
```

If your agent uses a different queue, change `agents.queue` in `pipeline.yml`.

## 4. Build and release

A push to `main` runs the SDK build and bot check. The npm publish step runs only on tags.

```bash
cd sdk
npm version patch --no-git-tag-version
cd ..
git add sdk/package.json sdk/package-lock.json
git commit -m "release: sdk v0.1.1"
git tag v0.1.1
git push origin main --tags
```

Buildkite checks that the tag matches `sdk/package.json`, verifies the npm user, and publishes `stickersapi` with public access.

To publish the current `0.1.0` release, create a Buildkite build for the existing `v0.1.0` tag after the pipeline is connected.

## npm staged publishing

New npm packages can be staged for review. If the registry shows `0.0.0-stage`, the real version is waiting for a maintainer:

```bash
npm stage list stickersapi
npm stage view <stage-id>
npm stage approve <stage-id>
```

Approval requires 2FA. You can also approve in the **Staged Packages** tab on npmjs.com. The CI script detects the placeholder and does not republish automatically.

## Troubleshooting

- `NPM_TOKEN is not configured`: add the environment variable to the pipeline or the build.
- `NPM_TOKEN belongs to ...`: the token is for a different npm user than `NPM_USER_NAME`.
- `403 Forbidden`: the token lacks publish rights, or the package name `stickersapi` is unavailable.
- `The request IP is not allowed for this token`: add the agent host's public IPv4/IPv6 to the token allowlist in Buildkite (Organization or Cluster agent token settings), or create an agent token without IP restrictions.
- Docker plugin errors: make sure the agent has Docker and the `default` queue.
