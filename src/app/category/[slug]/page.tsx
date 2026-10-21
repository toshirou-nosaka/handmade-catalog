import type { Metadata } from "next";
import { notFound } from "next/navigation";
import CategoryTabs from "@/components/CategoryTabs";
import ProductGrid from "@/components/ProductGrid";
import { categories, getCategoryBySlug, getProductsByCategory } from "@/data/products";

type Props = { params: Promise<{ slug: string }> };

// /category/wood・/category/fabric・/category/leather をビルド時に生成
export function generateStaticParams() {
  return categories.map((c) => ({ slug: c.slug }));
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const category = getCategoryBySlug(slug);
  return { title: category ? `${category.label}の作品` : "カテゴリ" };
}

// カテゴリ絞り込み
export default async function CategoryPage({ params }: Props) {
  const { slug } = await params;
  const category = getCategoryBySlug(slug);
  if (!category) notFound();

  const items = getProductsByCategory(category.label);

  return (
    <>
      <h1 className="page-heading">
        {category.label}の作品<span style={{ fontSize: "0.85rem", fontWeight: 400 }}>（{items.length}点）</span>
      </h1>
      <CategoryTabs active={category.slug} />
      <ProductGrid products={items} />
    </>
  );
}
