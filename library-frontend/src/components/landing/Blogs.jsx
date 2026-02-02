import { motion } from "framer-motion";
import { useInView } from "framer-motion";
import { useRef } from "react";
import { useNavigate } from "react-router-dom";
import { BLOG_POSTS } from "../../content/blogs";

const Blogs = () => {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, margin: "-100px" });
  const navigate = useNavigate();

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
    <section id="blogs" className="relative max-w-7xl mx-auto px-6 py-28 overflow-hidden">
      {/* Background decoration */}
      <div className="absolute inset-0 -z-10">
        <div className="absolute top-0 right-1/4 w-96 h-96 bg-primary/5 rounded-full blur-3xl animate-pulse-glow" />
        <div className="absolute bottom-0 left-1/4 w-96 h-96 bg-pink-500/5 rounded-full blur-3xl animate-pulse-glow" style={{ animationDelay: "1.5s" }} />
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
            Library Insights & Updates
          </motion.h2>
          <motion.p className="text-muted max-w-xl mx-auto text-lg" variants={itemVariants}>
            Learn about modern library systems, technology, and best practices.
          </motion.p>
        </motion.div>

        <div className="grid md:grid-cols-3 gap-8">
          {BLOG_POSTS.map((blog, index) => (
            <motion.div
              key={index}
              variants={itemVariants}
              className="group relative flex flex-col overflow-hidden rounded-3xl border-2 border-soft bg-surface p-6 text-left shadow-soft transition-all duration-500 hover:-translate-y-2 hover:shadow-glow-lg dark:border-white/10 dark:bg-slate-950/70"
              whileHover={{ scale: 1.03 }}
            >
              {/* Animated gradient background */}
              <motion.div
                className={`absolute inset-0 bg-gradient-to-br ${blog.gradient} opacity-0 group-hover:opacity-100 transition-opacity duration-500`}
                initial={false}
              />

              {/* Decorative icon */}
              <motion.div
                className="absolute top-4 right-4 text-4xl opacity-10 group-hover:opacity-20 transition-opacity"
                animate={{
                  rotate: [0, 10, -10, 0],
                  scale: [1, 1.1, 1],
                }}
                transition={{
                  duration: 4,
                  repeat: Infinity,
                  ease: "easeInOut",
                  delay: index * 0.3,
                }}
              >
                {blog.icon}
              </motion.div>

              {/* Content */}
              <div className="relative z-10">
                <motion.span
                  className="inline-block text-xs font-bold uppercase tracking-widest text-muted mb-4 px-3 py-1 rounded-full bg-soft/50 group-hover:bg-primary/10 group-hover:text-primary transition-colors"
                  whileHover={{ scale: 1.05 }}
                >
                  {blog.date}
                </motion.span>

                <h3 className="mt-3 mb-3 text-xl font-bold group-hover:text-primary transition-colors leading-tight">
                  {blog.title}
                </h3>

                <p className="mb-6 text-sm text-muted leading-relaxed">
                  {blog.summary}
                </p>

                <motion.button
                  type="button"
                  onClick={() => navigate(`/blogs?post=${blog.id}`)}
                  className="mt-auto inline-flex items-center gap-2 text-sm font-semibold text-primary group-hover:gap-3 transition-all"
                  whileHover={{ x: 5 }}
                  whileTap={{ scale: 0.97 }}
                >
                  Read more
                  <motion.span
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
              </div>

              {/* Shine effect on hover */}
              <motion.div
                className="absolute inset-0 bg-gradient-to-r from-transparent via-white/10 to-transparent opacity-0 group-hover:opacity-100"
                initial={{ x: "-100%" }}
                whileHover={{ x: "100%" }}
                transition={{ duration: 0.6 }}
              />
            </motion.div>
          ))}
        </div>

        <motion.div className="mt-16 text-center" variants={itemVariants}>
          <motion.button
            type="button"
            onClick={() => navigate("/blogs")}
            className="group relative overflow-hidden rounded-xl border-2 border-soft bg-soft px-8 py-3 text-sm font-semibold text-slate-900 shadow-sm transition-all hover:border-primary/60 hover:text-primary hover:shadow-md dark:border-white/15 dark:bg-transparent dark:text-white"
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
          >
            <span className="relative z-10">View All Blogs</span>
            <motion.div
              className="absolute inset-0 bg-gradient-to-r from-primary/10 to-purple-500/10 opacity-0 group-hover:opacity-100 transition-opacity"
              initial={false}
            />
          </motion.button>
        </motion.div>
      </motion.div>
    </section>
  );
};

export default Blogs;
