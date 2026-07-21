// external
import { useMemo } from "react";

// internal
import { useBudget } from "../context/BudgetContext";
import { usePreferences } from "../context/PreferencesContext";
import { formatAmount } from "../utils/currencyUtils";
import { BudgetItem } from "../types/budget";
import { prevMonthKey } from "../utils/monthUtils";

export type BudgetMonthStats = {
  items: BudgetItem[];
  isEmpty: boolean;
  // monthly income - inherited from most recent past month if not set for this month
  income: number;
  // sum of ALL item amounts (spent + unspent)
  budgeted: number;
  // sum of items where spent=true
  expense: number;
  // sum of items where spent=false
  planned: number;
  // income - budgeted (uses total, not just spent, so you see real headroom)
  disposable: number;
  // formatted strings
  fIncome: string;
  fBudgeted: string;
  fExpense: string;
  fPlanned: string;
  fDisposable: string;
  // per-category totals, sorted by amount desc
  categoryTotals: { category: string; amount: number; spentAmount: number }[];
};

// walk back up to 12 months to find the most recently set income
const resolveIncome = (
  months: Record<string, { income: number }>,
  monthKey: string,
): number => {
  // first check the month itself
  if (months[monthKey]?.income > 0) {
    return months[monthKey].income;
  }
  // walk back through previous months
  let cursor = monthKey;
  for (let i = 0; i < 12; i++) {
    cursor = prevMonthKey(cursor);
    if (months[cursor]?.income > 0) return months[cursor].income;
  }
  return 0;
};

export const useBudgetMonth = (): BudgetMonthStats => {
  const { months, activeMonthKey } = useBudget();
  const { currencySymbol, currencyPosition } = usePreferences();

  const monthData = useMemo(
    () => months[activeMonthKey],
    [months, activeMonthKey],
  );

  const items = useMemo(() => monthData?.items ?? [], [monthData]);

  // inherit income from past months if not set for this month
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

  // disposable = income minus everything (spent + unspent)
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
    isEmpty: items.length === 0,
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
