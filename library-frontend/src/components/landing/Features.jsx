import { motion } from "framer-motion";
import { useInView } from "framer-motion";
import { useRef } from "react";

const features = [
  {
    title: "Free Global eBooks",
    subtitle: "Online Digital Library",
    description:
      "Search and download thousands of legally free eBooks from global open resources. No limits, no cost.",
    points: [
      "Search by author or title",
      "Instant download",
      "No registration required",
    ],
    icon: "📚",
    gradient: "from-blue-500/20 via-purple-500/10 to-pink-500/20",
    borderGradient: "from-blue-500/50 to-purple-500/50",
  },
  {
    title: "Offline Smart Library",
    subtitle: "QR-Based Physical Books",
    description:
      "Rent physical books with transparent pricing, QR verification, and automated tracking.",
    points: [
      "₹ per-day rental",
      "QR code issue & return",
      "Automatic penalty calculation",
    ],
    icon: "📖",
    gradient: "from-emerald-500/20 via-cyan-500/10 to-blue-500/20",
    borderGradient: "from-emerald-500/50 to-cyan-500/50",
  },
];

const Features = () => {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, margin: "-100px" });

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.2,
      },
    },
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 50 },
    visible: {
      opacity: 1,
      y: 0,
      transition: {
        duration: 0.6,
        ease: "easeOut",
      },
    },
  };

  return (
    <section id="features" className="relative max-w-7xl mx-auto px-6 py-28 overflow-hidden">
      {/* Background decoration */}
      <div className="absolute inset-0 -z-10">
        <div className="absolute top-0 left-1/4 w-96 h-96 bg-primary/5 rounded-full blur-3xl animate-pulse-glow" />
        <div className="absolute bottom-0 right-1/4 w-96 h-96 bg-purple-500/5 rounded-full blur-3xl animate-pulse-glow" style={{ animationDelay: "1s" }} />
      </div>

      <motion.div
        ref={ref}
        initial="hidden"
        animate={isInView ? "visible" : "hidden"}
        variants={containerVariants}
      >
        <motion.div className="text-center mb-20" variants={itemVariants}>
          <motion.h2
            className="text-4xl md:text-5xl font-bold mb-4 bg-clip-text text-transparent bg-gradient-to-r from-primary via-purple-500 to-pink-500"
            variants={itemVariants}
          >
            Two Powerful Ways to Access Knowledge
          </motion.h2>
          <motion.p className="text-muted max-w-xl mx-auto text-lg" variants={itemVariants}>
            Choose digital convenience or physical reading — all in one platform.
          </motion.p>
        </motion.div>

        <div className="grid md:grid-cols-2 gap-10">
          {features.map((item, index) => (
            <motion.div
              key={index}
              variants={itemVariants}
              className="group relative overflow-hidden rounded-3xl border-2 border-soft bg-surface p-8 shadow-soft transition-all duration-500 hover:-translate-y-2 hover:shadow-glow-lg dark:border-white/10 dark:bg-slate-950/70"
              whileHover={{ scale: 1.02 }}
            >
              {/* Animated gradient background */}
              <motion.div
                className={`absolute inset-0 bg-gradient-to-br ${item.gradient} opacity-0 group-hover:opacity-100 transition-opacity duration-500`}
                initial={false}
              />

              {/* Animated border gradient */}
              <motion.div
                className={`absolute inset-0 rounded-3xl bg-gradient-to-r ${item.borderGradient} opacity-0 group-hover:opacity-100 transition-opacity duration-500 -z-10 blur-sm`}
                initial={false}
              />

              {/* Floating icon */}
              <motion.div
                className="relative mb-6"
                animate={{
                  y: [0, -10, 0],
                }}
                transition={{
                  duration: 3,
                  repeat: Infinity,
                  ease: "easeInOut",
                  delay: index * 0.5,
                }}
              >
                <div className="flex items-center gap-4 mb-2">
                  <motion.span
                    className="text-4xl"
                    animate={{
                      rotate: [0, 10, -10, 0],
                    }}
                    transition={{
                      duration: 4,
                      repeat: Infinity,
                      ease: "easeInOut",
                      delay: index * 0.3,
                    }}
                  >
                    {item.icon}
                  </motion.span>
                  <div>
                    <span className="text-sm text-muted uppercase tracking-wide font-semibold">
                      {item.subtitle}
                    </span>
                    <h3 className="text-2xl font-bold mt-1 group-hover:text-primary transition-colors">
                      {item.title}
                    </h3>
                  </div>
                </div>
              </motion.div>

              <p className="relative mb-6 text-sm text-muted leading-relaxed">
                {item.description}
              </p>

              <ul className="relative space-y-3">
                {item.points.map((point, i) => (
                  <motion.li
                    key={i}
                    className="flex items-center gap-3"
                    initial={{ opacity: 0, x: -20 }}
                    animate={isInView ? { opacity: 1, x: 0 } : {}}
                    transition={{
                      delay: 0.3 + index * 0.2 + i * 0.1,
                      duration: 0.4,
                    }}
                  >
                    <motion.span
                      className="flex h-6 w-6 items-center justify-center rounded-full bg-primary/15 text-xs font-semibold text-primary shadow-sm"
                      whileHover={{ scale: 1.2, rotate: 360 }}
                      transition={{ type: "spring", stiffness: 300 }}
                    >
                      ✓
                    </motion.span>
                    <span className="text-sm">{point}</span>
                  </motion.li>
                ))}
              </ul>

              {/* Decorative elements */}
              <div className="absolute top-4 right-4 w-20 h-20 bg-primary/5 rounded-full blur-2xl group-hover:bg-primary/10 transition-colors" />
              <div className="absolute bottom-4 left-4 w-16 h-16 bg-purple-500/5 rounded-full blur-xl group-hover:bg-purple-500/10 transition-colors" />
            </motion.div>
          ))}
        </div>
      </motion.div>
    </section>
  );
};

export default Features;
