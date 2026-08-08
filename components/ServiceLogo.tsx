import React, { useState } from "react";
import { Image, StyleSheet, View } from "react-native";
import { AppText } from "./AppText";
import { useTheme } from "../context/ThemeContext";

interface Props {
  uri: string;
  name: string;
  size?: number;
}

/**
 * Renders a service logo from a URI (Clearbit URL or local file).
 * Falls back to a colored initial circle if the image fails to load.
 */
const ServiceLogo: React.FC<Props> = ({ uri, name, size = 44 }) => {
  const { theme } = useTheme();
  const [failed, setFailed] = useState(false);

  const initial = name.charAt(0).toUpperCase();
  const borderRadius = size * 0.25;

  if (failed || !uri) {
    return (
      <View
        style={[
          styles.fallback,
          {
            width: size,
            height: size,
            borderRadius,
            backgroundColor: theme.primary,
          },
        ]}
      >
        <AppText
          variant="bold"
          style={{ color: "white", fontSize: size * 0.4 }}
        >
          {initial}
        </AppText>
      </View>
    );
  }

  return (
    <Image
      source={{ uri }}
      style={[styles.image, { width: size, height: size, borderRadius }]}
      onError={() => setFailed(true)}
      resizeMode="contain"
    />
  );
};

const styles = StyleSheet.create({
  image: {
    backgroundColor: "white",
  },
  fallback: {
    alignItems: "center",
    justifyContent: "center",
  },
});

export default ServiceLogo;
