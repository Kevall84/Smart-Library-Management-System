import { Link, useLocation } from "react-router-dom";
import { motion } from "framer-motion";
import useAuth from "../../context/useAuth";
import { useTheme } from "../../context/ThemeContext";

const Navbar = () => {
  const { user, logout } = useAuth();
  const location = useLocation();
  const { theme, toggleTheme } = useTheme();

  const showMiddleMenu = location.pathname === "/";

  const navLinks = [
    { href: "#features", label: "Features" },
    { href: "#rules", label: "Rules" },
    { href: "#blogs", label: "Blogs" },
    { href: "#about", label: "About" },
    { href: "#contact", label: "Contact" },
  ];

  return (
    <motion.header
      className="fixed top-0 z-50 w-full border-b border-soft bg-white/80 backdrop-blur-xl dark:border-white/10 dark:bg-slate-900/95 text-slate-900 dark:text-white"
      initial={{ y: -100 }}
      animate={{ y: 0 }}
      transition={{ duration: 0.5, ease: "easeOut" }}
    >
      <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8">
        <motion.div
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
        >
          <Link
            to="/"
            className="flex items-center gap-2 text-lg font-semibold tracking-tight md:text-xl group"
          >
            <motion.span
              className="inline-flex h-8 w-8 items-center justify-center rounded-lg bg-gradient-primary text-xs font-bold text-white shadow-glow"
              animate={{
                boxShadow: [
                  "0 0 20px rgba(91,108,255,0.3)",
                  "0 0 30px rgba(91,108,255,0.5)",
                  "0 0 20px rgba(91,108,255,0.3)",
                ],
              }}
              transition={{
                duration: 2,
                repeat: Infinity,
                ease: "easeInOut",
              }}
            >
              SL
            </motion.span>
            <span className="font-display group-hover:text-primary transition-colors">
              Smart<span className="text-primary">Lib</span>
            </span>
          </Link>
        </motion.div>

        {showMiddleMenu && (
          <nav className="hidden items-center gap-8 text-sm text-muted md:flex">
            {navLinks.map((link, index) => (
              <motion.a
                key={link.href}
                href={link.href}
                className="relative hover:text-primary transition-colors"
                initial={{ opacity: 0, y: -20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1 }}
                whileHover={{ scale: 1.1 }}
              >
                {link.label}
                <motion.span
                  className="absolute bottom-0 left-0 w-0 h-0.5 bg-primary"
                  whileHover={{ width: "100%" }}
                  transition={{ duration: 0.3 }}
                />
              </motion.a>
            ))}
          </nav>
        )}

        <div className="flex items-center gap-3">
          <motion.button
            type="button"
            onClick={toggleTheme}
            aria-label="Toggle theme"
            className="inline-flex items-center gap-1 rounded-full border border-slate-200 dark:border-soft bg-white dark:bg-slate-900/70 px-3 py-1 text-xs font-medium text-slate-600 dark:text-muted shadow-sm transition hover:border-primary/60 hover:text-primary"
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
          >
            <motion.span
              className={`h-1.5 w-1.5 rounded-full ${
                theme === "dark" ? "bg-primary" : "bg-amber-500"
              }`}
              animate={{
                scale: [1, 1.2, 1],
                opacity: [1, 0.7, 1],
              }}
              transition={{
                duration: 2,
                repeat: Infinity,
                ease: "easeInOut",
              }}
            />
            <span>{theme === "dark" ? "Dark" : "Light"}</span>
          </motion.button>

          {user ? (
            <motion.button
              onClick={logout}
              className="rounded-lg bg-slate-800 dark:bg-white/10 px-4 py-2 text-sm font-medium text-white shadow-sm transition hover:bg-slate-700 dark:hover:bg-white/20"
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            >
              Logout
            </motion.button>
          ) : (
            <motion.div
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            >
              <Link
                to="/login"
                className="rounded-lg bg-gradient-primary px-4 py-2 text-sm font-medium text-white shadow-glow transition hover:shadow-glow-lg"
              >
                Login
              </Link>
            </motion.div>
          )}
        </div>
      </div>
    </motion.header>
  );
};

export default Navbar;