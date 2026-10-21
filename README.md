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

## 作品の追加・編集（管理画面）

1. `npm run dev` で起動し、http://localhost:3000/admin を開く（ヘッダー右上の「管理画面」からも行けます）
2. 「＋ 作品を追加」／各作品の「編集」「削除」で変更する
   - 写真はスマホ・PC の画像を選ぶだけ。長辺 1600px に縮小して `public/images/` に保存されます
3. 上部の **「GitHub に保存して公開」** を押す → 1〜2 分で公開サイトに反映（Vercel が自動で更新）

管理画面は **自分の PC で起動したときだけ** 使えます。公開サイトの `/admin` は 404 で、外部から書き換えられることはありません。

### 手で編集する場合

データは `src/data/products.json` にあります（`src/data/products.ts` が `const products` として読み込みます）。

- `category` は "木工" | "布" | "革" のどれか
- 写真を別のサイトに置く場合は、`next.config.ts` の `remotePatterns` にそのドメインを追加してください

## 公開（URL で見せる）

GitHub にこのフォルダを上げ、Vercel（https://vercel.com）でリポジトリを読み込むと、無料で `https://〇〇.vercel.app` の URL が発行されます。
