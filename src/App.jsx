import { useState } from 'react'
import { fetchNutrition } from './hooks/nutrition'
import reactLogo from './assets/react.svg'
import viteLogo from './assets/vite.svg'
import heroImg from './assets/hero.png'
import './App.css'
import { RadialBarChart, RadialBar, PieChart, Pie, Cell, ResponsiveContainer, Tooltip } from "recharts";

const DAYS = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
const MONTHS = ["Jan","Feb","Mar","Apr","May","Jun","Jul","Aug","Sep","Oct","Nov","Dec"];

function getDateLabel(offset) {
  const d = new Date();
  d.setDate(d.getDate() + offset);
  return { label: DAYS[d.getDay()], full: `${MONTHS[d.getMonth()]} ${d.getDate()}`, dateObj: d };
}

const sampleData = {
  0: {
    calories: { consumed: 1820, goal: 2200 },
    macros: { protein: { g: 142, goal: 165 }, carbs: { g: 198, goal: 240 }, fat: { g: 58, goal: 73 }, fiber: { g: 22, goal: 30 } },
    meals: [
      { name: "Breakfast", items: ["Oats with banana", "2 eggs", "Black coffee"], cals: 480 },
      { name: "Lunch", items: ["Grilled chicken breast", "Brown rice", "Broccoli"], cals: 620 },
      { name: "Snack", items: ["Greek yogurt", "Mixed berries"], cals: 190 },
      { name: "Dinner", items: ["Salmon fillet", "Sweet potato", "Spinach salad"], cals: 530 },
    ],
    micros: {
      vitamins: {
        "Vitamin A": { val: 780, unit: "mcg", dv: 900, color: "#f97316" },
        "Vitamin C": { val: 88, unit: "mg", dv: 90, color: "#eab308" },
        "Vitamin D": { val: 14, unit: "mcg", dv: 20, color: "#84cc16" },
        "Vitamin E": { val: 12, unit: "mg", dv: 15, color: "#22c55e" },
        "Vitamin K": { val: 95, unit: "mcg", dv: 120, color: "#10b981" },
        "Vitamin B12": { val: 2.1, unit: "mcg", dv: 2.4, color: "#06b6d4" },
        "Folate": { val: 310, unit: "mcg", dv: 400, color: "#8b5cf6" },
      },
      minerals: {
        "Calcium": { val: 880, unit: "mg", dv: 1000, color: "#ec4899" },
        "Iron": { val: 14, unit: "mg", dv: 18, color: "#f43f5e" },
        "Magnesium": { val: 310, unit: "mg", dv: 420, color: "#a855f7" },
        "Potassium": { val: 3100, unit: "mg", dv: 4700, color: "#3b82f6" },
        "Zinc": { val: 9, unit: "mg", dv: 11, color: "#0ea5e9" },
        "Sodium": { val: 1850, unit: "mg", dv: 2300, color: "#f97316" },
        "Phosphorus": { val: 920, unit: "mg", dv: 700, color: "#14b8a6" },
      },
    },
  },
  "-1": {
    calories: { consumed: 2050, goal: 2200 },
    macros: { protein: { g: 158, goal: 165 }, carbs: { g: 215, goal: 240 }, fat: { g: 67, goal: 73 }, fiber: { g: 27, goal: 30 } },
    meals: [
      { name: "Breakfast", items: ["Protein shake", "Whole grain toast"], cals: 420 },
      { name: "Lunch", items: ["Turkey sandwich", "Apple", "Almonds"], cals: 590 },
      { name: "Snack", items: ["Protein bar"], cals: 220 },
      { name: "Dinner", items: ["Beef stir-fry", "Jasmine rice", "Edamame"], cals: 820 },
    ],
    micros: {
      vitamins: {
        "Vitamin A": { val: 850, unit: "mcg", dv: 900, color: "#f97316" },
        "Vitamin C": { val: 75, unit: "mg", dv: 90, color: "#eab308" },
        "Vitamin D": { val: 8, unit: "mcg", dv: 20, color: "#84cc16" },
        "Vitamin E": { val: 11, unit: "mg", dv: 15, color: "#22c55e" },
        "Vitamin K": { val: 102, unit: "mcg", dv: 120, color: "#10b981" },
        "Vitamin B12": { val: 2.6, unit: "mcg", dv: 2.4, color: "#06b6d4" },
        "Folate": { val: 280, unit: "mcg", dv: 400, color: "#8b5cf6" },
      },
      minerals: {
        "Calcium": { val: 750, unit: "mg", dv: 1000, color: "#ec4899" },
        "Iron": { val: 16, unit: "mg", dv: 18, color: "#f43f5e" },
        "Magnesium": { val: 290, unit: "mg", dv: 420, color: "#a855f7" },
        "Potassium": { val: 3400, unit: "mg", dv: 4700, color: "#3b82f6" },
        "Zinc": { val: 10, unit: "mg", dv: 11, color: "#0ea5e9" },
        "Sodium": { val: 2100, unit: "mg", dv: 2300, color: "#f97316" },
        "Phosphorus": { val: 870, unit: "mg", dv: 700, color: "#14b8a6" },
      },
    },
  },
  "-2": {
    calories: { consumed: 1650, goal: 2200 },
    macros: { protein: { g: 120, goal: 165 }, carbs: { g: 180, goal: 240 }, fat: { g: 52, goal: 73 }, fiber: { g: 18, goal: 30 } },
    meals: [
      { name: "Breakfast", items: ["Smoothie bowl", "Granola"], cals: 390 },
      { name: "Lunch", items: ["Tuna salad", "Whole grain crackers"], cals: 480 },
      { name: "Dinner", items: ["Pasta primavera", "Side salad"], cals: 780 },
    ],
    micros: {
      vitamins: {
        "Vitamin A": { val: 620, unit: "mcg", dv: 900, color: "#f97316" },
        "Vitamin C": { val: 110, unit: "mg", dv: 90, color: "#eab308" },
        "Vitamin D": { val: 6, unit: "mcg", dv: 20, color: "#84cc16" },
        "Vitamin E": { val: 9, unit: "mg", dv: 15, color: "#22c55e" },
        "Vitamin K": { val: 78, unit: "mcg", dv: 120, color: "#10b981" },
        "Vitamin B12": { val: 1.8, unit: "mcg", dv: 2.4, color: "#06b6d4" },
        "Folate": { val: 250, unit: "mcg", dv: 400, color: "#8b5cf6" },
      },
      minerals: {
        "Calcium": { val: 620, unit: "mg", dv: 1000, color: "#ec4899" },
        "Iron": { val: 11, unit: "mg", dv: 18, color: "#f43f5e" },
        "Magnesium": { val: 240, unit: "mg", dv: 420, color: "#a855f7" },
        "Potassium": { val: 2700, unit: "mg", dv: 4700, color: "#3b82f6" },
        "Zinc": { val: 7, unit: "mg", dv: 11, color: "#0ea5e9" },
        "Sodium": { val: 1550, unit: "mg", dv: 2300, color: "#f97316" },
        "Phosphorus": { val: 730, unit: "mg", dv: 700, color: "#14b8a6" },
      },
    },
  },
};

