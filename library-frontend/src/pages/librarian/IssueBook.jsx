import DashboardLayout from "../../components/layout/DashboardLayout";
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { rentalsApi } from "../../api/rentals";

const IssueBook = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [pendingRentals, setPendingRentals] = useState([]);
  const [error, setError] = useState(null);

  useEffect(() => {
    const loadPendingRentals = async () => {
      setLoading(true);
      setError(null);
      try {
        const res = await rentalsApi.staff({ status: "pending", limit: 50 });
        // Handle paginated response format
        const rentalsList = Array.isArray(res?.data) ? res?.data : (res?.data?.rentals || res?.rentals || []);
        setPendingRentals(rentalsList);
      } catch (e) {
        console.error("Failed to load pending rentals:", e);
        setError(e?.message || "Failed to load pending rentals");
        setPendingRentals([]);
      } finally {
        setLoading(false);
      }
    };
    loadPendingRentals();
  }, []);

  return (
    <DashboardLayout>
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold">Pending Rentals</h1>
        <button
          onClick={() => navigate("/librarian/scan")}
          className="px-4 py-2 rounded-lg bg-primary text-sm"
        >
          Scan QR Code
        </button>
      </div>

      <p className="text-muted mb-6">
        These rentals are waiting for users to visit the library with their QR code. 
        Scan the QR code to issue the book.
      </p>

      {loading && <p className="text-muted mb-4">Loading pending rentals...</p>}
      {error && <p className="text-red-600 dark:text-red-400 mb-4">{error}</p>}

      {!loading && !error && pendingRentals.length === 0 && (
        <div className="p-8 rounded-xl card-theme border text-center">
          <p className="text-muted text-lg mb-2">No pending rentals</p>
          <p className="text-muted text-sm">All rentals have been processed.</p>
        </div>
      )}

      <div className="space-y-4 max-w-2xl">
        {pendingRentals.map((rental) => (
          <div
            key={rental._id}
            className="p-6 rounded-xl card-theme border hover:bg-slate-50 dark:hover:bg-white/10 transition"
          >
            <div className="flex justify-between items-start mb-4">
              <div className="flex-1">
                <h3 className="text-lg font-semibold mb-2">
                  {rental.book?.title || "Unknown Book"}
                </h3>
                <p className="text-muted text-sm mb-1">
                  Author: {rental.book?.author || "—"}
                </p>
                <p className="text-muted text-sm mb-1">
                  User: <span className="text-slate-900 dark:text-white font-medium">{rental.user?.name || rental.user?.email || "Unknown"}</span>
                </p>
                <div className="flex gap-4 mt-3 text-sm">
                  <p>
                    <span className="text-muted">Rental Days:</span>{" "}
                    <span className="font-semibold">{rental.rentalDays} day(s)</span>
                  </p>
                  <p>
                    <span className="text-muted">Amount Paid:</span>{" "}
                    <span className="font-semibold text-green-400">
                      ₹{rental.payment?.amount || "—"}
                    </span>
                  </p>
                  <p>
                    <span className="text-muted">Due Date:</span>{" "}
                    <span className="text-yellow-400">
                      {rental.dueDate ? new Date(rental.dueDate).toLocaleDateString() : "—"}
                    </span>
                  </p>
                </div>
              </div>
              <div className="ml-4">
                <span className="px-3 py-1 rounded bg-amber-100 dark:bg-yellow-500/20 text-amber-800 dark:text-yellow-400 text-xs font-medium">
                  PENDING
                </span>
              </div>
            </div>
            
            <div className="pt-4 border-t border-slate-200 dark:border-white/10">
              <p className="text-sm text-muted mb-3">
                💡 User will show QR code at library counter. Scan it to issue the book.
              </p>
              <button
                onClick={() => navigate("/librarian/scan")}
                className="px-4 py-2 rounded-lg bg-primary hover:scale-105 transition text-sm"
              >
                Scan QR Code to Issue
              </button>
            </div>
          </div>
        ))}
      </div>
    </DashboardLayout>
  );
};

export default IssueBook;
