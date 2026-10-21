import productData from "./products.json";

// ===== カテゴリ =====
// slug は URL に使う英字（/category/wood など）
export const categories = [
  { slug: "wood", label: "木工" },
  { slug: "fabric", label: "布" },
  { slug: "leather", label: "革" },
] as const;

export type Category = (typeof categories)[number]["label"]; // "木工" | "布" | "革"
export type CategorySlug = (typeof categories)[number]["slug"]; // "wood" | "fabric" | "leather"

// ===== 作品 =====
export type Product = {
  id: string; // URL に使う（/products/1 など）。重複しないように
  name: string;
  category: Category;
  imageUrl: string;
  description: string;
};

// 作品データは products.json にあります。
// 管理画面（npm run dev → http://localhost:3000/admin）から追加・編集・削除できます。
// 手で編集してもかまいません（写真は public/images/ に置いて "/images/xxx.jpg" と書く）。
export const products: Product[] = productData as Product[];

// ===== 便利関数 =====
export function getProductById(id: string): Product | undefined {
  return products.find((p) => p.id === id);
}

export function getCategoryBySlug(slug: string) {
  return categories.find((c) => c.slug === slug);
}

export function getCategorySlug(label: Category): CategorySlug {
  return categories.find((c) => c.label === label)!.slug;
}

export function getProductsByCategory(label: Category): Product[] {
  return products.filter((p) => p.category === label);
}

export function isCategory(value: unknown): value is Category {
  return categories.some((c) => c.label === value);
}
