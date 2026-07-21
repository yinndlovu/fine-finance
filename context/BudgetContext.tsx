// external
import AsyncStorage from "@react-native-async-storage/async-storage";
import {
  createContext,
  ReactNode,
  useContext,
  useEffect,
  useMemo,
  useState,
} from "react";

// internal
import { BudgetItem, MonthBudget } from "../types/budget";
import { toMonthKey, prevMonthKey } from "../utils/monthUtils";

// types
type BudgetContextType = {
  // all months that have data, keyed by "YYYY-MM"
  months: Record<string, MonthBudget>;
  // currently viewed month key ("YYYY-MM")
  activeMonthKey: string;
  setActiveMonthKey: (key: string) => void;
  addItem: (item: BudgetItem) => void;
  removeItem: (monthKey: string, itemId: string) => void;
  updateItem: (monthKey: string, item: BudgetItem) => void;
  toggleSpent: (monthKey: string, itemId: string) => void;
  setMonthIncome: (monthKey: string, income: number) => void;
  copyItemsFromPrevMonth: (monthKey: string) => void;
  isBudgetLoaded: boolean;
  syncToCloud: () => Promise<void>;
};

const STORAGE_KEYS = {
  months: "budget.months",
  activeMonthKey: "budget.activeMonthKey",
} as const;

const BudgetContext = createContext<BudgetContextType | undefined>(undefined);

const validateItem = (i: any): BudgetItem | null => {
  if (!i || typeof i !== "object") {
    return null;
  }
  const id = String(i.id ?? "");
  const name = String(i.name ?? "");
  const createdAt = String(i.createdAt ?? "");
  if (!id || !name || !createdAt) {
    return null;
  }
  return {
    id,
    name,
    amount: Number(i.amount ?? 0),
    category: String(i.category ?? "other"),
    notes: typeof i.notes === "string" ? i.notes : undefined,
    createdAt,
    spent: Boolean(i.spent ?? false),
  };
};

