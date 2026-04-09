function priorityMissing(state) {
  const p = state.priority;
  if (p == null) return true;
  if (Array.isArray(p)) return p.length === 0;
  return !String(p).trim();
}

export function nextIntakeStep(state) {
  if (state.budget_million_max == null || state.budget_million_max === "") return "BUDGET";
  if (state.family_size == null || state.family_size === "") return "FAMILY";
  if (!String(state.usage || "").trim()) return "USAGE";
  if (state.km_per_month == null || state.km_per_month === "") return "DISTANCE";
  if (priorityMissing(state)) return "PRIORITY";
  return "DONE";
}

export function intakePrompt(step) {
  const map = {
    BUDGET:
      "Ngan sac toi da (trieu VND)? Chi nhap so, vi du 900.",
    FAMILY: "Thuong xuyen can toi thieu bao nhieu cho ngoi? Vi du 5.",
    USAGE: "Muc dich chinh? (di lam / gia dinh / di xa / cong tac)",
    DISTANCE: "Quang duong trung binh hang thang (km)? Vi du 1200.",
    PRIORITY:
      "Uu tien? Nhap re, rong, cong nghe hoac tam xa — nhieu muc cach nhau bang dau phay.",
  };
  return map[step] || "";
}

function digits(s) {
  const n = parseInt(String(s).replace(/[^\d]/g, ""), 10);
  return Number.isFinite(n) ? n : null;
}

export function applyIntakeAnswer(state, step, raw) {
  const text = String(raw || "").trim();
  if (!text) return { error: "Vui long nhap thong tin." };
  if (step === "BUDGET") {
    const v = digits(text);
    if (!v || v < 50) return { error: "Nhap ngan sac hop le (trieu VND, toi thieu 50)." };
    return { patch: { budget_million_max: v } };
  }
  if (step === "FAMILY") {
    const v = digits(text);
    if (!v || v < 1 || v > 9) return { error: "Nhap so cho tu 1 den 9." };
    return { patch: { family_size: v } };
  }
  if (step === "USAGE") {
    return { patch: { usage: text } };
  }
  if (step === "DISTANCE") {
    const v = digits(text);
    if (!v || v < 50) return { error: "Nhap km/thang hop le (toi thieu 50)." };
    return { patch: { km_per_month: v } };
  }
  if (step === "PRIORITY") {
    const parts = text
      .split(/[,;]/)
      .map((x) => x.trim())
      .filter(Boolean);
    if (!parts.length) return { error: "Nhap it nhat mot uu tien." };
    return { patch: { priority: parts } };
  }
  return { error: "Buoc khong hop le." };
}

export function buildIntakeProfile(state) {
  const pri = state.priority;
  const priorityList = Array.isArray(pri)
    ? pri
    : String(pri || "")
        .split(",")
        .map((x) => x.trim())
        .filter(Boolean);
  return {
    budget_million_max: Number(state.budget_million_max),
    family_size: Number(state.family_size),
    usage: String(state.usage || "").trim(),
    km_per_month: Number(state.km_per_month),
    priority: priorityList,
    vehicle_type: String(state.vehicle_type || "car"),
  };
}
