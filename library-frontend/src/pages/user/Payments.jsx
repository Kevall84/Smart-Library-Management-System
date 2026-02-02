import DashboardLayout from "../../components/layout/DashboardLayout";
import { useEffect, useState } from "react";
import { paymentsApi } from "../../api/payments";

const Payments = () => {
  const [loading, setLoading] = useState(true);
  const [payments, setPayments] = useState([]);
  const [error, setError] = useState(null);

  useEffect(() => {
    const load = async () => {
      setLoading(true);
      setError(null);
      try {
        const res = await paymentsApi.my({ limit: 10 });
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
      <h1 className="text-3xl font-bold mb-6">Payments</h1>

      {loading && <p className="text-muted">Loading...</p>}
      {error && <p className="text-red-400">{error}</p>}

      {!loading && !error && payments.length === 0 && (
        <div className="p-8 rounded-xl bg-white/5 border border-white/10 text-center">
          <p className="text-muted text-lg mb-2">No payments yet</p>
          <p className="text-muted text-sm">Your payment history will appear here once you make a rental.</p>
        </div>
      )}

      <div className="space-y-4">
        {payments.map((p) => (
          <div key={p._id} className="p-5 rounded-xl bg-white/5 border border-white/10">
            <p>
              ₹{p.amount} • {p.paymentStatus}
            </p>
            <p className="text-muted text-sm">
              Transaction: {p.transactionId || p.providerOrderId || p._id}
            </p>
          </div>
        ))}
      </div>
    </DashboardLayout>
  );
};

export default Payments;
