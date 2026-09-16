create extension if not exists pgcrypto;

create table if not exists agent_conversations (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null,
  title text not null default 'New conversation',
  status text not null default 'active' check (status in ('active', 'archived')),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists agent_conversations_user_updated_idx
  on agent_conversations (user_id, updated_at desc);

create table if not exists agent_messages (
  id uuid primary key default gen_random_uuid(),
  conversation_id uuid not null references agent_conversations(id) on delete cascade,
  role text not null check (role in ('user', 'assistant', 'system', 'tool')),
  content jsonb not null,
  tool_name text,
  tool_call_id text,
  tool_input jsonb,
  tool_result jsonb,
  created_at timestamptz not null default now()
);

create index if not exists agent_messages_conversation_created_idx
  on agent_messages (conversation_id, created_at asc);

create index if not exists agent_messages_tool_call_idx
  on agent_messages (conversation_id, tool_call_id)
  where tool_call_id is not null;

create table if not exists agent_scheduled_emails (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null,
  conversation_id uuid references agent_conversations(id) on delete set null,
  to_addresses jsonb not null,
  cc_addresses jsonb not null default '[]'::jsonb,
  bcc_addresses jsonb not null default '[]'::jsonb,
  subject text not null,
  body text not null,
  send_at timestamptz not null,
  timezone text not null default 'UTC',
  status text not null default 'scheduled' check (status in ('scheduled', 'sending', 'sent', 'failed', 'cancelled')),
  gmail_message_id text,
  gmail_thread_id text,
  error_message text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists agent_scheduled_emails_due_idx
  on agent_scheduled_emails (status, send_at);

create index if not exists agent_scheduled_emails_user_idx
  on agent_scheduled_emails (user_id, created_at desc);

create table if not exists agent_automations (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null,
  name text not null,
  trigger_type text not null,
  trigger_config jsonb not null default '{}'::jsonb,
  action_type text not null,
  action_config jsonb not null default '{}'::jsonb,
  status text not null default 'active' check (status in ('active', 'paused')),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists agent_automations_user_status_idx
  on agent_automations (user_id, status);
