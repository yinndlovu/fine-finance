export type Theme = {
  background: string;
  card: string;
  text: string;
  subtext: string;
  primary: string;
  accent: string;
  positive: string; // used for income / positive amounts
  negative: string; // used for expense / negative amounts
};

export const LightTheme: Theme = {
  background: "#F7F9F8",
  card: "#FFFFFF",
  text: "#1A2E25",
  subtext: "#525754",
  primary: "#2F016B",
  accent: "#F3ECFF",
  positive: "#1E8A5E",
  negative: "#D94F3D",
};

export const DarkTheme: Theme = {
  background: "#0A0710",
  card: "#15111F",
  text: "#EEEBF4",
  subtext: "#8E8799",
  primary: "#9B72F0",
  accent: "#262033",
  positive: "#45C48A",
  negative: "#EB6B5C",
};

export const CATEGORY_COLORS = [
  "#8230ee",
  "#2A7AE8",
  "#E8A020",
  "#1E8A5E",
  "#D94F3D",
  "#8A6FE8",
  "#E83F75",
  "#20C9A0",
];
