import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";
import { getCategorySlug, getProductById, products } from "@/data/products";
import styles from "./page.module.css";

type Props = { params: Promise<{ id: string }> };

// 全作品の詳細ページをビルド時に生成
export function generateStaticParams() {
  return products.map((p) => ({ id: p.id }));
}

// 存在しない ID は 404
export const dynamicParams = false;

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { id } = await params;
  const product = getProductById(id);
  if (!product) return { title: "作品が見つかりません" };
  return {
    title: product.name,
    description: product.description.split("\n")[0],
    // LINE や SNS で URL を共有したときに写真が出るように
    openGraph: { title: product.name, images: [product.imageUrl] },
  };
}

// 作品詳細
export default async function ProductPage({ params }: Props) {
  const { id } = await params;
  const product = getProductById(id);
  if (!product) notFound();

  const categorySlug = getCategorySlug(product.category);

  return (
    <article className={styles.wrap}>
      <nav className={styles.breadcrumb}>
        <Link href="/">作品一覧</Link>
        <span aria-hidden="true">›</span>
        <Link href={`/category/${categorySlug}`}>{product.category}</Link>
      </nav>

      <div className={styles.layout}>
        <div className={styles.imageWrap}>
          <Image
            src={product.imageUrl}
            alt={product.name}
            fill
            sizes="(min-width: 768px) 520px, 100vw"
            className={styles.image}
            loading="eager"
          />
        </div>

        <div>
          <Link href={`/category/${categorySlug}`} className={styles.category}>
            {product.category}
          </Link>
          <h1 className={styles.name}>{product.name}</h1>
          <p className={styles.description}>{product.description}</p>

          <Link href="/" className={styles.back}>
            ← 作品一覧へ戻る
          </Link>
        </div>
      </div>
    </article>
  );
}
