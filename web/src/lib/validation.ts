export const LIMITS = {
  username: 40,
  password: 128,
  title: 120,
  body: 4_000,
  profileTitle: 120,
  profileBody: 2_000,
  caption: 160,
  prompt: 2_000,
  historyItems: 10,
  historyContent: 4_000,
  images: 3,
  imageDataUrl: 2_800_000,
} as const;

export type SafeImage = { url: string; caption: string };

export function cleanText(value: unknown, maxLength: number) {
  return typeof value === "string" ? value.trim().slice(0, maxLength) : "";
}

export function isValidUsername(value: string) {
  return /^[a-zA-Z0-9][a-zA-Z0-9_-]{2,39}$/.test(value);
}

export function parseImages(value: unknown): SafeImage[] {
  if (!Array.isArray(value)) return [];

  const allowed = /^data:image\/(?:jpeg|png);base64,[a-zA-Z0-9+/=]+$/;
  const result: SafeImage[] = [];

  for (const item of value.slice(0, LIMITS.images)) {
    const url = typeof item?.url === "string" ? item.url : "";
    if (!url || url.length > LIMITS.imageDataUrl || !allowed.test(url)) continue;

    result.push({
      url,
      caption: cleanText(item?.caption, LIMITS.caption),
    });
  }

  return result;
}
