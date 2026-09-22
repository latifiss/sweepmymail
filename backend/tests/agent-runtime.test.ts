import { AgentRuntimeError, validateAgentInput } from "../src/agent/agent.runtime";

describe("agent runtime validation", () => {
  it("accepts a normal UI message array", () => {
    expect(() => validateAgentInput([{ role: "user", parts: [{ type: "text", text: "hello" }] }])).not.toThrow();
  });

  it("rejects missing messages", () => {
    expect(() => validateAgentInput(undefined)).toThrow(AgentRuntimeError);
    expect(() => validateAgentInput([])).toThrow("messages array is required");
  });

  it("rejects an oversized message list", () => {
    const messages = Array.from({ length: 101 }, () => ({ role: "user", parts: [{ type: "text", text: "x" }] }));
    expect(() => validateAgentInput(messages)).toThrow("Too many messages");
  });
});
