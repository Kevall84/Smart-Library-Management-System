import DashboardLayout from "../../components/layout/DashboardLayout";
import { useState } from "react";
import { rentalsApi } from "../../api/rentals";

const ScanQR = () => {
  const [qrCode, setQrCode] = useState("");
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState(null);
  const [error, setError] = useState(null);

  return (
    <DashboardLayout>
      <h1 className="text-3xl font-bold mb-6">Scan QR Code</h1>

      <div className="grid md:grid-cols-2 gap-8">
        {/* QR Scanner Placeholder */}
        <div className="p-6 rounded-2xl card-theme border flex items-center justify-center h-64">
          <span className="text-muted">
            Use camera integration later. For now paste QR string.
          </span>
        </div>

        {/* Action Panel */}
        <div className="p-6 rounded-2xl card-theme border space-y-4">
          <h3 className="text-xl font-semibold">Scan & Process</h3>

          <input
            value={qrCode}
            onChange={(e) => setQrCode(e.target.value)}
            placeholder="Paste QR code string"
            className="w-full px-4 py-3 rounded-xl input-theme border focus:outline-none focus:ring-2 focus:ring-primary focus:border-primary/50"
          />

          <button
            disabled={loading || !qrCode}
            onClick={async () => {
              setLoading(true);
              setError(null);
              setResult(null);
              try {
                const res = await rentalsApi.scan(qrCode.trim());
                setResult(res?.data || res);
              } catch (e) {
                setError(e?.message || "Failed to process QR");
              } finally {
                setLoading(false);
              }
            }}
            className="px-4 py-2 rounded-lg bg-primary"
          >
            {loading ? "Processing..." : "Process QR"}
          </button>

          {error && <p className="text-red-600 dark:text-red-400">{error}</p>}

          {result?.rental && (
            <div className="pt-4 border-t border-slate-200 dark:border-white/10 space-y-3 p-4 rounded-xl bg-green-100 dark:bg-green-500/10 border border-green-200 dark:border-green-500/20">
              <div className="flex items-center gap-2 mb-3">
                <svg className="w-6 h-6 text-green-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
                <p className="text-lg font-semibold text-green-400">
                  {result.qrType === "issue" ? "Book Issued Successfully!" : "Book Returned Successfully!"}
                </p>
              </div>
              
              <div className="space-y-2 text-sm">
                <p>
                  <span className="text-muted">Action:</span>{" "}
                  <span className="font-semibold capitalize">{result.qrType}</span>
                </p>
                <p>
                  <span className="text-muted">Book:</span>{" "}
                  <b className="text-slate-900 dark:text-white">{result.rental.book?.title || "—"}</b>
                </p>
                <p>
                  <span className="text-muted">Author:</span>{" "}
                  {result.rental.book?.author || "—"}
                </p>
                <p>
                  <span className="text-muted">User:</span>{" "}
                  <b className="text-slate-900 dark:text-white">{result.rental.user?.name || result.rental.user?.email || "Unknown"}</b>
                </p>
                <p>
                  <span className="text-muted">Status:</span>{" "}
                  <span className={`px-2 py-1 rounded text-xs ${
                    result.rental.status === "issued" ? "bg-blue-500/20 text-blue-400" :
                    result.rental.status === "returned" ? "bg-green-500/20 text-green-400" :
                    "bg-yellow-500/20 text-yellow-400"
                  }`}>
                    {result.rental.status?.toUpperCase() || "—"}
                  </span>
                </p>
                {result.rental.dueDate && (
                  <p>
                    <span className="text-muted">Due Date:</span>{" "}
                    <span className="text-yellow-400">
                      {new Date(result.rental.dueDate).toLocaleDateString()}
                    </span>
                  </p>
                )}
                {result.rental.penaltyAmount > 0 && (
                  <p className="pt-2 border-t border-slate-200 dark:border-white/10">
                    <span className="text-muted">Penalty:</span>{" "}
                    <span className="text-red-400 font-semibold">₹{result.rental.penaltyAmount}</span>
                  </p>
                )}
              </div>
              
              <button
                onClick={() => {
                  setResult(null);
                  setQrCode("");
                  if (result.qrType === "issue") {
                    window.location.href = "/librarian/issued";
                  } else {
                    window.location.href = "/librarian/dashboard";
                  }
                }}
                className="w-full mt-4 px-4 py-2 rounded-lg bg-primary hover:scale-105 transition"
              >
                {result.qrType === "issue" ? "View Issued Books" : "Back to Dashboard"}
              </button>
            </div>
          )}
        </div>
      </div>
    </DashboardLayout>
  );
};

export default ScanQR;
