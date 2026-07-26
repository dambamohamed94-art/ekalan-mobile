import MaterialIcons from "@expo/vector-icons/MaterialIcons";
import { ComponentProps } from "react";
import { StyleSheet, Text, View } from "react-native";
import { colors } from "../src/theme/colors";

type IconName = ComponentProps<typeof MaterialIcons>["name"];

type TabPlaceholderProps = {
  icon: IconName;
  title: string;
  description: string;
};

export function TabPlaceholder({
  icon,
  title,
  description,
}: TabPlaceholderProps) {
  return (
    <View style={styles.container}>
      <View style={styles.icon}>
        <MaterialIcons color={colors.surface} name={icon} size={48} />
      </View>
      <Text style={styles.title}>{title}</Text>
      <Text style={styles.description}>{description}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: colors.background,
    paddingHorizontal: 28,
  },
  icon: {
    width: 96,
    height: 96,
    alignItems: "center",
    justifyContent: "center",
    borderRadius: 30,
    backgroundColor: colors.primary,
    shadowColor: colors.primaryDark,
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.25,
    shadowRadius: 16,
    elevation: 7,
  },
  title: {
    color: colors.textStrong,
    fontSize: 30,
    fontWeight: "900",
    marginTop: 24,
    textAlign: "center",
  },
  description: {
    color: colors.muted,
    fontSize: 16,
    lineHeight: 24,
    marginTop: 12,
    maxWidth: 380,
    textAlign: "center",
  },
});
