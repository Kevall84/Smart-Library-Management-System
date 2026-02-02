import useAuth from "../../context/useAuth";
import { useLocation, useNavigate } from "react-router-dom";
import { useState } from "react";
import { motion } from "framer-motion";

const Login = () => {
  const { login } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const redirectTo = location.state?.redirectTo || "/dashboard";

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [errors, setErrors] = useState({ email: "", password: "", general: "" });

  const handleLogin = async () => {
    const trimmedEmail = email.trim();
    const newErrors = { email: "", password: "", general: "" };

    if (!trimmedEmail) {
      newErrors.email = "Email is required.";
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(trimmedEmail)) {
      newErrors.email = "Please enter a valid email address.";
    }

    if (!password) {
      newErrors.password = "Password is required.";
    }

    if (newErrors.email || newErrors.password) {
      setErrors(newErrors);
      return;
    }

    setErrors({ email: "", password: "", general: "" });
    setSubmitting(true);
    try {
      const user = await login(trimmedEmail, password);
      const role = user?.role;
      if (role === "admin") navigate("/admin/dashboard");
      else if (role === "librarian") navigate("/librarian/dashboard");
      else navigate(redirectTo);
    } catch (e) {
      setErrors((prev) => ({
        ...prev,
        general: e?.message || "Login failed. Please check your credentials.",
      }));
    } finally {
      setSubmitting(false);
    }
  };

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1,
      },
    },
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: {
      opacity: 1,
      y: 0,
      transition: {
        duration: 0.5,
        ease: "easeOut",
      },
    },
  };

  return (
    <div className="relative flex min-h-[calc(100vh-5rem)] items-center justify-center px-4 py-12 sm:px-6 overflow-hidden">
      {/* Animated background */}
      <div className="absolute inset-0 -z-10">
        <motion.div
          className="absolute top-0 left-0 w-96 h-96 bg-primary/20 rounded-full blur-3xl"
          animate={{
            x: [0, 100, 0],
            y: [0, 50, 0],
            scale: [1, 1.2, 1],
          }}
          transition={{
            duration: 8,
            repeat: Infinity,
            ease: "easeInOut",
          }}
        />
        <motion.div
          className="absolute bottom-0 right-0 w-96 h-96 bg-purple-500/20 rounded-full blur-3xl"
          animate={{
            x: [0, -100, 0],
            y: [0, -50, 0],
            scale: [1, 1.2, 1],
          }}
          transition={{
            duration: 10,
            repeat: Infinity,
            ease: "easeInOut",
          }}
        />
      </div>

      <motion.div
        className="grid w-full max-w-4xl md:max-w-5xl md:grid-cols-2 rounded-3xl border-2 border-soft bg-surface shadow-soft-lg dark:border-white/10 dark:bg-slate-950/90"
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.5 }}
      >
        {/* Left side illustration */}
        <motion.div
          className="relative hidden bg-slate-900/90 md:block"
          initial={{ opacity: 0, x: -50 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.6 }}
        >
          <img
            src="https://images.unsplash.com/photo-1512820790803-83ca734da794?auto=format&fit=crop&w=1200&q=80"
            alt="Sunlit library shelves filled with books"
            className="h-full w-full object-cover opacity-80"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-slate-950/70 to-transparent" />
          <div className="absolute inset-0 flex flex-col justify-between p-8">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 }}
            >
              <p className="text-xs font-semibold uppercase tracking-[0.25em] text-primary/70">
                SmartLib
              </p>
              <h2 className="mt-3 text-2xl font-semibold text-white">
                Your library, one clean dashboard away.
              </h2>
            </motion.div>
            <motion.div
              className="space-y-2 text-xs text-slate-200/90"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.5 }}
            >
              {[
                "Track rentals and returns in real time.",
                "Manage penalties automatically with QR flows.",
                "Access digital and physical collection together.",
              ].map((text, index) => (
                <motion.p
                  key={index}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.6 + index * 0.1 }}
                >
                  • {text}
                </motion.p>
              ))}
            </motion.div>
          </div>
        </motion.div>

        {/* Right side form */}
        <motion.div
          className="flex flex-col justify-center px-6 py-8 sm:px-8"
          variants={containerVariants}
          initial="hidden"
          animate="visible"
        >
          <motion.div className="mb-8 text-center md:text-left" variants={itemVariants}>
            <h2 className="text-2xl font-semibold tracking-tight text-slate-900 sm:text-3xl dark:text-white">
              Welcome back
            </h2>
            <p className="mt-2 text-sm text-muted">
              Sign in to continue to your SmartLib dashboard.
            </p>
          </motion.div>

          <motion.div className="space-y-5" variants={containerVariants}>
            <motion.div className="space-y-2" variants={itemVariants}>
              <label className="text-xs font-medium text-muted">
                Email address
              </label>
              <motion.input
                type="email"
                placeholder="you@example.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full rounded-xl border-2 border-soft bg-soft px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-primary/70 focus:border-primary/50 transition-all dark:border-white/10 dark:bg-slate-950/60"
                whileFocus={{ scale: 1.02 }}
              />
              {errors.email && (
                <p className="mt-1 text-xs text-red-500">{errors.email}</p>
              )}
            </motion.div>

            <motion.div className="space-y-2" variants={itemVariants}>
              <label className="text-xs font-medium text-muted">
                Password
              </label>
              <div className="relative">
                <motion.input
                  type={showPassword ? "text" : "password"}
                  placeholder="••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full rounded-xl border-2 border-soft bg-soft px-4 py-3 pr-12 text-sm focus:outline-none focus:ring-2 focus:ring-primary/70 focus:border-primary/50 transition-all dark:border-white/10 dark:bg-slate-950/60"
                  whileFocus={{ scale: 1.02 }}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword((prev) => !prev)}
                  className="absolute inset-y-0 right-3 flex items-center text-xs font-medium text-muted hover:text-primary"
                  tabIndex={-1}
                >
                  {showPassword ? "Hide" : "Show"}
                </button>
              </div>
              {errors.password && (
                <p className="mt-1 text-xs text-red-500">{errors.password}</p>
              )}
            </motion.div>

            <motion.button
              onClick={handleLogin}
              disabled={submitting}
              className="mt-2 w-full rounded-xl bg-gradient-primary py-3 text-sm font-semibold text-white shadow-glow transition hover:-translate-y-0.5 hover:shadow-glow-lg disabled:cursor-not-allowed disabled:opacity-70"
              whileHover={{ scale: submitting ? 1 : 1.02 }}
              whileTap={{ scale: submitting ? 1 : 0.98 }}
              variants={itemVariants}
            >
              {submitting ? (
                <span className="flex items-center justify-center gap-2">
                  <motion.span
                    className="h-4 w-4 border-2 border-white border-t-transparent rounded-full"
                    animate={{ rotate: 360 }}
                    transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                  />
                  Logging in...
                </span>
              ) : (
                "Login"
              )}
            </motion.button>

            {errors.general && (
              <motion.p
                className="mt-3 text-xs text-red-500 text-center"
                variants={itemVariants}
              >
                {errors.general}
              </motion.p>
            )}

            <motion.p
              className="mt-4 text-center text-xs text-muted sm:text-sm"
              variants={itemVariants}
            >
              Not registered yet?{" "}
              <button
                type="button"
                onClick={() => navigate("/register")}
                className="font-medium text-primary hover:underline"
              >
                Create an account
              </button>
            </motion.p>
          </motion.div>
        </motion.div>
      </motion.div>
    </div>
  );
};

export default Login;

