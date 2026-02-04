"use client";

import { useState } from "react";

interface RatingStarsProps {
  value: number;
  onChange?: (value: number) => void;
  readonly?: boolean;
  size?: "sm" | "md" | "lg";
}

export function RatingStars({ value, onChange, readonly = false, size = "md" }: RatingStarsProps) {
  const [hoverValue, setHoverValue] = useState<number | null>(null);

  const sizeClasses = {
    sm: "h-4 w-4",
    md: "h-5 w-5",
    lg: "h-6 w-6",
  };

  const handleClick = (star: number) => {
    if (!readonly && onChange) {
      onChange(star);
    }
  };

  const displayValue = hoverValue ?? value;

  return (
    <div className="flex items-center gap-1">
      {[1, 2, 3, 4, 5].map((star) => (
        <button
          key={star}
          type="button"
          onClick={() => handleClick(star)}
          onMouseEnter={() => !readonly && setHoverValue(star)}
          onMouseLeave={() => !readonly && setHoverValue(null)}
          disabled={readonly || !onChange}
          className={`${sizeClasses[size]} transition ${
            readonly || !onChange ? "cursor-default" : "cursor-pointer hover:scale-110"
          }`}
          aria-label={`${star} étoile${star > 1 ? "s" : ""}`}
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            fill={star <= displayValue ? "currentColor" : "none"}
            viewBox="0 0 24 24"
            strokeWidth={1.5}
            stroke="currentColor"
            className={`${sizeClasses[size]} ${
              star <= displayValue ? "text-amber-500" : "text-slate-300"
            }`}
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              d="M11.48 3.499a.562.562 0 0 1 1.04 0l2.125 5.111a.563.563 0 0 0 .475.345l5.518.442c.499.04.701.663.321.988l-4.204 3.602a.563.563 0 0 0-.182.557l1.285 5.385a.562.562 0 0 1-.84.61l-4.725-2.885a.562.562 0 0 0-.586 0L6.982 20.54a.562.562 0 0 1-.84-.61l1.285-5.386a.562.562 0 0 0-.182-.557l-4.204-3.602a.562.562 0 0 1 .321-.988l5.518-.442a.563.563 0 0 0 .475-.345L11.48 3.5Z"
            />
          </svg>
        </button>
      ))}
    </div>
  );
}
