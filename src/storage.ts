export function serializeMap(m: Map<number, string>): string {
  const obj = Object.fromEntries(
    Array.from(m.entries(), ([k, v]) => [String(k), v])
  );
  return JSON.stringify(obj);
}

export function deserializeMap(raw: string | null): Map<number, string> {
  if (!raw) return new Map<number, string>();

  try {
    const obj = JSON.parse(raw) as Record<string, unknown>;
    if (!obj || typeof obj !== "object") return new Map<number, string>();

    return new Map<number, string>(
      Object.entries(obj).map(([k, v]) => [Number(k), String(v)])
    );
  } catch {
    return new Map<number, string>();
  }
}
