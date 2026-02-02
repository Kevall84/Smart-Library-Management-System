import { useNavigate } from "react-router-dom";
import { useState } from "react";
import { motion } from "framer-motion";
import useAuth from "../../context/useAuth";

const Register = () => {
  const navigate = useNavigate();
  const { register } = useAuth();

  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [submitting, setSubmitting] = useState(false);

  const handleRegister = async () => {
    if (!name || !email || !password) {
      alert("Please fill all fields");
      return;
    }
    setSubmitting(true);
    try {
      await register({ name, email, password, role: "user" });
      navigate("/dashboard");
    } catch (e) {
      alert(e?.message || "Registration failed");
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
          className="absolute top-0 right-0 w-96 h-96 bg-primary/20 rounded-full blur-3xl"
          animate={{
            x: [0, -100, 0],
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
          className="absolute bottom-0 left-0 w-96 h-96 bg-pink-500/20 rounded-full blur-3xl"
          animate={{
            x: [0, 100, 0],
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
        className="grid w-full max-w-4xl md:max-w-5xl md:grid-cols-2 overflow-hidden rounded-3xl border-2 border-soft bg-surface shadow-soft-lg dark:border-white/10 dark:bg-slate-950/90"
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.5 }}
      >
        <motion.div
          className="relative hidden bg-slate-900/90 md:block"
          initial={{ opacity: 0, x: -50 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.6 }}
        >
          <img
            src="https://images.unsplash.com/photo-1481627834876-b7833e8f5570?auto=format&fit=crop&w=1400&q=80"
            alt="Library shelves filled with books"
            className="h-full w-full object-cover opacity-85"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-slate-950/70 to-transparent" />
          <div className="absolute inset-0 flex flex-col justify-between p-8">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 }}
            >
              <p className="text-xs font-semibold uppercase tracking-[0.25em] text-primary/70">
                New to SmartLib
              </p>
              <h2 className="mt-3 text-2xl font-semibold text-white">
                Create a single account for all your library journeys.
              </h2>
            </motion.div>
            <motion.div
              className="space-y-2 text-xs text-slate-200/90"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.5 }}
            >
              {[
                "One login for eBooks and offline rentals.",
                "Instant QR code generation after payment.",
                "Clear history of every rental and payment.",
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

        <motion.div
          className="flex flex-col justify-center px-6 py-8 sm:px-8"
          variants={containerVariants}
          initial="hidden"
          animate="visible"
        >
          <motion.div className="mb-8 text-center md:text-left" variants={itemVariants}>
            <h2 className="text-2xl font-semibold tracking-tight text-slate-900 sm:text-3xl dark:text-white">
              Create an account
            </h2>
            <p className="mt-2 text-sm text-muted">
              Join SmartLib and start exploring digital and physical collections.
            </p>
          </motion.div>

          <motion.form
            className="space-y-5"
            onSubmit={(e) => e.preventDefault()}
            variants={containerVariants}
          >
            <motion.div className="space-y-2" variants={itemVariants}>
              <label className="text-xs font-medium text-muted">
                Full name
              </label>
              <motion.input
                type="text"
                placeholder="Enter your full name"
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="w-full rounded-xl border-2 border-soft bg-soft px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-primary/70 focus:border-primary/50 transition-all dark:border-white/10 dark:bg-slate-950/60"
                whileFocus={{ scale: 1.02 }}
              />
            </motion.div>

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
            </motion.div>

            <motion.div className="space-y-2" variants={itemVariants}>
              <label className="text-xs font-medium text-muted">
                Password
              </label>
              <motion.input
                type="password"
                placeholder="Create a strong password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full rounded-xl border-2 border-soft bg-soft px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-primary/70 focus:border-primary/50 transition-all dark:border-white/10 dark:bg-slate-950/60"
                whileFocus={{ scale: 1.02 }}
              />
            </motion.div>

            <motion.button
              type="button"
              onClick={handleRegister}
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
                  Creating account...
                </span>
              ) : (
                "Register"
              )}
            </motion.button>
          </motion.form>

          <motion.p
            className="mt-6 text-center text-xs text-muted sm:text-sm"
            variants={itemVariants}
          >
            Already have an account?{" "}
            <button
              type="button"
              onClick={() => navigate("/login")}
              className="font-medium text-primary hover:underline"
            >
              Login
            </button>
          </motion.p>
        </motion.div>
      </motion.div>
    </div>
  );
};

export default Register;
