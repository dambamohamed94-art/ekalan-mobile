import assert from "node:assert/strict";
import test from "node:test";
import { buildSackoTutorPayload } from "../src/utils/sackoPayload.ts";

const context = {
  level: "CM1",
  normalized_level: "cm1",
  subject: "mathematiques",
  chapter: "nombres",
  lesson: "grands-nombres",
  tab: "quiz",
  scene_index: 2,
};

test("construit le contrat Sacko complet attendu par le backend", () => {
  const payload = buildSackoTutorPayload("  Aide-moi  ", context, 4);

  assert.equal(payload.message, "Aide-moi");
  assert.equal(payload.level, "CM1");
  assert.equal(payload.subject, "mathematiques");
  assert.equal(payload.chapter, "nombres");
  assert.equal(payload.lesson, "grands-nombres");
  assert.equal(payload.tab, "quiz");
  assert.equal(payload.scene_index, 2);
  assert.equal(payload.hint_level, 4);
});

test("borne le niveau d’aide entre 1 et 5", () => {
  assert.equal(buildSackoTutorPayload("Question", context, 99).hint_level, 5);
  assert.equal(buildSackoTutorPayload("Question", context, 0).hint_level, 1);
});

test("refuse un contexte pédagogique incomplet", () => {
  assert.throws(
    () =>
      buildSackoTutorPayload("Question", { ...context, lesson: "" }, 2),
    /INVALID_SACKO_PAYLOAD/,
  );
});
