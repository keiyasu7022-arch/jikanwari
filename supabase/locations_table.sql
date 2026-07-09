-- 教える場所（location）管理用テーブル
-- Supabaseダッシュボードの SQL Editor で実行してください。
-- 既存の teachers / students / lessons テーブルと同じ権限方針（anonキーで読み書き可能）を想定しています。
-- 既存テーブルのRLSポリシーが異なる場合は、ポリシー部分を合わせて調整してください。

create table if not exists locations (
  id text primary key,
  name text not null,
  color text not null
);

alter table locations enable row level security;

create policy "locations_select_all" on locations
  for select using (true);

create policy "locations_insert_all" on locations
  for insert with check (true);

create policy "locations_update_all" on locations
  for update using (true) with check (true);

create policy "locations_delete_all" on locations
  for delete using (true);

-- 既存の "桑山" "総本陣" に色を付けて初期登録する（すでに存在する場合はスキップ）
insert into locations (id, name, color) values
  ('loc-kuwayama', '桑山', '#6366f1'),
  ('loc-sohonjin', '総本陣', '#f59e0b')
on conflict (id) do nothing;
