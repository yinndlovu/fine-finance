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
import "react-native-get-random-values";
import { v4 as uuidv4 } from "uuid";

// internal
import { ServiceDefinition, ActiveSubscription } from "../types/subscription";
import { BudgetItem } from "../types/budget";
import { PREDEFINED_SERVICES } from "../constants/Services";
import { useBudget } from "./BudgetContext";
import {
  toMonthKey,
  nextMonthKey,
  addMonthsToKey,
  fromMonthKey,
} from "../utils/monthUtils";

type SubscriptionContextType = {
  services: ServiceDefinition[];
  subscriptions: ActiveSubscription[];
  subscribe: (
    serviceId: string,
    planId: string,
    planName: string,
    price: number,
    startMonthKey: string,
  ) => void;
  unsubscribe: (subscriptionId: string, currentMonthKey: string) => void;
  addCustomService: (
    service: Omit<ServiceDefinition, "id" | "isCustom">,
  ) => void;
  isSubscriptionLoaded: boolean;
};

const STORAGE_KEYS = {
  customServices: "subscriptions.customServices",
  active: "subscriptions.active",
} as const;

const MONTHS_AHEAD = 24;

const SubscriptionContext = createContext<SubscriptionContextType | undefined>(
  undefined,
);

export const SubscriptionProvider = ({ children }: { children: ReactNode }) => {
  // Must be nested inside BudgetProvider
  const { addSubscriptionItemsBatch, removeSubscriptionItems } = useBudget();

  const [customServices, setCustomServices] = useState<ServiceDefinition[]>([]);
  const [subscriptions, setSubscriptions] = useState<ActiveSubscription[]>([]);
  const [isSubscriptionLoaded, setIsSubscriptionLoaded] = useState(false);

  const services = useMemo(
    () => [...PREDEFINED_SERVICES, ...customServices],
    [customServices],
  );

  useEffect(() => {
    let isMounted = true;
    (async () => {
      try {
        const [customJson, activeJson] = await Promise.all([
          AsyncStorage.getItem(STORAGE_KEYS.customServices),
          AsyncStorage.getItem(STORAGE_KEYS.active),
        ]);
        if (!isMounted) return;
        if (customJson) {
          const parsed = JSON.parse(customJson);
          if (Array.isArray(parsed)) setCustomServices(parsed);
        }
        if (activeJson) {
          const parsed = JSON.parse(activeJson);
          if (Array.isArray(parsed)) setSubscriptions(parsed);
        }
      } catch {
        // ignore
      } finally {
        if (isMounted) setIsSubscriptionLoaded(true);
      }
    })();
    return () => {
      isMounted = false;
    };
  }, []);

  useEffect(() => {
    if (!isSubscriptionLoaded) return;
    AsyncStorage.setItem(
      STORAGE_KEYS.customServices,
      JSON.stringify(customServices),
    ).catch(() => {});
  }, [customServices, isSubscriptionLoaded]);

  useEffect(() => {
    if (!isSubscriptionLoaded) return;
    AsyncStorage.setItem(
      STORAGE_KEYS.active,
      JSON.stringify(subscriptions),
    ).catch(() => {});
  }, [subscriptions, isSubscriptionLoaded]);

  const subscribe = (
    serviceId: string,
    planId: string,
    planName: string,
    price: number,
    startMonthKey: string,
  ) => {
    const service = services.find((s) => s.id === serviceId);
    if (!service) return;

    const subId = uuidv4();
    const currentMonthKey = toMonthKey(new Date());

    const newSub: ActiveSubscription = {
      id: subId,
      serviceId,
      serviceName: service.name,
      planId,
      planName,
      price,
      category: service.category,
      logoUri: service.logoUri,
      startMonthKey,
      endMonthKey: null,
    };

    const entries: { monthKey: string; item: BudgetItem }[] = [];
    for (let i = 0; i <= MONTHS_AHEAD; i++) {
      const monthKey = addMonthsToKey(startMonthKey, i);
      entries.push({
        monthKey,
        item: {
          id: `sub_${subId}_${monthKey}`,
          name: service.name,
          amount: price,
          category: service.category,
          subscriptionId: subId,
          spent: monthKey <= currentMonthKey,
          createdAt: fromMonthKey(monthKey).toISOString(),
          notes: planName,
        },
      });
    }

    addSubscriptionItemsBatch(entries);
    setSubscriptions((prev) => [...prev, newSub]);
  };

  const unsubscribe = (subscriptionId: string, currentMonthKey: string) => {
    const removeFrom = nextMonthKey(currentMonthKey);
    removeSubscriptionItems(subscriptionId, removeFrom);
    setSubscriptions((prev) =>
      prev.map((s) =>
        s.id === subscriptionId ? { ...s, endMonthKey: removeFrom } : s,
      ),
    );
  };

  const addCustomService = (
    service: Omit<ServiceDefinition, "id" | "isCustom">,
  ) => {
    setCustomServices((prev) => [
      ...prev,
      { ...service, id: uuidv4(), isCustom: true },
    ]);
  };

  const value = useMemo(
    () => ({
      services,
      subscriptions,
      subscribe,
      unsubscribe,
      addCustomService,
      isSubscriptionLoaded,
    }),
    [services, subscriptions, isSubscriptionLoaded],
  );

  return (
    <SubscriptionContext.Provider value={value}>
      {children}
    </SubscriptionContext.Provider>
  );
};

export const useSubscriptions = () => {
  const context = useContext(SubscriptionContext);
  if (!context)
    throw new Error(
      "useSubscriptions must be used within SubscriptionProvider",
    );
  return context;
};
