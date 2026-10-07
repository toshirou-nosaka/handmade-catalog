# ハンドメイド作品カタログ

木工・布・革のハンドメイド作品を URL で紹介するカタログサイトです（Next.js + TypeScript、DB なし）。

## 画面

| 画面 | URL |
|---|---|
| 作品一覧 | `/` |
| カテゴリ絞り込み | `/category/wood`（木工）・`/category/fabric`（布）・`/category/leather`（革） |
| 作品詳細 | `/products/1` など |

## 起動方法

Node.js 20.9 以上が必要です（https://nodejs.org の LTS 版）。

```bash
npm install
npm run dev
```

ブラウザで http://localhost:3000 を開きます。

## 作品の追加・編集

`src/data/products.ts` の `products` 配列を書き換えるだけです。

```ts
{
  id: "10",                         // 重複しない番号（URL になります）
  name: "作品名",
  category: "木工",                 // "木工" | "布" | "革" のどれか
  imageUrl: "https://.../photo.jpg",
  description: "説明文。\n改行もできます",
},
```

- 写真を別のサイト（例：Cloudinary などの画像ホスティング）に置く場合は、`next.config.ts` の `remotePatterns` にそのドメインを追加してください。
- 写真をプロジェクト内に置く場合は `public/images/xxx.jpg` に入れて、`imageUrl: "/images/xxx.jpg"` と書けば設定不要です。

## 公開（URL で見せる）

GitHub にこのフォルダを上げ、Vercel（https://vercel.com）でリポジトリを読み込むと、無料で `https://〇〇.vercel.app` の URL が発行されます。
