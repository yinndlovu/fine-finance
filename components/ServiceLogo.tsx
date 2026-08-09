import React, { useState } from "react";
import { Image, ImageSourcePropType, StyleSheet, View } from "react-native";
import { AppText } from "./AppText";
import { useTheme } from "../context/ThemeContext";

interface Props {
  uri: string | ImageSourcePropType;
  name: string;
  size?: number;
}

/**
 * Renders a service logo from a URI or a local image asset.
 * Falls back to a colored initial circle if the image fails to load.
 */
const ServiceLogo: React.FC<Props> = ({ uri, name, size = 44 }) => {
  const { theme } = useTheme();
  const [failed, setFailed] = useState(false);

  const initial = name.charAt(0).toUpperCase();
  const borderRadius = size * 0.25;
  const source = typeof uri === "string" ? { uri } : uri;

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
    <View
      style={[
        styles.wrapper,
        {
          width: size,
          height: size,
          borderRadius,
          backgroundColor: "transparent",
        },
      ]}
    >
      <Image
        source={source}
        style={styles.image}
        onError={() => setFailed(true)}
        resizeMode="center"
      />
    </View>
  );
};

const styles = StyleSheet.create({
  wrapper: {
    alignItems: "center",
    justifyContent: "center",
    overflow: "hidden",
  },
  image: {
    width: "100%",
    height: "100%",
  },
  fallback: {
    alignItems: "center",
    justifyContent: "center",
  },
});

export default ServiceLogo;
