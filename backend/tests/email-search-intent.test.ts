import test from "node:test";
import assert from "node:assert/strict";
import { parseEmailSearchIntent } from "../src/agent/emailSearchIntent";

test("parses a sender and requested result limit", () => {
  const intent = parseEmailSearchIntent("Give me my last 5 emails from Google", new Date("2026-11-19T12:00:00Z"));
  assert.equal(intent?.query, "from:google");
  assert.equal(intent?.limit, 5);
  assert.equal(intent?.sender, "Google");
});

test("parses unread messages from this week", () => {
  const intent = parseEmailSearchIntent("Show me unread emails from this week", new Date("2026-11-19T12:00:00Z"));
  assert.equal(intent?.query, "is:unread after:2026/11/16");
  assert.equal(intent?.unread, true);
  assert.equal(intent?.limit, 10);
});

test("does not create a retrieval plan for a mutation request", () => {
  assert.equal(parseEmailSearchIntent("Archive emails from Google"), null);
});
