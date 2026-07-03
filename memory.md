# Memory — 9router v0.5.18 branch sync

Last updated: 2026-07-03 19:55 Africa/Nairobi

## What was built

Updated `christadrian/fix-codex-custom-tool-bridge` with `master`/upstream v0.5.18 via an in-progress merge, preserving the custom Codex/custom-tool bridge fixes. Patched `open-sse/translator/response/openai-to-claude.js` so complete JSON tool args emit immediately while partial tool streams still buffer until finish.

## Decisions made

Kept the branch merge uncommitted until Christadrian verified CLI install/runtime. No PR should be created for this work. Root `package-lock.json` was ignored by git and stale, so it was moved out of the repo instead of tracked or committed; `lock.yaml` remains the authoritative root lockfile.

## Problems solved

Nub global install failed with `ERR_NUB_LOCKFILE_AMBIGUOUS` because the repo root had both ignored stale `package-lock.json` and tracked `lock.yaml`. Moving `package-lock.json` to `/tmp/9router-package-lock.json.20260703194922.bak` fixed `nub install -g /home/christadrian/Projects/9router-0.5.18.tgz` from the repo root.

## Current state

Targeted bridge tests pass: `tests/translator/bugs-openai-bridge.test.js`, `tests/translator/bugs-codexCli-responses.test.js`, `tests/unit/codex-tool-normalization.test.js`, `tests/unit/openai-to-claude-response-tools.test.js`, `tests/unit/openai-to-claude.test.js`, `tests/unit/translator-custom-prefix.test.js`. CLI build passed with `npm --prefix cli run build`. Tarball `/home/christadrian/Projects/9router-0.5.18.tgz` installs with Nub and `9router --version` returns `0.5.18`. Full repo test run still has unrelated harness/snapshot failures.

## Next session starts with

If this branch is already pushed, verify remote branch `origin/christadrian/fix-codex-custom-tool-bridge` contains the merge commit and do not create a PR unless Christadrian asks.

## Open questions

None for this branch sync. Full test harness cleanup remains separate work.
