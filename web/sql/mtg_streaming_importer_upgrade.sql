-- MTG streaming/full importer upgrade. Safe to run multiple times.

alter table mtg_printings add column if not exists scryfall_id text;
alter table mtg_printings add column if not exists finish text;
alter table mtg_printings add column if not exists finish_label text;
alter table mtg_printings add column if not exists variant_label text;
alter table mtg_printings add column if not exists collectible_type text default 'card';
alter table mtg_printings add column if not exists is_token boolean default false;
alter table mtg_printings add column if not exists is_extra boolean default false;
alter table mtg_printings add column if not exists full_name text;
alter table mtg_printings add column if not exists display_name text;

create index if not exists mtg_printings_scryfall_id_idx on mtg_printings(scryfall_id);
create index if not exists mtg_printings_finish_idx on mtg_printings(finish);
create index if not exists mtg_printings_collectible_type_idx on mtg_printings(collectible_type);
create index if not exists mtg_printings_set_collector_idx on mtg_printings(set_code, collector_number);

create unique index if not exists mtg_collection_entries_user_printing_unique
on mtg_collection_entries(user_id, printing_id);
