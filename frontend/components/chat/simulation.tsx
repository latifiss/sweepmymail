"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import UserMessage from "@/components/chat/userMessage";
import ChatResponse from "@/components/chat/chatResponse";
import ThinkingIndicator from "@/components/chat/thinkingIndicator";
import type {
  ResponseAction,
  ResponseBlock,
} from "@/components/chat/chat-response-types";

export interface SimulationStep {
  prompt: string;
  stages: string[];
  response: ResponseBlock;
  followUp?: {
    action: ResponseAction;
    userEcho: string;
    stages: string[];
    response: ResponseBlock;
  };
}

export interface SimulationProps {
  steps?: SimulationStep[];
  typeSpeed?: number;
  stageDuration?: number;
  pauseBetweenSteps?: number;
  className?: string;
}

const DEFAULT_STEPS: SimulationStep[] = [
  {
    prompt: "Summarize my inbox from the last 24 hours",
    stages: [
      "Scanning your inbox",
      "Reading emails",
      "Extracting key points",
      "Building summary",
    ],
    response: {
      kind: "summary",
      lead: "You had a busy day. Here's what happened:",
      title: "Your day in review",
      content:
        "You received 42 emails today [1]. Twelve were replies to threads you started [2]. Three invoices came through, one overdue [3]. Overall, your inbox is 18% smaller than yesterday.",
      citations: [
        {
          id: "sim_1",
          sender: "Inbox Digest",
          senderEmail: "digest@magicmail.app",
          subject: "Daily totals",
          preview: "42 received · 28 read · 14 unread",
          receivedAt: "2026-09-20T08:00:00Z",
        },
        {
          id: "sim_2",
          sender: "Alice Johnson",
          senderEmail: "alice@example.com",
          subject: "Re: Q3 planning doc",
          preview: "Thanks for sending the draft — one small correction...",
          receivedAt: "2026-09-19T14:32:00Z",
        },
        {
          id: "sim_3",
          sender: "Marcus Reid",
          senderEmail: "marcus@acme.co",
          subject: "Invoice #4821 overdue",
          preview: "Just a heads-up that this invoice is now 5 days past due...",
          receivedAt: "2026-09-19T09:15:00Z",
        },
      ],
    },
  },

  {
    prompt: "Show me my unread emails from this week",
    stages: [
      "Scanning your inbox",
      "Filtering unread",
      "Sorting by sender",
      "Preparing list",
    ],
    response: {
      kind: "email-list",
      lead: "You have 14 unread emails. Here are the most recent:",
      title: "Unread this week",
      emails: [
        {
          id: "sim_e1",
          sender: "Alice Johnson",
          senderEmail: "alice@example.com",
          subject: "Q3 planning doc — needs your review",
          preview:
            "Hey, attached is the updated draft. Can you take a look before Friday?",
          receivedAt: "2026-09-19T14:32:00Z",
        },
        {
          id: "sim_e2",
          sender: "Marcus Reid",
          senderEmail: "marcus@acme.co",
          subject: "Invoice #4821 overdue",
          preview:
            "Just a heads-up that this invoice is now 5 days past due. Could you...",
          receivedAt: "2026-09-19T09:15:00Z",
        },
        {
          id: "sim_e3",
          sender: "Support Team",
          senderEmail: "support@saas.io",
          subject: "Your trial ends in 3 days",
          preview:
            "Your 14-day trial ends on September 22. Upgrade to keep access to...",
          receivedAt: "2026-09-18T22:04:00Z",
        },
      ],
    },
  },

  {
    prompt: "Draft a reply to Alice about the planning doc",
    stages: [
      "Reading the thread",
      "Choosing a tone",
      "Writing the reply",
      "Preparing preview",
    ],
    response: {
      kind: "draft",
      lead: "I've drafted a reply to Alice. Take a look:",
      draft: {
        id: "sim_draft",
        to: "alice@example.com",
        subject: "Re: Q3 planning doc — needs your review",
        body: "Hi Alice,\n\nThanks for the updated draft — the structure looks solid. I'll add a short section on Q4 goals and send it back to you by end of day Friday.\n\nOne small note: the revenue projections on page 4 should probably be tied to the current quarter's actuals. Happy to walk through it if useful.\n\nBest,\nJohn",
      },
    },
    followUp: {
      action: { type: "confirm-send", draftId: "sim_draft" },
      userEcho: "Confirm and send the draft",
      stages: ["Sending the email", "Confirming delivery"],
      response: {
        kind: "text",
        lead: "Sent.",
        content:
          "Your reply to Alice is on its way. I'll let you know if she responds.",
      },
    },
  },

  {
    prompt: "Schedule a follow-up with Alice next week",
    stages: [
      "Checking your calendar",
      "Finding open slots",
      "Confirming timezone",
      "Preparing event",
    ],
    response: {
      kind: "schedule",
      lead: "I found a slot that works for both of you:",
      event: {
        id: "sim_event",
        title: "Follow-up with Alice — Q3 planning",
        when: "Tuesday, Sep 23 · 2:00 PM",
        duration: "30 minutes",
      },
    },
    followUp: {
      action: { type: "schedule-accept", eventId: "sim_event" },
      userEcho: "Schedule the event",
      stages: ["Adding to your calendar", "Sending invite"],
      response: {
        kind: "text",
        lead: "Booked.",
        content:
          "Added to your calendar and sent Alice an invite for Tuesday at 2:00 PM.",
      },
    },
  },

  {
    prompt: "Clean up my promotions folder",
    stages: [
      "Analyzing your inbox",
      "Estimating impact",
      "Preparing action",
    ],
    response: {
      kind: "confirm",
      lead: "I can archive 42 emails from the promotions category. Everything older than 30 days:",
      promptId: "sim_prompt",
      question: "Archive all 42 promotions emails older than 30 days?",
    },
    followUp: {
      action: { type: "confirm", promptId: "sim_prompt", choice: "yes" },
      userEcho: "Yes, confirm",
      stages: ["Archiving emails", "Updating your inbox"],
      response: {
        kind: "text",
        lead: "Done.",
        content:
          "Archived 42 emails from promotions. Your inbox is 34% smaller.",
      },
    },
  },

  {
    prompt: "What can you do?",
    stages: ["Thinking", "Reviewing capabilities", "Preparing response"],
    response: {
      kind: "text",
      lead: "Here's what I can do for you:",
      content:
        "I read every email that lands in your inbox, categorize it automatically, and summarize what matters. I can also draft replies in your voice, schedule follow-ups, and archive entire categories with a single command. Just ask.",
    },
  },
];

