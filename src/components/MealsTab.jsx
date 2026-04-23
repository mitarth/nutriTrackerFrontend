import { useState } from "react";
import { calcTotals, getConsumed } from "../hooks/meals";

const MACRO_GOALS = { protein: 165, carbs: 240, fat: 73, fiber: 30 };
const MACRO_STYLE = {
  protein:  { label: "Protein",      emoji: "🥩", color: "#818cf8" },
  carbs:    { label: "Carbohydrates",emoji: "🌾", color: "#34d399" },
  fat:      { label: "Fat",          emoji: "🥑", color: "#fb923c" },
  fiber:    { label: "Fiber",        emoji: "🥦", color: "#60a5fa" },
};
const MICRO_DV = {
  vitamin_a:   { dv: 900,  unit: "mcg", label: "Vitamin A",   color: "#f97316" },
  vitamin_c:   { dv: 90,   unit: "mg",  label: "Vitamin C",   color: "#eab308" },
  vitamin_d:   { dv: 20,   unit: "mcg", label: "Vitamin D",   color: "#84cc16" },
  vitamin_e:   { dv: 15,   unit: "mg",  label: "Vitamin E",   color: "#22c55e" },
  vitamin_k:   { dv: 120,  unit: "mcg", label: "Vitamin K",   color: "#10b981" },
  vitamin_b12: { dv: 2.4,  unit: "mcg", label: "Vitamin B12", color: "#06b6d4" },
  folate:      { dv: 400,  unit: "mcg", label: "Folate",      color: "#8b5cf6" },
  calcium:     { dv: 1000, unit: "mg",  label: "Calcium",     color: "#ec4899" },
  iron:        { dv: 18,   unit: "mg",  label: "Iron",        color: "#f43f5e" },
  magnesium:   { dv: 420,  unit: "mg",  label: "Magnesium",   color: "#a855f7" },
  potassium:   { dv: 4700, unit: "mg",  label: "Potassium",   color: "#3b82f6" },
  zinc:        { dv: 11,   unit: "mg",  label: "Zinc",        color: "#0ea5e9" },
  sodium:      { dv: 2300, unit: "mg",  label: "Sodium",      color: "#fbbf24" },
  phosphorus:  { dv: 700,  unit: "mg",  label: "Phosphorus",  color: "#14b8a6" },
};

function pct(val, goal) { return Math.min(100, Math.round((val / goal) * 100)); }
function round1(n) { return Math.round(n * 10) / 10; }
function formatTime(iso) {
  if (!iso) return "";
  return new Date(iso).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
}

function MacroBar({ label, emoji, consumed, goal, color }) {
  const p = pct(consumed, goal);
  return (
    <div style={{ marginBottom: 12 }}>
      <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 4 }}>
        <span style={{ fontSize: 12, color: "#e2e8f0", fontWeight: 600 }}>{emoji} {label}</span>
        <span style={{ fontSize: 11, color: "#94a3b8" }}>
          {round1(consumed)}g <span style={{ color: "#475569" }}>/ {goal}g</span>
        </span>
      </div>
      <div style={{ background: "#1e293b", borderRadius: 99, height: 7, overflow: "hidden" }}>
        <div style={{ width: `${p}%`, height: "100%", background: color, borderRadius: 99, transition: "width 0.7s ease" }} />
      </div>
      <div style={{ fontSize: 10, color: "#475569", textAlign: "right", marginTop: 2 }}>{p}%</div>
    </div>
  );
}

function MicroBar({ label, consumed, unit, dv, color }) {
  const p = pct(consumed, dv);
  const over = p >= 100;
  return (
    <div style={{ marginBottom: 9 }}>
      <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 3 }}>
        <span style={{ fontSize: 11, color: "#cbd5e1" }}>{label}</span>
        <div>
          <span style={{ fontSize: 11, color: over ? "#f97316" : "#94a3b8", fontWeight: 600 }}>
            {round1(consumed)}{unit}
          </span>
          <span style={{ fontSize: 10, color: "#475569" }}> / {dv}{unit}</span>
        </div>
      </div>
      <div style={{ background: "#1e293b", borderRadius: 99, height: 4, overflow: "hidden" }}>
        <div style={{ width: `${Math.min(p, 100)}%`, height: "100%", background: over ? "#f97316" : color, borderRadius: 99 }} />
      </div>
    </div>
  );
}

