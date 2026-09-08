-- Storage buckets + Row Level Security
-- Public gallery never selects original_path.
-- Originals live only in private bucket artwork-originals.

insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values
  (
    'artwork-previews',
    'artwork-previews',
    true,
    5242880,
    array['image/jpeg', 'image/png', 'image/webp']
  ),
  (
    'artwork-originals',
    'artwork-originals',
    false,
    52428800,
    array['image/jpeg', 'image/png', 'image/webp', 'image/tiff', 'application/pdf']
  )
on conflict (id) do update
set
  public = excluded.public,
  file_size_limit = excluded.file_size_limit,
  allowed_mime_types = excluded.allowed_mime_types;

-- ---------------------------------------------------------------------------
-- RLS
-- ---------------------------------------------------------------------------
alter table public.artists enable row level security;
alter table public.artworks enable row level security;
alter table public.orders enable row level security;
alter table public.custom_requests enable row level security;
alter table public.inquiries enable row level security;
alter table public.site_content enable row level security;

-- Public: approved artists who are marked public (Phase 2) OR always readable
-- display names for published artworks via join. For Phase 1.5 we allow
-- reading artist rows that are approved (curated studio artists).
drop policy if exists artists_public_read on public.artists;
create policy artists_public_read on public.artists
  for select
  to anon, authenticated
  using (approval_status = 'approved');

drop policy if exists artworks_public_read on public.artworks;
create policy artworks_public_read on public.artworks
  for select
  to anon, authenticated
  using (
    publish_status = 'published'
    and inventory_status in ('available', 'reserved')
  );

-- Public may submit orders / custom requests / inquiries via server actions
-- using the service role. Keep table policies locked for anon writes.
-- Authenticated admin access is enforced in the Next.js app via ADMIN_EMAILS
-- + service role after session verification.

drop policy if exists site_content_public_read on public.site_content;
create policy site_content_public_read on public.site_content
  for select
  to anon, authenticated
  using (published_at is not null);

-- Storage: anyone can read preview objects; nobody public can read originals
drop policy if exists previews_public_read on storage.objects;
create policy previews_public_read on storage.objects
  for select
  to anon, authenticated
  using (bucket_id = 'artwork-previews');

drop policy if exists originals_no_public_read on storage.objects;
create policy originals_no_public_read on storage.objects
  for select
  to authenticated
  using (
    bucket_id = 'artwork-originals'
    and false
  );

-- Uploads/management of storage objects must use the service role from the
-- Next.js admin server actions. Do not grant public insert/update/delete.
