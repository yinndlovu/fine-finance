import React, { useEffect, useState } from "react";
import {
  KeyboardAvoidingView,
  Platform,
  StyleSheet,
  TextInput,
  TouchableOpacity,
  TouchableWithoutFeedback,
  View,
} from "react-native";
import { useNavigation, useRoute } from "@react-navigation/native";
import { Ionicons } from "@expo/vector-icons";
import { useSafeAreaInsets } from "react-native-safe-area-context";

import { useTheme } from "../context/ThemeContext";
import { useBudget } from "../context/BudgetContext";
import { usePreferences } from "../context/PreferencesContext";
import { AppText } from "../components/AppText";
import { monthLabel } from "../utils/monthUtils";

const SetIncomeScreen: React.FC = () => {
  const navigation = useNavigation<any>();
  const route = useRoute<any>();
  const { theme } = useTheme();
  const insets = useSafeAreaInsets();
  const { setMonthIncome } = useBudget();
  const { currencySymbol } = usePreferences();

  const { monthKey, currentIncome } = route.params as {
    monthKey: string;
    currentIncome: number;
  };

  const [text, setText] = useState(
    currentIncome > 0 ? String(currentIncome) : "",
  );
  const [error, setError] = useState("");

  const handleSave = () => {
    const parsed = parseFloat(text.replace(",", "."));
    if (isNaN(parsed) || parsed < 0) {
      setError("please enter a valid amount.");
      return;
    }
    setMonthIncome(monthKey, parsed);
    navigation.goBack();
  };

  return (
    <View style={styles.root}>
      <TouchableWithoutFeedback onPress={() => navigation.goBack()}>
        <View style={styles.backdrop} />
      </TouchableWithoutFeedback>

      <KeyboardAvoidingView
        behavior={Platform.OS === "ios" ? "padding" : "height"}
        style={styles.kav}
      >
        <View
          style={[
            styles.sheet,
            {
              backgroundColor: theme.card,
              paddingBottom: Math.max(insets.bottom, 24),
            },
          ]}
        >
          <View style={styles.row}>
            <AppText
              variant="bold"
              style={[styles.title, { color: theme.text }]}
            >
              set income
            </AppText>
            <TouchableOpacity onPress={() => navigation.goBack()}>
              <Ionicons name="close" size={24} color={theme.subtext} />
            </TouchableOpacity>
          </View>

          <AppText
            variant="light"
            style={[styles.subtitle, { color: theme.subtext }]}
          >
            {monthLabel(monthKey)} — carries forward to future months.
          </AppText>

          <AppText
            variant="medium"
            style={[styles.label, { color: theme.subtext }]}
          >
            monthly income ({currencySymbol})
          </AppText>
          <TextInput
            value={text}
            onChangeText={(t) => {
              setText(t);
              setError("");
            }}
            placeholder="0.00"
            placeholderTextColor={theme.subtext}
            keyboardType="decimal-pad"
            autoFocus
            style={[
              styles.input,
              {
                color: theme.text,
                borderColor: error ? theme.negative : theme.accent,
                backgroundColor: theme.background,
              },
            ]}
          />

          {!!error && (
            <AppText
              variant="light"
              style={[styles.error, { color: theme.negative }]}
            >
              {error}
            </AppText>
          )}

          <TouchableOpacity
            onPress={handleSave}
            style={[styles.btn, { backgroundColor: theme.positive }]}
          >
            <AppText variant="bold" style={styles.btnText}>
              save income
            </AppText>
          </TouchableOpacity>
        </View>
      </KeyboardAvoidingView>
    </View>
  );
};

const styles = StyleSheet.create({
  root: {
    flex: 1,
    justifyContent: "flex-end",
  },
  backdrop: {
    ...StyleSheet.absoluteFill,
    backgroundColor: "rgba(0,0,0,0.45)",
  },
  kav: {
    width: "100%",
  },
  sheet: {
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    padding: 24,
  },
  row: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 8,
  },
  title: {
    fontSize: 20,
  },
  subtitle: {
    fontSize: 13,
    marginBottom: 20,
  },
  label: {
    fontSize: 12,
    textTransform: "uppercase",
    letterSpacing: 0.6,
    marginBottom: 8,
  },
  input: {
    borderWidth: 1,
    borderRadius: 12,
    paddingHorizontal: 14,
    paddingVertical: 12,
    fontSize: 24,
    marginBottom: 8,
  },
  error: {
    fontSize: 13,
    marginBottom: 8,
  },
  btn: {
    marginTop: 12,
    paddingVertical: 14,
    borderRadius: 14,
    alignItems: "center",
  },
  btnText: {
    color: "white",
    fontSize: 16,
  },
});

export default SetIncomeScreen;
