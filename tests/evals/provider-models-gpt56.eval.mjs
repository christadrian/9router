import assert from "node:assert/strict";
import { getPricingForModel } from "../../open-sse/providers/pricing.js";
import { getProviderModels, isValidModel } from "../../open-sse/config/providerModels.js";

const expected = {
  "gpt-5.6-sol": { name: "GPT-5.6 Sol", input: 5, output: 30 },
  "gpt-5.6-terra": { name: "GPT-5.6 Terra", input: 2.5, output: 15 },
  "gpt-5.6-luna": { name: "GPT-5.6 Luna", input: 1, output: 6 },
};

const models = new Map(getProviderModels("openai").map((model) => [model.id, model]));
for (const [id, metadata] of Object.entries(expected)) {
  assert.deepEqual(models.get(id), { id, name: metadata.name });
  assert.equal(isValidModel("openai", id), true);
  assert.equal(getPricingForModel("openai", id).input, metadata.input);
  assert.equal(getPricingForModel("openai", id).output, metadata.output);
}

const codexModels = new Map(getProviderModels("cx").map((model) => [model.id, model]));
for (const id of ["gpt-5.6-sol", "gpt-5.6-terra", "gpt-5.6-luna", "gpt-5.6-sol-review", "gpt-5.6-terra-review", "gpt-5.6-luna-review"]) {
  assert.equal(codexModels.has(id), true);
}

console.log(`GPT-5.6 catalog eval passed: ${Object.keys(expected).length} OpenAI models and 4 Codex models`);
