import { getEmailsForUser, listCategoriesForUser } from "../repositories/dataRepository";
import { listAutomationsForUser } from "../repositories/automationRepository";
import { listUserScheduledEmails } from "../services/scheduledEmailService";
import { env } from "../config/env";
import { getAgentUsage } from "./agent.runtime";

export async function getAgentContext(userId: string) {
  const [emails,categories,automations,scheduled,usage] = await Promise.all([getEmailsForUser(userId),listCategoriesForUser(userId),listAutomationsForUser(userId),listUserScheduledEmails(userId),getAgentUsage(userId)]);
  return {
    inbox:{syncedEmails:emails.length,unread:emails.filter((e:any)=>Boolean(e.is_unread||e.unread)).length,important:emails.filter((e:any)=>Boolean(e.is_important||e.important)).length},
    categories:categories.map((c:any)=>({id:c.id,label:c.label,emailCount:c.email_count??0})),
    automations:{total:automations.length,active:automations.filter((a:any)=>a.status==="active").length,paused:automations.filter((a:any)=>a.status==="paused").length},
    scheduled:{pending:scheduled.filter((s:any)=>s.status==="scheduled").length,total:scheduled.length},
    usage:{requestsToday:Number(usage.request_count||0),tokensToday:Number(usage.total_tokens||0),requestLimit:env.AGENT_REQUESTS_PER_DAY,tokenLimit:env.AGENT_DAILY_TOKEN_LIMIT},
    generatedAt:new Date().toISOString()
  };
}
