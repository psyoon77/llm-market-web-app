type Entry = { count: number; resetAt: number };

const buckets = new Map<string, Entry>();

export function isRateLimited(key: string, limit: number, windowMs: number) {
  const now = Date.now();
  const current = buckets.get(key);

  if (!current || current.resetAt <= now) {
    buckets.set(key, { count: 1, resetAt: now + windowMs });
    return false;
  }

  current.count += 1;
  return current.count > limit;
}

export function requestKey(req: Request, scope: string) {
  const forwarded = req.headers.get("x-forwarded-for")?.split(",")[0]?.trim();
  return `${scope}:${forwarded || "local"}`;
}
