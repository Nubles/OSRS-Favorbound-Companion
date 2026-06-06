import { ContentItem, Faction, RankThreshold } from "../types";

const allowed = (names: string[]): ContentItem[] => names.map((name) => ({ name, status: "allowed" }));
const conditional = (names: string[]): ContentItem[] => names.map((name) => ({ name, status: "conditional" }));
const locked = (names: string[]): ContentItem[] => names.map((name) => ({ name, status: "locked" }));

export const RANK_THRESHOLDS: RankThreshold[] = [
  { name: "Neutral", favor: 0 },
  { name: "Acquainted", favor: 650 },
  { name: "Trusted", favor: 1250 },
  { name: "Honored", favor: 3000 },
  { name: "Allied", favor: 5000 }
];

export const FACTIONS: Faction[] = [
  {
    id: "druids",
    name: "Druids",
    sigil: "Pine",
    tagline: "Guardians of nature and balance.",
    ethos: "Druids allow progress that protects, restores, grows, or communes with natural forces.",
    regions: [...allowed(["Taverley", "Karamja", "Entrana", "Tree Gnome routes"]), ...conditional(["Tirannwn", "Farming Guild"])],
    skills: [...allowed(["Herblore", "Farming", "Woodcutting", "Magic"]), ...conditional(["Prayer", "Fletching"])],
    gear: [...allowed(["Druid robes", "Staffs", "Herb sacks", "Skilling tools"]), ...conditional(["Nature talismans", "Gnome equipment"])],
    themes: [...allowed(["Nature and balance", "Druid rituals", "Farming and gathering", "Peaceful content"]), ...locked(["Dark rituals"])],
    duties: [
      { id: "druids-herb-run", label: "Complete herb patches", detail: "Finish herb patches without unrelated combat errands.", favor: 150, target: 5, unit: "patches" },
      { id: "druids-wood", label: "Chop nature logs", detail: "Gather logs from woodland routes for the faction storehouse.", favor: 120, target: 50, unit: "logs" },
      { id: "druids-runes", label: "Craft nature runes", detail: "Create nature runes or bank equivalent nature-linked resources.", favor: 250, target: 25, unit: "runes" }
    ],
    allianceCost: 5000,
    accent: "#73a94d"
  },
  {
    id: "dwarves",
    name: "Dwarves",
    sigil: "Forge",
    tagline: "Makers of fine craft and smiths.",
    ethos: "Dwarves allow content tied to mining, smithing, machinery, underground routes, and crafted power.",
    regions: [...allowed(["Keldagrim", "Dwarven Mine", "Ice Mountain"]), ...conditional(["Lovakengj", "Blast Furnace"])],
    skills: [...allowed(["Mining", "Smithing", "Crafting", "Construction"]), ...conditional(["Defence", "Ranged"])],
    gear: [...allowed(["Metal armour", "Pickaxes", "Crossbows", "Forged tools"]), ...conditional(["Cannon parts", "Barrows repairs"])],
    themes: [...allowed(["Ore and metal", "Machinery", "Crafted gear"]), ...locked(["Piracy and thieving"])],
    duties: [
      { id: "dwarves-ore", label: "Bank ore shipments", detail: "Mine and bank ore, essence, or bars for the hall.", favor: 180, target: 100, unit: "ore" },
      { id: "dwarves-forge", label: "Forge gear upgrades", detail: "Smith or craft practical gear upgrades.", favor: 240, target: 4, unit: "items" },
      { id: "dwarves-machine", label: "Use machinery routes", detail: "Unlock or use machinery-themed transport or activities.", favor: 300, target: 3, unit: "uses" }
    ],
    allianceCost: 5000,
    accent: "#d3a13b"
  },
  {
    id: "fremennik",
    name: "Fremennik",
    sigil: "Helm",
    tagline: "Brave seafarers of the northern wastes.",
    ethos: "Fremennik allow content that proves toughness, travel by sea, or supports northern warrior culture.",
    regions: [...allowed(["Rellekka", "Waterbirth", "Miscellania"]), ...conditional(["Lunar Isle", "Neitiznot"])],
    skills: [...allowed(["Attack", "Strength", "Fishing", "Hunter"]), ...conditional(["Magic", "Prayer"])],
    gear: [...allowed(["Melee gear", "Helms", "Harpoons", "Fremennik shields"]), ...conditional(["Lunar tools", "Dagannoth drops"])],
    themes: [...allowed(["Trials", "Boats", "Northern survival"]), ...locked(["Desert trade"])],
    duties: [
      { id: "fremennik-trial", label: "Win survival trials", detail: "Complete self-supplied combat or survival milestones.", favor: 260, target: 3, unit: "trials" },
      { id: "fremennik-sea", label: "Finish sea errands", detail: "Complete boat-linked journeys, clues, or island errands.", favor: 180, target: 4, unit: "errands" },
      { id: "fremennik-feast", label: "Stock feast supplies", detail: "Gather food and defeat a fitting northern enemy.", favor: 300, target: 6, unit: "steps" }
    ],
    allianceCost: 5000,
    accent: "#6aa2c8"
  },
  {
    id: "pirates",
    name: "Pirates",
    sigil: "Skull",
    tagline: "Rogues of the seas and seekers of fortune.",
    ethos: "Pirates allow content that involves sea routes, treasure, ranged skirmishes, thieving, or port towns.",
    regions: [...allowed(["Brimhaven", "Port Sarim", "Corsair Cove"]), ...conditional(["Mos Le'Harmless", "Wilderness coast"])],
    skills: [...allowed(["Ranged", "Thieving", "Agility", "Fishing"]), ...conditional(["Slayer", "Cooking"])],
    gear: [...allowed(["Ranged weapons", "Treasure trail items", "Light armour", "Looting tools"]), ...conditional(["Contraband upgrades", "Cannon use"])],
    themes: [...allowed(["Clues", "Coastal routes", "Plunder"]), ...locked(["Peaceful druid rites"])],
    duties: [
      { id: "pirates-plunder", label: "Complete plunder runs", detail: "Finish clue, thieving, or port-town profit routes.", favor: 190, target: 4, unit: "runs" },
      { id: "pirates-broadside", label: "Win ranged skirmishes", detail: "Defeat enemies using ranged-only combat.", favor: 240, target: 20, unit: "kills" },
      { id: "pirates-smuggle", label: "Move port supplies", detail: "Move supplies between ports before spending them.", favor: 210, target: 5, unit: "loads" }
    ],
    allianceCost: 5000,
    accent: "#c8694f"
  },
  {
    id: "desert-merchants",
    name: "Desert Merchants",
    sigil: "Scales",
    tagline: "Traders of the sands and distant lands.",
    ethos: "Desert Merchants allow progress through trade, travel preparation, desert tasks, and resource conversion.",
    regions: [...allowed(["Al Kharid", "Pollnivneach", "Sophanem"]), ...conditional(["Pyramid routes", "Desert treasure sites"])],
    skills: [...allowed(["Agility", "Crafting", "Thieving", "Cooking"]), ...conditional(["Magic", "Firemaking"])],
    gear: [...allowed(["Desert robes", "Jewellery", "Trade goods", "Waterskins"]), ...conditional(["Ancient items", "Gold-trimmed gear"])],
    themes: [...allowed(["Trade routes", "Supply planning", "Heat survival"]), ...locked(["Northern raids"])],
    duties: [
      { id: "desert-route", label: "Run desert routes", detail: "Complete desert routes with planned supplies only.", favor: 190, target: 4, unit: "routes" },
      { id: "desert-barter", label: "Barter upgrades", detail: "Craft, buy, or convert goods into useful upgrades.", favor: 230, target: 6, unit: "trades" },
      { id: "desert-heat", label: "Complete heat tasks", detail: "Finish desert-themed quest, diary, or activity steps.", favor: 280, target: 3, unit: "tasks" }
    ],
    allianceCost: 5000,
    accent: "#d79b42"
  },
  {
    id: "arceuus-scholars",
    name: "Arceuus Scholars",
    sigil: "Eye",
    tagline: "Seekers of dark knowledge and the unseen.",
    ethos: "Arceuus Scholars allow content linked to books, prayer, magic, Zeah scholarship, and controlled dark rituals.",
    regions: [...allowed(["Arceuus", "Great Kourend Library", "Dark altar routes"]), ...conditional(["Catacombs", "Zeah runecraft routes"])],
    skills: [...allowed(["Magic", "Prayer", "Runecraft", "Slayer"]), ...conditional(["Crafting", "Defence"])],
    gear: [...allowed(["Books", "Robes", "Ensouled heads", "Runes and staffs"]), ...conditional(["Ancient magicks", "Occult tools"])],
    themes: [...allowed(["Books", "Prayer", "Dark study", "Zeah scholarship"]), ...locked(["Pirate plunder"])],
    duties: [
      { id: "arceuus-study", label: "Recover library books", detail: "Complete lore, book, or library tasks.", favor: 160, target: 6, unit: "books" },
      { id: "arceuus-ritual", label: "Perform rituals", detail: "Train prayer or magic with a restricted resource plan.", favor: 260, target: 4, unit: "rituals" },
      { id: "arceuus-catacomb", label: "Clear catacomb targets", detail: "Defeat fitting Catacombs or undead targets.", favor: 300, target: 25, unit: "kills" }
    ],
    allianceCost: 5000,
    accent: "#9b6bd3"
  }
];

export const LOCKED_CONTENT: Record<"regions" | "skills" | "gear" | "themes", ContentItem[]> = {
  regions: locked(["Morytania", "Wilderness deep routes", "Raid lobbies"]),
  skills: locked(["PvP contracts", "Unaligned Slayer grinds", "Unsworn boss rushing"]),
  gear: locked(["Godwars items", "Raid uniques", "Infernal tools", "Dragon equipment"]),
  themes: locked(["PvP Wilderness", "Unrestricted rare drops", "Unaligned boss farming"])
};

export const getFaction = (id: string | null | undefined): Faction | undefined =>
  FACTIONS.find((faction) => faction.id === id);
