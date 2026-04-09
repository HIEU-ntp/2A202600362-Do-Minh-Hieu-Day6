import { calculatorSummary } from "./calculator.js";
import { displayVehicleName, recommendFromProfile, reasonLine, vehicleSlug } from "./recommendEngine.js";

export const AGENT_TOOL_DEFINITIONS = [
  {
    type: "function",
    function: {
      name: "recommend_vehicle",
      description:
        "BAT BUOC goi khi da co ngan sac (trieu VND). Tra ve top3 xe trong catalog JSON — khong bia ten xe.",
      parameters: {
        type: "object",
        properties: {
          budget_million_max: { type: "number", description: "Ngan sac toi da, don vi trieu VND" },
          family_size: { type: "integer", description: "So cho toi thieu can", default: 5 },
          usage: { type: "string", description: "Muc dich: di lam, gia dinh, ..." },
          km_per_month: { type: "integer", description: "Km/thang" },
          priority: {
            type: "array",
            items: { type: "string" },
            description: "re, rong, cong nghe, tam xa",
          },
          vehicle_type: {
            type: "string",
            enum: ["car", "motobike", "all"],
            default: "car",
          },
        },
        required: ["budget_million_max"],
      },
    },
  },
  {
    type: "function",
    function: {
      name: "calculate_cost",
      description:
        "Tinh tra gop, chi phi sac, tong 5 nam. Can vehicle_id (slug) tu recommend_vehicle.",
      parameters: {
        type: "object",
        properties: {
          vehicle_id: { type: "string" },
          down_payment_percent: { type: "number", default: 20 },
          tenure_months: { type: "integer", default: 60 },
          annual_interest_rate: { type: "number", default: 0.1 },
        },
        required: ["vehicle_id"],
      },
    },
  },
  {
    type: "function",
    function: {
      name: "compare_vehicles",
      description: "So sanh 2-3 xe theo vehicle_id (slug).",
      parameters: {
        type: "object",
        properties: {
          vehicle_ids: {
            type: "array",
            items: { type: "string" },
            minItems: 2,
            maxItems: 3,
          },
        },
        required: ["vehicle_ids"],
      },
    },
  },
];

const DISCLAIMER =
  "Gia niem yet tham khao, co the thay doi. Lien he showroom VinFast de xac nhan.";

function getAgentApiBase() {
  const u = import.meta.env.VITE_AGENT_API_URL;
  return u ? String(u).replace(/\/$/, "") : "";
}

function findVehicle(vehicles, hint) {
  const h = String(hint || "").trim().toLowerCase();
  if (!h) return null;
  const exact = vehicles.find((v) => vehicleSlug(v) === h);
  if (exact) return exact;
  const compact = h.replace(/\s+/g, "");
  const bySlug = vehicles.find((v) => vehicleSlug(v) === compact);
  if (bySlug) return bySlug;
  return (
    vehicles.find((v) => displayVehicleName(v).toLowerCase().includes(h)) ||
    vehicles.find((v) => String(v.model || "").toLowerCase().includes(h)) ||
    null
  );
}

function publicRow(v) {
  return {
    id: vehicleSlug(v),
    model: v.model,
    variant: v.variant || "",
    display_name: displayVehicleName(v),
    price_million: v.price_million,
    seats: v.seats,
    range_km: v.range_km,
    segment: v.segment || "",
    monthly_charging_cost_vnd: v.monthly_charging_cost_vnd,
    colors: (v.color || []).slice(0, 5),
    features: (v.features || []).slice(0, 5),
  };
}

async function recommendVehicleJs(vehicles, args, onRecommendUi) {
  const budget = Number(args.budget_million_max);
  if (!Number.isFinite(budget) || budget < 50) {
    return JSON.stringify({ error: "budget_million_max khong hop le (toi thieu 50 trieu)." });
  }
  const prof = {
    budget_million_max: budget,
    family_size: Number(args.family_size) || 5,
    usage: String(args.usage || "balanced"),
    km_per_month: Number(args.km_per_month) || 0,
    priority: Array.isArray(args.priority) ? args.priority : [],
    vehicle_type: String(args.vehicle_type || "car"),
  };
  const res = recommendFromProfile(vehicles, prof);
  const enriched = (res.top3 || []).map((row) => ({
    ...row,
    reason: reasonLine(row, prof),
  }));
  onRecommendUi?.(enriched, prof);
  return JSON.stringify({
    top3: res.top3,
    total_candidates: res.total_candidates,
    disclaimer: DISCLAIMER,
    source: "javascript",
  });
}

