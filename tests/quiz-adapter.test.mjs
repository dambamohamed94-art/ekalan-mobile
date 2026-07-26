import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import test from "node:test";
import vm from "node:vm";
import ts from "typescript";

const source = readFileSync(
  new URL("../src/quiz/quizAdapter.ts", import.meta.url),
  "utf8",
);
const compiled = ts.transpileModule(source, {
  compilerOptions: {
    module: ts.ModuleKind.CommonJS,
    target: ts.ScriptTarget.ES2022,
  },
}).outputText;
const module = { exports: {} };
vm.runInNewContext(compiled, {
  exports: module.exports,
  module,
  require() {
    return {};
  },
});

const { comparable, normalizeQuiz } = module.exports;
const plain = (value) => JSON.parse(JSON.stringify(value));

test("normalise les choix illustrés sans produire [object Object]", () => {
  const quiz = normalizeQuiz({
    id: "image-choice",
    type: "choose-answer",
    question: "Choisis la scène.",
    choices: [
      { label: "Le matin", image: "/assets/morning.svg" },
      { label: "Le soir", image: "/assets/evening.svg" },
    ],
    answer: "Le soir",
  });

  assert.equal(quiz.type, "choice");
  assert.deepEqual(
    plain(quiz.choices.map((choice) => choice.label)),
    ["Le matin", "Le soir"],
  );
  assert.equal(
    quiz.choices[1].image,
    "https://ekalan.com/assets/evening.svg",
  );
});

test("conserve les SVG intégrés des choix et de la question", () => {
  const svg = '<svg viewBox="0 0 10 10"><circle cx="5" cy="5" r="4"/></svg>';
  const quiz = normalizeQuiz({
    type: "image-choice",
    image: svg,
    choices: [{ label: "Cercle", svg, value: "cercle" }],
    answer: "cercle",
  });

  assert.equal(quiz.type, "choice");
  assert.equal(quiz.visual.svg, svg);
  assert.equal(quiz.choices[0].svg, svg);
  assert.equal(quiz.choices[0].image, undefined);
});

test("retire le HTML injecté tout en récupérant son SVG et son libellé", () => {
  const svg = '<svg viewBox="0 0 10 10"><path d="M0 0h10v10z"/></svg>';
  const wrapped = `<div class="ek-mobile-pair-visual">${svg}<strong>Sans codage particulier</strong></div>`;
  const quiz = normalizeQuiz({
    type: "pair-match",
    pairs: [{ left: wrapped, right: "<strong>2 côtés égaux</strong>" }],
  });

  assert.equal(quiz.pairs[0].left.label, "Sans codage particulier");
  assert.equal(quiz.pairs[0].left.svg, svg);
  assert.equal(quiz.pairs[0].right.label, "2 côtés égaux");
  assert.equal(quiz.pairs[0].right.label.includes("<"), false);
});

test("convertit sentence, alternatives et answer en texte à trous", () => {
  const quiz = normalizeQuiz({
    type: "fill-missing",
    sentence: "See you ___!",
    answer: "tomorrow",
    alternatives: ["later", "tomorrow"],
  });

  assert.equal(quiz.type, "fill");
  assert.equal(quiz.text, "See you ___!");
  assert.deepEqual(plain(quiz.blanks), ["tomorrow"]);
  assert.deepEqual(
    plain(quiz.choices.map((choice) => choice.value)),
    ["later", "tomorrow"],
  );
});

test("normalise catégories et réponses sans undefined", () => {
  const quiz = normalizeQuiz({
    type: "click-drop",
    categories: ["CODAGE JUSTE", "CODAGE FAUX"],
    items: [
      { text: "Exemple A", category: "CODAGE JUSTE" },
      { label: "Exemple B", answer: "CODAGE FAUX" },
    ],
  });

  assert.deepEqual(
    plain(quiz.categories.map((category) => category.label)),
    ["CODAGE JUSTE", "CODAGE FAUX"],
  );
  assert.deepEqual(
    plain(quiz.tokens.map((token) => [token.label, token.answer])),
    [
      ["Exemple A", "CODAGE JUSTE"],
      ["Exemple B", "CODAGE FAUX"],
    ],
  );
});

test("compare les réponses structurées indépendamment de l'ordre des clés", () => {
  assert.equal(
    comparable({ second: "B", first: "A" }),
    comparable({ first: "a", second: "b" }),
  );
});
