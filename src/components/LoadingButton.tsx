"use client";

import { ButtonHTMLAttributes, ReactNode, useEffect, useState } from "react";
import { cn } from "@/lib/utils";

type LoadingButtonProps = ButtonHTMLAttributes<HTMLButtonElement> & {
  loading?: boolean;
  children: ReactNode;
};

export default function LoadingButton({
  loading = false,
  disabled,
  children,
  className,
  onClick,
  ...props
}: LoadingButtonProps) {
  const [pressed, setPressed] = useState(false);
  const isLoading = loading || pressed;

  useEffect(() => {
    if (!pressed) {
      return;
    }
    const timer = window.setTimeout(() => setPressed(false), 650);
    return () => window.clearTimeout(timer);
  }, [pressed]);

  return (
    <button
      disabled={disabled || loading}
      className={cn("relative overflow-hidden", className)}
      aria-busy={isLoading}
      onClick={(event) => {
        if (!disabled && !loading) {
          setPressed(true);
        }
        onClick?.(event);
      }}
      {...props}
    >
      <span className={cn("inline-flex items-center justify-center gap-2", isLoading && "opacity-0")}>
        {children}
      </span>
      {isLoading && (
        <span className="absolute inset-0 grid place-items-center">
          <span className="size-5 animate-spin rounded-full border-2 border-current/25 border-t-current" />
        </span>
      )}
    </button>
  );
}
