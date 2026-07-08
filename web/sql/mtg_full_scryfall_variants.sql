-- MTG full Scryfall finish/variant/token support.
-- Run before npm run mtg:import. Safe to run multiple times.

alter table mtg_printings add column if not exists base_scryfall_id text;
alter table mtg_printings add column if not exists finish text;
alter table mtg_printings add column if not exists finish_label text;
alter table mtg_printings add column if not exists variant_label text;
alter table mtg_printings add column if not exists is_token boolean default false;
alter table mtg_printings add column if not exists is_extra boolean default false;
alter table mtg_printings add column if not exists parent_set_code text;

create index if not exists mtg_printings_base_scryfall_idx on mtg_printings(base_scryfall_id);
create index if not exists mtg_printings_finish_idx on mtg_printings(finish);
create index if not exists mtg_printings_variant_label_idx on mtg_printings(variant_label);
create index if not exists mtg_printings_parent_set_idx on mtg_printings(parent_set_code);
create index if not exists mtg_printings_token_idx on mtg_printings(is_token);
create index if not exists mtg_printings_extra_idx on mtg_printings(is_extra);
create index if not exists mtg_printings_set_finish_idx on mtg_printings(set_code, finish);

-- Optional cleanup for prior experimental non-finish rows. These rows are ignored by the UI,
-- but deleting them keeps counts cleaner after the finish-split import has populated replacement rows.
delete from mtg_printings
where finish is null
  and exists (
    select 1
    from mtg_printings p2
    where p2.base_scryfall_id = mtg_printings.id
      and p2.finish is not null
  );
