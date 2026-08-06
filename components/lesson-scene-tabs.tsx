import MaterialIcons from "@expo/vector-icons/MaterialIcons";
import { ScrollView, Pressable, StyleSheet, Text, View } from "react-native";

export type LessonSceneKey = "course" | "video" | "revision" | "quiz" | "exercise";

const ITEMS: {
  key: LessonSceneKey;
  label: string;
  icon: React.ComponentProps<typeof MaterialIcons>["name"];
  color: string;
}[] = [
  { key: "course", label: "Cours", icon: "menu-book", color: "#159447" },
  { key: "video", label: "Vidéo", icon: "smart-display", color: "#1459D9" },
  { key: "revision", label: "Révision", icon: "history-edu", color: "#7C2DCC" },
  { key: "quiz", label: "Quiz", icon: "quiz", color: "#8A20C6" },
  { key: "exercise", label: "Exercices", icon: "draw", color: "#F26322" },
];

export function LessonSceneTabs({
  active,
  onSelect,
}: {
  active: LessonSceneKey;
  onSelect: (scene: LessonSceneKey) => void;
}) {
  return (
    <View style={styles.shell}>
      <ScrollView
        contentContainerStyle={styles.row}
        horizontal
        showsHorizontalScrollIndicator={false}
      >
        {ITEMS.map((item) => {
          const selected = item.key === active;
          return (
            <Pressable
              accessibilityRole="button"
              accessibilityState={{ selected }}
              key={item.key}
              onPress={() => onSelect(item.key)}
              style={({ pressed }) => [
                styles.item,
                selected && { backgroundColor: item.color, borderColor: item.color },
                pressed && styles.pressed,
              ]}
            >
              <MaterialIcons
                color={selected ? "#FFFFFF" : item.color}
                name={item.icon}
                size={22}
              />
              <Text style={[styles.label, selected && styles.labelSelected]}>{item.label}</Text>
            </Pressable>
          );
        })}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  shell: { marginTop: 14 },
  row: { gap: 9, paddingHorizontal: 2, paddingVertical: 5 },
  item: {
    minWidth: 72,
    minHeight: 62,
    alignItems: "center",
    justifyContent: "center",
    gap: 4,
    backgroundColor: "#FFFFFF",
    borderColor: "#E2E8F0",
    borderRadius: 15,
    borderWidth: 1,
    paddingHorizontal: 10,
    shadowColor: "#10285F",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.08,
    shadowRadius: 8,
    elevation: 3,
  },
  label: { color: "#10285F", fontSize: 11, fontWeight: "900" },
  labelSelected: { color: "#FFFFFF" },
  pressed: { opacity: 0.8, transform: [{ scale: 0.97 }] },
});
