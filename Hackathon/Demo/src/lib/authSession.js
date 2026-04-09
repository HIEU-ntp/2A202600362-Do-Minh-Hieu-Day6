const KEY = "lab6_nhom1_zone3_session";

export function readSession() {
  try {
    const raw = localStorage.getItem(KEY);
    if (!raw) return null;
    return JSON.parse(raw);
  } catch {
    return null;
  }
}

export function writeSession(session) {
  localStorage.setItem(KEY, JSON.stringify(session));
}

export function clearSession() {
  localStorage.removeItem(KEY);
}

export function createMemberSession(email, displayName) {
  return {
    kind: "member",
    email: String(email || "").trim(),
    displayName: String(displayName || "").trim() || String(email || "").trim(),
    at: new Date().toISOString(),
  };
}

export function createGuestSession() {
  return { kind: "guest", at: new Date().toISOString() };
}
