// Real Codex CLI requests (OpenAI Responses API: { input:[], instructions }) → providers.
import { describe, it, expect } from "vitest";
import "./registerAll.js";
import { translateRequest } from "../../open-sse/translator/index.js";
import { FORMATS } from "../../open-sse/translator/formats.js";
import { convertResponsesApiFormat } from "../../open-sse/translator/formats/responsesApi.js";
import { openaiToOpenAIResponsesResponse } from "../../open-sse/translator/response/openai-responses.js";

const R2O = (body) => translateRequest(FORMATS.OPENAI_RESPONSES, FORMATS.OPENAI, "m", body, true, null, null);
const O2R = (body) => translateRequest(FORMATS.OPENAI, FORMATS.OPENAI_RESPONSES, "m", body, true, null, null);

describe("Codex CLI Responses → OpenAI", () => {
  // openai-responses.js:103 — function_call with empty name skipped, can leave tool_calls: []
  // KNOWN BUG: empty tool_calls array is rejected by OpenAI/Codex
  it.fails("assistant has no empty tool_calls array when all names are empty", () => {
    const out = R2O({
      input: [
        { type: "function_call", call_id: "c1", name: "", arguments: "{}" },
      ],
    });
    const asst = out.messages.find((m) => m.role === "assistant" && m.tool_calls);
    expect(asst?.tool_calls?.length ?? 0, "empty tool_calls[] produced").toBeGreaterThan(0);
  });

  // openai-responses.js:109-110 — arguments passed through without ensuring string type
  // KNOWN BUG
  it.fails("function_call arguments end up as a string", () => {
    const out = R2O({
      input: [{ type: "function_call", call_id: "c1", name: "f", arguments: { a: 1 } }],
    });
    const asst = out.messages.find((m) => m.tool_calls);
    expect(typeof asst.tool_calls[0].function.arguments).toBe("string");
  });

  // openai-responses.js:75-77 — input_image uses file_id as raw url
  // KNOWN BUG
  it.fails("input_image with file_id is not used as a raw url", () => {
    const out = R2O({
      input: [{ type: "message", role: "user", content: [
        { type: "input_image", file_id: "file-abc" },
      ] }],
    });
    const userMsg = out.messages.find((m) => m.role === "user");
    const img = Array.isArray(userMsg?.content) ? userMsg.content.find((c) => c.type === "image_url") : null;
    // A bare file_id is not a valid image URL
    expect(img?.image_url?.url === "file-abc").toBe(false);
  });

  it("custom freeform tools become string-input functions for Chat providers", () => {
    const out = R2O({
      input: [{ type: "message", role: "user", content: [{ type: "input_text", text: "patch" }] }],
      tools: [{
        type: "custom",
        name: "apply_patch",
        description: "freeform patch",
        format: { type: "grammar", syntax: "lark", definition: "start: /.+/" },
      }],
    });

    expect(out.tools[0].function.parameters).toEqual({
      type: "object",
      properties: {
        input: {
          type: "string",
          description: "Raw custom tool input. For apply_patch, put the complete patch text here.",
        },
      },
      required: ["input"],
      additionalProperties: false,
    });
  });

  it("custom freeform tools survive the /v1/responses pre-converter", () => {
    const out = convertResponsesApiFormat({
      input: [{ type: "message", role: "user", content: [{ type: "input_text", text: "patch" }] }],
      tools: [{ type: "custom", name: "apply_patch", description: "freeform patch" }],
    });

    expect(out.tools[0].function.parameters.required).toEqual(["input"]);
  });

  it("custom tool response unwraps JSON input back to Responses custom input", () => {
    const state = {
      seq: 0,
      responseId: "resp_test",
      created: 1,
      started: false,
      msgTextBuf: {},
      msgItemAdded: {},
      msgContentAdded: {},
      msgItemDone: {},
      reasoningId: "",
      reasoningIndex: -1,
      reasoningBuf: "",
      reasoningPartAdded: false,
      reasoningDone: false,
      inThinking: false,
      funcArgsBuf: {},
      funcNames: {},
      funcCallIds: {},
      funcArgsDone: {},
      funcItemDone: {},
      completedSent: false,
      customToolNames: new Set(["apply_patch"]),
    };
    const chunk = {
      id: "chatcmpl_1",
      choices: [{
        index: 0,
        delta: {
          tool_calls: [{
            index: 0,
            id: "call_1",
            type: "function",
            function: { name: "apply_patch", arguments: JSON.stringify({ input: "*** Begin Patch\n*** End Patch\n" }) },
          }],
        },
        finish_reason: "tool_calls",
      }],
    };

    const events = openaiToOpenAIResponsesResponse(chunk, state);
    const done = events.find(e => e.event === "response.output_item.done");
    expect(done.data.item).toMatchObject({
      type: "custom_tool_call",
      input: "*** Begin Patch\n*** End Patch\n",
      name: "apply_patch",
    });
  });

  it("custom tool calls replay into Chat tool history after execution", () => {
    const out = R2O({
      input: [
        {
          type: "custom_tool_call",
          call_id: "call_patch",
          name: "apply_patch",
          input: "*** Begin Patch\n*** End Patch\n",
        },
        {
          type: "custom_tool_call_output",
          call_id: "call_patch",
          output: "Done!",
        },
        {
          type: "message",
          role: "user",
          content: [{ type: "input_text", text: "continue" }],
        },
      ],
    });

    expect(out.messages).toEqual([
      {
        role: "assistant",
        content: null,
        tool_calls: [{
          id: "call_patch",
          type: "function",
          function: {
            name: "apply_patch",
            arguments: JSON.stringify({ input: "*** Begin Patch\n*** End Patch\n" }),
          },
        }],
      },
      { role: "tool", tool_call_id: "call_patch", content: "Done!" },
      { role: "user", content: [{ type: "text", text: "continue" }] },
    ]);
  });
});

describe("OpenAI → Codex Responses (reverse)", () => {
  // openai-responses.js:13 — clampCallId NOT applied on Responses→Chat; but here Chat→Responses must clamp
  it("call_id longer than 64 chars is clamped", () => {
    const longId = "call_" + "x".repeat(80);
    const out = O2R({
      messages: [
        { role: "assistant", content: null, tool_calls: [
          { id: longId, type: "function", function: { name: "f", arguments: "{}" } },
        ] },
        { role: "tool", tool_call_id: longId, content: "ok" },
      ],
    });
    const fc = out.input.find((i) => i.type === "function_call");
    expect(fc.call_id.length).toBeLessThanOrEqual(64);
  });
});
