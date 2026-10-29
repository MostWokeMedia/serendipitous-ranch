export const ADDRESS = "15009 Fagerquist Rd, Del Valle, TX 78617";

export const MAPS =
  "https://maps.google.com/?q=15009+Fagerquist+Rd,+Del+Valle,+TX+78617";

export const DRIVES = [
  { value: "5 min", label: "Circuit of the Americas" },
  { value: "15 min", label: "Austin airport" },
  { value: "20 min", label: "Downtown Austin" },
];

export const FACILITIES = [
  {
    name: "Covered Pavilion",
    meta: "2,178 sq ft",
    copy: "The working room. A stage, a roof, and enough floor for a seated dinner, a concert, or a day of meetings that refuse a hotel ballroom.",
    image: "/images/pavilion.jpg",
    alt: "Covered pavilion with a long table and a timber stage under a metal roof",
  },
  {
    name: "Adobe Temple",
    meta: "1,000 sq ft · 20 ft tall",
    copy: "A hexagonal earthen gallery. It holds a small exhibit, a ceremony, or a session that needs thicker walls than a tent.",
    image: "/images/adobe.jpg",
    alt: "Hexagonal adobe temple with a blue tile roof, columns, and a cactus garden",
  },
  {
    name: "Geodesic Temple",
    meta: "728 sq ft · earthen floor",
    copy: "The large zome. Light comes through the shell. Shoes come off. It is a temple in the practical sense: a room with a different temperature than the pavilion.",
    image: "/images/geodesic.jpg",
    alt: "Geodesic temple with a blue metal roof, wooden doors, and a timber porch",
  },
];

export const LAND = [
  { stat: "41.5", unit: "acres", note: "Twelve of them open grass. The rest is food forest, woods, and the walks between." },
  { stat: "1", unit: "acre pond", note: "Still water for portraits, a swim if the season agrees, and a horizon that is not a parking lot." },
  { stat: "63,000", unit: "gallons", note: "Rainwater catchment. The land drinks what the sky sends before we ask the hose." },
  { stat: "10+", unit: "tent sites", note: "Plus four full-service RV hookups in the oak grove." },
];

export const SERVICES = [
  { name: "Catering ready", copy: "Kitchens and service yards are set for a caterer. We do not pretend the garden is a full commissary." },
  { name: "Parking", copy: "Room for a wedding, a team, or a race-weekend crowd without stacking cars in the grass you meant to use." },
  { name: "Fire pits", copy: "Real pits, not a patio bowl. Evening has somewhere to go after the program ends." },
  { name: "Branded build-outs", copy: "Signage, lounge, and a look that belongs to the group for the day — then comes down." },
  { name: "Vendor desk", copy: "We introduce the trades, share the site map, and keep load-in from turning into a scavenger hunt." },
  { name: "Planning", copy: "A coordinator for the run of show when the day calls for one. Not every date does." },
  { name: "Outdoor rooms", copy: "Lounge setups, tenting, curated seating, and fire-pit evenings arranged on the grass, not in a catalog photo." },
  { name: "Photo & film", copy: "The pond, the adobe, the pavilion stage, and twenty minutes of golden light. We can bring a crew or yours." },
  { name: "Security, valet, shuttle", copy: "When the headcount needs them. Not a default costume for a twelve-person retreat." },
];

export const GATHERINGS = [
  {
    name: "Micro wedding",
    copy: "Ceremony on the grass or under the pavilion roof. Portraits at the pond and the adobe. Dinner at the stage. The houses if the wedding party should sleep here.",
  },
  {
    name: "Corporate offsite",
    copy: "A day on the land instead of a hotel ballroom. Meetings, a meal, and one or two things that only work because there are twelve open acres.",
  },
  {
    name: "Retreat",
    copy: "Sessions in the zome, meals at the pavilion, tents on the twelve acres, beds in the guest house. Multi-day is the same land, held longer.",
  },
];

export const EVENTS = [
  {
    name: "Weddings",
    copy: "Ceremony, portraits, and dinner on land you are not sharing with another party. The houses if you want the night to stay here.",
  },
  {
    name: "Corporate",
    copy: "Offsites, workshops, and a team that needs to leave the building. Same dirt road next year if you want the date to become a habit.",
  },
  {
    name: "Birthday parties",
    copy: "The pavilion, the pond, and enough grass that a birthday does not have to be a restaurant back room.",
  },
  {
    name: "Retreats",
    copy: "A few days. Sessions, meals, and somewhere to sleep. The shape depends on the group, not on a fixed package.",
  },
  {
    name: "Race weekends",
    copy: "Five minutes from the Circuit of the Americas. Houses, the RV grove, and the grounds for the days the track is why people are in Del Valle.",
  },
];

