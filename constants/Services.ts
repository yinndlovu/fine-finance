import { ServiceDefinition } from "../types/subscription";

export const PREDEFINED_SERVICES: ServiceDefinition[] = [
  {
    id: "netflix",
    name: "Netflix",
    category: "entertainment",
    logoUri: require("../assets/services-icons/netflix.png"),
    plans: [
      { id: "mobile", name: "Mobile", price: 59 },
      { id: "basic", name: "Basic", price: 99 },
      { id: "standard", name: "Standard", price: 179 },
      { id: "premium", name: "Premium", price: 229 },
    ],
  },
  {
    id: "xbox-gamepass",
    name: "Xbox Game Pass",
    category: "entertainment",
    logoUri: require("../assets/services-icons/xbox.png"),
    plans: [
      { id: "essential", name: "Essential Game Pass", price: 139 },
      { id: "premium", name: "Premium Game Pass", price: 199 },
      { id: "pc", name: "PC Game Pass", price: 209 },
      { id: "ultimate", name: "Game Pass Ultimate", price: 239 },
    ],
  },
  {
    id: "spotify",
    name: "Spotify",
    category: "entertainment",
    logoUri: require("../assets/services-icons/spotify.png"),
    plans: [
      { id: "student", name: "Student", price: 38 },
      { id: "standard", name: "Standard", price: 70 },
      { id: "platinum", name: "Platinum", price: 180 },
    ],
  },
  {
    id: "audible",
    name: "Audible",
    category: "education",
    logoUri: require("../assets/services-icons/audible.png"),
    plans: [
      { id: "basic", name: "Basic (1 credit)", price: 99 },
      { id: "premium", name: "Premium Plus", price: 149 },
    ],
  },
  {
    id: "apple-music",
    name: "Apple Music",
    category: "entertainment",
    logoUri: require("../assets/services-icons/apple-music.png"),
    plans: [
      { id: "student", name: "Student", price: 38 },
      { id: "individual", name: "Individual", price: 70 },
      { id: "family", name: "Family", price: 129 },
    ],
  },
];
