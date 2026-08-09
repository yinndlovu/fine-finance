// external
import React, { useEffect, useState } from "react";
import {
  KeyboardAvoidingView,
  ScrollView,
  StyleSheet,
  TextInput,
  TouchableOpacity,
  TouchableWithoutFeedback,
  View,
} from "react-native";
import { useNavigation, useRoute } from "@react-navigation/native";
import { Ionicons } from "@expo/vector-icons";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import "react-native-get-random-values";
import { v4 as uuidv4 } from "uuid";

// internal
import { useTheme } from "../context/ThemeContext";
import { useBudget } from "../context/BudgetContext";
import { AppText } from "../components/AppText";
import { BudgetItem } from "../types/budget";
import { fromMonthKey } from "../utils/monthUtils";
import { CATEGORIES } from "../constants/Categories";

const AddItemScreen: React.FC = () => {
  // hook variables
  const navigation = useNavigation<any>();
  const route = useRoute<any>();
  const { theme } = useTheme();
  const insets = useSafeAreaInsets();
  const { addItem, updateItem } = useBudget();

  // route params
  const { activeMonthKey, editItem } = route.params as {
    activeMonthKey: string;
    editItem?: BudgetItem;
  };
  const isEditing = !!editItem;

  // states
  const [name, setName] = useState("");
  const [amountText, setAmountText] = useState("");
  const [category, setCategory] = useState(CATEGORIES[0]);
  const [notes, setNotes] = useState("");
  const [error, setError] = useState("");

  // use effects
  useEffect(() => {
    if (editItem) {
      setName(editItem.name);
      setAmountText(String(editItem.amount));
      setCategory(editItem.category);
      setNotes(editItem.notes ?? "");
    }
  }, []);

  // handlers
  const handleSubmit = () => {
    const trimmedName = name.trim();
    const parsedAmount = parseFloat(amountText.replace(",", "."));

    if (!trimmedName) {
      setError("please enter a name.");
      return;
    }
    if (isNaN(parsedAmount) || parsedAmount <= 0) {
      setError("please enter a valid amount.");
      return;
    }

    if (isEditing && editItem) {
      updateItem(activeMonthKey, {
        ...editItem,
        name: trimmedName,
        amount: parsedAmount,
        category,
        notes: notes.trim() || undefined,
      });
    } else {
      const createdAt = fromMonthKey(activeMonthKey).toISOString();
      const item: BudgetItem = {
        id: uuidv4(),
        name: trimmedName,
        amount: parsedAmount,
        category,
        notes: notes.trim() || undefined,
        createdAt,
        spent: false,
      };
      addItem(item);
    }

    navigation.goBack();
  };

  return (
    <View style={styles.root}>
      <KeyboardAvoidingView behavior="padding" style={styles.kav}>
        <TouchableWithoutFeedback onPress={() => navigation.goBack()}>
          <View style={styles.backdrop} />
        </TouchableWithoutFeedback>

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
              {isEditing ? "edit item" : "add item"}
            </AppText>
            <TouchableOpacity onPress={() => navigation.goBack()}>
              <Ionicons name="close" size={24} color={theme.subtext} />
            </TouchableOpacity>
          </View>

          <ScrollView
            showsVerticalScrollIndicator={false}
            keyboardShouldPersistTaps="handled"
          >
            <AppText
              variant="medium"
              style={[styles.label, { color: theme.subtext }]}
            >
              name
            </AppText>
            <TextInput
              value={name}
              onChangeText={(t) => {
                setName(t);
                setError("");
              }}
              placeholder="e.g. rent, groceries"
              placeholderTextColor={theme.subtext}
              style={[
                styles.input,
                {
                  color: theme.text,
                  borderColor: theme.accent,
                  backgroundColor: theme.background,
                },
              ]}
            />

            <AppText
              variant="medium"
              style={[styles.label, { color: theme.subtext }]}
            >
              amount
            </AppText>
            <TextInput
              value={amountText}
              onChangeText={(t) => {
                setAmountText(t);
                setError("");
              }}
              placeholder="0.00"
              placeholderTextColor={theme.subtext}
              keyboardType="decimal-pad"
              style={[
                styles.input,
                {
                  color: theme.text,
                  borderColor: theme.accent,
                  backgroundColor: theme.background,
                },
              ]}
            />

            <AppText
              variant="medium"
              style={[styles.label, { color: theme.subtext }]}
            >
              category
            </AppText>
            <View style={styles.chips}>
              {CATEGORIES.map((cat) => (
                <TouchableOpacity
                  key={cat}
                  onPress={() => setCategory(cat)}
                  style={[
                    styles.chip,
                    {
                      backgroundColor:
                        category === cat ? theme.primary : theme.accent,
                    },
                  ]}
                >
                  <AppText
                    variant="medium"
                    style={{
                      color: category === cat ? "white" : theme.subtext,
                      fontSize: 13,
                    }}
                  >
                    {cat}
                  </AppText>
                </TouchableOpacity>
              ))}
            </View>

            <AppText
              variant="medium"
              style={[styles.label, { color: theme.subtext }]}
            >
              notes (optional)
            </AppText>
            <TextInput
              value={notes}
              onChangeText={setNotes}
              placeholder="any extra details"
              placeholderTextColor={theme.subtext}
              multiline
              numberOfLines={3}
              style={[
                styles.input,
                styles.notesInput,
                {
                  color: theme.text,
                  borderColor: theme.accent,
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
              onPress={handleSubmit}
              style={[styles.btn, { backgroundColor: theme.primary }]}
            >
              <AppText variant="bold" style={styles.btnText}>
                {isEditing ? "save changes" : "add item"}
              </AppText>
            </TouchableOpacity>
          </ScrollView>
        </View>
      </KeyboardAvoidingView>
    </View>
  );
};

const styles = StyleSheet.create({
  root: {
    flex: 1,
  },
  kav: {
    flex: 1,
    justifyContent: "flex-end",
  },
  backdrop: {
    ...StyleSheet.absoluteFill,
    backgroundColor: "rgba(0,0,0,0.45)",
  },
  sheet: {
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    padding: 24,
    maxHeight: "90%",
  },
  row: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 20,
  },
  title: {
    fontSize: 20,
  },
  label: {
    fontSize: 12,
    marginBottom: 6,
    textTransform: "uppercase",
    letterSpacing: 0.6,
  },
  input: {
    borderWidth: 1,
    borderRadius: 12,
    paddingHorizontal: 14,
    paddingVertical: 10,
    fontSize: 15,
    marginBottom: 16,
  },
  notesInput: {
    height: 80,
    textAlignVertical: "top",
    paddingTop: 10,
  },
  chips: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 8,
    marginBottom: 16,
  },
  chip: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 10,
  },
  error: {
    marginBottom: 10,
    fontSize: 13,
  },
  btn: {
    paddingVertical: 14,
    borderRadius: 14,
    alignItems: "center",
    marginTop: 4,
    marginBottom: 8,
  },
  btnText: {
    color: "white",
    fontSize: 16,
  },
});

export default AddItemScreen;
