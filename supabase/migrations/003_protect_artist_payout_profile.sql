-- Public gallery queries only need artist display names. RLS controls rows,
-- not columns, so explicitly remove broad table reads to protect payout_profile.
revoke all on table public.artists from anon, authenticated;
grant select (display_name) on table public.artists to anon, authenticated;