function pct(val, goal) { return Math.min(100, Math.round((val / goal) * 100)); }

function CalorieRing({ consumed, goal }) {
  const p = pct(consumed, goal);
  const remaining = Math.max(0, goal - consumed);
  const color = p >= 100 ? "#f43f5e" : p >= 85 ? "#f97316" : "#a78bfa";
  const circumference = 2 * Math.PI * 52;
  const dash = (p / 100) * circumference;

  return (
    <div className="flex flex-col items-center">
      <div style={{ position: "relative", width: 140, height: 140 }}>
        <svg width={140} height={140} style={{ transform: "rotate(-90deg)" }}>
          <circle cx={70} cy={70} r={52} fill="none" stroke="#1e1b4b" strokeWidth={14} />
          <circle
            cx={70} cy={70} r={52} fill="none"
            stroke={color} strokeWidth={14}
            strokeDasharray={`${dash} ${circumference}`}
            strokeLinecap="round"
            style={{ transition: "stroke-dasharray 0.8s ease" }}
          />
        </svg>
        <div style={{ position:"absolute", top:0, left:0, width:140, height:140, display:"flex", flexDirection:"column", alignItems:"center", justifyContent:"center" }}>
          <span style={{ fontSize: 26, fontWeight: 800, color: "#fff" }}>{consumed.toLocaleString()}</span>
          <span style={{ fontSize: 11, color: "#a5b4fc" }}>of {goal.toLocaleString()} kcal</span>
        </div>
      </div>
      <div style={{ display: "flex", gap: 24, marginTop: 12 }}>
        <div style={{ textAlign: "center" }}>
          <div style={{ fontSize: 18, fontWeight: 700, color: "#4ade80" }}>{remaining.toLocaleString()}</div>
          <div style={{ fontSize: 10, color: "#6b7280" }}>remaining</div>
        </div>
        <div style={{ textAlign: "center" }}>
          <div style={{ fontSize: 18, fontWeight: 700, color: color }}>{p}%</div>
          <div style={{ fontSize: 10, color: "#6b7280" }}>of goal</div>
        </div>
      </div>
    </div>
  );
}

