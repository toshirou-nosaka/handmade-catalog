import Image from "next/image";
import Link from "next/link";
import type { Product } from "@/data/products";
import styles from "./ProductGrid.module.css";

export default function ProductGrid({ products }: { products: Product[] }) {
  if (products.length === 0) {
    return <p className={styles.empty}>このカテゴリの作品はまだありません。</p>;
  }

  return (
    <ul className={styles.grid}>
      {products.map((product, i) => (
        <li key={product.id}>
          <Link href={`/products/${product.id}`} className={styles.card}>
            <div className={styles.imageWrap}>
              <Image
                src={product.imageUrl}
                alt={product.name}
                fill
                sizes="(min-width: 960px) 340px, (min-width: 600px) 50vw, 100vw"
                className={styles.image}
                loading={i < 2 ? "eager" : "lazy"}
              />
            </div>
            <div className={styles.body}>
              <span className={styles.category}>{product.category}</span>
              <h2 className={styles.name}>{product.name}</h2>
            </div>
          </Link>
        </li>
      ))}
    </ul>
  );
}
