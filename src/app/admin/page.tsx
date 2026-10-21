import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { isAdminEnabled } from "@/lib/admin/guard";
import AdminApp from "./AdminApp";

export const metadata: Metadata = {
  title: "管理画面",
  robots: { index: false, follow: false },
};

// 管理画面は自分の PC（npm run dev）でだけ表示。公開サイトでは 404
export default function AdminPage() {
  if (!isAdminEnabled()) notFound();
  return <AdminApp />;
}
