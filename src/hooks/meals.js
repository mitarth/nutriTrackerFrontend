export function getWeekMonday(referenceDate = new Date()) {
  const d = new Date(referenceDate);
  const day = d.getDay();
  d.setDate(d.getDate() - (day === 0 ? 6 : day - 1));
  return d.toISOString().split("T")[0];
}

export async function fetchWeeklyMeals(startDate) {
  const response = await fetch(
    `${import.meta.env.VITE_API_BASE_URL}/api/meals/weekly/${encodeURIComponent(startDate)}`
  );
  if (!response.ok) throw new Error("Failed to fetch weekly meals");
  return response.json();
}

export async function fetchMeals(date) {
  const params = date ? `${encodeURIComponent(new Date(date).toISOString().split("T")[0])}` : "";
  const response = await fetch(`${import.meta.env.VITE_API_BASE_URL}/api/meals/by-date/${params}`);
  if (!response.ok) throw new Error("Failed to fetch meals");
  return response.json();
}

const MACRO_KEYS = ["protein", "carbs", "fat", "fiber"];
const VITAMIN_KEYS = ["vitamin_a", "vitamin_c", "vitamin_d", "vitamin_e", "vitamin_k", "vitamin_b12", "folate"];
const MINERAL_KEYS = ["calcium", "iron", "magnesium", "potassium", "zinc", "sodium", "phosphorus"];

export function getConsumed(n) {
  if (n == null) return 0;
  if (typeof n === "number") return n;
  return n.consumed ?? n.value ?? n.amount ?? 0;
}

function servingScale(item) {
  const s = item.serving_size ?? item.serving;
  return s > 0 ? s / 100 : 1;
}

function sumConsumed(items, getter) {
  return items.reduce((total, item) => {
    return total + getConsumed(getter(item)) * servingScale(item);
  }, 0);
}

function getUnit(items, getter) {
  for (const item of items) {
    const n = getter(item);
    if (n?.unit) return n.unit;
  }
  return "";
}

export function calcTotals(items) {
  if (!items || !items.length) return null;

  const calories = sumConsumed(items, i => i.calories);

  const macros = Object.fromEntries(
    MACRO_KEYS.map(key => [key, {
      consumed: sumConsumed(items, i => i.macros?.[key]),
      unit: getUnit(items, i => i.macros?.[key]),
    }])
  );

  const vitamins = Object.fromEntries(
    VITAMIN_KEYS.map(key => [key, {
      consumed: sumConsumed(items, i => i.micros?.vitamins?.[key]),
      unit: getUnit(items, i => i.micros?.vitamins?.[key]),
    }])
  );

  const minerals = Object.fromEntries(
    MINERAL_KEYS.map(key => [key, {
      consumed: sumConsumed(items, i => i.micros?.minerals?.[key]),
      unit: getUnit(items, i => i.micros?.minerals?.[key]),
    }])
  );

  return { calories, macros, vitamins, minerals };
}
