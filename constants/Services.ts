import { ServiceDefinition } from "../types/subscription";

export const PREDEFINED_SERVICES: ServiceDefinition[] = [
  {
    id: "netflix",
    name: "Netflix",
    category: "entertainment",
    logoUri: "https://logo.clearbit.com/netflix.com",
    plans: [
      { id: "ads", name: "Standard with Ads", price: 99 },
      { id: "standard", name: "Standard", price: 169 },
      { id: "premium", name: "Premium", price: 229 },
    ],
  },
  {
    id: "xbox-gamepass",
    name: "Xbox Game Pass",
    category: "entertainment",
    logoUri: "https://logo.clearbit.com/xbox.com",
    plans: [
      { id: "pc", name: "PC Game Pass", price: 79 },
      { id: "ultimate", name: "Game Pass Ultimate", price: 149 },
    ],
  },
  {
    id: "spotify",
    name: "Spotify",
    category: "entertainment",
    logoUri: "https://logo.clearbit.com/spotify.com",
    plans: [
      { id: "individual", name: "Individual", price: 89 },
      { id: "duo", name: "Duo", price: 109 },
      { id: "family", name: "Family", price: 149 },
      { id: "student", name: "Student", price: 45 },
    ],
  },
  {
    id: "audible",
    name: "Audible",
    category: "education",
    logoUri: "https://logo.clearbit.com/audible.com",
    plans: [
      { id: "basic", name: "Basic (1 credit)", price: 99 },
      { id: "premium", name: "Premium Plus", price: 149 },
    ],
  },
  {
    id: "apple-music",
    name: "Apple Music",
    category: "entertainment",
    logoUri: "https://logo.clearbit.com/apple.com",
    plans: [
      { id: "student", name: "Student", price: 59 },
      { id: "individual", name: "Individual", price: 89 },
      { id: "family", name: "Family", price: 139 },
    ],
  },
];
