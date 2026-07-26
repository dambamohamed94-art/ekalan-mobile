import { Image, ImageStyle, StyleProp, StyleSheet } from "react-native";

type BrandLogoProps = {
  size?: number;
  style?: StyleProp<ImageStyle>;
};

export function BrandLogo({ size = 58, style }: BrandLogoProps) {
  return (
    <Image
      accessibilityLabel="Logo EKALAN"
      accessibilityRole="image"
      resizeMode="contain"
      source={require("../assets/images/logo_mobile.png")}
      style={[styles.image, { width: size, height: size }, style]}
    />
  );
}

const styles = StyleSheet.create({
  image: {
    borderRadius: 14,
  },
});
