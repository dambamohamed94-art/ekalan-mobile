import assert from "node:assert/strict";
import test from "node:test";
import { clampProgress } from "../src/utils/progress.ts";

test("conserve une progression comprise entre 0 et 100", () => {
  assert.equal(clampProgress(0), 0);
  assert.equal(clampProgress(42), 42);
  assert.equal(clampProgress(100), 100);
});

test("borne les progressions hors limites", () => {
  assert.equal(clampProgress(-15), 0);
  assert.equal(clampProgress(125), 100);
});

test("convertit les valeurs numériques reçues sous forme de texte", () => {
  assert.equal(clampProgress("67"), 67);
});

test("remplace une progression invalide par zéro", () => {
  assert.equal(clampProgress(undefined), 0);
  assert.equal(clampProgress("invalide"), 0);
  assert.equal(clampProgress(Number.NaN), 0);
});
