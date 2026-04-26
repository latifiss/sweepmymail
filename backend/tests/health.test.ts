import request from "supertest";
import { createApp } from "../src/app";

describe('backend smoke', () => {
  it('GET / should return hello', async () => {
    const app = createApp();
    const res = await request(app).get("/");
    expect(res.status).toBe(200);
    expect(res.text).toContain("Hello World!");
  })
})

