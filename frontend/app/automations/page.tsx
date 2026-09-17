'use client'

import { useEffect, useState } from "react";
import Link from "next/link";
import { useAppSelector } from "@/store/app/hooks";
import { selectAuthToken } from "@/store/features/auth/authSlice";

type Automation = { id: string; name: string; trigger_type: string; trigger_config: Record<string, any>; action_type: string; action_config: Record<string, any>; status: "active" | "paused" };
const API = process.env.NEXT_PUBLIC_BACKEND_URL || "http://localhost:7000";

export default function AutomationsPage() {
  const token = useAppSelector(selectAuthToken);
  const [items, setItems] = useState<Automation[]>([]);
  const [name, setName] = useState("");
  const [sender, setSender] = useState("");
  const [query, setQuery] = useState("");
  const [action, setAction] = useState("archive");
  const [label, setLabel] = useState("");
  const [forwardTo, setForwardTo] = useState("");
  const [message, setMessage] = useState("");
  const [busy, setBusy] = useState(false);

  const headers = token ? { Authorization: `Bearer ${token}`, "Content-Type": "application/json" } : null;
  const load = async () => { if (!headers) return; const r = await fetch(`${API}/automations`, { headers }); const d = await r.json(); if (!r.ok) throw new Error(d?.error || "Could not load automations"); setItems(d.automations || []); };
  useEffect(() => { load().catch((e) => setMessage(e.message)); }, [token]);

  const create = async () => {
    if (!headers || !name.trim()) return;
    setBusy(true); setMessage("");
    try {
      const actionConfig: Record<string, any> = action === "categorize" ? { label } : action === "forward" ? { to: forwardTo.split(",").map((v) => v.trim()).filter(Boolean) } : {};
      const triggerConfig = { ...(sender.trim() ? { sender: sender.trim() } : {}), ...(query.trim() ? { query: query.trim() } : {}) };
      const r = await fetch(`${API}/automations`, { method: "POST", headers, body: JSON.stringify({ name, triggerType: "new_email", triggerConfig, actionType: action, actionConfig, status: "active" }) });
      const d = await r.json(); if (!r.ok) throw new Error(d?.error || "Could not create automation");
      setMessage("Automation created."); setName(""); setSender(""); setQuery(""); setLabel(""); setForwardTo(""); await load();
    } catch (e) { setMessage(e instanceof Error ? e.message : "Could not create automation"); } finally { setBusy(false); }
  };

  const toggle = async (item: Automation) => {
    if (!headers || !window.confirm(`${item.status === "active" ? "Pause" : "Resume"} this automation?`)) return;
    setBusy(true);
    try { const r = await fetch(`${API}/automations/${item.id}`, { method: "PATCH", headers, body: JSON.stringify({ name: item.name, triggerType: item.trigger_type, triggerConfig: item.trigger_config, actionType: item.action_type, actionConfig: item.action_config, status: item.status === "active" ? "paused" : "active" }) }); const d = await r.json(); if (!r.ok) throw new Error(d?.error || "Could not update automation"); await load(); } catch (e) { setMessage(e instanceof Error ? e.message : "Could not update automation"); } finally { setBusy(false); }
  };

  const remove = async (id: string) => { if (!headers || !window.confirm("Delete this automation?")) return; setBusy(true); try { const r = await fetch(`${API}/automations/${id}`, { method: "DELETE", headers }); const d = await r.json(); if (!r.ok) throw new Error(d?.error || "Could not delete automation"); await load(); } catch (e) { setMessage(e instanceof Error ? e.message : "Could not delete automation"); } finally { setBusy(false); } };

  if (!token) return <main style={{ padding: 40 }}>Please sign in with Google to manage automations.</main>;

  return <main style={{ minHeight: "100vh", padding: "32px 20px 90px", background: "#f7f7f7" }}><div style={{ maxWidth: 900, margin: "0 auto" }}>
    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 24 }}><div><h1 style={{ margin: 0, fontSize: 32 }}>Automations</h1><p style={{ color: "#666" }}>Let Magic Mail act on new inbox messages automatically.</p></div><Link href="/emails">Inbox</Link></div>
    <section style={{ background: "#fff", border: "1px solid #e5e5e5", borderRadius: 16, padding: 24, marginBottom: 18 }}><h2 style={{ marginTop: 0 }}>New automation</h2><div style={{ display: "grid", gap: 12 }}>
      <input value={name} onChange={(e) => setName(e.target.value)} placeholder="Name, e.g. Archive newsletters" style={{ padding: 12, borderRadius: 8, border: "1px solid #ccc" }} />
      <input value={sender} onChange={(e) => setSender(e.target.value)} placeholder="From sender contains (optional)" style={{ padding: 12, borderRadius: 8, border: "1px solid #ccc" }} />
      <input value={query} onChange={(e) => setQuery(e.target.value)} placeholder="Subject/body keyword (optional)" style={{ padding: 12, borderRadius: 8, border: "1px solid #ccc" }} />
      <select value={action} onChange={(e) => setAction(e.target.value)} style={{ padding: 12, borderRadius: 8, border: "1px solid #ccc" }}><option value="archive">Archive</option><option value="mark_important">Mark important</option><option value="categorize">Apply category</option><option value="forward">Forward</option></select>
      {action === "categorize" && <input value={label} onChange={(e) => setLabel(e.target.value)} placeholder="Gmail label" style={{ padding: 12, borderRadius: 8, border: "1px solid #ccc" }} />}
      {action === "forward" && <input value={forwardTo} onChange={(e) => setForwardTo(e.target.value)} placeholder="Forward to: name@example.com" style={{ padding: 12, borderRadius: 8, border: "1px solid #ccc" }} />}
    </div><button onClick={create} disabled={busy || !name.trim()} style={{ marginTop: 16, padding: "12px 18px" }}>Create automation</button>{message && <p>{message}</p>}</section>
    <section style={{ display: "grid", gap: 12 }}>{items.length === 0 && <div style={{ background: "#fff", padding: 24, borderRadius: 16 }}>No automations yet.</div>}{items.map((item) => <article key={item.id} style={{ background: "#fff", border: "1px solid #e5e5e5", borderRadius: 16, padding: 20 }}><div style={{ display: "flex", justifyContent: "space-between", gap: 16 }}><div><strong>{item.name}</strong><div style={{ color: "#666", marginTop: 6 }}>When a new email matches {JSON.stringify(item.trigger_config)} → {item.action_type.replaceAll("_", " ")}</div></div><span style={{ textTransform: "capitalize" }}>{item.status}</span></div><div style={{ display: "flex", gap: 10, marginTop: 14 }}><button disabled={busy} onClick={() => toggle(item)}>{item.status === "active" ? "Pause" : "Resume"}</button><button disabled={busy} onClick={() => remove(item.id)}>Delete</button></div></article>)}</section>
  </div></main>;
}