export const WORKS = ["Weddings", "Corporate", "Birthday parties", "Retreats", "Race weekends"] as const;

export const ACTIVITIES = [
  { name: "Archery", copy: "A station on the open grass. Supervised, timed, and easy to drop between a morning session and lunch." },
  { name: "Shooting range", copy: "A controlled station for groups that want something louder than a trust fall. Safety briefing is part of the hour, not an extra." },
  { name: "Scavenger hunt", copy: "Across the pond, the food forest, the temples, and the tree line. We write it to the group, not from a corporate party PDF." },
  { name: "Relay", copy: "Twelve acres is enough track. Teams, handoffs, and a finish that is not a hotel driveway." },
  { name: "Team games", copy: "Field games that assume adults. Short, physical if you want, seated if you do not." },
  { name: "Axe-throwing trailer", copy: "A mobile lane we bring in. It does not live here full-time, so it is scheduled like a vendor, not assumed." },
];

/** Internal rate card. Not rendered on the public site. */
export const TIERS = [
  {
    id: "land",
    name: "Land Access",
    price: "$500",
    per: "~$12.50",
    lines: ["Self-guided access", "Fire pit and a trail map", "No food and no staffing"],
  },
  {
    id: "lean",
    name: "Lean Day",
    price: "$5,000",
    per: "~$125",
    lines: [
      "The venue for the day",
      "Basic catering, with garden elements",
      "One signature activity",
      "Wi-Fi, simple A/V, a coordinator",
      "Insurance for the day",
    ],
  },
  {
    id: "mid",
    name: "Mid-Tier",
    price: "$10,000",
    per: "~$250",
    lines: ["A professional facilitator", "More than one meal", "Two or three activity stations", "Evening entertainment"],
  },
  {
    id: "premium",
    name: "Premium",
    price: "$20,000",
    per: "~$500",
    lines: [
      "The whole property, exclusive",
      "Farm-to-table",
      "An outside facilitator",
      "Archery, scavenger hunt, and a bonfire",
      "Production A/V and a run-of-show crew",
      "Overnight tents included or discounted",
    ],
  },
];

/** Internal. Assumes a $10,000 day. Not rendered on the public site. */
export const RECURRING = [
  {
    name: "Single day",
    discount: "None",
    example: "$10,000",
    terms: "The posted rate. No lock.",
  },
  {
    name: "Prepay",
    discount: "10%",
    example: "$9,000",
    terms: "Full amount in 30 or more days before the date.",
  },
  {
    name: "Three-year annual",
    discount: "10%",
    example: "$9,000 / year",
    terms: "The rate holds for three years if headcount stays within 20% of the original group.",
  },
  {
    name: "Prepay and three years",
    discount: "About 19%",
    example: "About $8,100 / year",
    terms: "The best number. The strongest lock.",
  },
];

export const TRADES = [
  { name: "Kitchen & catering", copy: "From a garden-leaning lunch to a full seated dinner. You bring the kitchen crew; we have the land and the roof." },
  { name: "Photography", copy: "Weddings, team portraits, and the hour the pond goes copper. We want people who can work open shade and a stage." },
  { name: "Film", copy: "Short recaps of offsites and ceremony films. Power and a quiet corner exist; a generator plan still helps." },
  { name: "Sound, light, stage", copy: "The pavilion already has a stage. You bring the system that fits the headcount, not a stadium rig by default." },
  { name: "Rentals & tenting", copy: "Lounge, farm tables, sail shades, ceremony seating. The grass is real, so stakes and a site map matter." },
  { name: "Florals & styling", copy: "The food forest is not your wholesaler. Design that can live with mesquite, adobe, and a metal roof." },
  { name: "Planning", copy: "Planners we can hand a weekend to. We stay the land; you stay the timeline." },
  { name: "Bar", copy: "Texas service, with the license your setup requires. We do not staff a cash bar ourselves." },
  { name: "Security, valet, shuttle", copy: "Race weekends and larger nights. Austin-Bergstrom and downtown are close; COTA traffic is its own animal." },
  { name: "Branded build-outs", copy: "A day that looks like the company, then disappears. Print, lounge, and wayfinding." },
  { name: "Another trade", copy: "If the work belongs on this land and we did not name it, say so. The list is not a fence." },
];
