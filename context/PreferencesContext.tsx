// external
import AsyncStorage from "@react-native-async-storage/async-storage";
import {
  createContext,
  ReactNode,
  useContext,
  useEffect,
  useState,
} from "react";

// types
export type CurrencyPosition = "before" | "after";

type PreferencesContextType = {
  currencySymbol: string;
  setCurrencySymbol: (symbol: string) => void;
  currencyPosition: CurrencyPosition;
  setCurrencyPosition: (pos: CurrencyPosition) => void;
  isPreferencesLoaded: boolean;
};

const STORAGE_KEYS = {
  currencySymbol: "preferences.currencySymbol",
  currencyPosition: "preferences.currencyPosition",
} as const;

const PreferencesContext = createContext<PreferencesContextType | undefined>(
  undefined,
);

export const PreferencesProvider = ({ children }: { children: ReactNode }) => {
  const [currencySymbol, setCurrencySymbolState] = useState("R");
  const [currencyPosition, setCurrencyPositionState] =
    useState<CurrencyPosition>("before");
  const [isPreferencesLoaded, setIsPreferencesLoaded] = useState(false);

  useEffect(() => {
    let isMounted = true;
    (async () => {
      try {
        const [storedSymbol, storedPosition] = await Promise.all([
          AsyncStorage.getItem(STORAGE_KEYS.currencySymbol),
          AsyncStorage.getItem(STORAGE_KEYS.currencyPosition),
        ]);

        if (!isMounted) {
          return;
        }

        if (storedSymbol) {
          setCurrencySymbolState(storedSymbol);
        }
        if (storedPosition === "before" || storedPosition === "after") {
          setCurrencyPositionState(storedPosition);
        }
      } finally {
        if (isMounted) {
          setIsPreferencesLoaded(true);
        }
      }
    })();

    return () => {
      isMounted = false;
    };
  }, []);

  const setCurrencySymbol = (symbol: string) => {
    setCurrencySymbolState(symbol);
    AsyncStorage.setItem(STORAGE_KEYS.currencySymbol, symbol).catch(() => {});
  };

  const setCurrencyPosition = (pos: CurrencyPosition) => {
    setCurrencyPositionState(pos);
    AsyncStorage.setItem(STORAGE_KEYS.currencyPosition, pos).catch(() => {});
  };

  return (
    <PreferencesContext.Provider
      value={{
        currencySymbol,
        setCurrencySymbol,
        currencyPosition,
        setCurrencyPosition,
        isPreferencesLoaded,
      }}
    >
      {children}
    </PreferencesContext.Provider>
  );
};

export const usePreferences = () => {
  const context = useContext(PreferencesContext);
  if (!context) {
    throw new Error("usePreferences must be used within PreferencesProvider");
  }
  return context;
};
