import { useMemo, useState } from "react";
import DashboardLayout from "../../components/layout/DashboardLayout";

/* ---------------- ROLE ---------------- */
const adminRole = "SUPER_ADMIN";

/* ---------------- DEFAULT SETTINGS ---------------- */
const DEFAULT_SETTINGS = {
  libraryName: "Central Library",
  contactEmail: "support@library.com",
  workingHours: "9 AM - 6 PM",

  maxBooks: 5,
  borrowDays: 14,
  gracePeriod: 2,
  allowRenewal: true,
  maxRenewals: 2,

  rentPerDay: 30,
  penaltyPerDay: 50,
  maxFine: 500,
  autoBlockDays: 10,
  allowFineWaiver: true,

  emailNotifications: true,
  overdueReminderDays: 2,
  adminFineAlert: true,

  enable2FA: false,
  sessionTimeout: 30,
  strongPasswordPolicy: true,

  enableReports: true,
  enableAnalytics: true,
  enablePayments: false,

  maintenanceMode: false,
  enableAuditLogs: true,
  enableExports: true,
};

const Settings = () => {
  const [activeTab, setActiveTab] = useState("LIBRARY");
  const [settings, setSettings] = useState(() => {
    const saved = localStorage.getItem("adminSettings");
    return saved ? JSON.parse(saved) : DEFAULT_SETTINGS;
  });
  const [savedSettings, setSavedSettings] = useState(() => {
    const saved = localStorage.getItem("adminSettings");
    return saved ? JSON.parse(saved) : DEFAULT_SETTINGS;
  });
  const [auditTrail, setAuditTrail] = useState(() => {
    const audit = localStorage.getItem("settingsAudit");
    return audit ? JSON.parse(audit) : [];
  });
  const [showReset, setShowReset] = useState(false);

  /* ---------------- DIRTY STATE ---------------- */
  const isDirty = useMemo(
    () => JSON.stringify(settings) !== JSON.stringify(savedSettings),
    [settings, savedSettings]
  );

  /* ---------------- UPDATE ---------------- */
  const update = (key, value) =>
    setSettings((prev) => ({ ...prev, [key]: value }));

  /* ---------------- SAVE (persists until admin changes again) ---------------- */
  const saveSettings = () => {
    const changes = Object.keys(settings).filter(
      (k) => settings[k] !== savedSettings[k]
    );

    const auditEntry = {
      time: new Date().toLocaleString(),
      role: adminRole,
      changes,
    };

    const updatedAudit = [auditEntry, ...auditTrail];

    localStorage.setItem("adminSettings", JSON.stringify(settings));
    localStorage.setItem("settingsAudit", JSON.stringify(updatedAudit));

    setSavedSettings(settings);
    setAuditTrail(updatedAudit);

    alert("Settings saved successfully. They will persist until you change them again.");
  };

  /* ---------------- RESET ---------------- */
  const resetDefaults = () => {
    setSettings(DEFAULT_SETTINGS);
    setSavedSettings(DEFAULT_SETTINGS);
    localStorage.removeItem("adminSettings");
    setShowReset(false);
  };

  /* ---------------- EXPORT ---------------- */
  const exportSettings = () => {
    const dataStr =
      "data:text/json;charset=utf-8," +
      encodeURIComponent(JSON.stringify(settings, null, 2));
    const link = document.createElement("a");
    link.href = dataStr;
    link.download = "library-settings.json";
    link.click();
  };

  /* ---------------- IMPORT ---------------- */
  const importSettings = (e) => {
    const file = e.target.files[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = () => {
      try {
        const imported = JSON.parse(reader.result);
        setSettings(imported);
        alert("Settings imported. Review and save.");
      } catch {
        alert("Invalid settings file");
      }
    };
    reader.readAsText(file);
  };

  return (
    <DashboardLayout>
      <h1 className="text-3xl font-bold mb-2">Admin Settings</h1>
      <p className="text-muted mb-6">System configuration & controls</p>

      {/* -------- TABS -------- */}
      <div className="flex flex-wrap gap-2 mb-6">
        {TABS.map((t) => (
          <Tab
            key={t.id}
            active={activeTab === t.id}
            onClick={() => setActiveTab(t.id)}
          >
            {t.label}
          </Tab>
        ))}
      </div>

      <div className="max-w-4xl bg-white dark:bg-slate-900/90 text-slate-900 dark:text-white border border-slate-200 dark:border-white/10 rounded-xl p-6 space-y-6 shadow-soft">

        {isDirty && (
          <div className="text-sm text-yellow-400">
            ⚠ You have unsaved changes
          </div>
        )}

        {/* -------- LIBRARY -------- */}
        {activeTab === "LIBRARY" && (
          <Section title="Library">
            <Grid>
              <Field label="Library Name" value={settings.libraryName} onChange={(v) => update("libraryName", v)} />
              <Field label="Contact Email" value={settings.contactEmail} onChange={(v) => update("contactEmail", v)} />
              <Field label="Working Hours" value={settings.workingHours} onChange={(v) => update("workingHours", v)} />
            </Grid>
          </Section>
        )}

        {/* -------- SECURITY -------- */}
        {activeTab === "SECURITY" && (
          <Section title="Security">
            <Toggle label="Enable 2FA" value={settings.enable2FA} onChange={(v) => update("enable2FA", v)} />
            <Toggle label="Strong Password Policy" value={settings.strongPasswordPolicy} onChange={(v) => update("strongPasswordPolicy", v)} />
            <NumberField label="Session Timeout (min)" value={settings.sessionTimeout} onChange={(v) => update("sessionTimeout", v)} />
          </Section>
        )}

        {/* -------- IMPORT / EXPORT -------- */}
        {activeTab === "IMPORT_EXPORT" && (
          <Section title="Import / Export Settings">
            <div className="flex flex-wrap gap-4">
              <button
                onClick={exportSettings}
                className="px-4 py-2 rounded bg-primary text-white hover:opacity-90"
              >
                Export Settings
              </button>

              <label className="px-4 py-2 rounded bg-slate-100 border border-slate-200 text-slate-900 cursor-pointer dark:bg-white/10 dark:border-white/10 dark:text-white">
                Import Settings
                <input type="file" accept=".json" hidden onChange={importSettings} />
              </label>
            </div>
          </Section>
        )}

        {/* -------- AUDIT TRAIL -------- */}
        {activeTab === "AUDIT" && (
          <Section title="Settings Change Audit Trail">
            <div className="space-y-3 max-h-64 overflow-y-auto text-sm">
              {auditTrail.length ? (
                auditTrail.map((a, i) => (
                  <div key={i} className="p-3 rounded bg-slate-100 dark:bg-white/5 border border-slate-200 dark:border-white/10 text-slate-900 dark:text-white">
                    <p className="font-medium">{a.time}</p>
                    <p className="text-muted">Role: {a.role}</p>
                    <p className="text-xs">Changed: {a.changes.join(", ")}</p>
                  </div>
                ))
              ) : (
                <p className="text-muted">No changes recorded yet.</p>
              )}
            </div>
          </Section>
        )}

        {/* -------- ACTION BAR -------- */}
        <div className="sticky bottom-0 bg-slate-100 dark:bg-slate-900/95 border border-slate-200 dark:border-white/10 p-4 rounded-xl flex gap-4 justify-end">
          <button
            onClick={() => setShowReset(true)}
            className="px-4 py-2 rounded bg-red-500/10 text-red-600 hover:bg-red-500/20 dark:bg-red-500/20 dark:text-red-400"
          >
            Reset Defaults
          </button>
          <button
            disabled={!isDirty}
            onClick={saveSettings}
            className="px-6 py-2 rounded bg-primary text-white hover:opacity-90 disabled:opacity-40"
          >
            Save Changes
          </button>
        </div>
      </div>

      {/* -------- RESET MODAL -------- */}
      {showReset && (
        <Modal onClose={() => setShowReset(false)}>
          <h2 className="text-xl font-semibold mb-3">Reset Settings?</h2>
          <p className="text-sm text-muted mb-6">
            All settings will revert to defaults.
          </p>
          <button onClick={resetDefaults} className="w-full px-4 py-2 rounded bg-red-500 text-black">
            Confirm Reset
          </button>
        </Modal>
      )}
    </DashboardLayout>
  );
};

export default Settings;

/* ---------------- UI HELPERS ---------------- */

const TABS = [
  { id: "LIBRARY", label: "Library" },
  { id: "SECURITY", label: "Security" },
  { id: "IMPORT_EXPORT", label: "Import / Export" },
  { id: "AUDIT", label: "Audit Trail" },
];

const Tab = ({ active, children, ...props }) => (
  <button
    {...props}
    className={`px-4 py-2 rounded transition ${
      active
        ? "bg-primary text-white"
        : "bg-slate-100 border border-slate-200 text-slate-900 dark:bg-white/5 dark:border-white/10 dark:text-white"
    }`}
  >
    {children}
  </button>
);

const Section = ({ title, children }) => (
  <div className="space-y-4">
    <h2 className="text-lg font-semibold text-slate-900 dark:text-white">{title}</h2>
    {children}
  </div>
);

const Grid = ({ children }) => (
  <div className="grid md:grid-cols-2 gap-4">{children}</div>
);

const Field = ({ label, value, onChange }) => (
  <div>
    <label className="block text-sm mb-1 text-slate-700 dark:text-slate-200">{label}</label>
    <input
      value={value}
      onChange={(e) => onChange(e.target.value)}
      className="w-full px-4 py-2 rounded bg-slate-50 dark:bg-slate-800/80 text-slate-900 dark:text-white border border-slate-200 dark:border-white/10 focus:outline-none focus:ring-2 focus:ring-primary/40"
    />
  </div>
);

const NumberField = ({ label, value, onChange }) => (
  <Field label={label} value={value} onChange={(v) => onChange(Number(v))} />
);

const Toggle = ({ label, value, onChange }) => (
  <div className="flex justify-between items-center text-slate-900 dark:text-white">
    <span>{label}</span>
    <input type="checkbox" checked={value} onChange={(e) => onChange(e.target.checked)} className="rounded text-primary focus:ring-primary" />
  </div>
);

const Modal = ({ children, onClose }) => (
  <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm">
    <div className="bg-white text-slate-900 p-6 rounded-2xl w-full max-w-md border border-slate-200 shadow-soft dark:bg-gray-900 dark:text-white dark:border-white/10">
      {children}
      <button
        onClick={onClose}
        className="mt-4 w-full px-4 py-2 rounded bg-slate-100 text-slate-900 hover:bg-slate-200 transition dark:bg-white/10 dark:text-white dark:hover:bg-white/20"
      >
        Close
      </button>
    </div>
  </div>
);