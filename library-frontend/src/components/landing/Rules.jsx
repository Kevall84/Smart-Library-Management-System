import { motion } from "framer-motion";
import { useInView } from "framer-motion";
import { useRef } from "react";

const rules = [
  {
    step: "01",
    title: "Browse Offline Books",
    desc: "Explore available physical books and check real-time availability.",
    icon: "🔍",
    color: "blue",
  },
  {
    step: "02",
    title: "Select Rental Days",
    desc: "Choose how many days you want the book. Transparent per-day pricing.",
    icon: "📅",
    color: "purple",
  },
  {
    step: "03",
    title: "Online Payment",
    desc: "Complete payment securely before visiting the library.",
    icon: "💳",
    color: "green",
  },
  {
    step: "04",
    title: "QR Code Generated",
    desc: "A unique QR code is issued for book collection and return.",
    icon: "📱",
    color: "orange",
  },
  {
    step: "05",
    title: "Visit Library & Collect",
    desc: "Show QR code to librarian and collect your book instantly.",
    icon: "🏛️",
    color: "pink",
  },
  {
    step: "06",
    title: "Return & Penalty Check",
    desc: "Return on time to avoid automatic late penalties.",
    icon: "✅",
    color: "cyan",
  },
];

const Rules = () => {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, margin: "-50px" });

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.15,
      },
    },
  };

  const itemVariants = {
    hidden: { opacity: 0, x: -50 },
    visible: {
      opacity: 1,
      x: 0,
      transition: {
        duration: 0.6,
        ease: "easeOut",
      },
    },
  };

  const getColorClasses = (color) => {
    const colors = {
      blue: "from-blue-500/20 to-blue-600/10 border-blue-500/30 text-blue-600 dark:text-blue-400",
      purple: "from-purple-500/20 to-purple-600/10 border-purple-500/30 text-purple-600 dark:text-purple-400",
      green: "from-emerald-500/20 to-emerald-600/10 border-emerald-500/30 text-emerald-600 dark:text-emerald-400",
      orange: "from-orange-500/20 to-orange-600/10 border-orange-500/30 text-orange-600 dark:text-orange-400",
      pink: "from-pink-500/20 to-pink-600/10 border-pink-500/30 text-pink-600 dark:text-pink-400",
      cyan: "from-cyan-500/20 to-cyan-600/10 border-cyan-500/30 text-cyan-600 dark:text-cyan-400",
    };
    return colors[color] || colors.blue;
  };

  return (
    <section id="rules" className="relative max-w-7xl mx-auto px-6 py-28 overflow-hidden">
      {/* Background decoration */}
      <div className="absolute inset-0 -z-10">
        <div className="absolute top-1/4 left-0 w-72 h-72 bg-primary/5 rounded-full blur-3xl" />
        <div className="absolute bottom-1/4 right-0 w-72 h-72 bg-purple-500/5 rounded-full blur-3xl" />
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
            How Offline Library Works
          </motion.h2>
          <motion.p className="text-muted max-w-xl mx-auto text-lg" variants={itemVariants}>
            Simple, transparent and fully tracked using smart QR workflows.
          </motion.p>
        </motion.div>

        <div className="relative max-w-4xl mx-auto">
          {/* Timeline line */}
          <div className="absolute left-8 top-0 bottom-0 w-0.5 bg-gradient-to-b from-primary/30 via-purple-500/30 to-pink-500/30 dark:from-primary/50 dark:via-purple-500/50 dark:to-pink-500/50" />

          <div className="space-y-8">
            {rules.map((rule, index) => {
              const colorClasses = getColorClasses(rule.color);
              return (
                <motion.div
                  key={index}
                  className="relative flex items-start gap-6 group"
                  variants={itemVariants}
                  whileHover={{ x: 10 }}
                  transition={{ type: "spring", stiffness: 300 }}
                >
                  {/* Step number circle */}
                  <motion.div
                    className={`relative flex h-16 w-16 flex-shrink-0 items-center justify-center rounded-2xl bg-gradient-to-br ${colorClasses.split(' ')[0]} ${colorClasses.split(' ')[1]} border-2 ${colorClasses.split(' ')[2]} shadow-lg backdrop-blur-sm z-10`}
                    whileHover={{ scale: 1.1, rotate: 5 }}
                    transition={{ type: "spring", stiffness: 400 }}
                  >
                    <motion.span
                      className="text-2xl"
                      animate={{
                        rotate: [0, 10, -10, 0],
                      }}
                      transition={{
                        duration: 3,
                        repeat: Infinity,
                        ease: "easeInOut",
                        delay: index * 0.2,
                      }}
                    >
                      {rule.icon}
                    </motion.span>
                    <motion.div
                      className="absolute inset-0 rounded-2xl bg-gradient-to-br from-white/20 to-transparent"
                      animate={{
                        opacity: [0.3, 0.6, 0.3],
                      }}
                      transition={{
                        duration: 2,
                        repeat: Infinity,
                        ease: "easeInOut",
                      }}
                    />
                  </motion.div>

                  {/* Content card */}
                  <motion.div
                    className={`flex-1 rounded-2xl border-2 border-soft bg-surface px-6 py-5 shadow-soft transition-all duration-300 group-hover:shadow-glow group-hover:border-primary/30 dark:border-white/10 dark:bg-slate-950/70`}
                    whileHover={{ scale: 1.02 }}
                  >
                    <div className="flex items-center gap-3 mb-2">
                      <span className={`text-xs font-bold ${colorClasses.split(' ')[3]} ${colorClasses.split(' ')[4]}`}>
                        STEP {rule.step}
                      </span>
                    </div>
                    <h3 className="mb-2 text-lg font-bold sm:text-xl group-hover:text-primary transition-colors">
                      {rule.title}
                    </h3>
                    <p className="text-sm text-muted leading-relaxed">
                      {rule.desc}
                    </p>

                    {/* Decorative gradient */}
                    <motion.div
                      className={`absolute inset-0 rounded-2xl bg-gradient-to-br ${colorClasses.split(' ')[0]} ${colorClasses.split(' ')[1]} opacity-0 group-hover:opacity-100 transition-opacity duration-300 -z-10 blur-xl`}
                    />
                  </motion.div>
                </motion.div>
              );
            })}
          </div>
        </div>
      </motion.div>
    </section>
  );
};

export default Rules;
