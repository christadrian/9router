# Memory — 9router Codex custom tool bridge

Last updated: 2026-06-30 00:06 Africa/Nairobi

## What was built

- Fixed and hardened Codex `apply_patch` support for non-OpenAI models in 9router on branch `christadrian/fix-codex-custom-tool-bridge`.
- Tool-call bridge files changed:
  - `/home/christadrian/Projects/9router/open-sse/translator/request/openai-responses.js`
  - `/home/christadrian/Projects/9router/open-sse/translator/formats/responsesApi.js`
  - `/home/christadrian/Projects/9router/open-sse/translator/response/openai-responses.js`
  - `/home/christadrian/Projects/9router/open-sse/utils/stream.js`
  - `/home/christadrian/Projects/9router/open-sse/translator/schema/blocks.js`
- Packaging/runtime dependency fixes remain in:
  - `/home/christadrian/Projects/9router/cli/scripts/build-cli.js`
  - `/home/christadrian/Projects/9router/cli/package.json`
  - `/home/christadrian/Projects/9router/cli/src/cli/api/client.js`
  - `/home/christadrian/Projects/9router/tests/unit/cli-bundle-runtime-deps.test.js`
- Added/updated regression coverage:
  - `/home/christadrian/Projects/9router/tests/translator/bugs-codexCli-responses.test.js`
  - `/home/christadrian/Projects/9router/tests/unit/request-logger-redaction.test.js`
- Added pack verifier:
  - `/home/christadrian/Projects/9router/scripts/verify-cli-pack.mjs`
  - npm script: `npm run cli:verify-pack -- /home/christadrian/Projects/9router-0.5.15.tgz`
- Request logging now redacts nested secret-like fields while preserving tool payload content.
- Latest pushed commit: `fbcfcd3 fix(translator): harden custom tool replay`.
- Earlier pushed commits on this branch:
  - `b1d3dc8 fix(translator): replay custom tool outputs`
  - `92c9d24 fix(cli): remove machine-id package from CLI startup`
  - `7c03a2a fix(cli): make npm pack produce runnable bundle`
  - `eaef730 fix(cli): resolve nub store packages in bundle`
  - `8162297 fix(cli): bundle runtime deps for packed installs`
  - `1ff4aac fix(translator): preserve custom tool bridge`

## Decisions made

- Responses `custom` freeform tools are represented to Chat providers as normal function tools with schema `{ input: string }`.
- Provider function-call responses for custom tools are converted back to Responses `custom_tool_call`, with raw `input` unwrapped from JSON `{ input: "..." }`.
- Follow-up Responses input containing `custom_tool_call` and `custom_tool_call_output` is replayed into Chat tool history so non-OpenAI providers keep tool execution context.
- Shared helper functions in `formats/responsesApi.js` now own Responses item detection, content conversion, tool call conversion, output conversion, and stringification, reducing drift between request paths.
- Non-string custom tool input is stringified instead of dropped.
- `file_id` image inputs are not forwarded as fake image URLs.
- Build with `npm`; install with `nub install -g`.
- Correct tarball path is `/home/christadrian/Projects/9router-0.5.15.tgz`, not `/home/christadrian/Projects/9router/cli/9router-0.5.15.tgz`.
- User requested no PR. Branch was pushed only.

## Problems solved

- Original issue: Codex `apply_patch` worked with OpenAI models but failed with non-OpenAI models because Responses custom/freeform tools were not preserved through 9router.
- GLM hang after tool use: first fix handled model → custom tool call, but follow-up request replay did not translate `custom_tool_call` / `custom_tool_call_output` into Chat history. Fixed.
- Verified manually by user across providers:
  - DeepSeek: create/update/delete via `apply_patch` OK.
  - Kimi K2 Code: `apply_patch` OK.
  - GLM 5.2: create/delete via `apply_patch` OK after model corrected patch grammar.
- Packaging crashes fixed: packed install previously missed `@next/env`, `@swc/helpers`, and `node-machine-id`; now app deps are bundled and CLI startup does not require `node-machine-id`.
- Pack verifier initially failed due a generated `node -e` newline escaping bug. Fixed by writing a temporary `check.cjs` file and escaping `\\n` correctly.
- Bundled Codex runtime git failed pushing because missing `libcurl-gnutls.so.4`; `/usr/bin/git push` works.

## Current state

- Branch `christadrian/fix-codex-custom-tool-bridge` is pushed to GitHub at commit `fbcfcd3`.
- No PR was created.
- Tests run before commit:

```bash
npx vitest run tests/unit/request-logger-redaction.test.js tests/unit/cli-bundle-runtime-deps.test.js tests/translator/bugs-codexCli-responses.test.js --reporter=verbose
npm run cli:verify-pack -- /home/christadrian/Projects/9router-0.5.15.tgz
git diff --check
```

- Results:
  - 3 test files passed.
  - 13 tests passed.
  - Pack verifier passed: `pack ok: /home/christadrian/Projects/9router-0.5.15.tgz`.
  - Diff check clean.
- `git status --short` after push still showed untracked local files not committed:
  - `/home/christadrian/Projects/9router/.npmrc`
  - `/home/christadrian/Projects/9router/cli/pnpm-lock.yaml`
  - `/home/christadrian/Projects/9router/lock.yaml`
  - `/home/christadrian/Projects/9router/memory.md`

## Next session starts with

If user wants to install latest pushed fix manually:

```bash
cd /home/christadrian/Projects/9router
npm run cli:pack
npm run cli:verify-pack -- /home/christadrian/Projects/9router-0.5.15.tgz
nub install -g /home/christadrian/Projects/9router-0.5.15.tgz
```

Then restart 9router manually.

Optional post-install test prompt:

```text
Test `apply_patch` with a multi-line paragraph.

Use `apply_patch` only. Do not use shell/write-file tools.

1. Create `.codex_apply_patch_paragraph_test.md` with exactly this content:

9router custom tool bridge test.

This paragraph verifies that apply_patch can carry raw multi-line text through a non-OpenAI model without corrupting whitespace, punctuation, blank lines, or Markdown characters like `backticks`, **bold**, [links](https://example.com), and JSON-ish text: {"ok": true}. The file must be created using the apply_patch custom tool, not shell commands.

End of test.

2. Update the file by appending exactly:

Verified after update.

3. Delete `.codex_apply_patch_paragraph_test.md`.

Use this exact apply_patch format:

*** Begin Patch
*** Add File: .codex_apply_patch_paragraph_test.md
+line here
*** End Patch

Rules:
- Every added content line must start with `+`.
- Blank lines must be represented as a single `+`.
- Do not put raw content lines without `+`.
- Do not use shell commands.
- Do not stop after create; update and delete too.

Report only:
- create: ok/fail
- update: ok/fail
- delete: ok/fail
- errors: exact error text or none
```

If user says to create a PR, use existing pushed branch `christadrian/fix-codex-custom-tool-bridge`.

## Open questions

- Whether user wants a PR opened later.
- Whether untracked local files should be cleaned, ignored, or committed. Do not touch them without asking.
