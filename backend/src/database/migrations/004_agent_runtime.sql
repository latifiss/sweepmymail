alter table agent_messages
  add column if not exists metadata jsonb not null default '{}'::jsonb;

create index if not exists agent_messages_metadata_gin_idx
  on agent_messages using gin (metadata);

create table if not exists agent_usage_daily (
  user_id uuid not null,
  usage_date date not null default current_date,
  request_count integer not null default 0,
  input_tokens bigint not null default 0,
  output_tokens bigint not null default 0,
  total_tokens bigint not null default 0,
  updated_at timestamptz not null default now(),
  primary key (user_id, usage_date)
);

create index if not exists agent_usage_daily_updated_idx
  on agent_usage_daily (updated_at desc);

create table if not exists agent_rate_limit_windows (
  user_id uuid not null,
  window_start timestamptz not null,
  request_count integer not null default 0,
  primary key (user_id, window_start)
);

create index if not exists agent_rate_limit_windows_window_idx
  on agent_rate_limit_windows (window_start);

create table if not exists agent_request_events (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null,
  conversation_id uuid references agent_conversations(id) on delete set null,
  status text not null check (status in ('started', 'completed', 'failed', 'aborted', 'rejected')),
  request_id text not null,
  model text,
  input_tokens integer not null default 0,
  output_tokens integer not null default 0,
  total_tokens integer not null default 0,
  error_code text,
  created_at timestamptz not null default now(),
  completed_at timestamptz
);

create unique index if not exists agent_request_events_request_id_idx
  on agent_request_events (request_id);

create index if not exists agent_request_events_user_created_idx
  on agent_request_events (user_id, created_at desc);

create index if not exists agent_request_events_status_idx
  on agent_request_events (status, created_at desc);
