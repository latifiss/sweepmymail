import test from "node:test";
import assert from "node:assert/strict";
import { AgentRuntimeError, validateAgentInput } from "../src/agent/agent.runtime";

test("accepts a normal UI message array", () => {
  assert.doesNotThrow(() => validateAgentInput([{ role: "user", parts: [{ type: "text", text: "hello" }] }]));
});

test("rejects missing messages", () => {
  assert.throws(() => validateAgentInput(undefined), AgentRuntimeError);
  assert.throws(() => validateAgentInput([]), /messages array is required/);
});

test("rejects an oversized message list", () => {
  const messages = Array.from({ length: 101 }, () => ({ role: "user", parts: [{ type: "text", text: "x" }] }));
  assert.throws(() => validateAgentInput(messages), /Too many messages/);
});
