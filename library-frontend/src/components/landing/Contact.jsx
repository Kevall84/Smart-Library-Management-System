import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useInView } from "framer-motion";
import { useRef } from "react";
import { api } from "../../api/client";

const BULLETS = [
  { label: "Quick Responses", icon: "✓" },
  { label: "24/7 Support", icon: "✓" },
  { label: "Personalized Assistance", icon: "✓" },
];

const Contact = () => {
  const [submitted, setSubmitted] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState(null);
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    message: "",
  });
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, margin: "-100px" });

  const getAdminContactEmail = () => {
    try {
      const raw = window.localStorage.getItem("adminSettings");
      if (!raw) return null;
      const parsed = JSON.parse(raw);
      if (parsed && typeof parsed.contactEmail === "string" && parsed.contactEmail.trim()) {
        return parsed.contactEmail.trim();
      }
      return null;
    } catch {
      return null;
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(null);

    const targetEmail = getAdminContactEmail() || "support@library.com";

    try {
      setSubmitting(true);
      await api.post("/contact", {
        name: formData.name,
        email: formData.email,
        message: formData.message,
        targetEmail,
      });

      setSubmitted(true);
      setTimeout(() => {
        setSubmitted(false);
        setFormData({ name: "", email: "", message: "" });
      }, 3000);
    } catch (err) {
      console.error("Failed to send contact message", err);
      setError(err?.message || "Failed to send message. Please try again.");
    } finally {
      setSubmitting(false);
    }
  };

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: { staggerChildren: 0.15 },
    },
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 24 },
    visible: {
      opacity: 1,
      y: 0,
      transition: { duration: 0.5, ease: "easeOut" },
    },
  };

  return (
    <section
      id="contact"
      className="relative max-w-7xl mx-auto px-6 py-28 overflow-hidden"
    >
      <div className="absolute inset-0 -z-10">
        <div className="absolute top-1/4 left-0 w-96 h-96 bg-primary/5 rounded-full blur-3xl animate-pulse-glow" />
        <div
          className="absolute bottom-1/4 right-0 w-96 h-96 bg-pink-500/5 rounded-full blur-3xl animate-pulse-glow"
          style={{ animationDelay: "1s" }}
        />
      </div>

      <motion.div
        ref={ref}
        initial="hidden"
        animate={isInView ? "visible" : "hidden"}
        variants={containerVariants}
      >
        <div className="grid md:grid-cols-2 gap-12 lg:gap-16 items-start">
          {/* Left: Send a Message + description + bullets */}
          <motion.div variants={itemVariants} className="space-y-6">
            <h2 className="text-3xl md:text-4xl font-bold text-slate-900 dark:text-white">
              Send a Message
            </h2>
            <p className="text-muted text-lg leading-relaxed max-w-md">
              Have questions about borrowing, booking, or the library? Just send us a message — we usually reply within a few hours.
            </p>
            <ul className="space-y-3">
              {BULLETS.map((item, i) => (
                <motion.li
                  key={item.label}
                  className="flex items-center gap-3 text-slate-900 dark:text-white"
                  variants={itemVariants}
                >
                  <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-primary/20 text-primary font-semibold">
                    {item.icon}
                  </span>
                  <span className="font-medium">{item.label}</span>
                </motion.li>
              ))}
            </ul>
          </motion.div>

          {/* Right: Contact form in dark container */}
          <motion.div
            variants={itemVariants}
            className="rounded-2xl border border-slate-200 dark:border-white/10 bg-slate-50 dark:bg-slate-900/80 p-6 md:p-8 shadow-xl"
          >
            <AnimatePresence mode="wait">
              {!submitted ? (
                <motion.form
                  key="form"
                  onSubmit={handleSubmit}
                  className="space-y-5"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                >
                  <div>
                    <label className="block text-sm font-medium text-slate-700 dark:text-white mb-1.5">
                      Your Name
                    </label>
                    <input
                      type="text"
                      placeholder="Enter your name"
                      required
                      value={formData.name}
                      onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                      className="w-full rounded-xl border border-slate-300 dark:border-white/10 bg-white dark:bg-white/5 px-4 py-3 text-slate-900 dark:text-white placeholder-slate-500 dark:placeholder-slate-400 text-sm focus:outline-none focus:ring-2 focus:ring-primary/50 focus:border-primary transition-all"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-slate-700 dark:text-white mb-1.5">
                      Email
                    </label>
                    <input
                      type="email"
                      placeholder="Enter your email"
                      required
                      value={formData.email}
                      onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                      className="w-full rounded-xl border border-slate-300 dark:border-white/10 bg-white dark:bg-white/5 px-4 py-3 text-slate-900 dark:text-white placeholder-slate-500 dark:placeholder-slate-400 text-sm focus:outline-none focus:ring-2 focus:ring-primary/50 focus:border-primary transition-all"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-slate-700 dark:text-white mb-1.5">
                      Message
                    </label>
                    <textarea
                      rows="4"
                      placeholder="Write your message..."
                      required
                      value={formData.message}
                      onChange={(e) => setFormData({ ...formData, message: e.target.value })}
                      className="w-full rounded-xl border border-slate-300 dark:border-white/10 bg-white dark:bg-white/5 px-4 py-3 text-slate-900 dark:text-white placeholder-slate-500 dark:placeholder-slate-400 text-sm focus:outline-none focus:ring-2 focus:ring-primary/50 focus:border-primary transition-all resize-none"
                    />
                  </div>

                  <button
                    type="submit"
                    disabled={submitting}
                    className="w-full rounded-xl bg-gradient-to-r from-primary via-primary to-cyan-500 py-3.5 text-sm font-semibold text-white shadow-lg transition-all hover:opacity-95 hover:shadow-xl disabled:opacity-60 disabled:cursor-not-allowed"
                  >
                    {submitting ? "Sending..." : "Send Message"}
                  </button>

                  {error && (
                    <p className="text-sm text-red-500 dark:text-red-400">{error}</p>
                  )}
                </motion.form>
              ) : (
                <motion.div
                  key="success"
                  className="text-center py-10"
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.9 }}
                >
                  <div className="text-5xl mb-4">✅</div>
                  <h3 className="text-xl font-bold text-primary mb-2">Message sent!</h3>
                  <p className="text-muted">We'll get back to you shortly.</p>
                </motion.div>
              )}
            </AnimatePresence>
          </motion.div>
        </div>
      </motion.div>
    </section>
  );
};

export default Contact;
