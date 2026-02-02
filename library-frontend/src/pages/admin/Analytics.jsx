import { useEffect, useRef, useState } from "react";
import Chart from "chart.js/auto";
import DashboardLayout from "../../components/layout/DashboardLayout";
import { adminApi } from "../../api/admin";

const Analytics = () => {
  const issuedChartRef = useRef(null);
  const revenueChartRef = useRef(null);
  const userChartRef = useRef(null);
  const [loading, setLoading] = useState(true);
  const [rentalData, setRentalData] = useState([]);
  const [revenueData, setRevenueData] = useState([]);
  const [categoryData, setCategoryData] = useState([]);
  const [error, setError] = useState(null);

  useEffect(() => {
    const loadData = async () => {
      setLoading(true);
      setError(null);
      try {
        const [rentalRes, revenueRes, categoryRes] = await Promise.all([
          adminApi.rentalsStats(180).catch(() => ({ data: { data: [] } })),
          adminApi.revenueStats(180).catch(() => ({ data: { data: [] } })),
          adminApi.categories().catch(() => ({ data: { categories: [] } })),
        ]);
        
        setRentalData(rentalRes?.data?.data || rentalRes?.data || []);
        setRevenueData(revenueRes?.data?.data || revenueRes?.data || []);
        setCategoryData(categoryRes?.data?.categories || categoryRes?.categories || []);
      } catch (e) {
        console.error("Failed to load analytics:", e);
        setError(e?.message || "Failed to load analytics data");
      } finally {
        setLoading(false);
      }
    };
    loadData();
  }, []);

  useEffect(() => {
    if (loading || !issuedChartRef.current || !revenueChartRef.current || !userChartRef.current) return;

    // Prepare rental chart data (last 6 months)
    const rentalLabels = rentalData.slice(-6).map((d) => {
      const date = new Date(d._id);
      return date.toLocaleDateString('en-US', { month: 'short' });
    });
    const rentalValues = rentalData.slice(-6).map((d) => d.count || 0);

    // Prepare revenue chart data (last 6 months)
    const revenueLabels = revenueData.slice(-6).map((d) => {
      const date = new Date(d._id);
      return date.toLocaleDateString('en-US', { month: 'short' });
    });
    const revenueValues = revenueData.slice(-6).map((d) => d.total || 0);

    // Prepare category chart data
    const categoryLabels = categoryData.slice(0, 6).map((c) => c._id || "Unknown");
    const categoryValues = categoryData.slice(0, 6).map((c) => c.count || 0);

    /* ---------- BAR: BOOKS ISSUED ---------- */
    const issuedChart = new Chart(issuedChartRef.current, {
      type: "bar",
      data: {
        labels: rentalLabels.length > 0 ? rentalLabels : ["Jan", "Feb", "Mar", "Apr", "May", "Jun"],
        datasets: [
          {
            label: "Books Issued",
            data: rentalValues.length > 0 ? rentalValues : [0, 0, 0, 0, 0, 0],
            backgroundColor: "rgba(99,102,241,0.75)",
            hoverBackgroundColor: "rgba(99,102,241,1)",
            borderRadius: 8,
          },
        ],
      },
      options: barLineCommonOptions("Issued: "),
    });

    /* ---------- LINE: REVENUE ---------- */
    const revenueChart = new Chart(revenueChartRef.current, {
      type: "line",
      data: {
        labels: revenueLabels.length > 0 ? revenueLabels : ["Jan", "Feb", "Mar", "Apr", "May", "Jun"],
        datasets: [
          {
            label: "Revenue",
            data: revenueValues.length > 0 ? revenueValues : [0, 0, 0, 0, 0, 0],
            borderColor: "#22c55e",
            backgroundColor: "rgba(34,197,94,0.25)",
            fill: true,
            tension: 0.45,
            pointRadius: 4,
            pointHoverRadius: 8,
          },
        ],
      },
      options: barLineCommonOptions("Revenue: ₹"),
    });

    /* ---------- PIE: CATEGORIES ---------- */
    const userChart = new Chart(userChartRef.current, {
      type: "pie",
      data: {
        labels: categoryLabels.length > 0 ? categoryLabels : ["Category 1", "Category 2", "Category 3"],
        datasets: [
          {
            data: categoryValues.length > 0 ? categoryValues : [1, 1, 1],
            hoverOffset: 20,
            backgroundColor: [
              "rgba(59,130,246,0.85)",
              "rgba(168,85,247,0.85)",
              "rgba(234,179,8,0.85)",
              "rgba(34,197,94,0.85)",
              "rgba(239,68,68,0.85)",
              "rgba(251,146,60,0.85)",
            ],
          },
        ],
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        animation: { animateRotate: true, animateScale: true },
        plugins: {
          legend: { position: "bottom" },
          tooltip: {
            callbacks: {
              label: (ctx) => {
                const total = ctx.dataset.data.reduce((a, b) => a + b, 0);
                const percent = total > 0 ? ((ctx.raw / total) * 100).toFixed(1) : 0;
                return `${ctx.label}: ${percent}% (${ctx.raw} books)`;
              },
            },
          },
        },
      },
    });

    return () => {
      issuedChart.destroy();
      revenueChart.destroy();
      userChart.destroy();
    };
  }, [loading, rentalData, revenueData, categoryData]);

  // Calculate summary stats
  const totalRevenue = revenueData.reduce((sum, r) => sum + (r.total || 0), 0);
  const totalIssued = rentalData.reduce((sum, r) => sum + (r.count || 0), 0);

  return (
    <DashboardLayout>
      <h1 className="text-3xl font-bold mb-8">Analytics</h1>

      {loading && <p className="text-muted mb-4">Loading analytics...</p>}
      {error && <p className="text-red-400 mb-4">{error}</p>}

      {/* SUMMARY */}
      <div className="grid md:grid-cols-3 gap-6 mb-10">
        <StatCard title="Total Revenue (6 months)" value={`₹${totalRevenue.toLocaleString()}`} />
        <StatCard title="Books Issued (6 months)" value={totalIssued.toLocaleString()} />
        <StatCard title="Book Categories" value={categoryData.length.toString()} />
      </div>

      {/* BAR + LINE */}
      <div className="grid lg:grid-cols-2 gap-8 mb-10">
        <ChartBox title="Books Issued Per Month">
          <canvas ref={issuedChartRef} />
        </ChartBox>

        <ChartBox title="Monthly Revenue Growth">
          <canvas ref={revenueChartRef} />
        </ChartBox>
      </div>

      {/* PIE */}
      <div className="max-w-md">
        <ChartBox title="Books by Category" height="260px">
          <canvas ref={userChartRef} />
        </ChartBox>
      </div>
    </DashboardLayout>
  );
};

export default Analytics;

/* ---------- SHARED OPTIONS ---------- */

const barLineCommonOptions = (prefix) => ({
  responsive: true,
  maintainAspectRatio: false,
  interaction: {
    mode: "index",
    intersect: false,
  },
  animation: {
    duration: 900,
    easing: "easeOutQuart",
  },
  plugins: {
    legend: { display: false },
    tooltip: {
      mode: "index",
      intersect: false,
      callbacks: {
        label: (ctx) => `${prefix}${ctx.raw}`,
      },
    },
  },
  scales: {
    y: {
      beginAtZero: true,
      grid: { color: "rgba(255,255,255,0.06)" },
    },
    x: {
      grid: { display: false },
    },
  },
});

/* ---------- COMPONENTS ---------- */

const StatCard = ({ title, value }) => (
  <div className="p-6 rounded-xl bg-white/5 border border-white/10">
    <p className="text-muted">{title}</p>
    <h2 className="text-2xl font-bold mt-2">{value}</h2>
  </div>
);

const ChartBox = ({ title, children, height = "320px" }) => (
  <div className="p-6 rounded-xl bg-white/5 border border-white/10">
    <h2 className="font-semibold mb-4">{title}</h2>
    <div style={{ height }}>{children}</div>
  </div>
);