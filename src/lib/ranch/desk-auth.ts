// Ranch desk sign-in (Supabase Auth, email + password). The URL and publishable key are public values.
export const SUPABASE_URL = "https://xfwketfwfqufkeqjqkdu.supabase.co";
export const SUPABASE_PUBLISHABLE_KEY = "sb_publishable_eVahZGlDpXXEvcnBS5nhYA_sbGP1Ksp";
export const DESK_COOKIE = "ranch_desk_at";
const REFRESH_KEY = "ranch_desk_rt";

type Session = { access_token: string; refresh_token: string; expires_in: number };

function store(session: Session) {
  const secure = location.protocol === "https:" ? "; Secure" : "";
  document.cookie = `${DESK_COOKIE}=${session.access_token}; Path=/; Max-Age=${session.expires_in}; SameSite=Lax${secure}`;
  localStorage.setItem(REFRESH_KEY, session.refresh_token);
}

async function token(grant: "password" | "refresh_token", body: object): Promise<string | null> {
  const res = await fetch(`${SUPABASE_URL}/auth/v1/token?grant_type=${grant}`, {
    method: "POST",
    headers: { apikey: SUPABASE_PUBLISHABLE_KEY, "Content-Type": "application/json" },
    body: JSON.stringify(body),
  });
  const data = await res.json().catch(() => ({}));
  if (!res.ok || !data.access_token) return data.error_description || data.msg || "Sign-in failed.";
  store(data as Session);
  return null;
}

/** Returns an error message, or null on success. */
export function deskSignIn(email: string, password: string): Promise<string | null> {
  return token("password", { email, password });
}

/** Tries to renew the session from the saved refresh token. True if it worked. */
export async function deskRefresh(): Promise<boolean> {
  const refresh = localStorage.getItem(REFRESH_KEY);
  if (!refresh) return false;
  const failed = await token("refresh_token", { refresh_token: refresh });
  if (failed) localStorage.removeItem(REFRESH_KEY);
  return !failed;
}

export function deskSignOut() {
  document.cookie = `${DESK_COOKIE}=; Path=/; Max-Age=0; SameSite=Lax`;
  localStorage.removeItem(REFRESH_KEY);
}
