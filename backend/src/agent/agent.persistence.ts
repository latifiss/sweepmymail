import { pool } from "../auth/auth";

export type ConversationStatus = "active" | "archived";
export type MessageRole = "user" | "assistant" | "system" | "tool";

export interface ConversationRecord { id:string; user_id:string; title:string; status:ConversationStatus; created_at:string; updated_at:string; }
export interface MessageRecord { id:string; conversation_id:string; role:MessageRole; content:unknown; tool_name:string|null; tool_call_id:string|null; tool_input:unknown|null; tool_result:unknown|null; metadata:unknown; created_at:string; }

function normalizeTitle(value?:string) { const title=value?.trim().replace(/\s+/g," "); if(!title) return "New conversation"; return title.length>120 ? `${title.slice(0,117)}...` : title; }

export async function createConversation(userId:string,title?:string){ const r=await pool.query<ConversationRecord>("insert into agent_conversations (user_id,title) values ($1,$2) returning id,user_id,title,status,created_at,updated_at",[userId,normalizeTitle(title)]); return r.rows[0]; }
export async function getConversationForUser(userId:string,id:string){ const r=await pool.query<ConversationRecord>("select id,user_id,title,status,created_at,updated_at from agent_conversations where id=$1 and user_id=$2",[id,userId]); return r.rows[0]||null; }
export async function listConversationsForUser(userId:string){ const r=await pool.query<ConversationRecord>("select id,user_id,title,status,created_at,updated_at from agent_conversations where user_id=$1 order by updated_at desc",[userId]); return r.rows; }
export async function updateConversationTitle(userId:string,id:string,title:string){ const r=await pool.query<ConversationRecord>("update agent_conversations set title=$3,updated_at=now() where id=$1 and user_id=$2 returning id,user_id,title,status,created_at,updated_at",[id,userId,normalizeTitle(title)]); return r.rows[0]||null; }
export async function setConversationStatus(userId:string,id:string,status:ConversationStatus){ const r=await pool.query<ConversationRecord>("update agent_conversations set status=$3,updated_at=now() where id=$1 and user_id=$2 returning id,user_id,title,status,created_at,updated_at",[id,userId,status]); return r.rows[0]||null; }
export async function deleteConversation(userId:string,id:string){ const r=await pool.query("delete from agent_conversations where id=$1 and user_id=$2",[id,userId]); return r.rowCount===1; }

export async function addMessage(payload:{conversationId:string;role:MessageRole;content:unknown;toolName?:string|null;toolCallId?:string|null;toolInput?:unknown|null;toolResult?:unknown|null;metadata?:unknown}){
 const r=await pool.query<MessageRecord>("insert into agent_messages (conversation_id,role,content,tool_name,tool_call_id,tool_input,tool_result,metadata) values ($1,$2,$3::jsonb,$4,$5,$6::jsonb,$7::jsonb,$8::jsonb) returning id,conversation_id,role,content,tool_name,tool_call_id,tool_input,tool_result,metadata,created_at",[payload.conversationId,payload.role,JSON.stringify(payload.content??null),payload.toolName||null,payload.toolCallId||null,payload.toolInput===undefined?null:JSON.stringify(payload.toolInput),payload.toolResult===undefined?null:JSON.stringify(payload.toolResult),JSON.stringify(payload.metadata??{})]);
 await pool.query("update agent_conversations set updated_at=now() where id=$1",[payload.conversationId]); return r.rows[0];
}
export async function listMessagesForConversation(userId:string,id:string){ const r=await pool.query<MessageRecord>("select m.id,m.conversation_id,m.role,m.content,m.tool_name,m.tool_call_id,m.tool_input,m.tool_result,m.metadata,m.created_at from agent_messages m inner join agent_conversations c on c.id=m.conversation_id where c.id=$1 and c.user_id=$2 order by m.created_at asc",[id,userId]); return r.rows; }
export async function ensureConversationForUser(userId:string,id?:string){ if(id){const existing=await getConversationForUser(userId,id); if(!existing) throw new Error("Conversation not found"); if(existing.status==="archived") throw new Error("Conversation is archived"); return existing;} return createConversation(userId); }
export async function setConversationTitleIfNew(userId:string,id:string,firstUserMessage:string){ const c=await getConversationForUser(userId,id); if(!c||c.title!=="New conversation") return c; return updateConversationTitle(userId,id,firstUserMessage); }
