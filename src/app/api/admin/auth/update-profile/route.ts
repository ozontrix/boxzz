import { NextRequest, NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/api/supabase-admin";
import { getCurrentAdmin } from "@/lib/api/admin-session";

export async function POST(request: NextRequest) {
  try {
    const admin = await getCurrentAdmin(request);
    if (!admin) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { name, email } = await request.json();
    const newName = String(name ?? "").trim();
    const newEmail = String(email ?? "").trim().toLowerCase();

    if (!newName || !newEmail) {
      return NextResponse.json(
        { error: "Name and email are required" },
        { status: 400 }
      );
    }

    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(newEmail)) {
      return NextResponse.json(
        { error: "Please enter a valid email address" },
        { status: 400 }
      );
    }

    // Make sure the new email isn't already used by another admin
    const { data: existing } = await supabaseAdmin
      .from("admin_users")
      .select("id")
      .eq("email", newEmail)
      .neq("id", admin.id)
      .maybeSingle();

    if (existing) {
      return NextResponse.json(
        { error: "This email is already in use by another admin account" },
        { status: 409 }
      );
    }

    const { data, error } = await supabaseAdmin
      .from("admin_users")
      .update({
        name: newName,
        email: newEmail,
        updated_at: new Date().toISOString(),
      })
      .eq("id", admin.id)
      .select()
      .single();

    if (error) throw error;

    return NextResponse.json({
      user: {
        id: data.id,
        email: data.email,
        name: data.name,
        role: data.role,
        avatar: data.avatar,
      },
    });
  } catch (error: any) {
    console.error("Admin profile update error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
