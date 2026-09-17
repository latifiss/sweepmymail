create table if not exists agent_automation_runs (
  id uuid primary key default gen_random_uuid(),
  automation_id uuid not null references agent_automations(id) on delete cascade,
  message_id text not null,
  status text not null check (status in ('running', 'succeeded', 'failed')),
  error_message text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (automation_id, message_id)
);

create index if not exists agent_automation_runs_automation_idx
  on agent_automation_runs (automation_id, created_at desc);
