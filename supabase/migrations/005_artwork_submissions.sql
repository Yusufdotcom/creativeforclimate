-- External artist submissions.
-- Anyone can send one artwork through the public /submit form (server action,
-- service role). Nothing is shown publicly until an admin approves it, which
-- creates a normal row in public.artworks.
--
-- image_path points into the PRIVATE artwork-originals bucket (submissions/…).

create table if not exists public.artwork_submissions (
  id uuid primary key default gen_random_uuid(),
  reference_number text not null unique,
  artist_name text not null,
  phone text not null,
  email text,
  artist_bio text,
  title text not null,
  medium text not null,
  dimensions text not null,
  story text not null default '',
  asking_price numeric(12, 2) check (asking_price is null or asking_price >= 0),
  currency text not null default 'USD',
  image_path text not null,
  rights_confirmed boolean not null default false,
  status text not null default 'new'
    check (status in ('new', 'approved', 'declined')),
  artwork_id uuid references public.artworks (id) on delete set null,
  admin_notes text,
  reviewed_by text,
  reviewed_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists artwork_submissions_status_idx
  on public.artwork_submissions (status, created_at desc);

drop trigger if exists artwork_submissions_set_updated_at on public.artwork_submissions;
create trigger artwork_submissions_set_updated_at before update on public.artwork_submissions
  for each row execute function public.set_updated_at();

-- Contains artist phone/email: no public access at all. Reads and writes go
-- through Next.js server actions using the service role.
alter table public.artwork_submissions enable row level security;
revoke all on table public.artwork_submissions from anon, authenticated;
