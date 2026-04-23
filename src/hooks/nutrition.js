const MACRO_KEYS = new Set(["protein", "carbs", "fat", "fiber", "sugar"]);
const VITAMIN_KEYS = new Set(["vitamin_a", "vitamin_c", "vitamin_d", "vitamin_e", "vitamin_k", "vitamin_b12", "folate"]);
const MINERAL_KEYS = new Set(["calcium", "iron", "magnesium", "potassium", "zinc", "sodium", "phosphorus"]);

function isNutrientField(val) {
  if (val == null) return false;
  if (typeof val === "number") return true;
  if (typeof val === "object") return val.consumed != null || val.value != null || val.amount != null;
  return false;
}

function scaleNutrient(nutritionData, scale) {
  const scaledNutrients = {};
  for (const nutrient in nutritionData) {
    
    let n = nutrient;
    n = {
      amount: Math.round(nutrient.amount * scale * 10) / 10,
      unit: nutrient.unit,
      daily_value_pct: Math.round(nutrient.daily_value_pct * scale * 10) / 10,
    };
  }
  console.log("scaled nutrients:", scaledNutrients);
  return scaledNutrients;
}

function scaleCalories(calories, serving_size, baseQty) {
  const scale = serving_size / baseQty;
  console.log(calories);
  return {
    consumed: Math.round(calories.consumed * scale * 10) / 10,
    unit: calories.unit || "kcal",
    daily_value_pct: Math.round(calories.daily_value_pct * scale * 10) / 10,
  };
}

const ZERO = { amount: 0, unit: "", daily_value_pct: 0 };

export function buildMealPayload(nutritionData, serving_size, consumptionDate) {
  const food = nutritionData.food ;
  const baseQty  = Number(nutritionData.quantity || nutritionData.serving_size) || 100;
  const scale = serving_size / baseQty;
  console.log("scale:", scale);
  const payload = {
    food,
    serving_size: new String(serving_size + "g"),
    consumptionDate: consumptionDate || new Date().toISOString(),
    calories: scaleCalories(nutritionData["calories"], serving_size, baseQty),
    macros: scaleNutrient(nutritionData["macros"], scale),
    micros: {
      vitamins: scaleNutrient(nutritionData["micros"]["vitamins"], scale),
      minerals: scaleNutrient(nutritionData["micros"]["minerals"], scale),
    },
  };
  return payload;
}

export async function fetchNutrition(foodItem, quantity = 100) {
  const response = await fetch(`${import.meta.env.VITE_API_BASE_URL}/api/nutrition`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ food_item: foodItem, quantity }),
  });
  if (!response.ok) throw new Error("Failed to fetch nutrition data");
  return response.json();
}

export async function addItem(payload) {
  // console.log("meal payload:", JSON.stringify(payload, null, 2));
  return true;
  const response = await fetch(`${import.meta.env.VITE_API_BASE_URL}/api/meals/add`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload),
  });
  if (!response.ok) throw new Error("Failed to add item");
  return response.json();
}