function FoodCard({ item }) {
  const [expanded, setExpanded] = useState(false);
  return (
    <div
      onClick={() => setExpanded(e => !e)}
      style={{ background: "#111827", borderRadius: 14, padding: "12px 14px", border: "1px solid #1e293b", marginBottom: 8, cursor: "pointer" }}
    >
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
        <div>
          <div style={{ fontSize: 13, fontWeight: 700, color: "#e2e8f0", textTransform: "capitalize" }}>{item.foodName || item.food_name || item.name || item.food || "Unknown"}</div>
          <div style={{ fontSize: 10, color: "#475569", marginTop: 2 }}>
            {item.serving_size ?? item.serving}g · {formatTime(item.consumptionDate)}
          </div>
        </div>
        <div style={{ textAlign: "right" }}>
          <div style={{ fontSize: 16, fontWeight: 800, color: "#a78bfa" }}>{getConsumed(item.calories) || "—"}</div>
          <div style={{ fontSize: 10, color: "#6b7280" }}>kcal</div>
        </div>
      </div>

      {expanded && item.macros && (
        <div style={{ marginTop: 12, borderTop: "1px solid #1e293b", paddingTop: 10 }}>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "4px 16px" }}>
            {Object.entries(item.macros).map(([key, n]) => {
              const style = MACRO_STYLE[key];
              if (!style || !n) return null;
              return (
                <div key={key} style={{ display: "flex", justifyContent: "space-between", fontSize: 11 }}>
                  <span style={{ color: "#6b7280" }}>{style.emoji} {style.label}</span>
                  <span style={{ color: style.color, fontWeight: 600 }}>{getConsumed(n)}{n?.unit}</span>
                </div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}

function TotalsSection({ totals }) {
  const [microTab, setMicroTab] = useState("vitamins");
  const vitaminKeys = ["vitamin_a", "vitamin_c", "vitamin_d", "vitamin_e", "vitamin_k", "vitamin_b12", "folate"];
  const mineralKeys = ["calcium", "iron", "magnesium", "potassium", "zinc", "sodium", "phosphorus"];

  return (
    <div style={{ marginTop: 4 }}>
      {/* Calorie total */}
      <div style={{ background: "#111827", borderRadius: 14, padding: "14px 16px", border: "1px solid #1e293b", marginBottom: 10 }}>
        <div style={{ fontSize: 11, color: "#6b7280", fontWeight: 600, letterSpacing: "0.05em", marginBottom: 8 }}>🔥 TOTAL CALORIES</div>
        <div style={{ fontSize: 32, fontWeight: 800, color: "#a78bfa" }}>
          {round1(totals.calories)}
          <span style={{ fontSize: 14, color: "#6b7280", marginLeft: 6, fontWeight: 400 }}>kcal</span>
        </div>
      </div>

      {/* Macro totals */}
      <div style={{ background: "#111827", borderRadius: 14, padding: "14px 16px", border: "1px solid #1e293b", marginBottom: 10 }}>
        <div style={{ fontSize: 11, color: "#6b7280", fontWeight: 600, letterSpacing: "0.05em", marginBottom: 12 }}>💪 TOTAL MACROS</div>
        {Object.entries(totals.macros).map(([key, n]) => {
          const style = MACRO_STYLE[key];
          if (!style) return null;
          return (
            <MacroBar
              key={key}
              label={style.label}
              emoji={style.emoji}
              consumed={n.consumed}
              goal={MACRO_GOALS[key]}
              color={style.color}
            />
          );
        })}
      </div>

      {/* Micro totals */}
      <div style={{ background: "#111827", borderRadius: 14, padding: "14px 16px", border: "1px solid #1e293b" }}>
        <div style={{ fontSize: 11, color: "#6b7280", fontWeight: 600, letterSpacing: "0.05em", marginBottom: 10 }}>🔬 TOTAL MICROS</div>
        <div style={{ display: "flex", background: "#1e293b", borderRadius: 8, padding: 3, marginBottom: 12 }}>
          {["vitamins", "minerals"].map(t => (
            <button key={t} onClick={e => { e.stopPropagation(); setMicroTab(t); }}
              style={{ flex: 1, padding: "6px 4px", borderRadius: 6, border: "none", cursor: "pointer", fontSize: 11, fontWeight: 600, textTransform: "capitalize", transition: "all 0.2s",
                background: microTab === t ? "linear-gradient(135deg,#7c3aed,#2563eb)" : "transparent",
                color: microTab === t ? "#fff" : "#6b7280" }}>
              {t === "vitamins" ? "🧬 Vitamins" : "⚗️ Minerals"}
            </button>
          ))}
        </div>
        {(microTab === "vitamins" ? vitaminKeys : mineralKeys).map(key => {
          const ref = MICRO_DV[key];
          const n = microTab === "vitamins" ? totals.vitamins[key] : totals.minerals[key];
          if (!ref || !n) return null;
          return (
            <MicroBar key={key} label={ref.label} consumed={n.consumed} unit={n.unit || ref.unit} dv={ref.dv} color={ref.color} />
          );
        })}
        <div style={{ fontSize: 10, color: "#475569", textAlign: "center", marginTop: 8 }}>DV = Daily Value · Orange = exceeded</div>
      </div>
    </div>
  );
}

export default function MealsTab({ items = [], loading, error }) {

  if (loading) {
    return (
      <div style={{ textAlign: "center", padding: "32px 0", color: "#6b7280", fontSize: 13 }}>
        Loading meals...
      </div>
    );
  }

  if (error) {
    return (
      <div style={{ textAlign: "center", padding: "24px 0", color: "#f43f5e", fontSize: 12 }}>
        {error}
      </div>
    );
  }

  if (!items.length) {
    return (
      <div style={{ textAlign: "center", padding: "32px 0", color: "#6b7280", fontSize: 13 }}>
        No meals logged for this day.
      </div>
    );
  }

  const totals = calcTotals(items);

  return (
    <div>
      <div style={{ fontSize: 11, color: "#6b7280", fontWeight: 600, letterSpacing: "0.05em", marginBottom: 8 }}>
        🍽 FOOD LOG · {items.length} item{items.length !== 1 ? "s" : ""}
      </div>
      {items.map((item, i) => <FoodCard key={i} item={item} />)}
      {totals && <TotalsSection totals={totals} />}
    </div>
  );
}
