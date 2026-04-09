function fold(s) {
  return String(s)
    .normalize("NFD")
    .replace(/\p{M}/gu, "")
    .toLowerCase();
}

function parseNum(raw) {
  const x = String(raw).replace(",", ".").replace(/\s/g, "");
  const n = parseFloat(x);
  return Number.isFinite(n) ? n : null;
}

export function extractBudgetMillion(text) {
  const t = fold(text);
  const range = t.match(
    /(\d[\d.,]*)\s*[-–]\s*(\d[\d.,]*)\s*(trieu|trieu|tr\b|m(?![a-z]))/i,
  );
  if (range) {
    const hi = parseNum(range[2]);
    if (hi != null && hi >= 1) return Math.round(hi);
  }
  const range2 = t.match(/(\d[\d.,]*)\s*(den|toi|đến)\s*(\d[\d.,]*)\s*(trieu|trieu|tr\b)/);
  if (range2) {
    const hi = parseNum(range2[3]);
    if (hi != null && hi >= 1) return Math.round(hi);
  }

  const ty = t.match(/(\d[\d.,]*)\s*(ty|ti\b|ti\b|billion)/);
  if (ty) {
    const v = parseNum(ty[1]);
    if (v != null && v > 0) return Math.round(v * 1000);
  }

  const tr = t.match(/(\d[\d.,]*)\s*(trieu|trieu|tr\b|m(?![a-z])|million)/);
  if (tr) {
    const v = parseNum(tr[1]);
    if (v != null && v >= 1 && v <= 200000) return Math.round(v);
  }

  const labeled = t.match(
    /(ngan sach|budget|toi da|to(i|) da|khoang|co|~|around|max)\s*[:\s]*(\d[\d.,]*)\s*(ty|ti\b)?/,
  );
  if (labeled) {
    const v = parseNum(labeled[2]);
    if (v == null) return null;
    if (labeled[3]) return Math.round(v * 1000);
    if (v >= 1 && v <= 200000) return Math.round(v);
  }

  const plain = t.match(/\b(\d{2,5})\b/);
  if (plain) {
    const v = parseNum(plain[1]);
    if (v != null && v >= 50 && v <= 200000) return Math.round(v);
  }

  const smallTy = t.match(/^(\d(\.\d+)?)\s*$/);
  if (smallTy) {
    const v = parseNum(smallTy[1]);
    if (v != null && v >= 0.5 && v <= 50) return Math.round(v * 1000);
  }

  return null;
}

export function extractFamilySize(text) {
  const t = fold(text);
  const m1 = t.match(
    /(\d)\s*[-]?\s*(\d)?\s*(nguoi|người|khẩu|khau|cho|cho ngoi|ghe)/,
  );
  if (m1) {
    const a = parseInt(m1[1], 10);
    const b = m1[2] ? parseInt(m1[2], 10) : null;
    const v = b != null && Number.isFinite(b) ? Math.max(a, b) : a;
    if (v >= 1 && v <= 9) return v;
  }
  const m2 = t.match(/(gia dinh|nha|family)\D*(\d)/);
  if (m2) {
    const v = parseInt(m2[2], 10);
    if (v >= 1 && v <= 9) return v;
  }
  const m3 = t.match(/(\d)\s*nguoi/);
  if (m3) {
    const v = parseInt(m3[1], 10);
    if (v >= 1 && v <= 9) return v;
  }
  const only = t.match(/^\s*(\d)\s*$/);
  if (only) {
    const v = parseInt(only[1], 10);
    if (v >= 1 && v <= 9) return v;
  }
  const two = t.match(/^\s*(\d)\s*$/);
  if (two) {
    const v = parseInt(t.trim(), 10);
    if (v >= 1 && v <= 9) return v;
  }
  const digit = t.match(/\b([1-9])\b/);
  if (digit && t.length <= 4) {
    const v = parseInt(digit[1], 10);
    if (v >= 1 && v <= 9) return v;
  }
  return null;
}

