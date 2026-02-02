import { useEffect, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import DashboardLayout from "../../components/layout/DashboardLayout";
import BookCover from "../../components/common/BookCover";
import { rentalsApi } from "../../api/rentals";

const ReturnBook = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const rentalId = location.state?.rentalId;
  
  const [loading, setLoading] = useState(true);
  const [rental, setRental] = useState(null);
  const [penalty, setPenalty] = useState(null);
  const [error, setError] = useState(null);
  const [returning, setReturning] = useState(false);

  useEffect(() => {
    const loadRental = async () => {
      // Try to get rentalId from state, URL params, or from issued books
      let id = rentalId;
      
      if (!id) {
        const urlParams = new URLSearchParams(window.location.search);
        id = urlParams.get('rentalId');
      }

      if (!id) {
        setError("No rental ID provided. Please select a rental from Issued Books.");
        setLoading(false);
        return;
      }

      setLoading(true);
      setError(null);
      try {
        const [rentalRes, penaltyRes] = await Promise.all([
          rentalsApi.get(id).catch((e) => {
            console.error("Failed to get rental:", e);
            return null;
          }),
          rentalsApi.penalty(id).catch((e) => {
            console.error("Failed to get penalty:", e);
            return null;
          }),
        ]);
        
        const rentalData = rentalRes?.data?.rental || rentalRes?.rental || null;
        if (!rentalData) {
          setError("Rental not found. It may have been returned or cancelled.");
          setLoading(false);
          return;
        }
        
        setRental(rentalData);
        setPenalty(penaltyRes?.data || penaltyRes || null);
      } catch (e) {
        console.error("Failed to load rental:", e);
        setError(e?.message || "Failed to load rental information");
      } finally {
        setLoading(false);
      }
    };
    loadRental();
  }, [rentalId]);

  const handleConfirmReturn = async () => {
    if (!rental || !rental._id) {
      alert("Cannot return: Rental information is missing");
      return;
    }
    
    const dueDate = rental.dueDate ? new Date(rental.dueDate) : null;
    const now = new Date();
    const isLate = dueDate && now > dueDate;
    const lateDays = isLate && dueDate ? Math.ceil((now - dueDate) / (1000 * 60 * 60 * 24)) : 0;
    const calculatedPenalty = penalty?.penaltyAmount || (isLate ? lateDays * (penalty?.penaltyPerDay || 50) : 0);
    
    const confirmMsg = calculatedPenalty > 0
      ? `Confirm return of "${rental.book?.title || 'book'}"?\n\nPenalty: ₹${calculatedPenalty.toFixed(2)}\n\nThis will mark the book as returned.`
      : `Confirm return of "${rental.book?.title || 'book'}"?\n\nNo penalty - returned on time.\n\nThis will mark the book as returned.`;
    
    if (!window.confirm(confirmMsg)) {
      return;
    }
    
    setReturning(true);
    try {
      // Use direct return endpoint
      const returnRes = await rentalsApi.directReturn(rental._id);
      const returnedRental = returnRes?.data?.rental || returnRes?.rental;
      const penaltyInfo = returnRes?.data?.penalty || returnRes?.penalty;
      
      alert(
        `✅ Book returned successfully!\n\n` +
        `Book: ${returnedRental?.book?.title || rental.book?.title}\n` +
        `User: ${returnedRental?.user?.name || rental.user?.name}\n` +
        (penaltyInfo?.amount > 0 ? `Penalty: ₹${penaltyInfo.amount}\n` : 'No penalty\n') +
        `\nReturned at: ${new Date().toLocaleString()}`
      );
      
      navigate("/librarian/issued");
    } catch (e) {
      console.error("Return error:", e);
      alert("Failed to return book: " + (e?.message || "Unknown error"));
    } finally {
      setReturning(false);
    }
  };

  if (loading) {
    return (
      <DashboardLayout>
        <h1 className="text-3xl font-bold mb-6">Return Book</h1>
        <p className="text-muted">Loading rental information...</p>
      </DashboardLayout>
    );
  }

  if (error || !rental) {
    return (
      <DashboardLayout>
        <h1 className="text-3xl font-bold mb-6">Return Book</h1>
        <p className="text-red-600 dark:text-red-400">{error || "Rental not found"}</p>
        <button
          onClick={() => navigate("/librarian/issued")}
          className="mt-4 px-4 py-2 rounded bg-slate-100 dark:bg-white/10 text-slate-900 dark:text-white hover:bg-slate-200 dark:hover:bg-white/20"
        >
          Back to Issued Books
        </button>
      </DashboardLayout>
    );
  }

  const dueDate = rental.dueDate ? new Date(rental.dueDate) : null;
  const now = new Date();
  const isLate = dueDate && now > dueDate;
  const lateDays = isLate && dueDate ? Math.ceil((now - dueDate) / (1000 * 60 * 60 * 24)) : 0;
  const penaltyAmount = penalty?.penaltyAmount || (isLate ? lateDays * (penalty?.penaltyPerDay || 50) : 0);

  return (
    <DashboardLayout>
      <h1 className="text-3xl font-bold mb-6">Return Book</h1>

      <div className="max-w-lg p-6 rounded-2xl card-theme border space-y-3">
        <div className="flex gap-4 items-start mb-4">
          <BookCover
            src={rental.book?.coverImage}
            title={rental.book?.title}
            size="md"
          />
          <div className="flex-1 min-w-0">
            <p><b>Book:</b> {rental.book?.title || "Unknown"}</p>
            <p className="text-muted text-sm">Author: {rental.book?.author || "Unknown"}</p>
          </div>
        </div>
        <p><b>User:</b> {rental.user?.name || rental.user?.email || "Unknown"}</p>
        {dueDate && (
          <p className="text-muted text-sm">
            Due Date: {dueDate.toLocaleDateString()}
          </p>
        )}

        {isLate ? (
          <>
            <p className="text-red-600 dark:text-red-400">
              Late by {lateDays} day(s)
            </p>
            <p>
              Penalty:{" "}
              <b className="text-primary">
                ₹{penaltyAmount.toFixed(2)}
              </b>
            </p>
          </>
        ) : (
          <p className="text-green-600 dark:text-green-400">
            {dueDate ? "Returned on time (No penalty)" : "No penalty"}
          </p>
        )}

        <button
          onClick={handleConfirmReturn}
          disabled={returning}
          className="mt-6 px-6 py-3 rounded-xl bg-primary hover:scale-105 transition disabled:opacity-50"
        >
          {returning ? "Processing..." : "Confirm Return"}
        </button>
      </div>
    </DashboardLayout>
  );
};

export default ReturnBook;
