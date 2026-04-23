import { useState } from "react";

const META_KEYS = new Set(["food_item", "food", "name", "quantity", "serving_size"]);
const MACRO_KEYS = new Set(["calories", "protein", "carbs", "fat", "fiber", "sugar"]);

const MACRO_STYLE = {
  calories: { emoji: "🔥", color: "#a78bfa" },
  protein:  { emoji: "🥩", color: "#818cf8" },
  carbs:    { emoji: "🌾", color: "#34d399" },
  fat:      { emoji: "🥑", color: "#fb923c" },
  fiber:    { emoji: "🥦", color: "#60a5fa" },
  sugar:    { emoji: "🍬", color: "#f472b6" },
};

function extractValue(raw, fallbackUnit = "") {
  if (raw == null) return { value: null, unit: fallbackUnit, pct: null };
  if (typeof raw === "object") {
    return {
      value: raw.consumed ?? raw.value ?? raw.amount ?? null,
      unit: raw.unit ?? fallbackUnit,
      pct: raw.daily_value_pct ?? raw.dv_pct ?? null,
    };
  }
  return { value: raw, unit: fallbackUnit, pct: null };
}

function isNutrientField(val) {
  if (val == null) return false;
  if (typeof val === "number") return true;
  if (typeof val === "object") {
    return val.consumed != null || val.value != null || val.amount != null;
  }
  return false;
}

function nowLocal() {
  const d = new Date();
  d.setMinutes(d.getMinutes() - d.getTimezoneOffset());
  return d.toISOString().slice(0, 16);
}

const inputBase = {
  background: "#0f172a", border: "1px solid #334155",
  borderRadius: 6, padding: "3px 6px", color: "#e2e8f0", fontSize: 12,
  outline: "none",
};
const servingInputStyle = { ...inputBase, width: 52, textAlign: "center" };
const dateInputStyle    = { ...inputBase, width: 148 };

function AddButton({ onClick }) {
  return (
    <button
      onClick={onClick}
      style={{
        flexShrink: 0, width: 26, height: 26, borderRadius: 99,
        border: "none", cursor: "pointer", display: "flex",
        alignItems: "center", justifyContent: "center",
        background: "linear-gradient(135deg,#7c3aed,#2563eb)",
        color: "#fff", fontSize: 16, fontWeight: 700, lineHeight: 1,
      }}
    >
      +
    </button>
  );
}

function scaleValue(value, serving, baseQuantity) {
  const v = Number(value);
  const s = Number(serving);
  const b = Number(baseQuantity) || 100;
  if (isNaN(v) || isNaN(s)) return value ?? "—";
  const scaled = (v / b) * s;
  return Number.isInteger(v) ? Math.round(scaled) : Math.round(scaled * 10) / 10;
}

function RowControls({ serving, setServing, consumptionDate, setConsumptionDate, onAdd }) {
  return (
    <div style={{ display: "flex", alignItems: "center", gap: 6, marginTop: 6 }}>
      <input
        type="number" min="1" value={serving}
        onChange={e => setServing(Number(e.target.value))}
        style={servingInputStyle}
      />
      <span style={{ fontSize: 10, color: "#6b7280" }}>g</span>
      <input
        type="datetime-local" value={consumptionDate}
        onChange={e => setConsumptionDate(e.target.value)}
        style={dateInputStyle}
      />
      <AddButton onClick={() => onAdd(serving, new Date(consumptionDate).toISOString())} />
    </div>
  );
}

function MacroRow({ emoji, label, value, unit, pct, color, baseQuantity, onAdd }) {
  const [serving, setServing] = useState(Number(baseQuantity) || 100);
  const [consumptionDate, setConsumptionDate] = useState(nowLocal);
  const displayValue = scaleValue(value, serving, baseQuantity ?? 100);
  return (
    <div style={{ padding: "9px 0", borderBottom: "1px solid #0f172a" }}>
      <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
        <span style={{ fontSize: 15 }}>{emoji}</span>
        <span style={{ flex: 1, fontSize: 13, color: "#e2e8f0", fontWeight: 600, textTransform: "capitalize" }}>
          {label}
        </span>
        <span style={{ fontSize: 13, color, fontWeight: 700 }}>
          {displayValue ?? "—"}<span style={{ fontSize: 11, color: "#6b7280", marginLeft: 2 }}>{unit}</span>
        </span>
        {pct != null && (
          <span style={{ fontSize: 10, color: "#475569" }}>{pct}% DV</span>
        )}
      </div>
      <RowControls serving={serving} setServing={setServing}
        consumptionDate={consumptionDate} setConsumptionDate={setConsumptionDate}
        onAdd={onAdd} />
    </div>
  );
}

