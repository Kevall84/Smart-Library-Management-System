import { useEffect, useMemo } from "react";
import { useLocation } from "react-router-dom";
import { motion } from "framer-motion";
import { BLOG_POSTS } from "../content/blogs";

const useQuery = () => {
  const { search } = useLocation();
  return useMemo(() => new URLSearchParams(search), [search]);
};

const BlogsPage = () => {
  const query = useQuery();
  const activePostId = query.get("post");

  useEffect(() => {
    if (activePostId) {
      const el = document.getElementById(`blog-${activePostId}`);
      if (el) {
        el.scrollIntoView({ behavior: "smooth", block: "start" });
      }
    } else {
      window.scrollTo({ top: 0, behavior: "smooth" });
    }
  }, [activePostId]);

  return (
    <main className="relative max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-24">
      {/* Background decoration */}
      <div className="pointer-events-none absolute inset-0 -z-10">
        <div className="absolute -top-10 left-0 w-80 h-80 bg-primary/10 rounded-full blur-3xl" />
        <div className="absolute bottom-0 right-0 w-96 h-96 bg-purple-500/10 rounded-full blur-3xl" />
      </div>

      <header className="mb-12 text-center">
        <motion.h1
          className="text-4xl sm:text-5xl font-bold mb-4 bg-clip-text text-transparent bg-gradient-to-r from-primary via-purple-500 to-pink-500"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
        >
          Library Insights & Stories
        </motion.h1>
        <motion.p
          className="text-muted max-w-2xl mx-auto text-base sm:text-lg"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.1 }}
        >
          Deep dives into modern library workflows, digital transformation, and how SmartLib helps
          you run a hybrid library that readers love.
        </motion.p>
      </header>

      <section className="space-y-10">
        {BLOG_POSTS.map((blog, index) => {
          const isActive = blog.id === activePostId;
          return (
            <motion.article
              key={blog.id}
              id={`blog-${blog.id}`}
              className={`relative overflow-hidden rounded-3xl border-2 border-soft bg-surface shadow-soft dark:border-white/10 dark:bg-slate-950/80 ${
                isActive ? "ring-2 ring-primary/60 ring-offset-2 ring-offset-bg-soft" : ""
              }`}
              initial={{ opacity: 0, y: 40 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: index * 0.1 }}
            >
              {/* Gradient background */}
              <div className={`absolute inset-0 bg-gradient-to-br ${blog.gradient} opacity-30`} />

              <div className="relative z-10 grid gap-6 md:grid-cols-[minmax(0,1.6fr)_minmax(0,1fr)] p-6 sm:p-8">
                {/* Text content */}
                <div>
                  <div className="flex items-center gap-3 mb-4">
                    <span className="inline-flex h-8 w-8 items-center justify-center rounded-xl bg-primary/15 text-xl">
                      {blog.icon}
                    </span>
                    <div>
                      <p className="text-xs font-semibold uppercase tracking-[0.18em] text-muted">
                        {blog.date}
                      </p>
                      <h2 className="mt-1 text-xl sm:text-2xl font-bold leading-tight">
                        {blog.title}
                      </h2>
                    </div>
                  </div>

                  <p className="text-sm text-muted mb-4">{blog.summary}</p>

                  <div className="space-y-3 text-sm text-muted leading-relaxed">
                    {blog.content.map((paragraph, i) => (
                      <p key={i}>{paragraph}</p>
                    ))}
                  </div>
                </div>

                {/* Image side */}
                <div className="relative h-40 sm:h-48 md:h-full rounded-2xl overflow-hidden">
                  <img
                    src={blog.image}
                    alt={blog.title}
                    className="w-full h-full object-cover"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/50 via-transparent to-transparent" />
                </div>
              </div>
            </motion.article>
          );
        })}
      </section>
    </main>
  );
};

export default BlogsPage;

