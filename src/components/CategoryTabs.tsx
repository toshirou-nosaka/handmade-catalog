import Link from "next/link";
import { categories, type CategorySlug } from "@/data/products";
import styles from "./CategoryTabs.module.css";

type Props = {
  // 選択中のタブ。"all" はすべて
  active: CategorySlug | "all";
};

export default function CategoryTabs({ active }: Props) {
  const tabs = [
    { href: "/", label: "すべて", key: "all" },
    ...categories.map((c) => ({ href: `/category/${c.slug}`, label: c.label, key: c.slug })),
  ];

  return (
    <nav className={styles.tabs} aria-label="カテゴリ">
      {tabs.map((tab) => {
        const isActive = tab.key === active;
        return (
          <Link
            key={tab.key}
            href={tab.href}
            className={isActive ? `${styles.tab} ${styles.active}` : styles.tab}
            aria-current={isActive ? "page" : undefined}
          >
            {tab.label}
          </Link>
        );
      })}
    </nav>
  );
}
