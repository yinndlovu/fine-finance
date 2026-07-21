// external
import React from "react";
import { StyleSheet, View } from "react-native";

// internal
import { useTheme } from "../context/ThemeContext";
import { usePreferences } from "../context/PreferencesContext";
import { AppText } from "./AppText";
import { formatAmount } from "../utils/currencyUtils";
import { CATEGORY_COLORS } from "../constants/Colors";

interface CategoryRow {
  category: string;
  amount: number;
  spentAmount: number;
}

interface Props {
  rows: CategoryRow[];
  totalBudgeted: number;
}

const CategoryBreakdown: React.FC<Props> = ({ rows, totalBudgeted }) => {
  const { theme } = useTheme();
  const { currencySymbol, currencyPosition } = usePreferences();

  if (rows.length === 0) {
    return null;
  }

  return (
    <View
      style={[
        styles.container,
        { backgroundColor: theme.card, borderColor: theme.accent },
      ]}
    >
      <AppText variant="bold" style={[styles.heading, { color: theme.text }]}>
        spending breakdown
      </AppText>

      {rows.map((row, idx) => {
        const color = CATEGORY_COLORS[idx % CATEGORY_COLORS.length];
        const budgetedPct =
          totalBudgeted > 0 ? (row.amount / totalBudgeted) * 100 : 0;
        const spentPct =
          row.amount > 0 ? (row.spentAmount / row.amount) * 100 : 0;

        return (
          <View key={row.category} style={styles.row}>
            {/* label row */}
            <View style={styles.labelRow}>
              <View style={styles.labelLeft}>
                <View style={[styles.dot, { backgroundColor: color }]} />
                <AppText
                  variant="medium"
                  style={[styles.catLabel, { color: theme.text }]}
                >
                  {row.category}
                </AppText>
              </View>
              <View style={styles.labelRight}>
                <AppText
                  variant="medium"
                  style={[styles.amountText, { color: theme.text }]}
                >
                  {formatAmount(row.amount, currencySymbol, currencyPosition)}
                </AppText>
                <AppText
                  variant="light"
                  style={[styles.pctText, { color: theme.subtext }]}
                >
                  {budgetedPct.toFixed(0)}%
                </AppText>
              </View>
            </View>

            {/* track (grey background) */}
            <View style={[styles.track, { backgroundColor: theme.subtext + "25" }]}>
              {/* budgeted fill */}
              <View
                style={[
                  styles.fill,
                  {
                    width: `${Math.min(budgetedPct, 100)}%` as any,
                    backgroundColor: color + "40", // 25% opacity
                  },
                ]}
              />
              {/* spent fill overlaid on top */}
              {spentPct > 0 && (
                <View
                  style={[
                    styles.fill,
                    styles.spentFill,
                    {
                      width: `${Math.min(
                        (row.spentAmount / totalBudgeted) * 100,
                        100,
                      )}%` as any,
                      backgroundColor: color,
                    },
                  ]}
                />
              )}
            </View>

            {/* spent sub-label */}
            {row.spentAmount > 0 && (
              <AppText
                variant="light"
                style={[styles.spentLabel, { color: theme.subtext }]}
              >
                {formatAmount(
                  row.spentAmount,
                  currencySymbol,
                  currencyPosition,
                )}{" "}
                spent · {spentPct.toFixed(0)}% of category
              </AppText>
            )}
          </View>
        );
      })}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    marginHorizontal: 20,
    marginTop: 8,
    marginBottom: 20,
    borderRadius: 18,
    borderWidth: 1,
    padding: 18,
  },
  heading: {
    fontSize: 15,
    marginBottom: 16,
  },
  row: {
    marginBottom: 14,
  },
  labelRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 6,
  },
  labelLeft: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
  dot: {
    width: 8,
    height: 8,
    borderRadius: 4,
  },
  catLabel: { fontSize: 14 },
  labelRight: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
  amountText: { fontSize: 14 },
  pctText: { fontSize: 12 },
  track: {
    height: 8,
    borderRadius: 4,
    overflow: "hidden",
    position: "relative",
  },
  fill: {
    position: "absolute",
    top: 0,
    left: 0,
    height: 8,
    borderRadius: 4,
  },
  spentFill: {
  },
  spentLabel: {
    fontSize: 11,
    marginTop: 4,
  },
});

export default CategoryBreakdown;