function MacroBar({ label, g, goal, color, emoji }) {
  const p = pct(g, goal);
  return (
    <div style={{ marginBottom: 14 }}>
      <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 5 }}>
        <span style={{ fontSize: 13, color: "#e2e8f0", fontWeight: 600 }}>{emoji} {label}</span>
        <span style={{ fontSize: 12, color: "#94a3b8" }}>{g}g <span style={{ color: "#475569" }}>/ {goal}g</span></span>
      </div>
      <div style={{ background: "#1e293b", borderRadius: 99, height: 8, overflow: "hidden" }}>
        <div style={{ width: `${p}%`, height: "100%", background: color, borderRadius: 99, transition: "width 0.7s ease" }} />
      </div>
      <div style={{ fontSize: 10, color: "#475569", textAlign: "right", marginTop: 2 }}>{p}%</div>
    </div>
  );
}

function MicroBar({ name, val, unit, dv, color }) {
  const p = pct(val, dv);
  const over = p >= 100;
  return (
    <div style={{ marginBottom: 10 }}>
      <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 3 }}>
        <span style={{ fontSize: 12, color: "#cbd5e1" }}>{name}</span>
        <div style={{ textAlign: "right" }}>
          <span style={{ fontSize: 12, color: over ? "#f97316" : "#94a3b8", fontWeight: 600 }}>{val}{unit}</span>
          <span style={{ fontSize: 10, color: "#475569" }}> / {dv}{unit}</span>
        </div>
      </div>
      <div style={{ background: "#1e293b", borderRadius: 99, height: 5, overflow: "hidden" }}>
        <div style={{ width: `${Math.min(p, 100)}%`, height: "100%", background: over ? "#f97316" : color, borderRadius: 99, transition: "width 0.7s ease" }} />
      </div>
    </div>
  );
}

