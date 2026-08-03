import MaterialIcons from "@expo/vector-icons/MaterialIcons";
import { isAxiosError } from "axios";
import { useLocalSearchParams } from "expo-router";
import { useCallback, useEffect, useRef, useState } from "react";
import {
  ActivityIndicator,
  FlatList,
  KeyboardAvoidingView,
  Platform,
  Pressable,
  StyleSheet,
  Text,
  TextInput,
  View,
} from "react-native";
import { getErrorMessage } from "../src/api/errorMessage";
import { DataState } from "../components/data-state";
import { goBackOrReplace } from "../src/navigation/goBackOrReplace";
import {
  resolveSackoContext,
  SackoContext,
  SackoTab,
} from "../src/services/sackoContextService";
import {
  askSacko,
  getSackoConfig,
  SackoConfig,
} from "../src/services/sackoService";
import {
  loadSackoConversation,
  saveSackoConversation,
  StoredSackoMessage,
} from "../src/storage/sackoConversationStorage";
import { colors } from "../src/theme/colors";
import {
  classifySackoError,
  SackoErrorState,
} from "../src/utils/sackoError";
import { AnimatedSackoLogo } from "../components/animated-sacko-logo";

type Message = StoredSackoMessage;

const welcomeMessage: Message = {
  id: "welcome",
  role: "sacko",
  text: "Bonjour ! Dis-moi ce que tu veux comprendre. Je te guiderai étape par étape.",
};

