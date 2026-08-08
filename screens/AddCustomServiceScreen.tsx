import React, { useState } from "react";
import {
  Alert,
  Image,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  StyleSheet,
  TextInput,
  TouchableOpacity,
  TouchableWithoutFeedback,
  View,
} from "react-native";
import { useNavigation } from "@react-navigation/native";
import { Ionicons } from "@expo/vector-icons";
import * as ImagePicker from "expo-image-picker";
import { useSafeAreaInsets } from "react-native-safe-area-context";

import { useTheme } from "../context/ThemeContext";
import { useSubscriptions } from "../context/SubscriptionContext";
import { AppText } from "../components/AppText";
import { CATEGORIES } from "../constants/Categories";
import { SubscriptionPlan } from "../types/subscription";

const AddCustomServiceScreen: React.FC = () => {
  const navigation = useNavigation<any>();
  const { theme } = useTheme();
  const insets = useSafeAreaInsets();
  const { addCustomService } = useSubscriptions();

  const [name, setName] = useState("");
  const [category, setCategory] = useState(CATEGORIES[0]);
  const [logoUri, setLogoUri] = useState("");
  const [plans, setPlans] = useState<SubscriptionPlan[]>([
    { id: "plan_0", name: "", price: 0 },
  ]);
  const [error, setError] = useState("");

  const pickIcon = async () => {
    const permission = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (!permission.granted) {
      Alert.alert(
        "permission needed",
        "allow access to your photo library to pick an icon.",
      );
      return;
    }
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: "images",
      allowsEditing: true,
      aspect: [1, 1],
      quality: 0.8,
    });
    if (!result.canceled && result.assets[0]) {
      setLogoUri(result.assets[0].uri);
    }
  };

  const addPlan = () => {
    setPlans((prev) => [
      ...prev,
      { id: `plan_${prev.length}`, name: "", price: 0 },
    ]);
  };

  const removePlan = (idx: number) => {
    if (plans.length === 1) return;
    setPlans((prev) => prev.filter((_, i) => i !== idx));
  };

  const updatePlan = (idx: number, field: "name" | "price", value: string) => {
    setPlans((prev) =>
      prev.map((p, i) =>
        i === idx
          ? {
              ...p,
              [field]: field === "price" ? parseFloat(value) || 0 : value,
            }
          : p,
      ),
    );
  };

  const handleSave = () => {
    if (!name.trim()) {
      setError("please enter a service name.");
      return;
    }
    const validPlans = plans.filter((p) => p.name.trim());
    if (validPlans.length === 0) {
      setError("add at least one plan with a name.");
      return;
    }
    addCustomService({
      name: name.trim(),
      category,
      logoUri,
      plans: validPlans.map((p, i) => ({
        id: `plan_${i}`,
        name: p.name.trim(),
        price: p.price,
      })),
    });
    navigation.goBack();
  };

  return (
    <View style={styles.root}>
      <TouchableWithoutFeedback onPress={() => navigation.goBack()}>
        <View style={styles.backdrop} />
      </TouchableWithoutFeedback>

      <KeyboardAvoidingView
        behavior={Platform.OS === "ios" ? "padding" : "height"}
        style={styles.kav}
      >
        <View
          style={[
            styles.sheet,
            {
              backgroundColor: theme.card,
              paddingBottom: Math.max(insets.bottom, 24),
            },
          ]}
        >
          <View style={styles.header}>
            <AppText
              variant="bold"
              style={[styles.title, { color: theme.text }]}
            >
              add service
            </AppText>
            <TouchableOpacity onPress={() => navigation.goBack()}>
              <Ionicons name="close" size={24} color={theme.subtext} />
            </TouchableOpacity>
          </View>

          <ScrollView
            showsVerticalScrollIndicator={false}
            keyboardShouldPersistTaps="handled"
          >
            {/* icon */}
            <AppText
              variant="medium"
              style={[styles.label, { color: theme.subtext }]}
            >
              icon
            </AppText>
            <TouchableOpacity
              onPress={pickIcon}
              style={[
                styles.iconPicker,
                {
                  backgroundColor: theme.background,
                  borderColor: theme.accent,
                },
              ]}
            >
              {logoUri ? (
                <Image
                  source={{ uri: logoUri }}
                  style={styles.iconPreview}
                  resizeMode="cover"
                />
              ) : (
                <View style={styles.iconPlaceholder}>
                  <Ionicons
                    name="image-outline"
                    size={28}
                    color={theme.subtext}
                  />
                  <AppText
                    variant="light"
                    style={[styles.iconHint, { color: theme.subtext }]}
                  >
                    tap to pick
                  </AppText>
                </View>
              )}
            </TouchableOpacity>

            {/* name */}
            <AppText
              variant="medium"
              style={[styles.label, { color: theme.subtext }]}
            >
              name
            </AppText>
            <TextInput
              value={name}
              onChangeText={(t) => {
                setName(t);
                setError("");
              }}
              placeholder="e.g. Showmax, ChatGPT Plus"
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

            {/* category */}
            <AppText
              variant="medium"
              style={[styles.label, { color: theme.subtext }]}
            >
              category
            </AppText>
            <View style={styles.chips}>
              {CATEGORIES.map((cat) => (
                <TouchableOpacity
                  key={cat}
                  onPress={() => setCategory(cat)}
                  style={[
                    styles.chip,
                    {
                      backgroundColor:
                        category === cat ? theme.primary : theme.accent,
                    },
                  ]}
                >
                  <AppText
                    variant="medium"
                    style={{
                      color: category === cat ? "white" : theme.subtext,
                      fontSize: 13,
                    }}
                  >
                    {cat}
                  </AppText>
                </TouchableOpacity>
              ))}
            </View>

            {/* plans */}
            <AppText
              variant="medium"
              style={[styles.label, { color: theme.subtext }]}
            >
              plans
            </AppText>
            {plans.map((plan, idx) => (
              <View key={idx} style={styles.planRow}>
                <TextInput
                  value={plan.name}
                  onChangeText={(t) => updatePlan(idx, "name", t)}
                  placeholder="plan name"
                  placeholderTextColor={theme.subtext}
                  style={[
                    styles.planName,
                    {
                      color: theme.text,
                      borderColor: theme.accent,
                      backgroundColor: theme.background,
                    },
                  ]}
                />
                <TextInput
                  value={plan.price > 0 ? String(plan.price) : ""}
                  onChangeText={(t) => updatePlan(idx, "price", t)}
                  placeholder="price"
                  placeholderTextColor={theme.subtext}
                  keyboardType="decimal-pad"
                  style={[
                    styles.planPrice,
                    {
                      color: theme.text,
                      borderColor: theme.accent,
                      backgroundColor: theme.background,
                    },
                  ]}
                />
                <TouchableOpacity
                  onPress={() => removePlan(idx)}
                  disabled={plans.length === 1}
                  style={{ opacity: plans.length === 1 ? 0.3 : 1, padding: 2 }}
                >
                  <Ionicons
                    name="remove-circle-outline"
                    size={22}
                    color={theme.negative}
                  />
                </TouchableOpacity>
              </View>
            ))}
            <TouchableOpacity
              onPress={addPlan}
              style={[
                styles.addPlanBtn,
                {
                  borderColor: theme.accent,
                  backgroundColor: theme.background,
                },
              ]}
            >
              <Ionicons
                name="add-circle-outline"
                size={18}
                color={theme.primary}
              />
              <AppText
                variant="medium"
                style={[styles.addPlanText, { color: theme.primary }]}
              >
                add plan
              </AppText>
            </TouchableOpacity>

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
                save service
              </AppText>
            </TouchableOpacity>
          </ScrollView>
        </View>
      </KeyboardAvoidingView>
    </View>
  );
};

