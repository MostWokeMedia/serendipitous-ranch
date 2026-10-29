-- The guest house was carrying the ranch house's size, sleep count, and
-- description (and the other way around). Swap those facts. Leave names,
-- photos, and nightly rates where they are. Skips a database that is already
-- right, including a fresh one seeded by the corrected 0002 insert.

with swapped as (
  select
    case slug when 'guest-house' then 'ranch-house' else 'guest-house' end as target,
    summary,
    sleeps,
    sqft
  from spaces
  where slug in ('guest-house', 'ranch-house')
)
update spaces s
set summary = w.summary,
    sleeps = w.sleeps,
    sqft = w.sqft
from swapped w
where s.slug = w.target
  and exists (
    select 1 from spaces g
    where g.slug = 'guest-house' and g.sqft = 3048
  );

update page_panels p
set fields = (
  with items as (
    select elem, ord
    from jsonb_array_elements(p.fields::jsonb -> 'items') with ordinality as t(elem, ord)
  ),
  gh as (
    select elem from items where elem ->> 'title' = 'Guest House' limit 1
  ),
  rh as (
    select elem from items where elem ->> 'title' = 'Ranch House' limit 1
  )
  select jsonb_set(
    p.fields::jsonb,
    '{items}',
    (
      select jsonb_agg(
        case
          when elem ->> 'title' = 'Guest House' then
            jsonb_set(
              jsonb_set(elem, '{stat}', (select elem -> 'stat' from rh)),
              '{text}',
              (select elem -> 'text' from rh)
            )
          when elem ->> 'title' = 'Ranch House' then
            jsonb_set(
              jsonb_set(elem, '{stat}', (select elem -> 'stat' from gh)),
              '{text}',
              (select elem -> 'text' from gh)
            )
          else elem
        end
        order by ord
      )
      from items
    )
  )::text
)
where p.id in ('home-sleep', 'grounds-buildings')
  and exists (
    select 1
    from jsonb_array_elements(p.fields::jsonb -> 'items') elem
    where elem ->> 'title' = 'Guest House'
      and coalesce(elem ->> 'stat', '') like '%3,048%'
  );
