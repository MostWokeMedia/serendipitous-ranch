alter table spaces add column if not exists weekday_rate integer;
alter table spaces add column if not exists weekend_rate integer;

update spaces set weekday_rate = 650, weekend_rate = 850
where slug = 'guest-house' and weekday_rate is null;

update spaces set weekday_rate = 275, weekend_rate = 375
where slug = 'ranch-house' and weekday_rate is null;

-- The geodesic temple is not a nightly rental. No rate is seeded for rv-grove.

alter table vendor_notes add column if not exists contact_name text not null default '';
alter table vendor_notes add column if not exists email text not null default '';
alter table vendor_notes add column if not exists phone text not null default '';
alter table vendor_notes add column if not exists area text not null default '';
alter table vendor_notes add column if not exists instagram text not null default '';
alter table vendor_notes add column if not exists years_in_business integer;
alter table vendor_notes alter column offering set default '';

create table if not exists inquiries (
  id serial primary key,
  ref_code text not null unique,
  kind text not null check (kind in ('stay', 'event')),
  contact_name text not null,
  email text not null,
  phone text not null,
  subject text not null,
  start_date date,
  end_date date,
  party_size integer,
  note text not null default '',
  created_at timestamptz not null default now()
);