export const BudgetProvider = ({ children }: { children: ReactNode }) => {
  const [months, setMonths] = useState<Record<string, MonthBudget>>({});
  const [activeMonthKey, setActiveMonthKeyState] = useState<string>(
    toMonthKey(new Date()),
  );
  const [isBudgetLoaded, setIsBudgetLoaded] = useState(false);

  // load from AsyncStorage on mount
  useEffect(() => {
    let isMounted = true;
    (async () => {
      try {
        const [storedMonthsJson, storedActiveKey] = await Promise.all([
          AsyncStorage.getItem(STORAGE_KEYS.months),
          AsyncStorage.getItem(STORAGE_KEYS.activeMonthKey),
        ]);

        if (!isMounted) {
          return;
        }

        if (storedMonthsJson) {
          const parsed = JSON.parse(storedMonthsJson) as unknown;
          if (parsed && typeof parsed === "object" && !Array.isArray(parsed)) {
            const validated: Record<string, MonthBudget> = {};
            for (const [key, val] of Object.entries(
              parsed as Record<string, any>,
            )) {
              if (
                val &&
                typeof val === "object" &&
                typeof val.monthKey === "string" &&
                Array.isArray(val.items)
              ) {
                validated[key] = {
                  monthKey: val.monthKey,
                  income: Number(val.income ?? 0),
                  items: (val.items as any[])
                    .map(validateItem)
                    .filter((i): i is BudgetItem => i !== null),
                };
              }
            }
            setMonths(validated);
          }
        }

        if (storedActiveKey && /^\d{4}-\d{2}$/.test(storedActiveKey)) {
          setActiveMonthKeyState(storedActiveKey);
        }
      } catch {
        if (isMounted) {
          setMonths({});
          setActiveMonthKeyState(toMonthKey(new Date()));
        }
      } finally {
        if (isMounted) {
          setIsBudgetLoaded(true);
        }
      }
    })();

    return () => {
      isMounted = false;
    };
  }, []);

  // persist months
  useEffect(() => {
    if (!isBudgetLoaded) return;
    AsyncStorage.setItem(STORAGE_KEYS.months, JSON.stringify(months)).catch(
      () => {},
    );
  }, [months, isBudgetLoaded]);

  // persist active month key
  useEffect(() => {
    if (!isBudgetLoaded) {
      return;
    }
    AsyncStorage.setItem(STORAGE_KEYS.activeMonthKey, activeMonthKey).catch(
      () => {},
    );
  }, [activeMonthKey, isBudgetLoaded]);

  // actions
  const setActiveMonthKey = (key: string) => setActiveMonthKeyState(key);

  const addItem = (item: BudgetItem) => {
    const monthKey = toMonthKey(new Date(item.createdAt));
    setMonths((prev) => {
      const existing = prev[monthKey] ?? { monthKey, income: 0, items: [] };
      return {
        ...prev,
        [monthKey]: { ...existing, items: [item, ...existing.items] },
      };
    });
  };

  const removeItem = (monthKey: string, itemId: string) => {
    setMonths((prev) => {
      const existing = prev[monthKey];
      if (!existing) {
        return prev;
      }
      return {
        ...prev,
        [monthKey]: {
          ...existing,
          items: existing.items.filter((i) => i.id !== itemId),
        },
      };
    });
  };

  const updateItem = (monthKey: string, updated: BudgetItem) => {
    setMonths((prev) => {
      const existing = prev[monthKey];
      if (!existing) {
        return prev;
      }
      return {
        ...prev,
        [monthKey]: {
          ...existing,
          items: existing.items.map((i) => (i.id === updated.id ? updated : i)),
        },
      };
    });
  };

  const toggleSpent = (monthKey: string, itemId: string) => {
    setMonths((prev) => {
      const existing = prev[monthKey];
      if (!existing) {
        return prev;
      }
      return {
        ...prev,
        [monthKey]: {
          ...existing,
          items: existing.items.map((i) =>
            i.id === itemId ? { ...i, spent: !i.spent } : i,
          ),
        },
      };
    });
  };

  const setMonthIncome = (monthKey: string, income: number) => {
    setMonths((prev) => {
      const existing = prev[monthKey] ?? { monthKey, income: 0, items: [] };
      return { ...prev, [monthKey]: { ...existing, income } };
    });
  };

  /**
   * copies items from the previous month into this month (resetting spent),
   * also carries the income forward. Only works if this month has no items yet
   */
  const copyItemsFromPrevMonth = (monthKey: string) => {
    setMonths((prev) => {
      const prevKey = prevMonthKey(monthKey);
      const source = prev[prevKey];
      if (!source) {
        return prev;
      }
      const existing = prev[monthKey] ?? { monthKey, income: 0, items: [] };
      // don't overwrite if already has items
      if (existing.items.length > 0) {
        return prev;
      }
      const copiedItems: BudgetItem[] = source.items.map((i) => ({
        ...i,
        id: `${i.id}_copy_${monthKey}`,
        spent: false,
        createdAt: new Date(
          parseInt(monthKey.slice(0, 4)),
          parseInt(monthKey.slice(5, 7)) - 1,
          1,
        ).toISOString(),
      }));
      return {
        ...prev,
        [monthKey]: {
          monthKey,
          income: existing.income > 0 ? existing.income : source.income,
          items: copiedItems,
        },
      };
    });
  };

  const syncToCloud = async (): Promise<void> => {
    // TODO: replace with real API call
    return Promise.resolve();
  };

  const value = useMemo(
    () => ({
      months,
      activeMonthKey,
      setActiveMonthKey,
      addItem,
      removeItem,
      updateItem,
      toggleSpent,
      setMonthIncome,
      copyItemsFromPrevMonth,
      isBudgetLoaded,
      syncToCloud,
    }),
    [months, activeMonthKey, isBudgetLoaded],
  );

  return (
    <BudgetContext.Provider value={value}>{children}</BudgetContext.Provider>
  );
};

export const useBudget = () => {
  const context = useContext(BudgetContext);
  if (!context) {
    throw new Error("useBudget must be used within BudgetProvider");
  }
  return context;
};
