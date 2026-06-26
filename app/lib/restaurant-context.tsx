"use client";

import { createContext, useContext, useEffect, useState, useCallback, type ReactNode } from "react";

export interface RestaurantInfo {
  id: string;
  slug: string;
  nameFa: string;
  nameEn: string;
  descriptionFa: string;
  descriptionEn: string;
  themeConfig: Record<string, string>;
  phone: string;
}

interface RestaurantContextValue {
  restaurant: RestaurantInfo | null;
  loading: boolean;
  setRestaurantSlug: (slug: string) => void;
  slug: string;
}

const RestaurantContext = createContext<RestaurantContextValue>({
  restaurant: null,
  loading: true,
  setRestaurantSlug: () => {},
  slug: "berlin-kontor",
});

function getSlugFromHostname(): string | null {
  if (typeof window === "undefined") return null;
  const hostname = window.location.hostname;

  // Handle *.localhost
  if (hostname.endsWith(".localhost")) {
    const slug = hostname.slice(0, hostname.lastIndexOf(".localhost"));
    if (slug && slug !== "www") return slug;
  }

  // Handle any subdomain of any domain (3+ dot-separated parts)
  const parts = hostname.split(".");
  if (parts.length >= 3) {
    const subdomain = parts[0];
    if (subdomain !== "www") return subdomain;
  }

  return null;
}

function getSlugFromPath(): string | null {
  if (typeof window === "undefined") return null;
  const path = window.location.pathname;
  const match = path.match(/^\/restaurant\/([^/]+)/);
  if (match) return match[1];
  return null;
}

function determineSlug(): string {
  const fromHostname = getSlugFromHostname();
  if (fromHostname) return fromHostname;

  const fromPath = getSlugFromPath();
  if (fromPath) return fromPath;

  const pathSegments = typeof window !== "undefined"
    ? window.location.pathname.split("/").filter(Boolean)
    : [];
  const firstSegment = pathSegments[0];
  const knownPaths = ["admin", "cafe", "api", "_next", "fonts", "restaurant"];
  if (firstSegment && !knownPaths.includes(firstSegment)) {
    return firstSegment;
  }

  return "berlin-kontor";
}

export function RestaurantProvider({ children }: { children: ReactNode }) {
  const [slug, setSlug] = useState<string>("berlin-kontor");
  const [restaurant, setRestaurant] = useState<RestaurantInfo | null>(null);
  const [loading, setLoading] = useState(true);

  const fetchRestaurant = useCallback(async (s: string) => {
    setLoading(true);
    try {
      const res = await fetch(`/api/restaurants/${s}`);
      if (res.ok) {
        const data = await res.json();
        const r = data.restaurant;
        setRestaurant({
          id: r.id,
          slug: r.slug,
          nameFa: r.nameFa,
          nameEn: r.nameEn,
          descriptionFa: r.descriptionFa,
          descriptionEn: r.descriptionEn,
          themeConfig: r.themeConfig || {},
          phone: r.phone,
        });
        applyTheme(r.themeConfig || {});
      } else {
        setRestaurant({
          id: "rest_default",
          slug: "berlin-kontor",
          nameFa: "کافه دیجیتال",
          nameEn: "Digital Café",
          descriptionFa: "کافه‌ای به سبک اروپایی",
          descriptionEn: "A European-style café",
          themeConfig: {},
          phone: "",
        });
      }
    } catch {
      setRestaurant({
        id: "rest_default",
        slug: "berlin-kontor",
        nameFa: "کافه دیجیتال",
        nameEn: "Digital Café",
        descriptionFa: "کافه‌ای به سبک اروپایی",
        descriptionEn: "A European-style café",
        themeConfig: {},
        phone: "",
      });
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    const detected = determineSlug();
    setSlug(detected);
    fetchRestaurant(detected);
  }, [fetchRestaurant]);

  const setRestaurantSlug = useCallback((newSlug: string) => {
    setSlug(newSlug);
    fetchRestaurant(newSlug);
  }, [fetchRestaurant]);

  return (
    <RestaurantContext.Provider value={{ restaurant, loading, setRestaurantSlug, slug }}>
      {children}
    </RestaurantContext.Provider>
  );
}

export function useRestaurant() {
  return useContext(RestaurantContext);
}

function applyTheme(theme: Record<string, string>) {
  if (typeof document === "undefined") return;
  const root = document.documentElement;
  const defaults: Record<string, string> = {
    "--bg-base": "#0C0A09",
    "--bg-surface": "#1C1917",
    "--bg-elevated": "#292524",
    "--border-subtle": "#3D352D",
    "--text-primary": "#EDE4D8",
    "--text-secondary": "#C4A88A",
    "--text-muted": "#8B7355",
    "--danger": "#9F391B",
    "--success": "#5A7A5A",
  };
  const merged = { ...defaults, ...theme };
  for (const [key, value] of Object.entries(merged)) {
    root.style.setProperty(key, value);
  }
}
