/**
 * 正規化 FinMind Token，避免 Vercel env 含換行 / Bearer 前綴導致 Headers 錯誤
 */
export function normalizeFinMindToken(raw: string | undefined): string {
  if (!raw) {
    throw new Error("FINMIND_TOKEN 未設定，請在環境變數填入 FinMind API Token");
  }

  let token = raw.trim();

  // 移除包裹引號
  if (
    (token.startsWith('"') && token.endsWith('"')) ||
    (token.startsWith("'") && token.endsWith("'"))
  ) {
    token = token.slice(1, -1).trim();
  }

  // 若整段已含 Bearer，只取 token 本體
  token = token.replace(/^Bearer\s+/i, "");

  // 移除所有空白字元（常見於複製貼上帶入換行）
  token = token.replace(/\s+/g, "");

  if (!token) {
    throw new Error("FINMIND_TOKEN 格式無效");
  }

  return token;
}

export function buildFinMindAuthHeader(): Record<string, string> {
  const token = normalizeFinMindToken(process.env.FINMIND_TOKEN);
  return { Authorization: `Bearer ${token}` };
}
