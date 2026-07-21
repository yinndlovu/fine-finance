// external
import React, { useState } from "react";
import { StyleSheet, View, TouchableOpacity, TextInput } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useNavigation } from "@react-navigation/native";
import { Ionicons } from "@expo/vector-icons";

// internal
import { useTheme } from "../context/ThemeContext";
import { usePreferences } from "../context/PreferencesContext";
import { AppText } from "../components/AppText";

const SettingsScreen: React.FC = () => {
  const navigation = useNavigation<any>();
  const { theme, themeMode, setThemeMode } = useTheme();
  const insets = useSafeAreaInsets();
  const {
    currencySymbol,
    setCurrencySymbol,
    currencyPosition,
    setCurrencyPosition,
  } = usePreferences();

  const [symbolInput, setSymbolInput] = useState(currencySymbol);

  const handleSymbolBlur = () => {
    const trimmed = symbolInput.trim();
    if (trimmed) {
      setCurrencySymbol(trimmed);
    } else {
      setSymbolInput(currencySymbol);
    }
  };

  return (
    <View
      style={[
        styles.container,
        {
          backgroundColor: theme.background,
          paddingTop: insets.top,
          paddingBottom: insets.bottom,
        },
      ]}
    >
      {/* header */}
      <View style={[styles.header, { paddingHorizontal: 20 }]}>
        <TouchableOpacity
          onPress={() => navigation.goBack()}
          style={styles.backButton}
          accessibilityRole="button"
          accessibilityLabel="Go back"
        >
          <Ionicons name="arrow-back" size={24} color={theme.text} />
        </TouchableOpacity>
        <AppText variant="bold" style={[styles.title, { color: theme.text }]}>
          settings
        </AppText>
        <View style={styles.backButton} />
      </View>

      <View style={styles.body}>
        {/* appearance */}
        <AppText
          variant="medium"
          style={[styles.sectionLabel, { color: theme.subtext }]}
        >
          appearance
        </AppText>
        <View
          style={[
            styles.row,
            { backgroundColor: theme.card, borderColor: theme.accent },
          ]}
        >
          <AppText
            variant="regular"
            style={[styles.rowLabel, { color: theme.text }]}
          >
            theme
          </AppText>
          <View style={styles.segmented}>
            {(
              [
                { mode: "system", label: "auto" },
                { mode: "light", label: "light" },
                { mode: "dark", label: "dark" },
              ] as const
            ).map(({ mode, label }) => (
              <TouchableOpacity
                key={mode}
                onPress={() => setThemeMode(mode)}
                style={[
                  styles.segment,
                  {
                    backgroundColor:
                      themeMode === mode ? theme.primary : theme.accent,
                  },
                ]}
              >
                <AppText
                  variant="medium"
                  style={{
                    color: themeMode === mode ? "white" : theme.subtext,
                    fontSize: 13,
                  }}
                >
                  {label}
                </AppText>
              </TouchableOpacity>
            ))}
          </View>
        </View>

        {/* currency */}
        <AppText
          variant="medium"
          style={[styles.sectionLabel, { color: theme.subtext }]}
        >
          currency
        </AppText>

        <View
          style={[
            styles.row,
            { backgroundColor: theme.card, borderColor: theme.accent },
          ]}
        >
          <AppText
            variant="regular"
            style={[styles.rowLabel, { color: theme.text }]}
          >
            symbol
          </AppText>
          <TextInput
            value={symbolInput}
            onChangeText={setSymbolInput}
            onBlur={handleSymbolBlur}
            style={[
              styles.symbolInput,
              { color: theme.text, borderColor: theme.accent },
            ]}
            maxLength={4}
            selectTextOnFocus
          />
        </View>

        <View
          style={[
            styles.row,
            { backgroundColor: theme.card, borderColor: theme.accent },
          ]}
        >
          <AppText
            variant="regular"
            style={[styles.rowLabel, { color: theme.text }]}
          >
            position
          </AppText>
          <View style={styles.segmented}>
            {(["before", "after"] as const).map((pos) => (
              <TouchableOpacity
                key={pos}
                onPress={() => setCurrencyPosition(pos)}
                style={[
                  styles.segment,
                  {
                    backgroundColor:
                      currencyPosition === pos ? theme.primary : theme.accent,
                  },
                ]}
              >
                <AppText
                  variant="medium"
                  style={{
                    color: currencyPosition === pos ? "white" : theme.subtext,
                    fontSize: 13,
                  }}
                >
                  {pos}
                </AppText>
              </TouchableOpacity>
            ))}
          </View>
        </View>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1 },
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingVertical: 14,
  },
  backButton: {
    width: 44,
    height: 44,
    justifyContent: "center",
  },
  title: { fontSize: 24 },
  body: {
    paddingHorizontal: 20,
    paddingTop: 8,
    gap: 8,
  },
  sectionLabel: {
    fontSize: 11,
    textTransform: "uppercase",
    letterSpacing: 0.8,
    marginTop: 16,
    marginBottom: 4,
  },
  row: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    padding: 16,
    borderRadius: 14,
    borderWidth: 1,
  },
  rowLabel: { fontSize: 15 },
  symbolInput: {
    fontSize: 15,
    borderWidth: 1,
    borderRadius: 8,
    paddingHorizontal: 10,
    paddingVertical: 4,
    minWidth: 50,
    textAlign: "center",
  },
  segmented: {
    flexDirection: "row",
    borderRadius: 10,
    overflow: "hidden",
    gap: 2,
  },
  segment: {
    paddingHorizontal: 14,
    paddingVertical: 6,
    borderRadius: 10,
  },
});

export default SettingsScreen;