type SimulationPhase =
  | { name: "idle" }
  | { name: "typing"; stepIndex: number; charCount: number }
  | { name: "submitted"; stepIndex: number }
  | { name: "thinking"; stepIndex: number }
  | { name: "responded"; stepIndex: number }
  | { name: "actionPulse"; stepIndex: number }
  | { name: "actionEcho"; stepIndex: number }
  | { name: "actionThinking"; stepIndex: number }
  | { name: "actionResponded"; stepIndex: number }
  | { name: "pausing"; stepIndex: number };

export default function Simulation({
  steps = DEFAULT_STEPS,
  typeSpeed = 29,
  stageDuration = 643,
  pauseBetweenSteps = 1786,
  className,
}: SimulationProps) {
  const rootClassName = className ? `simulation ${className}` : "simulation";

  const [phase, setPhase] = useState<SimulationPhase>({
    name: "typing",
    stepIndex: 0,
    charCount: 0,
  });

  const threadRef = useRef<HTMLDivElement>(null);
  const bottomRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const el = threadRef.current;
    if (!el) return;
    el.scrollTop = el.scrollHeight;
  }, [phase]);

  useEffect(() => {
    if (phase.name !== "typing") return;
    const step = steps[phase.stepIndex];
    if (!step) return;

    if (phase.charCount >= step.prompt.length) {
      const timer = setTimeout(() => {
        setPhase({ name: "submitted", stepIndex: phase.stepIndex });
      }, 179);
      return () => clearTimeout(timer);
    }

    const timer = setTimeout(() => {
      setPhase({
        name: "typing",
        stepIndex: phase.stepIndex,
        charCount: phase.charCount + 1,
      });
    }, typeSpeed);

    return () => clearTimeout(timer);
  }, [phase, steps, typeSpeed]);

  useEffect(() => {
    if (phase.name !== "submitted") return;
    const timer = setTimeout(() => {
      setPhase({ name: "thinking", stepIndex: phase.stepIndex });
    }, 214);
    return () => clearTimeout(timer);
  }, [phase]);

  const handleThinkingComplete = useCallback(() => {
    if (phase.name !== "thinking") return;
    setPhase({ name: "responded", stepIndex: phase.stepIndex });
  }, [phase]);

  useEffect(() => {
    if (phase.name !== "responded") return;
    const step = steps[phase.stepIndex];
    if (!step) return;

    const timer = setTimeout(() => {
      if (step.followUp) {
        setPhase({ name: "actionPulse", stepIndex: phase.stepIndex });
      } else {
        setPhase({ name: "pausing", stepIndex: phase.stepIndex });
      }
    }, pauseBetweenSteps);

    return () => clearTimeout(timer);
  }, [phase, steps, pauseBetweenSteps]);

  useEffect(() => {
    if (phase.name !== "actionPulse") return;
    const timer = setTimeout(() => {
      setPhase({ name: "actionEcho", stepIndex: phase.stepIndex });
    }, 500);
    return () => clearTimeout(timer);
  }, [phase]);

  useEffect(() => {
    if (phase.name !== "actionEcho") return;
    const timer = setTimeout(() => {
      setPhase({ name: "actionThinking", stepIndex: phase.stepIndex });
    }, 286);
    return () => clearTimeout(timer);
  }, [phase]);

  const handleActionThinkingComplete = useCallback(() => {
    if (phase.name !== "actionThinking") return;
    setPhase({ name: "actionResponded", stepIndex: phase.stepIndex });
  }, [phase]);

  useEffect(() => {
    if (phase.name !== "actionResponded") return;
    const timer = setTimeout(() => {
      setPhase({ name: "pausing", stepIndex: phase.stepIndex });
    }, pauseBetweenSteps);
    return () => clearTimeout(timer);
  }, [phase, pauseBetweenSteps]);

  useEffect(() => {
    if (phase.name !== "pausing") return;

    const nextIndex = phase.stepIndex + 1;
    const isLast = nextIndex >= steps.length;

    const timer = setTimeout(
      () => {
        setPhase({
          name: "typing",
          stepIndex: isLast ? 0 : nextIndex,
          charCount: 0,
        });
      },
      isLast ? 1429 : 429
    );

    return () => clearTimeout(timer);
  }, [phase, steps.length]);

  const currentStep =
    phase.name === "idle" ? undefined : steps[phase.stepIndex];
  const historySteps =
    phase.name === "idle" ? [] : steps.slice(0, phase.stepIndex);

  const liveUserMessage =
    phase.name === "submitted" ||
    phase.name === "thinking" ||
    phase.name === "responded" ||
    phase.name === "actionPulse" ||
    phase.name === "actionEcho" ||
    phase.name === "actionThinking" ||
    phase.name === "actionResponded" ||
    phase.name === "pausing"
      ? currentStep?.prompt
      : null;

  const liveTypingPrompt =
    phase.name === "typing" && currentStep
      ? currentStep.prompt.slice(0, phase.charCount)
      : null;

  const showThinking = phase.name === "thinking";
  const showResponse =
    phase.name === "responded" ||
    phase.name === "actionPulse" ||
    phase.name === "actionEcho" ||
    phase.name === "actionThinking" ||
    phase.name === "actionResponded" ||
    phase.name === "pausing";

  const showFollowUpEcho =
    phase.name === "actionEcho" ||
    phase.name === "actionThinking" ||
    phase.name === "actionResponded";

  const showActionThinking = phase.name === "actionThinking";
  const showActionResponse = phase.name === "actionResponded";
  const highlightAction = phase.name === "actionPulse";

  return (
    <div className={rootClassName} aria-hidden="true">
      <div className="simulation__thread" ref={threadRef}>
        <div className="simulation__thread-inner">
          {historySteps.map((step, index) => (
            <div key={`past-${index}`} className="simulation__step">
              <UserMessage content={step.prompt} />
              <ChatResponse response={step.response} stream={false} />

              {step.followUp && (
                <>
                  <UserMessage content={step.followUp.userEcho} />
                  <ChatResponse
                    response={step.followUp.response}
                    stream={false}
                  />
                </>
              )}
            </div>
          ))}

          <div className="simulation__step">
            {liveTypingPrompt !== null && (
              <div className="simulation__typing-bubble">
                <span className="simulation__typing-text">
                  {liveTypingPrompt}
                </span>
                <span className="simulation__typing-caret" />
              </div>
            )}

            {liveUserMessage && <UserMessage content={liveUserMessage} />}

            {showThinking && currentStep && (
              <ThinkingIndicator
                stages={currentStep.stages}
                stageDuration={stageDuration}
                onComplete={handleThinkingComplete}
              />
            )}

            {showResponse && currentStep && (
              <div
                className={`simulation__response${
                  highlightAction ? " simulation__response--highlight" : ""
                }`}
              >
                <ChatResponse
                  response={currentStep.response}
                  stream={true}
                />
              </div>
            )}

            {showFollowUpEcho && currentStep?.followUp && (
              <UserMessage content={currentStep.followUp.userEcho} />
            )}

            {showActionThinking && currentStep?.followUp && (
              <ThinkingIndicator
                stages={currentStep.followUp.stages}
                stageDuration={stageDuration}
                onComplete={handleActionThinkingComplete}
              />
            )}

            {showActionResponse && currentStep?.followUp && (
              <ChatResponse
                response={currentStep.followUp.response}
                stream={true}
              />
            )}
          </div>

          <div ref={bottomRef} />
        </div>
      </div>
    </div>
  );
}