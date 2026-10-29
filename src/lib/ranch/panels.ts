export const PAGES = [
  { id: "home", label: "Home" },
  { id: "grounds", label: "Grounds" },
  { id: "stay", label: "Stay" },
  { id: "events", label: "Events" },
  { id: "vendors", label: "Vendors" },
] as const;

export type PageId = (typeof PAGES)[number]["id"];

export type PanelItem = { stat: string; title: string; text: string };

export type PanelFields = {
  kicker: string;
  title: string;
  body: string;
  note: string;
  items: PanelItem[];
};

export type ItemMode = "none" | "title" | "stat-title" | "title-text" | "stat-title-text";

export type PanelEdit = { kicker: boolean; title: boolean; body: boolean; note: boolean };

export type Panel = {
  id: string;
  label: string;
  page: PageId;
  sort: number;
  hidden: boolean;
  fields: PanelFields;
  edit: PanelEdit;
  itemMode: ItemMode;
};

type PanelDef = Omit<Panel, "hidden">;

const none: PanelEdit = { kicker: false, title: false, body: false, note: false };
const heading: PanelEdit = { kicker: true, title: true, body: true, note: false };

function blank(): PanelFields {
  return { kicker: "", title: "", body: "", note: "", items: [] };
}

function card(title: string, text = "", stat = ""): PanelItem {
  return { stat, title, text };
}

