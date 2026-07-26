import { useFocusEffect } from "@react-navigation/native";
import { router } from "expo-router";
import { useCallback, useState } from "react";
import {
  ActivityIndicator,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from "react-native";

import { ErrorMessage } from "../../components/error-message";
import { getErrorMessage } from "../../src/api/errorMessage";
import {
  getStudentHome,
  StudentHome,
} from "../../src/services/studentService";
import { getUser } from "../../src/storage/userStorage";
import { colors } from "../../src/theme/colors";
import { User } from "../../src/types/user";

export default function Dashboard() {
  const [user, setUser] = useState<User | null>(null);
  const [studentHome, setStudentHome] = useState<StudentHome | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  useFocusEffect(
    useCallback(() => {
      let active = true;

    const loadUser = async () => {
      setLoading(true);
      setError(null);

      try {
        const u = await getUser();

        if (!active) {
          return;
        }

        setUser(u);

        if (u?.role === "student") {
          const home = await getStudentHome();

          if (active) {
            setStudentHome(home);
          }
        }
      } catch (err: unknown) {
        if (active) {
          setError(
            getErrorMessage(err, "Impossible de charger le tableau de bord."),
          );
        }
      } finally {
        if (active) {
          setLoading(false);
        }
      }
    };

    loadUser();

      return () => {
        active = false;
      };
    }, []),
  );

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color={colors.primary} />
      </View>
    );
  }

  if (user?.role === "parent") {
    return (
      <View style={styles.container}>
        <View style={styles.hero}>
          <Text style={styles.emoji}>👨‍👩‍👧</Text>
          <Text style={styles.title}>Bienvenue parent !</Text>
          <Text style={styles.subtitle}>
            Le compte de votre enfant est en cours de configuration.
          </Text>

          <View style={styles.badge}>
            <Text style={styles.badgeText}>Validation sous 24h ⏳</Text>
          </View>
        </View>

        <View style={styles.card}>
          <Text style={styles.cardTitle}>Suivi enfant</Text>
          <Text style={styles.cardText}>
            L’équipe E-KALAN reliera votre enfant à votre compte après validation.
            Vous pourrez ensuite suivre ses cours, sa progression et ses résultats.
          </Text>
        </View>
      </View>
    );
  }

  if (user?.role === "teacher") {
    return (
      <View style={styles.container}>
        <View style={styles.hero}>
          <Text style={styles.emoji}>👨‍🏫</Text>
          <Text style={styles.title}>Bienvenue enseignant !</Text>
          <Text style={styles.subtitle}>
            Votre espace d’accompagnement est en cours de configuration.
          </Text>

          <View style={styles.badge}>
            <Text style={styles.badgeText}>Profil enseignant ⏳</Text>
          </View>
        </View>

        <View style={styles.card}>
          <Text style={styles.cardTitle}>Accompagnement des élèves</Text>
          <Text style={styles.cardText}>
            Vos élèves et leurs parcours apparaîtront ici après leur liaison à
            votre compte. Vous pourrez ensuite suivre leur progression et les
            accompagner dans leurs apprentissages.
          </Text>
        </View>
      </View>
    );
  }

  if (user?.role === "student") {
    const subjects = studentHome?.subjects ?? [];
    const nextSubject = subjects[0];

    return (
      <ScrollView
        style={styles.scrollContainer}
        contentContainerStyle={styles.studentContent}
      >
        <View style={styles.hero}>
          <Text style={styles.emoji}>🚀</Text>
          <Text style={styles.title}>
            Bonjour {studentHome?.student.first_name || "élève"} !
          </Text>
          <Text style={styles.subtitle}>
            Continue ton apprentissage et garde le cap sur tes objectifs.
          </Text>

          <View style={styles.badge}>
            <Text style={styles.badgeText}>
              {studentHome?.student.class_name || "Classe à confirmer"} 🎒
            </Text>
          </View>
        </View>

        <ErrorMessage message={error} />

        <View style={styles.statsRow}>
          <View style={styles.statCard}>
            <Text style={styles.statValue}>
              {studentHome?.global_progress ?? 0}%
            </Text>
            <Text style={styles.statLabel}>Progression globale</Text>
          </View>

          <View style={styles.statCard}>
            <Text style={styles.statValue}>{subjects.length}</Text>
            <Text style={styles.statLabel}>Matières disponibles</Text>
          </View>
        </View>

        <View style={styles.card}>
          <Text style={styles.cardTitle}>À continuer</Text>
          <Text style={styles.cardText}>
            {nextSubject
              ? `${nextSubject.name} — ${nextSubject.last_lesson || "choisis une leçon pour commencer"}`
              : "Tes matières apparaîtront ici dès qu’elles seront disponibles."}
          </Text>

          <Pressable
            accessibilityLabel="Voir mes cours"
            accessibilityRole="button"
            style={styles.primaryButton}
            onPress={() => router.push("/(tabs)/courses")}
          >
            <Text style={styles.primaryButtonText}>Voir mes cours</Text>
          </Pressable>
        </View>

        <Text style={styles.sectionTitle}>Mes matières</Text>
        {subjects.slice(0, 3).map((subject) => (
          <View key={subject.key} style={styles.subjectCard}>
            <View style={styles.subjectHeader}>
              <Text style={styles.subjectName}>{subject.name}</Text>
              <Text style={styles.subjectProgress}>{subject.progress || 0}%</Text>
            </View>
            <Text style={styles.subjectDescription}>
              {subject.description || "Cours, exercices et quiz disponibles"}
            </Text>
          </View>
        ))}
      </ScrollView>
    );
  }

  return (
    <View style={styles.container}>
      <View style={styles.hero}>
        <Text style={styles.emoji}>🚀</Text>
        <Text style={styles.title}>Ravi de te revoir !</Text>
        <Text style={styles.subtitle}>
          Prêt pour une nouvelle aventure d’apprentissage ?
        </Text>

        <View style={styles.badge}>
          <Text style={styles.badgeText}>{user?.role || "Compte"}</Text>
        </View>
      </View>

      <View style={styles.card}>
        <Text style={styles.cardTitle}>Aujourd’hui</Text>
        <Text style={styles.cardText}>
          Choisis une matière et continue ta progression à ton rythme.
        </Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  scrollContainer: {
    flex: 1,
    backgroundColor: "#F7F1EC",
  },
  studentContent: {
    padding: 22,
    paddingBottom: 30,
  },
  loadingContainer: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#F7F1EC",
  },
  container: {
    flex: 1,
    backgroundColor: "#F7F1EC",
    padding: 22,
  },
  hero: {
    marginTop: 58,
    backgroundColor: colors.primary,
    borderRadius: 34,
    padding: 26,
    alignItems: "center",
  },
  emoji: {
    fontSize: 62,
  },
  title: {
    marginTop: 14,
    fontSize: 30,
    fontWeight: "900",
    color: "#FFFFFF",
    textAlign: "center",
  },
  subtitle: {
    marginTop: 10,
    fontSize: 17,
    lineHeight: 25,
    color: "#DDEBFF",
    fontWeight: "700",
    textAlign: "center",
  },
  badge: {
    marginTop: 22,
    backgroundColor: "#0B2556",
    borderRadius: 999,
    paddingHorizontal: 18,
    paddingVertical: 10,
  },
  badgeText: {
    color: "#FFFFFF",
    fontWeight: "900",
  },
  card: {
    marginTop: 22,
    backgroundColor: "#FFFFFF",
    borderRadius: 28,
    padding: 22,
    shadowColor: "#E5CDB7",
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.9,
    shadowRadius: 0,
    elevation: 5,
  },
  cardTitle: {
    fontSize: 22,
    fontWeight: "900",
    color: "#0F172A",
  },
  cardText: {
    marginTop: 8,
    fontSize: 16,
    lineHeight: 23,
    color: "#64748B",
    fontWeight: "700",
  },
  statsRow: {
    marginTop: 22,
    flexDirection: "row",
    gap: 14,
  },
  statCard: {
    flex: 1,
    minHeight: 120,
    padding: 18,
    alignItems: "center",
    justifyContent: "center",
    borderRadius: 24,
    backgroundColor: "#FFFFFF",
  },
  statValue: {
    color: colors.primary,
    fontSize: 30,
    fontWeight: "900",
  },
  statLabel: {
    marginTop: 6,
    color: "#64748B",
    fontSize: 13,
    lineHeight: 18,
    fontWeight: "800",
    textAlign: "center",
  },
  primaryButton: {
    marginTop: 18,
    paddingVertical: 14,
    alignItems: "center",
    borderRadius: 18,
    backgroundColor: colors.primary,
  },
  primaryButtonText: {
    color: "#FFFFFF",
    fontSize: 16,
    fontWeight: "900",
  },
  sectionTitle: {
    marginTop: 28,
    color: "#0F172A",
    fontSize: 23,
    fontWeight: "900",
  },
  subjectCard: {
    marginTop: 14,
    padding: 18,
    borderRadius: 22,
    backgroundColor: "#FFFFFF",
  },
  subjectHeader: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    gap: 12,
  },
  subjectName: {
    flex: 1,
    color: "#0F172A",
    fontSize: 18,
    fontWeight: "900",
  },
  subjectProgress: {
    color: colors.primary,
    fontSize: 16,
    fontWeight: "900",
  },
  subjectDescription: {
    marginTop: 7,
    color: "#64748B",
    lineHeight: 20,
    fontWeight: "700",
  },
});
