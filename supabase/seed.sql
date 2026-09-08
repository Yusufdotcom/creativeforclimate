-- Seed curated Creative for Climate artist + artworks (Khadra Hussein Ali)

insert into public.artists (
  id,
  display_name,
  bio,
  approval_status,
  public_enabled,
  payout_profile
) values (
  'a1111111-1111-4111-8111-111111111111',
  'Khadra Hussein Ali',
  'Founder & CEO of Creative for Climate. Artist and climate educator based in Mogadishu, Somalia.',
  'approved',
  false,
  null
)
on conflict (id) do update
set
  display_name = excluded.display_name,
  bio = excluded.bio,
  approval_status = excluded.approval_status;

insert into public.artworks (
  id,
  artist_id,
  title,
  medium,
  dimensions,
  story,
  price,
  currency,
  inventory_status,
  publish_status,
  preview_path,
  original_path,
  preview_tone,
  sort_order
) values
(
  'b1111111-1111-4111-8111-111111111101',
  'a1111111-1111-4111-8111-111111111111',
  'After the Rain',
  'Mixed media on canvas',
  '80 × 100 cm',
  'A love letter to the first green that returns after Mogadishu''s rain.',
  180,
  'USD',
  'available',
  'published',
  null,
  null,
  'rain',
  1
),
(
  'b1111111-1111-4111-8111-111111111102',
  'a1111111-1111-4111-8111-111111111111',
  'Hilaac / Lightning',
  'Acrylic & collage',
  '60 × 80 cm',
  'Electric possibility—young people turning climate anxiety into collective action.',
  145,
  'USD',
  'available',
  'published',
  null,
  null,
  'lightning',
  2
),
(
  'b1111111-1111-4111-8111-111111111103',
  'a1111111-1111-4111-8111-111111111111',
  'Seeds We Carry',
  'Textile & ink',
  '50 × 70 cm',
  'A portrait of girls holding stories, seeds, and futures in their hands.',
  120,
  'USD',
  'reserved',
  'published',
  null,
  null,
  'seeds',
  3
),
(
  'b1111111-1111-4111-8111-111111111104',
  'a1111111-1111-4111-8111-111111111111',
  'Blue Horizon',
  'Digital print, edition of 20',
  'A2',
  'The Indian Ocean as witness, provider, and a horizon worth protecting.',
  55,
  'USD',
  'available',
  'published',
  null,
  null,
  'blue',
  4
)
on conflict (id) do update
set
  title = excluded.title,
  medium = excluded.medium,
  dimensions = excluded.dimensions,
  story = excluded.story,
  price = excluded.price,
  inventory_status = excluded.inventory_status,
  publish_status = excluded.publish_status,
  preview_tone = excluded.preview_tone,
  sort_order = excluded.sort_order;

insert into public.site_content (key, locale, value, published_at)
values
  ('site.tagline', 'en', 'Art can change the climate.', now()),
  ('site.contact_city', 'en', 'Mogadishu, Somalia', now())
on conflict (key, locale) do update
set value = excluded.value, published_at = excluded.published_at;

-- Initial public collection: supplied original youth artworks, served from the website's
-- protected preview layer until private originals are uploaded to Supabase Storage.
update public.artworks
set
  title = 'Ocean Without Plastic',
  medium = 'Acrylic on canvas',
  dimensions = 'Original artwork',
  story = 'A young artist''s call to protect ocean life: a sea turtle swims through a bottle-shaped sea beneath the words ''Stop Pollution.''',
  price = 65,
  inventory_status = 'available',
  publish_status = 'published',
  preview_path = '/artworks/ocean-without-plastic.jpeg',
  preview_tone = 'ocean',
  sort_order = 1
where id = 'b1111111-1111-4111-8111-111111111101';

update public.artworks
set
  title = 'Water Is Life',
  medium = 'Acrylic on canvas',
  dimensions = 'Original artwork',
  story = 'A climate story in two landscapes: polluted water on one side, drought on the other—and a young person carrying hope between them.',
  price = 75,
  inventory_status = 'available',
  publish_status = 'published',
  preview_path = '/artworks/water-is-life.jpeg',
  preview_tone = 'water',
  sort_order = 2
where id = 'b1111111-1111-4111-8111-111111111102';

update public.artworks
set publish_status = 'draft'
where id in (
  'b1111111-1111-4111-8111-111111111103',
  'b1111111-1111-4111-8111-111111111104'
);
