import { Faction } from "../types";

export const FACTIONS: Faction[] = [
  {
    id: "druids",
    name: "Druids",
    sigil: "leaf",
    tagline: "Restoration, herbs, and living places.",
    ethos: "Druids allow progress that protects, restores, grows, or communes with natural forces.",
    allowedThemes: ["Herblore", "Farming", "Nature magic", "Woodland errands"],
    regions: ["Taverley", "Karamja jungle", "Entrana", "Farming guild routes"],
    skills: ["Herblore", "Farming", "Woodcutting", "Magic"],
    gear: ["Druid robes", "Staffs", "Nature talismans", "Plant-based supplies"],
    duties: [
      { id: "druids-herb-run", label: "Complete a full herb run without combat errands.", favor: 3 },
      { id: "druids-restore", label: "Gather and process 50 natural resources.", favor: 4 },
      { id: "druids-cleanse", label: "Finish a quest or task with a nature/restoration theme.", favor: 6 }
    ],
    allianceCost: 12,
    accent: "#5e8f55"
  },
  {
    id: "dwarves",
    name: "Dwarves",
    sigil: "hammer",
    tagline: "Ore, machinery, craft, and stubborn progress.",
    ethos: "Dwarves allow content tied to mining, smithing, machinery, underground routes, and crafted power.",
    allowedThemes: ["Mining", "Smithing", "Machinery", "Crafted gear"],
    regions: ["Keldagrim", "Dwarven Mine", "Ice Mountain", "Lovakengj worksites"],
    skills: ["Mining", "Smithing", "Crafting", "Construction"],
    gear: ["Metal armour", "Pickaxes", "Crossbows", "Blast Furnace supplies"],
    duties: [
      { id: "dwarves-ore", label: "Mine and bank 150 ore or essence.", favor: 4 },
      { id: "dwarves-forge", label: "Smith or craft a full gear milestone.", favor: 5 },
      { id: "dwarves-machine", label: "Unlock or use a machinery-themed transport or activity.", favor: 6 }
    ],
    allianceCost: 14,
    accent: "#b88345"
  },
  {
    id: "fremennik",
    name: "Fremennik",
    sigil: "helm",
    tagline: "Trials, boats, northern grit, and self-reliance.",
    ethos: "Fremennik allow content that proves toughness, travel by sea, or supports northern warrior culture.",
    allowedThemes: ["Melee trials", "Boats", "Northern routes", "Self-reliant combat"],
    regions: ["Rellekka", "Waterbirth", "Miscellania", "Lunar Isle"],
    skills: ["Attack", "Strength", "Fishing", "Hunter"],
    gear: ["Melee gear", "Helms", "Harpoons", "Lunar-linked tools"],
    duties: [
      { id: "fremennik-trial", label: "Complete a combat or survival trial under your own supplies.", favor: 5 },
      { id: "fremennik-sea", label: "Finish a boat-linked journey, clue, or island errand.", favor: 4 },
      { id: "fremennik-feast", label: "Gather food and defeat a fitting northern enemy.", favor: 6 }
    ],
    allianceCost: 15,
    accent: "#6c8fa3"
  },
  {
    id: "pirates",
    name: "Pirates",
    sigil: "anchor",
    tagline: "Ports, contraband, clues, and coastal trouble.",
    ethos: "Pirates allow content that involves sea routes, treasure, ranged skirmishes, thieving, or port towns.",
    allowedThemes: ["Clues", "Thieving", "Ranged gear", "Coastal routes"],
    regions: ["Brimhaven", "Port Sarim", "Mos Le'Harmless", "Corsair Cove"],
    skills: ["Ranged", "Thieving", "Agility", "Fishing"],
    gear: ["Ranged weapons", "Treasure trail items", "Light armour", "Looting tools"],
    duties: [
      { id: "pirates-plunder", label: "Complete a clue, thieving route, or port-town profit run.", favor: 4 },
      { id: "pirates-broadside", label: "Defeat enemies using ranged-only combat.", favor: 5 },
      { id: "pirates-smuggle", label: "Move supplies between two ports before spending them.", favor: 5 }
    ],
    allianceCost: 13,
    accent: "#3f8ca8"
  },
  {
    id: "desert-merchants",
    name: "Desert Merchants",
    sigil: "coin",
    tagline: "Trade routes, heat, supply planning, and negotiated power.",
    ethos: "Desert Merchants allow progress through trade, travel preparation, desert tasks, and resource conversion.",
    allowedThemes: ["Trade routes", "Agility", "Crafting", "Supply planning"],
    regions: ["Al Kharid", "Pollnivneach", "Sophanem", "Menaphos-adjacent routes"],
    skills: ["Agility", "Crafting", "Thieving", "Cooking"],
    gear: ["Desert robes", "Jewellery", "Trade goods", "Waterskins and supplies"],
    duties: [
      { id: "desert-route", label: "Complete a desert route with planned supplies only.", favor: 4 },
      { id: "desert-barter", label: "Craft, buy, or convert goods into a new upgrade.", favor: 5 },
      { id: "desert-heat", label: "Finish a desert-themed quest, diary step, or activity.", favor: 6 }
    ],
    allianceCost: 12,
    accent: "#d59a3d"
  },
  {
    id: "arceuus-scholars",
    name: "Arceuus Scholars",
    sigil: "book",
    tagline: "Books, prayer, dark study, and careful forbidden knowledge.",
    ethos: "Arceuus Scholars allow content linked to books, prayer, magic, Zeah scholarship, and controlled dark rituals.",
    allowedThemes: ["Magic", "Prayer", "Books", "Zeah scholarship"],
    regions: ["Arceuus", "Great Kourend libraries", "Dark altar routes", "Catacombs"],
    skills: ["Magic", "Prayer", "Runecraft", "Slayer"],
    gear: ["Books", "Robes", "Ensouled heads", "Runes and staffs"],
    duties: [
      { id: "arceuus-study", label: "Complete a lore, book, or library task.", favor: 3 },
      { id: "arceuus-ritual", label: "Train prayer or magic using a restricted resource plan.", favor: 5 },
      { id: "arceuus-catacomb", label: "Defeat a fitting Catacombs or undead target.", favor: 6 }
    ],
    allianceCost: 14,
    accent: "#8d63b0"
  }
];

export const getFaction = (id: string | null | undefined): Faction | undefined =>
  FACTIONS.find((faction) => faction.id === id);
