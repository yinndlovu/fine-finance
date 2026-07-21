// external
import React, { useEffect, useState } from "react";
import {
  KeyboardAvoidingView,
  Modal,
  Platform,
  ScrollView,
  StyleSheet,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import "react-native-get-random-values";
import { v4 as uuidv4 } from "uuid";
import { useSafeAreaInsets } from "react-native-safe-area-context";

// internal
import { useTheme } from "../context/ThemeContext";
import { useBudget } from "../context/BudgetContext";
import { AppText } from "./AppText";
import { BudgetItem } from "../types/budget";
import { fromMonthKey } from "../utils/monthUtils";
import { CATEGORIES } from "../constants/Categories";

interface Props {
  isVisible: boolean;
  activeMonthKey: string;
  editItem?: BudgetItem;
  onClose: () => void;
}

const AddItemModal: React.FC<Props> = ({
  isVisible,
  activeMonthKey,
  editItem,
  onClose,
}) => {
  // variables
  const { theme } = useTheme();
  const insets = useSafeAreaInsets();
  const { addItem, updateItem } = useBudget();
  const isEditing = !!editItem;

  // states
  const [name, setName] = useState("");
  const [amountText, setAmountText] = useState("");
  const [category, setCategory] = useState(CATEGORIES[0]);
  const [notes, setNotes] = useState("");
  const [error, setError] = useState("");

  // populate fields when opening in edit mode
  useEffect(() => {
    if (isVisible) {
      if (editItem) {
        setName(editItem.name);
        setAmountText(String(editItem.amount));
        setCategory(editItem.category);
        setNotes(editItem.notes ?? "");
      } else {
        setName("");
        setAmountText("");
        setCategory(CATEGORIES[0]);
        setNotes("");
      }
      setError("");
    }
  }, [isVisible, editItem]);

  const handleClose = () => {
    onClose();
  };

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

    handleClose();
  };

  return (
    <Modal
      visible={isVisible}
      transparent
      animationType="slide"
      onRequestClose={handleClose}
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
          {/* header */}
          <View style={styles.modalHeader}>
            <AppText
              variant="bold"
              style={[styles.modalTitle, { color: theme.text }]}
            >
              {isEditing ? "edit item" : "add item"}
            </AppText>
            <TouchableOpacity
              onPress={handleClose}
              accessibilityRole="button"
              accessibilityLabel="Close"
            >
              <Ionicons name="close" size={24} color={theme.subtext} />
            </TouchableOpacity>
          </View>

          <ScrollView showsVerticalScrollIndicator={false}>
            {/* name */}
            <AppText
              variant="medium"
              style={[styles.fieldLabel, { color: theme.subtext }]}
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

            {/* amount */}
            <AppText
              variant="medium"
              style={[styles.fieldLabel, { color: theme.subtext }]}
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

            {/* category */}
            <AppText
              variant="medium"
              style={[styles.fieldLabel, { color: theme.subtext }]}
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

            {/* notes */}
            <AppText
              variant="medium"
              style={[styles.fieldLabel, { color: theme.subtext }]}
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
                style={[styles.errorText, { color: theme.negative }]}
              >
                {error}
              </AppText>
            )}

            <TouchableOpacity
              onPress={handleSubmit}
              style={[styles.submitBtn, { backgroundColor: theme.primary }]}
              accessibilityRole="button"
            >
              <AppText variant="bold" style={styles.submitText}>
                {isEditing ? "save changes" : "add item"}
              </AppText>
            </TouchableOpacity>
          </ScrollView>
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
    maxHeight: "90%",
  },
  modalHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 20,
  },
  modalTitle: { 
    fontSize: 20 
  },
  fieldLabel: {
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
  errorText: { 
    marginBottom: 10, 
    fontSize: 13 
  },
  submitBtn: {
    paddingVertical: 14,
    borderRadius: 14,
    alignItems: "center",
    marginTop: 4,
    marginBottom: 8,
  },
  submitText: { 
    color: "white", 
    fontSize: 16 
  },
});

export default AddItemModal;
