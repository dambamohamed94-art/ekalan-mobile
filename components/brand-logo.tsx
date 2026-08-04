import { Image } from "expo-image";
import { ImageStyle, StyleProp, StyleSheet } from "react-native";

type BrandLogoProps = {
  size?: number;
  style?: StyleProp<ImageStyle>;
};

export function BrandLogo({ size = 58, style }: BrandLogoProps) {
  return (
    <Image
      accessibilityLabel="Logo EKALAN"
      accessibilityRole="image"
      contentFit="contain"
      source={require("../assets/images/ekalan-logo-official.svg")}
      style={[styles.image, { width: size, height: size }, style]}
    />
  );
}

const styles = StyleSheet.create({
  image: {
    borderRadius: 14,
  },
});
