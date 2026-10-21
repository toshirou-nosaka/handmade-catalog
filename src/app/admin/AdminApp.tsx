"use client";

import Link from "next/link";
import { useCallback, useEffect, useState } from "react";
import { categories, type Category, type Product } from "@/data/products";
import styles from "./admin.module.css";

const MAX_IMAGE_SIZE = 1600; // 写真の長辺をこのピクセル数まで縮めてから保存

type Form = { name: string; category: Category; description: string };
const emptyForm: Form = { name: "", category: categories[0].label, description: "" };

// 管理用 API を呼ぶ（書き換え系には専用ヘッダーを付ける）
async function api<T>(url: string, init?: RequestInit): Promise<T> {
  const res = await fetch(url, {
    ...init,
    headers: { "X-Admin-Request": "1", ...init?.headers },
  });
  const data = await res.json().catch(() => ({}));
  if (!res.ok) throw new Error(data.error ?? `エラー（${res.status}）`);
  return data as T;
}

// スマホの大きな写真を縮小して JPEG にする
async function resizeImage(file: File): Promise<Blob> {
  let bitmap: ImageBitmap;
  try {
    bitmap = await createImageBitmap(file);
  } catch {
    throw new Error("この写真は読み込めません。JPEG・PNG 形式の写真を選んでください。");
  }
  const scale = Math.min(1, MAX_IMAGE_SIZE / Math.max(bitmap.width, bitmap.height));
  const canvas = document.createElement("canvas");
  canvas.width = Math.round(bitmap.width * scale);
  canvas.height = Math.round(bitmap.height * scale);
  canvas.getContext("2d")!.drawImage(bitmap, 0, 0, canvas.width, canvas.height);
  bitmap.close();
  return new Promise((resolve, reject) =>
    canvas.toBlob((b) => (b ? resolve(b) : reject(new Error("写真の変換に失敗しました"))), "image/jpeg", 0.85),
  );
}

