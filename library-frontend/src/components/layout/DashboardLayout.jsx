import Navbar from "./Navbar";
import Sidebar from "./Sidebar";

const DashboardLayout = ({ children }) => {
  return (
    <div className="min-h-screen bg-[color:var(--libflow-bg)] text-[color:var(--libflow-text)]">
      <Navbar />
      <div className="flex pt-16">
        <aside className="hidden md:block w-64 border-r border-slate-200 dark:border-white/10 bg-white dark:bg-slate-900/95 shadow-sm dark:shadow-none">
          <Sidebar />
        </aside>
        <main className="flex-1 px-4 py-6 sm:px-6 lg:px-8">
          <div className="max-w-7xl mx-auto">
            {children}
          </div>
        </main>
      </div>
    </div>
  );
};

export default DashboardLayout;
