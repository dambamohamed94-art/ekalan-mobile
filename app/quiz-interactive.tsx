import MaterialIcons from "@expo/vector-icons/MaterialIcons";
import { router, useLocalSearchParams } from "expo-router";
import { useEffect, useRef, useState } from "react";
import {
  ActivityIndicator,
  Modal,
  Pressable,
  StyleSheet,
  Text,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { WebView } from "react-native-webview";
import { colors } from "../src/theme/colors";
import { saveGeneratedQuiz } from "../src/quiz/generatedQuizStore";
import { LearningQuiz } from "../src/types/learning";

const MOBILE_QUIZ_CSS = `
  html,body{width:100%!important;max-width:100%!important;height:auto!important;
    min-height:100%!important;margin:0!important;overflow-x:hidden!important;
    overflow-y:auto!important;-webkit-overflow-scrolling:touch!important;
    background:#12054d!important;}
  body>.ek-header,.ek-header,.ek-game-hero,.ek-lesson-hero,.ek-tabs,
  .ek-bottom-actions{display:none!important;}
  main,.ek-lecture-shell,#lectureApp,.ek-lesson,#ek-tab-panel{
    width:100%!important;max-width:none!important;min-height:0!important;margin:0!important;
    padding:0!important;background:transparent!important;border:0!important;}
  .cm1-game-full{position:relative!important;inset:auto!important;width:100%!important;
    height:auto!important;min-height:100%!important;overflow:visible!important;
    padding:16px 12px 30px!important;box-sizing:border-box!important;}
  .cm1-game-full:before,.cm1-game-full:after,.cm1-bottom-tip{display:none!important;}
  .cm1-space-logo{display:block!important;position:relative!important;left:auto!important;
    top:auto!important;margin:2px 0 18px 8px!important;font-size:24px!important;}
  .cm1-top-pill{display:flex!important;position:relative!important;left:auto!important;
    top:auto!important;transform:none!important;width:calc(100% - 104px)!important;
    min-height:44px!important;height:auto!important;margin:0 0 18px!important;
    padding:8px 14px!important;box-sizing:border-box!important;font-size:15px!important;}
  .cm1-top-xp{right:14px!important;top:12px!important;width:90px!important;
    height:42px!important;font-size:16px!important;}
  .cm1-top-level{right:16px!important;top:66px!important;width:64px!important;
    height:64px!important;}
  .cm1-top-level small{font-size:11px!important}.cm1-top-level strong{font-size:25px!important}
  .cm1-premium-wrap{position:relative!important;left:auto!important;top:auto!important;
    width:100%!important;height:auto!important;display:block!important;transform:none!important;}
  .cm1-full-board{width:100%!important;height:auto!important;min-height:620px!important;
    max-width:none!important;max-height:none!important;border-radius:30px!important;
    padding:30px 18px 26px!important;overflow:visible!important;}
  .cm1-side-rail{display:none!important;}
  .cm1-help-dot{left:14px!important;top:22px!important;width:42px!important;
    height:42px!important;font-size:23px!important;}
  .cm1-scene-hdr{margin:0 0 36px!important;}
  .cm1-scene-hdr-name{min-width:0!important;width:calc(100% - 72px)!important;
    height:auto!important;min-height:62px!important;padding:12px 18px!important;
    box-sizing:border-box!important;border-radius:17px!important;font-size:22px!important;
    line-height:1.15!important;text-align:center!important;}
  .cm1-scene-hdr-name:before,.cm1-scene-hdr-name:after{display:none!important;}
  .cm1-question{font-size:20px!important;margin:0 0 24px!important;line-height:1.35!important;}
  .cm1-game-zone>div[style*='grid-template-columns'],.cm1-choice-grid{
    display:grid!important;grid-template-columns:1fr!important;gap:12px!important;
    margin-bottom:20px!important;}
  .cm1-game-choice{height:auto!important;min-height:76px!important;padding:14px!important;
    border-radius:19px!important;font-size:18px!important;line-height:1.25!important;}
  .cm1-pair-dnd-grid,.cm1-pair-grid{grid-template-columns:1fr 1fr!important;
    gap:9px!important;}
  .cm1-pair-source,.cm1-pair-target{min-height:68px!important;padding:10px 8px!important;
    border-radius:14px!important;font-size:11px!important;}
  .cm1-token-bank{gap:6px!important}.cm1-token{font-size:12px!important;padding:7px 9px!important;}
  .cm1-category-grid{grid-template-columns:1fr!important;}
  .cm1-split{flex-direction:column!important}.cm1-choice-bank{max-width:none!important;
    width:100%!important;box-sizing:border-box!important;}
  .cm1-validate{width:82%!important;max-width:none!important;height:54px!important;
    margin:22px auto 0!important;font-size:19px!important;border-radius:17px!important;}
  .cm1-result-modal{padding:25px 20px 28px!important;border-radius:26px!important;}
  /* Présentation premium Mobile EKALAN */
  .cm1-game-full{background:
    radial-gradient(circle at 88% 8%,rgba(22,163,74,.20),transparent 24%),
    radial-gradient(circle at 8% 74%,rgba(23,76,166,.14),transparent 30%),
    linear-gradient(155deg,#f6f9ff 0%,#e5efff 48%,#ecfbf1 100%)!important;}
  .cm1-space-logo,.cm1-top-pill,.cm1-top-xp,.cm1-top-level,.cm1-help-dot{
    display:none!important;}
  .cm1-premium-wrap{padding-top:20px!important;}
  .cm1-full-board{min-height:0!important;background:transparent!important;
    box-shadow:none!important;padding:0 8px 28px!important;}
  .cm1-scene-hdr{height:auto!important;margin:0 0 24px!important;overflow:visible!important;
    position:relative!important;z-index:5!important;}
  .cm1-scene-hdr>div:last-child{width:100%!important;}
  .cm1-scene-hdr-name{position:relative!important;left:auto!important;top:auto!important;
    transform:none!important;width:auto!important;max-width:300px!important;height:auto!important;
    min-height:54px!important;padding:12px 24px!important;margin:0 auto!important;
    border-radius:18px!important;border:2px solid #2e62b8!important;
    background:linear-gradient(135deg,#174ca6,#16a34a)!important;
    box-shadow:none!important;font-size:19px!important;line-height:1.25!important;
    text-align:center!important;}
  .cm1-scene-hdr-name:before,.cm1-scene-hdr-name:after{display:none!important;}
  .cm1-game-zone{height:auto!important;max-height:none!important;min-height:0!important;
    overflow:visible!important;display:block!important;padding-top:0!important;
    padding-bottom:110px!important;}
  .cm1-question{background:#fff!important;border-radius:28px!important;padding:30px 22px!important;
    margin:0 0 28px!important;box-shadow:0 9px 0 rgba(10,41,104,.20)!important;
    color:#10285f!important;font-size:21px!important;min-height:145px!important;
    display:flex!important;align-items:center!important;justify-content:center!important;}
  .cm1-game-zone>div[style*='grid-template-columns'],.cm1-choice-grid{
    gap:16px!important;}
  .cm1-game-choice{background:#fff!important;border:1px solid rgba(25,70,153,.12)!important;
    min-height:90px!important;border-radius:24px!important;padding:18px 20px!important;
    color:#10285f!important;box-shadow:0 8px 0 rgba(10,41,104,.20)!important;}
  .cm1-game-choice.selected,.cm1-game-choice[data-ek-selected='1']{
    border:4px solid #16a34a!important;background:#effcf3!important;
    box-shadow:0 7px 0 #0d7934!important;}
  .cm1-game-choice img,.cm1-game-choice svg,.ek-mobile-choice-visual img,
  .ek-mobile-choice-visual svg{display:block!important;width:auto!important;max-width:100%!important;
    height:auto!important;max-height:110px!important;margin:0 auto 8px!important;}
  .ek-mobile-choice-visual,.ek-mobile-order-visual,.ek-mobile-pair-visual{
    width:100%!important;min-width:0!important;text-align:center!important;}
  .ek-mobile-pair-visual svg,.ek-mobile-order-visual svg{display:block!important;
    width:100%!important;max-width:150px!important;height:auto!important;max-height:92px!important;
    margin:0 auto 5px!important;}
  .cm1-validate{background:linear-gradient(90deg,#0f4598,#1760bd)!important;
    box-shadow:0 7px 0 #092b67,0 14px 24px rgba(9,43,103,.28)!important;
    position:sticky!important;bottom:14px!important;z-index:20!important;}
  .cm1-pair-source,.cm1-pair-target{background:#fff!important;color:#10285f!important;
    box-shadow:0 6px 0 rgba(10,41,104,.18)!important;}
  .cm1-consigne,.cm1-fill-text,.cm1-game-zone p,.cm1-game-zone label{
    color:#10285f!important;opacity:1!important;}
  .cm1-pair-dnd-grid,.cm1-pair-grid{width:100%!important;grid-template-columns:1fr 1fr!important;
    gap:10px!important;}
  .cm1-pair-sources,.cm1-pair-targets{min-width:0!important;gap:10px!important;}
  .cm1-pair-source,.cm1-pair-target{width:100%!important;min-width:0!important;
    min-height:76px!important;box-sizing:border-box!important;overflow-wrap:anywhere!important;}
  .cm1-token-bank,.cm1-choice-bank{width:100%!important;max-width:none!important;
    min-width:0!important;box-sizing:border-box!important;display:flex!important;
    flex-wrap:wrap!important;justify-content:center!important;}
  .cm1-token,[data-item]{touch-action:none!important;max-width:100%!important;
    box-sizing:border-box!important;overflow-wrap:anywhere!important;}
  .cm1-gap,.cm1-order-slot,.cm1-drop-zone{max-width:100%!important;min-width:70px!important;
    box-sizing:border-box!important;}
  .cm1-order-row{width:100%!important;gap:8px!important;justify-content:center!important;}
  .cm1-category-grid{width:100%!important;grid-template-columns:1fr!important;}
  .cm1-category,.cm1-schema-col{min-width:0!important;width:100%!important;
    box-sizing:border-box!important;}
  .cm1-schema-slots{display:grid!important;grid-template-columns:1fr!important;}
  .cm1-game-zone button,.cm1-game-zone [data-token],.cm1-game-zone [data-item],
  .cm1-game-zone [data-drop],.cm1-game-zone [data-gap],.cm1-game-zone [data-order-slot]{
    -webkit-tap-highlight-color:transparent!important;touch-action:none!important;}
  .cm1-action-row{position:relative!important;inset:auto!important;z-index:1!important;
    width:100%!important;display:flex!important;flex-wrap:wrap!important;
    gap:10px!important;background:rgba(238,247,255,.94)!important;
    border-radius:20px!important;margin:18px 0 8px!important;padding:10px!important;
    box-sizing:border-box!important;}
  .cm1-action-row .cm1-reset,.cm1-action-row .cm1-validate{
    flex:1 1 140px!important;width:auto!important;max-width:none!important;
    min-width:0!important;margin:0!important;}
  .cm1-game-zone>.cm1-validate{
    position:relative!important;inset:auto!important;bottom:auto!important;
    display:flex!important;width:min(100%,320px)!important;margin:22px auto 8px!important;}
  .cm1-endscreen{background:transparent!important;padding:20px 8px!important;}
  .cm1-end-card{border-radius:32px!important;padding:34px 22px!important;
    box-shadow:0 10px 0 rgba(10,41,104,.24)!important;}
  .cm1-score-ring{background:linear-gradient(135deg,#174ca6,#16a34a)!important;}
  @media(max-width:380px){
    .cm1-game-full{padding-left:8px!important;padding-right:8px!important;}
    .cm1-question{font-size:18px!important;padding:24px 16px!important;}
    .cm1-game-choice{font-size:16px!important;padding:14px!important;}
    .cm1-pair-source,.cm1-pair-target{font-size:10px!important;padding:8px 5px!important;}
  }
`;

const INJECT_MOBILE_LAYOUT = `
  (function () {
    if (!window.__ekalanMobileFetchNormalized && window.fetch) {
      window.__ekalanMobileFetchNormalized = true;
      var originalFetch = window.fetch.bind(window);
      var normalizeScenes = function (value) {
        if (!value || typeof value !== 'object') return false;
        var changed = false;
        if (Array.isArray(value)) {
          value.forEach(function (item) {
            if (normalizeScenes(item)) changed = true;
          });
          return changed;
        }
        var type = value.scene_type || value.type;
        if (type === 'choose-answer') {
          if (Array.isArray(value.choices)) {
            var choiceLabels = {};
            value.choices = value.choices.map(function (choice) {
              if (!choice || typeof choice !== 'object') return choice;
              var label = choice.label || choice.text || choice.value || '';
              var visual = choice.image_svg || choice.svg ||
                (choice.image ? '<img src="' + choice.image + '" alt="">' : '');
              var rendered = visual
                ? '<div class="ek-mobile-choice-visual">' + visual + '<strong>' + label + '</strong></div>'
                : label;
              choiceLabels[label] = rendered;
              return rendered;
            });
            if (choiceLabels[value.answer]) value.answer = choiceLabels[value.answer];
            if (choiceLabels[value.correct_answer]) {
              value.correct_answer = choiceLabels[value.correct_answer];
            }
          }
          if (value.illustration_svg && !value.image) value.image = value.illustration_svg;
        }
        if (type === 'true-false') {
          value.choices = ['Vrai', 'Faux'];
          if (typeof value.answer === 'boolean') value.answer = value.answer ? 'Vrai' : 'Faux';
          if (typeof value.correct_answer === 'boolean') {
            value.correct_answer = value.correct_answer ? 'Vrai' : 'Faux';
          }
        }
        if (type === 'pair-match' && Array.isArray(value.pairs)) {
          var pairContent = function (side) {
            if (!side || typeof side !== 'object') return side;
            var label = side.label || side.text || side.value || '';
            var visual = side.image_svg || side.svg || '';
            return visual
              ? '<div class="ek-mobile-pair-visual">' + visual + '<strong>' + label + '</strong></div>'
              : label;
          };
          value.pairs = value.pairs.map(function (pair) {
            return {
              left: pairContent(pair.left),
              right: pairContent(pair.right)
            };
          });
        }
        if (type === 'order-sequence') {
          if (Array.isArray(value.items)) {
            value.items = value.items.map(function (item) {
              if (!item || typeof item !== 'object') return item;
              var label = item.label || item.text || item.value || '';
              var visual = item.image_svg || item.svg || '';
              return visual
                ? '<div class="ek-mobile-order-visual">' + visual + '<strong>' + label + '</strong></div>'
                : label;
            });
          }
          if (Array.isArray(value.answer)) {
            value.answer = value.answer.map(function (item) {
              return item && typeof item === 'object'
                ? (item.label || item.text || item.value || '')
                : item;
            });
          }
        }
        if (type === 'fill-missing') {
          if (!value.text && value.sentence) {
            var blankIndex = 0;
            value.text = String(value.sentence).replace(/_{2,}/g, function () {
              return '{' + (blankIndex++) + '}';
            });
          }
          if (!Array.isArray(value.blanks) || !value.blanks.length) {
            var answers = Array.isArray(value.answer) ? value.answer : [value.answer];
            value.blanks = answers.filter(function (answer) {
              return answer !== undefined && answer !== null;
            }).map(function (answer) {
              return { answer: answer };
            });
          }
          if (!Array.isArray(value.choices) || !value.choices.length) {
            var fillChoices = Array.isArray(value.alternatives)
              ? value.alternatives.slice()
              : [];
            value.blanks.forEach(function (blank) {
              if (fillChoices.indexOf(blank.answer) === -1) fillChoices.push(blank.answer);
            });
            value.choices = fillChoices;
          }
        }
        if ((type === 'click-drop' || type === 'schema-drop') && Array.isArray(value.categories)) {
          var sourceItems = Array.isArray(value.items) ? value.items : [];
          value.categories = value.categories.map(function (category, index) {
            if (category && typeof category === 'object') return category;
            var id = String(category || ('category-' + index));
            var slots = sourceItems.filter(function (item) {
              return (item.answer || item.category) === id;
            }).length;
            return { id: id, label: id, slots: Math.max(1, slots) };
          });
          value.items = sourceItems.map(function (item) {
            return {
              label: item.label || item.text || item.value || '',
              answer: item.answer || item.category || ''
            };
          });
        }
        if (type === 'image-schema-drop') {
          var zones = Array.isArray(value.zones) ? value.zones : [];
          value.type = 'schema-drop';
          value.scene_type = 'schema-drop';
          value.categories = zones.map(function (zone, index) {
            var raw = String(zone || '');
            var parts = raw.split('=');
            return {
              id: raw,
              label: (parts.slice(1).join('=').trim() || parts[0].trim() || ('Zone ' + (index + 1))),
              slots: 1
            };
          });
          value.items = (Array.isArray(value.items) ? value.items : []).map(function (item) {
            return {
              label: item.label || item.text || '',
              answer: item.answer || item.category || ''
            };
          });
          changed = true;
        }
        Object.keys(value).forEach(function (key) {
          if (normalizeScenes(value[key])) changed = true;
        });
        return changed;
      };
      var wrapQuizEngine = function (engine) {
        if (!engine || engine.__ekalanMobileNormalized || !engine.registerPlugin) {
          return engine;
        }
        engine.__ekalanMobileNormalized = true;
        var originalRegisterPlugin = engine.registerPlugin;
        engine.registerPlugin = function (pluginName, blocks) {
          Object.keys(blocks || {}).forEach(function (blockKey) {
            var block = blocks[blockKey];
            Object.keys((block && block.generators) || {}).forEach(function (generatorKey) {
              var generator = block.generators[generatorKey];
              if (typeof generator !== 'function' || generator.__ekalanMobileNormalized) return;
              var wrappedGenerator = function () {
                var question = generator.apply(this, arguments);
                normalizeScenes(question);
                if (question && window.ReactNativeWebView) {
                  window.ReactNativeWebView.postMessage(JSON.stringify({
                    type: 'generated-question',
                    question: question
                  }));
                }
                return question;
              };
              wrappedGenerator.__ekalanMobileNormalized = true;
              block.generators[generatorKey] = wrappedGenerator;
            });
          });
          return originalRegisterPlugin.call(engine, pluginName, blocks);
        };
        if (typeof engine.renderDeck === 'function') {
          var originalRenderDeck = engine.renderDeck;
          engine.renderDeck = function (payload) {
            normalizeScenes(payload);
            var visit = function (value) {
              if (!value || typeof value !== 'object') return;
              if ((value.scene_type || value.type) === 'quiz-generator') {
                value.count = 22;
              }
              Object.keys(value).forEach(function (key) {
                visit(value[key]);
              });
            };
            visit(payload);
            return originalRenderDeck.apply(this, arguments);
          };
        }
        return engine;
      };
      var engineValue;
      try {
        Object.defineProperty(window, 'CM1GameEngine', {
          configurable: true,
          get: function () { return engineValue; },
          set: function (engine) { engineValue = wrapQuizEngine(engine); }
        });
      } catch (_) {}
      window.fetch = function () {
        var args = arguments;
        return originalFetch.apply(null, args).then(function (response) {
          var contentType = response.headers.get('content-type') || '';
          if (contentType.indexOf('application/json') === -1) return response;
          return response.clone().json().then(function (payload) {
            if (!normalizeScenes(payload)) return response;
            return new Response(JSON.stringify(payload), {
              status: response.status,
              statusText: response.statusText,
              headers: response.headers
            });
          }).catch(function () {
            return response;
          });
        });
      };
    }
    var viewport = document.querySelector('meta[name="viewport"]');
    if (!viewport) {
      viewport = document.createElement('meta');
      viewport.name = 'viewport';
      document.head.appendChild(viewport);
    }
    viewport.content = 'width=device-width, initial-scale=1, maximum-scale=1, user-scalable=no';
    var style = document.getElementById('ekalan-mobile-quiz-style');
    if (!style) {
      style = document.createElement('style');
      style.id = 'ekalan-mobile-quiz-style';
    }
    style.textContent = ${JSON.stringify(MOBILE_QUIZ_CSS)};
    document.head.appendChild(style);
    var attempts = 0;
    var keepMobileStyleLast = setInterval(function () {
      if (document.head && style.parentNode) document.head.appendChild(style);
      attempts += 1;
      if (attempts >= 24) clearInterval(keepMobileStyleLast);
    }, 500);
    var reportScore = function () {
      var scoreNode = document.querySelector('.cm1-score-num');
      if (!scoreNode || window.__ekalanScoreReported) return;
      var match = String(scoreNode.textContent || '').match(/(\\d+)\\s*\\/\\s*(\\d+)/);
      if (!match) return;
      window.__ekalanScoreReported = true;
      window.ReactNativeWebView.postMessage(JSON.stringify({
        type: 'quiz-completed',
        score: Number(match[1]),
        total: Number(match[2])
      }));
    };
    new MutationObserver(reportScore).observe(document.documentElement, {
      childList: true,
      subtree: true
    });
    reportScore();
    if (!window.__ekalanMobilePairClick) {
      window.__ekalanMobilePairClick = true;
      var heldPair = null;
      document.addEventListener('click', function (event) {
        var source = event.target.closest('.cm1-pair-source');
        if (source) {
          event.preventDefault();
          event.stopPropagation();
          if (heldPair) heldPair.classList.remove('selected');
          heldPair = source;
          heldPair.classList.add('selected');
          return;
        }
        var target = event.target.closest('.cm1-pair-target');
        if (!target || !heldPair) return;
        event.preventDefault();
        event.stopPropagation();
        var previous = target.querySelector('.cm1-pair-source');
        var sourceColumn = document.querySelector('.cm1-pair-sources');
        if (previous && sourceColumn) {
          sourceColumn.appendChild(previous);
          previous.classList.remove('placed');
        }
        var oldTarget = heldPair.closest('.cm1-pair-target');
        if (oldTarget && oldTarget !== target) oldTarget.classList.remove('filled');
        var content = target.querySelector('.cm1-pair-target-content');
        target.insertBefore(heldPair, content);
        heldPair.classList.remove('selected');
        heldPair.classList.add('placed');
        target.classList.add('filled');
        target.dataset.matched = heldPair.dataset.pair || '';
        heldPair = null;
      }, true);
    }
  })();
  true;
`;

const SCENES = [
  { key: "quiz", label: "Quiz", icon: "help", active: true },
  { key: "course", label: "Cours", icon: "menu-book" },
  { key: "video", label: "Vidéo", icon: "play-circle-outline" },
  { key: "exercise", label: "Exercices", icon: "edit" },
  { key: "revision", label: "Révision", icon: "psychology" },
] as const;

export default function InteractiveQuizPage() {
  const { url, subject, chapter, lessonIndex = "0", lesson = "", mode = "quiz" } =
    useLocalSearchParams<{
      url: string;
      subject: string;
      chapter: string;
      lessonIndex?: string;
      lesson?: string;
      mode?: "quiz" | "exercise";
    }>();
  const webViewRef = useRef<WebView>(null);
  const generatedQuestions = useRef<LearningQuiz[]>([]);
  const generatedNavigationTimer = useRef<ReturnType<typeof setTimeout> | null>(
    null,
  );
  const [retryResult, setRetryResult] = useState<{
    score: number;
    total: number;
  } | null>(null);

  useEffect(
    () => () => {
      if (generatedNavigationTimer.current) {
        clearTimeout(generatedNavigationTimer.current);
      }
    },
    [],
  );

  const openScene = (scene: (typeof SCENES)[number]) => {
    if (scene.key === mode) return;
    router.replace({
      pathname: "/scene",
      params: {
        subject,
        chapter,
        lessonIndex,
        lesson,
        scene: scene.key,
        itemIndex: "0",
      },
    });
  };

  const replayQuiz = () => {
    setRetryResult(null);
    webViewRef.current?.injectJavaScript(`
      window.__ekalanScoreReported = false;
      var replay = document.querySelector('[data-replay-quiz]');
      if (replay) replay.click();
      true;
    `);
  };

  return (
    <SafeAreaView edges={["top", "bottom"]} style={styles.container}>
      <View style={styles.header}>
        <Pressable
          accessibilityLabel="Retour à la leçon"
          accessibilityRole="button"
          onPress={() => router.back()}
          style={styles.backButton}
        >
          <MaterialIcons color={colors.surface} name="arrow-back" size={25} />
        </Pressable>
        <Text style={styles.headerTitle}>
          {mode === "exercise" ? "Exercice EKALAN" : "Quiz EKALAN"}
        </Text>
        <View style={styles.voicePlaceholder}>
          <MaterialIcons color="#A9C5ED" name="volume-up" size={24} />
          <Text style={styles.voiceSoon}>Bientôt</Text>
        </View>
      </View>

      <View style={styles.webviewHost}>
      <WebView
        allowsInlineMediaPlayback
        cacheEnabled={false}
        domStorageEnabled
        injectedJavaScript={INJECT_MOBILE_LAYOUT}
        injectedJavaScriptBeforeContentLoaded={INJECT_MOBILE_LAYOUT}
        javaScriptEnabled
        nestedScrollEnabled
        onLoadEnd={() =>
          webViewRef.current?.injectJavaScript(INJECT_MOBILE_LAYOUT)
        }
        onMessage={(event) => {
          try {
            const message = JSON.parse(event.nativeEvent.data) as {
              type?: string;
              score?: number;
              total?: number;
              question?: LearningQuiz;
            };
            if (message.type === "generated-question" && message.question) {
              generatedQuestions.current.push(message.question);
              if (generatedNavigationTimer.current) {
                clearTimeout(generatedNavigationTimer.current);
              }
              generatedNavigationTimer.current = setTimeout(() => {
                if (!generatedQuestions.current.length) return;
                const generatedKey = saveGeneratedQuiz(
                  generatedQuestions.current,
                );
                router.replace({
                  pathname: "/quiz",
                  params: {
                    subject,
                    chapter,
                    lessonIndex,
                    lesson,
                    generatedKey,
                    mode,
                  },
                });
              }, 350);
              return;
            }
            if (
              message.type === "quiz-completed" &&
              Number(message.total) > 0 &&
              Number(message.score) / Number(message.total) < 16 / 22
            ) {
              setRetryResult({
                score: Number(message.score),
                total: Number(message.total),
              });
            }
          } catch {
            // Les autres messages éventuels du moteur sont ignorés.
          }
        }}
        ref={webViewRef}
        renderLoading={() => (
          <View style={styles.loader}>
            <ActivityIndicator color={colors.primary} size="large" />
            <Text style={styles.loaderText}>Chargement du quiz...</Text>
          </View>
        )}
        sharedCookiesEnabled
        showsVerticalScrollIndicator
        source={{ uri: url }}
        startInLoadingState
        style={styles.hiddenWebview}
        thirdPartyCookiesEnabled
      />
      <View pointerEvents="none" style={styles.generatorLoader}>
        <ActivityIndicator color={colors.primary} size="large" />
        <Text style={styles.generatorTitle}>Préparation du quiz...</Text>
        <Text style={styles.generatorText}>
          EKALAN adapte les questions au format Mobile.
        </Text>
      </View>
      </View>

      <View style={styles.sceneNav}>
        {SCENES.map((scene) => (
          <Pressable
            accessibilityLabel={`Ouvrir ${scene.label}`}
            accessibilityRole="button"
            key={scene.key}
            onPress={() => openScene(scene)}
            style={styles.sceneTab}
          >
            <MaterialIcons
              color={scene.key === mode ? "#FFC400" : "#FFFFFF"}
              name={scene.icon}
              size={25}
            />
            <Text
              style={[
                styles.sceneLabel,
                scene.key === mode && styles.sceneLabelActive,
              ]}
            >
              {scene.label}
            </Text>
          </Pressable>
        ))}
      </View>

      <Modal
        animationType="fade"
        onRequestClose={() => setRetryResult(null)}
        transparent
        visible={retryResult !== null}
      >
        <View style={styles.modalBackdrop}>
          <View style={styles.scoreModal}>
            <View style={styles.scoreBadge}>
              <Text style={styles.scoreValue}>{retryResult?.score}</Text>
              <Text style={styles.scoreTotal}>/{retryResult?.total}</Text>
            </View>
            <Text style={styles.modalTitle}>Tu peux encore progresser !</Text>
            <Text style={styles.modalText}>
              Ton résultat est inférieur au niveau attendu de 16/22. Souhaites-tu
              reprendre le quiz pour améliorer ton score ?
            </Text>
            <Pressable onPress={replayQuiz} style={styles.replayButton}>
              <Text style={styles.replayText}>Recommencer</Text>
            </Pressable>
            <Pressable
              onPress={() => setRetryResult(null)}
              style={styles.laterButton}
            >
              <Text style={styles.laterText}>Plus tard</Text>
            </Pressable>
          </View>
        </View>
      </Modal>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#13064F" },
  header: {
    height: 54,
    alignItems: "center",
    justifyContent: "space-between",
    flexDirection: "row",
    backgroundColor: "#17075C",
    paddingHorizontal: 14,
  },
  backButton: {
    width: 40,
    height: 40,
    alignItems: "center",
    justifyContent: "center",
    borderColor: "#8448FF",
    borderRadius: 14,
    borderWidth: 1,
  },
  headerTitle: { color: colors.surface, fontSize: 18, fontWeight: "900" },
  voicePlaceholder: { width: 54, alignItems: "center", opacity: 0.85 },
  voiceSoon: { color: "#A9C5ED", fontSize: 8, fontWeight: "800" },
  webviewHost: { flex: 1, backgroundColor: "#EFF6FF" },
  hiddenWebview: { flex: 1, opacity: 0 },
  generatorLoader: {
    ...StyleSheet.absoluteFillObject,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#EFF6FF",
    padding: 28,
  },
  generatorTitle: {
    color: colors.textStrong,
    fontSize: 21,
    fontWeight: "900",
    marginTop: 16,
    textAlign: "center",
  },
  generatorText: {
    color: colors.muted,
    fontSize: 14,
    fontWeight: "700",
    lineHeight: 21,
    marginTop: 7,
    textAlign: "center",
  },
  loader: {
    ...StyleSheet.absoluteFillObject,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: colors.background,
  },
  loaderText: { color: colors.muted, fontWeight: "800", marginTop: 12 },
  sceneNav: {
    minHeight: 76,
    alignItems: "center",
    justifyContent: "space-around",
    flexDirection: "row",
    backgroundColor: "#17075C",
    borderTopColor: "#402299",
    borderTopWidth: 1,
    paddingHorizontal: 4,
    paddingTop: 7,
  },
  sceneTab: { flex: 1, alignItems: "center", gap: 3 },
  sceneLabel: { color: "#FFFFFF", fontSize: 10, fontWeight: "700" },
  sceneLabelActive: { color: "#FFC400" },
  modalBackdrop: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "rgba(4,18,55,0.74)",
    padding: 24,
  },
  scoreModal: {
    width: "100%",
    maxWidth: 390,
    alignItems: "center",
    backgroundColor: "#FFFFFF",
    borderRadius: 32,
    padding: 26,
  },
  scoreBadge: {
    width: 116,
    height: 116,
    alignItems: "baseline",
    justifyContent: "center",
    flexDirection: "row",
    backgroundColor: colors.primary,
    borderColor: colors.secondary,
    borderRadius: 58,
    borderWidth: 7,
    marginBottom: 20,
  },
  scoreValue: { color: "#FFFFFF", fontSize: 48, fontWeight: "900" },
  scoreTotal: { color: "#D9E7FF", fontSize: 22, fontWeight: "900" },
  modalTitle: {
    color: colors.textStrong,
    fontSize: 23,
    fontWeight: "900",
    textAlign: "center",
  },
  modalText: {
    color: colors.muted,
    fontSize: 15,
    lineHeight: 22,
    marginTop: 12,
    textAlign: "center",
  },
  replayButton: {
    width: "100%",
    alignItems: "center",
    backgroundColor: colors.primary,
    borderRadius: 18,
    marginTop: 24,
    paddingVertical: 16,
  },
  replayText: { color: "#FFFFFF", fontSize: 17, fontWeight: "900" },
  laterButton: { paddingHorizontal: 20, paddingVertical: 13 },
  laterText: { color: colors.primary, fontSize: 14, fontWeight: "800" },
});
