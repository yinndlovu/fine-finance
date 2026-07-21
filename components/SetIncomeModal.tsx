// external
import React, { useEffect, useState } from "react";
import {
  KeyboardAvoidingView,
  Modal,
  Platform,
  StyleSheet,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useSafeAreaInsets } from "react-native-safe-area-context";

// internal
import { useBudget } from "../context/BudgetContext";
import { useTheme } from "../context/ThemeContext";
import { usePreferences } from "../context/PreferencesContext";
import { AppText } from "./AppText";
import { monthLabel } from "../utils/monthUtils";

interface Props {
  isVisible: boolean;
  monthKey: string;
  currentIncome: number;
  onClose: () => void;
}

const SetIncomeModal: React.FC<Props> = ({
  isVisible,
  monthKey,
  currentIncome,
  onClose,
}) => {
  const { theme } = useTheme();
  const insets = useSafeAreaInsets();
  const { setMonthIncome } = useBudget();
  const { currencySymbol } = usePreferences();
  const [text, setText] = useState("");
  const [error, setError] = useState("");

  useEffect(() => {
    if (isVisible) {
      setText(currentIncome > 0 ? String(currentIncome) : "");
      setError("");
    }
  }, [isVisible, currentIncome]);

  const handleSave = () => {
    const parsed = parseFloat(text.replace(",", "."));
    if (isNaN(parsed) || parsed < 0) {
      setError("please enter a valid amount.");
      return;
    }
    setMonthIncome(monthKey, parsed);
    onClose();
  };

  return (
    <Modal
      visible={isVisible}
      transparent
      animationType="slide"
      onRequestClose={onClose}
    >
      <KeyboardAvoidingView
        style={styles.overlay}
        behavior={Platform.OS === "ios" ? "padding" : undefined}
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
          <View style={styles.header}>
            <AppText
              variant="bold"
              style={[styles.title, { color: theme.text }]}
            >
              set income
            </AppText>
            <TouchableOpacity onPress={onClose}>
              <Ionicons name="close" size={24} color={theme.subtext} />
            </TouchableOpacity>
          </View>

          <AppText
            variant="light"
            style={[styles.subtitle, { color: theme.subtext }]}
          >
            {monthLabel(monthKey)} — this carries forward to future months.
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
    </Modal>
  );
};

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    justifyContent: "flex-end",
    backgroundColor: "rgba(0,0,0,0.4)",
  },
  sheet: {
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    padding: 24,
  },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 8,
  },
  title: { fontSize: 20 },
  subtitle: { fontSize: 13, marginBottom: 20 },
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
  error: { fontSize: 13, marginBottom: 8 },
  btn: {
    marginTop: 12,
    paddingVertical: 14,
    borderRadius: 14,
    alignItems: "center",
  },
  btnText: { color: "white", fontSize: 16 },
});

export default SetIncomeModal;
