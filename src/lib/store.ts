import { create } from "zustand";

export interface ListingImage {
  id: string;
  url: string;
  alt: string;
  order: number;
}

export interface Listing {
  id: string;
  slug: string;
  title: string;
  description: string;
  price: number;
  originalPrice?: number;
  currency: string;
  condition: string;
  categoryId: string;
  category: { id: string; name: string; slug: string; parentId: string | null };
  locationId: string;
  location: { id: string; name: string; slug: string };
  images: ListingImage[];
  contactName: string;
  contactPhone: string;
  contactEmail: string;
  isFeatured: boolean;
  isPromoted?: boolean;
  isNegotiable: boolean;
  views: number;
  createdAt: string;
  updatedAt: string;
  customFields?: string;
  tags?: string;
  user?: { id: string; name: string; avatar: string; isVerified: boolean; phone?: string | null };
  status?: string;
  isUrgent?: boolean;
}

export interface Category {
  id: string;
  name: string;
  slug: string;
  icon: string;
  parentId: string | null;
  children?: Category[];
  _count?: { listings: number };
}

export interface Location {
  id: string;
  name: string;
  slug: string;
}

export interface User {
  id: string;
  name: string;
  email: string;
  phone: string | null;
  avatar: string | null;
  role: string;
  isVerified: boolean;
}

export type ViewType = "home" | "listings" | "detail" | "favorites";

export interface Filters {
  location: string;
  minPrice: string;
  maxPrice: string;
  condition: string;
  sort: string;
}

interface AppState {
  view: ViewType;
  selectedCategory: string | null;
  selectedListing: Listing | null;
  searchQuery: string;
  filters: Filters;
  showPostAd: boolean;
  categories: Category[];
  locations: Location[];
  listings: Listing[];
  featuredListings: Listing[];
  isLoading: boolean;
  favorites: string[];
  recentlyViewed: Listing[];

  // Auth state — user only; session lives in HttpOnly cookie
  currentUser: User | null;
  /** @deprecated Session is cookie-based; always null. Kept for gradual migration. */
  authToken: string | null;

  setView: (view: ViewType) => void;
  setSelectedCategory: (slug: string | null) => void;
  setSelectedListing: (listing: Listing | null) => void;
  setSearchQuery: (query: string) => void;
  setFilters: (filters: Partial<Filters>) => void;
  clearFilters: () => void;
  setShowPostAd: (show: boolean) => void;
  setCategories: (categories: Category[]) => void;
  setLocations: (locations: Location[]) => void;
  setListings: (listings: Listing[]) => void;
  setFeaturedListings: (listings: Listing[]) => void;
  setIsLoading: (loading: boolean) => void;
  resetToHome: () => void;
  toggleFavorite: (listingId: string) => void;
  isFavorite: (listingId: string) => boolean;
  loadFavorites: () => void;
  getRecentlyViewed: () => Listing[];
  addRecentlyViewed: (listing: Listing) => void;
  deleteListing: (id: string) => void;

  // Auth actions
  setCurrentUser: (user: User | null) => void;
  /** @deprecated No-op — tokens are HttpOnly cookies set by the server. */
  setAuthToken: (token: string | null) => void;
  logout: () => Promise<void>;
  clearLegacyAuthStorage: () => void;
}

const defaultFilters: Filters = {
  location: "",
  minPrice: "",
  maxPrice: "",
  condition: "",
  sort: "newest",
};

const FAVORITES_KEY = "chapke_favorites";
const RECENT_KEY = "chapke_recent";

/** Legacy keys removed as part of cookie-session migration. */
const LEGACY_AUTH_KEYS = [
  "chapke_auth_token",
  "session_token",
  "user",
] as const;

function loadFromStorage<T>(key: string, fallback: T): T {
  if (typeof window === "undefined") return fallback;
  try {
    const raw = localStorage.getItem(key);
    return raw ? JSON.parse(raw) : fallback;
  } catch {
    return fallback;
  }
}

function clearLegacyAuthKeys() {
  if (typeof window === "undefined") return;
  for (const key of LEGACY_AUTH_KEYS) {
    try {
      localStorage.removeItem(key);
    } catch {
      /* ignore */
    }
  }
  // Clear any non-HttpOnly cookie remnants from older clients
  try {
    document.cookie =
      "session_token=; path=/; max-age=0; SameSite=Lax";
  } catch {
    /* ignore */
  }
}

