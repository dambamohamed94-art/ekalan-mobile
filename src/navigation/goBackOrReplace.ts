import { Href, router } from "expo-router";

export function goBackOrReplace(fallback: Href) {
  if (router.canGoBack()) {
    router.back();
    return;
  }

  router.replace(fallback);
}
