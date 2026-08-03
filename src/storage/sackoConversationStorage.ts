import AsyncStorage from "@react-native-async-storage/async-storage";

const SACKO_CONVERSATION_KEY = "sacko-conversation-v1";
const MAX_MESSAGES = 50;
const TECHNICAL_ERROR_PATTERN =
  /exception ia|route inconnue|fatal php|empty_sacko|sacko_.*unavailable/i;

export type StoredSackoMessage = {
  id: string;
  role: "student" | "sacko";
  text: string;
  failedPrompt?: string;
};

export async function loadSackoConversation(): Promise<StoredSackoMessage[]> {
  try {
    const value = await AsyncStorage.getItem(SACKO_CONVERSATION_KEY);
    const parsed = value ? JSON.parse(value) : [];

    if (!Array.isArray(parsed)) {
      return [];
    }

    return parsed
      .filter(
        (message): message is StoredSackoMessage =>
          Boolean(message) &&
          typeof message.id === "string" &&
          ["student", "sacko"].includes(message.role) &&
          typeof message.text === "string",
      )
      .map((message) =>
        message.role === "sacko" && TECHNICAL_ERROR_PATTERN.test(message.text)
          ? {
              ...message,
              text: "Sacko se repose un instant\nLe service pédagogique est temporairement indisponible. Tu peux réessayer cette question.",
            }
          : message,
      )
      .slice(-MAX_MESSAGES);
  } catch {
    return [];
  }
}

export async function saveSackoConversation(
  messages: StoredSackoMessage[],
) {
  try {
    await AsyncStorage.setItem(
      SACKO_CONVERSATION_KEY,
      JSON.stringify(messages.slice(-MAX_MESSAGES)),
    );
  } catch {
    // La conversation reste utilisable en mémoire si le stockage est indisponible.
  }
}

export async function clearSackoConversation() {
  try {
    await AsyncStorage.removeItem(SACKO_CONVERSATION_KEY);
  } catch {
    // La déconnexion doit continuer même si le stockage local est indisponible.
  }
}
