import { StyleSheet, Text, View } from "react-native";
import { colors } from "../src/theme/colors";

type ErrorMessageProps = {
  message: string | null;
};

export function ErrorMessage({ message }: ErrorMessageProps) {
  if (!message) {
    return null;
  }

  return (
    <View
      accessibilityLiveRegion="assertive"
      accessibilityRole="alert"
      style={styles.container}
    >
      <Text style={styles.text}>{message}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    width: "100%",
    marginVertical: 14,
    padding: 14,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: colors.dangerBorder,
    backgroundColor: colors.dangerBackground,
  },
  text: {
    color: colors.dangerText,
    fontSize: 15,
    lineHeight: 21,
    fontWeight: "700",
    textAlign: "center",
  },
});
