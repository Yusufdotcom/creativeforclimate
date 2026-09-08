-- Creative for Climate — Phase 1.5 schema
-- Phase 2 ready: artists.public_enabled, payout_profile, approval_status
-- Keep MULTI_ARTIST_MARKETPLACE=false until artist self-signup is intentional.

create extension if not exists "pgcrypto";

-- ---------------------------------------------------------------------------
-- artists
-- ---------------------------------------------------------------------------
create table if not exists public.artists (
  id uuid primary key default gen_random_uuid(),
  display_name text not null,
  bio text,
  photo_path text,
  approval_status text not null default 'approved'
    check (approval_status in ('pending', 'approved', 'rejected')),
  payout_profile jsonb,
  public_enabled boolean not null default false,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists artists_approval_idx on public.artists (approval_status);
create index if not exists artists_public_enabled_idx on public.artists (public_enabled);

-- ---------------------------------------------------------------------------
-- artworks
-- preview_path  → public "artwork-previews" bucket only (watermarked / resized)
-- original_path → private "artwork-originals" bucket — never expose publicly
-- ---------------------------------------------------------------------------
create table if not exists public.artworks (
  id uuid primary key default gen_random_uuid(),
  artist_id uuid not null references public.artists (id) on delete restrict,
  title text not null,
  medium text not null,
  dimensions text not null,
  story text not null default '',
  price numeric(12, 2) not null check (price >= 0),
  currency text not null default 'USD',
  inventory_status text not null default 'available'
    check (inventory_status in ('available', 'reserved', 'sold', 'archived')),
  publish_status text not null default 'draft'
    check (publish_status in ('draft', 'published', 'archived')),
  preview_path text,
  original_path text,
  preview_tone text not null default 'rain',
  sort_order integer not null default 0,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists artworks_public_gallery_idx
  on public.artworks (publish_status, inventory_status, sort_order);
create index if not exists artworks_artist_idx on public.artworks (artist_id);

-- ---------------------------------------------------------------------------
-- orders (manual Hormuud — never auto-verify payment)
-- ---------------------------------------------------------------------------
create table if not exists public.orders (
  id uuid primary key default gen_random_uuid(),
  reference_number text not null unique,
  artwork_id uuid not null references public.artworks (id) on delete restrict,
  artwork_title text not null,
  amount numeric(12, 2) not null check (amount >= 0),
  currency text not null default 'USD',
  buyer_phone text not null,
  buyer_email text,
  payment_method text not null default 'Hormuud manual',
  payment_status text not null default 'pending_verification'
    check (payment_status in ('pending_verification', 'verified', 'rejected')),
  order_status text not null default 'pending'
    check (order_status in ('pending', 'approved', 'rejected', 'cancelled')),
  reviewed_by text,
  reviewed_at timestamptz,
  admin_notes text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists orders_status_idx on public.orders (order_status, payment_status);
create index if not exists orders_artwork_idx on public.orders (artwork_id);

-- ---------------------------------------------------------------------------
-- custom_requests
-- ---------------------------------------------------------------------------
create table if not exists public.custom_requests (
  id uuid primary key default gen_random_uuid(),
  reference_number text not null unique,
  requested_artwork text not null,
  theme_message text not null,
  preferred_size text,
  style text,
  budget numeric(12, 2),
  deadline date,
  name text not null,
  phone text not null,
  email text,
  status text not null default 'new'
    check (status in ('new', 'in_review', 'quoted', 'accepted', 'declined', 'completed')),
  assigned_artist_id uuid references public.artists (id) on delete set null,
  admin_notes text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists custom_requests_status_idx on public.custom_requests (status);

-- ---------------------------------------------------------------------------
-- inquiries
-- ---------------------------------------------------------------------------
create table if not exists public.inquiries (
  id uuid primary key default gen_random_uuid(),
  source text not null default 'website',
  name text,
  contact text,
  message text not null,
  status text not null default 'new'
    check (status in ('new', 'open', 'closed')),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

-- ---------------------------------------------------------------------------
-- site_content
-- ---------------------------------------------------------------------------
create table if not exists public.site_content (
  id uuid primary key default gen_random_uuid(),
  key text not null,
  locale text not null default 'en',
  value text not null,
  published_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (key, locale)
);

-- ---------------------------------------------------------------------------
-- updated_at helper
-- ---------------------------------------------------------------------------
create or replace function public.set_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

drop trigger if exists artists_set_updated_at on public.artists;
create trigger artists_set_updated_at before update on public.artists
  for each row execute function public.set_updated_at();

drop trigger if exists artworks_set_updated_at on public.artworks;
create trigger artworks_set_updated_at before update on public.artworks
  for each row execute function public.set_updated_at();

drop trigger if exists orders_set_updated_at on public.orders;
create trigger orders_set_updated_at before update on public.orders
  for each row execute function public.set_updated_at();

drop trigger if exists custom_requests_set_updated_at on public.custom_requests;
create trigger custom_requests_set_updated_at before update on public.custom_requests
  for each row execute function public.set_updated_at();

drop trigger if exists inquiries_set_updated_at on public.inquiries;
create trigger inquiries_set_updated_at before update on public.inquiries
  for each row execute function public.set_updated_at();

drop trigger if exists site_content_set_updated_at on public.site_content;
create trigger site_content_set_updated_at before update on public.site_content
  for each row execute function public.set_updated_at();

-- ---------------------------------------------------------------------------
-- Atomic pending order + temporary artwork reserve
-- Called by server with service role. Does NOT verify Hormuud payment.
-- ---------------------------------------------------------------------------
create or replace function public.create_pending_hormuud_order(
  p_artwork_id uuid,
  p_buyer_phone text,
  p_buyer_email text,
  p_reference_number text
)
returns public.orders
language plpgsql
security definer
set search_path = public
as $$
declare
  v_art public.artworks;
  v_order public.orders;
begin
  select * into v_art
  from public.artworks
  where id = p_artwork_id
  for update;

  if not found then
    raise exception 'Artwork not found';
  end if;

  if v_art.publish_status <> 'published' then
    raise exception 'Artwork is not publicly listed';
  end if;

  if v_art.inventory_status <> 'available' then
    raise exception 'Artwork is not available for purchase';
  end if;

  insert into public.orders (
    reference_number,
    artwork_id,
    artwork_title,
    amount,
    currency,
    buyer_phone,
    buyer_email,
    payment_method,
    payment_status,
    order_status
  ) values (
    p_reference_number,
    v_art.id,
    v_art.title,
    v_art.price,
    v_art.currency,
    p_buyer_phone,
    nullif(trim(p_buyer_email), ''),
    'Hormuud manual',
    'pending_verification',
    'pending'
  )
  returning * into v_order;

  update public.artworks
  set inventory_status = 'reserved'
  where id = v_art.id;

  return v_order;
end;
$$;

revoke all on function public.create_pending_hormuud_order(uuid, text, text, text) from public;
grant execute on function public.create_pending_hormuud_order(uuid, text, text, text) to service_role;
