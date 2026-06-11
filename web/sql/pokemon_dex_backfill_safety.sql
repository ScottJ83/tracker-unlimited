-- Helpful checks before/after running npm run pokemon:dex-backfill

select id, name, dex_ids
from pokemon_cards
where lower(name) like '%bulbasaur%'
limit 20;

select
  count(*) filter (where dex_ids is not null and cardinality(dex_ids) > 0) as cards_with_dex_ids,
  count(*) filter (where dex_ids is null or cardinality(dex_ids) = 0) as cards_without_dex_ids
from pokemon_cards;

select count(distinct dex_id) as distinct_pokemon_with_cards
from (
  select unnest(dex_ids) as dex_id
  from pokemon_cards
  where dex_ids is not null and cardinality(dex_ids) > 0
) t;