async function recommendVehiclePython(vehicles, args, onRecommendUi) {
  const base = getAgentApiBase();
  const budget = Number(args.budget_million_max);
  if (!Number.isFinite(budget) || budget < 50) {
    return JSON.stringify({ error: "budget_million_max khong hop le (toi thieu 50 trieu)." });
  }
  const prof = {
    budget_million_max: budget,
    family_size: Number(args.family_size) || 5,
    usage: String(args.usage || "balanced"),
    km_per_month: Number(args.km_per_month) || 0,
    priority: Array.isArray(args.priority) ? args.priority : [],
    vehicle_type: String(args.vehicle_type || "car"),
  };
  const r = await fetch(`${base}/api/recommend`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(prof),
  });
  const raw = await r.text();
  if (!r.ok) {
    throw new Error(raw.slice(0, 400));
  }
  const data = JSON.parse(raw);
  const enriched = (data.top3 || []).map((row) => ({
    ...row,
    reason: reasonLine(row, prof),
  }));
  onRecommendUi?.(enriched, prof);
  return JSON.stringify({
    top3: data.top3,
    total_candidates: data.total_candidates,
    disclaimer: DISCLAIMER,
    source: "python",
  });
}

async function calculateCostJs(vehicles, args) {
  const v = findVehicle(vehicles, args.vehicle_id);
  if (!v) {
    return JSON.stringify({ error: "Khong tim thay xe. Dung vehicle_id tu recommend_vehicle." });
  }
  const summary = calculatorSummary(v, {
    downPaymentPercent: Number(args.down_payment_percent ?? 20),
    tenureMonths: Number(args.tenure_months ?? 60),
    annualInterestRate: Number(args.annual_interest_rate ?? 0.1),
    vehicleId: vehicleSlug(v),
    vehicleName: displayVehicleName(v),
  });
  return JSON.stringify({ ...summary, disclaimer: DISCLAIMER, source: "javascript" });
}

async function calculateCostPython(args) {
  const base = getAgentApiBase();
  const r = await fetch(`${base}/api/calculate`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      vehicle_id: String(args.vehicle_id || "").trim(),
      down_payment_percent: Number(args.down_payment_percent ?? 20),
      tenure_months: Number(args.tenure_months ?? 60),
      annual_interest_rate: Number(args.annual_interest_rate ?? 0.1),
    }),
  });
  const raw = await r.text();
  if (!r.ok) return JSON.stringify({ error: raw.slice(0, 400) });
  const data = JSON.parse(raw);
  if (data.error === "vehicle_not_found") {
    return JSON.stringify(data);
  }
  return JSON.stringify({ ...data, disclaimer: DISCLAIMER, source: "python" });
}

export function createAgentToolHandler(vehicles, onRecommendUi) {
  return async function handleTool(name, args) {
    const base = getAgentApiBase();
    if (name === "recommend_vehicle") {
      if (base) {
        try {
          return await recommendVehiclePython(vehicles, args, onRecommendUi);
        } catch {
          return await recommendVehicleJs(vehicles, args, onRecommendUi);
        }
      }
      return await recommendVehicleJs(vehicles, args, onRecommendUi);
    }
    if (name === "calculate_cost") {
      if (base) {
        try {
          const out = await calculateCostPython(args);
          const o = JSON.parse(out);
          if (o.error === "vehicle_not_found" || o.fallback) {
            return calculateCostJs(vehicles, args);
          }
          return out;
        } catch {
          return calculateCostJs(vehicles, args);
        }
      }
      return calculateCostJs(vehicles, args);
    }
    if (name === "compare_vehicles") {
      const ids = Array.isArray(args.vehicle_ids) ? args.vehicle_ids : [];
      const rows = [];
      for (const id of ids.slice(0, 3)) {
        const v = findVehicle(vehicles, id);
        if (v) rows.push(publicRow(v));
      }
      if (rows.length < 2) {
        return JSON.stringify({ error: "Can it nhat 2 vehicle_id hop le." });
      }
      return JSON.stringify({ vehicles: rows });
    }
    return JSON.stringify({ error: "Unknown tool" });
  };
}

export function buildRecommendArgsFromProfile(p) {
  if (p.budget_million_max == null || !Number.isFinite(Number(p.budget_million_max))) {
    return null;
  }
  const vehicle_type = String(p.vehicle_type || "car").toLowerCase();
  const seatDefault = vehicle_type === "motobike" ? 1 : 5;
  const fs = p.family_size;
  const family_size =
    fs != null && Number.isFinite(Number(fs)) && Number(fs) >= 1
      ? Math.min(9, Number(fs))
      : seatDefault;
  return {
    budget_million_max: Number(p.budget_million_max),
    family_size,
    usage: String(p.usage || "balanced"),
    km_per_month: Number(p.km_per_month) || 0,
    priority: Array.isArray(p.priority) ? p.priority : [],
    vehicle_type: ["car", "motobike", "all"].includes(vehicle_type) ? vehicle_type : "car",
  };
}
