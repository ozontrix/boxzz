import { NextRequest, NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/api/supabase-admin";

export async function GET(request: NextRequest) {
  try {
    const sessionToken = request.cookies.get("admin_session")?.value;

    if (!sessionToken) {
      return NextResponse.json({ user: null });
    }

    // Get the session from the database
    const { data: session, error: sessionError } = await supabaseAdmin
      .from("admin_sessions")
      .select("*, admin_users(*)")
      .eq("token", sessionToken)
      .single();

    if (sessionError || !session) {
      return NextResponse.json({ user: null });
    }

    // Check if session has expired
    const expiresAt = new Date(session.expires_at);
    if (expiresAt < new Date()) {
      // Clean up expired session
      await supabaseAdmin
        .from("admin_sessions")
        .delete()
        .eq("token", sessionToken);
      return NextResponse.json({ user: null });
    }

    const adminUser = session.admin_users;

    return NextResponse.json({
      user: {
        id: adminUser.id,
        email: adminUser.email,
        name: adminUser.name,
        role: adminUser.role,
        avatar: adminUser.avatar,
      },
    });
  } catch (error: any) {
    console.error("Admin session error:", error);
    return NextResponse.json({ user: null });
  }
}