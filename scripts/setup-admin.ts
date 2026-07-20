// Run with: npx tsx scripts/setup-admin.ts
import { createClient } from "@supabase/supabase-js";
import bcrypt from "bcryptjs";

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;

const supabase = createClient(supabaseUrl, supabaseServiceKey, {
  auth: { autoRefreshToken: false, persistSession: false },
});

async function main() {
  const adminEmail = "boxzzmanager@gmail.com";
  const adminPassword = "BoxzzAdmin@2024";
  
  // Hash password
  const passwordHash = await bcrypt.hash(adminPassword, 12);
  
  // Update admin user
  const { data, error } = await supabase
    .from("admin_users")
    .upsert({
      id: "9a59f86f-c79d-468f-947b-6eaca02b8623",
      email: adminEmail,
      password_hash: passwordHash,
      name: "Akshay",
      role: "superadmin",
    }, { onConflict: "email" })
    .select();
  
  if (error) {
    console.error("Error updating admin:", error);
  } else {
    console.log("✅ Admin user updated:", data);
  }

  // Also create admin if not exists
  const { data: checkData } = await supabase
    .from("admin_users")
    .select("id, email")
    .eq("email", adminEmail)
    .single();
  
  if (!checkData) {
    const { error: insertError } = await supabase
      .from("admin_users")
      .insert({
        email: adminEmail,
        password_hash: passwordHash,
        name: "Akshay",
        role: "superadmin",
      });
    
    if (insertError) {
      console.error("Error creating admin:", insertError);
    } else {
      console.log("✅ Admin user created");
    }
  }

  console.log(`\n Admin Login Credentials:`);
  console.log(`   Email: ${adminEmail}`);
  console.log(`   Password: ${adminPassword}`);
}

main().catch(console.error);