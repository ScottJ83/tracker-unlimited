-- SWU pre-made deck checklist schema. Safe to run multiple times.
create table if not exists swu_premade_decks (
  id text primary key,
  slug text unique not null,
  name text not null,
  deck_type text not null default 'Spotlight Deck',
  product_wave text,
  leader_name text,
  base_name text,
  sort_order integer default 0,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

create table if not exists swu_premade_deck_cards (
  id bigserial primary key,
  deck_id text not null references swu_premade_decks(id) on delete cascade,
  card_name text not null,
  quantity integer not null check (quantity > 0),
  card_number text,
  set_code_hint text,
  role text not null default 'main',
  resolved_card_id text,
  card_snapshot jsonb,
  match_status text default 'unmatched',
  created_at timestamptz default now(),
  updated_at timestamptz default now(),
);

create index if not exists swu_premade_deck_cards_deck_idx on swu_premade_deck_cards(deck_id);
create index if not exists swu_premade_deck_cards_resolved_idx on swu_premade_deck_cards(resolved_card_id);
create unique index if not exists premade_deck_cards_unique
on premade_deck_cards (
  deck_id,
  card_name,
  coalesce(card_number, ''),
  role
);