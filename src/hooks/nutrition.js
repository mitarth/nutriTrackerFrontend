// hooks/useNutrition.js
export async function fetchNutrition(foodItem, quantity = 100) {
  const response = await fetch("https://nutritrackerbackend.fly.dev/api/nutrition", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ food_item: foodItem, quantity }),
  });

  if (!response.ok) throw new Error("Failed to fetch nutrition data");
  return response.json();
}
