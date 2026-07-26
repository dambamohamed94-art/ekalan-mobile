export type SackoErrorKind =
  | "network"
  | "quota"
  | "access"
  | "context"
  | "unavailable";

export type SackoErrorState = {
  kind: SackoErrorKind;
  title: string;
  message: string;
  retryable: boolean;
};

export function classifySackoError({
  status,
  message = "",
  network = false,
}: {
  status?: number;
  message?: string;
  network?: boolean;
}): SackoErrorState {
  const normalized = message.toLocaleLowerCase("fr");

  if (network) {
    return {
      kind: "network",
      title: "Connexion interrompue",
      message:
        "Sacko ne peut pas joindre le serveur. Vérifie ta connexion puis réessaie.",
      retryable: true,
    };
  }

  if (status === 429 || normalized.includes("quota")) {
    return {
      kind: "quota",
      title: "Pause nécessaire",
      message:
        "Le nombre de demandes autorisées aujourd’hui est atteint. Tu pourras reprendre plus tard.",
      retryable: false,
    };
  }

  if (status === 403 || normalized.includes("premium")) {
    return {
      kind: "access",
      title: "Service avancé indisponible",
      message:
        "Sacko Basic reste inclus. Les fonctions IA avancées nécessitent une autorisation du serveur.",
      retryable: false,
    };
  }

  if (
    normalized.includes("contexte") ||
    normalized.includes("leçon") ||
    normalized.startsWith("sacko_")
  ) {
    return {
      kind: "context",
      title: "Contenu introuvable",
      message:
        "Sacko ne retrouve pas encore cette leçon. Reviens au parcours et ouvre de nouveau l’aide depuis le contenu concerné.",
      retryable: true,
    };
  }

  return {
    kind: "unavailable",
    title: "Sacko se repose un instant",
    message:
      "Le service pédagogique est temporairement indisponible. Ta question est conservée pour une nouvelle tentative.",
    retryable: true,
  };
}
