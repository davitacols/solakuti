"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { ComponentProps, ReactNode, useState } from "react";
import { cn } from "@/lib/utils";

type LoadingLinkProps = ComponentProps<typeof Link> & {
  children: ReactNode;
  loadingClassName?: string;
};

export default function LoadingLink({
  children,
  className,
  loadingClassName,
  href,
  onClick,
  ...props
}: LoadingLinkProps) {
  const pathname = usePathname();
  const [loading, setLoading] = useState(false);
  const hrefString = typeof href === "string" ? href : href.toString();

  return (
    <Link
      href={href}
      className={cn("relative", className, loading && loadingClassName)}
      aria-busy={loading}
      onClick={(event) => {
        onClick?.(event);
        if (!event.defaultPrevented && hrefString !== pathname) {
          setLoading(true);
        }
      }}
      {...props}
    >
      {children}
      {loading && (
        <span className="pointer-events-none absolute inset-0 grid place-items-center rounded-[inherit] bg-black/35 backdrop-blur-[1px]">
          <span className="size-5 animate-spin rounded-full border-2 border-white/35 border-t-white" />
        </span>
      )}
    </Link>
  );
}
