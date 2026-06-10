-- Pokémon bulk import safety/performance helpers.
-- Safe to run more than once.

create unique index if not exists pokemon_sets_id_unique on pokemon_sets(id);
create unique index if not exists pokemon_cards_id_unique on pokemon_cards(id);
create unique index if not exists pokemon_prints_card_print_language_unique
  on pokemon_prints(card_id, print_key, language);

create index if not exists pokemon_prints_set_idx on pokemon_prints(set_id);
create index if not exists pokemon_prints_price_idx on pokemon_prints(price_market);
create index if not exists pokemon_cards_dex_ids_idx on pokemon_cards using gin(dex_ids);
create index if not exists pokemon_cards_slug_idx on pokemon_cards(slug);
create index if not exists pokemon_cards_set_idx on pokemon_cards(set_id);

-- Duplicate checks. These should return zero rows.
select id, count(*)
from pokemon_sets
group by id
having count(*) > 1;

select id, count(*)
from pokemon_cards
group by id
having count(*) > 1;

select card_id, print_key, language, count(*)
from pokemon_prints
group by card_id, print_key, language
having count(*) > 1;
