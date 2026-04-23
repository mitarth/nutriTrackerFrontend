import { useState, useEffect } from 'react'
import { fetchMeals, calcTotals } from './hooks/meals'

import { fetchNutrition, addItem, buildMealPayload } from './hooks/nutrition'
import MealsTab from './components/MealsTab'
import NutritionResult from './components/NutritionResult'
import WeeklySummary from './components/WeeklySummary'
import './App.css'
import { PieChart, Pie, Cell, ResponsiveContainer } from "recharts";

const DAYS = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
const MONTHS = ["Jan","Feb","Mar","Apr","May","Jun","Jul","Aug","Sep","Oct","Nov","Dec"];

function getDateLabel(offset) {
  const d = new Date();
  d.setDate(d.getDate() + offset);
  return { label: DAYS[d.getDay()], full: `${MONTHS[d.getMonth()]} ${d.getDate()}`, dateObj: d };
}

const MACRO_GOALS = { protein: 165, carbs: 240, fat: 73, fiber: 30 };

const MICRO_DISPLAY = {
  vitamins: {
    vitamin_a:   { name: "Vitamin A",   unit: "mcg", dv: 900,  color: "#f97316" },
    vitamin_c:   { name: "Vitamin C",   unit: "mg",  dv: 90,   color: "#eab308" },
    vitamin_d:   { name: "Vitamin D",   unit: "mcg", dv: 20,   color: "#84cc16" },
    vitamin_e:   { name: "Vitamin E",   unit: "mg",  dv: 15,   color: "#22c55e" },
    vitamin_k:   { name: "Vitamin K",   unit: "mcg", dv: 120,  color: "#10b981" },
    vitamin_b12: { name: "Vitamin B12", unit: "mcg", dv: 2.4,  color: "#06b6d4" },
    folate:      { name: "Folate",      unit: "mcg", dv: 400,  color: "#8b5cf6" },
  },
  minerals: {
    calcium:     { name: "Calcium",     unit: "mg",  dv: 1000, color: "#ec4899" },
    iron:        { name: "Iron",        unit: "mg",  dv: 18,   color: "#f43f5e" },
    magnesium:   { name: "Magnesium",   unit: "mg",  dv: 420,  color: "#a855f7" },
    potassium:   { name: "Potassium",   unit: "mg",  dv: 4700, color: "#3b82f6" },
    zinc:        { name: "Zinc",        unit: "mg",  dv: 11,   color: "#0ea5e9" },
    sodium:      { name: "Sodium",      unit: "mg",  dv: 2300, color: "#f97316" },
    phosphorus:  { name: "Phosphorus",  unit: "mg",  dv: 700,  color: "#14b8a6" },
  },
};

