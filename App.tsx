// external
import { StatusBar } from "expo-status-bar";
import { View } from "react-native";
import { SafeAreaProvider } from "react-native-safe-area-context";
import * as SplashScreen from "expo-splash-screen";
import { useFonts } from "expo-font";
import { ReactNode, useCallback } from "react";
import { NavigationContainer } from "@react-navigation/native";
import { createStackNavigator } from "@react-navigation/stack";
import { createBottomTabNavigator } from "@react-navigation/bottom-tabs";
import { Ionicons } from "@expo/vector-icons";

// contexts
import { ThemeProvider, useTheme } from "./context/ThemeContext";
import { PreferencesProvider } from "./context/PreferencesContext";
import { BudgetProvider } from "./context/BudgetContext";
import { SubscriptionProvider } from "./context/SubscriptionContext";

// screens
import HomeScreen from "./screens/HomeScreen";
import SubscriptionsScreen from "./screens/SubscriptionsScreen";
import HistoryScreen from "./screens/HistoryScreen";
import SettingsScreen from "./screens/SettingsScreen";
import AddItemScreen from "./screens/AddItemScreen";
import SetIncomeScreen from "./screens/SetIncomeScreen";
import SubscribePlanScreen from "./screens/SubscribePlanScreen";
import AddCustomServiceScreen from "./screens/AddCustomServiceScreen";

SplashScreen.preventAutoHideAsync();

const Stack = createStackNavigator();
const Tab = createBottomTabNavigator();

/** Bottom tabs — Home (budget) and Subscriptions */
const MainTabs = () => {
  const { theme } = useTheme();

  return (
    <Tab.Navigator
      screenOptions={({ route }) => ({
        headerShown: false,
        tabBarStyle: {
          backgroundColor: theme.card,
          borderTopColor: theme.accent,
          borderTopWidth: 1,
        },
        tabBarActiveTintColor: theme.primary,
        tabBarInactiveTintColor: theme.subtext,
        tabBarLabelStyle: {
          fontFamily: "App-Medium",
          fontSize: 11,
          marginBottom: 2,
        },
        tabBarIcon: ({ focused, color, size }) => {
          if (route.name === "Home") {
            return (
              <Ionicons
                name={focused ? "home" : "home-outline"}
                size={size}
                color={color}
              />
            );
          }
          return (
            <Ionicons
              name={focused ? "repeat" : "repeat-outline"}
              size={size}
              color={color}
            />
          );
        },
      })}
    >
      <Tab.Screen
        name="Home"
        component={HomeScreen}
        options={{ tabBarLabel: "budget" }}
      />
      <Tab.Screen
        name="Subscriptions"
        component={SubscriptionsScreen}
        options={{ tabBarLabel: "subscriptions" }}
      />
    </Tab.Navigator>
  );
};

const AppContent = () => {
  const { isDark, theme } = useTheme();

  return (
    <>
      <NavigationContainer>
        <Stack.Navigator
          screenOptions={{
            headerShown: false,
            cardStyle: { backgroundColor: theme.background },
          }}
        >
          {/* tabs sit at the root */}
          <Stack.Screen name="MainTabs" component={MainTabs} />

          {/* regular stack screens */}
          <Stack.Screen name="History" component={HistoryScreen} />
          <Stack.Screen name="Settings" component={SettingsScreen} />

          {/*
           * transparentModal screens — these replace all RN Modal components.
           * The previous screen stays visible behind the dim backdrop.
           * KAV works correctly because there is no separate Modal window.
           */}
          <Stack.Screen
            name="AddItem"
            component={AddItemScreen}
            options={{
              presentation: "transparentModal",
              cardStyle: { backgroundColor: "transparent" },
            }}
          />
          <Stack.Screen
            name="SetIncome"
            component={SetIncomeScreen}
            options={{
              presentation: "transparentModal",
              cardStyle: { backgroundColor: "transparent" },
            }}
          />
          <Stack.Screen
            name="SubscribePlan"
            component={SubscribePlanScreen}
            options={{
              presentation: "transparentModal",
              cardStyle: { backgroundColor: "transparent" },
            }}
          />
          <Stack.Screen
            name="AddCustomService"
            component={AddCustomServiceScreen}
            options={{
              presentation: "transparentModal",
              cardStyle: { backgroundColor: "transparent" },
            }}
          />
        </Stack.Navigator>
      </NavigationContainer>
      <StatusBar style={isDark ? "light" : "dark"} />
    </>
  );
};

const RootView = ({
  onLayout,
  children,
}: {
  onLayout: () => Promise<void> | void;
  children: ReactNode;
}) => {
  const { theme } = useTheme();
  return (
    <View
      style={{ flex: 1, backgroundColor: theme.background }}
      onLayout={onLayout}
    >
      {children}
    </View>
  );
};

export default function App() {
  const [fontsLoaded, fontError] = useFonts({
    "App-Bold": require("./assets/fonts/Inter-Bold.ttf"),
    "App-Regular": require("./assets/fonts/Inter-Regular.ttf"),
    "App-Medium": require("./assets/fonts/Inter-Medium.ttf"),
    "App-Italic": require("./assets/fonts/Inter-Italic.ttf"),
    "App-Light": require("./assets/fonts/Inter-Light.ttf"),
  });

  const onLayoutRootView = useCallback(async () => {
    if (fontsLoaded || fontError) await SplashScreen.hideAsync();
  }, [fontsLoaded, fontError]);

  if (!fontsLoaded && !fontError) return null;

  return (
    <ThemeProvider>
      <SafeAreaProvider>
        <RootView onLayout={onLayoutRootView}>
          <PreferencesProvider>
            <BudgetProvider>
              {/*
               * SubscriptionProvider is inside BudgetProvider so it can
               * call useBudget() to inject/remove budget items.
               */}
              <SubscriptionProvider>
                <AppContent />
              </SubscriptionProvider>
            </BudgetProvider>
          </PreferencesProvider>
        </RootView>
      </SafeAreaProvider>
    </ThemeProvider>
  );
}
