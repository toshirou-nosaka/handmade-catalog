import { execFile } from "child_process";
import { AdminError } from "./guard";

// 管理画面が GitHub に保存するのは作品データと写真だけ
const PATHS = ["src/data/products.json", "public/images"];
const WINDOWS_GIT = "C:\\Program Files\\Git\\cmd\\git.exe";

function exec(cmd: string, args: string[]) {
  return new Promise<string>((resolve, reject) => {
    execFile(cmd, args, { cwd: process.cwd(), windowsHide: true }, (err, stdout, stderr) => {
      if (err) reject(Object.assign(err, { stderr: String(stderr) }));
      else resolve(String(stdout));
    });
  });
}

async function git(args: string[]) {
  try {
    return await exec("git", args);
  } catch (e) {
    // Git を入れた直後で PATH が古い場合に備えて、標準のインストール先も試す
    if ((e as NodeJS.ErrnoException).code === "ENOENT" && process.platform === "win32") {
      return exec(WINDOWS_GIT, args);
    }
    throw e;
  }
}

// まだ GitHub に保存していない変更（ファイル数）
export async function countChanges() {
  const out = await git(["status", "--porcelain", "-uall", "--", ...PATHS]);
  return out.split("\n").filter(Boolean).length;
}

export async function publish() {
  if ((await countChanges()) === 0) throw new AdminError("保存する変更はありません");

  await git(["add", "-A", "--", ...PATHS]);
  await git(["commit", "-m", "管理画面から作品を更新", "--", ...PATHS]);
  try {
    await git(["push"]);
  } catch (e) {
    console.error((e as { stderr?: string }).stderr ?? e);
    throw new AdminError(
      "GitHub への送信に失敗しました。インターネット接続と GitHub へのログインを確認して、もう一度押してください。",
      502,
    );
  }
}
