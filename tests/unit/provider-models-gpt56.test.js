import { describe, expect, it } from "vitest";
import {
  getModelTargetFormat,
  getModelQuotaFamily,
  getProviderModels,
  getModelUpstreamId,
  isValidModel,
} from "../../open-sse/config/providerModels.js";
import { getPricingForModel } from "../../open-sse/providers/pricing.js";

const GPT56_MODELS = [
  ["gpt-5.6-sol", "GPT-5.6 Sol", { input: 5, output: 30, cached: 0.5, cache_creation: 6.25 }],
  ["gpt-5.6-terra", "GPT-5.6 Terra", { input: 2.5, output: 15, cached: 0.25, cache_creation: 3.125 }],
  ["gpt-5.6-luna", "GPT-5.6 Luna", { input: 1, output: 6, cached: 0.1, cache_creation: 1.25 }],
];

describe("OpenAI GPT-5.6 model registration", () => {
  it.each(GPT56_MODELS)("registers %s as an OpenAI chat model", (id, name) => {
    const model = getProviderModels("openai").find((entry) => entry.id === id);

    expect(model).toMatchObject({ id, name });
    expect(model.kind).toBeUndefined();
    expect(getModelTargetFormat("openai", id)).toBeNull();
    expect(isValidModel("openai", id)).toBe(true);
  });

  it("exposes the new models in the OpenAI and Codex catalogs", () => {
    for (const id of ["gpt-5.6-sol", "gpt-5.6-terra", "gpt-5.6-luna"]) {
      expect(getProviderModels("cx").some((model) => model.id === id)).toBe(true);
    }
  });

  it("maps Codex review variants to the base model and review quota family", () => {
    expect(getModelUpstreamId("cx", "gpt-5.6-sol-review")).toBe("gpt-5.6-sol");
    expect(getModelQuotaFamily("cx", "gpt-5.6-sol-review")).toBe("review");
    expect(getModelUpstreamId("cx", "gpt-5.6-terra-review")).toBe("gpt-5.6-terra");
    expect(getModelQuotaFamily("cx", "gpt-5.6-terra-review")).toBe("review");
    expect(getModelUpstreamId("cx", "gpt-5.6-luna-review")).toBe("gpt-5.6-luna");
    expect(getModelQuotaFamily("cx", "gpt-5.6-luna-review")).toBe("review");
  });

  it.each(GPT56_MODELS)("uses the official pricing for %s", (id, _name, expected) => {
    expect(getPricingForModel("openai", id)).toMatchObject(expected);
  });
});
