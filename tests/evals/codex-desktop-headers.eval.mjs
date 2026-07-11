import assert from "node:assert/strict";

import { CodexExecutor } from "../../open-sse/executors/codex.js";

const accountId = "acct_sol_enabled";
const accessToken = `header.${Buffer.from(JSON.stringify({
  "https://api.openai.com/auth": { chatgpt_account_id: accountId },
})).toString("base64url")}.signature`;
const executor = new CodexExecutor();
executor.transformRequest("gpt-5.6-sol", {
  model: "gpt-5.6-sol",
  input: [{ type: "message", role: "user", content: [{ type: "input_text", text: "probe" }] }],
}, true, { accessToken, connectionId: "sol-custom-endpoint", providerSpecificData: {} });

assert.deepEqual(
  Object.fromEntries(Object.entries(executor.buildHeaders({ accessToken, providerSpecificData: {} })).filter(([key]) =>
    ["originator", "User-Agent", "ChatGPT-Account-Id"].includes(key))),
  {
    originator: "Codex Desktop",
    "User-Agent": "Codex Desktop/42.1.0 (X11; Linux; x64)",
    "ChatGPT-Account-Id": accountId,
  },
);

console.log("Codex Desktop custom-endpoint header eval passed");
