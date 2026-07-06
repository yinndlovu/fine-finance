// external
import React from "react";
import { Text, TextProps } from "react-native";

// types
type FontVariant = "bold" | "medium" | "regular" | "italic" | "light";

interface AppTextProps extends TextProps {
  variant?: FontVariant;
}

export const AppText: React.FC<AppTextProps> = ({
  style,
  variant = "regular",
  ...props
}) => {
  const fontFamilyMap: Record<FontVariant, string> = {
    bold: "App-Bold",
    medium: "App-Medium",
    regular: "App-Regular",
    italic: "App-Italic",
    light: "App-Light",
  };

  return (
    <Text {...props} style={[{ fontFamily: fontFamilyMap[variant] }, style]} />
  );
};
