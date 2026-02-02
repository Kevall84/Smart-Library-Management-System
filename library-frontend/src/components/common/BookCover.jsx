import { useState } from "react";

const sizes = {
  sm: "w-12 h-[4.5rem] min-w-[3rem] min-h-[4.5rem] text-base",
  md: "w-24 h-36 min-w-[6rem] min-h-[9rem] text-xl",
  lg: "w-40 h-60 min-w-[10rem] min-h-[15rem] text-3xl",
  xl: "w-48 h-72 min-w-[12rem] min-h-[18rem] text-4xl",
};

/**
 * Book cover image or placeholder. Use when no cover URL or image fails to load.
 */
const BookCover = ({ src, title = "", size = "md", className = "", ...props }) => {
  const [failed, setFailed] = useState(false);
  const showImg = src && !failed;
  const initial = (title || "?").trim().charAt(0).toUpperCase();
  const sizeClass = sizes[size] || sizes.md;

  return (
    <div
      className={`${sizeClass} rounded-lg overflow-hidden flex-shrink-0 bg-white/10 border border-white/10 flex items-center justify-center ${className}`}
      {...props}
    >
      {showImg ? (
        <img
          src={src}
          alt={`Cover: ${title}`}
          className="w-full h-full object-cover"
          onError={() => setFailed(true)}
        />
      ) : (
        <span className="text-muted font-bold select-none" aria-hidden="true">
          {initial}
        </span>
      )}
    </div>
  );
};

export default BookCover;