const DEFS: PanelDef[] = [
  { id: "home-hero", label: "Hero photograph", page: "home", sort: 10, edit: none, itemMode: "none", fields: blank() },
  {
    id: "home-intro",
    label: "Opening lines",
    page: "home",
    sort: 20,
    edit: heading,
    itemMode: "none",
    fields: {
      ...blank(),
      kicker: "Del Valle, Texas · 42 acres",
      title: "A ranch you can have to yourselves.",
      body: "A cream cottage and a stone ranch house. Or the whole property. Five minutes from the Circuit of the Americas.",
    },
  },
  {
    id: "home-drives",
    label: "Drive times",
    page: "home",
    sort: 30,
    edit: none,
    itemMode: "stat-title",
    fields: {
      ...blank(),
      items: [
        card("Circuit of the Americas", "", "5 min"),
        card("Austin airport", "", "15 min"),
        card("Downtown Austin", "", "20 min"),
      ],
    },
  },
  {
    id: "home-sleep",
    label: "Where you sleep",
    page: "home",
    sort: 40,
    edit: { kicker: true, title: true, body: false, note: true },
    itemMode: "stat-title-text",
    fields: {
      ...blank(),
      kicker: "Where you sleep",
      title: "Two houses, and the dome.",
      note: "A whole-property night is the two houses together, and only when both are open. The pavilion, the temples, and the grass come with the land.",
      items: [
        card("Guest House", "A cream cottage with a dark porch. Quiet enough for a couple or a small team.", "2 bedrooms · sleeps 4"),
        card("Ranch House", "Stone and a metal roof, with a fire pit in the garden. The house that holds a team.", "3 bedrooms · sleeps 10–12"),
        card("Geodesic Temple", "Light through the shell and an earthen floor. A workshop, a session, or a quiet hour.", "728 sq ft · earthen floor"),
      ],
    },
  },
  {
    id: "home-rooms",
    label: "Pavilion and temple",
    page: "home",
    sort: 50,
    edit: { kicker: false, title: true, body: false, note: false },
    itemMode: "stat-title",
    fields: {
      ...blank(),
      title: "Rooms that are not bedrooms.",
      items: [
        card("Covered Pavilion", "", "2,178 sq ft"),
        card("Adobe Temple", "", "1,000 sq ft · 20 ft tall"),
      ],
    },
  },
  {
    id: "home-land",
    label: "Land, on the home page",
    page: "home",
    sort: 60,
    edit: heading,
    itemMode: "stat-title-text",
    fields: {
      ...blank(),
      kicker: "The land",
      title: "Twelve open acres inside forty-two.",
      body: "A developing food forest, woods, a one-acre pond, and 63,000 gallons of rainwater. A few mini-donkeys and goats live here.",
      items: [
        card("acres", "Twelve of them open grass. The rest is woods, food forest, and the walks between.", "42"),
        card("acre pond", "Still water for portraits, a swim if the season agrees, and a horizon that is not a parking lot.", "1"),
        card("gallons", "Rainwater catchment. The land drinks what the sky sends before we ask the hose.", "63,000"),
        card("tent sites", "Plus four full-service RV hookups in the oak grove.", "10+"),
      ],
    },
  },
  {
    id: "home-gatherings",
    label: "Gatherings, on the home page",
    page: "home",
    sort: 70,
    edit: { kicker: true, title: true, body: false, note: false },
    itemMode: "title-text",
    fields: {
      ...blank(),
      kicker: "Gatherings",
      title: "What people actually book.",
      items: [
        card("Micro wedding", "Ceremony on the grass or under the pavilion roof. Portraits at the pond and the adobe. Dinner at the stage. The houses if the wedding party should sleep here."),
        card("Corporate offsite", "A day on the land instead of a hotel ballroom. Meetings with AV and a breakout room, a meal with a catering partner, and twelve open acres when the room is not enough."),
        card("Retreat", "Sessions in the zome, meals at the pavilion, tents on the twelve acres, beds in the guest house. Multi-day is the same land, held longer."),
      ],
    },
  },
  {
    id: "home-events",
    label: "Events, on the home page",
    page: "home",
    sort: 80,
    edit: { kicker: true, title: true, body: false, note: false },
    itemMode: "title-text",
    fields: {
      ...blank(),
      kicker: "Events",
      title: "A few kinds of gathering. The rest, you ask for.",
      items: [
        card("Weddings", "Ceremony, portraits, and dinner on land you are not sharing with another party. The houses if you want the night to stay here."),
        card("Corporate", "Offsites and workshops with AV, a breakout room, and a catering partner. Same dirt road next year if you want the date to become a habit."),
        card("Birthday parties", "The pavilion, the pond, and enough grass that a birthday does not have to be a restaurant back room."),
        card("Retreats", "A few days. Sessions, meals, and somewhere to sleep. The shape depends on the group, not on a fixed package."),
        card("Race weekends", "Five minutes from the Circuit of the Americas. The houses and the grounds for the days the track is why people are in Del Valle."),
      ],
    },
  },
  {
    id: "grounds-intro",
    label: "Grounds opening",
    page: "grounds",
    sort: 10,
    edit: heading,
    itemMode: "none",
    fields: {
      ...blank(),
      kicker: "Grounds",
      title: "Forty-two acres.",
      body: "Forty-two acres of luscious woods, open grass, and a developing food forest, five minutes from the Circuit of the Americas. The pavilion, the adobe temple, and the geodesic dome were made to help you slow down, ground, and reconnect to the serendipitous nature of our reality.",
    },
  },
  {
    id: "grounds-buildings",
    label: "Buildings",
    page: "grounds",
    sort: 20,
    edit: none,
    itemMode: "stat-title-text",
    fields: {
      ...blank(),
      items: [
        card("Covered Pavilion", "Timber under a metal roof, with a stage. A seated dinner, a concert, or a day of meetings.", "2,178 sq ft"),
        card("Adobe Temple", "A hexagonal earthen room, twenty feet tall. A ceremony, a circle, or a meeting that wants thicker walls.", "1,000 sq ft · 20 ft tall"),
        card("Geodesic Temple", "Light through the shell and an earthen floor. A workshop, a session, or a quiet hour.", "728 sq ft · earthen floor"),
        card("Guest House", "A cream cottage set apart from the main house.", "2 bedrooms · sleeps 4"),
        card("Ranch House", "The stone house. Room for a team, and a living room that opens to the backyard.", "3 bedrooms · sleeps 10–12"),
      ],
    },
  },
  {
    id: "grounds-land",
    label: "Acreage",
    page: "grounds",
    sort: 30,
    edit: { kicker: true, title: true, body: false, note: true },
    itemMode: "stat-title-text",
    fields: {
      ...blank(),
      kicker: "Land",
      title: "What the acreage is.",
      note: "A few mini-donkeys and goats live on the property. Ten-plus tent sites sit on the open grass when a group wants canvas. Four RV hookups are the oak grove.",
      items: [
        card("acres", "Twelve of them open grass. The rest is woods, food forest, and the walks between.", "42"),
        card("acre pond", "Still water for portraits, a swim if the season agrees, and a horizon that is not a parking lot.", "1"),
        card("gallons", "Rainwater catchment. The land drinks what the sky sends before we ask the hose.", "63,000"),
        card("tent sites", "Plus four full-service RV hookups in the oak grove.", "10+"),
      ],
    },
  },
  {
    id: "grounds-events",
    label: "Gatherings on the grounds page",
    page: "grounds",
    sort: 40,
    edit: { kicker: true, title: true, body: false, note: true },
    itemMode: "title-text",
    fields: {
      ...blank(),
      kicker: "On the land",
      title: "The gatherings we name. Not all of them.",
      note: "If the day you want is not on that list, ask. A tailored event is a conversation, not a missing menu item.",
      items: [
        card("Weddings", "Ceremony, portraits, and dinner on land you are not sharing with another party. The houses if you want the night to stay here."),
        card("Corporate", "Offsites and workshops with AV, a breakout room, and a catering partner. Same dirt road next year if you want the date to become a habit."),
        card("Birthday parties", "The pavilion, the pond, and enough grass that a birthday does not have to be a restaurant back room."),
        card("Retreats", "A few days. Sessions, meals, and somewhere to sleep. The shape depends on the group, not on a fixed package."),
        card("Race weekends", "Five minutes from the Circuit of the Americas. The houses and the grounds for the days the track is why people are in Del Valle."),
      ],
    },
  },
  {
    id: "grounds-services",
    label: "Services",
    page: "grounds",
    sort: 50,
    edit: { kicker: true, title: true, body: false, note: false },
    itemMode: "title-text",
    fields: {
      ...blank(),
      kicker: "Services",
      title: "What we can put around a date, and what we will not pretend to be.",
      items: [
        card("Catering ready", "Kitchens and service yards are set for a caterer. We do not pretend the garden is a full commissary."),
        card("Parking", "Room for a wedding, a team, or a race-weekend crowd without stacking cars in the grass you meant to use."),
        card("Fire pits", "Real pits, not a patio bowl. Evening has somewhere to go after the program ends."),
        card("Branded build-outs", "Signage, lounge, and a look that belongs to the group for the day — then comes down."),
        card("Vendor desk", "We introduce the trades, share the site map, and keep load-in from turning into a scavenger hunt."),
        card("Planning", "A coordinator for the run of show when the day calls for one. Not every date does."),
        card("Outdoor rooms", "Lounge setups, tenting, curated seating, and fire-pit evenings arranged on the grass, not in a catalog photo."),
        card("Photo & film", "The pond, the adobe, the pavilion stage, and twenty minutes of golden light. We can bring a crew or yours."),
        card("Security, valet, shuttle", "When the headcount needs them. Not a default costume for a twelve-person retreat."),
      ],
    },
  },
  {
    id: "grounds-reasons",
    label: "Reasons for the whole place",
    page: "grounds",
    sort: 60,
    edit: { kicker: false, title: true, body: false, note: false },
    itemMode: "title-text",
    fields: {
      ...blank(),
      title: "Three reasons people take the whole place.",
      items: [
        card("Micro wedding", "Ceremony on the grass or under the pavilion roof. Portraits at the pond and the adobe. Dinner at the stage. The houses if the wedding party should sleep here."),
        card("Corporate offsite", "A day on the land instead of a hotel ballroom. Meetings with AV and a breakout room, a meal with a catering partner, and twelve open acres when the room is not enough."),
        card("Retreat", "Sessions in the zome, meals at the pavilion, tents on the twelve acres, beds in the guest house. Multi-day is the same land, held longer."),
      ],
    },
  },
  {
    id: "stay-intro",
    label: "Stay opening",
    page: "stay",
    sort: 10,
    edit: heading,
    itemMode: "none",
    fields: {
      ...blank(),
      kicker: "Stay",
      title: "The houses, and the dome.",
      body: "Each house has its own nights. Friday and Saturday are the weekend rate. The geodesic temple comes with the land. It is not a separate nightly rate. Asking for a quote does not hold the date and does not charge a card.",
    },
  },
  {
    id: "stay-calendars",
    label: "Calendars",
    page: "stay",
    sort: 20,
    edit: { kicker: true, title: true, body: true, note: false },
    itemMode: "none",
    fields: {
      ...blank(),
      kicker: "Both houses, one rate",
      title: "Whole property",
      body: "The guest house and the ranch house together. The temples come with the land. A night shows a price only when both houses are open.",
    },
  },
  {
    id: "stay-quote",
    label: "Stay quote form",
    page: "stay",
    sort: 30,
    edit: { kicker: false, title: true, body: false, note: true },
    itemMode: "none",
    fields: {
      ...blank(),
      title: "Ask for these nights",
      note: "The calendars are waiting on a range.",
    },
  },
  {
    id: "events-intro",
    label: "Events opening",
    page: "events",
    sort: 10,
    edit: { kicker: true, title: true, body: true, note: true },
    itemMode: "none",
    fields: {
      ...blank(),
      kicker: "Events",
      title: "A few kinds of day. Not every kind.",
      body: "Serendipitous Ranch can hold a wedding, a company offsite, a birthday, a retreat, or a race weekend. That is not the whole list. If the gathering you have in mind is not named here, write us and we will shape it. Prices are not posted. The quote is.",
      note: "Five minutes to COTA · 15 to the airport · 20 to downtown",
    },
  },
  {
    id: "events-list",
    label: "Event types",
    page: "events",
    sort: 20,
    edit: { kicker: false, title: true, body: false, note: true },
    itemMode: "title-text",
    fields: {
      ...blank(),
      title: "What we facilitate",
      note: "Archery, a range, a scavenger hunt, a relay, team games, or an axe-throwing trailer can sit inside a day when the date can hold them. They are not a price list, and they are not promised until we say so in the quote.",
      items: [
        card("Weddings", "Ceremony, portraits, and dinner on land you are not sharing with another party. The houses if you want the night to stay here."),
        card("Corporate", "Offsites and workshops with AV, a breakout room, and a catering partner. Same dirt road next year if you want the date to become a habit."),
        card("Birthday parties", "The pavilion, the pond, and enough grass that a birthday does not have to be a restaurant back room."),
        card("Retreats", "A few days. Sessions, meals, and somewhere to sleep. The shape depends on the group, not on a fixed package."),
        card("Race weekends", "Five minutes from the Circuit of the Americas. The houses and the grounds for the days the track is why people are in Del Valle."),
        card("Something tailored", "A film day, a ceremony that is not a wedding, a dinner that is not a retreat. Tell us the shape. We would rather build the day than pretend these five are a menu."),
      ],
    },
  },
  {
    id: "events-quote",
    label: "Event quote form",
    page: "events",
    sort: 30,
    edit: { kicker: false, title: true, body: true, note: false },
    itemMode: "none",
    fields: {
      ...blank(),
      title: "Request a quote",
      body: "Name, a way back to you, and the days if you already have them. Nothing is held and nothing is charged from this form.",
    },
  },
  {
    id: "vendors-intro",
    label: "Vendor opening",
    page: "vendors",
    sort: 10,
    edit: heading,
    itemMode: "none",
    fields: {
      ...blank(),
      kicker: "Vendors",
      title: "Become A Qualified Vendor.",
      body: "We work with caterers, coordinators, photographers, and production teams who are passionate about their trades. Tell us your trade and the kind of event you do best.",
    },
  },
  {
    id: "vendors-points",
    label: "Three promises",
    page: "vendors",
    sort: 20,
    edit: none,
    itemMode: "title-text",
    fields: {
      ...blank(),
      items: [
        card("Vendors Keep Everything", "We don't charge to apply, don't charge to list, and we never take a cut of your sales. We send qualified clients your way because a full-paying vendor is better for everyone than a discounted one."),
        card("City Reach Without City Rent", "Serendipitous Ranch sits 15 minutes from downtown Austin — near enough that you don't think twice about the drive, far enough that you're not paying downtown prices for the same crowd."),
        card("See It Before You Build It", "We don't hand you a diagram and wish you luck. We walk the property with you, mark your boundaries, show you the outlets, and answer the questions you didn't know you had."),
      ],
    },
  },
  {
    id: "vendors-trades",
    label: "Trades",
    page: "vendors",
    sort: 30,
    edit: { kicker: false, title: true, body: false, note: false },
    itemMode: "title-text",
    fields: {
      ...blank(),
      title: "Categories we're building",
      items: [
        card("Kitchen & catering", "From a garden-leaning lunch to a full seated dinner. You bring the kitchen crew; we have the land and the roof."),
        card("Photography", "Weddings, team portraits, and the hour the pond goes copper. We want people who can work open shade and a stage."),
        card("Film", "Short recaps of offsites and ceremony films. Power and a quiet corner exist; a generator plan still helps."),
        card("Sound, light, stage", "The pavilion already has a stage. You bring the system that fits the headcount, not a stadium rig by default."),
        card("Rentals & tenting", "Lounge, farm tables, sail shades, ceremony seating. The grass is real, so stakes and a site map matter."),
        card("Florals & styling", "The food forest is not your wholesaler. Design that can live with mesquite, adobe, and a metal roof."),
        card("Planning", "Planners we can hand a weekend to. We stay the land; you stay the timeline."),
        card("Bar", "Texas service, with the license your setup requires. We do not staff a cash bar ourselves."),
        card("Security, valet, shuttle", "Race weekends and larger nights. Austin-Bergstrom and downtown are close; COTA traffic is its own animal."),
        card("Branded build-outs", "A day that looks like the company, then disappears. Print, lounge, and wayfinding."),
        card("Another trade", "If the work belongs on this land and we did not name it, say so. The list is not a fence."),
      ],
    },
  },
  {
    id: "vendors-apply",
    label: "Vendor application",
    page: "vendors",
    sort: 50,
    edit: { kicker: false, title: true, body: true, note: false },
    itemMode: "none",
    fields: {
      ...blank(),
      title: "Apply Below",
      body: "The ranch desk reads this. It is how we call you back. It is not posted as a public directory.",
    },
  },
  {
    id: "vendors-faq",
    label: "Vendor questions",
    page: "vendors",
    sort: 60,
    edit: { kicker: false, title: true, body: false, note: false },
    itemMode: "title-text",
    fields: {
      ...blank(),
      title: "Vendor questions",
      items: [
        card("Is the list exclusive?", "No. Our vendor list is a recommendation, not a requirement. Clients are free to use their own licensed and insured vendors. We don’t lock them in to protect a referral cut — the goal is the best event, not the biggest fee."),
        card("Is there a fee or a cut?", "Nothing to apply. Nothing to stay listed. Nothing taken from your invoice. The client hires you. We are the land. If we recommend you, it's because we think you're right for the client."),
        card("Do I need insurance to apply?", "Say whether you carry it. Before you work a date, yes: liability, and whatever license Texas already requires for your trade. — TABC certification for bar service, Part 107 for drone operators. We'll confirm specifics with you before your first event."),
        card("How much work is this?", "We do not promise a season. Some years are a handful of weddings, offsites, and retreats."),
        card("Do you provide day-of coordination?", "If the booking includes coordination, we keep load-in, power, and the noise window straight. We do not replace your planner, and we do not become your employer."),
      ],
    },
  },
];

const BY_ID = new Map(DEFS.map((def) => [def.id, def]));

export function panelDefs(): PanelDef[] {
  return DEFS;
}

export function panelDef(id: string): PanelDef | undefined {
  return BY_ID.get(id);
}

export function isPageId(value: string): value is PageId {
  return PAGES.some((page) => page.id === value);
}

export function panelsOn(panels: Panel[], page: PageId): Panel[] {
  return panels.filter((panel) => panel.page === page && !panel.hidden).sort((a, b) => a.sort - b.sort || a.label.localeCompare(b.label));
}

export function panelById(panels: Panel[], id: string): Panel {
  return panels.find((panel) => panel.id === id) ?? { ...BY_ID.get(id)!, hidden: false };
}
