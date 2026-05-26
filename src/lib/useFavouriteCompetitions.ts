"use client";

import { useCallback, useEffect, useState } from "react";

const STORAGE_KEY = "solakuti-fav-competitions";

export function useFavouriteCompetitions() {
  const [favourites, setFavourites] = useState<string[]>([]);

  useEffect(() => {
    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      if (stored) setFavourites(JSON.parse(stored));
    } catch {}
  }, []);

  const toggle = useCallback((slug: string) => {
    setFavourites((prev) => {
      const next = prev.includes(slug) ? prev.filter((s) => s !== slug) : [...prev, slug];
      localStorage.setItem(STORAGE_KEY, JSON.stringify(next));
      return next;
    });
  }, []);

  const isFavourite = useCallback((slug: string) => favourites.includes(slug), [favourites]);

  return { favourites, toggle, isFavourite };
}
