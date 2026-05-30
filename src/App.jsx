import { useEffect, useMemo, useState } from "react";
import { createClient } from "@supabase/supabase-js";

const ENV = (() => {
  try {
    return import.meta.env || {};
  } catch {
    return typeof window !== "undefined" && window.__MYCASE_ENV__ ? window.__MYCASE_ENV__ : {};
  }
})();

const WHATSAPP_NUMBER = "22675531991";
const ADMIN_EMAIL = String(ENV.VITE_ADMIN_EMAIL || "admin@example.com").toLowerCase();
const SUPABASE_URL = String(ENV.VITE_SUPABASE_URL || "");
const SUPABASE_PUBLISHABLE_KEY = String(ENV.VITE_SUPABASE_PUBLISHABLE_KEY || "");
const supabase = SUPABASE_URL && SUPABASE_PUBLISHABLE_KEY
  ? createClient(SUPABASE_URL, SUPABASE_PUBLISHABLE_KEY)
  : null;
const SITE_IMAGES_BUCKET = "site-images";

const LOCAL_KEYS = {
  categories: "mycase_categories_v4",
  products: "mycase_products_v4",
  heroImages: "mycase_hero_images_v4",
  cart: "mycase_cart_v4",
};

function safeReadLocalStorage(key, fallback) {
  try {
    const saved = window.localStorage.getItem(key);
    return saved ? JSON.parse(saved) : fallback;
  } catch {
    return fallback;
  }
}

function safeWriteLocalStorage(key, value) {
  try {
    window.localStorage.setItem(key, JSON.stringify(value));
  } catch {
    // Le site continue de fonctionner même si le navigateur bloque localStorage.
  }
}

function slugify(value) {
  return String(value || "")
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)/g, "");
}

function formatPrice(price) {
  return `${new Intl.NumberFormat("fr-FR").format(Number(price || 0))} FCFA`;
}

function getCartTotal(cart) {
  return cart.reduce((total, item) => total + Number(item.price || 0) * Number(item.quantity || 0), 0);
}

function getCartCount(cart) {
  return cart.reduce((total, item) => total + Number(item.quantity || 0), 0);
}

function Icon({ name, className = "h-5 w-5" }) {
  const baseProps = {
    className,
    viewBox: "0 0 24 24",
    fill: "none",
    stroke: "currentColor",
    strokeWidth: 2,
    strokeLinecap: "round",
    strokeLinejoin: "round",
    "aria-hidden": "true",
  };

  const icons = {
    cart: (
      <svg {...baseProps}>
        <circle cx="9" cy="21" r="1" />
        <circle cx="20" cy="21" r="1" />
        <path d="M1 1h4l2.7 13.4a2 2 0 0 0 2 1.6h8.9a2 2 0 0 0 2-1.6L23 6H6" />
      </svg>
    ),
    search: (
      <svg {...baseProps}>
        <circle cx="11" cy="11" r="8" />
        <path d="m21 21-4.35-4.35" />
      </svg>
    ),
    plus: (
      <svg {...baseProps}>
        <path d="M12 5v14" />
        <path d="M5 12h14" />
      </svg>
    ),
    minus: (
      <svg {...baseProps}>
        <path d="M5 12h14" />
      </svg>
    ),
    trash: (
      <svg {...baseProps}>
        <path d="M3 6h18" />
        <path d="M8 6V4h8v2" />
        <path d="M19 6l-1 14H6L5 6" />
        <path d="M10 11v6" />
        <path d="M14 11v6" />
      </svg>
    ),
    upload: (
      <svg {...baseProps}>
        <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
        <path d="M17 8l-5-5-5 5" />
        <path d="M12 3v12" />
      </svg>
    ),
    back: (
      <svg {...baseProps}>
        <path d="M19 12H5" />
        <path d="m12 19-7-7 7-7" />
      </svg>
    ),
    check: (
      <svg {...baseProps}>
        <path d="M20 6 9 17l-5-5" />
      </svg>
    ),
    lock: (
      <svg {...baseProps}>
        <rect x="4" y="10" width="16" height="10" rx="2" />
        <path d="M8 10V7a4 4 0 0 1 8 0v3" />
      </svg>
    ),
    settings: (
      <svg {...baseProps}>
        <circle cx="12" cy="12" r="3" />
        <path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1-2.83 2.83l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-4 0v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83-2.83l.06-.06A1.65 1.65 0 0 0 4.68 15a1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1 0-4h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 2.83-2.83l.06.06A1.65 1.65 0 0 0 9 4.68a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 4 0v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 2.83l-.06.06A1.65 1.65 0 0 0 19.4 9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 0 4h-.09a1.65 1.65 0 0 0-1.51 1z" />
      </svg>
    ),
    logout: (
      <svg {...baseProps}>
        <path d="M10 17l5-5-5-5" />
        <path d="M15 12H3" />
        <path d="M21 19V5a2 2 0 0 0-2-2h-4" />
      </svg>
    ),
    star: (
      <svg {...baseProps}>
        <path d="m12 2 3.09 6.26L22 9.27l-5 4.87L18.18 21 12 17.77 5.82 21 7 14.14l-5-4.87 6.91-1.01L12 2Z" />
      </svg>
    ),
  };

  return icons[name] || null;
}

const DEFAULT_CATEGORIES = [
  {
    id: "anime",
    name: "Anime",
    description: "Naruto, Dragon Ball, One Piece et les univers manga les plus demandés.",
    image: "https://images.unsplash.com/photo-1618336753974-aae8e04506aa?w=1200&auto=format&fit=crop&q=80",
    subcategories: ["Naruto", "One Piece", "Dragon Ball", "Demon Slayer", "Jujutsu Kaisen"],
  },
  {
    id: "foot",
    name: "Foot",
    description: "Clubs, stars du football et univers sportifs.",
    image: "https://upload.wikimedia.org/wikipedia/commons/8/8c/Cristiano_Ronaldo_2018.jpg",
    subcategories: ["Cristiano Ronaldo", "PSG", "Real Madrid", "Barcelone", "Manchester City"],
  },
  {
    id: "pays",
    name: "Pays",
    description: "Des coques aux couleurs des pays et des drapeaux.",
    image: "https://images.unsplash.com/photo-1521295121783-8a321d551ad2?w=1200&auto=format&fit=crop&q=80",
    subcategories: ["Burkina Faso", "France", "Maroc", "Sénégal", "Côte d'Ivoire"],
  },
  {
    id: "photo",
    name: "Photo",
    description: "Ajoute ton propre visuel et crée une coque unique.",
    image: "https://images.unsplash.com/photo-1517841905240-472988babdf9?w=1200&auto=format&fit=crop&q=80",
    subcategories: ["Couple", "Famille", "Selfie", "Voyage", "Portrait"],
  },
  {
    id: "autres",
    name: "Autres",
    description: "Gaming, luxe, galaxie, néon et créations originales.",
    image: "https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=1200&auto=format&fit=crop&q=80",
    subcategories: ["Gaming", "Luxe", "Galaxy", "Neon", "Minimaliste"],
  },
];

const HERO_IMAGE_DEFAULTS = {
  heroAnime: "https://images.unsplash.com/photo-1612036782180-6f0b6cd846fe?w=900&auto=format&fit=crop&q=80",
  heroFoot: "https://upload.wikimedia.org/wikipedia/commons/8/8c/Cristiano_Ronaldo_2018.jpg",
  heroCustom: "https://placehold.co/700x700/38bdf8/ffffff?text=Custom+Case",
};

