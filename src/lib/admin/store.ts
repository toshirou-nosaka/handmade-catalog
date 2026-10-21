import { promises as fs } from "fs";
import path from "path";
import { isCategory, type Product } from "@/data/products";
import { AdminError } from "./guard";

const DATA_FILE = path.join(process.cwd(), "src", "data", "products.json");
const IMAGE_DIR = path.join(process.cwd(), "public", "images");
const MAX_IMAGE_BYTES = 10 * 1024 * 1024;
const IMAGE_EXT: Record<string, string> = {
  "image/jpeg": "jpg",
  "image/png": "png",
  "image/webp": "webp",
};

export async function readProducts(): Promise<Product[]> {
  return JSON.parse(await fs.readFile(DATA_FILE, "utf8"));
}

export async function writeProducts(list: Product[]) {
  await fs.writeFile(DATA_FILE, JSON.stringify(list, null, 2) + "\n", "utf8");
}

export function nextId(list: Product[]) {
  const max = list.reduce((m, p) => Math.max(m, Number(p.id) || 0), 0);
  return String(max + 1);
}

// フォームの文字項目を取り出して確認する
export function parseFields(form: FormData) {
  const name = String(form.get("name") ?? "").trim();
  const category = String(form.get("category") ?? "");
  const description = String(form.get("description") ?? "").trim().replace(/\r\n/g, "\n");

  if (!name) throw new AdminError("作品名を入力してください");
  if (name.length > 100) throw new AdminError("作品名は100文字以内にしてください");
  if (!isCategory(category)) throw new AdminError("カテゴリを選んでください");
  if (description.length > 2000) throw new AdminError("説明は2000文字以内にしてください");

  return { name, category, description };
}

// 写真がフォームに含まれていれば取り出す
export function getImageFile(form: FormData): File | null {
  const image = form.get("image");
  return image instanceof File && image.size > 0 ? image : null;
}

// 写真を public/images に保存して、サイトで使うパス（/images/xxx.jpg）を返す
export async function saveImage(file: File, id: string) {
  const ext = IMAGE_EXT[file.type];
  if (!ext) throw new AdminError("写真は JPEG・PNG・WebP のいずれかにしてください");
  if (file.size > MAX_IMAGE_BYTES) throw new AdminError("写真が大きすぎます（10MB まで）");

  await fs.mkdir(IMAGE_DIR, { recursive: true });
  const fileName = `${id}-${Date.now()}.${ext}`;
  await fs.writeFile(path.join(IMAGE_DIR, fileName), Buffer.from(await file.arrayBuffer()));
  return `/images/${fileName}`;
}

// 管理画面で保存した写真（/images/ 配下）だけを削除する
export async function deleteImage(imageUrl: string) {
  if (!imageUrl.startsWith("/images/")) return;
  const fileName = path.basename(imageUrl);
  try {
    await fs.unlink(path.join(IMAGE_DIR, fileName));
  } catch (e) {
    if ((e as NodeJS.ErrnoException).code !== "ENOENT") throw e;
  }
}
