import CategoryTabs from "@/components/CategoryTabs";
import ProductGrid from "@/components/ProductGrid";
import { products } from "@/data/products";

// 作品一覧（すべて）
export default function HomePage() {
  return (
    <>
      <h1 className="page-heading">作品一覧</h1>
      <CategoryTabs active="all" />
      <ProductGrid products={products} />
    </>
  );
}