const PRODUCT_IMAGE_BY_SUBCATEGORY = {
  Naruto: "https://images.unsplash.com/photo-1601850494422-3cf14624b0b3?w=900&auto=format&fit=crop&q=80",
  "One Piece": "https://images.unsplash.com/photo-1612036782180-6f0b6cd846fe?w=900&auto=format&fit=crop&q=80",
  "Dragon Ball": "https://images.unsplash.com/photo-1612036781124-847f8939b154?w=900&auto=format&fit=crop&q=80",
  "Demon Slayer": "https://images.unsplash.com/photo-1607604276583-eef5d076aa5f?w=900&auto=format&fit=crop&q=80",
  "Jujutsu Kaisen": "https://images.unsplash.com/photo-1613376023733-0a73315d9b06?w=900&auto=format&fit=crop&q=80",
  "Cristiano Ronaldo": "https://upload.wikimedia.org/wikipedia/commons/8/8c/Cristiano_Ronaldo_2018.jpg",
  PSG: "https://images.unsplash.com/photo-1522778119026-d647f0596c20?w=900&auto=format&fit=crop&q=80",
  "Real Madrid": "https://images.unsplash.com/photo-1574629810360-7efbbe195018?w=900&auto=format&fit=crop&q=80",
  Barcelone: "https://images.unsplash.com/photo-1518091043644-c1d4457512c6?w=900&auto=format&fit=crop&q=80",
  "Manchester City": "https://images.unsplash.com/photo-1577223625816-7546f13df25d?w=900&auto=format&fit=crop&q=80",
  "Burkina Faso": "https://images.unsplash.com/photo-1523805009345-7448845a9e53?w=900&auto=format&fit=crop&q=80",
  France: "https://images.unsplash.com/photo-1502602898657-3e91760cbb34?w=900&auto=format&fit=crop&q=80",
  Maroc: "https://images.unsplash.com/photo-1539020140153-e8c237112e53?w=900&auto=format&fit=crop&q=80",
  Sénégal: "https://images.unsplash.com/photo-1523805009345-7448845a9e53?w=900&auto=format&fit=crop&q=80",
  "Côte d'Ivoire": "https://images.unsplash.com/photo-1523805009345-7448845a9e53?w=900&auto=format&fit=crop&q=80",
  Couple: "https://images.unsplash.com/photo-1516589178581-6cd7833ae3b2?w=900&auto=format&fit=crop&q=80",
  Famille: "https://images.unsplash.com/photo-1511895426328-dc8714191300?w=900&auto=format&fit=crop&q=80",
  Selfie: "https://images.unsplash.com/photo-1517841905240-472988babdf9?w=900&auto=format&fit=crop&q=80",
  Voyage: "https://images.unsplash.com/photo-1500530855697-b586d89ba3ee?w=900&auto=format&fit=crop&q=80",
  Portrait: "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=900&auto=format&fit=crop&q=80",
  Gaming: "https://images.unsplash.com/photo-1542751371-adc38448a05e?w=900&auto=format&fit=crop&q=80",
  Luxe: "https://images.unsplash.com/photo-1515562141207-7a88fb7ce338?w=900&auto=format&fit=crop&q=80",
  Galaxy: "https://images.unsplash.com/photo-1462331940025-496dfbfc7564?w=900&auto=format&fit=crop&q=80",
  Neon: "https://images.unsplash.com/photo-1550745165-9bc0b252726f?w=900&auto=format&fit=crop&q=80",
  Minimaliste: "https://images.unsplash.com/photo-1516321318423-f06f85e504b3?w=900&auto=format&fit=crop&q=80",
};

function createDefaultProducts(categories) {
  let order = 1;
  return categories.flatMap((category) =>
    category.subcategories.flatMap((subcategory) =>
      Array.from({ length: 2 }, (_, index) => ({
        id: `${category.id}-${slugify(subcategory)}-${index + 1}`,
        name: `Coque ${subcategory} ${index + 1}`,
        categoryId: category.id,
        categoryName: category.name,
        subcategory,
        price: 5500 + index * 1000,
        image: PRODUCT_IMAGE_BY_SUBCATEGORY[subcategory] || `https://placehold.co/900x900/0284c7/ffffff?text=${encodeURIComponent(subcategory)}`,
        popular: index === 0,
        active: true,
        rating: index === 0 ? 4.9 : 4.7,
        order: order++,
      }))
    )
  );
}

const DEFAULT_PRODUCTS = createDefaultProducts(DEFAULT_CATEGORIES);

function categoryFromDatabase(row) {
  return {
    id: row.id,
    name: row.name,
    description: row.description || "",
    image: row.image,
    subcategories: Array.isArray(row.subcategories) ? row.subcategories : [],
    sortOrder: Number(row.sort_order || 0),
  };
}

function categoryToDatabase(category, index = 0) {
  return {
    id: category.id,
    name: category.name,
    description: category.description || "",
    image: category.image,
    subcategories: category.subcategories || [],
    sort_order: Number(category.sortOrder ?? index + 1),
  };
}

function productFromDatabase(row) {
  return {
    id: row.id,
    name: row.name,
    categoryId: row.category_id,
    categoryName: row.category_name,
    subcategory: row.subcategory,
    price: Number(row.price || 0),
    image: row.image,
    popular: Boolean(row.popular),
    active: row.active !== false,
    rating: Number(row.rating || 4.8),
    order: Number(row.sort_order || 0),
  };
}

function productToDatabase(product, index = 0) {
  return {
    id: product.id,
    name: product.name,
    category_id: product.categoryId,
    category_name: product.categoryName,
    subcategory: product.subcategory,
    price: Number(product.price || 0),
    image: product.image,
    popular: Boolean(product.popular),
    active: product.active !== false,
    rating: Number(product.rating || 4.8),
    sort_order: Number(product.order ?? index + 1),
  };
}

function heroImagesFromAssets(rows) {
  const next = { ...HERO_IMAGE_DEFAULTS };
  rows.forEach((asset) => {
    if (asset?.id && asset?.image) next[asset.id] = asset.image;
  });
  return next;
}

function heroAssetToDatabase(id, image) {
  const labelById = {
    heroAnime: "Grande image accueil - Anime",
    heroFoot: "Grande image accueil - Foot",
    heroCustom: "Grande image accueil - Custom Case",
  };

  return {
    id,
    label: labelById[id] || id,
    image,
  };
}

function runSelfTests() {
  console.assert(DEFAULT_CATEGORIES.length === 5, "Il doit y avoir 5 catégories par défaut.");
  console.assert(DEFAULT_PRODUCTS.length === 50, "Il doit y avoir 50 produits par défaut.");
  console.assert(formatPrice(7500).includes("FCFA"), "Le prix doit être affiché en FCFA.");
  console.assert(getCartCount([{ quantity: 2 }, { quantity: 3 }]) === 5, "Le compteur du panier doit fonctionner.");
  console.assert(getCartTotal([{ price: 1000, quantity: 2 }, { price: 2500, quantity: 1 }]) === 4500, "Le total du panier doit fonctionner.");
  console.assert(slugify("Côte d'Ivoire") === "cote-d-ivoire", "Le slug doit être normalisé.");
  console.assert(ADMIN_EMAIL.includes("@"), "L’e-mail admin doit être valide.");
  console.assert(typeof SUPABASE_URL === "string", "L’URL Supabase doit toujours être une chaîne.");
  console.assert(typeof SUPABASE_PUBLISHABLE_KEY === "string", "La clé publique Supabase doit toujours être une chaîne.");
  console.assert(SITE_IMAGES_BUCKET === "site-images", "Le bucket d’images doit rester stable.");
  console.assert(categoryFromDatabase({ id: "anime", name: "Anime", description: "", image: "x", subcategories: ["Naruto"], sort_order: 1 }).name === "Anime", "La conversion catégorie Supabase doit fonctionner.");
  console.assert(productFromDatabase({ id: "p", name: "Produit", category_id: "anime", category_name: "Anime", subcategory: "Naruto", price: 5000, image: "x", popular: true, active: true, rating: 4.8, sort_order: 1 }).categoryId === "anime", "La conversion produit Supabase doit fonctionner.");
}

runSelfTests();

function Toast({ text, visible }) {
  if (!visible) return null;

  return (
    <div className="toast-enter fixed bottom-7 left-1/2 z-[80] flex -translate-x-1/2 items-center gap-2 rounded-full bg-slate-950 px-6 py-3 text-sm font-black text-white shadow-2xl">
      <Icon name="check" className="h-4 w-4 text-emerald-400" />
      {text}
    </div>
  );
}

function ProductCard({ product, onAdd, onOpen, animationDelay = 0 }) {
  return (
    <article
      className="fade-up group overflow-hidden rounded-[2rem] border border-white/70 bg-white shadow-xl shadow-sky-100/80 transition duration-500 hover:-translate-y-3 hover:shadow-2xl"
      style={{ animationDelay: `${animationDelay}ms` }}
    >
      <button type="button" onClick={() => onOpen(product)} className="relative block w-full overflow-hidden text-left">
        <img src={product.image} alt={product.name} className="h-72 w-full object-cover transition duration-700 group-hover:scale-110" />
        {product.popular && (
          <span className="absolute left-4 top-4 inline-flex items-center gap-1 rounded-full bg-white/95 px-3 py-1.5 text-xs font-black text-amber-600 shadow-lg">
            <Icon name="star" className="h-3.5 w-3.5" /> Populaire
          </span>
        )}
      </button>

      <div className="p-5">
        <span className="rounded-full bg-sky-100 px-3 py-1 text-xs font-black text-sky-700">{product.subcategory}</span>
        <h3 className="mt-3 text-xl font-black text-slate-950">{product.name}</h3>
        <p className="mt-1 text-sm font-semibold text-slate-400">{product.rating}/5 · Coque résistante</p>
        <div className="mt-5 flex items-center justify-between gap-3">
          <p className="text-lg font-black text-sky-700">{formatPrice(product.price)}</p>
          <button type="button" onClick={() => onAdd(product)} className="rounded-full bg-slate-950 px-4 py-2.5 text-sm font-black text-white transition duration-300 hover:scale-105 hover:bg-sky-600">
            Ajouter
          </button>
        </div>
      </div>
    </article>
  );
}

function AdminTextField({ label, value, onChange, type = "text", multiline = false }) {
  return (
    <label className="grid gap-2 text-sm font-black text-slate-700">
      <span>{label}</span>
      {multiline ? (
        <textarea value={value} onChange={onChange} className="min-h-28 rounded-2xl border border-slate-200 bg-white p-4 outline-none transition focus:border-sky-500" />
      ) : (
        <input type={type} value={value} onChange={onChange} className="rounded-2xl border border-slate-200 bg-white p-4 outline-none transition focus:border-sky-500" />
      )}
    </label>
  );
}

