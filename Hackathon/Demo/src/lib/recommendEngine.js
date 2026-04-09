export function vehicleSlug(v) {
  const m = String(v.model ?? "")
    .toLowerCase()
    .replace(/\s+/g, "");
  const vr = String(v.variant ?? "")
    .toLowerCase()
    .replace(/\s+/g, "_");
  return vr ? `${m}_${vr}` : m || "unknown";
}

export function displayVehicleName(v) {
  return `${v.model ?? ""} ${v.variant ?? ""}`.trim();
}

function filterByBudget(list, maxMillion) {
  return list.filter((v) => v.price_million <= maxMillion);
}

function filterBySeats(list, minSeats) {
  return list.filter((v) => v.seats >= minSeats);
}

function filterByType(list, vehicleType) {
  if (vehicleType === "all") return list;
  return list.filter((v) => String(v.type).toLowerCase() === vehicleType.toLowerCase());
}

function filterByDemand(list, demand) {
  const d = String(demand).toLowerCase();
  if (d === "economy") return list.filter((v) => v.price_million < 100);
  if (d === "comfort") {
    const hit = list.filter((v) =>
      ["Trang bị", "sang trọng", "cao cấp"].some((pro) => String(v.pros || "").includes(pro)),
    );
    return hit.length ? hit : list;
  }
  if (d === "family") {
    const hit = list.filter((v) => (v.seats || 0) >= 6);
    return hit.length ? hit : list;
  }
  if (d === "performance") return list.filter((v) => (v.motor_power_hp || 0) > 30);
  if (d === "eco") return list.filter((v) => (v.range_km || 0) >= 150);
  return list;
}

function defaultPriority() {
  return {
    price: 0.15,
    comfort: 0.25,
    performance: 0.2,
    efficiency: 0.1,
    range: 0.3,
  };
}

export function priorityFromProfile(priorities) {
  const base = {
    price: 0.15,
    comfort: 0.25,
    performance: 0.2,
    efficiency: 0.1,
    range: 0.3,
  };
  if (!priorities || !priorities.length) return base;
  const p = { price: 0.05, comfort: 0.05, performance: 0.05, efficiency: 0.05, range: 0.05 };
  for (const x of priorities) {
    const k = String(x).toLowerCase();
    if (
      k.includes("tiet") ||
      k.includes("cheap") ||
      k.includes("budget") ||
      k.includes("re ") ||
      k === "re"
    ) {
      p.price += 0.35;
    } else if (k.includes("rong") || k.includes("space") || k.includes("comfort") || k.includes("gia dinh")) {
      p.comfort += 0.35;
    } else if (k.includes("tech") || k.includes("cong nghe") || k.includes("performance")) {
      p.performance += 0.35;
    } else if (k.includes("xa") || k.includes("range") || k.includes("pin") || k.includes("eco")) {
      p.range += 0.35;
    } else {
      p.comfort += 0.15;
    }
  }
  const s = Object.values(p).reduce((a, b) => a + b, 0) || 1;
  return Object.fromEntries(Object.entries(p).map(([key, val]) => [key, val / s]));
}

export function usageToDemand(usage) {
  const u = String(usage).toLowerCase();
  if (u.includes("gia dinh") || u.includes("family")) return "family";
  if (u.includes("xa") || u.includes("long") || u.includes("du")) return "eco";
  if (u.includes("business") || u.includes("cong tac") || u.includes("công tác")) {
    return "comfort";
  }
  if (u.includes("tiet") || u.includes("economy")) return "economy";
  return "balanced";
}

function budgetFitScore(priceMillion, budgetMillion) {
  const budget = Math.max(1, Number(budgetMillion) || 1);
  const price = Math.max(0, Number(priceMillion) || 0);
  const r = price / budget;
  if (r > 1.05) return 0;
  const target = 0.75;
  const dist = Math.abs(r - target) / target;
  let s = 100 * (1 - dist);
  if (r < 0.25) s -= 25;
  if (r < 0.4) s -= 10;
  if (r >= 0.92 && r <= 1.02) s += 12;
  return Math.max(0, Math.min(100, s));
}

