// external
import React from "react";
import {
  Modal,
  StyleSheet,
  TouchableOpacity,
  TouchableWithoutFeedback,
  View,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";

// internal
import { useTheme } from "../context/ThemeContext";
import { AppText } from "./AppText";
import { BudgetItem } from "../types/budget";

interface Props {
  item: BudgetItem | null;
  onClose: () => void;
  onEdit: (item: BudgetItem) => void;
  onDelete: (item: BudgetItem) => void;
}

const ItemActionSheet: React.FC<Props> = ({
  item,
  onClose,
  onEdit,
  onDelete,
}) => {
  const { theme } = useTheme();
  if (!item) {
    return null;
  }

  return (
    <Modal
      visible={!!item}
      transparent
      animationType="fade"
      onRequestClose={onClose}
    >
      <TouchableWithoutFeedback onPress={onClose}>
        <View style={styles.overlay}>
          <TouchableWithoutFeedback>
            <View style={[styles.sheet, { backgroundColor: theme.card }]}>
              {/* item preview */}
              <View
                style={[styles.preview, { borderBottomColor: theme.accent }]}
              >
                <AppText
                  variant="bold"
                  style={[styles.itemName, { color: theme.text }]}
                  numberOfLines={1}
                >
                  {item.name}
                </AppText>
                <AppText
                  variant="light"
                  style={[styles.itemCat, { color: theme.subtext }]}
                >
                  {item.category}
                </AppText>
              </View>

              {/* edit */}
              <TouchableOpacity
                style={styles.action}
                onPress={() => {
                  onClose();
                  onEdit(item);
                }}
              >
                <Ionicons
                  name="pencil-outline"
                  size={20}
                  color={theme.primary}
                />
                <AppText
                  variant="medium"
                  style={[styles.actionLabel, { color: theme.text }]}
                >
                  edit item
                </AppText>
              </TouchableOpacity>

              {/* delete */}
              <TouchableOpacity
                style={styles.action}
                onPress={() => {
                  onClose();
                  onDelete(item);
                }}
              >
                <Ionicons
                  name="trash-outline"
                  size={20}
                  color={theme.negative}
                />
                <AppText
                  variant="medium"
                  style={[styles.actionLabel, { color: theme.negative }]}
                >
                  delete item
                </AppText>
              </TouchableOpacity>

              {/* cancel */}
              <TouchableOpacity
                style={[styles.cancel, { backgroundColor: theme.accent }]}
                onPress={onClose}
              >
                <AppText
                  variant="medium"
                  style={{ color: theme.subtext, fontSize: 15 }}
                >
                  cancel
                </AppText>
              </TouchableOpacity>
            </View>
          </TouchableWithoutFeedback>
        </View>
      </TouchableWithoutFeedback>
    </Modal>
  );
};

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    justifyContent: "flex-end",
    backgroundColor: "rgba(0,0,0,0.45)",
  },
  sheet: {
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    paddingBottom: 28,
    overflow: "hidden",
  },
  preview: {
    paddingHorizontal: 20,
    paddingVertical: 16,
    borderBottomWidth: 1,
    marginBottom: 4,
  },
  itemName: { fontSize: 16 },
  itemCat: { fontSize: 12, marginTop: 2 },
  action: {
    flexDirection: "row",
    alignItems: "center",
    gap: 14,
    paddingHorizontal: 20,
    paddingVertical: 16,
  },
  actionLabel: { fontSize: 16 },
  cancel: {
    marginHorizontal: 16,
    marginTop: 8,
    paddingVertical: 14,
    borderRadius: 14,
    alignItems: "center",
  },
});

export default ItemActionSheet;
