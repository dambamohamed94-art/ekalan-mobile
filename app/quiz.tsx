import MaterialIcons from "@expo/vector-icons/MaterialIcons";
import { Image } from "expo-image";
import { router, useLocalSearchParams } from "expo-router";
import { useEffect, useMemo, useRef, useState } from "react";
import {
  comparable,
  NormalizedQuiz,
  normalizeQuiz,
} from "../src/quiz/quizAdapter";
import {
  getGeneratedQuiz,
  removeGeneratedQuiz,
} from "../src/quiz/generatedQuizStore";
import {
  ActivityIndicator,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from "react-native";
import { DataState } from "../components/data-state";
import { ErrorMessage } from "../components/error-message";
import { SackoContextButton } from "../components/sacko-context-button";
import { getErrorMessage } from "../src/api/errorMessage";
import { goBackOrReplace } from "../src/navigation/goBackOrReplace";
import {
  getStudentChapter,
  getStudentLessonExercise,
  getStudentLessonQuiz,
} from "../src/services/learningService";
import {
  answerStudentQuiz,
  completeStudentQuiz,
  createQuizSessionUuid,
  QuizAnswerResult,
  QuizCompletion,
  startStudentQuiz,
  updateStudentQuizIndex,
} from "../src/services/quizService";
import { colors } from "../src/theme/colors";
import {
  LearningQuiz,
  StudentLessonContext,
} from "../src/types/learning";

type InteractionState = {
  selected?: string;
  choice?: string;
  slots: Record<string, string>;
};

const EMPTY_INTERACTION: InteractionState = { slots: {} };

function getQuestionText(question: LearningQuiz) {
  const pair = question.pairs?.[0];
  const base =
    question.question ||
    question.consigne ||
    question.title ||
    question.titre ||
    "Choisis la bonne réponse.";
  return pair ? `${base}\n${String(pair.left)}` : base;
}

function getCorrectAnswer(question: LearningQuiz) {
  if (question.correct_answer !== undefined) return question.correct_answer;
  if (question.bonne_reponse !== undefined) return question.bonne_reponse;
  if (question.pairs?.length) return question.pairs[0].right;
  return "Continuer";
}

function answersMatch(answer: unknown, correctAnswer: unknown) {
  return comparable(answer) === comparable(correctAnswer);
}

function expectedAnswer(question: NormalizedQuiz): unknown {
  if (question.type === "pair") {
    return Object.fromEntries(
      question.pairs.map((pair) => [pair.left.value, pair.right.value]),
    );
  }
  if (question.type === "category") {
    return Object.fromEntries(
      question.tokens.map((token) => [token.value, token.answer ?? ""]),
    );
  }
  if (question.type === "fill") return question.blanks;
  if (question.type === "order") return question.order;
  return question.correctAnswer;
}

function submittedAnswer(
  question: NormalizedQuiz,
  interaction: InteractionState,
): unknown {
  if (question.type === "choice") return interaction.choice;
  if (question.type === "pair") {
    return Object.fromEntries(
      question.pairs.map((pair, index) => {
        const sourceIndex = Number(interaction.slots[`pair-${index}`]);
        return [
          question.pairs[sourceIndex]?.left.value ?? "",
          pair.right.value,
        ];
      }),
    );
  }
  if (question.type === "category") {
    return Object.fromEntries(
      Object.entries(interaction.slots).map(([tokenIndex, categoryId]) => [
        question.tokens[Number(tokenIndex)]?.value ?? "",
        categoryId,
      ]),
    );
  }
  if (question.type === "fill") {
    return question.blanks.map(
      (_, index) =>
        question.choices[Number(interaction.slots[`fill-${index}`])]?.value ?? "",
    );
  }
  if (question.type === "order") {
    return question.order.map(
      (_, index) =>
        question.tokens[Number(interaction.slots[`order-${index}`])]?.value ??
        question.choices[Number(interaction.slots[`order-${index}`])]?.value ??
        "",
    );
  }
  return "";
}

function svgDataUri(svg: string) {
  return `data:image/svg+xml;charset=utf-8,${encodeURIComponent(svg)}`;
}

function QuizVisual({
  item,
  compact = false,
}: {
  item: { image?: string; svg?: string; label: string };
  compact?: boolean;
}) {
  const source = item.svg ? svgDataUri(item.svg) : item.image;
  return (
    <>
      {source ? (
        <Image
          contentFit="contain"
          source={{ uri: source }}
          style={compact ? styles.compactImage : styles.choiceImage}
        />
      ) : null}
      {item.label ? <Text style={styles.optionText}>{item.label}</Text> : null}
    </>
  );
}

export default function QuizPage() {
  const {
    subject,
    chapter,
    quizIndex,
    lessonIndex,
    lesson: lessonId,
    generatedKey,
    mode = "quiz",
  } = useLocalSearchParams<{
    subject: string;
    chapter: string;
    quiz?: string;
    quizIndex?: string;
    lessonIndex?: string;
    lesson?: string;
    generatedKey?: string;
    mode?: "quiz" | "exercise";
  }>();
  const [context, setContext] = useState<StudentLessonContext | null>(null);
  const [questions, setQuestions] = useState<LearningQuiz[]>([]);
  const [externalQuizUrl, setExternalQuizUrl] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [started, setStarted] = useState(false);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [correctAnswers, setCorrectAnswers] = useState(0);
  const [sessionUuid, setSessionUuid] = useState<string | null>(null);
  const [feedback, setFeedback] = useState<QuizAnswerResult | null>(null);
  const [completion, setCompletion] = useState<QuizCompletion | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [actionError, setActionError] = useState<string | null>(null);
  const [interaction, setInteraction] =
    useState<InteractionState>(EMPTY_INTERACTION);
  const [reloadKey, setReloadKey] = useState(0);
  const actionLock = useRef(false);

  useEffect(() => {
    let active = true;
    setLoading(true);
    setError(null);

    const load = async () => {
      try {
        if (lessonIndex !== undefined && lessonIndex !== "") {
          const lessonQuiz =
            mode === "exercise"
              ? await getStudentLessonExercise(
                  subject,
                  chapter,
                  lessonIndex,
                  lessonId,
                )
              : await getStudentLessonQuiz(
                  subject,
                  chapter,
                  lessonIndex,
                  lessonId,
                  quizIndex,
                );
          if (active) {
            setContext(lessonQuiz.context);
            const generated = getGeneratedQuiz(generatedKey);
            setQuestions(generated?.length ? generated : lessonQuiz.questions);
            setExternalQuizUrl(
              generated?.length ? null : (lessonQuiz.externalQuizUrl ?? null),
            );
          }
          return;
        }

        const chapterData = await getStudentChapter(subject, chapter);
        if (active) {
          setQuestions(
            chapterData.quiz_interactifs ?? chapterData.quiz ?? [],
          );
        }
      } catch (loadError: unknown) {
        if (active) {
          setError(getErrorMessage(loadError, "Impossible de charger ce quiz."));
        }
      } finally {
        if (active) setLoading(false);
      }
    };

    void load();
    return () => {
      active = false;
    };
  }, [
    chapter,
    generatedKey,
    lessonId,
    lessonIndex,
    mode,
    quizIndex,
    reloadKey,
    subject,
  ]);

  const question = questions[currentIndex];
  const normalizedQuestion = useMemo(
    () => (question ? normalizeQuiz(question, currentIndex) : null),
    [currentIndex, question],
  );
  const startQuiz = async () => {
    if (actionLock.current) return;
    actionLock.current = true;
    setActionError(null);
    setSubmitting(true);
    try {
      if (context?.lesson.id) {
        const uuid = createQuizSessionUuid();
        await startStudentQuiz({
          session_uuid: uuid,
          class_code: context.student.class_code,
          subject_key: subject,
          chapter_id: chapter,
          lesson_id: String(context.lesson.id),
          total_questions: questions.length,
        });
        setSessionUuid(uuid);
      }
      setStarted(true);
    } catch (startError: unknown) {
      setActionError(
        getErrorMessage(startError, "Impossible de démarrer ce quiz."),
      );
    } finally {
      setSubmitting(false);
      actionLock.current = false;
    }
  };

  const answerQuestion = async (answer: unknown) => {
    if (!question || feedback || submitting || actionLock.current) return;
    actionLock.current = true;
    setActionError(null);
    setSubmitting(true);
    const correctAnswer = normalizedQuestion
      ? expectedAnswer(normalizedQuestion)
      : getCorrectAnswer(question);

    try {
      if (sessionUuid) {
        const result = await answerStudentQuiz({
          session_uuid: sessionUuid,
          question_id: String(question.id ?? `question-${currentIndex + 1}`),
          question_type: question.type || "question",
          question_index: currentIndex,
          answer,
          correct_answer: correctAnswer,
          explanation: question.explication,
          difficulty: question.level,
        });
        setFeedback(result);
        if (result.correct) {
          setCorrectAnswers((value) => value + 1);
        }
      } else {
        const correct = answersMatch(answer, correctAnswer);
        if (correct) {
          setCorrectAnswers((value) => value + 1);
        }
        setFeedback({
          correct,
          xp_earned: 0,
          lives_remaining: 0,
          score_pct: 0,
          answered_questions: currentIndex + 1,
          total_questions: questions.length,
          has_next: currentIndex + 1 < questions.length,
          feedback: {
            status: correct ? "correct" : "incorrect",
            title: correct ? "Bravo !" : "Presque !",
            message: correct
              ? "Tu as trouvé la bonne réponse."
              : "Observe l’explication, puis continue.",
            explanation:
              question.explication ||
              (correct ? "Bonne réponse !" : "Relis attentivement la notion."),
            mascot_state: correct ? "happy" : "encouraging",
            auto_next: false,
            delay_ms: 0,
          },
        });
      }
    } catch (answerError: unknown) {
      setActionError(
        getErrorMessage(answerError, "Impossible d’enregistrer la réponse."),
      );
    } finally {
      setSubmitting(false);
      actionLock.current = false;
    }
  };

  const continueQuiz = async () => {
    if (submitting || actionLock.current) return;
    actionLock.current = true;
    if (currentIndex + 1 < questions.length) {
      setSubmitting(true);
      setActionError(null);
      try {
        if (sessionUuid) {
          await updateStudentQuizIndex(sessionUuid, currentIndex + 1);
        }
        setCurrentIndex((value) => value + 1);
        setFeedback(null);
        setInteraction(EMPTY_INTERACTION);
      } catch (indexError: unknown) {
        setActionError(
          getErrorMessage(
            indexError,
            "Impossible de passer à la question suivante.",
          ),
        );
      } finally {
        setSubmitting(false);
        actionLock.current = false;
      }
      return;
    }

    setSubmitting(true);
    try {
      if (sessionUuid) {
        setCompletion(await completeStudentQuiz(sessionUuid));
      } else {
        setCompletion({
          session_uuid: "",
          status: "completed",
          score_pct: questions.length
            ? (correctAnswers / questions.length) * 100
            : 0,
          correct_answers: correctAnswers,
          answered_questions: questions.length,
          xp_earned: 0,
        });
      }
    } catch (completeError: unknown) {
      setActionError(
        getErrorMessage(completeError, "Impossible de terminer le quiz."),
      );
    } finally {
      setSubmitting(false);
      actionLock.current = false;
    }
  };

  const returnToContext = () =>
    goBackOrReplace(
      lessonIndex
        ? {
            pathname: "/lesson",
            params: {
              subject,
              chapter,
              index: lessonIndex,
              lesson: lessonId ?? "",
            },
          }
        : {
            pathname: "/chapter",
            params: { subject, chapter },
          },
    );

  useEffect(
    () => () => {
      removeGeneratedQuiz(generatedKey);
    },
    [generatedKey],
  );

  const restartQuiz = () => {
    setCompletion(null);
    setFeedback(null);
    setSessionUuid(null);
    setCurrentIndex(0);
    setCorrectAnswers(0);
    setStarted(false);
    setActionError(null);
    setInteraction(EMPTY_INTERACTION);
  };

  const selectOrPlace = (slot: string) => {
    if (!interaction.selected) return;
    setInteraction((value) => ({
      slots: { ...value.slots, [slot]: value.selected ?? "" },
    }));
  };

  const removePlacement = (slot: string) => {
    setInteraction((value) => {
      const slots = { ...value.slots };
      const selected = slots[slot];
      delete slots[slot];
      return { slots, selected };
    });
  };

  const renderToken = (
    item: { label: string; image?: string; svg?: string },
    tokenId: string,
  ) => {
    const placed = Object.values(interaction.slots).includes(tokenId);
    if (placed) return null;
    const selected = interaction.selected === tokenId;
    return (
      <Pressable
        key={tokenId}
        onPress={() =>
          setInteraction((value) => ({
            ...value,
            selected: value.selected === tokenId ? undefined : tokenId,
          }))
        }
        style={[styles.token, selected && styles.tokenSelected]}
      >
        <QuizVisual compact item={item} />
      </Pressable>
    );
  };

  const renderInteractiveQuestion = () => {
    if (!normalizedQuestion) return null;
    const current = normalizedQuestion;

    if (current.type === "choice") {
      return (
        <View style={styles.options}>
          {current.choices.map((option, index) => (
            <Pressable
              key={`${option.value}-${index}`}
              onPress={() =>
                setInteraction({ slots: {}, choice: option.value })
              }
              style={[
                styles.option,
                interaction.choice === option.value && styles.optionSelected,
              ]}
            >
              <Text style={styles.optionIndex}>{index + 1}</Text>
              <QuizVisual item={option} />
            </Pressable>
          ))}
        </View>
      );
    }

    const tokens =
      current.type === "pair"
        ? current.pairs.map((pair) => pair.left)
        : current.type === "order"
          ? current.tokens.length
            ? current.tokens
            : current.choices
          : current.type === "fill"
            ? current.choices
            : current.tokens;

    return (
      <View style={styles.interactionArea}>
        <View style={styles.interactionHelp}>
          <View
            style={[
              styles.stepBadge,
              !interaction.selected && styles.stepBadgeActive,
            ]}
          >
            <Text style={styles.stepNumber}>1</Text>
            <Text style={styles.stepText}>Choisis</Text>
          </View>
          <MaterialIcons color="#7590B8" name="arrow-forward" size={20} />
          <View
            style={[
              styles.stepBadge,
              Boolean(interaction.selected) && styles.stepBadgeActive,
            ]}
          >
            <Text style={styles.stepNumber}>2</Text>
            <Text style={styles.stepText}>Dépose</Text>
          </View>
        </View>
        {current.type === "pair" ? (
          current.pairs.map((pair, index) => {
            const slot = `pair-${index}`;
            const placed = current.pairs[Number(interaction.slots[slot])]?.left;
            return (
              <Pressable
                key={slot}
                onPress={() =>
                  placed ? removePlacement(slot) : selectOrPlace(slot)
                }
                style={styles.targetRow}
              >
                <View style={styles.dropTarget}>
                  <Text style={styles.dropText}>
                    {placed?.label ?? "Sélectionne puis dépose ici"}
                  </Text>
                </View>
                <View style={styles.targetLabel}>
                  <QuizVisual compact item={pair.right} />
                </View>
              </Pressable>
            );
          })
        ) : null}

        {current.type === "fill" ? (
          <>
            <Text style={styles.fillSentence}>{current.text}</Text>
            <View style={styles.slotWrap}>
              {current.blanks.map((_, index) => {
                const slot = `fill-${index}`;
                const placed = current.choices[Number(interaction.slots[slot])];
                return (
                  <Pressable
                    key={slot}
                    onPress={() =>
                      placed ? removePlacement(slot) : selectOrPlace(slot)
                    }
                    style={styles.dropTarget}
                  >
                    <Text style={styles.dropText}>
                      {placed?.label ?? `Trou ${index + 1}`}
                    </Text>
                  </Pressable>
                );
              })}
            </View>
          </>
        ) : null}

        {current.type === "order" ? (
          <View style={styles.slotWrap}>
            {current.order.map((_, index) => {
              const slot = `order-${index}`;
              const placed = tokens[Number(interaction.slots[slot])];
              return (
                <Pressable
                  key={slot}
                  onPress={() =>
                    placed ? removePlacement(slot) : selectOrPlace(slot)
                  }
                  style={styles.dropTarget}
                >
                  <Text style={styles.dropText}>
                    {placed?.label ?? `${index + 1}`}
                  </Text>
                </Pressable>
              );
            })}
          </View>
        ) : null}

        {current.type === "category" ? (
          <View style={styles.categoryGrid}>
            {current.categories.map((category) => {
              const assigned = Object.entries(interaction.slots)
                .filter(([, id]) => id === category.id)
                .map(([tokenIndex]) => current.tokens[Number(tokenIndex)])
                .filter(Boolean);
              return (
                <Pressable
                  key={category.id}
                  onPress={() => {
                    if (!interaction.selected) return;
                    setInteraction((value) => ({
                      slots: {
                        ...value.slots,
                        [value.selected ?? ""]: category.id,
                      },
                    }));
                  }}
                  style={styles.category}
                >
                  <Text style={styles.categoryTitle}>{category.label}</Text>
                  {assigned.map((token) => {
                    const tokenIndex = current.tokens.findIndex(
                      (candidate) => candidate.value === token.value,
                    );
                    return (
                      <Pressable
                        key={token.value}
                        onPress={() => {
                          setInteraction((value) => {
                            const slots = { ...value.slots };
                            delete slots[String(tokenIndex)];
                            return { slots, selected: String(tokenIndex) };
                          });
                        }}
                      >
                        <Text style={styles.categoryToken}>{token.label}</Text>
                      </Pressable>
                    );
                  })}
                </Pressable>
              );
            })}
          </View>
        ) : null}

        <Text style={styles.bankTitle}>
          {interaction.selected
            ? "Élément sélectionné — touche sa destination"
            : "Choisis un élément"}
        </Text>
        <View style={styles.tokenBank}>
          {tokens.map((token, index) => renderToken(token, String(index)))}
        </View>
      </View>
    );
  };

  if (loading) {
    return (
      <View style={styles.center}>
        <ActivityIndicator color={colors.primary} size="large" />
        <Text style={styles.loadingText}>Chargement du quiz...</Text>
      </View>
    );
  }

  if (error) {
    return (
      <View style={styles.center}>
        <DataState
          message={error}
          onRetry={() => setReloadKey((value) => value + 1)}
          title="Chargement impossible"
        />
      </View>
    );
  }

  if (!questions.length) {
    return (
      <View style={styles.center}>
        <DataState
          message={
            externalQuizUrl
              ? `Cet ${
                  mode === "exercise" ? "exercice" : "quiz"
                } utilise le moteur pédagogique interactif EKALAN.`
              : "Aucune question n’est publiée pour cette leçon."
          }
          title={
            externalQuizUrl
              ? mode === "exercise"
                ? "Exercice interactif"
                : "Quiz interactif"
              : mode === "exercise"
                ? "Exercice indisponible"
                : "Quiz indisponible"
          }
        />
        {externalQuizUrl ? (
          <Pressable
            accessibilityLabel="Lancer le quiz interactif"
            accessibilityRole="button"
            onPress={() =>
              router.push({
                pathname: "/quiz-interactive" as never,
                params: {
                  url: externalQuizUrl,
                  subject,
                  chapter,
                  lessonIndex: lessonIndex ?? "0",
                  lesson: lessonId ?? "",
                  mode,
                },
              })
            }
            style={styles.button}
          >
            <Text style={styles.buttonText}>
              {mode === "exercise" ? "Lancer l’exercice" : "Lancer le quiz"}
            </Text>
          </Pressable>
        ) : null}
        <Pressable onPress={returnToContext}>
          <Text style={styles.backLink}>Retour</Text>
        </Pressable>
      </View>
    );
  }

  if (completion) {
    const total = Math.max(completion.answered_questions, questions.length);
    const shouldRetry =
      total > 0 && completion.correct_answers / total < 16 / 22;
    return (
      <View style={styles.resultScreen}>
        <View style={styles.resultIcon}>
          <MaterialIcons color={colors.secondary} name="emoji-events" size={58} />
        </View>
        <Text style={styles.resultTitle}>
          {mode === "exercise" ? "Exercice terminé !" : "Quiz terminé !"}
        </Text>
        <Text style={styles.resultScore}>{Math.round(completion.score_pct)}%</Text>
        <Text style={styles.resultText}>
          {completion.correct_answers} bonne(s) réponse(s) sur{" "}
          {total}
        </Text>
        {shouldRetry ? (
          <>
            <Text style={styles.retryMessage}>
              Ton résultat est inférieur au niveau attendu de 16/22. Veux-tu
              reprendre le quiz ?
            </Text>
            <Pressable onPress={restartQuiz} style={styles.retryButton}>
              <Text style={styles.buttonText}>Recommencer</Text>
            </Pressable>
          </>
        ) : null}
        <Pressable onPress={returnToContext} style={styles.button}>
          <Text style={styles.buttonText}>Continuer mon parcours</Text>
        </Pressable>
      </View>
    );
  }

  return (
    <ScrollView contentContainerStyle={styles.content} style={styles.container}>
      <Pressable onPress={returnToContext} style={styles.backButton}>
        <MaterialIcons color={colors.primary} name="arrow-back" size={24} />
        <Text style={styles.backText}>Retour</Text>
      </Pressable>

      <SackoContextButton
        chapter={chapter}
        compact
        lesson={String(context?.lesson?.id ?? lessonId ?? "")}
        level={context?.student?.class_code}
        questionId={
          started && question?.id !== undefined ? String(question.id) : undefined
        }
        attempted={Boolean(feedback)}
        result={
          feedback ? (feedback.correct ? "correct" : "incorrect") : undefined
        }
        sceneIndex={currentIndex}
        subject={subject}
        tab={mode === "exercise" ? "exercices" : "quiz"}
      />

      {!started ? (
        <View style={styles.introCard}>
          <MaterialIcons color={colors.surface} name="quiz" size={66} />
          <Text style={styles.introTitle}>
            {mode === "exercise" ? "Prêt pour l’exercice ?" : "Prêt pour le quiz ?"}
          </Text>
          <Text style={styles.introText}>
            {questions.length} question(s) pour tester tes connaissances.
          </Text>
          <ErrorMessage message={actionError} />
          <Pressable
            disabled={submitting}
            onPress={startQuiz}
            style={styles.startButton}
          >
            {submitting ? (
              <ActivityIndicator color={colors.primary} />
            ) : (
              <Text style={styles.startButtonText}>Commencer</Text>
            )}
          </Pressable>
        </View>
      ) : (
        <>
          <View style={styles.progressRow}>
            <Text style={styles.progressText}>
              Question {currentIndex + 1}/{questions.length}
            </Text>
            <View style={styles.progressTrack}>
              <View
                style={[
                  styles.progressFill,
                  {
                    width: `${((currentIndex + 1) / questions.length) * 100}%`,
                  },
                ]}
              />
            </View>
            <View style={styles.audioPlaceholder}>
              <MaterialIcons color={colors.primary} name="volume-up" size={27} />
              <Text style={styles.audioSoon}>Audio</Text>
              <Text style={styles.audioStatus}>Bientôt</Text>
            </View>
          </View>

          <View style={styles.questionCard}>
            <Text style={styles.sceneTitle}>
              {normalizedQuestion?.title ?? "Quiz EKALAN"}
            </Text>
            {normalizedQuestion?.visual ? (
              <View style={styles.questionVisual}>
                <QuizVisual item={normalizedQuestion.visual} />
              </View>
            ) : null}
            <Text style={styles.question}>
              {normalizedQuestion?.prompt ||
                normalizedQuestion?.instruction ||
                getQuestionText(question)}
            </Text>
            {renderInteractiveQuestion()}
            {!feedback ? (
              <Pressable
                disabled={submitting}
                onPress={() =>
                  normalizedQuestion
                    ? void answerQuestion(
                        submittedAnswer(normalizedQuestion, interaction),
                      )
                    : undefined
                }
                style={styles.validateButton}
              >
                <Text style={styles.buttonText}>Valider ✓</Text>
              </Pressable>
            ) : null}
          </View>

          {submitting ? (
            <ActivityIndicator color={colors.primary} style={styles.loader} />
          ) : null}
          <ErrorMessage message={actionError} />

          {feedback ? (
            <View
              style={[
                styles.feedback,
                feedback.correct
                  ? styles.feedbackCorrect
                  : styles.feedbackIncorrect,
              ]}
            >
              <Text style={styles.feedbackTitle}>{feedback.feedback.title}</Text>
              <Text style={styles.feedbackText}>
                {feedback.feedback.explanation}
              </Text>
              <Pressable onPress={() => void continueQuiz()} style={styles.button}>
                <Text style={styles.buttonText}>
                  {currentIndex + 1 < questions.length ? "Question suivante" : "Voir mon résultat"}
                </Text>
              </Pressable>
            </View>
          ) : null}
        </>
      )}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#EAF2FF" },
  content: { flexGrow: 1, padding: 18, paddingBottom: 110 },
  center: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: colors.background,
    padding: 24,
  },
  loadingText: { color: colors.muted, fontWeight: "800", marginTop: 12 },
  backButton: {
    alignSelf: "flex-start",
    flexDirection: "row",
    alignItems: "center",
    gap: 7,
    marginBottom: 18,
    paddingVertical: 8,
  },
  backText: { color: colors.primary, fontSize: 15, fontWeight: "900" },
  introCard: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: colors.primary,
    borderRadius: 32,
    padding: 28,
  },
  introTitle: {
    color: colors.surface,
    fontSize: 29,
    fontWeight: "900",
    marginTop: 22,
    textAlign: "center",
  },
  introText: {
    color: "#DDEBFF",
    fontSize: 16,
    fontWeight: "700",
    lineHeight: 24,
    marginTop: 10,
    textAlign: "center",
  },
  startButton: {
    minHeight: 58,
    width: "100%",
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: colors.surface,
    borderRadius: 22,
    marginTop: 28,
  },
  startButtonText: { color: colors.primary, fontSize: 17, fontWeight: "900" },
  progressRow: {
    width: 112,
    height: 112,
    alignSelf: "center",
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#254EA5",
    borderColor: colors.secondary,
    borderRadius: 56,
    borderWidth: 8,
    marginBottom: 28,
    position: "relative",
  },
  progressText: {
    maxWidth: 82,
    color: colors.surface,
    fontSize: 16,
    fontWeight: "900",
    textAlign: "center",
  },
  progressTrack: {
    width: 68,
    height: 5,
    overflow: "hidden",
    backgroundColor: "rgba(255,255,255,0.22)",
    borderRadius: 4,
    marginTop: 7,
  },
  progressFill: { height: "100%", backgroundColor: colors.secondary },
  questionCard: {
    backgroundColor: "transparent",
  },
  sceneTitle: {
    alignSelf: "center",
    overflow: "hidden",
    color: colors.surface,
    backgroundColor: colors.secondary,
    borderColor: colors.primary,
    borderRadius: 18,
    borderWidth: 2,
    fontSize: 18,
    fontWeight: "900",
    marginBottom: 18,
    paddingHorizontal: 22,
    paddingVertical: 12,
    textAlign: "center",
  },
  question: {
    color: "#10285F",
    backgroundColor: colors.surface,
    borderRadius: 28,
    fontSize: 21,
    fontWeight: "900",
    lineHeight: 30,
    minHeight: 150,
    paddingHorizontal: 22,
    paddingVertical: 30,
    textAlign: "center",
    textAlignVertical: "center",
    elevation: 7,
  },
  options: { gap: 16, marginTop: 28 },
  option: {
    minHeight: 84,
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    backgroundColor: colors.surface,
    borderColor: "rgba(18,59,143,0.12)",
    borderRadius: 24,
    borderWidth: 1,
    padding: 16,
    elevation: 6,
  },
  optionPressed: { opacity: 0.75 },
  optionSelected: {
    borderColor: colors.secondary,
    borderWidth: 3,
    backgroundColor: "#E9FAEF",
  },
  optionIndex: {
    width: 34,
    height: 34,
    color: colors.primary,
    backgroundColor: "#EAF1FF",
    borderRadius: 11,
    fontSize: 14,
    fontWeight: "900",
    lineHeight: 34,
    textAlign: "center",
  },
  optionText: { flex: 1, color: "#10285F", fontSize: 17, fontWeight: "900" },
  choiceImage: { width: 82, height: 68, marginRight: 8 },
  compactImage: { width: 68, height: 54, marginBottom: 5 },
  questionVisual: {
    minHeight: 130,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: colors.surface,
    borderRadius: 24,
    marginBottom: 16,
    padding: 14,
  },
  interactionArea: { gap: 14, marginTop: 22 },
  interactionHelp: {
    alignItems: "center",
    justifyContent: "center",
    flexDirection: "row",
    gap: 9,
    marginBottom: 3,
  },
  stepBadge: {
    alignItems: "center",
    flexDirection: "row",
    gap: 6,
    backgroundColor: "#E7EEF9",
    borderRadius: 18,
    paddingHorizontal: 12,
    paddingVertical: 8,
  },
  stepBadgeActive: {
    backgroundColor: "#E4F7EA",
    borderColor: colors.secondary,
    borderWidth: 2,
  },
  stepNumber: {
    width: 22,
    height: 22,
    color: colors.surface,
    backgroundColor: colors.primary,
    borderRadius: 11,
    fontSize: 12,
    fontWeight: "900",
    lineHeight: 22,
    textAlign: "center",
  },
  stepText: { color: "#10285F", fontSize: 13, fontWeight: "900" },
  targetRow: {
    flexDirection: "row",
    alignItems: "stretch",
    gap: 10,
  },
  dropTarget: {
    flex: 1,
    minHeight: 66,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#F7F3FF",
    borderColor: "#7A42DD",
    borderRadius: 17,
    borderStyle: "dashed",
    borderWidth: 2,
    padding: 10,
  },
  dropText: {
    color: "#563394",
    fontSize: 14,
    fontWeight: "800",
    textAlign: "center",
  },
  targetLabel: {
    flex: 1,
    minHeight: 66,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: colors.surface,
    borderRadius: 17,
    padding: 10,
  },
  fillSentence: {
    color: "#10285F",
    fontSize: 18,
    fontWeight: "800",
    lineHeight: 27,
    textAlign: "center",
  },
  slotWrap: {
    flexDirection: "row",
    flexWrap: "wrap",
    justifyContent: "center",
    gap: 9,
  },
  categoryGrid: { gap: 12 },
  category: {
    minHeight: 112,
    backgroundColor: colors.surface,
    borderColor: colors.secondary,
    borderRadius: 20,
    borderStyle: "dashed",
    borderWidth: 2,
    padding: 12,
  },
  categoryTitle: {
    color: colors.primary,
    fontSize: 16,
    fontWeight: "900",
    marginBottom: 8,
    textAlign: "center",
  },
  categoryToken: {
    color: "#10285F",
    backgroundColor: "#EAF2FF",
    borderRadius: 10,
    fontWeight: "800",
    marginTop: 5,
    padding: 8,
    textAlign: "center",
  },
  bankTitle: {
    color: "#10285F",
    fontSize: 13,
    fontWeight: "800",
    textAlign: "center",
  },
  tokenBank: {
    flexDirection: "row",
    flexWrap: "wrap",
    justifyContent: "center",
    gap: 9,
    backgroundColor: "rgba(255,255,255,0.58)",
    borderRadius: 20,
    padding: 12,
  },
  token: {
    minHeight: 48,
    minWidth: 80,
    maxWidth: "100%",
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: colors.surface,
    borderColor: "#C8D7EE",
    borderRadius: 14,
    borderWidth: 2,
    padding: 10,
  },
  tokenSelected: {
    borderColor: colors.secondary,
    backgroundColor: "#E4F7EA",
  },
  validateButton: {
    minHeight: 56,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: colors.primary,
    borderRadius: 20,
    marginBottom: 20,
    marginTop: 24,
  },
  loader: { marginTop: 16 },
  feedback: { borderRadius: 22, marginTop: 18, padding: 18 },
  feedbackCorrect: { backgroundColor: "#E4F7EA" },
  feedbackIncorrect: { backgroundColor: "#FFF0E5" },
  feedbackTitle: { color: colors.textStrong, fontSize: 19, fontWeight: "900" },
  feedbackText: { color: colors.text, fontSize: 14, lineHeight: 21, marginTop: 6 },
  button: {
    minHeight: 54,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: colors.primary,
    borderRadius: 20,
    marginTop: 20,
    paddingHorizontal: 24,
  },
  buttonText: { color: colors.surface, fontSize: 15, fontWeight: "900" },
  backLink: {
    color: colors.primary,
    fontSize: 16,
    fontWeight: "900",
    marginTop: 18,
    paddingHorizontal: 18,
    paddingVertical: 8,
  },
  resultIcon: {
    width: 110,
    height: 110,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#E4F7EA",
    borderRadius: 55,
  },
  resultTitle: {
    color: colors.surface,
    fontSize: 29,
    fontWeight: "900",
    marginTop: 22,
  },
  resultScore: {
    color: "#7EE49E",
    fontSize: 48,
    fontWeight: "900",
    marginTop: 8,
  },
  resultText: { color: "#DCE9FF", fontSize: 15, fontWeight: "700" },
  audioPlaceholder: {
    position: "absolute",
    right: -112,
    top: 13,
    width: 72,
    minHeight: 72,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: colors.surface,
    borderColor: colors.primary,
    borderRadius: 22,
    borderWidth: 2,
    elevation: 5,
  },
  audioSoon: { color: colors.primary, fontSize: 10, fontWeight: "900" },
  audioStatus: { color: colors.muted, fontSize: 8, fontWeight: "800" },
  resultScreen: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#123B8F",
    padding: 24,
  },
  retryMessage: {
    maxWidth: 340,
    color: "#DCE9FF",
    fontSize: 15,
    lineHeight: 22,
    marginTop: 18,
    textAlign: "center",
  },
  retryButton: {
    minHeight: 56,
    width: "100%",
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: colors.secondary,
    borderRadius: 20,
    marginTop: 22,
    paddingHorizontal: 24,
  },
});
