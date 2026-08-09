import { ImageSourcePropType } from "react-native";

export interface SubscriptionPlan {
  id: string;
  name: string;
  price: number;
}

export interface ServiceDefinition {
  id: string;
  name: string;
  category: string;
  logoUri: string | ImageSourcePropType;
  plans: SubscriptionPlan[];
  isCustom?: boolean;
}

export interface ActiveSubscription {
  id: string;
  serviceId: string;
  serviceName: string;
  planId: string;
  planName: string;
  price: number;
  category: string;
  logoUri: string | ImageSourcePropType;
  startMonthKey: string;
  endMonthKey: string | null;
}
