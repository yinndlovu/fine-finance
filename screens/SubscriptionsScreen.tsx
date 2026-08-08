import React from "react";
import {
  Alert,
  FlatList,
  StyleSheet,
  TouchableOpacity,
  View,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useNavigation } from "@react-navigation/native";
import { Ionicons } from "@expo/vector-icons";

import { useTheme } from "../context/ThemeContext";
import { useSubscriptions } from "../context/SubscriptionContext";
import { usePreferences } from "../context/PreferencesContext";
import { AppText } from "../components/AppText";
import ServiceLogo from "../components/ServiceLogo";
import { formatAmount } from "../utils/currencyUtils";
import { ServiceDefinition } from "../types/subscription";
import { toMonthKey } from "../utils/monthUtils";

const SubscriptionsScreen: React.FC = () => {
  const navigation = useNavigation<any>();
  const { theme } = useTheme();
  const insets = useSafeAreaInsets();
  const { services, subscriptions, unsubscribe } = useSubscriptions();
  const { currencySymbol, currencyPosition } = usePreferences();

  const currentMonthKey = toMonthKey(new Date());

  const getActiveSub = (serviceId: string) =>
    subscriptions.find(
      (s) => s.serviceId === serviceId && s.endMonthKey === null,
    ) ?? null;

  const handleUnsubscribe = (subId: string, serviceName: string) => {
    Alert.alert(
      "unsubscribe",
      `stop ${serviceName} from next month onwards? this month stays in your budget.`,
      [
        { text: "cancel", style: "cancel" },
        {
          text: "unsubscribe",
          style: "destructive",
          onPress: () => unsubscribe(subId, currentMonthKey),
        },
      ],
    );
  };

  const activeSubscriptions = subscriptions.filter(
    (s) => s.endMonthKey === null,
  );

  const renderService = ({ item: service }: { item: ServiceDefinition }) => {
    const activeSub = getActiveSub(service.id);
    return (
      <View
        style={[
          styles.card,
          {
            backgroundColor: theme.card,
            borderColor: activeSub ? theme.positive + "60" : theme.accent,
          },
        ]}
      >
        <ServiceLogo uri={service.logoUri} name={service.name} size={44} />
        <View style={styles.cardBody}>
          <AppText
            variant="bold"
            style={[styles.cardName, { color: theme.text }]}
          >
            {service.name}
          </AppText>
          {activeSub ? (
            <AppText
              variant="light"
              style={[styles.cardSub, { color: theme.positive }]}
            >
              {activeSub.planName} ·{" "}
              {formatAmount(activeSub.price, currencySymbol, currencyPosition)}
              /mo
            </AppText>
          ) : (
            <AppText
              variant="light"
              style={[styles.cardSub, { color: theme.subtext }]}
            >
              {service.category} · {service.plans.length} plan
              {service.plans.length !== 1 ? "s" : ""}
            </AppText>
          )}
        </View>

        {activeSub ? (
          <TouchableOpacity
            onPress={() => handleUnsubscribe(activeSub.id, service.name)}
            style={[
              styles.actionBtn,
              {
                backgroundColor: theme.negative + "18",
                borderColor: theme.negative + "40",
              },
            ]}
          >
            <AppText
              variant="medium"
              style={{ color: theme.negative, fontSize: 13 }}
            >
              unsubscribe
            </AppText>
          </TouchableOpacity>
        ) : (
          <TouchableOpacity
            onPress={() => navigation.navigate("SubscribePlan", { service })}
            style={[
              styles.actionBtn,
              {
                backgroundColor: theme.primary + "18",
                borderColor: theme.primary + "40",
              },
            ]}
          >
            <AppText
              variant="medium"
              style={{ color: theme.primary, fontSize: 13 }}
            >
              subscribe
            </AppText>
          </TouchableOpacity>
        )}
      </View>
    );
  };

  return (
    <View
      style={[
        styles.container,
        { backgroundColor: theme.background, paddingTop: insets.top },
      ]}
    >
      <FlatList
        data={services}
        keyExtractor={(s) => s.id}
        contentContainerStyle={styles.list}
        ListHeaderComponent={
          <View style={styles.header}>
            <View style={styles.titleRow}>
              <AppText
                variant="bold"
                style={[styles.title, { color: theme.text }]}
              >
                subscriptions
              </AppText>
              <TouchableOpacity
                onPress={() => navigation.navigate("AddCustomService")}
                style={styles.addBtn}
              >
                <Ionicons
                  name="add-circle-outline"
                  size={26}
                  color={theme.primary}
                />
              </TouchableOpacity>
            </View>

            {activeSubscriptions.length > 0 && (
              <View
                style={[
                  styles.summaryCard,
                  { backgroundColor: theme.card, borderColor: theme.accent },
                ]}
              >
                <AppText
                  variant="light"
                  style={[styles.summaryLabel, { color: theme.subtext }]}
                >
                  monthly cost
                </AppText>
                <AppText
                  variant="bold"
                  style={[styles.summaryAmount, { color: theme.positive }]}
                >
                  {formatAmount(
                    activeSubscriptions.reduce((s, sub) => s + sub.price, 0),
                    currencySymbol,
                    currencyPosition,
                  )}
                </AppText>
                <AppText
                  variant="light"
                  style={[styles.summaryCount, { color: theme.subtext }]}
                >
                  {activeSubscriptions.length} active subscription
                  {activeSubscriptions.length !== 1 ? "s" : ""}
                </AppText>
              </View>
            )}

            <AppText
              variant="medium"
              style={[styles.sectionLabel, { color: theme.subtext }]}
            >
              all services
            </AppText>
          </View>
        }
        renderItem={renderService}
        ItemSeparatorComponent={() => <View style={styles.separator} />}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1 },
  list: { paddingBottom: 40 },
  header: { paddingHorizontal: 20, paddingTop: 10 },
  titleRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 16,
  },
  title: { fontSize: 26 },
  addBtn: {
    width: 44,
    height: 44,
    alignItems: "center",
    justifyContent: "center",
  },
  summaryCard: {
    borderRadius: 16,
    borderWidth: 1,
    padding: 18,
    marginBottom: 20,
    alignItems: "center",
  },
  summaryLabel: {
    fontSize: 12,
    textTransform: "uppercase",
    letterSpacing: 0.6,
  },
  summaryAmount: { fontSize: 32, marginTop: 4 },
  summaryCount: { fontSize: 12, marginTop: 4 },
  sectionLabel: {
    fontSize: 11,
    textTransform: "uppercase",
    letterSpacing: 0.8,
    marginBottom: 12,
  },
  card: {
    flexDirection: "row",
    alignItems: "center",
    gap: 14,
    marginHorizontal: 20,
    padding: 16,
    borderRadius: 16,
    borderWidth: 1,
  },
  cardBody: { flex: 1 },
  cardName: { fontSize: 15 },
  cardSub: { fontSize: 12, marginTop: 3 },
  actionBtn: {
    borderWidth: 1,
    borderRadius: 10,
    paddingHorizontal: 12,
    paddingVertical: 7,
  },
  separator: { height: 8 },
});

export default SubscriptionsScreen;
