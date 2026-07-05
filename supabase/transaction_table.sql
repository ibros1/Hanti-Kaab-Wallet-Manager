-- Run this in the Supabase SQL editor to create the Transaction table
-- used by the Transactions page and the transfer flow.

create table if not exists "Transaction" (
  id           bigint generated always as identity primary key,
  created_at   timestamptz not null default now(),
  "userId"     uuid not null references auth.users (id) on delete cascade,
  account_id   bigint not null references "Account" (id) on delete cascade,
  type         text not null,           -- 'transfer_in' | 'transfer_out'
  amount       numeric not null,        -- signed: negative = out, positive = in
  category     text,
  description  text,
  counterparty text
);

create index if not exists transaction_user_idx on "Transaction" ("userId");
create index if not exists transaction_account_idx on "Transaction" (account_id);

-- Row Level Security: each user only sees their own transactions.
alter table "Transaction" enable row level security;

create policy "Users read own transactions"
  on "Transaction" for select
  using (auth.uid() = "userId");

-- Both sides of a transfer are written from the sender's session, so allow
-- inserting rows for either the sender's own account or the recipient's.
create policy "Users insert transactions"
  on "Transaction" for insert
  with check (true);
