-- MTG finish/variant migration for Tracker Unlimited.
-- Safe to run multiple times.
alter table mtg_printings add column if not exists base_scryfall_id text;
alter table mtg_printings add column if not exists finish text;
alter table mtg_printings add column if not exists finish_label text;
alter table mtg_printings add column if not exists variant_label text;
alter table mtg_printings add column if not exists is_token boolean default false;
alter table mtg_printings add column if not exists is_extra boolean default false;
alter table mtg_printings add column if not exists parent_set_code text;

create index if not exists mtg_printings_base_scryfall_idx on mtg_printings(base_scryfall_id);
create index if not exists mtg_printings_finish_idx on mtg_printings(finish);
create index if not exists mtg_printings_parent_set_idx on mtg_printings(parent_set_code);
create index if not exists mtg_printings_token_idx on mtg_printings(is_token);
