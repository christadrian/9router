# Memory — Master sync and Codex Desktop custom endpoint

Last updated: 2026-07-11 06:15 EAT

## What was built

Updated local `master` to upstream `v0.5.30`, merged it into `christadrian/fix-codex-custom-tool-bridge` without rebasing, and preserved the custom-tool bridge history from `christadrian/backup-v0.5.18-custom-tool-bridge`.

Added Codex Desktop identity headers and JWT-derived ChatGPT account scoping in `open-sse/executors/codex.js`, synchronized provider defaults in `open-sse/providers/registry/codex.js`, added the regression test in `tests/unit/codex-tool-normalization.test.js`, and added `tests/evals/codex-desktop-headers.eval.mjs`.

## Decisions made

The work branch absorbs upstream through merge commits, not rebases. Custom endpoint requests identify as `Codex Desktop/42.1.0 (X11; Linux; x64)`. Account scope prefers configured workspace/account metadata, then falls back to the access-token `chatgpt_account_id`.

## Problems solved

Resolved upstream merge conflicts in `open-sse/executors/codex.js` and `open-sse/providers/pricing.js` without losing branch-specific pricing, custom-tool handling, or uncommitted header fixes. Verified every backup-branch commit remains in current branch history.

## Current state

Branch `christadrian/fix-codex-custom-tool-bridge` is clean and synchronized with its remote at commit `92d450d`. Merge commit `b3651b9` contains upstream `master` at `9845a17`.

Focused Vitest passed: 9 tests. Codex Desktop header eval passed. `git diff --check` passed. No rebuild or restart was run because Christadrian will rebuild manually.

## Next session starts with

Run `/remember restore`, then rebuild the application manually and verify a real GPT-5.6 Sol custom-endpoint request sends the desktop identity and correct ChatGPT account header.

## Open questions

Confirm whether the hardcoded Codex Desktop version should be updated whenever the installed desktop client changes.
