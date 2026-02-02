import { useEffect, useMemo, useState } from "react";
import DashboardLayout from "../../components/layout/DashboardLayout";
import { adminApi } from "../../api/admin";

/* ---------------- MAIN COMPONENT ---------------- */
const AuditLogs = () => {
  const [logs, setLogs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [search, setSearch] = useState("");
  const [roleFilter, setRoleFilter] = useState("ALL");
  const [levelFilter, setLevelFilter] = useState("ALL");
  const [selectedLog, setSelectedLog] = useState(null);

  useEffect(() => {
    const load = async () => {
      setLoading(true);
      setError(null);
      try {
        const res = await adminApi.auditLogs({ limit: 50 });
        // Handle paginated response
        const logList = Array.isArray(res?.data) ? res?.data : (res?.data?.data || res?.logs || []);
        setLogs(logList);
      } catch (e) {
        setError(e?.message || "Failed to load audit logs");
        setLogs([]);
      } finally {
        setLoading(false);
      }
    };
    load();
  }, []);

  /* -------- FILTERED LOGS -------- */
  const filteredLogs = useMemo(() => {
    return logs.filter((log) => {
      const userRole = log.user?.role || log.userRole || "";
      const status = log.status || "SUCCESS";
      
      const matchesSearch =
        (log.user?.name || log.user?.email || "").toLowerCase().includes(search.toLowerCase()) ||
        (log.action || "").toLowerCase().includes(search.toLowerCase()) ||
        (log.resource || "").toLowerCase().includes(search.toLowerCase());

      const matchesRole =
        roleFilter === "ALL" || userRole.toUpperCase() === roleFilter;

      const matchesLevel =
        levelFilter === "ALL" || status.toUpperCase() === levelFilter;

      return matchesSearch && matchesRole && matchesLevel;
    });
  }, [search, roleFilter, levelFilter, logs]);

  /* -------- EXPORT CSV -------- */
  const exportCSV = () => {
    const headers = [
      "User",
      "Role",
      "Status",
      "Action",
      "Resource",
      "Endpoint",
      "Time",
    ];

    const escapeCsv = (value) => {
      const str = String(value ?? "");
      if (/[",\n]/.test(str)) {
        return `"${str.replace(/"/g, '""')}"`;
      }
      return str;
    };

    const rows = filteredLogs.map((log) => {
      const user = log.user?.name || log.user?.email || "";
      const role = (log.user?.role || log.userRole || "").toUpperCase();
      const status = (log.status || "SUCCESS").toUpperCase();
      const action = log.action || "";
      const resource = log.resource || "";
      const endpoint = log.endpoint || "";
      const time = log.createdAt
        ? new Date(log.createdAt).toISOString()
        : "";

      return [
        user,
        role,
        status,
        action,
        resource,
        endpoint,
        time,
      ].map(escapeCsv).join(",");
    });

    const csvContent =
      "data:text/csv;charset=utf-8," +
      [headers.join(","), ...rows].join("\n");

    const link = document.createElement("a");
    link.href = encodeURI(csvContent);
    link.download = "audit_logs.csv";
    link.click();
  };

  return (
    <DashboardLayout>
      <h1 className="text-3xl font-bold mb-6">Audit Logs</h1>

      {loading && <p className="text-muted">Loading...</p>}
      {error && <p className="text-red-400">{error}</p>}

      {/* -------- CONTROLS -------- */}
      <div className="flex flex-wrap gap-4 mb-6">
        <input
          type="text"
          placeholder="Search logs..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="px-4 py-2 rounded input-theme border text-slate-900 dark:text-white placeholder-slate-500 dark:placeholder-slate-400"
        />

        <select
          value={roleFilter}
          onChange={(e) => setRoleFilter(e.target.value)}
          className="px-4 py-2 rounded input-theme border text-slate-900 dark:text-white"
        >
          <option value="ALL">All Roles</option>
          <option value="ADMIN">Admin</option>
          <option value="LIBRARIAN">Librarian</option>
          <option value="USER">User</option>
        </select>

        <select
          value={levelFilter}
          onChange={(e) => setLevelFilter(e.target.value)}
          className="px-4 py-2 rounded input-theme border text-slate-900 dark:text-white"
        >
          <option value="ALL">All Status</option>
          <option value="SUCCESS">Success</option>
          <option value="FAILURE">Failure</option>
          <option value="ERROR">Error</option>
        </select>

        <button
          onClick={exportCSV}
          className="px-4 py-2 rounded bg-primary"
        >
          Export CSV
        </button>
      </div>

      {/* -------- LOG LIST -------- */}
      <div className="space-y-4 max-w-4xl">
        {filteredLogs.map((log) => (
          <div
            key={log._id}
            onClick={() => setSelectedLog(log)}
            className="p-4 rounded-xl bg-white dark:bg-slate-900/80 border border-slate-200 dark:border-white/10 cursor-pointer hover:bg-slate-50 dark:hover:bg-white/10 transition text-slate-900 dark:text-white"
          >
            <div className="flex justify-between items-center">
              <div>
                <p className="font-semibold">
                  {log.action} • {log.resource}
                </p>
                <p className="text-sm text-muted">
                  {(log.user?.name || "—")} • {new Date(log.createdAt).toLocaleString()}
                </p>
              </div>

              <div className="flex gap-2">
                <Badge text={(log.user?.role || log.userRole || "").toUpperCase()} />
                <LevelBadge level={(log.status || "SUCCESS").toUpperCase()} />
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* -------- DETAILS MODAL -------- */}
      {selectedLog && (
        <Modal onClose={() => setSelectedLog(null)}>
          <h2 className="text-xl font-semibold mb-4 text-slate-900 dark:text-white">
            Audit Log Details
          </h2>

          <Detail label="User" value={selectedLog.user?.name || selectedLog.user?.email || "—"} />
          <Detail label="Role" value={(selectedLog.user?.role || selectedLog.userRole || "").toUpperCase()} />
          <Detail label="Status" value={(selectedLog.status || "SUCCESS").toUpperCase()} />
          <Detail label="Action" value={selectedLog.action} />
          <Detail label="Resource" value={selectedLog.resource} />
          <Detail label="Endpoint" value={selectedLog.endpoint} />
          <Detail label="Time" value={new Date(selectedLog.createdAt).toLocaleString()} />
        </Modal>
      )}
    </DashboardLayout>
  );
};

export default AuditLogs;

/* ---------------- SMALL COMPONENTS ---------------- */

const Badge = ({ text }) => (
  <span className="px-3 py-1 rounded bg-slate-100 text-xs text-slate-800 dark:bg-white/10 dark:text-white">
    {text}
  </span>
);

const LevelBadge = ({ level }) => {
  const colors = {
    SUCCESS: "bg-green-500/20 text-green-400",
    FAILURE: "bg-yellow-500/20 text-yellow-400",
    ERROR: "bg-red-500/20 text-red-400",
  };

  return (
    <span className={`px-3 py-1 rounded text-xs ${colors[level]}`}>
      {level}
    </span>
  );
};

const Modal = ({ children, onClose }) => (
  <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50 backdrop-blur-sm">
    <div className="bg-white dark:bg-slate-900 p-6 rounded-xl w-full max-w-md border border-slate-200 dark:border-white/10 text-slate-900 dark:text-white shadow-2xl">
      {children}
      <button
        onClick={onClose}
        className="mt-6 px-4 py-2 rounded bg-slate-100 dark:bg-white/10 text-slate-900 dark:text-white hover:bg-slate-200 dark:hover:bg-white/20 w-full transition"
      >
        Close
      </button>
    </div>
  </div>
);

const Detail = ({ label, value }) => (
  <div className="mb-2">
    <p className="text-sm text-muted">{label}</p>
    <p className="font-medium text-slate-900 dark:text-white">{value}</p>
  </div>
);