function buildMicros(totals) {
  const mapSection = (config, totalsSection) =>
    Object.fromEntries(
      Object.entries(config).map(([key, { name, unit, dv, color }]) => [
        name,
        { val: Math.round((totalsSection[key]?.consumed ?? 0) * 10) / 10, unit, dv, color },
      ])
    );
  return {
    vitamins: mapSection(MICRO_DISPLAY.vitamins, totals.vitamins),
    minerals: mapSection(MICRO_DISPLAY.minerals, totals.minerals),
  };
}


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

  const [foodInput, setFoodInput] = useState("");
  const [nutritionData, setNutritionData] = useState(null);
  const [nutritionLoading, setNutritionLoading] = useState(false);
  const [nutritionError, setNutritionError] = useState(null);
  const [addedMsg, setAddedMsg] = useState(null);

  const handleFetch = async () => {
    if (!foodInput.trim()) return;
    setNutritionLoading(true);
    setNutritionError(null);
    setNutritionData(null);
    try {
      setNutritionData(await fetchNutrition(foodInput.trim()));
    } catch (e) {
      setNutritionError(e.message);
    } finally {
      setNutritionLoading(false);
    }
  };

  const handleNutritionAdd = async (serving_size, consumptionDate) => {
    try {
      const payload = buildMealPayload(nutritionData, serving_size, consumptionDate);
      await addItem(payload);
      setAddedMsg(`Added ${payload.food} (${payload.serving_size}g)`);
      setTimeout(() => setAddedMsg(null), 3000);
    } catch (e) {
      setNutritionError(e.message);
    }
  };

  const [mealsData, setMealsData] = useState([]);
  const [mealsLoading, setMealsLoading] = useState(false);
  const [mealsError, setMealsError] = useState(null);

  const days = [-2, -1, 0].map(o => ({ offset: o, ...getDateLabel(o) }));

  useEffect(() => {
    const dateObj = days.find(d => d.offset === dayOffset)?.dateObj;
    setMealsLoading(true);
    setMealsError(null);
    fetchMeals(dateObj)
      .then(setMealsData)
      .catch(e => setMealsError(e.message))
      .finally(() => setMealsLoading(false));
  }, [dayOffset]);

  const totals = calcTotals(mealsData);
  const calories = {
    consumed: totals ? Math.round(totals.calories) : 0,
    goal: 2200,
  };
  const macros = {
    protein: { g: totals ? Math.round(totals.macros.protein.consumed) : 0, goal: MACRO_GOALS.protein },
    carbs:   { g: totals ? Math.round(totals.macros.carbs.consumed)   : 0, goal: MACRO_GOALS.carbs   },
    fat:     { g: totals ? Math.round(totals.macros.fat.consumed)     : 0, goal: MACRO_GOALS.fat     },
    fiber:   { g: totals ? Math.round(totals.macros.fiber.consumed)   : 0, goal: MACRO_GOALS.fiber   },
  };
  const micros = buildMicros(totals ?? { vitamins: {}, minerals: {} });


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
          {["macros", "micros", "meals", "lookup"].map(tab => (
            <button key={tab} onClick={() => setActiveTab(tab)}
              style={{ flex: 1, padding: "8px 4px", borderRadius: 10, border: "none", cursor: "pointer", fontWeight: 600, fontSize: 12, textTransform: "capitalize", transition: "all 0.2s",
                background: activeTab === tab ? "linear-gradient(135deg,#7c3aed,#2563eb)" : "transparent",
                color: activeTab === tab ? "#fff" : "#6b7280" }}>
              {tab === "macros" ? "💪 Macros" : tab === "micros" ? "🔬 Micros" : tab === "meals" ? "🍽 Meals" : "🔍 Lookup"}
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
          <MealsTab items={mealsData} loading={mealsLoading} error={mealsError} />
        )}

        {/* LOOKUP TAB */}
        {activeTab === "lookup" && (
          <div style={{ background: "#111827", borderRadius: 16, padding: 16, border: "1px solid #1e293b" }}>
            <div style={{ fontSize: 12, fontWeight: 700, color: "#a78bfa", marginBottom: 12, letterSpacing: "0.05em" }}>🔍 SEARCH FOOD</div>
            <div style={{ display: "flex", gap: 8 }}>
              <input
                value={foodInput}
                onChange={e => setFoodInput(e.target.value)}
                onKeyDown={e => e.key === "Enter" && handleFetch()}
                placeholder="Enter food item..."
                style={{ flex: 1, background: "#1e293b", border: "1px solid #334155", borderRadius: 10, padding: "10px 12px", color: "#e2e8f0", fontSize: 13, outline: "none" }}
              />
              <button
                onClick={handleFetch}
                disabled={nutritionLoading}
                style={{ padding: "10px 16px", borderRadius: 10, border: "none", cursor: nutritionLoading ? "not-allowed" : "pointer", background: "linear-gradient(135deg,#7c3aed,#2563eb)", color: "#fff", fontWeight: 700, fontSize: 13, opacity: nutritionLoading ? 0.6 : 1 }}
              >
                {nutritionLoading ? "..." : "Fetch"}
              </button>
            </div>
            {nutritionError && <div style={{ marginTop: 10, fontSize: 12, color: "#f43f5e" }}>{nutritionError}</div>}
            {addedMsg && <div style={{ marginTop: 10, fontSize: 12, color: "#34d399" }}>{addedMsg}</div>}
            {nutritionData && <NutritionResult data={nutritionData} onAdd={handleNutritionAdd} />}
          </div>
        )}

      </div>
    </div>
  );
}



export default App
