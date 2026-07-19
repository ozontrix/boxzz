import { NextRequest, NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import { supabaseAdmin } from "@/lib/api/supabase-admin";

// Simple session token generation
function generateSessionToken(): string {
  const chars = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";
  let token = "";
  for (let i = 0; i < 64; i++) {
    token += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return token;
}

async function setSession(token: string, userId: string) {
  const expiresAt = new Date(Date.now() + 24 * 60 * 60 * 1000); // 24 hours
  const { error } = await supabaseAdmin
    .from("admin_sessions")
    .upsert(
      { token, user_id: userId, expires_at: expiresAt.toISOString() },
      { onConflict: "token" }
    );
  if (error) throw error;
}

export async function POST(request: NextRequest) {
  try {
    const { email, password } = await request.json();

    if (!email || !password) {
      return NextResponse.json(
        { error: "Email and password are required" },
        { status: 400 }
      );
    }

    // Get admin user from admin_users table
    const { data: adminUser, error: userError } = await supabaseAdmin
      .from("admin_users")
      .select("*")
      .eq("email", email.toLowerCase().trim())
      .single();

    if (userError || !adminUser) {
      return NextResponse.json(
        { error: "Invalid email or password" },
        { status: 401 }
      );
    }

    // Verify password against stored hash
    const isValidPassword = await bcrypt.compare(password, adminUser.password_hash);
    if (!isValidPassword) {
      return NextResponse.json(
        { error: "Invalid email or password" },
        { status: 401 }
      );
    }

    // Generate session token and store in admin_sessions table
    const sessionToken = generateSessionToken();
    await setSession(sessionToken, adminUser.id);

    // Return user data (never expose password_hash)
    const response = NextResponse.json({
      user: {
        id: adminUser.id,
        email: adminUser.email,
        name: adminUser.name,
        role: adminUser.role,
        avatar: adminUser.avatar,
      },
    });

    // Set HTTP-only cookie for the session
    response.cookies.set("admin_session", sessionToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      path: "/",
      maxAge: 60 * 60 * 24, // 24 hours
    });

    return response;
  } catch (error: any) {
    console.error("Admin login error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}