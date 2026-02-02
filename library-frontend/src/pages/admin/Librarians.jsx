import { useState, useMemo, useEffect } from "react";
import DashboardLayout from "../../components/layout/DashboardLayout";
import { adminApi } from "../../api/admin";

/* ---------------- MAIN COMPONENT ---------------- */
const Librarians = () => {
  const [loading, setLoading] = useState(true);
  const [librarians, setLibrarians] = useState([]);
  const [error, setError] = useState(null);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("ALL");

  const [selected, setSelected] = useState(null);
  const [showForm, setShowForm] = useState(false);

  /* -------- LOAD LIBRARIANS FROM API -------- */
  useEffect(() => {
    const loadLibrarians = async () => {
      setLoading(true);
      setError(null);
      try {
        const res = await adminApi.users({ role: "librarian", limit: 100 });
        const userList = res?.data || res?.users || [];
        
        // Transform API data
        const transformedLibrarians = userList.map((u) => ({
          id: u._id,
          _id: u._id,
          name: u.name || "Unknown",
          email: u.email || "",
          status: u.isActive ? "ACTIVE" : "INACTIVE",
        }));
        
        setLibrarians(transformedLibrarians);
      } catch (e) {
        console.error("Failed to load librarians:", e);
        setError(e?.message || "Failed to load librarians");
        setLibrarians([]);
      } finally {
        setLoading(false);
      }
    };
    loadLibrarians();
  }, []);

  /* -------- SEARCH & FILTER -------- */
  const filtered = useMemo(() => {
    return librarians.filter((l) => {
      const matchesSearch =
        l.name.toLowerCase().includes(search.toLowerCase()) ||
        l.email.toLowerCase().includes(search.toLowerCase());

      const matchesStatus =
        statusFilter === "ALL" || l.status === statusFilter;

      return matchesSearch && matchesStatus;
    });
  }, [search, statusFilter, librarians]);

  /* -------- SAVE LIBRARIAN -------- */
  const saveLibrarian = async (data) => {
    try {
      if (data._id) {
        // Update existing librarian
        await adminApi.setUserActive(data._id, data.status === "ACTIVE");
        // Reload librarians
        const res = await adminApi.users({ role: "librarian", limit: 100 });
        const userList = res?.data || res?.users || [];
        const transformedLibrarians = userList.map((u) => ({
          id: u._id,
          _id: u._id,
          name: u.name || "Unknown",
          email: u.email || "",
          status: u.isActive ? "ACTIVE" : "INACTIVE",
        }));
        setLibrarians(transformedLibrarians);
      } else {
        // Create new librarian
        await adminApi.createStaff({
          name: data.name,
          email: data.email,
          password: data.password || "temp123456",
          role: "librarian",
        });
        // Reload librarians
        const res = await adminApi.users({ role: "librarian", limit: 100 });
        const userList = res?.data || res?.users || [];
        const transformedLibrarians = userList.map((u) => ({
          id: u._id,
          _id: u._id,
          name: u.name || "Unknown",
          email: u.email || "",
          status: u.isActive ? "ACTIVE" : "INACTIVE",
        }));
        setLibrarians(transformedLibrarians);
      }
      setShowForm(false);
      setSelected(null);
    } catch (e) {
      console.error("Failed to save librarian:", e);
      alert("Failed to save librarian: " + (e?.message || "Unknown error"));
    }
  };

  /* -------- TOGGLE STATUS -------- */
  const toggleStatus = async (id) => {
    try {
      const librarian = librarians.find((l) => l._id === id);
      if (!librarian) return;
      
      const newStatus = librarian.status === "ACTIVE" ? false : true;
      await adminApi.setUserActive(id, newStatus);
      
      // Reload librarians
      const res = await adminApi.users({ role: "librarian", limit: 100 });
      const userList = res?.data || res?.users || [];
      const transformedLibrarians = userList.map((u) => ({
        id: u._id,
        _id: u._id,
        name: u.name || "Unknown",
        email: u.email || "",
        status: u.isActive ? "ACTIVE" : "INACTIVE",
        section: "General",
        permissions: ["ISSUE", "RETURN"],
        stats: { issued: 0, returned: 0, penalty: 0 },
        activity: [],
      }));
      setLibrarians(transformedLibrarians);
    } catch (e) {
      console.error("Failed to toggle status:", e);
      alert("Failed to update librarian status");
    }
  };

  return (
    <DashboardLayout>
      <h1 className="text-3xl font-bold mb-6">Manage Librarians</h1>

      {loading && <p className="text-muted mb-4">Loading librarians...</p>}
      {error && <p className="text-red-600 dark:text-red-400 mb-4">{error}</p>}

      {/* -------- CONTROLS -------- */}
      <div className="flex flex-wrap gap-4 mb-6">
        <input
          placeholder="Search librarian..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="px-4 py-2 rounded input-theme border text-slate-900 dark:text-white placeholder-slate-500 dark:placeholder-slate-400"
        />

        <select
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value)}
          className="px-4 py-2 rounded input-theme border text-slate-900 dark:text-white"
        >
          <option value="ALL">All Status</option>
          <option value="ACTIVE">Active</option>
          <option value="INACTIVE">Inactive</option>
        </select>

        <button
          onClick={() => setShowForm(true)}
          className="px-4 py-2 rounded bg-primary"
        >
          + Add Librarian
        </button>
      </div>

      {/* -------- TABLE -------- */}
      <div className="overflow-x-auto rounded-xl border border-slate-200 dark:border-white/10 card-theme">
        <table className="w-full min-w-[900px]">
          <thead className="bg-slate-100 dark:bg-white/10">
            <tr>
              <th className="p-4 text-left">Name</th>
              <th className="p-4 text-left">Email</th>
              <th className="p-4 text-left">Status</th>
              <th className="p-4 text-left">Actions</th>
            </tr>
          </thead>

          <tbody>
            {filtered.map((l) => (
              <tr key={l.id} className="border-t border-slate-200 dark:border-white/10 hover:bg-slate-50 dark:hover:bg-white/5">
                <td className="p-4">
                  <p className="font-medium">{l.name}</p>
                </td>

                <td className="p-4">
                  <p className="text-sm text-muted">{l.email}</p>
                </td>

                <td className="p-4">
                  <span
                    className={`px-3 py-1 rounded text-xs font-medium ${
                      l.status === "ACTIVE"
                        ? "bg-green-100 text-green-700 dark:bg-green-500/20 dark:text-green-400"
                        : "bg-red-100 text-red-700 dark:bg-red-500/20 dark:text-red-400"
                    }`}
                  >
                    {l.status}
                  </span>
                </td>

                <td className="p-4 flex flex-wrap gap-2">
                  <button
                    onClick={() => {
                      setSelected(l);
                      setShowForm(true);
                    }}
                    className="px-3 py-1 rounded bg-slate-100 dark:bg-white/10 text-slate-700 dark:text-white text-sm hover:bg-slate-200 dark:hover:bg-white/20"
                  >
                    Edit
                  </button>

                  <button
                    onClick={() => toggleStatus(l.id)}
                    className={`px-3 py-1 rounded text-sm font-medium ${
                      l.status === "ACTIVE"
                        ? "bg-red-100 text-red-700 hover:bg-red-200 dark:bg-red-500/20 dark:text-red-400 dark:hover:bg-red-500/30"
                        : "bg-green-100 text-green-700 hover:bg-green-200 dark:bg-green-500/20 dark:text-green-400 dark:hover:bg-green-500/30"
                    }`}
                  >
                    {l.status === "ACTIVE" ? "Deactivate" : "Activate"}
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* -------- MODALS -------- */}
      {showForm && (
        <LibrarianForm
          data={selected}
          onClose={() => {
            setShowForm(false);
            setSelected(null);
          }}
          onSave={saveLibrarian}
        />
      )}
    </DashboardLayout>
  );
};

