#!/usr/bin/env bash
set -euo pipefail

# Publish @stickerapi/sdk to npm from a Buildkite tag build.
# Required environment: NPM_TOKEN
# Optional: NPM_USER_NAME (defaults to stickerapi) for a sanity check.
#
# Do not print the token. The temporary npmrc is removed by the trap.

: "${NPM_TOKEN:?NPM_TOKEN is not configured in Buildkite}"

EXPECTED_USER="${NPM_USER_NAME:-stickerapi}"
ROOT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
cd "$ROOT_DIR/sdk"

if [ -z "${BUILDKITE_TAG:-}" ]; then
  echo "This step must run on a tag build (for example v0.1.0)."
  exit 1
fi

TAG_VERSION="${BUILDKITE_TAG#v}"
PACKAGE_VERSION="$(node -p "require('./package.json').version")"

if [ "$TAG_VERSION" != "$PACKAGE_VERSION" ]; then
  echo "Tag v$TAG_VERSION does not match sdk/package.json version $PACKAGE_VERSION."
  echo "Bump the SDK version first, then tag the same version."
  exit 1
fi

TMP_NPMRC="$(mktemp)"
trap 'rm -f "$TMP_NPMRC"' EXIT
printf '//registry.npmjs.org/:_authToken=%s\n' "$NPM_TOKEN" > "$TMP_NPMRC"
export NPM_CONFIG_USERCONFIG="$TMP_NPMRC"

NPM_USER="$(npm whoami)"
echo "npm user: $NPM_USER"
if [ "$NPM_USER" != "$EXPECTED_USER" ]; then
  echo "NPM_TOKEN belongs to '$NPM_USER', expected '$EXPECTED_USER'."
  exit 1
fi

npm ci
npm run build

PUBLISHED_VERSION="$(npm view @stickerapi/sdk version 2>/dev/null || true)"
if [ "$PUBLISHED_VERSION" = "$PACKAGE_VERSION" ]; then
  echo "@stickerapi/sdk@$PACKAGE_VERSION is already published; nothing to do."
  exit 0
fi

echo "Publishing @stickerapi/sdk@$PACKAGE_VERSION"
npm publish --access public

echo "Published @stickerapi/sdk@$PACKAGE_VERSION"
