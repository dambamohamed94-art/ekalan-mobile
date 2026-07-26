import AsyncStorage from "@react-native-async-storage/async-storage";
import { User } from "../types/user";

const USER_KEY = "user";
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
  await AsyncStorage.setItem(USER_KEY, JSON.stringify(user));
  notifyUserListeners(user);
}

export async function getUser(): Promise<User | null> {
  const value = await AsyncStorage.getItem(USER_KEY);
  return value ? JSON.parse(value) : null;
}

export async function removeUser() {
  await AsyncStorage.removeItem(USER_KEY);
  notifyUserListeners(null);
}