const styles = StyleSheet.create({
  root: { flex: 1, justifyContent: "flex-end" },
  backdrop: { ...StyleSheet.absoluteFill, backgroundColor: "rgba(0,0,0,0.45)" },
  kav: { width: "100%" },
  sheet: {
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    padding: 22,
    maxHeight: "92%",
  },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 18,
  },
  title: { fontSize: 20 },
  label: {
    fontSize: 11,
    textTransform: "uppercase",
    letterSpacing: 0.6,
    marginBottom: 8,
    marginTop: 14,
  },
  iconPicker: {
    height: 80,
    borderRadius: 14,
    borderWidth: 1,
    alignItems: "center",
    justifyContent: "center",
    overflow: "hidden",
  },
  iconPreview: { width: 80, height: 80 },
  iconPlaceholder: { alignItems: "center", gap: 4 },
  iconHint: { fontSize: 12 },
  input: {
    borderWidth: 1,
    borderRadius: 12,
    paddingHorizontal: 14,
    paddingVertical: 10,
    fontSize: 15,
  },
  chips: { flexDirection: "row", flexWrap: "wrap", gap: 8 },
  chip: { paddingHorizontal: 12, paddingVertical: 6, borderRadius: 10 },
  planRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    marginBottom: 8,
  },
  planName: {
    flex: 1,
    borderWidth: 1,
    borderRadius: 10,
    paddingHorizontal: 12,
    paddingVertical: 9,
    fontSize: 14,
  },
  planPrice: {
    width: 80,
    borderWidth: 1,
    borderRadius: 10,
    paddingHorizontal: 12,
    paddingVertical: 9,
    fontSize: 14,
    textAlign: "right",
  },
  addPlanBtn: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    borderWidth: 1,
    borderRadius: 10,
    paddingHorizontal: 14,
    paddingVertical: 10,
    marginBottom: 8,
  },
  addPlanText: { fontSize: 14 },
  error: { fontSize: 13, marginTop: 4 },
  btn: {
    marginTop: 16,
    paddingVertical: 14,
    borderRadius: 14,
    alignItems: "center",
  },
  btnText: { color: "white", fontSize: 16 },
});

export default AddCustomServiceScreen;
