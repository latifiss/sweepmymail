export interface EmailRef {
  id: string;
  sender: string;
  senderEmail: string;
  subject: string;
  preview: string;
  receivedAt: string;
}

export interface EmailDraft {
  id: string;
  to: string;
  cc?: string;
  subject: string;
  body: string;
}

export interface ScheduleEvent {
  id: string;
  title: string;
  when: string;
  duration: string;
}

interface ResponseBase {
  lead?: string;
}

export type ResponseBlock =
  | ({ kind: "text"; content: string; citations?: EmailRef[] } & ResponseBase)
  | ({ kind: "email-list"; title?: string; emails: EmailRef[] } & ResponseBase)
  | ({ kind: "summary"; title?: string; content: string; citations: EmailRef[] } & ResponseBase)
  | ({ kind: "draft"; draft: EmailDraft } & ResponseBase)
  | ({ kind: "schedule"; event: ScheduleEvent } & ResponseBase)
  | ({ kind: "confirm"; promptId: string; question: string } & ResponseBase);

export type ResponseAction =
  | { type: "open-email"; emailId: string }
  | { type: "confirm-send"; draftId: string }
  | { type: "continue-draft"; draftId: string }
  | { type: "schedule-accept"; eventId: string }
  | { type: "schedule-cancel"; eventId: string }
  | { type: "confirm"; promptId: string; choice: "yes" | "no" };