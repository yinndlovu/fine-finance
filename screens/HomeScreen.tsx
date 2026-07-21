import React, { useState } from "react";
import {
  Alert,
  StyleSheet,
  TouchableOpacity,
  View,
  FlatList,
} from "react-native";
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
  prevMonthKey as getPrevKey,
} from "../utils/monthUtils";
import AddItemModal from "../components/AddItemModal";
import SetIncomeModal from "../components/SetIncomeModal";
import ItemActionSheet from "../components/ItemActionSheet";
import CategoryBreakdown from "../components/CategoryBreakdown";
import { BudgetItem } from "../types/budget";

const HomeScreen: React.FC = () => {
  const navigation = useNavigation<any>();
  const { theme } = useTheme();
  const insets = useSafeAreaInsets();
  const {
    activeMonthKey,
    setActiveMonthKey,
    removeItem,
    toggleSpent,
    months,
    copyItemsFromPrevMonth,
  } = useBudget();
  const { currencySymbol, currencyPosition } = usePreferences();
  const {
    items,
    isEmpty,
    income,
    budgeted,
    expense,
    planned,
    disposable,
    fIncome,
    fBudgeted,
    fExpense,
    fPlanned,
    fDisposable,
    categoryTotals,
  } = useBudgetMonth();

  const [isAddModalVisible, setAddModalVisible] = useState(false);
  const [isIncomeModalVisible, setIncomeModalVisible] = useState(false);
  const [actionItem, setActionItem] = useState<BudgetItem | null>(null);
  const [editItem, setEditItem] = useState<BudgetItem | undefined>(undefined);

  const isCurrent = isCurrentMonth(activeMonthKey);
  const isFuture = isFutureMonth(activeMonthKey);
  const isDisposableNegative = disposable < 0;

  /** show "copy from last month" prompt only when the current month is empty
   * and the previous month has items
   */
  const prevKey = getPrevKey(activeMonthKey);
  const prevHasItems = (months[prevKey]?.items?.length ?? 0) > 0;
  const showCopyPrompt = isEmpty && prevHasItems;

  const handleLongPress = (item: BudgetItem) => {
    setActionItem(item);
  };

  const handleEdit = (item: BudgetItem) => {
    setEditItem(item);
    setAddModalVisible(true);
  };

  const handleDelete = (item: BudgetItem) => {
    Alert.alert("delete item", `remove "${item.name}"?`, [
      { text: "cancel", style: "cancel" },
      {
        text: "delete",
        style: "destructive",
        onPress: () => removeItem(activeMonthKey, item.id),
      },
    ]);
  };

  const handleAddClose = () => {
    setAddModalVisible(false);
    setEditItem(undefined);
  };

  // summary stats
  const StatBox = ({
    label,
    value,
    color,
    onPress,
    small,
  }: {
    label: string;
    value: string;
    color: string;
    onPress?: () => void;
    small?: boolean;
  }) => (
    <TouchableOpacity
      style={[
        styles.statBox,
        { backgroundColor: theme.card, borderColor: theme.accent },
      ]}
      onPress={onPress}
      disabled={!onPress}
      activeOpacity={onPress ? 0.7 : 1}
    >
      <AppText
        variant="light"
        style={[styles.statLabel, { color: theme.subtext }]}
      >
        {label}
      </AppText>
      <AppText
        variant="bold"
        style={[styles.statValue, { color }, small && styles.statValueSmall]}
        numberOfLines={1}
        adjustsFontSizeToFit
      >
        {value}
      </AppText>
      {onPress && (
        <Ionicons
          name="pencil-outline"
          size={11}
          color={theme.subtext}
          style={styles.editIcon}
        />
      )}
    </TouchableOpacity>
  );

  // single item card
  const renderItem = ({ item }: { item: BudgetItem }) => (
    <TouchableOpacity
      onPress={() => toggleSpent(activeMonthKey, item.id)}
      onLongPress={() => handleLongPress(item)}
      delayLongPress={400}
      activeOpacity={0.75}
      style={[
        styles.card,
        {
          backgroundColor: item.spent ? theme.accent : theme.card,
          borderColor: item.spent ? theme.negative + "60" : theme.accent,
          opacity: item.spent ? 0.85 : 1,
        },
      ]}
    >
      {/* tick circle */}
      <View
        style={[
          styles.tick,
          {
            borderColor: item.spent ? theme.negative : theme.subtext + "60",
            backgroundColor: item.spent ? theme.negative : "transparent",
          },
        ]}
      >
        {item.spent && <Ionicons name="checkmark" size={12} color="white" />}
      </View>

      <View style={styles.cardCenter}>
        <AppText
          variant="bold"
          style={[
            styles.cardName,
            { color: theme.text },
            item.spent && styles.strikethrough,
          ]}
          numberOfLines={1}
        >
          {item.name}
        </AppText>
        <AppText
          variant="light"
          style={[styles.cardCategory, { color: theme.subtext }]}
        >
          {item.category}
          {item.spent ? "  ·  spent" : ""}
        </AppText>
      </View>

      <View style={styles.cardRight}>
        <AppText
          variant="medium"
          style={[
            styles.cardAmount,
            { color: item.spent ? theme.negative : theme.primary },
          ]}
        >
          {formatAmount(item.amount, currencySymbol, currencyPosition)}
        </AppText>
        <TouchableOpacity
          onPress={() => handleLongPress(item)}
          hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
          style={styles.moreBtn}
        >
          <Ionicons
            name="ellipsis-horizontal"
            size={16}
            color={theme.subtext}
          />
        </TouchableOpacity>
      </View>
    </TouchableOpacity>
  );

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
                >
                  <Ionicons name="time-outline" size={24} color={theme.text} />
                </TouchableOpacity>
                <TouchableOpacity
                  onPress={() => navigation.navigate("Settings")}
                  style={styles.iconButton}
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
              >
                <Ionicons
                  name="chevron-forward"
                  size={20}
                  color={theme.subtext}
                />
              </TouchableOpacity>
            </View>

            {/* 4-stat summary card */}
            <View style={styles.statsGrid}>
              {/* income */}
              <StatBox
                label="income"
                value={income > 0 ? fIncome : "set income"}
                color={theme.positive}
                onPress={() => setIncomeModalVisible(true)}
              />
              {/* budgeted */}
              <StatBox
                label="budgeted"
                value={fBudgeted}
                color={theme.primary}
              />
              {/* expense */}
              <StatBox
                label="expense"
                value={fExpense}
                color={theme.negative}
                small
              />
              {/* disposable */}
              <StatBox
                label="disposable"
                value={fDisposable}
                color={isDisposableNegative ? theme.negative : theme.positive}
                small
              />
            </View>

            {/* section header */}
            <View style={styles.sectionRow}>
              <AppText
                variant="medium"
                style={[styles.sectionLabel, { color: theme.subtext }]}
              >
                {isEmpty ? "" : "items"}
              </AppText>
              <TouchableOpacity
                onPress={() => {
                  setEditItem(undefined);
                  setAddModalVisible(true);
                }}
                style={styles.addButton}
              >
                <Ionicons
                  name="add-circle-outline"
                  size={26}
                  color={theme.primary}
                />
              </TouchableOpacity>
            </View>

            {/* copy from prev month prompt */}
            {showCopyPrompt && (
              <TouchableOpacity
                onPress={() => copyItemsFromPrevMonth(activeMonthKey)}
                style={[
                  styles.copyPrompt,
                  {
                    backgroundColor: theme.card,
                    borderColor: theme.primary + "60",
                  },
                ]}
              >
                <Ionicons name="copy-outline" size={18} color={theme.primary} />
                <AppText
                  variant="medium"
                  style={[styles.copyPromptText, { color: theme.primary }]}
                >
                  copy items from {monthLabel(prevKey)}
                </AppText>
                <Ionicons
                  name="chevron-forward"
                  size={16}
                  color={theme.primary}
                />
              </TouchableOpacity>
            )}

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
        renderItem={renderItem}
        ListFooterComponent={
          !isEmpty ? (
            <CategoryBreakdown rows={categoryTotals} totalBudgeted={budgeted} />
          ) : null
        }
      />

      {/* modals */}
      <AddItemModal
        isVisible={isAddModalVisible}
        activeMonthKey={activeMonthKey}
        editItem={editItem}
        onClose={handleAddClose}
      />

      <SetIncomeModal
        isVisible={isIncomeModalVisible}
        monthKey={activeMonthKey}
        currentIncome={income}
        onClose={() => setIncomeModalVisible(false)}
      />

      <ItemActionSheet
        item={actionItem}
        onClose={() => setActionItem(null)}
        onEdit={handleEdit}
        onDelete={handleDelete}
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
    marginBottom: 14,
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
  statsGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    width: "100%",
    gap: 10,
    marginBottom: 14,
  },
  statBox: {
    flex: 1,
    minWidth: "45%",
    borderRadius: 14,
    borderWidth: 1,
    padding: 14,
  },
  statLabel: {
    fontSize: 11,
    textTransform: "uppercase",
    letterSpacing: 0.6,
    marginBottom: 4,
  },
  statValue: {
    fontSize: 20,
  },
  statValueSmall: {
    fontSize: 17,
  },
  editIcon: {
    marginTop: 4,
  },
  sectionRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    width: "100%",
    marginTop: 2,
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
  copyPrompt: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
    width: "100%",
    borderRadius: 14,
    borderWidth: 1,
    paddingHorizontal: 14,
    paddingVertical: 12,
    marginBottom: 12,
  },
  copyPromptText: {
    flex: 1,
    fontSize: 14,
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
    marginVertical: 5,
    paddingVertical: 14,
    paddingHorizontal: 14,
    borderRadius: 16,
    borderWidth: 1,
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
  },
  tick: {
    width: 22,
    height: 22,
    borderRadius: 11,
    borderWidth: 1.5,
    alignItems: "center",
    justifyContent: "center",
  },
  cardCenter: {
    flex: 1,
  },
  cardName: {
    fontSize: 15,
  },
  cardCategory: {
    fontSize: 12,
    marginTop: 2,
  },
  strikethrough: {
    textDecorationLine: "line-through",
  },
  cardRight: {
    alignItems: "flex-end",
    gap: 4,
  },
  cardAmount: {
    fontSize: 15,
  },
  moreBtn: {
    padding: 2,
  },
});

export default HomeScreen;
