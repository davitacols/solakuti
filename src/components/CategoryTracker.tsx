"use client";

import { useEffect } from "react";
import { trackCategoryView } from "@/components/ReadNext";

export default function CategoryTracker({ category }: { category: string }) {
  useEffect(() => {
    trackCategoryView(category);
  }, [category]);

  return null;
}
