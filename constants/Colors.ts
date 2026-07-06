export type Theme = {
  background: string;
  card: string;
  text: string;
  subtext: string;
  primary: string;
  accent: string;
  /** used for income / positive amounts */
  positive: string;
  /** used for expense / negative amounts */
  negative: string;
};

export const LightTheme: Theme = {
  background: "#F7F9F8",
  card: "#FFFFFF",
  text: "#1A2E25",
  subtext: "#5F7A6A",
  primary: "#2F016B",
  accent: "#DFF0E8",
  positive: "#1E8A5E",
  negative: "#D94F3D",
};

export const DarkTheme: Theme = {
  background: "#180038",
  card: "#230050",
  text: "#E8F5EF",
  subtext: "#7EA891",
  primary: "#8230ee",
  accent: "#1E3A2C",
  positive: "#3BAB74",
  negative: "#E86858",
};
