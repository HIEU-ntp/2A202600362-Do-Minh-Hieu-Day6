import {
  extractBudgetMillion,
  extractFamilySize,
  extractKmPerMonth,
  extractPriorities,
  inferUsage,
} from "./intakeNatural.js";

function fold(s) {
  return String(s)
    .normalize("NFD")
    .replace(/\p{M}/gu, "")
    .toLowerCase();
}

export function mergeUserTexts(uiMessages, maxUser = 12) {
  const users = uiMessages.filter((m) => m.role === "user").slice(-maxUser);
  return users.map((m) => m.text).join("\n");
}

export function inferVehicleType(blob) {
  const t = fold(blob);
  if (
    /\bxe\s*may\b/.test(t) ||
    /xemay/.test(t.replace(/\s/g, "")) ||
    /\bmotobike\b/.test(t) ||
    /\bmotorbike\b/.test(t) ||
    /\bscooter\b/.test(t) ||
    /\bxe\s*2\s*banh\b/.test(t) ||
    /\bxe\s*dap\s*dien\b/.test(t) ||
    (/\bxe\s*may\s*dien\b/.test(t) && !/\bo\s*to\b/.test(t) && !/\boto\b/.test(t))
  ) {
    return "motobike";
  }
  if (/\bxe\s*o\s*to\b/.test(t) || /\boto\b/.test(t) || /\bsuv\b/.test(t) || /\b4\s*cho\b/.test(t)) {
    return "car";
  }
  return "car";
}

function extractKmDailyToMonthly(blob) {
  const t = fold(blob);
  const m = t.match(
    /(\d{1,4})\s*km\s*\/?\s*(?:moi\s*)?(?:1\s*)?(ngay|ngày|day)\b/,
  );
  if (m) {
    const d = parseInt(m[1], 10);
    if (d > 0 && d < 500) return Math.round(d * 30);
  }
  const m2 = t.match(/(\d{1,4})\s*km\s*\/\s*ngay/);
  if (m2) {
    const d = parseInt(m2[1], 10);
    if (d > 0 && d < 500) return Math.round(d * 30);
  }
  return null;
}

export function extractAgentProfile(blob) {
  const text = String(blob || "");
  const lastLine = text.split("\n").pop() || text;
  const kmDaily = extractKmDailyToMonthly(text);
  const kmMonth = extractKmPerMonth(text);
  const budget = extractBudgetMillion(text);
  const family = extractFamilySize(text);
  let usage = inferUsage(lastLine) || inferUsage(text);
  const priority = extractPriorities(text);
  const vehicle_type = inferVehicleType(text);
  return {
    budget_million_max: budget,
    family_size: family,
    km_per_month: kmDaily ?? kmMonth ?? undefined,
    usage: usage || undefined,
    priority: priority.length ? priority : undefined,
    vehicle_type,
  };
}

export function mergeAgentProfileWithSticky(fresh, sticky) {
  if (!sticky || typeof sticky !== "object") return fresh;
  const hasNum = (x) => x != null && Number.isFinite(Number(x));
  const budget =
    hasNum(fresh.budget_million_max) ? Number(fresh.budget_million_max) : hasNum(sticky.budget_million_max)
      ? Number(sticky.budget_million_max)
      : null;
  const family_size = hasNum(fresh.family_size) ? Number(fresh.family_size) : sticky.family_size ?? undefined;
  const km_per_month = hasNum(fresh.km_per_month)
    ? Number(fresh.km_per_month)
    : sticky.km_per_month ?? undefined;
  const fu = fresh.usage != null ? String(fresh.usage).trim() : "";
  const usage = fu !== "" ? fresh.usage : sticky.usage ?? undefined;
  const priority =
    Array.isArray(fresh.priority) && fresh.priority.length > 0
      ? fresh.priority
      : Array.isArray(sticky.priority) && sticky.priority.length > 0
        ? sticky.priority
        : undefined;
  const vehicle_type = fresh.vehicle_type || sticky.vehicle_type || "car";
  return {
    budget_million_max: budget,
    family_size,
    km_per_month,
    usage,
    priority,
    vehicle_type,
  };
}

export function wantsCostExplanation(text) {
  const t = fold(text);
  return /tra gop|trả góp|góp ngân|gop ngan|lai suat|lãi suất|chi phi|chi phí|tinh tien|tính tiền|bao nhieu|bao nhiêu|thang|tháng|installment|monthly payment/.test(
    t,
  );
}
