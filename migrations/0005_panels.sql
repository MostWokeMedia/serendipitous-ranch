create table if not exists page_panels (
  id text primary key,
  page text not null,
  sort integer not null,
  hidden boolean not null default false,
  fields text not null
);
