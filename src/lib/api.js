// The backend issues a short-lived JWT only for valid Better Auth sessions.
export async function api(path, options = {}, protectedRoute = false) {
  const headers = { ...(options.headers || {}) };
  if (protectedRoute) {
    const r = await fetch("/api/session/token", {
      credentials: "include", cache: "no-store"
    });
    const j = await r.json().catch(() => ({}));
    if (!r.ok || !j.token) throw new Error(j.error || "Please sign in again.");
    headers.Authorization = `Bearer ${j.token}`;
  }
  if (options.body && !(options.body instanceof FormData)) {
    headers["Content-Type"] = "application/json";
  }
  const res = await fetch(path, {
    ...options, headers, credentials: "include", cache: "no-store"
  });
  const data = await res.json().catch(() => ({}));
  if (!res.ok) throw new Error(data.error || `Request failed (${res.status})`);
  return data;
}
export const categories = [
  "Photography & Videography", "Wedding Venues", "Decoration & Florist",
  "Catering Services", "Makeup & Styling", "Wedding Fashion"
];
export const money = (n) => `৳${Number(n || 0).toLocaleString("en-BD")}`;
