import { motion } from "framer-motion";
import { useInView } from "framer-motion";
import { useRef } from "react";

const StatCard = ({ title, value, subtitle, delay = 0, icon }) => {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true });

  return (
    <motion.div
      ref={ref}
      className="group relative p-6 rounded-2xl bg-surface border-2 border-soft backdrop-blur-lg shadow-soft hover:shadow-glow transition-all duration-300 dark:bg-slate-900/80 dark:border-white/10 overflow-hidden text-slate-900 dark:text-white"
      initial={{ opacity: 0, y: 30 }}
      animate={isInView ? { opacity: 1, y: 0 } : {}}
      transition={{ delay, duration: 0.5 }}
      whileHover={{ scale: 1.05, y: -5 }}
    >
      {/* Gradient background on hover */}
      <motion.div
        className="absolute inset-0 bg-gradient-to-br from-primary/10 via-purple-500/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300"
        initial={false}
      />

      {/* Animated border */}
      <motion.div
        className="absolute inset-0 rounded-2xl border-2 border-primary/0 group-hover:border-primary/30 transition-colors duration-300"
        initial={false}
      />

      <div className="relative z-10">
        <div className="flex items-center justify-between mb-3">
          <h4 className="text-sm text-muted font-medium uppercase tracking-wide">
            {title}
          </h4>
          {icon && (
            <motion.span
              className="text-2xl"
              animate={{
                rotate: [0, 10, -10, 0],
                scale: [1, 1.1, 1],
              }}
              transition={{
                duration: 2,
                repeat: Infinity,
                ease: "easeInOut",
                delay: delay * 0.5,
              }}
            >
              {icon}
            </motion.span>
          )}
        </div>
        <motion.p
          className="text-4xl font-bold mb-2 bg-clip-text text-transparent bg-gradient-to-r from-primary to-purple-500"
          initial={{ scale: 0.8 }}
          animate={isInView ? { scale: 1 } : {}}
          transition={{ delay: delay + 0.2, type: "spring", stiffness: 200 }}
        >
          {value}
        </motion.p>
        <p className="text-sm text-muted">
          {subtitle}
        </p>
      </div>

      {/* Decorative corner */}
      <div className="absolute top-0 right-0 w-20 h-20 bg-primary/5 rounded-bl-full opacity-0 group-hover:opacity-100 transition-opacity" />
    </motion.div>
  );
};

export default StatCard;
