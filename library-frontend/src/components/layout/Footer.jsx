import { motion } from "framer-motion";

const Footer = () => {
  const currentYear = new Date().getFullYear();

  return (
    <motion.footer
      className="relative border-t border-soft bg-soft/60 py-8 text-center text-xs text-muted sm:text-sm dark:border-white/10 dark:bg-slate-950/60 overflow-hidden"
      initial={{ opacity: 0 }}
      whileInView={{ opacity: 1 }}
      viewport={{ once: true }}
      transition={{ duration: 0.6 }}
    >
      {/* Decorative gradient */}
      <div className="absolute inset-0 bg-gradient-to-r from-transparent via-primary/5 to-transparent opacity-50" />

      <div className="relative z-10">
        <motion.p
          className="mb-2"
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ delay: 0.2 }}
        >
          © {currentYear} <span className="font-semibold text-primary">SmartLib</span>. Crafted for modern, smart libraries.
        </motion.p>
        <motion.div
          className="flex items-center justify-center gap-4 mt-4"
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
          transition={{ delay: 0.4 }}
        >
          {/* <motion.span
            className="text-lg"
            animate={{
              rotate: [0, 360],
            }}
            transition={{
              duration: 20,
              repeat: Infinity,
              ease: "linear",
            }}
          >
            📚
          </motion.span>
          <motion.span
            className="text-lg"
            animate={{
              rotate: [0, -360],
            }}
            transition={{
              duration: 25,
              repeat: Infinity,
              ease: "linear",
            }}
          >
            ✨
          </motion.span>
          <motion.span
            className="text-lg"
            animate={{
              rotate: [0, 360],
            }}
            transition={{
              duration: 30,
              repeat: Infinity,
              ease: "linear",
            }}
          >
            🚀
          </motion.span> */}
        </motion.div>
      </div>
    </motion.footer>
  );
};

export default Footer;
