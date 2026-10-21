import { AdminError, adminRoute } from "@/lib/admin/guard";
import {
  deleteImage,
  getImageFile,
  parseFields,
  readProducts,
  saveImage,
  writeProducts,
} from "@/lib/admin/store";

export const dynamic = "force-dynamic";

type Ctx = { params: Promise<{ id: string }> };

async function findProduct(id: string) {
  const list = await readProducts();
  const index = list.findIndex((p) => p.id === id);
  if (index < 0) throw new AdminError("作品が見つかりません", 404);
  return { list, index, product: list[index] };
}

// 作品を更新（写真は選び直したときだけ差し替え）
export function PUT(req: Request, { params }: Ctx) {
  return adminRoute(req, async () => {
    const { id } = await params;
    const form = await req.formData();
    const fields = parseFields(form);
    const { list, index, product } = await findProduct(id);

    const image = getImageFile(form);
    let imageUrl = product.imageUrl;
    if (image) {
      imageUrl = await saveImage(image, id);
      await deleteImage(product.imageUrl);
    }

    const updated = { ...product, ...fields, imageUrl };
    list[index] = updated;
    await writeProducts(list);
    return updated;
  });
}

// 作品を削除
export function DELETE(req: Request, { params }: Ctx) {
  return adminRoute(req, async () => {
    const { id } = await params;
    const { list, index, product } = await findProduct(id);
    list.splice(index, 1);
    await writeProducts(list);
    await deleteImage(product.imageUrl);
  });
}