function MicroRow({ label, value, unit, pct, baseQuantity, onAdd }) {
  const [serving, setServing] = useState(Number(baseQuantity) || 100);
  const [consumptionDate, setConsumptionDate] = useState(nowLocal);
  const displayValue = scaleValue(value, serving, baseQuantity ?? 100);
  return (
    <div style={{ padding: "8px 0", borderBottom: "1px solid #0f172a" }}>
      <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
        <span style={{ flex: 1, fontSize: 12, color: "#94a3b8", textTransform: "capitalize" }}>
          {label.replace(/_/g, " ")}
        </span>
        <span style={{ fontSize: 12, color: "#e2e8f0", fontWeight: 600 }}>
          {displayValue ?? "—"}<span style={{ fontSize: 10, color: "#6b7280", marginLeft: 2 }}>{unit}</span>
        </span>
        {pct != null && (
          <span style={{ fontSize: 10, color: "#475569" }}>{pct}% DV</span>
        )}
      </div>
      <RowControls serving={serving} setServing={setServing}
        consumptionDate={consumptionDate} setConsumptionDate={setConsumptionDate}
        onAdd={onAdd} />
    </div>
  );
}

export default function NutritionResult({ data, onAdd }) {
  if (!data) return null;

  const foodName = data.food_item || data.food || data.name || "Food Item";
  const quantity = data.quantity || data.serving_size;

  const macros = Object.entries(data).filter(([k, v]) => MACRO_KEYS.has(k) && isNutrientField(v));
  const micros = Object.entries(data).filter(([k, v]) => !META_KEYS.has(k) && !MACRO_KEYS.has(k) && isNutrientField(v));

  return (
    <div style={{ marginTop: 12 }}>
      {/* Header */}
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 14 }}>
        <div>
          <div style={{ fontSize: 15, fontWeight: 700, color: "#e2e8f0", textTransform: "capitalize" }}>
            {foodName}
          </div>
          {quantity != null && (
            <div style={{ fontSize: 11, color: "#6b7280" }}>per {quantity}g serving</div>
          )}
        </div>
        <div style={{ fontSize: 10, color: "#a78bfa", background: "#1e1b4b", padding: "3px 8px", borderRadius: 99, fontWeight: 600 }}>
          AI Analysis
        </div>
      </div>

      {macros.length > 0 && (
        <div style={{ marginBottom: 12 }}>
          <div style={{ fontSize: 11, color: "#6b7280", fontWeight: 600, letterSpacing: "0.05em", marginBottom: 4 }}>
            💪 MACROS
          </div>
          {macros.map(([key, raw]) => {
            const style = MACRO_STYLE[key] ?? { emoji: "•", color: "#94a3b8" };
            const { value, unit, pct } = extractValue(raw);
            return (
              <MacroRow key={key} emoji={style.emoji} label={key} value={value} unit={unit}
                pct={pct} color={style.color} baseQuantity={quantity} onAdd={onAdd} />
            );
          })}
        </div>
      )}

      {micros.length > 0 && (
        <div>
          <div style={{ fontSize: 11, color: "#6b7280", fontWeight: 600, letterSpacing: "0.05em", marginBottom: 4 }}>
            🔬 MICROS
          </div>
          {micros.map(([key, raw]) => {
            const { value, unit, pct } = extractValue(raw);
            return (
              <MicroRow key={key} label={key} value={value} unit={unit}
                pct={pct} baseQuantity={quantity} onAdd={onAdd} />
            );
          })}
        </div>
      )}

      {macros.length === 0 && micros.length === 0 && (
        <div style={{ fontSize: 12, color: "#6b7280", textAlign: "center", padding: "12px 0" }}>
          No nutrition data available.
        </div>
      )}
    </div>
  );
}