export default Librarians;

/* ---------------- FORM MODAL ---------------- */

const LibrarianForm = ({ data, onSave, onClose }) => {
  const [form, setForm] = useState(
    data || {
      name: "",
      email: "",
      password: "",
      status: "ACTIVE",
    }
  );

  return (
    <Modal onClose={onClose}>
      <h2 className="text-xl font-semibold mb-4">
        {data ? "Edit Librarian" : "Add Librarian"}
      </h2>

      <Input 
        label="Name" 
        value={form.name} 
        onChange={(v) => setForm({ ...form, name: v })} 
        disabled={!!data}
      />
      <Input 
        label="Email" 
        value={form.email} 
        onChange={(v) => setForm({ ...form, email: v })} 
        disabled={!!data}
      />
      {!data && (
        <Input 
          label="Password" 
          type="password"
          value={form.password} 
          onChange={(v) => setForm({ ...form, password: v })} 
        />
      )}

      <button
        onClick={() => onSave({ ...form, _id: data?._id })}
        className="mt-4 w-full px-4 py-2 rounded bg-primary text-white hover:opacity-90 transition"
      >
        {data ? "Update" : "Create"}
      </button>
    </Modal>
  );
};


/* ---------------- UI HELPERS ---------------- */

const Modal = ({ children, onClose }) => (
  <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm">
    <div className="relative w-full max-w-md mx-4 max-h-[90vh] overflow-y-auto card-theme border p-6 rounded-2xl shadow-2xl">
      {children}
      <button
        onClick={onClose}
        className="mt-6 w-full px-4 py-2 rounded bg-slate-100 dark:bg-white/10 text-slate-900 dark:text-white hover:bg-slate-200 dark:hover:bg-white/20 transition"
      >
        Close
      </button>
    </div>
  </div>
);

const Input = ({ label, value, onChange, disabled, type = "text" }) => (
  <div className="mb-3">
    <label className="block mb-1 text-sm font-medium text-slate-700 dark:text-muted">{label}</label>
    <input
      type={type}
      value={value}
      onChange={(e) => onChange(e.target.value)}
      disabled={disabled}
      className="w-full px-3 py-2 rounded input-theme border focus:outline-none focus:ring-2 focus:ring-primary/40 disabled:opacity-60"
    />
  </div>
);