export const useAppStore = create<AppState>((set, get) => ({
  view: "home",
  selectedCategory: null,
  selectedListing: null,
  searchQuery: "",
  filters: { ...defaultFilters },
  showPostAd: false,
  categories: [],
  locations: [],
  listings: [],
  featuredListings: [],
  isLoading: false,
  favorites: loadFromStorage<string[]>(FAVORITES_KEY, []),
  recentlyViewed: [],

  // Never hydrate auth from localStorage — session is HttpOnly cookie only
  currentUser: null,
  authToken: null,

  setView: (view) => set({ view }),
  setSelectedCategory: (slug) =>
    set({ selectedCategory: slug, view: slug ? "listings" : "home" }),
  setSelectedListing: (listing) => {
    if (listing) {
      get().addRecentlyViewed(listing);
    }
    set({ selectedListing: listing, view: listing ? "detail" : "home" });
  },
  setSearchQuery: (query) => set({ searchQuery: query }),
  setFilters: (partial) =>
    set((state) => ({ filters: { ...state.filters, ...partial } })),
  clearFilters: () =>
    set({
      filters: { ...defaultFilters },
      selectedCategory: null,
      searchQuery: "",
      view: "home",
    }),
  setShowPostAd: (show) => set({ showPostAd: show }),
  setCategories: (categories) => set({ categories }),
  setLocations: (locations) => set({ locations }),
  setListings: (listings) => set({ listings }),
  setFeaturedListings: (listings) => set({ featuredListings: listings }),
  setIsLoading: (loading) => set({ isLoading: loading }),
  resetToHome: () =>
    set({
      view: "home",
      selectedCategory: null,
      selectedListing: null,
      searchQuery: "",
      filters: { ...defaultFilters },
    }),

  // Favorites
  loadFavorites: () => {
    if (typeof window === "undefined") return;
    try {
      const stored = localStorage.getItem(FAVORITES_KEY);
      if (stored) set({ favorites: JSON.parse(stored) });
    } catch {}
  },

  toggleFavorite: (listingId: string) => {
    const { favorites } = get();
    const next = favorites.includes(listingId)
      ? favorites.filter((id) => id !== listingId)
      : [...favorites, listingId];
    set({ favorites: next });
    try {
      localStorage.setItem(FAVORITES_KEY, JSON.stringify(next));
    } catch {}
  },

  isFavorite: (listingId: string) => {
    return get().favorites.includes(listingId);
  },

  // Recently viewed
  getRecentlyViewed: () => {
    if (typeof window === "undefined") return [];
    try {
      const stored = localStorage.getItem(RECENT_KEY);
      if (!stored) return [];
      const ids: string[] = JSON.parse(stored);
      const { listings } = get();
      return ids
        .map((id) => listings.find((l) => l.id === id))
        .filter(Boolean) as Listing[];
    } catch {
      return [];
    }
  },

  addRecentlyViewed: (listing: Listing) => {
    if (typeof window === "undefined") return;
    try {
      const stored = localStorage.getItem(RECENT_KEY);
      const ids: string[] = stored ? JSON.parse(stored) : [];
      const next = [listing.id, ...ids.filter((id) => id !== listing.id)].slice(0, 12);
      localStorage.setItem(RECENT_KEY, JSON.stringify(next));
      const { listings } = get()
      const recent = next.map((id) => listings.find((l) => l.id === id)).filter(Boolean) as Listing[]
      set({ recentlyViewed: recent })
    } catch {}
  },

  deleteListing: (id: string) => {
    set((state) => ({
      listings: state.listings.filter((l) => l.id !== id),
      featuredListings: state.featuredListings.filter((l) => l.id !== id),
      selectedListing: state.selectedListing?.id === id ? null : state.selectedListing,
    }));
  },

  // Auth actions
  setCurrentUser: (user) => {
    set({ currentUser: user });
  },

  setAuthToken: () => {
    // No-op: session token is only set via HttpOnly cookie by the server
    set({ authToken: null });
  },

  clearLegacyAuthStorage: () => {
    clearLegacyAuthKeys();
  },

  logout: async () => {
    try {
      await fetch("/api/auth/logout", {
        method: "POST",
        credentials: "include",
      });
    } catch {
      /* network errors still clear client state */
    }
    clearLegacyAuthKeys();
    set({ currentUser: null, authToken: null });
  },
}));
