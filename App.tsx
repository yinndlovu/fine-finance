// external
import { StatusBar } from "expo-status-bar";
import { View, Text, StyleSheet } from "react-native";
import { SafeAreaProvider } from "react-native-safe-area-context";
import * as SplashScreen from "expo-splash-screen";
import { useFonts } from "expo-font";
import { ReactNode, useCallback } from "react";
import { NavigationContainer } from "@react-navigation/native";
import { createStackNavigator } from "@react-navigation/stack";

// contexts
import { ThemeProvider, useTheme } from "./context/ThemeContext";
import { PreferencesProvider } from "./context/PreferencesContext";
import { BudgetProvider } from "./context/BudgetContext";

// screens
import HomeScreen from "./screens/HomeScreen";
import HistoryScreen from "./screens/HistoryScreen";
import SettingsScreen from "./screens/SettingsScreen";

SplashScreen.preventAutoHideAsync();
const Stack = createStackNavigator();

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
          <Stack.Screen name="Home" component={HomeScreen} />
          <Stack.Screen name="History" component={HistoryScreen} />
          <Stack.Screen name="Settings" component={SettingsScreen} />
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
    if (fontsLoaded || fontError) {
      await SplashScreen.hideAsync();
    }
  }, [fontsLoaded, fontError]);

  if (!fontsLoaded && !fontError) {
    return null;
  }

  return (
    <ThemeProvider>
      <SafeAreaProvider>
        <RootView onLayout={onLayoutRootView}>
          <PreferencesProvider>
            <BudgetProvider>
              <AppContent />
            </BudgetProvider>
          </PreferencesProvider>
        </RootView>
      </SafeAreaProvider>
    </ThemeProvider>
  );
}
