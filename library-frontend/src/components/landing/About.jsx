import { useRef } from "react";
import { motion, useInView } from "framer-motion";
import { teamMembers } from "../../content/teamMembers";

const getInitials = (name) =>
  (name || "")
    .split(" ")
    .filter(Boolean)
    .slice(0, 2)
    .map((p) => p[0]?.toUpperCase())
    .join("");

const About = () => {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, margin: "-80px" });

  return (
    <section
      id="about"
      className="relative max-w-7xl mx-auto px-6 py-20 overflow-hidden"
    >
      <div className="absolute inset-0 -z-10">
        <div className="absolute top-1/3 right-0 w-80 h-80 bg-primary/5 rounded-full blur-3xl" />
        <div className="absolute bottom-1/3 left-0 w-80 h-80 bg-purple-500/5 rounded-full blur-3xl" />
      </div>

      <motion.div
        ref={ref}
        initial={{ opacity: 0, y: 24 }}
        animate={isInView ? { opacity: 1, y: 0 } : {}}
        transition={{ duration: 0.5 }}
        className="text-center mb-12"
      >
        <h2 className="text-4xl md:text-5xl font-bold mb-4 bg-clip-text text-transparent bg-gradient-to-r from-primary via-purple-500 to-pink-500">
          About Us
        </h2>
        <p className="text-muted max-w-2xl mx-auto text-lg">
          Meet the team behind SmartLib — building a modern library management system.
        </p>
      </motion.div>

      <motion.div
        initial={{ opacity: 0 }}
        animate={isInView ? { opacity: 1 } : {}}
        transition={{ duration: 0.5, delay: 0.15 }}
        className="flex flex-nowrap justify-center gap-4 md:gap-6 overflow-x-auto pb-2"
      >
        {teamMembers.map((member, index) => (
          <motion.a
            key={member.email}
            href={member.linkedin}
            target="_blank"
            rel="noreferrer"
            className="group flex flex-col items-center shrink-0"
            initial={{ opacity: 0, y: 20 }}
            animate={isInView ? { opacity: 1, y: 0 } : {}}
            transition={{ duration: 0.4, delay: 0.1 + index * 0.08 }}
            whileHover={{ y: -4 }}
          >
            <div className="aspect-square w-40 h-40 sm:w-44 sm:h-44 md:w-48 md:h-48 rounded-2xl border-2 border-slate-200 dark:border-white/10 bg-white/80 dark:bg-white/5 shadow-lg flex flex-col items-center justify-center p-4 transition-all group-hover:border-primary/40 group-hover:shadow-glow dark:group-hover:bg-white/10">
              <span className="text-3xl md:text-4xl font-bold bg-clip-text text-transparent bg-gradient-to-br from-primary to-purple-500 mb-2">
                {getInitials(member.name)}
              </span>
              <span className="text-sm font-semibold text-slate-900 dark:text-white text-center leading-tight line-clamp-2">
                {member.name}
              </span>
              <a
                href={`mailto:${member.email}`}
                onClick={(e) => e.stopPropagation()}
                className="text-xs text-muted hover:text-primary truncate w-full text-center mt-1"
              >
                {member.email}
              </a>
            </div>
            <span className="mt-3 text-xs font-medium text-primary opacity-0 group-hover:opacity-100 transition-opacity">
              LinkedIn →
            </span>
          </motion.a>
        ))}
      </motion.div>
    </section>
  );
};

export default About;
