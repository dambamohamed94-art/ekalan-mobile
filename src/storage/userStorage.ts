import AsyncStorage from "@react-native-async-storage/async-storage";
import { User } from "../types/user";
import { clearSackoConversation } from "./sackoConversationStorage";

const USER_KEY = "user";
const SESSION_RESTORE_BLOCKED_KEY = "session-restore-blocked";
type UserListener = (user: User | null) => void;

const userListeners = new Set<UserListener>();

function notifyUserListeners(user: User | null) {
  userListeners.forEach((listener) => listener(user));
}

export function subscribeToUserChanges(listener: UserListener) {
  userListeners.add(listener);

  return () => {
    userListeners.delete(listener);
  };
}

export async function saveUser(user: User) {
  const currentUser = await getUser();
  if (currentUser && currentUser.id !== user.id) {
    await clearSackoConversation();
  }
  await Promise.all([
    AsyncStorage.setItem(USER_KEY, JSON.stringify(user)),
    AsyncStorage.removeItem(SESSION_RESTORE_BLOCKED_KEY),
  ]);
  notifyUserListeners(user);
}

export async function getUser(): Promise<User | null> {
  const value = await AsyncStorage.getItem(USER_KEY);
  if (!value) return null;

  try {
    const user = JSON.parse(value) as Partial<User>;
    if (
      !Number.isInteger(Number(user.id)) ||
      !["student", "parent", "teacher", "admin"].includes(user.role ?? "")
    ) {
      await AsyncStorage.removeItem(USER_KEY);
      return null;
    }
    return user as User;
  } catch {
    await AsyncStorage.removeItem(USER_KEY);
    return null;
  }
}

export async function isSessionRestoreBlocked() {
  return (await AsyncStorage.getItem(SESSION_RESTORE_BLOCKED_KEY)) === "1";
}

export async function removeUser() {
  await Promise.all([
    AsyncStorage.removeItem(USER_KEY),
    AsyncStorage.setItem(SESSION_RESTORE_BLOCKED_KEY, "1"),
    clearSackoConversation(),
  ]);
  notifyUserListeners(null);
}
