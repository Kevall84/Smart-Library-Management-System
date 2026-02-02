import { useState } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import DashboardLayout from "../../components/layout/DashboardLayout";
import { booksApi } from "../../api/books";
import BookCover from "../../components/common/BookCover";

const AddBook = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const isLibrarian = location.pathname.startsWith("/librarian");

  const [saving, setSaving] = useState(false);
  const [error, setError] = useState(null);
  const [form, setForm] = useState({
    title: "",
    author: "",
    category: "",
    quantity: "",
    rentPerDay: "",
    isbn: "",
    description: "",
    coverImage: "",
    isBestseller: false,
    publishedYear: "",
    publisher: "",
    language: "English",
  });

  const backTo = isLibrarian ? "/librarian/inventory" : "/admin/dashboard";
  const backLabel = isLibrarian ? "Inventory" : "Admin Overview";

  const update = (field, value) => {
    setForm((prev) => ({ ...prev, [field]: value }));
    setError(null);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(null);

    const title = form.title.trim();
    const author = form.author.trim();
    const category = form.category.trim();
    const quantity = parseInt(form.quantity, 10);
    const rentPerDay = parseFloat(form.rentPerDay);

    if (!title || !author || !category) {
      setError("Title, author, and category are required.");
      return;
    }
    const coverImage = form.coverImage?.trim();
    if (!coverImage) {
      setError("Cover image URL is required. Every book should have a cover picture.");
      return;
    }
    if (isNaN(quantity) || quantity < 0) {
      setError("Quantity must be 0 or greater.");
      return;
    }
    if (isNaN(rentPerDay) || rentPerDay < 0) {
      setError("Rent per day must be 0 or greater.");
      return;
    }

    const payload = {
      title,
      author,
      category,
      quantity,
      rentPerDay,
    };

    if (form.isbn?.trim()) payload.isbn = form.isbn.trim();
    if (form.description?.trim()) payload.description = form.description.trim();
    payload.coverImage = coverImage;
    if (form.isBestseller) payload.isBestseller = true;
    const year = parseInt(form.publishedYear, 10);
    if (!isNaN(year) && year >= 1000 && year <= new Date().getFullYear()) {
      payload.publishedYear = year;
    }
    if (form.publisher?.trim()) payload.publisher = form.publisher.trim();
    if (form.language?.trim()) payload.language = form.language.trim();

    setSaving(true);
    try {
      await booksApi.create(payload);
      navigate(backTo);
    } catch (err) {
      setError(err?.message || "Failed to add book.");
    } finally {
      setSaving(false);
    }
  };

  return (
    <DashboardLayout>
      <button
        onClick={() => navigate(backTo)}
        className="mb-6 text-sm text-primary hover:underline"
      >
        ← Back to {backLabel}
      </button>

      <h1 className="text-3xl font-bold mb-2">Add New Book</h1>
      <p className="text-muted mb-8">
        Add a book to the offline store. Every book must have a cover image. It will appear for users in Offline Library.
      </p>

      {error && (
        <div className="mb-6 p-4 rounded-lg bg-red-50 dark:bg-red-500/10 border border-red-200 dark:border-red-500/20 text-red-600 dark:text-red-400">
          {error}
        </div>
      )}

      <form onSubmit={handleSubmit} className="max-w-2xl space-y-6">
        <div className="grid sm:grid-cols-2 gap-6">
          <div>
            <label className="block text-sm font-medium mb-2">Title *</label>
            <input
              type="text"
              value={form.title}
              onChange={(e) => update("title", e.target.value)}
              className="w-full px-4 py-2 rounded-lg input-theme border focus:outline-none focus:ring-2 focus:ring-primary/50 focus:border-primary"
              placeholder="Book title"
              required
            />
          </div>
          <div>
            <label className="block text-sm font-medium mb-2">Author *</label>
            <input
              type="text"
              value={form.author}
              onChange={(e) => update("author", e.target.value)}
              className="w-full px-4 py-2 rounded-lg input-theme border focus:outline-none focus:ring-2 focus:ring-primary/50 focus:border-primary"
              placeholder="Author name"
              required
            />
          </div>
        </div>

        <div className="grid sm:grid-cols-2 gap-6">
          <div>
            <label className="block text-sm font-medium mb-2">Category *</label>
            <input
              type="text"
              value={form.category}
              onChange={(e) => update("category", e.target.value)}
              className="w-full px-4 py-2 rounded-lg input-theme border focus:outline-none focus:ring-2 focus:ring-primary/50 focus:border-primary"
              placeholder="e.g. Fiction, Science"
              required
            />
          </div>
          <div>
            <label className="block text-sm font-medium mb-2">ISBN</label>
            <input
              type="text"
              value={form.isbn}
              onChange={(e) => update("isbn", e.target.value)}
              className="w-full px-4 py-2 rounded-lg input-theme border focus:outline-none focus:ring-2 focus:ring-primary/50 focus:border-primary"
              placeholder="Optional"
            />
          </div>
        </div>

        <div className="grid sm:grid-cols-2 gap-6">
          <div>
            <label className="block text-sm font-medium mb-2">Quantity *</label>
            <input
              type="number"
              min="0"
              value={form.quantity}
              onChange={(e) => update("quantity", e.target.value)}
              className="w-full px-4 py-2 rounded-lg input-theme border focus:outline-none focus:ring-2 focus:ring-primary/50 focus:border-primary"
              placeholder="0"
              required
            />
          </div>
          <div>
            <label className="block text-sm font-medium mb-2">Rent per day (₹) *</label>
            <input
              type="number"
              min="0"
              step="0.01"
              value={form.rentPerDay}
              onChange={(e) => update("rentPerDay", e.target.value)}
              className="w-full px-4 py-2 rounded-lg input-theme border focus:outline-none focus:ring-2 focus:ring-primary/50 focus:border-primary"
              placeholder="0"
              required
            />
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium mb-2">Description</label>
            <textarea
            value={form.description}
            onChange={(e) => update("description", e.target.value)}
            rows={3}
            className="w-full px-4 py-2 rounded-lg input-theme border focus:outline-none focus:ring-2 focus:ring-primary/50 focus:border-primary resize-none"
            placeholder="Brief description (optional)"
          />
        </div>

        <div className="grid sm:grid-cols-2 gap-6">
          <div>
            <label className="block text-sm font-medium mb-2">Cover image URL *</label>
            <input
              type="url"
              value={form.coverImage}
              onChange={(e) => update("coverImage", e.target.value)}
              className="w-full px-4 py-2 rounded-lg input-theme border focus:outline-none focus:ring-2 focus:ring-primary/50 focus:border-primary"
              placeholder="https://example.com/cover.jpg"
              required
            />
            <p className="text-muted text-xs mt-1">
              Required. Use a direct link to the book cover image (URL ending with .jpg, .jpeg, .png, etc.).
            </p>
          </div>
          <div className="flex flex-col items-start gap-3">
            <label className="block text-sm font-medium">Preview</label>
            <BookCover
              src={form.coverImage?.trim() || ""}
              title={form.title || "Preview"}
              size="sm"
            />
            <p className="text-muted text-xs">
              If you see only a letter here, the URL is not a valid direct image link.
            </p>
            <label className="block text-sm font-medium mt-2">Language</label>
            <input
              type="text"
              value={form.language}
              onChange={(e) => update("language", e.target.value)}
              className="w-full px-4 py-2 rounded-lg input-theme border focus:outline-none focus:ring-2 focus:ring-primary/50 focus:border-primary"
              placeholder="English"
            />
          </div>
        </div>

        <div className="grid sm:grid-cols-2 gap-6">
          <div>
            <label className="block text-sm font-medium mb-2">Publisher</label>
            <input
              type="text"
              value={form.publisher}
              onChange={(e) => update("publisher", e.target.value)}
              className="w-full px-4 py-2 rounded-lg input-theme border focus:outline-none focus:ring-2 focus:ring-primary/50 focus:border-primary"
              placeholder="Optional"
            />
          </div>
          <div>
            <label className="block text-sm font-medium mb-2">Published year</label>
            <input
              type="number"
              min="1000"
              max={new Date().getFullYear()}
              value={form.publishedYear}
              onChange={(e) => update("publishedYear", e.target.value)}
              className="w-full px-4 py-2 rounded-lg input-theme border focus:outline-none focus:ring-2 focus:ring-primary/50 focus:border-primary"
              placeholder="e.g. 2024"
            />
          </div>
        </div>

        <div className="flex items-center gap-3">
          <input
            type="checkbox"
            id="isBestseller"
            checked={form.isBestseller}
            onChange={(e) => update("isBestseller", e.target.checked)}
            className="rounded input-theme border text-primary focus:ring-primary"
          />
          <label htmlFor="isBestseller" className="text-sm">
            Mark as bestseller
          </label>
        </div>

        <div className="flex gap-4 pt-4">
          <button
            type="submit"
            disabled={saving}
            className="px-6 py-3 rounded-xl bg-primary hover:bg-primary/90 disabled:opacity-50 disabled:cursor-not-allowed transition"
          >
            {saving ? "Adding…" : "Add Book"}
          </button>
          <button
            type="button"
            onClick={() => navigate(backTo)}
            disabled={saving}
            className="px-6 py-3 rounded-xl bg-slate-100 dark:bg-white/10 hover:bg-slate-200 dark:hover:bg-white/20 text-slate-900 dark:text-white disabled:opacity-50 transition"
          >
            Cancel
          </button>
        </div>
      </form>
    </DashboardLayout>
  );
};

export default AddBook;
