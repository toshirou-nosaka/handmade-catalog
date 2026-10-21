import type { Metadata, Viewport } from "next";
import Link from "next/link";
import "./globals.css";

const SITE_NAME = "ハンドメイド作品カタログ";

export const metadata: Metadata = {
  title: { default: SITE_NAME, template: `%s | ${SITE_NAME}` },
  description: "木工・布・革のハンドメイド作品を紹介するカタログです。",
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="ja">
      <body>
        <header className="site-header">
          <div className="container">
            <Link href="/" className="site-title">
              {SITE_NAME}
            </Link>
            {/* 自分の PC（npm run dev）でだけ表示 */}
            {process.env.NODE_ENV === "development" && (
              <Link href="/admin" className="admin-link">
                管理画面
              </Link>
            )}
          </div>
        </header>
        <main>
          <div className="container">{children}</div>
        </main>
        <footer className="site-footer">© {SITE_NAME}</footer>
      </body>
    </html>
  );
}
