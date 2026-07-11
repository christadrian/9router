import { describe, expect, it } from "vitest";

import { CODEX_DEFAULT_INSTRUCTIONS } from "../../open-sse/config/codexInstructions.js";
import { CodexExecutor } from "../../open-sse/executors/codex.js";

const APPLY_PATCH_POLICY =
  "For manual file edits, file creation, file deletion, and small targeted changes, use apply_patch. Do not use shell redirection, heredocs, Python/Node file writes, sed -i, perl -pi, tee, or cat > for hand-authored edits. Use shell-based generation only for generated files, formatter output, broad mechanical rewrites, or when apply_patch fails.";

function normalizeTools(tools) {
  const executor = new CodexExecutor();
  const body = {
    model: "gpt-5.5",
    input: [{ type: "message", role: "user", content: [{ type: "input_text", text: "probe" }] }],
    tools,
    stream: true,
  };

  executor.transformRequest("gpt-5.5", body, true, {
    connectionId: "test-codex-tools",
    providerSpecificData: {},
  });

  return body.tools;
}

describe("CodexExecutor tool normalization", () => {
  it("uses the desktop client identity and account scope for custom-endpoint requests", () => {
    const accountId = "acct_sol_enabled";
    const token = `header.${Buffer.from(JSON.stringify({
      "https://api.openai.com/auth": { chatgpt_account_id: accountId },
    })).toString("base64url")}.signature`;
    const executor = new CodexExecutor();
    executor.transformRequest("gpt-5.6-sol", {
      model: "gpt-5.6-sol",
      input: [{ type: "message", role: "user", content: [{ type: "input_text", text: "probe" }] }],
    }, true, { accessToken: token, connectionId: "sol-custom-endpoint", providerSpecificData: {} });

    expect(executor.buildHeaders({ accessToken: token, providerSpecificData: {} })).toMatchObject({
      "originator": "Codex Desktop",
      "User-Agent": "Codex Desktop/42.1.0 (X11; Linux; x64)",
      "ChatGPT-Account-Id": accountId,
    });
  });

  it("tells Codex to use apply_patch for manual edits by default", () => {
    expect(CODEX_DEFAULT_INSTRUCTIONS).toContain("For manual file edits");
  });

  it("preserves Responses text.format for structured outputs", () => {
    const executor = new CodexExecutor();
    const schema = {
      type: "object",
      additionalProperties: false,
      properties: {
        title: { type: "string" },
      },
      required: ["title"],
    };
    const body = {
      model: "gpt-5.4-mini",
      input: [{ type: "message", role: "user", content: [{ type: "input_text", text: "test for session title" }] }],
      stream: true,
      metadata: { unsupported: true },
      text: {
        format: {
          type: "json_schema",
          name: "codex_output_schema",
          strict: true,
          schema,
        },
      },
    };

    executor.transformRequest("gpt-5.4-mini", body, true, {
      connectionId: "test-codex-structured-output",
      providerSpecificData: {},
    });

    expect(body.text).toEqual({
      format: {
        type: "json_schema",
        name: "codex_output_schema",
        strict: true,
        schema,
      },
    });
    expect(body.metadata).toBeUndefined();
  });

  it("preserves Responses-native tool_search tools", () => {
    const tools = normalizeTools([
      {
        type: "tool_search",
        execution: "sync",
        description: "Discover deferred tools",
        parameters: { type: "object", properties: {} },
      },
      {
        type: "namespace",
        name: "codex_app",
        description: "app tools",
        tools: [
          {
            type: "function",
            name: "automation_update",
            description: "automation",
            parameters: { type: "object", properties: {} },
            defer_loading: true,
          },
        ],
      },
      {
        type: "function",
        name: "plain_fn",
        description: "plain",
        parameters: { type: "object", properties: {} },
      },
    ]);

    expect(tools.map((tool) => `${tool.type}:${tool.name || ""}`)).toEqual([
      "tool_search:",
      "namespace:codex_app",
      "function:plain_fn",
    ]);
  });

  it("preserves hosted Responses tools", () => {
    const tools = normalizeTools([
      { type: "web_search", search_context_size: "medium" },
      { type: "image_generation", size: "1024x1024" },
      { type: "mcp", server_label: "docs", server_url: "https://example.com/mcp" },
      { type: "local_shell" },
      { type: "code_interpreter", container: { type: "auto" } },
      { type: "computer", display_width: 1024, display_height: 768, environment: "browser" },
    ]);

    expect(tools.map((tool) => tool.type)).toEqual([
      "web_search",
      "image_generation",
      "mcp",
      "local_shell",
      "code_interpreter",
      "computer",
    ]);
  });

  it("preserves custom freeform tools with format payloads", () => {
    const tools = normalizeTools([
      {
        type: "custom",
        name: "apply_patch",
        description: "patch",
        format: { type: "grammar", syntax: "lark", definition: "start: /.+/" },
      },
    ]);

    expect(tools).toEqual([
      {
        type: "custom",
        name: "apply_patch",
        description: "patch",
        format: { type: "grammar", syntax: "lark", definition: "start: /.+/" },
      },
    ]);
  });

  it("adds apply_patch edit policy when caller supplies instructions", () => {
    const executor = new CodexExecutor();
    const body = {
      model: "gpt-5.5",
      instructions: "Caller policy.",
      input: [{ type: "message", role: "user", content: [{ type: "input_text", text: "probe" }] }],
      tools: [{ type: "custom", name: "apply_patch", format: { type: "text" } }],
      stream: true,
    };

    executor.transformRequest("gpt-5.5", body, true, {
      connectionId: "test-codex-apply-patch-policy",
      providerSpecificData: {},
    });

    expect(body.instructions).toContain("Caller policy.");
    expect(body.instructions).toContain(APPLY_PATCH_POLICY);
  });

  it("does not duplicate apply_patch policy", () => {
    const executor = new CodexExecutor();
    const body = {
      model: "gpt-5.5",
      instructions: `Caller policy.\n\n${APPLY_PATCH_POLICY}`,
      input: [{ type: "message", role: "user", content: [{ type: "input_text", text: "probe" }] }],
      tools: [{ type: "custom", name: "apply_patch", format: { type: "text" } }],
      stream: true,
    };

    executor.transformRequest("gpt-5.5", body, true, {
      connectionId: "test-codex-no-apply-patch-policy",
      providerSpecificData: {},
    });

    expect(body.instructions.split(APPLY_PATCH_POLICY)).toHaveLength(2);
  });

  it("does not add apply_patch policy without apply_patch", () => {
    const executor = new CodexExecutor();
    const body = {
      model: "gpt-5.5",
      instructions: "Caller policy.",
      input: [{ type: "message", role: "user", content: [{ type: "input_text", text: "probe" }] }],
      tools: [{ type: "function", name: "other", parameters: { type: "object", properties: {} } }],
      stream: true,
    };

    executor.transformRequest("gpt-5.5", body, true, {
      connectionId: "test-codex-without-apply-patch",
      providerSpecificData: {},
    });

    expect(body.instructions).not.toContain(APPLY_PATCH_POLICY);
  });
});
