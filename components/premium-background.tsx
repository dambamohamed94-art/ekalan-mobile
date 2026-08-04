import { PropsWithChildren } from "react";
import { StyleSheet, View } from "react-native";
import { premiumColors } from "../src/theme/premium";

export function PremiumBackground({ children }: PropsWithChildren) {
  return (
    <View style={styles.container}>
      <View style={styles.waveTop} />
      <View style={styles.waveMiddle} />
      <View style={styles.glow} />
      <View style={[styles.star, styles.starOne]} />
      <View style={[styles.star, styles.starTwo]} />
      <View style={[styles.star, styles.starThree]} />
      {children}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    overflow: "hidden",
    backgroundColor: premiumColors.blue900,
  },
  waveTop: {
    position: "absolute",
    width: 390,
    height: 390,
    right: -180,
    top: -210,
    borderRadius: 195,
    backgroundColor: "rgba(14,66,165,0.62)",
    transform: [{ rotate: "18deg" }],
  },
  waveMiddle: {
    position: "absolute",
    width: 480,
    height: 210,
    left: -240,
    bottom: 110,
    borderRadius: 240,
    backgroundColor: "rgba(20,94,204,0.30)",
    transform: [{ rotate: "-16deg" }],
  },
  glow: {
    position: "absolute",
    width: 330,
    height: 330,
    borderRadius: 165,
    alignSelf: "center",
    top: 120,
    backgroundColor: "rgba(0,103,255,0.13)",
  },
  star: {
    position: "absolute",
    width: 7,
    height: 7,
    borderRadius: 4,
    backgroundColor: "#FFD866",
    shadowColor: "#FFD866",
    shadowOpacity: 0.9,
    shadowRadius: 8,
  },
  starOne: { top: "24%", left: "14%" },
  starTwo: { top: "31%", right: "13%", backgroundColor: "#55D7FF" },
  starThree: { bottom: "27%", right: "22%", width: 4, height: 4 },
});
