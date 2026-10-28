import { NextRequest, NextResponse } from "next/server";

// 公開サイト全体にパスワード（Basic 認証）をかける。
// パスワードの値はコードに書かず、Vercel の環境変数 SITE_PASSWORD で設定する（リポジトリが公開のため）。
// 自分の PC で `npm run dev` するとき（管理画面を使うとき）はパスワードなしで動く。
export function proxy(request: NextRequest) {
  if (process.env.NODE_ENV === "development") {
    return NextResponse.next();
  }

  const password = process.env.SITE_PASSWORD;
  if (!password) {
    // 環境変数が未設定のあいだは、誰も中を見られないようにする（安全側）
    return new NextResponse("準備中です（パスワードが未設定です）", {
      status: 503,
      headers: { "Content-Type": "text/plain; charset=utf-8" },
    });
  }

  const auth = request.headers.get("authorization");
  if (auth?.startsWith("Basic ")) {
    const decoded = atob(auth.slice(6));
    // 「ユーザー名:パスワード」のうち、パスワード部分だけを照合する（ユーザー名は何でもよい）
    if (decoded.slice(decoded.indexOf(":") + 1) === password) {
      return NextResponse.next();
    }
  }

  return new NextResponse("パスワードが必要です", {
    status: 401,
    headers: {
      "WWW-Authenticate": 'Basic realm="handmade-catalog", charset="UTF-8"',
      "Content-Type": "text/plain; charset=utf-8",
    },
  });
}

export const config = {
  matcher: "/:path*",
};
