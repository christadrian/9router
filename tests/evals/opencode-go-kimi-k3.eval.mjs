import assert from "node:assert/strict";
import { getProviderModels } from "../../open-sse/config/providerModels.js";
import { getCapabilitiesForModel } from "../../open-sse/providers/capabilities.js";
import { parseModel } from "../../open-sse/services/model.js";

assert.deepEqual(parseModel("ocg/kimi-k3"), {
  provider: "opencode-go",
  model: "kimi-k3",
  isAlias: false,
  providerAlias: "ocg",
});
assert.equal(getProviderModels("opencode-go").some(({ id }) => id === "kimi-k3"), true);
assert.deepEqual(
  {
    vision: getCapabilitiesForModel("opencode-go", "kimi-k3").vision,
    reasoning: getCapabilitiesForModel("opencode-go", "kimi-k3").reasoning,
  },
  { vision: true, reasoning: true },
);

console.log("OpenCode Go Kimi K3 eval passed");