export function extractKmPerMonth(text) {
  const t = fold(text);
  const m1 = t.match(/(\d{2,5})\s*km/);
  if (m1) {
    const v = parseInt(m1[1], 10);
    if (v >= 50 && v <= 50000) return v;
  }
  const m2 = t.match(/(\d{2,5})\s*(moi thang|thang|\/thang|per month|a month)/);
  if (m2) {
    const v = parseInt(m2[1], 10);
    if (v >= 50 && v <= 50000) return v;
  }
  const m3 = t.match(/(khoang|~|around)\s*(\d{2,5})/);
  if (m3) {
    const v = parseInt(m3[2], 10);
    if (v >= 50 && v <= 50000) return v;
  }
  const plain = t.match(/\b(\d{3,5})\b/);
  if (plain) {
    const v = parseInt(plain[1], 10);
    if (v >= 500 && v <= 50000) return v;
  }
  return null;
}

export function inferUsage(text) {
  const t = fold(text);
  if (t.match(/\b(di lam|di cong|van phong|office|commute)\b/)) return "di lam";
  if (t.match(/\b(gia dinh|family|tre em|con nho|dua don hoc)\b/)) return "gia dinh";
  if (t.match(/\b(di xa|du lich|xuyen viet|xuyen quoc|road trip|intercity|tinh)\b/)) return "di xa";
  if (t.match(/\b(cong tac|business|khach hang|doi tac)\b/)) return "cong tac";
  const s = String(text).trim();
  if (s.length >= 2 && s.length <= 100) return s;
  return null;
}

export function extractPriorities(text) {
  const t = fold(text);
  const out = [];
  const add = (x) => {
    if (!out.includes(x)) out.push(x);
  };
  if (t.match(/\b(tiet kiem|re|gia|cheap|budget|chi phi thap)\b/)) add("re");
  if (t.match(/\b(rong|gia dinh|cho ngoi|khong gian|space|family)\b/)) add("rong");
  if (t.match(/\b(cong nghe|tech|adas|man hinh|smart)\b/)) add("cong nghe");
  if (t.match(/\b(tam xa|pin|range|sac|long trip|eco)\b/)) add("tam xa");
  if (t.match(/\b(can bang|balanced)\b/)) add("rong");
  const parts = String(text)
    .split(/[,;]/)
    .map((x) => x.trim())
    .filter(Boolean);
  for (const p of parts) {
    const f = fold(p);
    if (f === "re" || f === "rong" || f === "cong nghe" || f === "tam xa") add(f.replace(/\s+/g, "_"));
  }
  return out;
}

export function extractAllFromMessage(state, raw) {
  const text = String(raw || "").trim();
  if (!text) return { patch: {}, hints: [] };

  const patch = {};
  const hints = [];

  if (state.budget_million_max == null || state.budget_million_max === "") {
    const b = extractBudgetMillion(text);
    if (b != null) {
      patch.budget_million_max = b;
      hints.push(`ngan sac ~${b} trieu`);
    }
  }

  if (state.family_size == null || state.family_size === "") {
    const f = extractFamilySize(text);
    if (f != null) {
      patch.family_size = f;
      hints.push(`${f} cho`);
    }
  }

  if (!String(state.usage || "").trim()) {
    const u = inferUsage(text);
    if (u) {
      patch.usage = u;
      hints.push(`muc dich: ${u}`);
    }
  }

  if (state.km_per_month == null || state.km_per_month === "") {
    const k = extractKmPerMonth(text);
    if (k != null) {
      patch.km_per_month = k;
      hints.push(`~${k} km/thang`);
    }
  }

  if (
    state.priority == null ||
    (Array.isArray(state.priority) && state.priority.length === 0) ||
    (!Array.isArray(state.priority) && !String(state.priority || "").trim())
  ) {
    const pr = extractPriorities(text);
    if (pr.length) {
      patch.priority = pr;
      hints.push(`uu tien: ${pr.join(", ")}`);
    }
  }

  return { patch, hints };
}
