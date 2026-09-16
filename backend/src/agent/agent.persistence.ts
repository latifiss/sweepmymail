import { pool } from "../auth/auth";

export type ConversationStatus = "active" | "archived";
export type MessageRole = "user" | "assistant" | "system" | "tool";

export interface ConversationRecord {
  id: string;
  user_id: string;
  title: string;
  status: ConversationStatus;
  created_at: string;
  updated_at: string;
}

export interface MessageRecord {
  id: string;
  conversation_id: string;
  role: MessageRole;
  content: unknown;
  tool_name: string | null;
  tool_call_id: string | null;
  tool_input: unknown | null;
  tool_result: unknown | null;
  created_at: string;
}

function normalizeTitle(value: string | undefined) {
  const title = value?.trim().replace(/\s+/g, " ");
  if (!title) return "New conversation";
  return title.length > 120 ? `${title.slice(0, 117)}...` : title;
}

export async function createConversation(userId: string, title?: string) {
  const result = await pool.query<ConversationRecord>(
    `insert into agent_conversations (user_id, title)
     values ($1, $2)
     returning id, user_id, title, status, created_at, updated_at`,
    [userId, normalizeTitle(title)]
  );
  return result.rows[0];
}

export async function getConversationForUser(userId: string, conversationId: string) {
  const result = await pool.query<ConversationRecord>(
    `select id, user_id, title, status, created_at, updated_at
     from agent_conversations
     where id = $1 and user_id = $2`,
    [conversationId, userId]
  );
  return result.rows[0] || null;
}

export async function listConversationsForUser(userId: string) {
  const result = await pool.query<ConversationRecord>(
    `select id, user_id, title, status, created_at, updated_at
     from agent_conversations
     where user_id = $1
     order by updated_at desc`,
    [userId]
  );
  return result.rows;
}

export async function updateConversationTitle(userId: string, conversationId: string, title: string) {
  const result = await pool.query<ConversationRecord>(
    `update agent_conversations
     set title = $3, updated_at = now()
     where id = $1 and user_id = $2
     returning id, user_id, title, status, created_at, updated_at`,
    [conversationId, userId, normalizeTitle(title)]
  );
  return result.rows[0] || null;
}

export async function setConversationStatus(userId: string, conversationId: string, status: ConversationStatus) {
  const result = await pool.query<ConversationRecord>(
    `update agent_conversations
     set status = $3, updated_at = now()
     where id = $1 and user_id = $2
     returning id, user_id, title, status, created_at, updated_at`,
    [conversationId, userId, status]
  );
  return result.rows[0] || null;
}

export async function deleteConversation(userId: string, conversationId: string) {
  const result = await pool.query(
    `delete from agent_conversations where id = $1 and user_id = $2`,
    [conversationId, userId]
  );
  return result.rowCount === 1;
}

export async function addMessage(payload: {
  conversationId: string;
  role: MessageRole;
  content: unknown;
  toolName?: string | null;
  toolCallId?: string | null;
  toolInput?: unknown | null;
  toolResult?: unknown | null;
}) {
  const result = await pool.query<MessageRecord>(
    `insert into agent_messages
      (conversation_id, role, content, tool_name, tool_call_id, tool_input, tool_result)
     values ($1, $2, $3::jsonb, $4, $5, $6::jsonb, $7::jsonb)
     returning id, conversation_id, role, content, tool_name, tool_call_id, tool_input, tool_result, created_at`,
    [
      payload.conversationId,
      payload.role,
      JSON.stringify(payload.content ?? null),
      payload.toolName || null,
      payload.toolCallId || null,
      payload.toolInput === undefined ? null : JSON.stringify(payload.toolInput),
      payload.toolResult === undefined ? null : JSON.stringify(payload.toolResult),
    ]
  );

  await pool.query(`update agent_conversations set updated_at = now() where id = $1`, [payload.conversationId]);
  return result.rows[0];
}

export async function listMessagesForConversation(userId: string, conversationId: string) {
  const result = await pool.query<MessageRecord>(
    `select m.id, m.conversation_id, m.role, m.content, m.tool_name, m.tool_call_id,
            m.tool_input, m.tool_result, m.created_at
     from agent_messages m
     inner join agent_conversations c on c.id = m.conversation_id
     where c.id = $1 and c.user_id = $2
     order by m.created_at asc`,
    [conversationId, userId]
  );
  return result.rows;
}

export async function ensureConversationForUser(userId: string, conversationId?: string) {
  if (conversationId) {
    const existing = await getConversationForUser(userId, conversationId);
    if (!existing) throw new Error("Conversation not found");
    if (existing.status === "archived") throw new Error("Conversation is archived");
    return existing;
  }
  return createConversation(userId);
}

export async function setConversationTitleIfNew(userId: string, conversationId: string, firstUserMessage: string) {
  const conversation = await getConversationForUser(userId, conversationId);
  if (!conversation || conversation.title !== "New conversation") return conversation;
  return updateConversationTitle(userId, conversationId, firstUserMessage);
}
