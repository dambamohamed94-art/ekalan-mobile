import assert from "node:assert/strict";
import test from "node:test";
import { isValidEmail } from "../src/utils/formValidation.ts";

test("accepte une adresse email valide", () => {
  assert.equal(isValidEmail("eleve@ekalan.ml"), true);
});

test("ignore les espaces autour de l'adresse", () => {
  assert.equal(isValidEmail("  parent@ekalan.ml  "), true);
});

test("refuse les adresses incomplètes", () => {
  assert.equal(isValidEmail("eleve@"), false);
  assert.equal(isValidEmail("@ekalan.ml"), false);
  assert.equal(isValidEmail("eleve.ekalan.ml"), false);
  assert.equal(isValidEmail(""), false);
});