function calculateScore(vehicle, budgetMillion, minSeats, demand, priority) {
  const pr = priority || defaultPriority();
  let score = 0;
  const priceScore = budgetFitScore(vehicle.price_million, budgetMillion);
  score += priceScore * (pr.price ?? 0.15);
  const comfortScore = Math.min(100, (vehicle.features?.length || 0) * 10);
  score += comfortScore * (pr.comfort ?? 0.25);
  const power = vehicle.motor_power_hp || 0;
  const perfScore = Math.min(100, (power / 70) * 100);
  score += perfScore * (pr.performance ?? 0.2);
  const rangeKm = vehicle.range_km || 0;
  let efficiencyScore;
  if (rangeKm > 0) {
    efficiencyScore = Math.min(100, (rangeKm / 350) * 100);
  } else {
    const monthlyCost = vehicle.monthly_charging_cost_vnd || 1_000_000;
    efficiencyScore = Math.max(0, 100 - (monthlyCost / 2_000_000) * 100);
  }
  efficiencyScore = Math.min(100, efficiencyScore);
  score += efficiencyScore * (pr.range ?? pr.efficiency ?? 0.3);

  const seatDelta = (vehicle.seats || 0) - minSeats;
  if (seatDelta >= 0) score += 8 + Math.min(12, seatDelta * 2);
  else if (vehicle.type === "motobike") score -= 5;
  else score -= 15;

  const d = String(demand || "balanced").toLowerCase();
  if (d === "eco" && rangeKm >= 250) score += 6;
  if (d === "comfort" && (vehicle.features?.length || 0) >= 8) score += 4;
  if (d === "performance" && power >= 45) score += 4;

  const prosCount = vehicle.pros?.length || 0;
  const consCount = vehicle.cons?.length || 0;
  score += prosCount * 2;
  score -= consCount * 1;
  return Math.round(score);
}

export function getRecommendations(vehicles, params) {
  const budgetMillion = Math.max(1, Number(params.budget_million || 0));
  let vehicleType = String(params.vehicle_type || "all").toLowerCase();
  if (!["car", "motobike", "all"].includes(vehicleType)) vehicleType = "car";
  let seats = Math.max(1, Number(params.seats || 1));
  if (vehicleType === "motobike") seats = 1;
  const demand = String(params.demand || "balanced");
  const priority = params.priority || null;
  const topN = Number(params.top_n || 3);
  let candidates = [...vehicles];
  candidates = filterByBudget(candidates, budgetMillion);
  candidates = filterBySeats(candidates, seats);
  candidates = filterByType(candidates, vehicleType);
  if (demand !== "balanced") candidates = filterByDemand(candidates, demand);
  const scored = candidates.map((vehicle) => {
    const sc = calculateScore(vehicle, budgetMillion, seats, demand, priority);
    return {
      id: vehicleSlug(vehicle),
      model: vehicle.model,
      variant: vehicle.variant || "",
      price_million: vehicle.price_million,
      type: vehicle.type,
      segments: vehicle.segment || "",
      range_km: vehicle.range_km || 0,
      seats: vehicle.seats,
      colors: vehicle.color || [],
      score: sc,
    };
  });
  scored.sort((a, b) => b.score - a.score);
  return { top3: scored.slice(0, topN), total_candidates: scored.length };
}

export function recommendFromProfile(vehicles, profile) {
  let budget = Number(profile.budget_million_max ?? profile.budget_max_million ?? 0);
  if (!Number.isFinite(budget) || budget <= 0) budget = 2000;
  let vehicleType = String(profile.vehicle_type || "car").toLowerCase();
  if (!["car", "motobike", "all"].includes(vehicleType)) vehicleType = "car";
  const seatDefault = vehicleType === "motobike" ? 1 : 2;
  const rawSeats = profile.family_size ?? profile.seats;
  const seats = Math.max(
    1,
    Number(
      rawSeats != null && Number.isFinite(Number(rawSeats)) && Number(rawSeats) >= 1
        ? rawSeats
        : seatDefault,
    ),
  );
  const usage = String(profile.usage || "");
  const demand = String(profile.demand || usageToDemand(usage));
  let pri = profile.priority || profile.priorities || [];
  if (typeof pri === "string") pri = pri.split(",").map((x) => x.trim()).filter(Boolean);
  const priority = priorityFromProfile(pri);
  return getRecommendations(vehicles, {
    budget_million: budget,
    seats,
    vehicle_type: vehicleType,
    demand,
    priority,
    top_n: 3,
  });
}

export function reasonLine(rec, profile) {
  const parts = [];
  if (rec.seats) parts.push(`${rec.seats} cho`);
  if (rec.range_km) parts.push(`${rec.range_km} km WLTP`);
  parts.push(`${rec.price_million} trieu VND`);
  if (profile?.budget_million_max && rec.price_million <= profile.budget_million_max) {
    parts.push("nam trong ngan sach");
  }
  return `Goi y vi: ${parts.join(", ")}.`;
}
