import express from "express";
import { pipeAgentUIStreamToResponse } from "ai";
import { authMiddleware } from "../middlewares/authMiddleware";
import { createMailAgent } from "../agent/mailAgent";
import { createConversation, deleteConversation, ensureConversationForUser, getConversationForUser, listConversationsForUser, listMessagesForConversation, setConversationStatus, setConversationTitleIfNew, updateConversationTitle, addMessage } from "../agent/agent.persistence";
import { env } from "../config/env";
import { getAgentContext } from "../agent/agent.context";
import { consumeAgentQuota, createRequestId, finishRequest, startRequest, validateAgentInput } from "../agent/agent.runtime";
import { agentErrorResponse, getRequestId } from "../agent/agent.http";

const router = express.Router();

router.get("/conversations", authMiddleware, async (req,res,next)=>{try{const user=(req as any).user;res.json({conversations:await listConversationsForUser(user.id)});}catch(e){next(e);}});
router.post("/conversations", authMiddleware, async (req,res,next)=>{try{const user=(req as any).user;res.status(201).json({conversation:await createConversation(user.id,req.body?.title)});}catch(e){next(e);}});
router.get("/conversations/:conversationId", authMiddleware, async (req,res,next)=>{try{const user=(req as any).user;const conversation=await getConversationForUser(user.id,req.params.conversationId);if(!conversation)return res.status(404).json({error:{code:"CONVERSATION_NOT_FOUND",message:"Conversation not found"}});res.json({conversation,messages:await listMessagesForConversation(user.id,conversation.id)});}catch(e){next(e);}});
router.patch("/conversations/:conversationId", authMiddleware, async (req,res,next)=>{try{const user=(req as any).user;const id=req.params.conversationId;let conversation=await getConversationForUser(user.id,id);if(!conversation)return res.status(404).json({error:{code:"CONVERSATION_NOT_FOUND",message:"Conversation not found"}});if(typeof req.body?.title==="string")conversation=await updateConversationTitle(user.id,id,req.body.title);if(req.body?.status==="active"||req.body?.status==="archived")conversation=await setConversationStatus(user.id,id,req.body.status);res.json({conversation});}catch(e){next(e);}});
router.delete("/conversations/:conversationId", authMiddleware, async (req,res,next)=>{try{const user=(req as any).user;if(!await deleteConversation(user.id,req.params.conversationId))return res.status(404).json({error:{code:"CONVERSATION_NOT_FOUND",message:"Conversation not found"}});res.status(204).send();}catch(e){next(e);}});

router.get("/context", authMiddleware, async (req,res,next)=>{try{const user=(req as any).user;res.json({context:await getAgentContext(user.id)});}catch(e){next(e);}});
router.get("/usage", authMiddleware, async (req,res,next)=>{try{const user=(req as any).user;res.json({usage:await getAgentContext(user.id).then((context)=>context.usage)});}catch(e){next(e);}});

async function handleChat(req:express.Request,res:express.Response,next:express.NextFunction){
  const requestId=getRequestId(req);
  const user=(req as any).user as {id:string;email:string};
  try{
    const messages=req.body?.messages;
    validateAgentInput(messages);
    await consumeAgentQuota(user.id);
    const conversation=await ensureConversationForUser(user.id,req.body?.conversationId);
    const lastUserMessage=[...messages].reverse().find((message:any)=>message?.role==="user");
    const lastUserContent=Array.isArray(lastUserMessage?.parts)?lastUserMessage.parts.filter((part:any)=>part?.type==="text").map((part:any)=>part.text).join(" "):typeof lastUserMessage?.content==="string"?lastUserMessage.content:"";
    if(lastUserContent){
      await setConversationTitleIfNew(user.id,conversation.id,lastUserContent);
      await addMessage({conversationId:conversation.id,role:"user",content:lastUserMessage,metadata:{executionState:"received"}});
    }
    await startRequest(user.id,conversation.id,requestId,env.AGENT_MODEL);
    res.setHeader("X-Request-Id",requestId);
    res.setHeader("X-Conversation-Id",conversation.id);
    res.setHeader("Cache-Control","no-cache, no-transform");
    res.setHeader("X-Accel-Buffering","no");
    const abortController=new AbortController();
    req.on("close",()=>abortController.abort());
    try{
      await pipeAgentUIStreamToResponse({response:res,agent:createMailAgent(user.id,user.email,conversation.id),uiMessages:messages,abortSignal:abortController.signal,sendReasoning:false});
      await finishRequest(requestId,abortController.signal.aborted?"aborted":"completed");
    }catch(error){
      await finishRequest(requestId,abortController.signal.aborted?"aborted":"failed",undefined,error instanceof Error?error.name:null);
      if(!res.headersSent) return agentErrorResponse(res,error,requestId);
    }
  }catch(error){
    await finishRequest(requestId,"rejected",undefined,error instanceof Error?error.name:null).catch(()=>undefined);
    if(res.headersSent)return;
    return agentErrorResponse(res,error,requestId);
  }
}
router.post("/chat",authMiddleware,handleChat);
router.post("/chat/continue",authMiddleware,handleChat);

router.use((err:any,req:express.Request,res:express.Response,next:express.NextFunction)=>agentErrorResponse(res,err,getRequestId(req)));
export default router;
