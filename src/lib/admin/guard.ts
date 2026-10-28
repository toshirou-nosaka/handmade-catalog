// 管理用 API の共通チェック
// - 自分の PC で `npm run dev` しているときだけ動く（公開サイトでは 404）
// - 他のサイトから勝手に書き換えリクエストを送られないよう、送信元と専用ヘッダーを確認する

export const ADMIN_HEADER = "x-admin-request";

export class AdminError extends Error {
  constructor(
    message: string,
    public status = 400,
  ) {
    super(message);
  }
}

// 管理画面のオン・オフ。使わないときは false にする
const ADMIN_SWITCH = true;

export function isAdminEnabled() {
  return ADMIN_SWITCH && process.env.NODE_ENV === "development";
}

function check(req: Request) {
  if (!isAdminEnabled()) throw new AdminError("Not Found", 404);

  if (req.method !== "GET") {
    const origin = req.headers.get("origin");
    const host = req.headers.get("host");
    if (!origin || !host || new URL(origin).host !== host) {
      throw new AdminError("不正なリクエストです", 403);
    }
    if (req.headers.get(ADMIN_HEADER) !== "1") {
      throw new AdminError("不正なリクエストです", 403);
    }
  }
}

// API の処理を包んで、チェックとエラー応答をまとめて行う
export async function adminRoute(req: Request, fn: () => Promise<unknown>) {
  try {
    check(req);
    const result = await fn();
    return Response.json(result ?? { ok: true });
  } catch (e) {
    if (e instanceof AdminError) {
      return Response.json({ error: e.message }, { status: e.status });
    }
    console.error(e);
    return Response.json({ error: "サーバーでエラーが起きました" }, { status: 500 });
  }
}
