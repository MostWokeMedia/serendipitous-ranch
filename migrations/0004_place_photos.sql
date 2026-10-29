update spaces set image = null where slug in ('zome', 'mini-zome');
update spaces set image = '/images/whole.jpg' where slug = 'open-grass';
