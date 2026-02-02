import { Link } from "react-router-dom";
import DashboardLayout from "../../components/layout/DashboardLayout";
import BookCover from "../../components/common/BookCover";
import { useEffect, useState } from "react";
import { booksApi } from "../../api/books";
import useAuth from "../../context/useAuth";

const Inventory = () => {
  const { user } = useAuth();
  const [loading, setLoading] = useState(true);
  const [books, setBooks] = useState([]);
  const [error, setError] = useState(null);
  const [editingId, setEditingId] = useState(null);
  const [editValue, setEditValue] = useState("");
  const [saving, setSaving] = useState(false);
  const [saveError, setSaveError] = useState(null);
  const [deletingId, setDeletingId] = useState(null);
  const [deleteError, setDeleteError] = useState(null);

  useEffect(() => {
    const load = async () => {
      setLoading(true);
      setError(null);
      try {
        const res = await booksApi.list({ limit: 50 });
        setBooks(res?.data || res?.books || []);
      } catch (e) {
        setError(e?.message || "Failed to load inventory");
      } finally {
        setLoading(false);
      }
    };
    load();
  }, []);

  const handleEdit = (book) => {
    setEditingId(book._id);
    setEditValue(book.availableQuantity?.toString() || "0");
    setSaveError(null);
  };

  const handleCancel = () => {
    setEditingId(null);
    setEditValue("");
    setSaveError(null);
  };

  const handleSave = async (bookId) => {
    const newValue = parseInt(editValue, 10);
    const book = books.find((b) => b._id === bookId);

    if (isNaN(newValue) || newValue < 0) {
      setSaveError("Please enter a valid number (0 or greater)");
      return;
    }

    if (newValue > book.quantity) {
      setSaveError(`Available quantity cannot exceed total quantity (${book.quantity})`);
      return;
    }

    setSaving(true);
    setSaveError(null);

    try {
      await booksApi.update(bookId, { availableQuantity: newValue });
      
      // Update local state
      setBooks((prevBooks) =>
        prevBooks.map((b) =>
          b._id === bookId ? { ...b, availableQuantity: newValue } : b
        )
      );
      
      setEditingId(null);
      setEditValue("");
    } catch (e) {
      setSaveError(e?.message || "Failed to update available quantity");
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (bookId) => {
    const confirmDelete = window.confirm(
      "Are you sure you want to delete this book from inventory? This action cannot be undone."
    );
    if (!confirmDelete) return;

    setDeletingId(bookId);
    setDeleteError(null);

    try {
      await booksApi.delete(bookId);
      setBooks((prevBooks) => prevBooks.filter((b) => b._id !== bookId));

      if (editingId === bookId) {
        setEditingId(null);
        setEditValue("");
      }
    } catch (e) {
      setDeleteError(e?.response?.data?.message || e?.message || "Failed to delete book");
    } finally {
      setDeletingId(null);
    }
  };

  return (
    <DashboardLayout>
      <div className="flex flex-wrap justify-between items-center gap-4 mb-6">
        <h1 className="text-3xl font-bold">Inventory</h1>
        <Link
          to="/librarian/books/add"
          className="px-4 py-2 rounded-lg bg-primary hover:bg-primary/90 text-sm font-medium transition"
        >
          Add Book
        </Link>
      </div>

      {loading && <p className="text-muted">Loading...</p>}
      {error && <p className="text-red-600 dark:text-red-400">{error}</p>}

      <div className="overflow-x-auto">
        <table className="w-full border border-slate-200 dark:border-white/10 rounded-xl overflow-hidden card-theme">
          <thead className="bg-slate-100 dark:bg-white/10 text-left">
            <tr>
              <th className="p-4">Cover</th>
              <th className="p-4">Book</th>
              <th className="p-4">Available</th>
              <th className="p-4">Total</th>
              <th className="p-4">Actions</th>
            </tr>
          </thead>
          <tbody>
            {books.map((b) => (
              <tr key={b._id} className="border-t border-slate-200 dark:border-white/10 hover:bg-slate-50 dark:hover:bg-white/5">
                <td className="p-4">
                  <BookCover src={b.coverImage} title={b.title} size="sm" />
                </td>
                <td className="p-4">
                  <div>
                    <p className="font-medium">{b.title}</p>
                    <p className="text-muted text-sm">{b.author}</p>
                  </div>
                </td>
                <td className="p-4">
                  {editingId === b._id ? (
                    <div className="flex flex-col gap-2">
                      <input
                        type="number"
                        min="0"
                        max={b.quantity}
                        value={editValue}
                        onChange={(e) => setEditValue(e.target.value)}
                        className="w-24 px-3 py-1 rounded input-theme border focus:outline-none focus:ring-2 focus:ring-primary/50 focus:border-primary"
                        disabled={saving}
                        autoFocus
                      />
                      {saveError && (
                        <p className="text-red-600 dark:text-red-400 text-xs">{saveError}</p>
                      )}
                    </div>
                  ) : (
                    <span>{b.availableQuantity ?? 0}</span>
                  )}
                </td>
                <td className="p-4">{b.quantity}</td>
                <td className="p-4">
                  {editingId === b._id ? (
                    <div className="flex gap-2">
                      <button
                        onClick={() => handleSave(b._id)}
                        disabled={saving}
                        className="px-3 py-1 rounded bg-primary hover:bg-primary/80 text-sm disabled:opacity-50 disabled:cursor-not-allowed"
                      >
                        {saving ? "Saving..." : "Save"}
                      </button>
                      <button
                        onClick={handleCancel}
                        disabled={saving}
                        className="px-3 py-1 rounded bg-white/10 hover:bg-white/20 text-sm disabled:opacity-50 disabled:cursor-not-allowed"
                      >
                        Cancel
                      </button>
                    </div>
                  ) : (
                    <div className="flex gap-2">
                      <button
                        onClick={() => handleEdit(b)}
                        className="px-3 py-1 rounded bg-primary hover:bg-primary/80 text-sm"
                      >
                        Edit
                      </button>
                      {(user?.role === "admin" || user?.role === "librarian") && (
                        <button
                          onClick={() => handleDelete(b._id)}
                          disabled={deletingId === b._id}
                          className="px-3 py-1 rounded bg-red-600 hover:bg-red-700 text-sm disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                          {deletingId === b._id ? "Deleting..." : "Delete"}
                        </button>
                      )}
                    </div>
                  )}
                  {deleteError && (
                    <p className="text-red-600 dark:text-red-400 text-xs mt-2">{deleteError}</p>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </DashboardLayout>
  );
};

export default Inventory;
