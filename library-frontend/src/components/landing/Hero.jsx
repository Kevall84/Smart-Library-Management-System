import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";

const Hero = () => {
  const navigate = useNavigate();

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.2,
        delayChildren: 0.1,
      },
    },
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 30 },
    visible: {
      opacity: 1,
      y: 0,
      transition: {
        duration: 0.6,
        ease: "easeOut",
      },
    },
  };

  const imageVariants = {
    hidden: { opacity: 0, scale: 0.9 },
    visible: {
      opacity: 1,
      scale: 1,
      transition: {
        duration: 0.8,
        ease: "easeOut",
      },
    },
  };

  return (
    <section className="relative overflow-hidden border-b border-soft bg-gradient-to-b from-primary/5 via-transparent to-transparent dark:border-white/10">
      {/* Animated Background Doodles */}
      <div className="pointer-events-none absolute inset-0 -z-10 overflow-hidden">
        <motion.div
          className="absolute -left-32 top-0 h-72 w-72 rounded-full bg-primary/20 blur-3xl dark:bg-primary/30"
          animate={{
            x: [0, 50, 0],
            y: [0, 30, 0],
            scale: [1, 1.1, 1],
          }}
          transition={{
            duration: 8,
            repeat: Infinity,
            ease: "easeInOut",
          }}
        />
        <motion.div
          className="absolute bottom-0 right-0 h-80 w-80 rounded-full bg-indigo-300/40 blur-3xl dark:bg-slate-800/60"
          animate={{
            x: [0, -30, 0],
            y: [0, -20, 0],
            scale: [1, 1.15, 1],
          }}
          transition={{
            duration: 10,
            repeat: Infinity,
            ease: "easeInOut",
          }}
        />
        <motion.div
          className="absolute top-1/2 left-1/4 h-64 w-64 rounded-full bg-purple-300/20 blur-3xl dark:bg-purple-500/20"
          animate={{
            x: [0, 40, 0],
            y: [0, -40, 0],
            scale: [1, 1.2, 1],
          }}
          transition={{
            duration: 12,
            repeat: Infinity,
            ease: "easeInOut",
          }}
        />
      </div>

      <motion.div
        className="relative mx-auto flex max-w-7xl flex-col items-center gap-12 px-6 pt-28 pb-24 lg:flex-row lg:pt-32"
        variants={containerVariants}
        initial="hidden"
        animate="visible"
      >
        <motion.div
          className="max-w-xl text-center lg:text-left"
          variants={itemVariants}
        >
          <motion.div
            className="inline-flex items-center gap-2 rounded-full border border-soft bg-soft px-3 py-1 text-xs font-medium text-muted shadow-sm dark:bg-slate-900/70"
            whileHover={{ scale: 1.05 }}
            transition={{ type: "spring", stiffness: 400 }}
          >
            <motion.span
              className="h-1.5 w-1.5 rounded-full bg-primary"
              animate={{
                scale: [1, 1.3, 1],
                opacity: [1, 0.7, 1],
              }}
              transition={{
                duration: 2,
                repeat: Infinity,
                ease: "easeInOut",
              }}
            />
            <span>Modern Library Management · Online & Offline</span>
          </motion.div>

          <motion.h1
            className="mt-5 font-display text-4xl font-bold leading-tight tracking-tight text-slate-900 sm:text-5xl md:text-6xl dark:text-white"
            variants={itemVariants}
          >
            Libraries,
            <span className="gradient-text"> reimagined</span>
            <br className="hidden sm:block" />
            for the digital age.
          </motion.h1>

          <motion.p
            className="mt-6 max-w-xl text-base text-muted sm:text-lg"
            variants={itemVariants}
          >
            Discover free global eBooks or rent physical books seamlessly with
            QR-based workflows, transparent pricing, and a beautiful, focused
            reading experience.
          </motion.p>

          <motion.div
            className="mt-8 flex flex-col items-center gap-4 sm:flex-row lg:items-center"
            variants={itemVariants}
          >
            <motion.button
              onClick={() =>
                navigate("/login", {
                  state: { redirectTo: "/ebooks" },
                })
              }
              className="group inline-flex items-center justify-center rounded-xl bg-gradient-primary px-6 py-3 text-sm font-semibold text-white shadow-glow transition-all hover:-translate-y-0.5 hover:shadow-glow-lg"
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            >
              Explore free eBooks
              <motion.span
                className="ml-2 text-base"
                animate={{ x: [0, 5, 0] }}
                transition={{
                  duration: 1.5,
                  repeat: Infinity,
                  ease: "easeInOut",
                }}
              >
                →
              </motion.span>
            </motion.button>

            <motion.button
              onClick={() =>
                navigate("/login", {
                  state: { redirectTo: "/offline-books" },
                })
              }
              className="inline-flex items-center justify-center rounded-xl border border-soft bg-soft px-6 py-3 text-sm font-medium text-slate-900 shadow-sm transition-all hover:border-primary/60 hover:text-primary hover:shadow-md dark:border-white/15 dark:bg-transparent dark:text-white"
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            >
              Visit offline library
            </motion.button>
          </motion.div>

          <motion.div
            className="mt-6 flex flex-wrap items-center justify-center gap-6 text-xs text-muted sm:justify-start"
            variants={itemVariants}
          >
            <motion.div
              className="flex items-center gap-2"
              whileHover={{ scale: 1.05 }}
            >
              <motion.span
                className="h-6 w-6 rounded-lg bg-emerald-500/15 text-[11px] font-semibold text-emerald-600 dark:bg-emerald-500/20 dark:text-emerald-300 flex items-center justify-center"
                animate={{ rotate: [0, 5, -5, 0] }}
                transition={{
                  duration: 2,
                  repeat: Infinity,
                  ease: "easeInOut",
                }}
              >
                24x7
              </motion.span>
              <span>Access to global open eBook catalogs</span>
            </motion.div>
            <motion.div
              className="flex items-center gap-2"
              whileHover={{ scale: 1.05 }}
            >
              <motion.span
                className="h-6 w-6 rounded-lg bg-amber-500/15 text-[11px] font-semibold text-amber-700 dark:bg-amber-500/20 dark:text-amber-200 flex items-center justify-center"
                animate={{ rotate: [0, -5, 5, 0] }}
                transition={{
                  duration: 2,
                  repeat: Infinity,
                  ease: "easeInOut",
                  delay: 0.5,
                }}
              >
                QR
              </motion.span>
              <span>Smart QR rentals & transparent penalties</span>
            </motion.div>
          </motion.div>
        </motion.div>

        <motion.div
          className="relative flex-1"
          variants={imageVariants}
        >
          <div className="relative mx-auto max-w-md">
            <motion.div
              className="absolute -inset-6 rounded-[2.5rem] bg-gradient-to-tr from-primary/30 via-transparent to-indigo-400/40 opacity-70 blur-3xl dark:from-primary/40 dark:to-indigo-500/50"
              animate={{
                opacity: [0.5, 0.8, 0.5],
                scale: [1, 1.05, 1],
              }}
              transition={{
                duration: 4,
                repeat: Infinity,
                ease: "easeInOut",
              }}
            />

            <motion.div
              className="relative overflow-hidden rounded-[2rem] bg-surface shadow-glow ring-1 ring-white/40 dark:bg-slate-950/80 dark:ring-white/10"
              whileHover={{ scale: 1.02 }}
              transition={{ type: "spring", stiffness: 300 }}
            >
              <img
                src="https://images.unsplash.com/photo-1481627834876-b7833e8f5570?auto=format&fit=crop&w=1400&q=80"
                alt="Library shelves filled with books"
                className="h-72 w-full object-cover sm:h-80 md:h-96"
              />
              <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/80 via-black/40 to-transparent px-5 pb-4 pt-16">
                <p className="text-[11px] font-semibold uppercase tracking-[0.2em] text-primary/60">
                  Live library snapshot
                </p>
                <p className="mt-1 text-sm font-medium text-slate-100">
                  Track rentals, returns, and penalties in one clean dashboard.
                </p>
              </div>
            </motion.div>

            <motion.div
              className="absolute -bottom-8 -left-4 w-40 rounded-2xl bg-surface p-4 text-xs shadow-soft ring-1 ring-white/50 dark:bg-slate-950/90 dark:ring-white/10"
              animate={{
                y: [0, -8, 0],
                rotate: [0, 2, -2, 0],
              }}
              transition={{
                duration: 4,
                repeat: Infinity,
                ease: "easeInOut",
              }}
              whileHover={{ scale: 1.05 }}
            >
              <p className="font-semibold text-slate-900 dark:text-white">
                3x faster issue/return
              </p>
              <p className="mt-1 text-[11px] text-muted">
                QR-powered workflows reduce manual entry and errors.
              </p>
            </motion.div>

            <motion.div
              className="absolute -top-6 -right-2 w-32 rounded-2xl bg-surface p-3 text-[11px] shadow-soft ring-1 ring-white/60 dark:bg-slate-950/90 dark:ring-white/10"
              animate={{
                y: [0, -6, 0],
                rotate: [0, -2, 2, 0],
              }}
              transition={{
                duration: 5,
                repeat: Infinity,
                ease: "easeInOut",
                delay: 0.5,
              }}
              whileHover={{ scale: 1.05 }}
            >
              <p className="font-semibold text-emerald-600 dark:text-emerald-300">
                Late fees auto‑calculated
              </p>
              <p className="mt-1 text-[10px] text-muted">
                Clear breakdown for every rental.
              </p>
            </motion.div>
          </div>
        </motion.div>
      </motion.div>
    </section>
  );
};

export default Hero;
