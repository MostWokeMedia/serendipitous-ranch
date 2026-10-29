-- Venue voice: character for the houses, the grounds opening the steward wrote,
-- and acreage as 42. Names, photos, and rates stay put.

update spaces
set summary = 'A cream cottage set apart from the main house. Two bedrooms and a shared bath.'
where slug = 'guest-house';

update spaces
set summary = 'The stone house. Three bedrooms and a living room that opens to the backyard.'
where slug = 'ranch-house';

update spaces
set summary = 'Light through the shell and an earthen floor. A workshop, a session, or a quiet hour.'
where slug = 'rv-grove';

update page_panels
set fields = $home_intro${"kicker":"Del Valle, Texas · 42 acres","title":"A ranch you can have to yourselves.","body":"A cream cottage, a stone ranch house, and an oak grove for RVs. Or the whole property. Five minutes from the Circuit of the Americas.","note":"","items":[]}$home_intro$
where id = 'home-intro';

update page_panels
set fields = $home_sleep${"kicker":"Where you sleep","title":"Three places to sleep. One ranch when you want all of it.","body":"","note":"A whole-property night is the three rentals together, and only when all three are open. The pavilion, the temples, and the grass come with the land.","items":[{"stat":"2 bedrooms · sleeps 4","title":"Guest House","text":"A cream cottage with a dark porch. Quiet enough for a couple or a small team."},{"stat":"3 bedrooms · sleeps 10–12","title":"Ranch House","text":"Stone and a metal roof, with a fire pit in the garden. The house that holds a team."},{"stat":"4 full hookups","title":"RV Grove","text":"Four full hookups under the live oaks. The grove stays with your group."}]}$home_sleep$
where id = 'home-sleep';

update page_panels
set fields = $home_land${"kicker":"The land","title":"Twelve open acres inside forty-two.","body":"A developing food forest, woods, a one-acre pond, and 63,000 gallons of rainwater. A few mini-donkeys and goats live here.","note":"","items":[{"stat":"42","title":"acres","text":"Twelve of them open grass. The rest is woods, food forest, and the walks between."},{"stat":"1","title":"acre pond","text":"Still water for portraits, a swim if the season agrees, and a horizon that is not a parking lot."},{"stat":"63,000","title":"gallons","text":"Rainwater catchment. The land drinks what the sky sends before we ask the hose."},{"stat":"10+","title":"tent sites","text":"Plus four full-service RV hookups in the oak grove."}]}$home_land$
where id = 'home-land';

update page_panels
set fields = $grounds_intro${"kicker":"Grounds","title":"Forty-two acres.","body":"Forty-two acres of luscious woods, open grass, and a developing food forest, five minutes from the Circuit of the Americas. The pavilion, the adobe temple, and the geodesic dome were made to help you slow down, ground, and reconnect to the serendipitous nature of our reality.","note":"","items":[]}$grounds_intro$
where id = 'grounds-intro';

update page_panels
set fields = $grounds_buildings${"kicker":"","title":"","body":"","note":"","items":[{"stat":"2,178 sq ft","title":"Covered Pavilion","text":"Timber under a metal roof, with a stage. A seated dinner, a concert, or a day of meetings."},{"stat":"1,000 sq ft · 20 ft tall","title":"Adobe Temple","text":"A hexagonal earthen room, twenty feet tall. A ceremony, a circle, or a meeting that wants thicker walls."},{"stat":"728 sq ft · earthen floor","title":"Geodesic Temple","text":"Light through the shell and an earthen floor. A workshop, a session, or a quiet hour."},{"stat":"2 bedrooms · sleeps 4","title":"Guest House","text":"A cream cottage set apart from the main house."},{"stat":"3 bedrooms · sleeps 10–12","title":"Ranch House","text":"The stone house. Room for a team, and a living room that opens to the backyard."}]}$grounds_buildings$
where id = 'grounds-buildings';

update page_panels
set fields = $grounds_land${"kicker":"Land","title":"What the acreage is.","body":"","note":"A few mini-donkeys and goats live on the property. Ten-plus tent sites sit on the open grass when a group wants canvas. Four RV hookups are the oak grove.","items":[{"stat":"42","title":"acres","text":"Twelve of them open grass. The rest is woods, food forest, and the walks between."},{"stat":"1","title":"acre pond","text":"Still water for portraits, a swim if the season agrees, and a horizon that is not a parking lot."},{"stat":"63,000","title":"gallons","text":"Rainwater catchment. The land drinks what the sky sends before we ask the hose."},{"stat":"10+","title":"tent sites","text":"Plus four full-service RV hookups in the oak grove."}]}$grounds_land$
where id = 'grounds-land';

update page_panels
set fields = $stay_intro${"kicker":"Stay","title":"Three places to sleep.","body":"Each has its own nights. Friday and Saturday are the weekend rate. Asking for a quote does not hold the date and does not charge a card.","note":"","items":[]}$stay_intro$
where id = 'stay-intro';

update page_panels
set fields = $vendors_intro${"kicker":"Vendors","title":"Trades we will actually call.","body":"We work with caterers, coordinators, photographers, and production teams who already know how to run a day on private land. Tell us your trade, your insurance, and the kind of event you do best.","note":"","items":[]}$vendors_intro$
where id = 'vendors-intro';

update page_panels
set fields = replace(
  fields,
  'A day on the land instead of a hotel ballroom. Meetings, a meal, and one or two things that only work because there are twelve open acres.',
  'A day on the land instead of a hotel ballroom. Meetings with AV and a breakout room, a meal with a catering partner, and twelve open acres when the room is not enough.'
)
where fields like '%one or two things that only work%';

update page_panels
set fields = replace(
  fields,
  'Offsites, workshops, and a team that needs to leave the building. Same dirt road next year if you want the date to become a habit.',
  'Offsites and workshops with AV, a breakout room, and a catering partner. Same dirt road next year if you want the date to become a habit.'
)
where fields like '%a team that needs to leave the building%';
