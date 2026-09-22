import test from "node:test";
import assert from "node:assert/strict";
import { createApp } from "../src/app";

test("GET / returns API health", async () => {
  const server = createApp().listen(0);
  try {
    const address = server.address();
    assert.ok(address && typeof address === "object");
    const response = await fetch("http://127.0.0.1:" + address.port + "/");
    assert.equal(response.status, 200);
    assert.deepEqual(await response.json(), { name: "Magic Mail API", status: "ok" });
  } finally {
    await new Promise<void>((resolve, reject) => server.close((error) => error ? reject(error) : resolve()));
  }
});
