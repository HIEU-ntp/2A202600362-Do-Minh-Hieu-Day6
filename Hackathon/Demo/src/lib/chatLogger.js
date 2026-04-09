function getAgentApiBase() {
  const u = import.meta.env.VITE_AGENT_API_URL;
  return u ? String(u).replace(/\/$/, "") : "";
}

function safeId(x) {
  return String(x || "")
    .trim()
    .replace(/[^a-zA-Z0-9_-]/g, "_")
    .slice(0, 80);
}

export function createChatSessionId() {
  const rand = Math.random().toString(16).slice(2);
  return safeId(`chat_${Date.now()}_${rand}`);
}

export async function logChatSnapshot(payload) {
  const base = getAgentApiBase();
  if (!base) return { ok: false, skipped: true, reason: "VITE_AGENT_API_URL not set" };

  const body = {
    session_id: safeId(payload.session_id),
    app: String(payload.app || "Hackathon/Demo"),
    model: payload.model ? String(payload.model) : null,
    messages: Array.isArray(payload.messages) ? payload.messages : [],
    tool_events: Array.isArray(payload.tool_events) ? payload.tool_events : [],
    meta: payload.meta && typeof payload.meta === "object" ? payload.meta : {},
  };

  const r = await fetch(`${base}/api/chat_log`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
  });
  const raw = await r.text();
  if (!r.ok) throw new Error(raw.slice(0, 300) || "chat_log failed");
  try {
    return JSON.parse(raw);
  } catch {
    return { ok: true };
  }
}

