# Memory — Custom tool bridge, Codex Desktop identity, GPT-5.6 Sol, CLI bundling

Last updated: 2026-07-15 EAT

## Branch
`christadrian/fix-codex-custom-tool-bridge` — 15 commits ahead of `master`, HEAD at `fec7c45`.

## What was built (full branch scope)

### Custom tool bridge (`open-sse/translator/`)
- Preserve custom tool outputs across request/response translation cycle (`1ff4aac`, `b1d3dc8`)
- Harden replay against malformed tool calls (`fbcfcd3`)
- Enforce `apply_patch` edit policy in Codex executor (`8b4aeee`)

### Codex Desktop identity (`open-sse/executors/codex.js`)
- Desktop identity header: `Codex Desktop/42.1.0 (X11; Linux; x64)`
- JWT-derived ChatGPT account scoping — prefers configured workspace/account metadata, falls back to access-token `chatgpt_account_id`
- Synchronized provider defaults in `open-sse/providers/registry/codex.js`
- Regression test: `tests/unit/codex-tool-normalization.test.js`
- Eval: `tests/evals/codex-desktop-headers.eval.mjs`

### GPT-5.6 Sol model (`2dd3cfc`)
- Added to `open-sse/providers/registry/openai.js`
- Provider model test: `tests/unit/provider-models-gpt56.test.js`
- Eval: `tests/evals/provider-models-gpt56.eval.mjs`

### CLI bundling (`cli/`)
- Bundle runtime deps for packed installs (`8162297`)
- Resolve nub store packages in bundle (`eaef730`)
- Make `npm pack` produce runnable bundle (`7c03a2a`)
- Remove `machine-id` package from CLI startup (`92c9d24`)
- Sync v0.5.18 custom tool bridge into CLI (`869fc1f`)
- CLI bundle test: `tests/unit/cli-bundle-runtime-deps.test.js`

### Upstream sync
- Merged `decolua:master` into branch (`686693a`)
- Merged master at v0.5.30 (`b3651b9`) — upstream at `9845a17`
- Resolved merge conflicts in `open-sse/executors/codex.js` and `open-sse/providers/pricing.js` without losing branch-specific changes

## Decisions made

- Branch absorbs upstream through merge commits, not rebases — preserves custom-tool bridge history without rewrite.
- Custom endpoint requests identify as `Codex Desktop/42.1.0 (X11; Linux; x64)`.
- Account scope prefers configured workspace/account metadata, falls back to access-token `chatgpt_account_id`.
- `apply_patch` edit policy enforced server-side in the executor, not in the translator.

## Problems solved

- Custom tool outputs lost during translation round-trip — fixed by preserving tool call/response pairs in translator.
- CLI npm pack produced broken bundles — fixed by bundling runtime deps and resolving nub store packages.
- `machine-id` native package crashed CLI startup — removed from CLI dependency chain.
- Upstream merge conflicts resolved without losing branch-specific pricing, custom-tool handling, or header fixes.
- Verified every backup-branch commit remains in current branch history.

## Current state

Branch `christadrian/fix-codex-custom-tool-bridge` is clean. HEAD `fec7c45` includes all work + this memory update. The only uncommitted change is `lock.yaml` deletion (artifact, safe to ignore).

Tests: 30 files changed across the branch, 7353 insertions, 137 deletions. Focused Vitest passed (9 tests). Codex Desktop header eval passed. GPT-5.6 Sol model eval passed. `git diff --check` passed.

## Next session starts with

Rebuild application manually. Verify a real GPT-5.6 Sol custom-endpoint request sends the desktop identity header and correct ChatGPT account header. Then merge `christadrian/fix-codex-custom-tool-bridge` into `master`.

## Open questions

- Should the hardcoded Codex Desktop version (`42.1.0`) be updated when the installed desktop client changes?
- Should `lock.yaml` (6006 lines) be gitignored or is it tracked intentionally?
