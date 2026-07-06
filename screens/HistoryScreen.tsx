import React from "react";
import { StyleSheet, View, FlatList, TouchableOpacity } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useNavigation } from "@react-navigation/native";
import { Ionicons } from "@expo/vector-icons";

// internal
import { useTheme } from "../context/ThemeContext";
import { useBudget } from "../context/BudgetContext";
import { usePreferences } from "../context/PreferencesContext";
import { AppText } from "../components/AppText";
import { formatAmount } from "../utils/currencyUtils";
import { monthLabel, isCurrentMonth, isFutureMonth } from "../utils/monthUtils";

const HistoryScreen: React.FC = () => {
  const navigation = useNavigation<any>();
  const { theme } = useTheme();
  const insets = useSafeAreaInsets();
  const { months, setActiveMonthKey } = useBudget();
  const { currencySymbol, currencyPosition } = usePreferences();

  // all month keys sorted newest first
  const sortedKeys = Object.keys(months).sort((a, b) => (a > b ? -1 : 1));

  const handleSelectMonth = (key: string) => {
    setActiveMonthKey(key);
    navigation.navigate("Home");
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
          history
        </AppText>
        <View style={styles.backButton} />
      </View>

      {sortedKeys.length === 0 ? (
        <View style={styles.emptyWrap}>
          <AppText
            variant="light"
            style={{ color: theme.subtext, textAlign: "center" }}
          >
            no budget history yet.{"\n"}start adding items on the home screen.
          </AppText>
        </View>
      ) : (
        <FlatList
          data={sortedKeys}
          keyExtractor={(key) => key}
          contentContainerStyle={styles.list}
          renderItem={({ item: key }) => {
            const monthData = months[key];
            const total = monthData.items.reduce((sum, i) => sum + i.amount, 0);
            const isCurrent = isCurrentMonth(key);
            const isFuture = isFutureMonth(key);

            return (
              <TouchableOpacity
                onPress={() => handleSelectMonth(key)}
                style={[
                  styles.card,
                  {
                    backgroundColor: theme.card,
                    borderColor: isCurrent ? theme.primary : theme.accent,
                  },
                ]}
                accessibilityRole="button"
                accessibilityLabel={`View ${monthLabel(key)}`}
              >
                <View>
                  <AppText
                    variant="bold"
                    style={[styles.cardMonth, { color: theme.text }]}
                  >
                    {monthLabel(key)}
                  </AppText>
                  <AppText
                    variant="light"
                    style={[styles.cardCount, { color: theme.subtext }]}
                  >
                    {monthData.items.length}{" "}
                    {monthData.items.length === 1 ? "item" : "items"}
                  </AppText>
                </View>
                <View style={styles.cardRight}>
                  <AppText
                    variant="medium"
                    style={[styles.cardTotal, { color: theme.primary }]}
                  >
                    {formatAmount(total, currencySymbol, currencyPosition)}
                  </AppText>
                  {(isCurrent || isFuture) && (
                    <View
                      style={[
                        styles.badge,
                        {
                          backgroundColor: isCurrent
                            ? theme.primary
                            : theme.accent,
                        },
                      ]}
                    >
                      <AppText
                        variant="medium"
                        style={[
                          styles.badgeText,
                          { color: isCurrent ? "white" : theme.subtext },
                        ]}
                      >
                        {isCurrent ? "current" : "upcoming"}
                      </AppText>
                    </View>
                  )}
                </View>
              </TouchableOpacity>
            );
          }}
        />
      )}
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
  list: { paddingHorizontal: 20, paddingBottom: 40, paddingTop: 4 },
  emptyWrap: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    paddingHorizontal: 40,
  },
  card: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    padding: 18,
    borderRadius: 16,
    borderWidth: 1,
    marginBottom: 12,
  },
  cardMonth: { fontSize: 16 },
  cardCount: { fontSize: 12, marginTop: 3 },
  cardRight: { alignItems: "flex-end", gap: 6 },
  cardTotal: { fontSize: 15 },
  badge: {
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 8,
  },
  badgeText: { fontSize: 10 },
});

export default HistoryScreen;