function MacroPie({ macros }) {
  const data = [
    { name: "Protein", value: macros.protein.g * 4, color: "#818cf8" },
    { name: "Carbs", value: macros.carbs.g * 4, color: "#34d399" },
    { name: "Fat", value: macros.fat.g * 9, color: "#fb923c" },
  ];
  const total = data.reduce((s, d) => s + d.value, 0);
  return (
    <div style={{ display: "flex", alignItems: "center", gap: 16 }}>
      <ResponsiveContainer width={80} height={80}>
        <PieChart>
          <Pie data={data} dataKey="value" cx="50%" cy="50%" innerRadius={22} outerRadius={36} strokeWidth={0}>
            {data.map((d) => <Cell key={d.name} fill={d.color} />)}
          </Pie>
        </PieChart>
      </ResponsiveContainer>
      <div style={{ flex: 1 }}>
        {data.map(d => (
          <div key={d.name} style={{ display: "flex", justifyContent: "space-between", fontSize: 11, marginBottom: 3 }}>
            <span style={{ display: "flex", alignItems: "center", gap: 5, color: "#cbd5e1" }}>
              <span style={{ width: 8, height: 8, borderRadius: 99, background: d.color, display: "inline-block" }} />
              {d.name}
            </span>
            <span style={{ color: "#94a3b8" }}>{Math.round(d.value / total * 100)}%</span>
          </div>
        ))}
      </div>
    </div>
  );
}

