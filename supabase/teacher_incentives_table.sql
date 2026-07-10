-- 講師インセンティブ（月ごとの備考入力：金額＋理由）管理用テーブル
-- Supabaseダッシュボードの SQL Editor で実行してください。
-- 既存の teachers / students / lessons テーブルと同じ権限方針（anonキーで読み書き可能）を想定しています。

create table if not exists teacher_incentives (
  id text primary key,
  teacher_id text not null references teachers(id) on delete cascade,
  date date not null,
  amount numeric not null,
  reason text not null default ''
);

alter table teacher_incentives enable row level security;

create policy "teacher_incentives_select_all" on teacher_incentives
  for select using (true);

create policy "teacher_incentives_insert_all" on teacher_incentives
  for insert with check (true);

create policy "teacher_incentives_update_all" on teacher_incentives
  for update using (true) with check (true);

create policy "teacher_incentives_delete_all" on teacher_incentives
  for delete using (true);
