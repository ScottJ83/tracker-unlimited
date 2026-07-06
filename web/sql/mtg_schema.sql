create table if not exists mtg_sets (
  id text primary key,
  code text unique not null,
  name text not null,
  set_type text,
  released_at date,
  card_count integer default 0,
  icon_svg_uri text,
  scryfall_uri text,
  raw jsonb,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

create table if not exists mtg_cards (
  id text primary key,
  oracle_id text,
  name text not null,
  normalized_name text,
  mana_cost text,
  cmc numeric,
  type_line text,
  oracle_text text,
  power text,
  toughness text,
  loyalty text,
  defense text,
  colors text[],
  color_identity text[],
  keywords text[],
  legalities jsonb,
  reserved boolean default false,
  raw jsonb,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

create index if not exists mtg_cards_oracle_idx on mtg_cards(oracle_id);
create index if not exists mtg_cards_name_idx on mtg_cards(normalized_name);

create table if not exists mtg_printings (
  id text primary key,
  card_id text references mtg_cards(id) on delete cascade,
  oracle_id text,
  set_id text references mtg_sets(id) on delete set null,
  set_code text,
  collector_number text,
  lang text,
  layout text,
  rarity text,
  released_at date,
  finishes text[],
  frame_effects text[],
  promo_types text[],
  border_color text,
  security_stamp text,
  digital boolean default false,
  foil boolean default false,
  nonfoil boolean default true,
  oversized boolean default false,
  variation boolean default false,
  booster boolean default true,
  image_small text,
  image_normal text,
  image_large text,
  image_png text,
  image_art_crop text,
  image_border_crop text,
  price_usd numeric,
  price_usd_foil numeric,
  price_usd_etched numeric,
  price_eur numeric,
  price_tix numeric,
  purchase_uris jsonb,
  raw jsonb,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

create index if not exists mtg_printings_card_idx on mtg_printings(card_id);
create index if not exists mtg_printings_set_idx on mtg_printings(set_code);
create index if not exists mtg_printings_oracle_idx on mtg_printings(oracle_id);
create index if not exists mtg_printings_lang_idx on mtg_printings(lang);

create table if not exists mtg_collection_entries (
  id bigserial primary key,
  user_id uuid not null,
  printing_id text not null references mtg_printings(id) on delete cascade,
  quantity integer not null default 0 check (quantity >= 0),
  foil_quantity integer not null default 0 check (foil_quantity >= 0),
  etched_quantity integer not null default 0 check (etched_quantity >= 0),
  condition text,
  notes text,
  created_at timestamptz default now(),
  updated_at timestamptz default now(),
  unique(user_id, printing_id)
);

create table if not exists mtg_wishlist_entries (
  id bigserial primary key,
  user_id uuid not null,
  printing_id text not null references mtg_printings(id) on delete cascade,
  priority text default 'normal',
  notes text,
  created_at timestamptz default now(),
  updated_at timestamptz default now(),
  unique(user_id, printing_id)
);

create table if not exists mtg_decks (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null,
  name text not null,
  format text default 'commander',
  commander_printing_id text references mtg_printings(id) on delete set null,
  companion_printing_id text references mtg_printings(id) on delete set null,
  is_public boolean default false,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

create table if not exists mtg_deck_cards (
  id bigserial primary key,
  deck_id uuid not null references mtg_decks(id) on delete cascade,
  printing_id text references mtg_printings(id) on delete set null,
  card_name text not null,
  quantity integer not null default 1 check (quantity > 0),
  board text not null default 'main',
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

create table if not exists mtg_preconstructed_decks (
  id text primary key,
  slug text unique not null,
  name text not null,
  product_type text,
  set_code text,
  released_at date,
  commander_name text,
  sort_order integer default 0,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

create table if not exists mtg_preconstructed_deck_cards (
  id bigserial primary key,
  deck_id text not null references mtg_preconstructed_decks(id) on delete cascade,
  printing_id text references mtg_printings(id) on delete set null,
  card_name text not null,
  quantity integer not null default 1 check (quantity > 0),
  board text not null default 'main',
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

alter table mtg_sets enable row level security;
alter table mtg_cards enable row level security;
alter table mtg_printings enable row level security;
alter table mtg_collection_entries enable row level security;
alter table mtg_wishlist_entries enable row level security;
alter table mtg_decks enable row level security;
alter table mtg_deck_cards enable row level security;
alter table mtg_preconstructed_decks enable row level security;
alter table mtg_preconstructed_deck_cards enable row level security;

drop policy if exists "Read MTG sets" on mtg_sets;
create policy "Read MTG sets" on mtg_sets for select using (true);
drop policy if exists "Read MTG cards" on mtg_cards;
create policy "Read MTG cards" on mtg_cards for select using (true);
drop policy if exists "Read MTG printings" on mtg_printings;
create policy "Read MTG printings" on mtg_printings for select using (true);
drop policy if exists "Read MTG precons" on mtg_preconstructed_decks;
create policy "Read MTG precons" on mtg_preconstructed_decks for select using (true);
drop policy if exists "Read MTG precon cards" on mtg_preconstructed_deck_cards;
create policy "Read MTG precon cards" on mtg_preconstructed_deck_cards for select using (true);

drop policy if exists "Users read MTG collection" on mtg_collection_entries;
create policy "Users read MTG collection" on mtg_collection_entries for select using (auth.uid() = user_id);
drop policy if exists "Users manage MTG collection" on mtg_collection_entries;
create policy "Users manage MTG collection" on mtg_collection_entries for all using (auth.uid() = user_id) with check (auth.uid() = user_id);

drop policy if exists "Users read MTG wishlist" on mtg_wishlist_entries;
create policy "Users read MTG wishlist" on mtg_wishlist_entries for select using (auth.uid() = user_id);
drop policy if exists "Users manage MTG wishlist" on mtg_wishlist_entries;
create policy "Users manage MTG wishlist" on mtg_wishlist_entries for all using (auth.uid() = user_id) with check (auth.uid() = user_id);

drop policy if exists "Users read MTG decks" on mtg_decks;
create policy "Users read MTG decks" on mtg_decks for select using (is_public or auth.uid() = user_id);
drop policy if exists "Users manage MTG decks" on mtg_decks;
create policy "Users manage MTG decks" on mtg_decks for all using (auth.uid() = user_id) with check (auth.uid() = user_id);

drop policy if exists "Users read MTG deck cards" on mtg_deck_cards;
create policy "Users read MTG deck cards" on mtg_deck_cards for select using (
  exists(select 1 from mtg_decks d where d.id = deck_id and (d.is_public or d.user_id = auth.uid()))
);
drop policy if exists "Users manage MTG deck cards" on mtg_deck_cards;
create policy "Users manage MTG deck cards" on mtg_deck_cards for all using (
  exists(select 1 from mtg_decks d where d.id = deck_id and d.user_id = auth.uid())
) with check (
  exists(select 1 from mtg_decks d where d.id = deck_id and d.user_id = auth.uid())
);
