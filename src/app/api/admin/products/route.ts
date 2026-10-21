import { AdminError, adminRoute } from "@/lib/admin/guard";
import { getImageFile, nextId, parseFields, readProducts, saveImage, writeProducts } from "@/lib/admin/store";

export const dynamic = "force-dynamic";

// 作品一覧を取得
export function GET(req: Request) {
  return adminRoute(req, () => readProducts());
}

// 作品を追加
export function POST(req: Request) {
  return adminRoute(req, async () => {
    const form = await req.formData();
    const fields = parseFields(form);
    const image = getImageFile(form);
    if (!image) throw new AdminError("写真を選んでください");

    const list = await readProducts();
    const id = nextId(list);
    const imageUrl = await saveImage(image, id);
    const product = { id, ...fields, imageUrl };
    await writeProducts([...list, product]);
    return product;
  });
}