export default function MycaseAnimatedSite() {
  const [page, setPage] = useState(() => (window.location.hash === "#admin" ? "admin-login" : "home"));
  const [selectedCategoryId, setSelectedCategoryId] = useState(null);
  const [selectedSubcategory, setSelectedSubcategory] = useState(null);
  const [selectedProduct, setSelectedProduct] = useState(null);
  const [search, setSearch] = useState("");
  const [sortBy, setSortBy] = useState("popular");
  const [cart, setCart] = useState(() => safeReadLocalStorage(LOCAL_KEYS.cart, []));
  const [categories, setCategories] = useState(() => safeReadLocalStorage(LOCAL_KEYS.categories, DEFAULT_CATEGORIES));
  const [products, setProducts] = useState(() => safeReadLocalStorage(LOCAL_KEYS.products, DEFAULT_PRODUCTS));
  const [heroImages, setHeroImages] = useState(() => safeReadLocalStorage(LOCAL_KEYS.heroImages, HERO_IMAGE_DEFAULTS));
  const [toast, setToast] = useState({ visible: false, text: "" });

  const [customName, setCustomName] = useState("");
  const [customPhone, setCustomPhone] = useState("");
  const [customModel, setCustomModel] = useState("");
  const [customImage, setCustomImage] = useState(null);
  const [customImageFile, setCustomImageFile] = useState(null);
  const [customError, setCustomError] = useState("");
  const [customLoading, setCustomLoading] = useState(false);

  const [adminEmail, setAdminEmail] = useState(ADMIN_EMAIL === "admin@example.com" ? "" : ADMIN_EMAIL);
  const [adminPassword, setAdminPassword] = useState("");
  const [adminError, setAdminError] = useState("");
  const [session, setSession] = useState(null);
  const [authLoading, setAuthLoading] = useState(Boolean(supabase));
  const [remoteLoading, setRemoteLoading] = useState(Boolean(supabase));
  const [remoteConfigured, setRemoteConfigured] = useState(Boolean(supabase));
  const [databaseSeeded, setDatabaseSeeded] = useState(false);
  const isAdmin = Boolean(session?.user?.email?.toLowerCase() === ADMIN_EMAIL);
  const [adminTab, setAdminTab] = useState("images");
  const [draftProduct, setDraftProduct] = useState(null);
  const [draftCategory, setDraftCategory] = useState(null);

  const cartCount = useMemo(() => getCartCount(cart), [cart]);
  const cartTotal = useMemo(() => getCartTotal(cart), [cart]);

  const activeProducts = useMemo(() => products.filter((product) => product.active !== false), [products]);
  const selectedCategory = useMemo(() => categories.find((category) => category.id === selectedCategoryId) || null, [categories, selectedCategoryId]);
  const bestSellers = useMemo(() => activeProducts.filter((product) => product.popular).slice(0, 6), [activeProducts]);

  const visibleProducts = useMemo(() => {
    const filtered = activeProducts.filter((product) => {
      const sameCategory = product.categoryId === selectedCategoryId;
      const sameSubcategory = product.subcategory === selectedSubcategory;
      const matchesSearch = product.name.toLowerCase().includes(search.toLowerCase());
      return sameCategory && sameSubcategory && matchesSearch;
    });

    if (sortBy === "priceAsc") return [...filtered].sort((a, b) => a.price - b.price);
    if (sortBy === "priceDesc") return [...filtered].sort((a, b) => b.price - a.price);
    return [...filtered].sort((a, b) => Number(b.popular) - Number(a.popular));
  }, [activeProducts, search, selectedCategoryId, selectedSubcategory, sortBy]);

  useEffect(() => safeWriteLocalStorage(LOCAL_KEYS.cart, cart), [cart]);
  useEffect(() => safeWriteLocalStorage(LOCAL_KEYS.categories, categories), [categories]);
  useEffect(() => safeWriteLocalStorage(LOCAL_KEYS.products, products), [products]);
  useEffect(() => safeWriteLocalStorage(LOCAL_KEYS.heroImages, heroImages), [heroImages]);

  useEffect(() => {
    function handleHashChange() {
      if (window.location.hash === "#admin") {
        setPage(isAdmin ? "admin" : "admin-login");
      }
    }

    window.addEventListener("hashchange", handleHashChange);
    return () => window.removeEventListener("hashchange", handleHashChange);
  }, [isAdmin]);

  useEffect(() => {
    if (!supabase) {
      setAuthLoading(false);
      setRemoteLoading(false);
      setRemoteConfigured(false);
      return;
    }

    let active = true;

    supabase.auth.getSession().then(({ data }) => {
      if (!active) return;
      setSession(data.session || null);
      setAuthLoading(false);
    });

    const { data: authListener } = supabase.auth.onAuthStateChange((_event, nextSession) => {
      setSession(nextSession || null);
      setAuthLoading(false);
    });

    return () => {
      active = false;
      authListener.subscription.unsubscribe();
    };
  }, []);

  useEffect(() => {
    if (!supabase) return;
    loadRemoteContent();
  }, []);

  async function loadRemoteContent() {
    if (!supabase) return;

    setRemoteLoading(true);

    const [categoriesResult, productsResult, assetsResult] = await Promise.all([
      supabase.from("site_categories").select("*").order("sort_order", { ascending: true }),
      supabase.from("site_products").select("*").order("sort_order", { ascending: true }),
      supabase.from("site_assets").select("*").order("id", { ascending: true }),
    ]);

    if (categoriesResult.error || productsResult.error || assetsResult.error) {
      setRemoteLoading(false);
      showToast("Impossible de charger Supabase. Vérifie les tables et les règles RLS.");
      return;
    }

    if (categoriesResult.data?.length) {
      setCategories(categoriesResult.data.map(categoryFromDatabase));
    }

    if (productsResult.data?.length) {
      setProducts(productsResult.data.map(productFromDatabase));
    }

    if (assetsResult.data?.length) {
      setHeroImages(heroImagesFromAssets(assetsResult.data));
    }

    const hasRemoteContent = Boolean(categoriesResult.data?.length || productsResult.data?.length || assetsResult.data?.length);
    setDatabaseSeeded(hasRemoteContent);
    setRemoteLoading(false);
  }

  function showToast(text) {
    setToast({ visible: true, text });
    window.setTimeout(() => setToast({ visible: false, text: "" }), 2200);
  }

  function navigate(nextPage) {
    if (nextPage !== "admin" && nextPage !== "admin-login") window.location.hash = "";
    setPage(nextPage);
    setSelectedProduct(null);

    if (nextPage !== "shop") {
      setSelectedCategoryId(null);
      setSelectedSubcategory(null);
    }

    window.scrollTo({ top: 0, behavior: "smooth" });
  }

  function openCategory(categoryId) {
    setPage("shop");
    setSelectedCategoryId(categoryId);
    setSelectedSubcategory(null);
    setSelectedProduct(null);
    window.scrollTo({ top: 0, behavior: "smooth" });
  }

  function addToCart(product) {
    setCart((current) => {
      const existing = current.find((item) => item.id === product.id);
      if (existing) {
        return current.map((item) => item.id === product.id ? { ...item, quantity: item.quantity + 1 } : item);
      }
      return [...current, { ...product, quantity: 1 }];
    });
    showToast(`${product.name} ajouté au panier`);
  }

  function decreaseCartItem(productId) {
    setCart((current) => current.map((item) => item.id === productId ? { ...item, quantity: item.quantity - 1 } : item).filter((item) => item.quantity > 0));
  }

  function removeCartItem(productId) {
    setCart((current) => current.filter((item) => item.id !== productId));
    showToast("Produit retiré du panier");
  }

  function openWhatsApp(message) {
    window.open(`https://wa.me/${WHATSAPP_NUMBER}?text=${encodeURIComponent(message)}`, "_blank");
  }

  async function submitCustomization() {
  setCustomError("");

  if (!customName.trim() || !customPhone.trim() || !customModel.trim()) {
    setCustomError("Complète ton nom, ton téléphone et le modèle du téléphone.");
    return;
  }

  setCustomLoading(true);

  try {
    let imageUrl = "";

    if (customImageFile) {
      imageUrl = await uploadImageToSupabase(customImageFile, "custom-orders");
    }

    const whatsappMessage = [
      "Bonjour Mycase, je souhaite personnaliser une coque.",
      `Nom : ${customName}`,
      `Téléphone : ${customPhone}`,
      `Modèle : ${customModel}`,
      imageUrl ? `Image à utiliser : ${imageUrl}` : "Image : non jointe",
    ].join("\n");

    openWhatsApp(whatsappMessage);
    showToast("Demande de personnalisation préparée pour WhatsApp");
  } catch (error) {
    setCustomError(`Image non envoyée : ${error.message}`);
  } finally {
    setCustomLoading(false);
  }
}

  function submitCartOrder() {
    const detail = cart.map((item) => `- ${item.name} x${item.quantity} : ${formatPrice(item.price * item.quantity)}`).join("\n");
    openWhatsApp(`Bonjour Mycase, je souhaite commander :\n${detail}\nTotal : ${formatPrice(cartTotal)}`);
  }

  function readImageFile(file, callback) {
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (event) => callback(event.target.result);
    reader.readAsDataURL(file);
  }

  async function uploadImageToSupabase(file, folder) {
    if (!file) return null;

    if (!supabase) {
      return await new Promise((resolve) => readImageFile(file, resolve));
    }

    const safeName = slugify(file.name.replace(/\.[^/.]+$/, "")) || "image";
    const extension = file.name.split(".").pop() || "png";
    const path = `${folder}/${Date.now()}-${safeName}.${extension}`;

    const { error: uploadError } = await supabase.storage
      .from(SITE_IMAGES_BUCKET)
      .upload(path, file, { upsert: true });

    if (uploadError) throw uploadError;

    const { data } = supabase.storage.from(SITE_IMAGES_BUCKET).getPublicUrl(path);
    return data.publicUrl;
  }

  async function persistHeroAsset(key, image) {
    if (!supabase) return;
    const { error } = await supabase.from("site_assets").upsert(heroAssetToDatabase(key, image));
    if (error) throw error;
  }

  async function persistCategory(category) {
    if (!supabase) return;
    const index = categories.findIndex((item) => item.id === category.id);
    const { error } = await supabase.from("site_categories").upsert(categoryToDatabase(category, index));
    if (error) throw error;
  }

  async function persistProduct(product) {
    if (!supabase) return;
    const index = products.findIndex((item) => item.id === product.id);
    const { error } = await supabase.from("site_products").upsert(productToDatabase(product, index));
    if (error) throw error;
  }

  async function updateHeroImage(key, file) {
    try {
      const image = await uploadImageToSupabase(file, "hero");
      if (!image) return;
      setHeroImages((current) => ({ ...current, [key]: image }));
      await persistHeroAsset(key, image);
      setDatabaseSeeded(true);
      showToast("Image d’accueil enregistrée dans Supabase");
    } catch (error) {
      showToast(`Erreur d’enregistrement : ${error.message}`);
    }
  }

  async function updateCategoryImage(categoryId, file) {
    try {
      const image = await uploadImageToSupabase(file, "categories");
      if (!image) return;
      const nextCategory = categories.find((category) => category.id === categoryId);
      if (!nextCategory) return;
      const updatedCategory = { ...nextCategory, image };
      setCategories((current) => current.map((category) => category.id === categoryId ? updatedCategory : category));
      await persistCategory(updatedCategory);
      setDatabaseSeeded(true);
      showToast("Image de catégorie enregistrée dans Supabase");
    } catch (error) {
      showToast(`Erreur d’enregistrement : ${error.message}`);
    }
  }

  async function updateProductImage(productId, file) {
    try {
      const image = await uploadImageToSupabase(file, "products");
      if (!image) return;
      const nextProduct = products.find((product) => product.id === productId);
      if (!nextProduct) return;
      const updatedProduct = { ...nextProduct, image };
      setProducts((current) => current.map((product) => product.id === productId ? updatedProduct : product));
      await persistProduct(updatedProduct);
      setDatabaseSeeded(true);
      showToast("Image produit enregistrée dans Supabase");
    } catch (error) {
      showToast(`Erreur d’enregistrement : ${error.message}`);
    }
  }

  async function reloadFromSupabase() {
    await loadRemoteContent();
    showToast("Contenu rechargé depuis Supabase");
  }

  async function seedSupabaseWithCurrentContent() {
    if (!supabase) {
      showToast("Supabase n’est pas configuré.");
      return;
    }

    try {
      const categoryRows = categories.map((category, index) => categoryToDatabase(category, index));
      const productRows = products.map((product, index) => productToDatabase(product, index));
      const assetRows = Object.entries(heroImages).map(([id, image]) => heroAssetToDatabase(id, image));

      const [categoriesResult, productsResult, assetsResult] = await Promise.all([
        supabase.from("site_categories").upsert(categoryRows),
        supabase.from("site_products").upsert(productRows),
        supabase.from("site_assets").upsert(assetRows),
      ]);

      if (categoriesResult.error) throw categoriesResult.error;
      if (productsResult.error) throw productsResult.error;
      if (assetsResult.error) throw assetsResult.error;

      setDatabaseSeeded(true);
      showToast("Catalogue initial enregistré dans Supabase");
    } catch (error) {
      showToast(`Initialisation impossible : ${error.message}`);
    }
  }

  async function loginAdmin(event) {
    event.preventDefault();
    setAdminError("");

    if (!supabase) {
      setAdminError("Supabase n’est pas configuré. Vérifie ton fichier .env, puis redémarre npm run dev.");
      return;
    }

    const { data, error } = await supabase.auth.signInWithPassword({
      email: adminEmail.trim(),
      password: adminPassword,
    });

    if (error) {
      setAdminError(`Connexion impossible : ${error.message}`);
      return;
    }

    const connectedEmail = data.user?.email?.toLowerCase();
    if (connectedEmail !== ADMIN_EMAIL) {
      await supabase.auth.signOut();
      setAdminError("Ce compte n’est pas autorisé à accéder à l’administration.");
      return;
    }

    setSession(data.session || null);
    setAdminPassword("");
    window.location.hash = "admin";
    setPage("admin");
    showToast("Connexion administrateur réussie");
  }

  async function logoutAdmin() {
    if (supabase) await supabase.auth.signOut();
    setSession(null);
    window.location.hash = "";
    navigate("home");
    showToast("Déconnexion administrateur réussie");
  }

  function startProductCreation() {
    const firstCategory = categories[0];
    setDraftProduct({
      id: `custom-product-${Date.now()}`,
      name: "Nouvelle coque",
      categoryId: firstCategory?.id || "anime",
      categoryName: firstCategory?.name || "Anime",
      subcategory: firstCategory?.subcategories?.[0] || "Nouveau",
      price: 5500,
      image: "https://placehold.co/900x900/0284c7/ffffff?text=Nouvelle+Coque",
      popular: false,
      active: true,
      rating: 4.8,
      order: products.length + 1,
    });
  }

  async function saveProductDraft() {
    if (!draftProduct) return;

    const correspondingCategory = categories.find((category) => category.id === draftProduct.categoryId);
    const cleanProduct = {
      ...draftProduct,
      name: draftProduct.name.trim() || "Produit sans nom",
      categoryName: correspondingCategory?.name || draftProduct.categoryName,
      price: Number(draftProduct.price || 0),
      rating: Number(draftProduct.rating || 4.8),
      order: Number(draftProduct.order || products.length + 1),
    };

    setProducts((current) => {
      const alreadyExists = current.some((product) => product.id === cleanProduct.id);
      return alreadyExists ? current.map((product) => product.id === cleanProduct.id ? cleanProduct : product) : [...current, cleanProduct];
    });

    try {
      await persistProduct(cleanProduct);
      setDatabaseSeeded(true);
      setDraftProduct(null);
      showToast("Produit enregistré dans Supabase");
    } catch (error) {
      showToast(`Enregistrement impossible : ${error.message}`);
    }
  }

  async function deleteProduct(productId) {
    try {
      if (supabase) {
        const { error } = await supabase.from("site_products").delete().eq("id", productId);
        if (error) throw error;
      }
      setProducts((current) => current.filter((product) => product.id !== productId));
      showToast("Produit supprimé de Supabase");
    } catch (error) {
      showToast(`Suppression impossible : ${error.message}`);
    }
  }

  async function saveCategoryDraft() {
    if (!draftCategory) return;

    const cleanCategory = {
      ...draftCategory,
      name: draftCategory.name.trim() || "Catégorie",
      description: draftCategory.description.trim(),
      subcategories: draftCategory.subcategoriesText
        .split(",")
        .map((item) => item.trim())
        .filter(Boolean),
    };

    delete cleanCategory.subcategoriesText;

    setCategories((current) => current.map((category) => category.id === cleanCategory.id ? cleanCategory : category));

    try {
      await persistCategory(cleanCategory);
      setDatabaseSeeded(true);
      setDraftCategory(null);
      showToast("Catégorie enregistrée dans Supabase");
    } catch (error) {
      showToast(`Enregistrement impossible : ${error.message}`);
    }
  }

  function renderHome() {
    return (
      <>
        <section className="relative overflow-hidden bg-gradient-to-br from-sky-100 via-white to-sky-200">
          <div className="hero-orb hero-orb-left" />
          <div className="hero-orb hero-orb-right" />
          <div className="relative mx-auto grid max-w-7xl items-center gap-14 px-6 py-20 md:grid-cols-2 md:py-24">
            <div className="fade-up">
              <div className="inline-flex items-center gap-2 rounded-full border border-sky-200 bg-white/90 px-5 py-2 shadow-xl backdrop-blur">
                <span className="h-2.5 w-2.5 animate-pulse rounded-full bg-sky-500" />
                <span className="text-sm font-black text-sky-700">Collection Mycase 2026</span>
              </div>
              <h1 className="mt-8 text-5xl font-black leading-tight text-slate-950 md:text-7xl">
                Personnalise
                <span className="block bg-gradient-to-r from-sky-700 to-cyan-500 bg-clip-text text-transparent">ta coque parfaite</span>
              </h1>
              <p className="mt-6 max-w-xl text-lg leading-relaxed text-slate-600">
                Une boutique moderne de coques de téléphone : anime, football, pays, photos et designs uniques.
              </p>
              <div className="mt-8 flex flex-wrap gap-4">
                <button type="button" onClick={() => navigate("shop")} className="pulse-button rounded-full bg-sky-600 px-7 py-4 font-black text-white shadow-2xl shadow-sky-300 transition hover:-translate-y-1 hover:bg-sky-700">
                  Explorer la boutique
                </button>
                <button type="button" onClick={() => navigate("custom")} className="rounded-full border border-sky-200 bg-white px-7 py-4 font-black text-sky-700 shadow-xl transition hover:-translate-y-1 hover:bg-sky-50">
                  Créer ma coque
                </button>
              </div>
              <div className="mt-10 grid grid-cols-3 gap-4">
                <div className="stat-card"><strong>{activeProducts.length}+</strong><span>Coques</span></div>
                <div className="stat-card"><strong>{categories.reduce((total, category) => total + category.subcategories.length, 0)}</strong><span>Collections</span></div>
                <div className="stat-card"><strong>24h</strong><span>Réponse</span></div>
              </div>
            </div>

            <div className="hero-gallery hidden md:grid">
              <img src={heroImages.heroAnime} alt="Accueil anime" className="hero-image hero-image-main" />
              <div className="grid gap-4">
                <img src={heroImages.heroFoot} alt="Accueil foot" className="hero-image hero-image-small" />
                <img src={heroImages.heroCustom} alt="Accueil custom" className="hero-image hero-image-small-alt" />
              </div>
            </div>
          </div>
        </section>

        <section className="mx-auto max-w-7xl px-6 py-20">
          <div className="fade-up text-center">
            <h2 className="text-4xl font-black text-slate-950">Catégories populaires</h2>
            <p className="mt-3 text-slate-500">Choisis un univers et découvre les modèles disponibles.</p>
          </div>
          <div className="mt-12 grid gap-6 sm:grid-cols-2 lg:grid-cols-5">
            {categories.map((category, index) => (
              <button
                key={category.id}
                type="button"
                onClick={() => openCategory(category.id)}
                className="fade-up group overflow-hidden rounded-[2rem] border border-white/70 bg-white text-left shadow-xl shadow-sky-100 transition duration-500 hover:-translate-y-3 hover:shadow-2xl"
                style={{ animationDelay: `${index * 90}ms` }}
              >
                <img src={category.image} alt={category.name} className="h-52 w-full object-cover transition duration-700 group-hover:scale-110" />
                <div className="p-4">
                  <h3 className="text-xl font-black text-sky-700">{category.name}</h3>
                  <p className="mt-2 line-clamp-2 text-xs font-semibold text-slate-500">{category.description}</p>
                </div>
              </button>
            ))}
          </div>
        </section>

        <section className="mx-auto max-w-7xl px-6 pb-20">
          <div className="fade-up mb-8 flex flex-wrap items-end justify-between gap-4">
            <div>
              <h2 className="text-4xl font-black text-slate-950">Best sellers</h2>
              <p className="mt-2 text-slate-500">Les coques qui attirent le plus les clients.</p>
            </div>
            <button type="button" onClick={() => navigate("shop")} className="rounded-full bg-sky-100 px-5 py-3 font-black text-sky-700 transition hover:bg-sky-200">
              Voir la boutique
            </button>
          </div>
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {bestSellers.map((product, index) => (
              <ProductCard key={product.id} product={product} onAdd={addToCart} onOpen={setSelectedProduct} animationDelay={index * 100} />
            ))}
          </div>
        </section>
      </>
    );
  }

  function renderShop() {
    if (selectedProduct) {
      return (
        <section className="page-enter mx-auto max-w-6xl px-6 py-14">
          <button type="button" onClick={() => setSelectedProduct(null)} className="mb-8 inline-flex items-center gap-2 rounded-full bg-white px-5 py-3 font-black text-sky-700 shadow-xl transition hover:-translate-y-1">
            <Icon name="back" className="h-4 w-4" /> Retour
          </button>
          <div className="grid gap-10 rounded-[2.5rem] border border-white/80 bg-white p-8 shadow-2xl shadow-sky-100 md:grid-cols-2">
            <img src={selectedProduct.image} alt={selectedProduct.name} className="product-detail-image h-[30rem] w-full rounded-[2rem] object-cover" />
            <div className="self-center">
              <span className="rounded-full bg-sky-100 px-4 py-2 text-sm font-black text-sky-700">{selectedProduct.subcategory}</span>
              <h2 className="mt-5 text-4xl font-black text-slate-950">{selectedProduct.name}</h2>
              <p className="mt-4 leading-relaxed text-slate-500">Coque premium, moderne, résistante et disponible selon le modèle de ton téléphone.</p>
              <p className="mt-6 text-4xl font-black text-sky-700">{formatPrice(selectedProduct.price)}</p>
              <button type="button" onClick={() => addToCart(selectedProduct)} className="mt-8 w-full rounded-2xl bg-sky-600 px-6 py-4 font-black text-white transition hover:-translate-y-1 hover:bg-sky-700">
                Ajouter au panier
              </button>
            </div>
          </div>
        </section>
      );
    }

    if (!selectedCategory) {
      return (
        <section className="page-enter mx-auto max-w-7xl px-6 py-14">
          <div className="text-center">
            <h2 className="text-5xl font-black text-slate-950">Boutique Mycase</h2>
            <p className="mt-3 text-slate-500">Commence par choisir une catégorie.</p>
          </div>
          <div className="mt-12 grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {categories.map((category, index) => (
              <button
                key={category.id}
                type="button"
                onClick={() => openCategory(category.id)}
                className="fade-up group overflow-hidden rounded-[2rem] bg-white text-left shadow-xl transition duration-500 hover:-translate-y-3 hover:shadow-2xl"
                style={{ animationDelay: `${index * 100}ms` }}
              >
                <img src={category.image} alt={category.name} className="h-72 w-full object-cover transition duration-700 group-hover:scale-110" />
                <div className="p-6">
                  <h3 className="text-2xl font-black text-sky-700">{category.name}</h3>
                  <p className="mt-2 text-sm text-slate-500">{category.subcategories.length} sous-catégories</p>
                </div>
              </button>
            ))}
          </div>
        </section>
      );
    }

    return (
      <section className="page-enter mx-auto max-w-7xl px-6 py-14">
        <div className="rounded-[2rem] border border-white/80 bg-white p-7 shadow-xl">
          <div className="flex flex-wrap items-center justify-between gap-4">
            <div>
              <p className="text-sm font-black uppercase tracking-[0.2em] text-sky-400">Catégorie</p>
              <h2 className="mt-2 text-4xl font-black text-sky-700">{selectedCategory.name}</h2>
            </div>
            <button type="button" onClick={() => { setSelectedCategoryId(null); setSelectedSubcategory(null); }} className="rounded-full bg-slate-100 px-5 py-3 font-black text-slate-600 transition hover:bg-slate-200">
              ← Retour
            </button>
          </div>
          <div className="mt-6 flex flex-wrap gap-3">
            {selectedCategory.subcategories.map((subcategory) => (
              <button
                key={subcategory}
                type="button"
                onClick={() => { setSelectedSubcategory(subcategory); setSearch(""); }}
                className={`rounded-full px-4 py-2.5 text-sm font-black transition ${selectedSubcategory === subcategory ? "bg-sky-600 text-white shadow-lg" : "bg-sky-50 text-sky-700 hover:bg-sky-100"}`}
              >
                {subcategory}
              </button>
            ))}
          </div>
        </div>

        {selectedSubcategory ? (
          <div className="mt-10">
            <div className="mb-7 flex flex-wrap items-end justify-between gap-4">
              <div>
                <h3 className="text-3xl font-black text-slate-950">{selectedSubcategory}</h3>
                <p className="mt-1 text-slate-500">{visibleProducts.length} produit(s)</p>
              </div>
              <div className="flex flex-wrap gap-3">
                <div className="relative">
                  <Icon name="search" className="absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
                  <input value={search} onChange={(event) => setSearch(event.target.value)} placeholder="Rechercher…" className="rounded-full border border-slate-200 bg-white py-3 pl-11 pr-5 text-sm shadow-lg outline-none transition focus:border-sky-500" />
                </div>
                <select value={sortBy} onChange={(event) => setSortBy(event.target.value)} className="rounded-full border border-slate-200 bg-white px-5 py-3 text-sm font-black shadow-lg outline-none transition focus:border-sky-500">
                  <option value="popular">Populaires</option>
                  <option value="priceAsc">Prix croissant</option>
                  <option value="priceDesc">Prix décroissant</option>
                </select>
              </div>
            </div>
            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
              {visibleProducts.map((product, index) => (
                <ProductCard key={product.id} product={product} onAdd={addToCart} onOpen={setSelectedProduct} animationDelay={index * 90} />
              ))}
            </div>
          </div>
        ) : (
          <div className="mt-10 rounded-[2rem] bg-white p-10 text-center font-bold text-slate-500 shadow-xl">
            Sélectionne une sous-catégorie pour afficher ses produits.
          </div>
        )}
      </section>
    );
  }

  function renderCustomization() {
    const formReady = Boolean(customName && customPhone && customModel);

    return (
      <section className="page-enter mx-auto max-w-3xl px-6 py-14">
        <div className="rounded-[2.5rem] border border-white/80 bg-white p-8 shadow-2xl shadow-sky-100 md:p-10">
          <h2 className="text-4xl font-black text-sky-700">Personnalise ta coque</h2>
          <p className="mt-3 text-slate-500">Remplis le formulaire et envoie ta demande automatiquement sur WhatsApp.</p>

          <div className="mt-8 grid gap-4">
            <input value={customName} onChange={(event) => setCustomName(event.target.value)} placeholder="Ton nom" className="rounded-2xl border border-slate-200 p-4 outline-none transition focus:border-sky-500" />
            <input value={customPhone} onChange={(event) => setCustomPhone(event.target.value)} placeholder="Ton numéro de téléphone" className="rounded-2xl border border-slate-200 p-4 outline-none transition focus:border-sky-500" />
            <input value={customModel} onChange={(event) => setCustomModel(event.target.value)} placeholder="Modèle du téléphone" className="rounded-2xl border border-slate-200 p-4 outline-none transition focus:border-sky-500" />

            <label className="group cursor-pointer rounded-[2rem] border-2 border-dashed border-sky-300 bg-sky-50 p-6 text-center transition hover:-translate-y-1 hover:border-sky-500 hover:bg-sky-100">
              <Icon name="upload" className="mx-auto mb-3 h-8 w-8 text-sky-600 transition group-hover:-translate-y-1" />
              <span className="font-black text-sky-700">{customImage ? "Changer l’image" : "Charger une image"}</span>
              <input
                  type="file"
                  accept="image/*"
                  className="hidden"
                  onChange={(event) => {
                    const file = event.target.files?.[0];
                   setCustomImageFile(file || null);
                  readImageFile(file, setCustomImage);
               }}
                />
              {customImage && <img src={customImage} alt="Aperçu personnalisation" className="mt-5 max-h-80 w-full rounded-[1.5rem] object-cover shadow-xl" />}
            </label>

            {customError && (
              <p className="rounded-2xl bg-red-50 p-3 text-sm font-bold text-red-600">
                 {customError}
              </p>
            )}

              <button
                 disabled={!formReady || customLoading}
                  type="button"
                  onClick={submitCustomization}
                  className={`rounded-2xl px-6 py-4 font-black text-white transition ${
                    formReady && !customLoading
                     ? "bg-sky-600 hover:-translate-y-1 hover:bg-sky-700"
                     : "cursor-not-allowed bg-slate-300"
                 }`}
              >
                {customLoading
                   ? "Envoi de l’image…"
                   : formReady
                       ? "Envoyer sur WhatsApp"
                      : "Complète tous les champs"}
</button>
              {formReady ? "Envoyer sur WhatsApp" : "Complète tous les champs"}
            </button>
          </div>
        </div>
      </section>
    );
  }

  function renderCart() {
    return (
      <section className="page-enter mx-auto max-w-4xl px-6 py-14">
        <div className="rounded-[2.5rem] border border-white/80 bg-white p-8 shadow-2xl shadow-sky-100">
          <div className="flex flex-wrap items-center justify-between gap-4">
            <h2 className="text-4xl font-black text-sky-700">Panier</h2>
            {cartCount > 0 && <span className="rounded-full bg-sky-100 px-4 py-2 text-sm font-black text-sky-700">{cartCount} article(s)</span>}
          </div>

          {cart.length === 0 ? (
            <div className="mt-8 rounded-[2rem] bg-sky-50 p-10 text-center">
              <p className="text-slate-500">Ton panier est vide.</p>
              <button type="button" onClick={() => navigate("shop")} className="mt-5 rounded-full bg-sky-600 px-6 py-3 font-black text-white transition hover:-translate-y-1 hover:bg-sky-700">
                Explorer la boutique
              </button>
            </div>
          ) : (
            <div className="mt-8 space-y-4">
              {cart.map((item, index) => (
                <div key={item.id} className="fade-up flex flex-wrap items-center justify-between gap-4 rounded-[2rem] bg-sky-50 p-4" style={{ animationDelay: `${index * 80}ms` }}>
                  <div className="flex items-center gap-4">
                    <img src={item.image} alt={item.name} className="h-20 w-20 rounded-2xl object-cover shadow-lg" />
                    <div>
                      <p className="font-black text-slate-950">{item.name}</p>
                      <p className="text-sm font-black text-sky-700">{formatPrice(item.price)}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <button type="button" onClick={() => decreaseCartItem(item.id)} className="rounded-full bg-white p-2.5 shadow-lg transition hover:-translate-y-0.5"><Icon name="minus" className="h-4 w-4" /></button>
                    <span className="w-8 text-center font-black">{item.quantity}</span>
                    <button type="button" onClick={() => addToCart(item)} className="rounded-full bg-white p-2.5 shadow-lg transition hover:-translate-y-0.5"><Icon name="plus" className="h-4 w-4" /></button>
                    <button type="button" onClick={() => removeCartItem(item.id)} className="rounded-full bg-red-100 p-2.5 text-red-600 shadow-lg transition hover:-translate-y-0.5"><Icon name="trash" className="h-4 w-4" /></button>
                  </div>
                </div>
              ))}

              <div className="flex items-center justify-between rounded-[2rem] bg-white p-5 text-xl font-black shadow-xl">
                <span>Total</span>
                <span className="text-sky-700">{formatPrice(cartTotal)}</span>
              </div>

              <button type="button" onClick={submitCartOrder} className="w-full rounded-2xl bg-sky-600 px-6 py-4 font-black text-white transition hover:-translate-y-1 hover:bg-sky-700">
                Finaliser sur WhatsApp
              </button>
            </div>
          )}
        </div>
      </section>
    );
  }

  function renderAdminLogin() {
    return (
      <section className="page-enter mx-auto max-w-xl px-6 py-16">
        <div className="rounded-[2.5rem] border border-white/80 bg-white p-8 shadow-2xl shadow-sky-100">
          <div className="flex items-center gap-3 text-sky-700">
            <Icon name="lock" className="h-8 w-8" />
            <h2 className="text-3xl font-black">Connexion administrateur</h2>
          </div>
          <p className="mt-4 text-sm leading-relaxed text-slate-500">
            L’accès admin est maintenant relié à Supabase Auth. Cette page reste cachée du menu public et se trouve via l’adresse <strong>#admin</strong>.
          </p>

          <form onSubmit={loginAdmin} className="mt-7 grid gap-4">
            <input type="email" value={adminEmail} onChange={(event) => setAdminEmail(event.target.value)} placeholder="E-mail administrateur" className="rounded-2xl border border-slate-200 p-4 outline-none transition focus:border-sky-500" />
            <input type="password" value={adminPassword} onChange={(event) => setAdminPassword(event.target.value)} placeholder="Mot de passe" className="rounded-2xl border border-slate-200 p-4 outline-none transition focus:border-sky-500" />
            {adminError && <p className="rounded-2xl bg-red-50 p-4 text-sm font-bold text-red-600">{adminError}</p>}
            <button type="submit" className="rounded-2xl bg-sky-600 px-6 py-4 font-black text-white transition hover:-translate-y-1 hover:bg-sky-700">
              Se connecter
            </button>
          </form>

          <div className="mt-6 rounded-2xl bg-sky-50 p-4 text-sm font-semibold text-sky-800">
            Connecte-toi avec le compte admin que tu as créé dans Supabase. Seule l’adresse définie dans <strong>VITE_ADMIN_EMAIL</strong> est acceptée.
          </div>
        </div>
      </section>
    );
  }

  function renderAdmin() {
    if (authLoading) {
      return (
        <section className="page-enter mx-auto max-w-xl px-6 py-16">
          <div className="rounded-[2.5rem] border border-white/80 bg-white p-8 text-center font-black text-sky-700 shadow-2xl shadow-sky-100">
            Vérification de la session administrateur…
          </div>
        </section>
      );
    }

    if (!isAdmin) return renderAdminLogin();

    return (
      <section className="page-enter mx-auto max-w-7xl px-6 py-14">
        <div className="rounded-[2.5rem] border border-white/80 bg-white p-8 shadow-2xl shadow-sky-100">
          <div className="flex flex-wrap items-start justify-between gap-4">
            <div>
              <p className="text-sm font-black uppercase tracking-[0.2em] text-sky-400">Espace privé</p>
              <h2 className="mt-2 text-4xl font-black text-slate-950">Administration Mycase</h2>
              <p className="mt-3 max-w-3xl text-slate-500">Change les images du site, modifie les catégories, ajoute ou supprime des produits.</p>
            </div>
            <div className="flex flex-wrap gap-3">
              {!databaseSeeded && (
                <button type="button" onClick={seedSupabaseWithCurrentContent} className="rounded-full bg-emerald-100 px-5 py-3 font-black text-emerald-700 transition hover:bg-emerald-200">
                  Publier le catalogue initial
                </button>
              )}
              <button type="button" onClick={reloadFromSupabase} className="rounded-full bg-sky-100 px-5 py-3 font-black text-sky-700 transition hover:bg-sky-200">Recharger Supabase</button>
              <button type="button" onClick={logoutAdmin} className="inline-flex items-center gap-2 rounded-full bg-slate-950 px-5 py-3 font-black text-white transition hover:-translate-y-1"><Icon name="logout" className="h-4 w-4" /> Déconnexion</button>
            </div>
          </div>

          <div className="mt-8 flex flex-wrap gap-3">
            {[{ id: "images", label: "Toutes les images" }, { id: "categories", label: "Catégories" }, { id: "products", label: "Produits" }].map((tab) => (
              <button key={tab.id} type="button" onClick={() => setAdminTab(tab.id)} className={`rounded-full px-5 py-3 font-black transition ${adminTab === tab.id ? "bg-sky-600 text-white shadow-lg" : "bg-sky-50 text-sky-700 hover:bg-sky-100"}`}>
                {tab.label}
              </button>
            ))}
          </div>

          {adminTab === "images" && (
            <div className="mt-8 space-y-10">
              <div>
                <h3 className="text-2xl font-black text-slate-950">Images de l’accueil</h3>
                <div className="mt-5 grid gap-5 md:grid-cols-3">
                  {[
                    { key: "heroAnime", label: "Hero Anime" },
                    { key: "heroFoot", label: "Hero Foot" },
                    { key: "heroCustom", label: "Hero Custom" },
                  ].map((item, index) => (
                    <div key={item.key} className="fade-up rounded-[2rem] bg-slate-50 p-5 shadow-lg" style={{ animationDelay: `${index * 80}ms` }}>
                      <img src={heroImages[item.key]} alt={item.label} className="h-48 w-full rounded-2xl object-cover shadow-xl" />
                      <p className="mt-4 font-black text-slate-900">{item.label}</p>
                      <label className="mt-4 inline-flex cursor-pointer items-center gap-2 rounded-full bg-sky-600 px-4 py-2.5 text-sm font-black text-white transition hover:bg-sky-700">
                        <Icon name="upload" className="h-4 w-4" /> Changer
                        <input type="file" accept="image/*" className="hidden" onChange={(event) => updateHeroImage(item.key, event.target.files?.[0])} />
                      </label>
                    </div>
                  ))}
                </div>
              </div>

              <div>
                <h3 className="text-2xl font-black text-slate-950">Images des catégories</h3>
                <div className="mt-5 grid gap-5 md:grid-cols-2 lg:grid-cols-3">
                  {categories.map((category, index) => (
                    <div key={category.id} className="fade-up rounded-[2rem] bg-slate-50 p-5 shadow-lg" style={{ animationDelay: `${index * 70}ms` }}>
                      <img src={category.image} alt={category.name} className="h-44 w-full rounded-2xl object-cover shadow-xl" />
                      <p className="mt-4 font-black text-slate-900">{category.name}</p>
                      <label className="mt-4 inline-flex cursor-pointer items-center gap-2 rounded-full bg-sky-600 px-4 py-2.5 text-sm font-black text-white transition hover:bg-sky-700">
                        <Icon name="upload" className="h-4 w-4" /> Changer
                        <input type="file" accept="image/*" className="hidden" onChange={(event) => updateCategoryImage(category.id, event.target.files?.[0])} />
                      </label>
                    </div>
                  ))}
                </div>
              </div>

              <div>
                <h3 className="text-2xl font-black text-slate-950">Images des produits</h3>
                <div className="mt-5 grid gap-5 md:grid-cols-2 lg:grid-cols-3">
                  {products.map((product, index) => (
                    <div key={product.id} className="fade-up rounded-[2rem] bg-slate-50 p-5 shadow-lg" style={{ animationDelay: `${index * 35}ms` }}>
                      <img src={product.image} alt={product.name} className="h-44 w-full rounded-2xl object-cover shadow-xl" />
                      <p className="mt-4 line-clamp-2 font-black text-slate-900">{product.name}</p>
                      <label className="mt-4 inline-flex cursor-pointer items-center gap-2 rounded-full bg-sky-600 px-4 py-2.5 text-sm font-black text-white transition hover:bg-sky-700">
                        <Icon name="upload" className="h-4 w-4" /> Changer
                        <input type="file" accept="image/*" className="hidden" onChange={(event) => updateProductImage(product.id, event.target.files?.[0])} />
                      </label>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {adminTab === "categories" && (
            <div className="mt-8 grid gap-5 lg:grid-cols-2">
              {categories.map((category, index) => (
                <div key={category.id} className="fade-up rounded-[2rem] bg-slate-50 p-5 shadow-lg" style={{ animationDelay: `${index * 80}ms` }}>
                  <div className="flex flex-col gap-4 sm:flex-row">
                    <img src={category.image} alt={category.name} className="h-32 w-32 rounded-2xl object-cover shadow-xl" />
                    <div className="flex-1">
                      <h3 className="text-xl font-black text-slate-950">{category.name}</h3>
                      <p className="mt-2 text-sm text-slate-500">{category.description}</p>
                      <p className="mt-2 text-xs font-black text-sky-700">{category.subcategories.join(" · ")}</p>
                      <button type="button" onClick={() => setDraftCategory({ ...category, subcategoriesText: category.subcategories.join(", ") })} className="mt-4 rounded-full bg-white px-4 py-2.5 text-sm font-black text-sky-700 shadow-lg transition hover:-translate-y-0.5">
                        Modifier
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}

          {adminTab === "products" && (
            <div className="mt-8">
              <div className="mb-6 flex flex-wrap items-center justify-between gap-4">
                <div>
                  <h3 className="text-2xl font-black text-slate-950">Catalogue produits</h3>
                  <p className="mt-1 text-slate-500">Ajoute, modifie ou supprime les coques.</p>
                </div>
                <button type="button" onClick={startProductCreation} className="inline-flex items-center gap-2 rounded-full bg-sky-600 px-5 py-3 font-black text-white transition hover:-translate-y-1 hover:bg-sky-700">
                  <Icon name="plus" className="h-4 w-4" /> Ajouter un produit
                </button>
              </div>
              <div className="grid gap-5 md:grid-cols-2 lg:grid-cols-3">
                {products.map((product, index) => (
                  <div key={product.id} className="fade-up rounded-[2rem] bg-slate-50 p-5 shadow-lg" style={{ animationDelay: `${index * 45}ms` }}>
                    <img src={product.image} alt={product.name} className="h-48 w-full rounded-2xl object-cover shadow-xl" />
                    <h3 className="mt-4 line-clamp-2 text-lg font-black text-slate-950">{product.name}</h3>
                    <p className="mt-1 text-sm font-bold text-slate-500">{product.categoryName} · {product.subcategory}</p>
                    <p className="mt-2 text-lg font-black text-sky-700">{formatPrice(product.price)}</p>
                    <div className="mt-4 flex flex-wrap gap-2">
                      <button type="button" onClick={() => setDraftProduct({ ...product })} className="rounded-full bg-white px-4 py-2.5 text-sm font-black text-sky-700 shadow-lg transition hover:-translate-y-0.5">
                        Modifier
                      </button>
                      <button type="button" onClick={() => deleteProduct(product.id)} className="rounded-full bg-red-100 px-4 py-2.5 text-sm font-black text-red-600 transition hover:bg-red-200">
                        Supprimer
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {draftCategory && (
          <div className="modal-overlay fixed inset-0 z-[90] flex items-center justify-center bg-slate-950/65 p-4">
            <div className="modal-card w-full max-w-xl rounded-[2rem] bg-white p-6 shadow-2xl">
              <h3 className="text-2xl font-black text-slate-950">Modifier la catégorie</h3>
              <div className="mt-5 grid gap-4">
                <AdminTextField label="Nom" value={draftCategory.name} onChange={(event) => setDraftCategory({ ...draftCategory, name: event.target.value })} />
                <AdminTextField label="Description" value={draftCategory.description} onChange={(event) => setDraftCategory({ ...draftCategory, description: event.target.value })} multiline />
                <AdminTextField label="Sous-catégories séparées par des virgules" value={draftCategory.subcategoriesText} onChange={(event) => setDraftCategory({ ...draftCategory, subcategoriesText: event.target.value })} multiline />
              </div>
              <div className="mt-6 flex justify-end gap-3">
                <button type="button" onClick={() => setDraftCategory(null)} className="rounded-full bg-slate-100 px-5 py-3 font-black text-slate-700">Annuler</button>
                <button type="button" onClick={saveCategoryDraft} className="rounded-full bg-sky-600 px-5 py-3 font-black text-white transition hover:bg-sky-700">Enregistrer</button>
              </div>
            </div>
          </div>
        )}

        {draftProduct && (
          <div className="modal-overlay fixed inset-0 z-[90] flex items-center justify-center bg-slate-950/65 p-4">
            <div className="modal-card max-h-[92vh] w-full max-w-3xl overflow-auto rounded-[2rem] bg-white p-6 shadow-2xl">
              <h3 className="text-2xl font-black text-slate-950">Modifier le produit</h3>
              <div className="mt-5 grid gap-4 md:grid-cols-2">
                <AdminTextField label="Nom" value={draftProduct.name} onChange={(event) => setDraftProduct({ ...draftProduct, name: event.target.value })} />
                <AdminTextField label="Prix FCFA" type="number" value={draftProduct.price} onChange={(event) => setDraftProduct({ ...draftProduct, price: event.target.value })} />
                <label className="grid gap-2 text-sm font-black text-slate-700">
                  <span>Catégorie</span>
                  <select value={draftProduct.categoryId} onChange={(event) => setDraftProduct({ ...draftProduct, categoryId: event.target.value })} className="rounded-2xl border border-slate-200 bg-white p-4 outline-none transition focus:border-sky-500">
                    {categories.map((category) => <option key={category.id} value={category.id}>{category.name}</option>)}
                  </select>
                </label>
                <AdminTextField label="Sous-catégorie" value={draftProduct.subcategory} onChange={(event) => setDraftProduct({ ...draftProduct, subcategory: event.target.value })} />
                <AdminTextField label="Note" type="number" value={draftProduct.rating} onChange={(event) => setDraftProduct({ ...draftProduct, rating: event.target.value })} />
                <AdminTextField label="Ordre" type="number" value={draftProduct.order} onChange={(event) => setDraftProduct({ ...draftProduct, order: event.target.value })} />
              </div>
              <div className="mt-5 flex flex-wrap gap-4">
                <label className="inline-flex items-center gap-2 font-black text-slate-700"><input type="checkbox" checked={Boolean(draftProduct.popular)} onChange={(event) => setDraftProduct({ ...draftProduct, popular: event.target.checked })} /> Populaire</label>
                <label className="inline-flex items-center gap-2 font-black text-slate-700"><input type="checkbox" checked={draftProduct.active !== false} onChange={(event) => setDraftProduct({ ...draftProduct, active: event.target.checked })} /> Visible</label>
              </div>
              <div className="mt-6 flex justify-end gap-3">
                <button type="button" onClick={() => setDraftProduct(null)} className="rounded-full bg-slate-100 px-5 py-3 font-black text-slate-700">Annuler</button>
                <button type="button" onClick={saveProductDraft} className="rounded-full bg-sky-600 px-5 py-3 font-black text-white transition hover:bg-sky-700">Enregistrer</button>
              </div>
            </div>
          </div>
        )}
      </section>
    );
  }

  function renderCurrentPage() {
    if (page === "home") return renderHome();
    if (page === "shop") return renderShop();
    if (page === "custom") return renderCustomization();
    if (page === "cart") return renderCart();
    if (page === "admin-login") return renderAdminLogin();
    if (page === "admin") return renderAdmin();
    return renderHome();
  }

  return (
    <div className="min-h-screen bg-sky-50 text-slate-950">
      <style>{`
        @keyframes fadeUp {
          from { opacity: 0; transform: translateY(24px); }
          to { opacity: 1; transform: translateY(0); }
        }
        @keyframes pageEnter {
          from { opacity: 0; transform: translateY(18px); }
          to { opacity: 1; transform: translateY(0); }
        }
        @keyframes floatSoft {
          0%, 100% { transform: translateY(0px); }
          50% { transform: translateY(-14px); }
        }
        @keyframes floatWide {
          0%, 100% { transform: translate3d(0, 0, 0); }
          50% { transform: translate3d(0, -18px, 0); }
        }
        @keyframes pulseGlow {
          0%, 100% { box-shadow: 0 18px 45px rgba(14, 165, 233, 0.28); }
          50% { box-shadow: 0 24px 65px rgba(14, 165, 233, 0.5); }
        }
        @keyframes toastEnter {
          from { opacity: 0; transform: translate(-50%, 18px) scale(0.95); }
          to { opacity: 1; transform: translate(-50%, 0) scale(1); }
        }
        @keyframes modalEnter {
          from { opacity: 0; transform: translateY(18px) scale(0.97); }
          to { opacity: 1; transform: translateY(0) scale(1); }
        }
        .fade-up { opacity: 0; animation: fadeUp 0.7s ease forwards; }
        .page-enter { animation: pageEnter 0.45s ease both; }
        .toast-enter { animation: toastEnter 0.3s ease both; }
        .modal-card { animation: modalEnter 0.35s ease both; }
        .pulse-button { animation: pulseGlow 2.8s ease-in-out infinite; }
        .hero-gallery { display: grid; grid-template-columns: 1fr 1fr; gap: 1rem; align-items: center; }
        .hero-image { object-fit: cover; box-shadow: 0 30px 80px rgba(15, 23, 42, 0.18); }
        .hero-image-main { height: 26rem; width: 100%; border-radius: 2.5rem; animation: floatWide 5.2s ease-in-out infinite; }
        .hero-image-small { height: 14rem; width: 100%; border-radius: 2.25rem; animation: floatSoft 4.2s ease-in-out infinite; }
        .hero-image-small-alt { height: 16rem; width: 100%; border-radius: 2.25rem; animation: floatSoft 4.8s ease-in-out infinite reverse; }
        .product-detail-image { animation: floatSoft 5s ease-in-out infinite; }
        .hero-orb { position: absolute; border-radius: 9999px; filter: blur(20px); opacity: 0.42; }
        .hero-orb-left { left: -4rem; top: 8rem; width: 18rem; height: 18rem; background: rgba(14, 165, 233, 0.35); animation: floatSoft 6s ease-in-out infinite; }
        .hero-orb-right { right: -3rem; top: 4rem; width: 20rem; height: 20rem; background: rgba(56, 189, 248, 0.35); animation: floatWide 7s ease-in-out infinite; }
        .stat-card { border-radius: 1.25rem; background: rgba(255,255,255,0.92); padding: 1rem; box-shadow: 0 18px 45px rgba(14, 165, 233, 0.14); backdrop-filter: blur(8px); }
        .stat-card strong { display: block; font-size: 1.7rem; font-weight: 900; color: rgb(2 132 199); }
        .stat-card span { display: block; margin-top: 0.15rem; font-size: 0.85rem; color: rgb(100 116 139); font-weight: 700; }
      `}</style>

      <header className="sticky top-0 z-50 border-b border-sky-100 bg-white/90 backdrop-blur-xl">
        <div className="mx-auto flex max-w-7xl flex-col gap-4 px-6 py-4 md:flex-row md:items-center md:justify-between">
          <button type="button" onClick={() => navigate("home")} className="flex items-center gap-3 text-left transition hover:-translate-y-0.5">
            <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-sky-600 text-lg font-black text-white shadow-xl">MC</div>
            <div>
              <p className="text-xl font-black text-sky-700">Mycase</p>
              <p className="text-xs font-semibold text-slate-400">Coques personnalisées</p>
            </div>
          </button>

          <nav className="flex flex-wrap items-center gap-5 text-sm font-black">
            {[{ id: "home", label: "Accueil" }, { id: "shop", label: "Boutique" }, { id: "custom", label: "Personnalisation" }].map((item) => (
              <button key={item.id} type="button" onClick={() => navigate(item.id)} className={`transition hover:text-sky-600 ${page === item.id ? "text-sky-600" : "text-slate-600"}`}>
                {item.label}
              </button>
            ))}
            <button type="button" onClick={() => navigate("cart")} className={`relative inline-flex items-center gap-2 transition hover:text-sky-600 ${page === "cart" ? "text-sky-600" : "text-slate-600"}`}>
              <Icon name="cart" className="h-5 w-5" /> Panier
              {cartCount > 0 && <span className="absolute -right-5 -top-3 flex h-5 w-5 items-center justify-center rounded-full bg-red-500 text-[10px] font-black text-white">{cartCount}</span>}
            </button>
          </nav>
        </div>
      </header>

      {remoteLoading && (
        <div className="mx-auto mt-5 max-w-7xl px-6">
          <div className="rounded-2xl bg-white p-4 text-sm font-black text-sky-700 shadow-xl">
            Chargement du contenu depuis Supabase…
          </div>
        </div>
      )}
      <main>{renderCurrentPage()}</main>

      <footer className="mt-10 bg-slate-950 px-6 py-12 text-white">
        <div className="mx-auto grid max-w-7xl gap-8 md:grid-cols-3">
          <div>
            <h3 className="text-2xl font-black">Mycase</h3>
            <p className="mt-3 text-sm leading-relaxed text-slate-400">Boutique de coques personnalisées avec commande simple via WhatsApp.</p>
          </div>
          <div>
            <h4 className="font-black text-sky-400">Collections</h4>
            <p className="mt-3 text-sm text-slate-400">Anime · Foot · Pays · Photo · Gaming</p>
          </div>
          <div>
            <h4 className="font-black text-sky-400">Contact</h4>
            <p className="mt-3 text-sm text-slate-400">WhatsApp : +{WHATSAPP_NUMBER}</p>
          </div>
        </div>
      </footer>

      <Toast text={toast.text} visible={toast.visible} />
    </div>
  );
}
