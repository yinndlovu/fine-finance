// external
import { useMemo } from "react";

// internal
import { useBudget } from "../context/BudgetContext";
import { usePreferences } from "../context/PreferencesContext";
import { formatAmount } from "../utils/currencyUtils";
import { BudgetItem } from "../types/budget";

type UseBudgetMonthReturn = {
  items: BudgetItem[];
  total: number;
  formattedTotal: string;
  isEmpty: boolean;
};

/**
 * returns the budget items for the currently active month,
 * recalculates only when the active month's data or preferences change
 */
export const useBudgetMonth = (): UseBudgetMonthReturn => {
  const { months, activeMonthKey } = useBudget();
  const { currencySymbol, currencyPosition } = usePreferences();

  const items = useMemo(
    () => months[activeMonthKey]?.items ?? [],
    [months, activeMonthKey],
  );

  const total = useMemo(
    () => items.reduce((sum, item) => sum + item.amount, 0),
    [items],
  );

  const formattedTotal = useMemo(
    () => formatAmount(total, currencySymbol, currencyPosition),
    [total, currencySymbol, currencyPosition],
  );

  return { items, total, formattedTotal, isEmpty: items.length === 0 };
};
