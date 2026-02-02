import DashboardLayout from "../../components/layout/DashboardLayout";
import { useEffect, useState } from "react";
import { paymentsApi } from "../../api/payments";

const PaymentHistory = () => {
  const [loading, setLoading] = useState(true);
  const [payments, setPayments] = useState([]);
  const [error, setError] = useState(null);

  useEffect(() => {
    const load = async () => {
      setLoading(true);
      setError(null);
      try {
        const res = await paymentsApi.my({ limit: 20 });
        setPayments(res?.data || res?.payments || []);
      } catch (e) {
        setError(e?.message || "Failed to load payments");
      } finally {
        setLoading(false);
      }
    };
    load();
  }, []);

  return (
    <DashboardLayout>
      <h1 className="text-3xl font-bold mb-6">Payment History</h1>

      {loading && <p className="text-muted">Loading...</p>}
      {error && <p className="text-red-400">{error}</p>}

      <div className="overflow-x-auto max-w-3xl">
        <table className="w-full border border-white/10 rounded-xl">
          <thead className="bg-white/10">
            <tr>
              <th className="p-4 text-left">Payment ID</th>
              <th className="p-4 text-left">Amount</th>
              <th className="p-4 text-left">Date</th>
              <th className="p-4 text-left">Status</th>
            </tr>
          </thead>
          <tbody>
            {!loading && !error && payments.length === 0 && (
              <tr>
                <td colSpan="4" className="p-8 text-center text-muted">
                  No payment history found
                </td>
              </tr>
            )}
            {payments.map((p) => (
              <tr key={p._id} className="border-t border-white/10">
                <td className="p-4">{p.transactionId || p.providerOrderId || p._id}</td>
                <td className="p-4">₹{p.amount}</td>
                <td className="p-4">{new Date(p.createdAt).toLocaleString()}</td>
                <td className={`p-4 ${p.paymentStatus === "completed" ? "text-green-400" : "text-muted"}`}>
                  {p.paymentStatus}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </DashboardLayout>
  );
};

export default PaymentHistory;
