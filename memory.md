# Memory — v0.5.40 sync and OpenCode Go Kimi K3

Last updated: 2026-07-21 09:11 EAT

## What was built

Fast-forwarded local `master` to upstream `v0.5.40` at `79918c7`, then merged `master` into `christadrian/fix-codex-custom-tool-bridge` without rebasing.

Added `kimi-k3` to the OpenCode Go provider catalog in `open-sse/providers/registry/opencode-go.js`. The model is available as `ocg/kimi-k3` and resolves the existing Kimi K3 capabilities with vision and reasoning enabled.

Added the regression coverage in `tests/unit/opencode-go-models.test.js` and the periodic eval in `tests/evals/opencode-go-kimi-k3.eval.mjs`.

## Decisions made

The custom-tool branch continues to absorb upstream through merge commits, never rebases. OpenCode Go Kimi K3 uses the provider's OpenAI-compatible chat endpoint and reuses the canonical `kimi-k3` capability definition instead of duplicating metadata.

## Problems solved

Preserved all custom-tool bridge, CLI packaging, Codex Desktop identity, GPT-5.6, and backup-branch commits while applying the latest upstream changes.

The first Kimi K3 eval incorrectly queried provider models by the UI alias `ocg`; corrected it to verify alias parsing separately, then query the catalog by canonical provider ID.

## Current state

Branch `christadrian/fix-codex-custom-tool-bridge` contains upstream `v0.5.40` plus all custom commits and is pushed to origin.

Focused verification passed: 26 unit tests, OpenCode Go Kimi K3 eval, Codex Desktop header eval, GPT-5.6 model eval, alias baseline, OAuth URL baseline, and `git diff --check`.

The provider byte-baseline still reports the two intentional branch differences for the Codex Desktop headers and AliCode Intl endpoint.

The CLI package was built manually as `/home/christarian/Projects/9router-0.5.40.tgz`. Install it with:

```bash
nub add --global /home/christarian/Projects/9router-0.5.40.tgz
```

## Next session starts with

Install the packed CLI, run `9router --version`, restart 9Router, then verify a real `ocg/kimi-k3` request accepts image input and emits reasoning.

## Open questions

Confirm whether the hardcoded Codex Desktop version should track every installed desktop-client update.
