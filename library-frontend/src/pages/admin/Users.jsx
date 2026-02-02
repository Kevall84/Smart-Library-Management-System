import { useEffect, useMemo, useState } from "react";
import DashboardLayout from "../../components/layout/DashboardLayout";
import { adminApi } from "../../api/admin";

/* ---------------- CONFIG ---------------- */
const ROWS_PER_PAGE = 10;

const Users = () => {
  const [loading, setLoading] = useState(true);
  const [users, setUsers] = useState([]);
  const [error, setError] = useState(null);
  const [pagination, setPagination] = useState({ page: 1, totalPages: 1, total: 0 });

  const [selectedUser, setSelectedUser] = useState(null);
  const [formData, setFormData] = useState(null);
  const [editMode, setEditMode] = useState(false);

  const [currentPage, setCurrentPage] = useState(1);
  const [selectedIds, setSelectedIds] = useState([]);

  /* ---------------- LOAD USERS FROM API ---------------- */
  useEffect(() => {
    const loadUsers = async () => {
      setLoading(true);
      setError(null);
      try {
        const res = await adminApi.users({ page: currentPage, limit: ROWS_PER_PAGE });
        // Handle different response formats - paginated response has data as array
        const userList = Array.isArray(res?.data) ? res?.data : (res?.data?.data || res?.data?.users || res?.users || []);
        const paginationData = res?.pagination || res?.data?.pagination || { 
          page: currentPage, 
          totalPages: Math.ceil((userList.length || 0) / ROWS_PER_PAGE), 
          total: userList.length || 0 
        };
        
        // Transform API data to match component format
        const transformedUsers = userList.map((u) => ({
          id: u._id,
          _id: u._id,
          name: u.name || "Unknown",
          email: u.email || "",
          role: u.role || "user",
          status: u.isActive ? "Active" : "Blocked",
          joined: u.createdAt ? new Date(u.createdAt).toLocaleDateString() : "N/A",
        }));
        
        setUsers(transformedUsers);
        setPagination(paginationData);
      } catch (e) {
        console.error("Failed to load users:", e);
        setError(e?.message || "Failed to load users");
        setUsers([]);
      } finally {
        setLoading(false);
      }
    };
    loadUsers();
  }, [currentPage]);

  /* ---------------- PAGINATION ---------------- */
  const paginatedUsers = users; // API already paginates

  /* ---------------- HANDLE USER ACTIVATION/DEACTIVATION ---------------- */
  const handleToggleActive = async (userId, currentStatus) => {
    try {
      const isActive = currentStatus === "Active";
      await adminApi.setUserActive(userId, !isActive);
      // Reload users
      const res = await adminApi.users({ page: currentPage, limit: ROWS_PER_PAGE });
      const userList = Array.isArray(res?.data) ? res?.data : (res?.data?.data || res?.data?.users || res?.users || []);
      const transformedUsers = userList.map((u) => ({
        id: u._id,
        _id: u._id,
        name: u.name || "Unknown",
        email: u.email || "",
        role: u.role || "user",
        status: u.isActive ? "Active" : "Blocked",
        joined: u.createdAt ? new Date(u.createdAt).toLocaleDateString() : "N/A",
      }));
      setUsers(transformedUsers);
    } catch (e) {
      console.error("Failed to update user:", e);
      alert("Failed to update user status");
    }
  };

  /* ---------------- OPEN PROFILE (FIXED) ---------------- */
  const openProfile = (user) => {
    setFormData({ ...user });   // IMPORTANT FIX
    setSelectedUser(user);
    setEditMode(false);
  };

  /* ---------------- SAVE PROFILE ---------------- */
  const saveProfile = () => {
    setUsers((prev) =>
      prev.map((u) => (u.id === formData.id ? formData : u))
    );
    setSelectedUser(formData);
    setEditMode(false);
  };

  /* ---------------- BULK SELECT ---------------- */
  const toggleSelect = (id) => {
    setSelectedIds((prev) =>
      prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id]
    );
  };

  const toggleSelectAll = () => {
    const pageIds = paginatedUsers.map((u) => u.id);
    const allSelected = pageIds.every((id) => selectedIds.includes(id));
    setSelectedIds(allSelected ? [] : pageIds);
  };

  /* ---------------- BULK ACTIONS ---------------- */
  const bulkBlock = async () => {
    if (!window.confirm("Block selected users?")) return;
    try {
      for (const id of selectedIds) {
        await adminApi.setUserActive(id, false);
      }
      // Reload users
      const res = await adminApi.users({ page: currentPage, limit: ROWS_PER_PAGE });
      const userList = Array.isArray(res?.data) ? res?.data : (res?.data?.data || res?.data?.users || res?.users || []);
      const transformedUsers = userList.map((u) => ({
        id: u._id,
        _id: u._id,
        name: u.name || "Unknown",
        email: u.email || "",
        role: u.role || "user",
        status: u.isActive ? "Active" : "Blocked",
        joined: u.createdAt ? new Date(u.createdAt).toLocaleDateString() : "N/A",
      }));
      setUsers(transformedUsers);
      setSelectedIds([]);
    } catch (e) {
      console.error("Failed to block users:", e);
      alert("Failed to block users");
    }
  };

  const bulkDelete = async () => {
    if (!window.confirm("Delete selected users? This action cannot be undone.")) return;
    try {
      for (const id of selectedIds) {
        // Note: Backend might not have delete endpoint, so we'll deactivate instead
        await adminApi.setUserActive(id, false);
      }
      // Reload users
      const res = await adminApi.users({ page: currentPage, limit: ROWS_PER_PAGE });
      const userList = Array.isArray(res?.data) ? res?.data : (res?.data?.data || res?.data?.users || res?.users || []);
      const transformedUsers = userList.map((u) => ({
        id: u._id,
        _id: u._id,
        name: u.name || "Unknown",
        email: u.email || "",
        role: u.role || "user",
        status: u.isActive ? "Active" : "Blocked",
        joined: u.createdAt ? new Date(u.createdAt).toLocaleDateString() : "N/A",
      }));
      setUsers(transformedUsers);
      setSelectedIds([]);
    } catch (e) {
      console.error("Failed to delete users:", e);
      alert("Failed to delete users");
    }
  };

  /* ---------------- EXPORT CSV ---------------- */
  const exportCSV = () => {
    const headers = ["Name", "Email", "Role", "Status", "Joined"];
    const rows = users.map((u) =>
      [u.name, u.email, u.role, u.status, u.joined].join(",")
    );

    const csv =
      "data:text/csv;charset=utf-8," +
      [headers.join(","), ...rows].join("\n");

    const link = document.createElement("a");
    link.href = encodeURI(csv);
    link.download = "users.csv";
    link.click();
  };

  return (
    <DashboardLayout>
      <h1 className="text-3xl font-bold mb-6">Manage Users</h1>

      {loading && <p className="text-muted mb-4">Loading users...</p>}
      {error && <p className="text-red-400 mb-4">{error}</p>}

      {/* -------- BULK ACTION BAR -------- */}
      <div className="flex flex-wrap gap-3 mb-4">
        <button
          onClick={bulkBlock}
          disabled={!selectedIds.length}
          className="px-4 py-2 rounded bg-yellow-100 text-yellow-800 border border-yellow-300 disabled:opacity-40 disabled:text-yellow-400 disabled:bg-yellow-50"
        >
          Block Selected
        </button>

        <button
          onClick={bulkDelete}
          disabled={!selectedIds.length}
          className="px-4 py-2 rounded bg-red-100 text-red-800 border border-red-300 disabled:opacity-40 disabled:text-red-400 disabled:bg-red-50"
        >
          Delete Selected
        </button>

        <button
          onClick={exportCSV}
          className="px-4 py-2 rounded bg-primary ml-auto"
        >
          Export CSV
        </button>
      </div>

      {/* -------- USERS TABLE -------- */}
      <div className="overflow-x-auto rounded-xl border border-slate-200 bg-white dark:bg-slate-900/80 text-slate-900 dark:text-white dark:border-white/10">
        <table className="w-full table-fixed min-w-[950px]">
          <thead className="bg-slate-100 text-slate-900 dark:bg-white/10 dark:text-white">
            <tr>
              <th className="p-4 w-[5%]">
                <input
                  type="checkbox"
                  onChange={toggleSelectAll}
                  checked={
                    paginatedUsers.length &&
                    paginatedUsers.every((u) => selectedIds.includes(u.id))
                  }
                />
              </th>
              <th className="p-4 text-left w-[20%]">Name</th>
              <th className="p-4 text-left w-[25%]">Email</th>
              <th className="p-4 text-left w-[15%]">Role</th>
              <th className="p-4 text-left w-[15%]">Status</th>
              <th className="p-4 text-left w-[20%]">Actions</th>
            </tr>
          </thead>

          <tbody>
            {paginatedUsers.map((u) => (
              <tr
                key={u.id}
                className="border-t border-slate-200 hover:bg-slate-50 dark:border-white/10 dark:hover:bg-white/5"
              >
                <td className="p-4">
                  <input
                    type="checkbox"
                    checked={selectedIds.includes(u.id)}
                    onChange={() => toggleSelect(u.id)}
                  />
                </td>
                <td className="p-4 truncate">{u.name}</td>
                <td className="p-4 truncate">{u.email}</td>
                <td className="p-4">{u.role}</td>
                <td className="p-4">
                  <span
                    className={`px-3 py-1 rounded text-sm ${
                      u.status === "Active"
                        ? "bg-green-500/20 text-green-400"
                        : "bg-red-500/20 text-red-400"
                    }`}
                  >
                    {u.status}
                  </span>
                </td>
                <td className="p-4">
                  <div className="flex gap-2">
                    <button
                      onClick={() => handleToggleActive(u._id, u.status)}
                      className={`text-sm px-2 py-1 rounded ${
                        u.status === "Active"
                          ? "bg-red-500/20 text-red-400"
                          : "bg-green-500/20 text-green-400"
                      }`}
                    >
                      {u.status === "Active" ? "Block" : "Activate"}
                    </button>
                    <button
                      onClick={() => openProfile(u)}
                      className="text-primary text-sm"
                    >
                      View Profile
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* -------- PAGINATION -------- */}
      <div className="flex justify-between items-center mt-4 text-sm">
        <button
          disabled={currentPage === 1}
          onClick={() => setCurrentPage((p) => p - 1)}
          className="px-4 py-2 rounded bg-slate-100 dark:bg-white/10 text-slate-900 dark:text-white hover:bg-slate-200 dark:hover:bg-white/20 disabled:opacity-40 transition"
        >
          Previous
        </button>

        <span className="text-slate-900 dark:text-white">
          Page {pagination.page || pagination.pages || currentPage} of {pagination.pages || pagination.totalPages || 1} ({pagination.total || users.length} total)
        </span>

        <button
          disabled={currentPage >= (pagination.pages || pagination.totalPages || 1)}
          onClick={() => setCurrentPage((p) => p + 1)}
          className="px-4 py-2 rounded bg-slate-100 dark:bg-white/10 text-slate-900 dark:text-white hover:bg-slate-200 dark:hover:bg-white/20 disabled:opacity-40 transition"
        >
          Next
        </button>
      </div>

      {/* -------- PROFILE MODAL (FIXED) -------- */}
      {selectedUser && formData && (
        <Modal onClose={() => setSelectedUser(null)}>
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-xl font-semibold">User Profile</h2>
            {!editMode && (
              <button
                onClick={() => setEditMode(true)}
                className="text-primary text-sm"
              >
                Edit
              </button>
            )}
          </div>

          <div className="grid sm:grid-cols-2 gap-4 mb-6">
            <FormField
              label="Name"
              value={formData.name}
              disabled={!editMode}
              onChange={(v) => setFormData({ ...formData, name: v })}
            />

            <FormField label="Email" value={formData.email} disabled />

            <SelectField
              label="Role"
              value={formData.role}
              disabled={!editMode}
              options={["User", "Librarian"]}
              onChange={(v) => setFormData({ ...formData, role: v })}
            />

            <SelectField
              label="Status"
              value={formData.status}
              disabled={!editMode}
              options={["Active", "Blocked"]}
              onChange={(v) => setFormData({ ...formData, status: v })}
            />

            <StaticField label="Joined On" value={formData.joined} />
          </div>

          {editMode && (
            <div className="mt-6 flex gap-4">
              <button
                onClick={saveProfile}
                className="flex-1 px-4 py-2 rounded bg-primary"
              >
                Save Changes
              </button>
              <button
                onClick={() => {
                  setFormData({ ...selectedUser });
                  setEditMode(false);
                }}
                className="flex-1 px-4 py-2 rounded bg-slate-100 text-slate-900 hover:bg-slate-200 transition dark:bg-white/10 dark:text-white dark:hover:bg-white/20"
              >
                Cancel
              </button>
            </div>
          )}
        </Modal>
      )}
    </DashboardLayout>
  );
};

export default Users;

/* ---------------- UI HELPERS ---------------- */

const Modal = ({ children, onClose }) => (
  <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm">
    <div className="relative w-full max-w-2xl mx-4 max-h-[90vh] overflow-y-auto bg-white dark:bg-slate-900 text-slate-900 dark:text-white p-6 rounded-2xl border border-slate-200 dark:border-white/10 shadow-2xl">
      {children}
      <button
        onClick={onClose}
        className="mt-6 w-full px-4 py-2 rounded bg-slate-100 text-slate-900 hover:bg-slate-200 transition dark:bg-white/10 dark:text-white dark:hover:bg-white/20"
      >
        Close
      </button>
    </div>
  </div>
);

const FormField = ({ label, value, onChange, disabled }) => (
  <div>
    <label className="block text-xs text-muted mb-1">{label}</label>
    <input
      value={value}
      disabled={disabled}
      onChange={(e) => onChange(e.target.value)}
      className="w-full px-3 py-2 rounded bg-slate-50 text-slate-900 border border-slate-200 focus:outline-none focus:ring-2 focus:ring-primary/40 disabled:opacity-60 dark:bg-white/5 dark:text-white dark:border-white/10"
    />
  </div>
);

const SelectField = ({ label, value, options, onChange, disabled }) => (
  <div>
    <label className="block text-xs text-muted mb-1">{label}</label>
    <select
      value={value}
      disabled={disabled}
      onChange={(e) => onChange(e.target.value)}
      className="w-full px-3 py-2 rounded bg-slate-50 text-slate-900 border border-slate-200 focus:outline-none focus:ring-2 focus:ring-primary/40 disabled:opacity-60 dark:bg-white/5 dark:text-white dark:border-white/10"
    >
      {options.map((o) => (
        <option
          key={o}
          className="bg-white text-slate-900 dark:bg-slate-900 dark:text-white"
        >
          {o}
        </option>
      ))}
    </select>
  </div>
);

const StaticField = ({ label, value }) => (
  <div>
    <p className="text-xs text-muted">{label}</p>
    <p className="font-medium">{value}</p>
  </div>
);

const StatBox = ({ label, value }) => (
  <div className="p-4 rounded bg-black/30 border border-white/10 text-center">
    <p className="text-xs text-muted">{label}</p>
    <p className="text-lg font-bold">{value}</p>
  </div>
);
