import { describe, expect, it } from "vitest";
import { redactSensitiveData } from "../../open-sse/utils/requestLogger.js";

describe("request logger redaction", () => {
  it("redacts nested secrets without touching tool payloads", () => {
    expect(redactSensitiveData({
      authorization: "Bearer sk-1234567890abcdef",
      nested: { api_key: "secret-value", input: "*** Begin Patch\n*** End Patch\n" },
      items: [{ cookie: "abc" }],
    })).toEqual({
      authorization: "Bearer…cdef",
      nested: { api_key: "[REDACTED]", input: "*** Begin Patch\n*** End Patch\n" },
      items: [{ cookie: "[REDACTED]" }],
    });
  });
});
