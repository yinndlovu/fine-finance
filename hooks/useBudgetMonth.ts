import { useMemo } from "react";
import { useBudget } from "../context/BudgetContext";
import { usePreferences } from "../context/PreferencesContext";
import { formatAmount } from "../utils/currencyUtils";
import { BudgetItem } from "../types/budget";
import { prevMonthKey } from "../utils/monthUtils";

export type BudgetMonthStats = {
  /** regular + subscription items (subscription only shown when regular items exist) */
  items: BudgetItem[];
  /** only manually-added items */
  regularItems: BudgetItem[];
  /** true when there are no manually-added items */
  isEmpty: boolean;
  income: number;
  budgeted: number;
  expense: number;
  planned: number;
  disposable: number;
  fIncome: string;
  fBudgeted: string;
  fExpense: string;
  fPlanned: string;
  fDisposable: string;
  categoryTotals: { category: string; amount: number; spentAmount: number }[];
};

const resolveIncome = (
  months: Record<string, { income: number }>,
  monthKey: string,
): number => {
  if (months[monthKey]?.income > 0) {
    return months[monthKey].income;
  }
  let cursor = monthKey;
  for (let i = 0; i < 12; i++) {
    cursor = prevMonthKey(cursor);
    if (months[cursor]?.income > 0) {
      return months[cursor].income;
    }
  }
  return 0;
};

export const useBudgetMonth = (): BudgetMonthStats => {
  const { months, activeMonthKey } = useBudget();
  const { currencySymbol, currencyPosition } = usePreferences();

  const allStoredItems = useMemo(
    () => months[activeMonthKey]?.items ?? [],
    [months, activeMonthKey],
  );

  const regularItems = useMemo(
    () => allStoredItems.filter((i) => !i.subscriptionId),
    [allStoredItems],
  );

  const subscriptionItems = useMemo(
    () => allStoredItems.filter((i) => i.subscriptionId),
    [allStoredItems],
  );

  /**
   * subscription items only surface when the month has regular items
   * empty months stay empty even if subscription items are pre-injected
   */
  const items = useMemo(
    () =>
      regularItems.length > 0
        ? [...regularItems, ...subscriptionItems]
        : regularItems,
    [regularItems, subscriptionItems],
  );

  const isEmpty = regularItems.length === 0;

  const income = useMemo(
    () => resolveIncome(months, activeMonthKey),
    [months, activeMonthKey],
  );

  const budgeted = useMemo(
    () => items.reduce((sum, i) => sum + i.amount, 0),
    [items],
  );
  const expense = useMemo(
    () => items.filter((i) => i.spent).reduce((sum, i) => sum + i.amount, 0),
    [items],
  );
  const planned = useMemo(
    () => items.filter((i) => !i.spent).reduce((sum, i) => sum + i.amount, 0),
    [items],
  );
  const disposable = useMemo(() => income - budgeted, [income, budgeted]);

  const fmt = (n: number) => formatAmount(n, currencySymbol, currencyPosition);

  const categoryTotals = useMemo(() => {
    const map: Record<string, { amount: number; spentAmount: number }> = {};
    for (const item of items) {
      if (!map[item.category]) {
        map[item.category] = { amount: 0, spentAmount: 0 };
      }
      map[item.category].amount += item.amount;
      if (item.spent) {
        map[item.category].spentAmount += item.amount;
      }
    }
    return Object.entries(map)
      .map(([category, v]) => ({ category, ...v }))
      .sort((a, b) => b.amount - a.amount);
  }, [items]);

  return {
    items,
    regularItems,
    isEmpty,
    income,
    budgeted,
    expense,
    planned,
    disposable,
    fIncome: fmt(income),
    fBudgeted: fmt(budgeted),
    fExpense: fmt(expense),
    fPlanned: fmt(planned),
    fDisposable: fmt(Math.abs(disposable)),
    categoryTotals,
  };
};
