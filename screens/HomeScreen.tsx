import React, { useState } from "react";
import { StyleSheet, View, FlatList, TouchableOpacity } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useNavigation } from "@react-navigation/native";
import { Ionicons } from "@expo/vector-icons";

// internal
import { useTheme } from "../context/ThemeContext";
import { useBudget } from "../context/BudgetContext";
import { usePreferences } from "../context/PreferencesContext";
import { useBudgetMonth } from "../hooks/useBudgetMonth";
import { AppText } from "../components/AppText";
import { formatAmount } from "../utils/currencyUtils";
import {
  monthLabel,
  nextMonthKey,
  prevMonthKey,
  isCurrentMonth,
  isFutureMonth,
  toMonthKey,
} from "../utils/monthUtils";
import AddItemModal from "../components/AddItemModal";

const HomeScreen: React.FC = () => {
  const navigation = useNavigation<any>();
  const { theme } = useTheme();
  const insets = useSafeAreaInsets();
  const { activeMonthKey, setActiveMonthKey } = useBudget();
  const { currencySymbol, currencyPosition } = usePreferences();
  const { items, total, formattedTotal, isEmpty } = useBudgetMonth();

  const [isAddModalVisible, setAddModalVisible] = useState(false);

  const isCurrent = isCurrentMonth(activeMonthKey);
  const isFuture = isFutureMonth(activeMonthKey);

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
      <FlatList
        data={items}
        keyExtractor={(item) => item.id}
        contentContainerStyle={[
          styles.scrollContent,
          isEmpty && { flexGrow: 1 },
        ]}
        ListHeaderComponent={
          <View style={styles.header}>
            {/* top row */}
            <View style={styles.topRow}>
              <AppText
                variant="bold"
                style={[styles.title, { color: theme.text }]}
              >
                budget things
              </AppText>
              <View style={styles.headerActions}>
                <TouchableOpacity
                  onPress={() => navigation.navigate("History")}
                  style={styles.iconButton}
                  accessibilityRole="button"
                  accessibilityLabel="View history"
                >
                  <Ionicons name="time-outline" size={24} color={theme.text} />
                </TouchableOpacity>
                <TouchableOpacity
                  onPress={() => navigation.navigate("Settings")}
                  style={styles.iconButton}
                  accessibilityRole="button"
                  accessibilityLabel="Settings"
                >
                  <Ionicons
                    name="settings-outline"
                    size={24}
                    color={theme.text}
                  />
                </TouchableOpacity>
              </View>
            </View>

            {/* month navigator */}
            <View
              style={[
                styles.monthNav,
                { backgroundColor: theme.card, borderColor: theme.accent },
              ]}
            >
              <TouchableOpacity
                onPress={() => setActiveMonthKey(prevMonthKey(activeMonthKey))}
                style={styles.monthArrow}
                accessibilityRole="button"
                accessibilityLabel="Previous month"
              >
                <Ionicons name="chevron-back" size={20} color={theme.subtext} />
              </TouchableOpacity>

              <View style={styles.monthLabelWrap}>
                <AppText
                  variant="bold"
                  style={[styles.monthText, { color: theme.text }]}
                >
                  {monthLabel(activeMonthKey)}
                </AppText>
                {isCurrent && (
                  <View
                    style={[styles.badge, { backgroundColor: theme.primary }]}
                  >
                    <AppText variant="medium" style={styles.badgeText}>
                      this month
                    </AppText>
                  </View>
                )}
                {isFuture && (
                  <View
                    style={[styles.badge, { backgroundColor: theme.accent }]}
                  >
                    <AppText
                      variant="medium"
                      style={[styles.badgeText, { color: theme.subtext }]}
                    >
                      upcoming
                    </AppText>
                  </View>
                )}
              </View>

              <TouchableOpacity
                onPress={() => setActiveMonthKey(nextMonthKey(activeMonthKey))}
                style={styles.monthArrow}
                accessibilityRole="button"
                accessibilityLabel="Next month"
              >
                <Ionicons
                  name="chevron-forward"
                  size={20}
                  color={theme.subtext}
                />
              </TouchableOpacity>
            </View>

            {/* total hero */}
            {!isEmpty && (
              <View
                style={[
                  styles.totalHero,
                  { backgroundColor: theme.card, borderColor: theme.accent },
                ]}
              >
                <AppText
                  variant="light"
                  style={[styles.totalLabel, { color: theme.subtext }]}
                >
                  total budgeted
                </AppText>
                <AppText
                  variant="bold"
                  style={[styles.totalAmount, { color: theme.primary }]}
                >
                  {formattedTotal}
                </AppText>
              </View>
            )}

            {/* section header */}
            <View style={styles.sectionRow}>
              <AppText
                variant="medium"
                style={[styles.sectionLabel, { color: theme.subtext }]}
              >
                {isEmpty ? "" : "items"}
              </AppText>
              <TouchableOpacity
                onPress={() => setAddModalVisible(true)}
                style={styles.addButton}
                accessibilityRole="button"
                accessibilityLabel="Add budget item"
              >
                <Ionicons
                  name="add-circle-outline"
                  size={26}
                  color={theme.primary}
                />
              </TouchableOpacity>
            </View>

            {/* empty state */}
            {isEmpty && (
              <View
                style={[
                  styles.emptyHero,
                  { backgroundColor: theme.card, borderColor: theme.accent },
                ]}
              >
                <AppText
                  variant="bold"
                  style={{ color: theme.text, fontSize: 18 }}
                >
                  {isFuture ? "plan ahead" : "nothing budgeted yet"}
                </AppText>
                <AppText
                  variant="light"
                  style={{
                    color: theme.subtext,
                    marginTop: 6,
                    textAlign: "center",
                  }}
                >
                  {isFuture
                    ? `start adding items for ${monthLabel(activeMonthKey)}.`
                    : "add your first budget item to get started."}
                </AppText>
                <TouchableOpacity
                  onPress={() => setAddModalVisible(true)}
                  style={[styles.emptyCta, { backgroundColor: theme.primary }]}
                  accessibilityRole="button"
                  accessibilityLabel="Add your first budget item"
                >
                  <Ionicons name="add" size={18} color="white" />
                  <AppText variant="bold" style={{ color: "white" }}>
                    add item
                  </AppText>
                </TouchableOpacity>
              </View>
            )}
          </View>
        }
        renderItem={({ item }) => (
          <View
            style={[
              styles.card,
              { backgroundColor: theme.card, borderColor: theme.accent },
            ]}
          >
            <View style={styles.cardLeft}>
              <AppText
                variant="bold"
                style={[styles.cardName, { color: theme.text }]}
              >
                {item.name}
              </AppText>
              <AppText
                variant="light"
                style={[styles.cardCategory, { color: theme.subtext }]}
              >
                {item.category}
              </AppText>
            </View>
            <AppText
              variant="medium"
              style={[styles.cardAmount, { color: theme.primary }]}
            >
              {formatAmount(item.amount, currencySymbol, currencyPosition)}
            </AppText>
          </View>
        )}
      />

      <AddItemModal
        isVisible={isAddModalVisible}
        activeMonthKey={activeMonthKey}
        onClose={() => setAddModalVisible(false)}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  scrollContent: {
    paddingBottom: 40,
  },
  header: {
    alignItems: "center",
    paddingHorizontal: 20,
    paddingTop: 10,
  },
  topRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    width: "100%",
    marginBottom: 20,
  },
  headerActions: {
    flexDirection: "row",
    alignItems: "center",
  },
  title: {
    fontSize: 26,
  },
  iconButton: {
    width: 48,
    height: 48,
    justifyContent: "center",
    alignItems: "center",
  },
  monthNav: {
    flexDirection: "row",
    alignItems: "center",
    width: "100%",
    borderRadius: 16,
    borderWidth: 1,
    paddingVertical: 10,
    paddingHorizontal: 4,
    marginBottom: 16,
  },
  monthArrow: {
    width: 40,
    height: 40,
    alignItems: "center",
    justifyContent: "center",
  },
  monthLabelWrap: {
    flex: 1,
    alignItems: "center",
    gap: 4,
  },
  monthText: {
    fontSize: 16,
  },
  badge: {
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 8,
  },
  badgeText: {
    fontSize: 10,
    color: "white",
  },
  totalHero: {
    width: "100%",
    borderRadius: 16,
    borderWidth: 1,
    paddingVertical: 18,
    paddingHorizontal: 20,
    marginBottom: 16,
    alignItems: "center",
  },
  totalLabel: {
    fontSize: 13,
    marginBottom: 4,
  },
  totalAmount: {
    fontSize: 34,
  },
  sectionRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    width: "100%",
    marginTop: 4,
    marginBottom: 8,
  },
  sectionLabel: {
    fontSize: 12,
    textTransform: "uppercase",
    letterSpacing: 0.8,
  },
  addButton: {
    width: 40,
    height: 40,
    alignItems: "center",
    justifyContent: "center",
  },
  emptyHero: {
    width: "100%",
    borderRadius: 20,
    borderWidth: 1,
    paddingVertical: 30,
    paddingHorizontal: 20,
    alignItems: "center",
  },
  emptyCta: {
    marginTop: 16,
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 14,
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
  card: {
    marginHorizontal: 20,
    marginVertical: 6,
    padding: 18,
    borderRadius: 16,
    borderWidth: 1,
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  cardLeft: {
    flex: 1,
    marginRight: 12,
  },
  cardName: {
    fontSize: 16,
  },
  cardCategory: {
    fontSize: 12,
    marginTop: 3,
  },
  cardAmount: {
    fontSize: 16,
  },
});

export default HomeScreen;
