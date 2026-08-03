import assert from "node:assert/strict";
import test from "node:test";
import {
  readProgressPercent,
  toApiSceneType,
  toMobileSceneType,
} from "../src/api/contractAdapters.ts";

test("adapte les noms de scènes Mobile vers le contrat backend", () => {
  assert.equal(toApiSceneType("cours"), "course");
  assert.equal(toApiSceneType("exercice"), "exercise");
  assert.equal(toMobileSceneType("course"), "cours");
  assert.equal(toMobileSceneType("exercise"), "exercice");
});

test("lit les aliases de progression anciens et actuels", () => {
  assert.equal(readProgressPercent({ progress_percent: 42 }), 42);
  assert.equal(readProgressPercent({ progress_pct: 38 }), 38);
  assert.equal(readProgressPercent({ progress_percentage: 51 }), 51);
  assert.equal(readProgressPercent({ overall_progress: 67 }), 67);
  assert.equal(readProgressPercent({ progress_percent: 130 }), 100);
  assert.equal(readProgressPercent({}), 0);
});
