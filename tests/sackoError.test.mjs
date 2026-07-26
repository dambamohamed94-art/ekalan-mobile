import assert from "node:assert/strict";
import test from "node:test";
import { classifySackoError } from "../src/utils/sackoError.ts";

test("présente une erreur réseau réessayable", () => {
  const state = classifySackoError({ network: true });
  assert.equal(state.kind, "network");
  assert.equal(state.retryable, true);
});

test("distingue le quota et désactive la nouvelle tentative immédiate", () => {
  const state = classifySackoError({ status: 429, message: "Quota atteint" });
  assert.equal(state.kind, "quota");
  assert.equal(state.retryable, false);
});

test("masque les exceptions techniques du serveur", () => {
  const state = classifySackoError({
    status: 500,
    message: "Exception IA",
  });
  assert.equal(state.kind, "unavailable");
  assert.equal(state.message.includes("Exception IA"), false);
});

test("identifie un contexte pédagogique absent", () => {
  const state = classifySackoError({
    message: "SACKO_CONTEXT_UNAVAILABLE",
  });
  assert.equal(state.kind, "context");
});
