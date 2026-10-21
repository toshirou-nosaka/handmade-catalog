import { adminRoute } from "@/lib/admin/guard";
import { countChanges, publish } from "@/lib/admin/git";

export const dynamic = "force-dynamic";

// GitHub に未保存の変更数
export function GET(req: Request) {
  return adminRoute(req, async () => ({ changes: await countChanges() }));
}

// 変更を GitHub に保存（→ Vercel が自動でサイトを更新）
export function POST(req: Request) {
  return adminRoute(req, async () => {
    await publish();
    return { changes: 0 };
  });
}
