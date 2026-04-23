import { useState, useEffect } from "react";
import { fetchWeeklyMeals, getWeekMonday } from "../hooks/meals";

const CALORIE_GOAL = 2200;
const GOAL_THRESHOLD = 0.8;
const DAY_LABELS = ["M", "T", "W", "T", "F", "S", "S"];

function barColor(pct) {
  if (pct === 0) return "#1e293b";
  if (pct >= 90) return "#34d399";
  if (pct >= 70) return "#a78bfa";
  return "#60a5fa";
}

function getCalories(day) {
  if (day == null) return 0;
  if (typeof day.calories === "number") return day.calories;
  if (typeof day.calories === "object") return day.calories?.consumed ?? day.calories?.value ?? 0;
  return 0;
}

function getProtein(day) {
  if (day == null) return 0;
  const p = day.macros?.protein;
  if (!p) return 0;
  if (typeof p === "number") return p;
  return p.consumed ?? p.value ?? 0;
}

export default function WeeklySummary() {
  const [days, setDays] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const startDate = getWeekMonday();
    setLoading(true);
    fetchWeeklyMeals(startDate)
      .then(data => setDays(Array.isArray(data) ? data : Object.values(data)))
      .catch(e => setError(e.message))
      .finally(() => setLoading(false));
  }, []);

  const calPcts = DAY_LABELS.map((_, i) => {
    const cal = getCalories(days[i]);
    return cal > 0 ? Math.min(100, Math.round((cal / CALORIE_GOAL) * 100)) : 0;
  });

  const activeDays = days.filter(d => getCalories(d) > 0);
  const goalDays = activeDays.filter(d => getCalories(d) >= CALORIE_GOAL * GOAL_THRESHOLD).length;
  const avgKcal = activeDays.length
    ? Math.round(activeDays.reduce((s, d) => s + getCalories(d), 0) / activeDays.length)
    : 0;
  const avgProtein = activeDays.length
    ? Math.round(activeDays.reduce((s, d) => s + getProtein(d), 0) / activeDays.length)
    : 0;

  return (
    <div style={{ marginTop: 16, background: "#111827", borderRadius: 16, padding: 16, border: "1px solid #1e293b" }}>
      <div style={{ fontSize: 12, fontWeight: 700, color: "#a78bfa", marginBottom: 12, letterSpacing: "0.05em" }}>
        📊 THIS WEEK AT A GLANCE
      </div>

      {loading ? (
        <div style={{ fontSize: 11, color: "#475569", textAlign: "center", padding: "12px 0" }}>Loading…</div>
      ) : error ? (
        <div style={{ fontSize: 11, color: "#f43f5e", textAlign: "center", padding: "8px 0" }}>{error}</div>
      ) : (
        <>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(7, 1fr)", gap: 4 }}>
            {DAY_LABELS.map((label, i) => {
              const pct = calPcts[i];
              const color = barColor(pct);
              return (
                <div key={i} style={{ textAlign: "center" }}>
                  <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 3, marginBottom: 4 }}>
                    <div style={{
                      width: 8, borderRadius: "3px 3px 0 0", background: color,
                      height: `${pct / 4}px`, minHeight: pct > 0 ? 4 : 0, transition: "height 0.5s",
                    }} />
                  </div>
                  <div style={{ fontSize: 9, color: "#475569" }}>{label}</div>
                </div>
              );
            })}
          </div>

          <div style={{ display: "flex", justifyContent: "space-between", marginTop: 12 }}>
            <div style={{ textAlign: "center" }}>
              <div style={{ fontSize: 15, fontWeight: 700, color: "#34d399" }}>{goalDays}/7</div>
              <div style={{ fontSize: 9, color: "#6b7280" }}>goal days</div>
            </div>
            <div style={{ textAlign: "center" }}>
              <div style={{ fontSize: 15, fontWeight: 700, color: "#a78bfa" }}>
                {avgKcal > 0 ? avgKcal.toLocaleString() : "—"}
              </div>
              <div style={{ fontSize: 9, color: "#6b7280" }}>avg kcal</div>
            </div>
            <div style={{ textAlign: "center" }}>
              <div style={{ fontSize: 15, fontWeight: 700, color: "#fb923c" }}>
                {avgProtein > 0 ? `${avgProtein}g` : "—"}
              </div>
              <div style={{ fontSize: 9, color: "#6b7280" }}>avg protein</div>
            </div>
          </div>
        </>
      )}
    </div>
  );
}
