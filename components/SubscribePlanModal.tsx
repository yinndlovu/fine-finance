import React, { useEffect, useState } from "react";
import {
  KeyboardAvoidingView,
  Modal,
  Platform,
  ScrollView,
  StyleSheet,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useSafeAreaInsets } from "react-native-safe-area-context";

import { useTheme } from "../context/ThemeContext";
import { useSubscriptions } from "../context/SubscriptionContext";
import { usePreferences } from "../context/PreferencesContext";
import { AppText } from "./AppText";
import ServiceLogo from "./ServiceLogo";
import { ServiceDefinition } from "../types/subscription";
import {
  toMonthKey,
  monthLabel,
  nextMonthKey,
  prevMonthKey,
  isCurrentMonth,
} from "../utils/monthUtils";

interface Props {
  service: ServiceDefinition | null;
  onClose: () => void;
}

const SubscribePlanModal: React.FC<Props> = ({ service, onClose }) => {
  const { theme } = useTheme();
  const insets = useSafeAreaInsets();
  const { subscribe } = useSubscriptions();
  const { currencySymbol } = usePreferences();

  const currentMonthKey = toMonthKey(new Date());

  const [selectedPlanId, setSelectedPlanId] = useState<string>("");
  const [priceText, setPriceText] = useState("");
  const [startMonthKey, setStartMonthKey] = useState(currentMonthKey);
  const [error, setError] = useState("");

  useEffect(() => {
    if (service) {
      const first = service.plans[0];
      setSelectedPlanId(first?.id ?? "");
      setPriceText(first?.price ? String(first.price) : "");
      setStartMonthKey(currentMonthKey);
      setError("");
    }
  }, [service]);

  const handleSelectPlan = (planId: string) => {
    setSelectedPlanId(planId);
    const plan = service?.plans.find((p) => p.id === planId);
    if (plan) setPriceText(String(plan.price));
    setError("");
  };

  const handleSave = () => {
    if (!service) return;
    const plan = service.plans.find((p) => p.id === selectedPlanId);
    if (!plan) {
      setError("please select a plan.");
      return;
    }
    const price = parseFloat(priceText.replace(",", "."));
    if (isNaN(price) || price <= 0) {
      setError("please enter a valid price.");
      return;
    }
    subscribe(service.id, plan.id, plan.name, price, startMonthKey);
    onClose();
  };

  if (!service) return null;

  return (
    <Modal
      visible={!!service}
      transparent
      animationType="slide"
      onRequestClose={onClose}
    >
      <KeyboardAvoidingView style={styles.overlay} behavior="padding">
        <View
          style={[
            styles.sheet,
            {
              backgroundColor: theme.card,
              paddingBottom: Math.max(insets.bottom, 24),
            },
          ]}
        >
          {/* header */}
          <View style={styles.header}>
            <ServiceLogo uri={service.logoUri} name={service.name} size={40} />
            <View style={styles.headerText}>
              <AppText
                variant="bold"
                style={[styles.title, { color: theme.text }]}
              >
                {service.name}
              </AppText>
              <AppText
                variant="light"
                style={[styles.category, { color: theme.subtext }]}
              >
                {service.category}
              </AppText>
            </View>
            <TouchableOpacity onPress={onClose}>
              <Ionicons name="close" size={24} color={theme.subtext} />
            </TouchableOpacity>
          </View>

          <ScrollView showsVerticalScrollIndicator={false}>
            {/* plan selector */}
            <AppText
              variant="medium"
              style={[styles.sectionLabel, { color: theme.subtext }]}
            >
              select plan
            </AppText>
            {service.plans.map((plan) => {
              const isSelected = plan.id === selectedPlanId;
              return (
                <TouchableOpacity
                  key={plan.id}
                  onPress={() => handleSelectPlan(plan.id)}
                  style={[
                    styles.planRow,
                    {
                      backgroundColor: isSelected
                        ? theme.primary + "18"
                        : theme.background,
                      borderColor: isSelected ? theme.primary : theme.accent,
                    },
                  ]}
                >
                  <View
                    style={[
                      styles.radio,
                      {
                        borderColor: isSelected
                          ? theme.primary
                          : theme.subtext + "60",
                      },
                    ]}
                  >
                    {isSelected && (
                      <View
                        style={[
                          styles.radioDot,
                          { backgroundColor: theme.primary },
                        ]}
                      />
                    )}
                  </View>
                  <AppText
                    variant={isSelected ? "bold" : "regular"}
                    style={[styles.planName, { color: theme.text }]}
                  >
                    {plan.name}
                  </AppText>
                  <AppText
                    variant="medium"
                    style={[styles.planPrice, { color: theme.subtext }]}
                  >
                    {currencySymbol} {plan.price}
                  </AppText>
                </TouchableOpacity>
              );
            })}

            {/* price override */}
            <AppText
              variant="medium"
              style={[styles.sectionLabel, { color: theme.subtext }]}
            >
              your price ({currencySymbol}) — edit if needed
            </AppText>
            <TextInput
              value={priceText}
              onChangeText={(t) => {
                setPriceText(t);
                setError("");
              }}
              keyboardType="decimal-pad"
              placeholder="0.00"
              placeholderTextColor={theme.subtext}
              style={[
                styles.input,
                {
                  color: theme.text,
                  borderColor: theme.accent,
                  backgroundColor: theme.background,
                },
              ]}
            />

            {/* start month */}
            <AppText
              variant="medium"
              style={[styles.sectionLabel, { color: theme.subtext }]}
            >
              start from
            </AppText>
            <View
              style={[
                styles.monthPicker,
                {
                  backgroundColor: theme.background,
                  borderColor: theme.accent,
                },
              ]}
            >
              <TouchableOpacity
                onPress={() =>
                  setStartMonthKey((k) => {
                    const prev = prevMonthKey(k);
                    return prev >= currentMonthKey ? prev : k;
                  })
                }
                style={styles.monthArrow}
              >
                <Ionicons
                  name="chevron-back"
                  size={18}
                  color={
                    startMonthKey === currentMonthKey
                      ? theme.accent
                      : theme.subtext
                  }
                />
              </TouchableOpacity>
              <View style={styles.monthLabelWrap}>
                <AppText
                  variant="bold"
                  style={[styles.monthText, { color: theme.text }]}
                >
                  {monthLabel(startMonthKey)}
                </AppText>
                {isCurrentMonth(startMonthKey) && (
                  <AppText
                    variant="light"
                    style={[styles.monthSub, { color: theme.subtext }]}
                  >
                    marked as spent immediately
                  </AppText>
                )}
              </View>
              <TouchableOpacity
                onPress={() => setStartMonthKey((k) => nextMonthKey(k))}
                style={styles.monthArrow}
              >
                <Ionicons
                  name="chevron-forward"
                  size={18}
                  color={theme.subtext}
                />
              </TouchableOpacity>
            </View>

            {!!error && (
              <AppText
                variant="light"
                style={[styles.error, { color: theme.negative }]}
              >
                {error}
              </AppText>
            )}

            <TouchableOpacity
              onPress={handleSave}
              style={[styles.btn, { backgroundColor: theme.primary }]}
            >
              <AppText variant="bold" style={styles.btnText}>
                subscribe
              </AppText>
            </TouchableOpacity>
          </ScrollView>
        </View>
      </KeyboardAvoidingView>
    </Modal>
  );
};

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    justifyContent: "flex-end",
    backgroundColor: "rgba(0,0,0,0.45)",
  },
  sheet: {
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    padding: 22,
    maxHeight: "92%",
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    marginBottom: 20,
  },
  headerText: { flex: 1 },
  title: { fontSize: 18 },
  category: { fontSize: 12, marginTop: 2, textTransform: "capitalize" },
  sectionLabel: {
    fontSize: 11,
    textTransform: "uppercase",
    letterSpacing: 0.6,
    marginBottom: 8,
    marginTop: 16,
  },
  planRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    borderWidth: 1,
    borderRadius: 12,
    paddingHorizontal: 14,
    paddingVertical: 12,
    marginBottom: 8,
  },
  radio: {
    width: 18,
    height: 18,
    borderRadius: 9,
    borderWidth: 1.5,
    alignItems: "center",
    justifyContent: "center",
  },
  radioDot: {
    width: 9,
    height: 9,
    borderRadius: 4.5,
  },
  planName: { flex: 1, fontSize: 14 },
  planPrice: { fontSize: 13 },
  input: {
    borderWidth: 1,
    borderRadius: 12,
    paddingHorizontal: 14,
    paddingVertical: 11,
    fontSize: 18,
  },
  monthPicker: {
    flexDirection: "row",
    alignItems: "center",
    borderWidth: 1,
    borderRadius: 12,
    paddingVertical: 10,
    paddingHorizontal: 4,
  },
  monthArrow: {
    width: 38,
    height: 38,
    alignItems: "center",
    justifyContent: "center",
  },
  monthLabelWrap: { flex: 1, alignItems: "center" },
  monthText: { fontSize: 14 },
  monthSub: { fontSize: 11, marginTop: 2 },
  error: { fontSize: 13, marginTop: 8 },
  btn: {
    marginTop: 20,
    paddingVertical: 14,
    borderRadius: 14,
    alignItems: "center",
  },
  btnText: { color: "white", fontSize: 16 },
});

export default SubscribePlanModal;