function App() {
  const [dayOffset, setDayOffset] = useState(0);
  const [activeTab, setActiveTab] = useState("macros");
  const [expandedMeal, setExpandedMeal] = useState(null);
  const [foodInput, setFoodInput] = useState("");
  const [nutritionResult, setNutritionResult] = useState(null);
  const [nutritionLoading, setNutritionLoading] = useState(false);
  const [nutritionError, setNutritionError] = useState(null);

  const handleFetchNutrition = async () => {
    if (!foodInput.trim()) return;
    setNutritionLoading(true);
    setNutritionError(null);
    try {
      const result = await fetchNutrition(foodInput.trim());
      setNutritionResult(result);
    } catch (e) {
      setNutritionError(e.message);
    } finally {
      setNutritionLoading(false);
    }
  };

  const days = [-2, -1, 0].map(o => ({ offset: o, ...getDateLabel(o) }));
  const key = String(dayOffset);
  const data = sampleData[key] || sampleData["0"];
  const { calories, macros, meals, micros } = data;

  const macroColors = {
    protein: "#818cf8",
    carbs: "#34d399",
    fat: "#fb923c",
    fiber: "#60a5fa",
  };

  return (
    <div style={{ minHeight: "100vh", background: "#0f0e1a", color: "#fff", fontFamily: "'Inter', 'Segoe UI', sans-serif", padding: "0 0 40px 0" }}>

      {/* Header */}
      <div style={{ background: "linear-gradient(135deg, #1e1b4b 0%, #0f0e1a 100%)", padding: "20px 20px 0", borderBottom: "1px solid #1e293b" }}>
        <div style={{ maxWidth: 480, margin: "0 auto" }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 18 }}>
            <div>
              <div style={{ fontSize: 20, fontWeight: 800, background: "linear-gradient(90deg, #a78bfa, #60a5fa)", WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent" }}>NutriTrack</div>
              <div style={{ fontSize: 11, color: "#6b7280" }}>Macro & Micro Tracker</div>
            </div>
            <div style={{ width: 36, height: 36, borderRadius: 99, background: "linear-gradient(135deg,#7c3aed,#2563eb)", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 14, fontWeight: 700 }}>M</div>
          </div>

          {/* Day Selector */}
          <div style={{ display: "flex", gap: 8, overflowX: "auto", paddingBottom: 0 }}>
            {days.map(d => {
              const active = d.offset === dayOffset;
              return (
                <button key={d.offset} onClick={() => setDayOffset(d.offset)}
                  style={{ flex: 1, padding: "8px 6px 12px", borderRadius: "10px 10px 0 0", border: "none", cursor: "pointer", background: active ? "#0f0e1a" : "transparent", color: active ? "#a78bfa" : "#6b7280", transition: "all 0.2s" }}>
                  <div style={{ fontSize: 10, marginBottom: 2 }}>{d.label}</div>
                  <div style={{ fontSize: 13, fontWeight: active ? 700 : 400 }}>{d.full.split(" ")[1]}</div>
                  {active && <div style={{ width: "100%", height: 2, background: "linear-gradient(90deg,#a78bfa,#60a5fa)", borderRadius: 99, marginTop: 6 }} />}
                </button>
              );
            })}
          </div>
        </div>
      </div>

      <div style={{ maxWidth: 480, margin: "0 auto", padding: "0 16px" }}>

        {/* Calorie Card */}
        <div style={{ background: "linear-gradient(135deg, #1e1b4b 0%, #111827 100%)", borderRadius: "0 0 20px 20px", padding: "20px", marginBottom: 16, border: "1px solid #1e293b", borderTop: "none" }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
            <div style={{ flex: 1 }}>
              <div style={{ fontSize: 11, color: "#6b7280", fontWeight: 600, letterSpacing: "0.08em", textTransform: "uppercase", marginBottom: 6 }}>Daily Calories</div>
              <CalorieRing consumed={calories.consumed} goal={calories.goal} />
            </div>
            <div style={{ flex: 1, paddingLeft: 16 }}>
              <div style={{ fontSize: 11, color: "#6b7280", fontWeight: 600, letterSpacing: "0.08em", textTransform: "uppercase", marginBottom: 6 }}>Macro Split</div>
              <MacroPie macros={macros} />
              <div style={{ marginTop: 14 }}>
                <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 6 }}>
                  <span style={{ fontSize: 11, color: "#6b7280" }}>🔥 Burned</span>
                  <span style={{ fontSize: 13, fontWeight: 700, color: "#f43f5e" }}>320 kcal</span>
                </div>
                <div style={{ display: "flex", justifyContent: "space-between" }}>
                  <span style={{ fontSize: 11, color: "#6b7280" }}>💧 Water</span>
                  <span style={{ fontSize: 13, fontWeight: 700, color: "#60a5fa" }}>2.1 / 2.5L</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Tab Switcher */}
        <div style={{ display: "flex", background: "#1e293b", borderRadius: 12, padding: 4, marginBottom: 16 }}>
          {["macros", "micros", "meals"].map(tab => (
            <button key={tab} onClick={() => setActiveTab(tab)}
              style={{ flex: 1, padding: "8px 4px", borderRadius: 10, border: "none", cursor: "pointer", fontWeight: 600, fontSize: 12, textTransform: "capitalize", transition: "all 0.2s",
                background: activeTab === tab ? "linear-gradient(135deg,#7c3aed,#2563eb)" : "transparent",
                color: activeTab === tab ? "#fff" : "#6b7280" }}>
              {tab === "macros" ? "💪 Macros" : tab === "micros" ? "🔬 Micros" : "🍽 Meals"}
            </button>
          ))}
        </div>

        {/* MACROS TAB */}
        {activeTab === "macros" && (
          <div style={{ background: "#111827", borderRadius: 16, padding: 20, border: "1px solid #1e293b" }}>
            <div style={{ fontSize: 13, fontWeight: 700, color: "#a78bfa", marginBottom: 16, letterSpacing: "0.05em" }}>MACRONUTRIENTS</div>
            <MacroBar label="Protein" g={macros.protein.g} goal={macros.protein.goal} color="#818cf8" emoji="🥩" />
            <MacroBar label="Carbohydrates" g={macros.carbs.g} goal={macros.carbs.goal} color="#34d399" emoji="🌾" />
            <MacroBar label="Fat" g={macros.fat.g} goal={macros.fat.goal} color="#fb923c" emoji="🥑" />
            <MacroBar label="Fiber" g={macros.fiber.g} goal={macros.fiber.goal} color="#60a5fa" emoji="🥦" />

            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 10, marginTop: 20 }}>
              {[
                { label: "Protein", val: macros.protein.g * 4, color: "#818cf8", unit: "kcal" },
                { label: "Carbs", val: macros.carbs.g * 4, color: "#34d399", unit: "kcal" },
                { label: "Fat", val: macros.fat.g * 9, color: "#fb923c", unit: "kcal" },
              ].map(m => (
                <div key={m.label} style={{ background: "#1e293b", borderRadius: 12, padding: "12px 8px", textAlign: "center" }}>
                  <div style={{ fontSize: 17, fontWeight: 800, color: m.color }}>{m.val}</div>
                  <div style={{ fontSize: 10, color: "#6b7280" }}>{m.label} kcal</div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* MICROS TAB */}
        {activeTab === "micros" && (
          <div>
            <div style={{ background: "#111827", borderRadius: 16, padding: 20, border: "1px solid #1e293b", marginBottom: 12 }}>
              <div style={{ fontSize: 13, fontWeight: 700, color: "#a78bfa", marginBottom: 14, letterSpacing: "0.05em" }}>🧬 VITAMINS</div>
              {Object.entries(micros.vitamins).map(([name, { val, unit, dv, color }]) => (
                <MicroBar key={name} name={name} val={val} unit={unit} dv={dv} color={color} />
              ))}
            </div>
            <div style={{ background: "#111827", borderRadius: 16, padding: 20, border: "1px solid #1e293b" }}>
              <div style={{ fontSize: 13, fontWeight: 700, color: "#a78bfa", marginBottom: 14, letterSpacing: "0.05em" }}>⚗️ MINERALS</div>
              {Object.entries(micros.minerals).map(([name, { val, unit, dv, color }]) => (
                <MicroBar key={name} name={name} val={val} unit={unit} dv={dv} color={color} />
              ))}
            </div>
            <div style={{ fontSize: 10, color: "#475569", textAlign: "center", marginTop: 8 }}>DV = Daily Value · Orange bar = exceeded DV</div>
          </div>
        )}

        {/* MEALS TAB */}
        {activeTab === "meals" && (
          <div>
            {meals.map((meal, i) => (
              <div key={i} style={{ background: "#111827", borderRadius: 16, padding: "14px 16px", border: "1px solid #1e293b", marginBottom: 10, cursor: "pointer" }}
                onClick={() => setExpandedMeal(expandedMeal === i ? null : i)}>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                  <div>
                    <div style={{ fontSize: 14, fontWeight: 700, color: "#e2e8f0" }}>{meal.name}</div>
                    <div style={{ fontSize: 11, color: "#6b7280" }}>{meal.items.length} items</div>
                  </div>
                  <div style={{ textAlign: "right" }}>
                    <div style={{ fontSize: 17, fontWeight: 800, color: "#a78bfa" }}>{meal.cals}</div>
                    <div style={{ fontSize: 10, color: "#6b7280" }}>kcal</div>
                  </div>
                </div>
                {expandedMeal === i && (
                  <div style={{ marginTop: 12, borderTop: "1px solid #1e293b", paddingTop: 10 }}>
                    {meal.items.map((item, j) => (
                      <div key={j} style={{ display: "flex", alignItems: "center", gap: 8, padding: "5px 0" }}>
                        <span style={{ width: 6, height: 6, borderRadius: 99, background: "#a78bfa", display: "inline-block", flexShrink: 0 }} />
                        <span style={{ fontSize: 13, color: "#94a3b8" }}>{item}</span>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            ))}
            <button style={{ width: "100%", padding: "14px", borderRadius: 16, border: "2px dashed #1e293b", background: "transparent", color: "#6b7280", fontSize: 14, cursor: "pointer", fontWeight: 600 }}>
              + Add Meal
            </button>
          </div>
        )}

        {/* Weekly Summary Strip */}
        <div style={{ marginTop: 16, background: "#111827", borderRadius: 16, padding: 16, border: "1px solid #1e293b" }}>
          <div style={{ fontSize: 12, fontWeight: 700, color: "#a78bfa", marginBottom: 12, letterSpacing: "0.05em" }}>📊 THIS WEEK AT A GLANCE</div>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(7, 1fr)", gap: 4 }}>
            {["M","T","W","T","F","S","S"].map((d, i) => {
              const heights = [78, 92, 55, 100, 82, 0, 0];
              const colors = heights[i] >= 90 ? "#34d399" : heights[i] >= 70 ? "#a78bfa" : heights[i] === 0 ? "#1e293b" : "#60a5fa";
              return (
                <div key={i} style={{ textAlign: "center" }}>
                  <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 3, marginBottom: 4 }}>
                    <div style={{ width: 8, borderRadius: "3px 3px 0 0", background: colors, height: `${heights[i] / 4}px`, minHeight: heights[i] > 0 ? 4 : 0, transition: "height 0.5s" }} />
                  </div>
                  <div style={{ fontSize: 9, color: "#475569" }}>{d}</div>
                </div>
              );
            })}
          </div>
          <div style={{ display: "flex", justifyContent: "space-between", marginTop: 12 }}>
            <div style={{ textAlign: "center" }}>
              <div style={{ fontSize: 15, fontWeight: 700, color: "#34d399" }}>5/7</div>
              <div style={{ fontSize: 9, color: "#6b7280" }}>goal days</div>
            </div>
            <div style={{ textAlign: "center" }}>
              <div style={{ fontSize: 15, fontWeight: 700, color: "#a78bfa" }}>1,840</div>
              <div style={{ fontSize: 9, color: "#6b7280" }}>avg kcal</div>
            </div>
            <div style={{ textAlign: "center" }}>
              <div style={{ fontSize: 15, fontWeight: 700, color: "#fb923c" }}>138g</div>
              <div style={{ fontSize: 9, color: "#6b7280" }}>avg protein</div>
            </div>
            <div style={{ textAlign: "center" }}>
              <div style={{ fontSize: 15, fontWeight: 700, color: "#60a5fa" }}>2.2L</div>
              <div style={{ fontSize: 9, color: "#6b7280" }}>avg water</div>
            </div>
          </div>
        </div>

        {/* Food Nutrition Lookup */}
        <div style={{ marginTop: 16, background: "#111827", borderRadius: 16, padding: 16, border: "1px solid #1e293b" }}>
          <div style={{ fontSize: 12, fontWeight: 700, color: "#a78bfa", marginBottom: 12, letterSpacing: "0.05em" }}>🔍 NUTRITION LOOKUP</div>
          <div style={{ display: "flex", gap: 8 }}>
            <input
              value={foodInput}
              onChange={e => setFoodInput(e.target.value)}
              onKeyDown={e => e.key === "Enter" && handleFetchNutrition()}
              placeholder="Enter food item..."
              style={{ flex: 1, background: "#1e293b", border: "1px solid #334155", borderRadius: 10, padding: "10px 12px", color: "#e2e8f0", fontSize: 13, outline: "none" }}
            />
            <button
              onClick={handleFetchNutrition}
              disabled={nutritionLoading}
              style={{ padding: "10px 16px", borderRadius: 10, border: "none", cursor: nutritionLoading ? "not-allowed" : "pointer", background: "linear-gradient(135deg,#7c3aed,#2563eb)", color: "#fff", fontWeight: 700, fontSize: 13, opacity: nutritionLoading ? 0.6 : 1 }}>
              {nutritionLoading ? "..." : "Fetch"}
            </button>
          </div>
          {nutritionError && (
            <div style={{ marginTop: 10, fontSize: 12, color: "#f43f5e" }}>{nutritionError}</div>
          )}
          {nutritionResult && (
            <div style={{ marginTop: 12, background: "#1e293b", borderRadius: 10, padding: 12 }}>
              <pre style={{ fontSize: 11, color: "#94a3b8", margin: 0, whiteSpace: "pre-wrap", wordBreak: "break-all" }}>
                {JSON.stringify(nutritionResult, null, 2)}
              </pre>
            </div>
          )}
        </div>

      </div>
    </div>
  );
}



export default App