export default function AdminApp() {
  const [products, setProducts] = useState<Product[]>([]);
  const [changes, setChanges] = useState(0);
  const [loading, setLoading] = useState(true);
  // null: フォームを閉じている / "new": 新規追加 / Product: 編集中
  const [editing, setEditing] = useState<Product | "new" | null>(null);
  const [form, setForm] = useState<Form>(emptyForm);
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [preview, setPreview] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);
  const [message, setMessage] = useState<{ type: "ok" | "error"; text: string } | null>(null);

  const reload = useCallback(async () => {
    const [list, status] = await Promise.all([
      api<Product[]>("/api/admin/products"),
      api<{ changes: number }>("/api/admin/publish"),
    ]);
    setProducts(list);
    setChanges(status.changes);
  }, []);

  useEffect(() => {
    reload()
      .catch((e) => setMessage({ type: "error", text: e.message }))
      .finally(() => setLoading(false));
  }, [reload]);

  // 選んだ写真のプレビュー URL を後片付けする
  useEffect(() => {
    return () => {
      if (preview?.startsWith("blob:")) URL.revokeObjectURL(preview);
    };
  }, [preview]);

  function openNew() {
    setEditing("new");
    setForm(emptyForm);
    setImageFile(null);
    setPreview(null);
    setMessage(null);
  }

  function openEdit(p: Product) {
    setEditing(p);
    setForm({ name: p.name, category: p.category, description: p.description });
    setImageFile(null);
    setPreview(p.imageUrl);
    setMessage(null);
  }

  function closeForm() {
    setEditing(null);
    setImageFile(null);
    setPreview(null);
  }

  function onPickImage(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    setImageFile(file);
    setPreview(URL.createObjectURL(file));
  }

  async function run(task: () => Promise<void>, okText: string) {
    setBusy(true);
    setMessage(null);
    try {
      await task();
      await reload();
      setMessage({ type: "ok", text: okText });
    } catch (e) {
      setMessage({ type: "error", text: (e as Error).message });
    } finally {
      setBusy(false);
    }
  }

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!editing) return;
    const isNew = editing === "new";
    if (isNew && !imageFile) {
      setMessage({ type: "error", text: "写真を選んでください" });
      return;
    }

    await run(async () => {
      const body = new FormData();
      body.set("name", form.name);
      body.set("category", form.category);
      body.set("description", form.description);
      if (imageFile) body.set("image", await resizeImage(imageFile), "photo.jpg");

      await api(isNew ? "/api/admin/products" : `/api/admin/products/${editing.id}`, {
        method: isNew ? "POST" : "PUT",
        body,
      });
      closeForm();
    }, isNew ? "作品を追加しました" : "作品を更新しました");
  }

  async function onDelete(p: Product) {
    if (!confirm(`「${p.name}」を削除しますか？`)) return;
    await run(async () => {
      await api(`/api/admin/products/${p.id}`, { method: "DELETE" });
      if (editing !== "new" && editing?.id === p.id) closeForm();
    }, "作品を削除しました");
  }

  async function onPublish() {
    if (!confirm("変更を GitHub に保存して、公開サイトに反映しますか？")) return;
    await run(async () => {
      await api("/api/admin/publish", { method: "POST" });
    }, "GitHub に保存しました。1〜2 分ほどで公開サイトに反映されます。");
  }

  return (
    <div className={styles.wrap}>
      <div className={styles.titleRow}>
        <h1 className="page-heading">管理画面</h1>
        <Link href="/" className={styles.subLink}>
          サイトを見る →
        </Link>
      </div>

      {/* 公開バー */}
      <div className={changes > 0 ? `${styles.publishBar} ${styles.pending}` : styles.publishBar}>
        <span>
          {changes > 0 ? `公開サイトに未反映の変更があります（${changes} 件）` : "すべての変更は公開済みです"}
        </span>
        <button
          type="button"
          className={styles.primary}
          onClick={onPublish}
          disabled={busy || changes === 0}
        >
          GitHub に保存して公開
        </button>
      </div>

      {message && (
        <p className={message.type === "ok" ? styles.ok : styles.error} role="status">
          {message.text}
        </p>
      )}

      {/* 追加・編集フォーム */}
      {editing ? (
        <form className={styles.form} onSubmit={onSubmit}>
          <h2 className={styles.formTitle}>{editing === "new" ? "作品を追加" : "作品を編集"}</h2>

          <label className={styles.field}>
            <span>作品名</span>
            <input
              value={form.name}
              onChange={(e) => setForm({ ...form, name: e.target.value })}
              maxLength={100}
              required
            />
          </label>

          <label className={styles.field}>
            <span>カテゴリ</span>
            <select
              value={form.category}
              onChange={(e) => setForm({ ...form, category: e.target.value as Category })}
            >
              {categories.map((c) => (
                <option key={c.slug} value={c.label}>
                  {c.label}
                </option>
              ))}
            </select>
          </label>

          <div className={styles.field}>
            <span>写真{editing !== "new" && "（変える場合だけ選択）"}</span>
            {preview && <img src={preview} alt="" className={styles.preview} />}
            <input type="file" accept="image/jpeg,image/png,image/webp" onChange={onPickImage} />
          </div>

          <label className={styles.field}>
            <span>説明</span>
            <textarea
              value={form.description}
              onChange={(e) => setForm({ ...form, description: e.target.value })}
              rows={5}
              maxLength={2000}
            />
          </label>

          <div className={styles.actions}>
            <button type="submit" className={styles.primary} disabled={busy}>
              {busy ? "保存中…" : "保存"}
            </button>
            <button type="button" onClick={closeForm} disabled={busy}>
              キャンセル
            </button>
          </div>
        </form>
      ) : (
        <button type="button" className={styles.addButton} onClick={openNew} disabled={busy}>
          ＋ 作品を追加
        </button>
      )}

      {/* 作品リスト */}
      {loading ? (
        <p>読み込み中…</p>
      ) : (
        <ul className={styles.list}>
          {products.map((p) => (
            <li key={p.id} className={styles.row}>
              <img src={p.imageUrl} alt="" className={styles.thumb} />
              <div className={styles.rowBody}>
                <span className={styles.category}>{p.category}</span>
                <Link href={`/products/${p.id}`} className={styles.name}>
                  {p.name}
                </Link>
              </div>
              <div className={styles.rowActions}>
                <button type="button" onClick={() => openEdit(p)} disabled={busy}>
                  編集
                </button>
                <button type="button" className={styles.danger} onClick={() => onDelete(p)} disabled={busy}>
                  削除
                </button>
              </div>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
