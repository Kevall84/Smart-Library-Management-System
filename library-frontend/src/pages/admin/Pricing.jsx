import { useEffect, useState } from "react";
import DashboardLayout from "../../components/layout/DashboardLayout";
import { adminApi } from "../../api/admin";

/* ---------------- INITIAL RULES ---------------- */
const INITIAL_RULES = {
  STUDENT: {
    rentPerDay: 20,
    penaltyPerDay: 10,
    graceDays: 2,
    maxBooks: 3,
    maxDays: 14,
    fineCap: 500,
  },
  FACULTY: {
    rentPerDay: 10,
    penaltyPerDay: 5,
    graceDays: 5,
    maxBooks: 5,
    maxDays: 30,
    fineCap: 300,
  },
  EXTERNAL: {
    rentPerDay: 40,
    penaltyPerDay: 20,
    graceDays: 0,
    maxBooks: 2,
    maxDays: 7,
    fineCap: 800,
  },
};

const Pricing = () => {
  const [role, setRole] = useState("STUDENT");
  const [rules, setRules] = useState(INITIAL_RULES);
  const [history, setHistory] = useState([]);
  const [simulation, setSimulation] = useState({
    daysLate: "",
    result: null,
  });
  const [backendPricing, setBackendPricing] = useState(null);
  const [loading, setLoading] = useState(true);

  const current = rules[role];

  useEffect(() => {
    const load = async () => {
      setLoading(true);
      try {
        const res = await adminApi.pricing();
        setBackendPricing(res?.data?.pricing || res?.pricing || null);
      } catch {
        setBackendPricing(null);
      } finally {
        setLoading(false);
      }
    };
    load();
  }, []);

  const updateRule = (field, value) => {
    setRules({
      ...rules,
      [role]: {
        ...rules[role],
        [field]: Number(value),
      },
    });
  };

  const saveRules = () => {
    setHistory([
      {
        role,
        time: new Date().toLocaleString(),
        rules: { ...current },
      },
      ...history,
    ]);
    alert("Pricing rules saved successfully");
  };

  const simulateFine = () => {
    const lateDays = Math.max(
      simulation.daysLate - current.graceDays,
      0
    );
    let fine = lateDays * current.penaltyPerDay;
    if (fine > current.fineCap) fine = current.fineCap;

    setSimulation({ ...simulation, result: fine });
  };

  return (
    <DashboardLayout>
      <h1 className="text-3xl font-bold mb-8">Pricing & Rules</h1>

      {/* -------- RULE FORM -------- */}
      <Section title="Pricing Rules">
        <div className="mb-5">
          <label className="block mb-2 text-sm text-slate-700 dark:text-slate-200">User Role</label>
          <select
            value={role}
            onChange={(e) => setRole(e.target.value)}
            className="w-full px-4 py-2 rounded input-theme border text-slate-900 dark:text-white"
          >
            <option value="STUDENT">Student</option>
            <option value="FACULTY">Faculty</option>
            <option value="EXTERNAL">External</option>
          </select>
          <p className="mt-2 text-xs text-muted">
            Tip: Adjust pricing rules per role and save to add an audit entry.
          </p>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <RuleInput label="Rent per day (₹)" value={current.rentPerDay} onChange={(v) => updateRule("rentPerDay", v)} />
          <RuleInput label="Penalty per day (₹)" value={current.penaltyPerDay} onChange={(v) => updateRule("penaltyPerDay", v)} />
          <RuleInput label="Grace period (days)" value={current.graceDays} onChange={(v) => updateRule("graceDays", v)} />
          <RuleInput label="Max books allowed" value={current.maxBooks} onChange={(v) => updateRule("maxBooks", v)} />
          <RuleInput label="Max rental days" value={current.maxDays} onChange={(v) => updateRule("maxDays", v)} />
          <RuleInput label="Fine cap (₹)" value={current.fineCap} onChange={(v) => updateRule("fineCap", v)} />
        </div>

        <button
          onClick={saveRules}
          className="mt-6 w-full sm:w-auto px-6 py-2 rounded bg-primary"
        >
          Save Rules
        </button>
      </Section>

      {/* -------- SIMULATION -------- */}
      <Section title="Rule Simulation">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <RuleInput
            label="Days late"
            value={simulation.daysLate}
            onChange={(v) => setSimulation({ ...simulation, daysLate: v })}
          />
        </div>

        <button
          onClick={simulateFine}
          className="mt-4 w-full sm:w-auto px-4 py-2 rounded bg-slate-100 dark:bg-white/10 text-slate-900 dark:text-white hover:bg-slate-200 dark:hover:bg-white/20 transition"
        >
          Calculate Fine
        </button>

        {simulation.result !== null && (
          <p className="mt-3 text-green-400">
            Calculated Fine: ₹{simulation.result}
          </p>
        )}
      </Section>

      {/* -------- HISTORY -------- */}
      <Section title="Rule History (Audit)">
        {history.length === 0 && (
          <p className="text-muted text-sm">No changes yet.</p>
        )}

        <div className="space-y-3">
          {history.map((h, i) => (
            <div
              key={i}
              className="p-4 rounded bg-slate-100 dark:bg-white/5 border border-slate-200 dark:border-white/10 text-slate-900 dark:text-white"
            >
              <p className="font-semibold">{h.role} Rules Updated</p>
              <p className="text-xs text-muted">{h.time}</p>
              <p className="text-sm mt-1">
                Rent ₹{h.rules.rentPerDay} | Penalty ₹{h.rules.penaltyPerDay}
              </p>
            </div>
          ))}
        </div>
      </Section>
    </DashboardLayout>
  );
};

export default Pricing;

/* ---------------- REUSABLE COMPONENTS ---------------- */

const Section = ({ title, children }) => (
  <div className="mb-10 max-w-4xl">
    {title && <h2 className="text-xl font-semibold mb-4 text-slate-900 dark:text-white">{title}</h2>}
    <div className="p-5 rounded-xl card-theme border text-slate-900 dark:text-white">
      {children}
    </div>
  </div>
);

const RuleInput = ({ label, value, onChange }) => (
  <div>
    <label className="block mb-1 text-sm text-slate-700 dark:text-slate-200">{label}</label>
    <input
      type="number"
      value={value}
      onChange={(e) => onChange(e.target.value)}
      className="w-full px-4 py-2 rounded input-theme border text-slate-900 dark:text-white"
    />
  </div>
);