export default function SackoChat() {
  const params = useLocalSearchParams<{
    level?: string;
    subject?: string;
    chapter?: string;
    lesson?: string;
    tab?: SackoTab;
    sceneIndex?: string;
    questionId?: string;
    attempted?: string;
    result?: string;
  }>();
  const [messages, setMessages] = useState<Message[]>([welcomeMessage]);
  const [conversationLoaded, setConversationLoaded] = useState(false);
  const [input, setInput] = useState("");
  const [sending, setSending] = useState(false);
  const [context, setContext] = useState<SackoContext | null>(null);
  const [config, setConfig] = useState<SackoConfig | null>(null);
  const [initializing, setInitializing] = useState(true);
  const [initializationError, setInitializationError] = useState<string | null>(
    null,
  );
  const [initializationState, setInitializationState] =
    useState<SackoErrorState | null>(null);
  const listRef = useRef<FlatList<Message>>(null);
  const requestLockRef = useRef(false);

  useEffect(() => {
    let active = true;

    loadSackoConversation()
      .then((stored) => {
        if (active && stored.length) {
          setMessages(stored);
        }
      })
      .finally(() => {
        if (active) {
          setConversationLoaded(true);
        }
      });

    return () => {
      active = false;
    };
  }, []);

  useEffect(() => {
    if (conversationLoaded) {
      void saveSackoConversation(messages);
    }
  }, [conversationLoaded, messages]);

  const initialize = useCallback(async () => {
    setInitializing(true);
    setInitializationError(null);
    setInitializationState(null);

    try {
      const sackoConfig = await getSackoConfig();
      setConfig(sackoConfig);
      setContext(
        await resolveSackoContext({
          level: params.level,
          subject: params.subject,
          chapter: params.chapter,
          lesson: params.lesson,
          tab: params.tab,
          scene_index: Number(params.sceneIndex) || 0,
          question_id: params.questionId,
          attempted: params.attempted === "1",
          result: params.result,
        }),
      );
    } catch (error: unknown) {
      setContext(null);
      setConfig(null);
      const apiMessage = getErrorMessage(error, "");
      const state = classifySackoError({
        status: isAxiosError(error) ? error.response?.status : undefined,
        message:
          error instanceof Error && error.message.startsWith("SACKO_")
            ? error.message
            : apiMessage,
        network: isAxiosError(error) && !error.response,
      });
      setInitializationState(state);
      setInitializationError(state.message);
    } finally {
      setInitializing(false);
    }
  }, [
    params.chapter,
    params.attempted,
    params.lesson,
    params.level,
    params.questionId,
    params.result,
    params.sceneIndex,
    params.subject,
    params.tab,
  ]);

  useEffect(() => {
    void initialize();
  }, [initialize]);

  const requestReply = async (text: string, appendStudent = true) => {
    if (!text || requestLockRef.current || !context) return;
    requestLockRef.current = true;

    if (appendStudent) {
      const studentMessage: Message = {
        id: `student-${Date.now()}`,
        role: "student",
        text,
      };
      setMessages((current) => [...current, studentMessage]);
      setInput("");
    }
    setSending(true);

    try {
      const reply = await askSacko({ message: text, context });
      setConfig((current) =>
        current
          ? { ...current, access_mode: reply.access_mode ?? current.access_mode }
          : current,
      );
      setMessages((current) => [
        ...current,
        { id: `sacko-${Date.now()}`, role: "sacko", text: reply.message },
      ]);
    } catch (error: unknown) {
      const state = classifySackoError({
        status: isAxiosError(error) ? error.response?.status : undefined,
        message: getErrorMessage(error, ""),
        network: isAxiosError(error) && !error.response,
      });
      setMessages((current) => [
        ...current,
        {
          id: `error-${Date.now()}`,
          role: "sacko",
          text: `${state.title}\n${state.message}`,
          failedPrompt: state.retryable ? text : undefined,
        },
      ]);
    } finally {
      requestLockRef.current = false;
      setSending(false);
    }
  };

  const send = () => {
    void requestReply(input.trim());
  };

  const retryMessage = (message: Message) => {
    if (!message.failedPrompt || sending) {
      return;
    }

    setMessages((current) =>
      current.filter((currentMessage) => currentMessage.id !== message.id),
    );
    void requestReply(message.failedPrompt, false);
  };

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === "ios" ? "padding" : "height"}
      style={styles.container}
    >
      <View style={styles.header}>
        <Pressable
          accessibilityLabel="Retour à Sacko"
          accessibilityRole="button"
          onPress={() => goBackOrReplace("/(tabs)/sacko")}
          style={styles.back}
        >
          <MaterialIcons color={colors.primary} name="arrow-back" size={25} />
        </Pressable>
        <AnimatedSackoLogo compact />
        <View style={styles.headerCopy}>
          <Text style={styles.title}>Sacko</Text>
          <Text style={styles.status}>
            {config?.access_mode === "premium"
              ? "Sacko IA · Coach pédagogique EKALAN"
              : "Sacko Basic · Coach pédagogique EKALAN"}
          </Text>
        </View>
      </View>

      {initializing ? (
        <View style={styles.state}>
          <ActivityIndicator color={colors.primary} size="large" />
          <Text style={styles.stateText}>Connexion à Sacko…</Text>
        </View>
      ) : initializationError ? (
        <View style={styles.state}>
          <DataState
            actionLabel="Réessayer"
            message={initializationError}
            onRetry={
              initializationState?.retryable
                ? () => void initialize()
                : undefined
            }
            title={initializationState?.title ?? "Sacko indisponible"}
          />
        </View>
      ) : (
        <FlatList
          ref={listRef}
          contentContainerStyle={styles.messages}
          data={messages}
          keyExtractor={(item) => item.id}
          keyboardDismissMode={Platform.OS === "ios" ? "interactive" : "on-drag"}
          keyboardShouldPersistTaps="handled"
          onContentSizeChange={() =>
            listRef.current?.scrollToEnd({ animated: true })
          }
          renderItem={({ item }) => (
            <View
              style={[
                styles.bubble,
                item.role === "student"
                  ? styles.studentBubble
                  : styles.sackoBubble,
              ]}
            >
              <Text
                style={[
                  styles.message,
                  item.role === "student" && styles.studentMessage,
                ]}
              >
                {item.text}
              </Text>
              {item.failedPrompt ? (
                <Pressable
                  accessibilityLabel="Réessayer cette question"
                  accessibilityRole="button"
                  disabled={sending}
                  onPress={() => retryMessage(item)}
                  style={styles.retry}
                >
                  <MaterialIcons
                    color={colors.primary}
                    name="refresh"
                    size={18}
                  />
                  <Text style={styles.retryText}>Réessayer</Text>
                </Pressable>
              ) : null}
            </View>
          )}
          ListFooterComponent={
            sending ? (
              <View
                accessibilityLiveRegion="polite"
                style={[styles.bubble, styles.sackoBubble, styles.thinking]}
              >
                <ActivityIndicator color={colors.secondary} size="small" />
                <Text style={styles.thinkingText}>Sacko réfléchit…</Text>
              </View>
            ) : null
          }
        />
      )}

      <View style={styles.composer}>
        <TextInput
          accessibilityLabel="Question pour Sacko"
          editable={!sending && Boolean(context)}
          maxLength={2000}
          multiline
          onChangeText={setInput}
          placeholder="Écris ta question…"
          placeholderTextColor="#94A3B8"
          style={styles.input}
          value={input}
        />
        <Pressable
          accessibilityLabel="Envoyer à Sacko"
          accessibilityRole="button"
          disabled={!input.trim() || sending || !context}
          onPress={() => void send()}
          style={[
            styles.send,
            (!input.trim() || sending || !context) && styles.sendDisabled,
          ]}
        >
          {sending ? (
            <ActivityIndicator color={colors.surface} size="small" />
          ) : (
            <MaterialIcons color={colors.surface} name="send" size={22} />
          )}
        </Pressable>
      </View>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.background },
  header: {
    minHeight: 76,
    flexDirection: "row",
    alignItems: "center",
    gap: 11,
    backgroundColor: colors.surface,
    borderBottomColor: "#E6EAF0",
    borderBottomWidth: 1,
    paddingHorizontal: 16,
  },
  back: { padding: 7 },
  headerCopy: { flex: 1 },
  title: { color: colors.textStrong, fontSize: 20, fontWeight: "900" },
  status: { color: colors.secondary, fontSize: 11, fontWeight: "800", marginTop: 2 },
  messages: { gap: 12, padding: 16, paddingBottom: 22 },
  state: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    padding: 20,
  },
  stateText: {
    color: colors.muted,
    fontSize: 14,
    fontWeight: "800",
    marginTop: 12,
  },
  bubble: { maxWidth: "84%", borderRadius: 20, paddingHorizontal: 16, paddingVertical: 13 },
  sackoBubble: { alignSelf: "flex-start", backgroundColor: colors.surface, borderTopLeftRadius: 6 },
  studentBubble: { alignSelf: "flex-end", backgroundColor: colors.primary, borderTopRightRadius: 6 },
  message: { color: colors.text, fontSize: 14, fontWeight: "600", lineHeight: 21 },
  studentMessage: { color: colors.surface },
  retry: {
    alignSelf: "flex-start",
    flexDirection: "row",
    alignItems: "center",
    gap: 5,
    marginTop: 10,
    paddingVertical: 3,
  },
  retryText: { color: colors.primary, fontSize: 12, fontWeight: "900" },
  thinking: { flexDirection: "row", alignItems: "center", gap: 9 },
  thinkingText: {
    color: colors.muted,
    fontSize: 13,
    fontStyle: "italic",
    fontWeight: "700",
  },
  composer: {
    flexDirection: "row",
    alignItems: "flex-end",
    gap: 10,
    backgroundColor: colors.surface,
    borderTopColor: "#E6EAF0",
    borderTopWidth: 1,
    padding: 12,
  },
  input: {
    flex: 1,
    maxHeight: 110,
    minHeight: 48,
    color: colors.text,
    backgroundColor: "#F1F5F9",
    borderRadius: 20,
    fontSize: 14,
    paddingHorizontal: 15,
    paddingVertical: 12,
  },
  send: {
    width: 48,
    height: 48,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: colors.primary,
    borderRadius: 24,
  },
  sendDisabled: { backgroundColor: "#94A3B8" },
});
