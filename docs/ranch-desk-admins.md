# Ranch desk admins

The ranch desk (`/steward`) and every admin server function in `src/lib/ranch/api.ts` (`requireAdmin`)
only accept a signed-in Supabase Auth user whose `app_metadata.role` is `"admin"`.
No emails are hardcoded; any number of admins is fine.

## Add another admin

1. Supabase dashboard → project `xfwketfwfqufkeqjqkdu` → Authentication → Users → **Add user** →
   enter their email and a password, tick **Auto confirm user**.
2. SQL editor:

   ```sql
   update auth.users
   set raw_app_meta_data = coalesce(raw_app_meta_data, '{}'::jsonb) || '{"role":"admin"}'::jsonb
   where email = 'new-admin@example.com';
   ```

3. They sign in at `/steward`. (An already-signed-in user picks up the role on their next token refresh, within an hour.)

## Remove an admin

```sql
update auth.users set raw_app_meta_data = raw_app_meta_data - 'role' where email = 'old-admin@example.com';
```

Or delete the user under Authentication → Users. Access ends when their current token expires (at most 1 hour).
