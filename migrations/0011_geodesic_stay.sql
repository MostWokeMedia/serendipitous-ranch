-- The third stay is the geodesic temple, not the RV grove.
-- It has no nightly rate. The two houses still make the whole-property price.

update spaces
set name = 'Geodesic Temple',
    summary = 'Light through the shell and an earthen floor. A workshop, a session, or a quiet hour.',
    sleeps = null,
    sqft = 728,
    weekday_rate = null,
    weekend_rate = null,
    image = '/images/geodesic.jpg'
where slug = 'rv-grove';

update page_panels
set fields = replace(
  fields,
  'A cream cottage, a stone ranch house, and an oak grove for RVs. Or the whole property. Five minutes from the Circuit of the Americas.',
  'A cream cottage and a stone ranch house. Or the whole property. Five minutes from the Circuit of the Americas.'
)
where id = 'home-intro';

update page_panels
set fields = replace(fields, 'Three places to sleep. One ranch when you want all of it.', 'Two houses, and the dome.')
where id = 'home-sleep';

update page_panels
set fields = replace(
  fields,
  'A whole-property night is the three rentals together, and only when all three are open. The pavilion, the temples, and the grass come with the land.',
  'A whole-property night is the two houses together, and only when both are open. The pavilion, the temples, and the grass come with the land.'
)
where id = 'home-sleep';

update page_panels
set fields = replace(fields, '4 full hookups', '728 sq ft · earthen floor')
where id = 'home-sleep';

update page_panels
set fields = replace(fields, 'RV Grove', 'Geodesic Temple')
where id = 'home-sleep';

update page_panels
set fields = replace(
  fields,
  'Four full hookups under the live oaks. The grove stays with your group.',
  'Light through the shell and an earthen floor. A workshop, a session, or a quiet hour.'
)
where id = 'home-sleep';

update page_panels
set fields = replace(fields, 'Three places to sleep.', 'The houses, and the dome.')
where id = 'stay-intro';

update page_panels
set fields = replace(
  fields,
  'Each has its own nights. Friday and Saturday are the weekend rate. Asking for a quote does not hold the date and does not charge a card.',
  'Each house has its own nights. Friday and Saturday are the weekend rate. The geodesic temple comes with the land. It is not a separate nightly rate. Asking for a quote does not hold the date and does not charge a card.'
)
where id = 'stay-intro';

update page_panels
set fields = replace(fields, 'Every building, one rate', 'Both houses, one rate')
where id = 'stay-calendars';

update page_panels
set fields = replace(
  fields,
  'The guest house, the ranch house, and the RV grove added together. A night shows a price only when the whole ranch is open.',
  'The guest house and the ranch house together. The temples come with the land. A night shows a price only when both houses are open.'
)
where id = 'stay-calendars';

update page_panels
set fields = replace(
  fields,
  'Houses, the RV grove, and the grounds',
  'The houses and the grounds'
)
where fields like '%RV grove%';
