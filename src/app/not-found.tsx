import Link from "next/link";

export default function NotFound() {
  return (
    <div style={{ textAlign: "center", padding: "48px 0" }}>
      <h1 className="page-heading">ページが見つかりません</h1>
      <p>お探しの作品は削除されたか、URL が間違っている可能性があります。</p>
      <p>
        <Link href="/" style={{ color: "var(--accent)", textDecoration: "underline" }}>
          作品一覧へ戻る
        </Link>
      </p>
    </div>
  );
}
