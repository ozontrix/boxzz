import { NextRequest } from "next/server";
import { supabaseAdmin } from "./supabase-admin";

export interface AdminUserRow {
  id: string;
  email: string;
  name: string;
  role: string;
  avatar?: string | null;
  password_hash: string;
}

/**
 * Resolve the currently authenticated admin from the `admin_session` cookie.
 * Returns null when there is no valid, unexpired session.
 */
export async function getCurrentAdmin(
  request: NextRequest
): Promise<AdminUserRow | null> {
  const sessionToken = request.cookies.get("admin_session")?.value;
  if (!sessionToken) return null;

  const { data: session, error } = await supabaseAdmin
    .from("admin_sessions")
    .select("*, admin_users(*)")
    .eq("token", sessionToken)
    .single();

  if (error || !session) return null;

  if (new Date(session.expires_at) < new Date()) {
    await supabaseAdmin.from("admin_sessions").delete().eq("token", sessionToken);
    return null;
  }

  return session.admin_users as AdminUserRow;
}
