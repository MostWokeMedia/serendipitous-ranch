create table if not exists spaces (
  id serial primary key,
  slug text not null unique,
  name text not null,
  kind text not null check (kind in ('stay', 'venue')),
  summary text not null,
  sleeps integer,
  sqft integer,
  image text,
  active boolean not null default true,
  in_buyout boolean not null default true,
  sort integer not null default 0,
  created_at timestamptz not null default now()
);

create table if not exists blocks (
  id serial primary key,
  space_id integer not null references spaces (id),
  start_date date not null,
  end_date date not null,
  source text not null check (source in ('site', 'airbnb', 'manual', 'buyout')),
  purpose text not null check (purpose in ('stay', 'wedding', 'corporate', 'retreat', 'other', 'import')),
  party_size integer,
  ref_code text not null,
  created_at timestamptz not null default now(),
  check (end_date > start_date)
);

create index if not exists blocks_space_dates_idx on blocks (space_id, start_date, end_date);
create index if not exists blocks_ref_idx on blocks (ref_code);

create table if not exists vendor_notes (
  id serial primary key,
  ref_code text not null unique,
  trade text not null,
  business_name text not null,
  website text,
  offering text not null,
  serves text not null,
  insured boolean not null default false,
  created_at timestamptz not null default now()
);

create table if not exists ranch_settings (
  key text primary key,
  value text not null
);

insert into ranch_settings (key, value)
values ('contact_email', '')
on conflict (key) do nothing;

insert into spaces (slug, name, kind, summary, sleeps, sqft, image, sort)
values
  (
    'guest-house',
    'Guest House',
    'stay',
    'A cream cottage set apart from the main house. Two bedrooms and a shared bath.',
    4,
    1000,
    '/images/guest-house.jpg',
    1
  ),
  (
    'ranch-house',
    'Ranch House',
    'stay',
    'The stone house. Three bedrooms and a living room that opens to the backyard.',
    12,
    3048,
    '/images/ranch-house.jpg',
    2
  ),
  (
    'rv-grove',
    'Geodesic Temple',
    'stay',
    'Light through the shell and an earthen floor. A workshop, a session, or a quiet hour.',
    null,
    728,
    '/images/geodesic.jpg',
    3
  ),
  (
    'pavilion',
    'Covered Pavilion',
    'venue',
    '2,178 square feet under roof, with a stage. The primary room for dinners, concerts, and day meetings.',
    null,
    2178,
    '/images/pavilion.jpg',
    10
  ),
  (
    'adobe-temple',
    'Adobe Temple',
    'venue',
    'Hexagonal earthen gallery, about 20 feet tall and 1,000 square feet. Quiet enough for a circle or an install.',
    null,
    1000,
    '/images/adobe.jpg',
    11
  ),
  (
    'zome',
    'Geodesic Temple',
    'venue',
    'The large zome, 728 square feet, earthen floor. A session room that is not a conference hall.',
    null,
    728,
    null,
    12
  ),
  (
    'mini-zome',
    'Mini-Zome',
    'venue',
    'Thirteen feet tall, about 170 square feet. A small holdout for a breakout, a treatment, or a nap.',
    null,
    170,
    null,
    13
  ),
  (
    'open-grass',
    'Open Grass',
    'venue',
    'Twelve acres of open grass for ceremonies, games, relays, and ten-plus tent sites.',
    null,
    null,
    '/images/whole.jpg',
    14
  )
on conflict (slug) do nothing;
