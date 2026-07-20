// Run with: npx tsx --env-file=.env.local scripts/seed.ts
import { createClient } from "@supabase/supabase-js";
import { CATEGORIES, FEATURED_PRODUCTS, BANNERS } from "../src/lib/constants";

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;

if (!supabaseUrl || !supabaseAnonKey) {
  console.error("Missing env vars. Run with: npx tsx --env-file=.env.local scripts/seed.ts");
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseAnonKey);

async function seedCategories() {
  console.log("🔄 Seeding categories...");
  
  for (const cat of CATEGORIES) {
    const { error } = await supabase.from("categories").upsert(
      {
        id: cat.id,
        name: cat.name,
        name_hindi: cat.nameHindi,
        icon: cat.icon,
        description: cat.description,
        short_description: cat.shortDescription,
        image: cat.image,
        product_count: cat.productCount,
      },
      { onConflict: "id" }
    );
    if (error) {
      console.error(`❌ Error seeding category ${cat.id}:`, error.message);
    } else {
      console.log(`✅ Category: ${cat.name}`);
    }
  }
}

async function seedProducts() {
  console.log("\n🔄 Seeding products...");
  
  const batchSize = 3;
  const products = FEATURED_PRODUCTS;
  
  for (let i = 0; i < products.length; i += batchSize) {
    const batch = products.slice(i, i + batchSize);
    const records = batch.map((p) => ({
      id: p.id,
      name: p.name,
      slug: p.slug,
      description: p.description,
      short_description: p.shortDescription,
      price: p.price,
      original_price: p.originalPrice ?? null,
      images: p.images || [],
      category: p.category,
      subcategory: p.subcategory,
      features: p.features || [],
      specifications: p.specifications ?? {},
      rating: p.rating || 4.5,
      review_count: p.reviewCount || 0,
      in_stock: p.inStock ?? true,
      stock_count: p.stockCount ?? 0,
      moq: p.moq ?? 1,
      unit: p.unit || "piece",
      variants: p.variants || [],
      is_new: p.isNew ?? false,
      is_featured: p.isFeatured ?? false,
      is_best_seller: p.isBestSeller ?? false,
      discount: p.discount ?? null,
      customization_available: p.customizationAvailable ?? false,
      printing_options: p.printingOptions || [],
      applications: p.applications || [],
      created_at: p.createdAt || new Date().toISOString(),
    }));

    const { error } = await supabase.from("products").upsert(records, {
      onConflict: "id",
      ignoreDuplicates: false,
    });

    if (error) {
      console.error(`❌ Batch error (${i}-${i + batch.length}):`, error.message);
      for (const record of records) {
        const { error: singleErr } = await supabase
          .from("products")
          .upsert(record, { onConflict: "id" });
        if (singleErr) {
          console.error(`❌ Product ${record.id}:`, singleErr.message);
        } else {
          console.log(`✅ Product: ${record.name.substring(0, 40)}...`);
        }
      }
    } else {
      batch.forEach((p) =>
        console.log(`✅ Product: ${p.name.substring(0, 40)}...`)
      );
    }
  }
}

async function seedBanners() {
  console.log("\n🔄 Seeding banners...");
  
  for (const b of BANNERS) {
    const { error } = await supabase.from("banners").upsert(
      {
        id: b.id,
        title: b.title,
        subtitle: b.subtitle,
        image: b.image,
        cta: b.cta,
        cta_link: b.ctaLink,
        bg_color: b.bgColor,
        is_active: true,
        sort_order: BANNERS.indexOf(b),
      },
      { onConflict: "id" }
    );
    if (error) {
      console.error(`❌ Error seeding banner ${b.id}:`, error.message);
    } else {
      console.log(`✅ Banner: ${b.title.substring(0, 40)}...`);
    }
  }
}

async function main() {
  console.log("🚀 Starting seed...\n");
  await seedCategories();
  console.log();
  await seedProducts();
  console.log();
  await seedBanners();
  console.log("\n✅ Seeding complete!");
}

main().catch(console.error);