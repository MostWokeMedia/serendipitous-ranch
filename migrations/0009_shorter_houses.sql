-- House cards were listing every room. Keep the character, drop the inventory.

update spaces
set summary = 'A cream cottage set apart from the main house. Two bedrooms and a shared bath.'
where slug = 'guest-house';

update spaces
set summary = 'The stone house. Three bedrooms and a living room that opens to the backyard.'
where slug = 'ranch-house';

update page_panels
set fields = replace(
  fields,
  'A cream cottage with wood floors, a full kitchen, and a dining table for six. Two bedrooms and a shared bath.',
  'A cream cottage with a dark porch. Quiet enough for a couple or a small team.'
)
where id = 'home-sleep';

update page_panels
set fields = replace(
  fields,
  'Stone and a metal roof. A master with its own fireplace, a living room that opens to the backyard, a game room, an office, and a meditation room.',
  'Stone and a metal roof, with a fire pit in the garden. The house that holds a team.'
)
where id = 'home-sleep';

update page_panels
set fields = replace(
  fields,
  'Cream walls and wood floors. Two bedrooms, a shared bath, a full kitchen, and a dining table for six.',
  'A cream cottage set apart from the main house.'
)
where id = 'grounds-buildings';

update page_panels
set fields = replace(
  fields,
  'Three bedrooms, two and a half baths, a bunk room, a game room, and a master with its own fireplace. Glass doors open to the backyard.',
  'The stone house. Room for a team, and a living room that opens to the backyard.'
)
where id = 'grounds-buildings';
