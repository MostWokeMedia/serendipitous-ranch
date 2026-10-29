-- Drop the mini-zome from the public grounds list, correct tent counts,
-- and attach the geodesic temple photograph. Rows may not exist yet on a
-- fresh database; the app then inserts the updated defaults.

update spaces
set image = '/images/geodesic.jpg'
where slug = 'zome';

update spaces
set summary = replace(summary, 'fifty-plus', 'ten-plus')
where slug = 'open-grass';

update page_panels
set fields = replace(replace(replace(fields, '50+', '10+'), 'Fifty-plus', 'Ten-plus'), 'where fifty tents can sit', 'where ten-plus tents can sit')
where fields like '%50+%'
   or fields like '%Fifty-plus%'
   or fields like '%fifty tents%';

update page_panels
set fields = (
  jsonb_set(
    fields::jsonb,
    '{items}',
    coalesce(
      (
        select jsonb_agg(elem order by ord)
        from jsonb_array_elements(fields::jsonb -> 'items') with ordinality as t(elem, ord)
        where elem ->> 'title' is distinct from 'Mini-Zome'
      ),
      '[]'::jsonb
    )
  )
)::text
where id = 'grounds-buildings'
  and position('Mini-Zome' in fields) > 0;
