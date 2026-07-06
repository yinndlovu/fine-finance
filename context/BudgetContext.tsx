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
import { toMonthKey } from "../utils/monthUtils";

// types
type BudgetContextType = {
  /** all months that have data, keyed by "YYYY-MM" */
  months: Record<string, MonthBudget>;
  /** currently viewed month key ("YYYY-MM") */
  activeMonthKey: string;
  setActiveMonthKey: (key: string) => void;
  addItem: (item: BudgetItem) => void;
  removeItem: (monthKey: string, itemId: string) => void;
  updateItem: (monthKey: string, item: BudgetItem) => void;
  isBudgetLoaded: boolean;

  /**
   * cloud sync hook - replace with real API call
   */
  syncToCloud: () => Promise<void>;
};

// constants
const STORAGE_KEYS = {
  months: "budget.months",
  activeMonthKey: "budget.activeMonthKey",
} as const;

const BudgetContext = createContext<BudgetContextType | undefined>(undefined);

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
                  items: (val.items as any[])
                    .filter((i) => i && typeof i === "object")
                    .map((i) => ({
                      id: String(i.id ?? ""),
                      name: String(i.name ?? ""),
                      amount: Number(i.amount ?? 0),
                      category: String(i.category ?? ""),
                      notes: typeof i.notes === "string" ? i.notes : undefined,
                      createdAt: String(i.createdAt ?? ""),
                    }))
                    .filter((i) => i.id && i.name && i.createdAt),
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

  // persist months to AsyncStorage whenever they change
  useEffect(() => {
    if (!isBudgetLoaded) return;
    AsyncStorage.setItem(STORAGE_KEYS.months, JSON.stringify(months)).catch(
      () => {},
    );
  }, [months, isBudgetLoaded]);

  // persist active month key
  useEffect(() => {
    if (!isBudgetLoaded) return;
    AsyncStorage.setItem(STORAGE_KEYS.activeMonthKey, activeMonthKey).catch(
      () => {},
    );
  }, [activeMonthKey, isBudgetLoaded]);

  // actions
  const setActiveMonthKey = (key: string) => setActiveMonthKeyState(key);

  const addItem = (item: BudgetItem) => {
    // infer which month the item belongs to from its createdAt date
    const monthKey = toMonthKey(new Date(item.createdAt));
    setMonths((prev) => {
      const existing = prev[monthKey] ?? { monthKey, items: [] };
      return {
        ...prev,
        [monthKey]: {
          ...existing,
          items: [item, ...existing.items],
        },
      };
    });
  };

  const removeItem = (monthKey: string, itemId: string) => {
    setMonths((prev) => {
      const existing = prev[monthKey];
      if (!existing) return prev;
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

  /**
   * cloud sync stub - to be implemented when backend is ready
   * the context API doesn't change; screens just call syncToCloud() wherever
   * appropriate (e.g., after addItem, on app foreground, on pull-to-refresh)
   */
  const syncToCloud = async (): Promise<void> => {
    // TODO: replace with real API call, e.g.:
    // await api.post("/budget/sync", { months });
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
