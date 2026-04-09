const KEY = "lab6_nhom1_zone3_mock_leads";

export function validateLead(payload) {
  const errors = [];
  if (!String(payload.name || "").trim()) errors.push("name is required");
  const phone = String(payload.phone || "").trim();
  const email = String(payload.email || "").trim();
  if (!phone && !email) errors.push("phone or email is required");
  if (!String(payload.preferred_vehicle_id || "").trim()) {
    errors.push("preferred_vehicle_id is required");
  }
  if (
    "wants_test_drive" in payload &&
    typeof payload.wants_test_drive !== "boolean"
  ) {
    errors.push("wants_test_drive must be boolean");
  }
  return errors;
}

export function appendLead(payload) {
  const errors = validateLead(payload);
  if (errors.length) throw new Error(errors.join("; "));
  const row = {
    name: String(payload.name || "").trim(),
    phone: String(payload.phone || "").trim(),
    email: String(payload.email || "").trim().toLowerCase(),
    preferred_vehicle_id: String(payload.preferred_vehicle_id || "").trim(),
    preferred_vehicle_name: String(payload.preferred_vehicle_name || "").trim(),
    wants_test_drive: Boolean(payload.wants_test_drive),
    notes: String(payload.notes || "").trim(),
    source: "web_demo",
    created_at: new Date().toISOString(),
  };
  let list = [];
  try {
    list = JSON.parse(localStorage.getItem(KEY) || "[]");
    if (!Array.isArray(list)) list = [];
  } catch {
    list = [];
  }
  list.push(row);
  localStorage.setItem(KEY, JSON.stringify(list));
  return row;
}

export function listLeads() {
  try {
    const list = JSON.parse(localStorage.getItem(KEY) || "[]");
    return Array.isArray(list) ? list : [];
  } catch {
    return [];
  }
}
