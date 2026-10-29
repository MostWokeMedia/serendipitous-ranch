-- Latest ranch-desk vendor heading and category title.

update page_panels
set fields = $intro${"kicker":"Vendors","title":"Become A Qualified Vendor.","body":"We work with caterers, coordinators, photographers, and production teams who are passionate about their trades. Tell us your trade and the kind of event you do best.","note":"","items":[]}$intro$
where id = 'vendors-intro';

update page_panels
set fields = jsonb_set(fields::jsonb, '{title}', '"Categories we''re building"')::text
where id = 'vendors-trades'
  and fields like '%Trades the land keeps needing%';
