-- Auto-generate unique product slugs
-- ==================================
-- When a product is created without a slug (e.g. from the admin UI), the slug
-- is generated automatically from the product name. If the generated slug
-- already exists, a numeric suffix (-2, -3, ...) is appended so a UNIQUE
-- constraint violation is never raised. The same uniqueness logic applies when
-- a product is renamed.

-- Slugify helper: lowercase alphanumerics and single hyphens only.
CREATE OR REPLACE FUNCTION public.generate_product_slug(name text)
RETURNS text
LANGUAGE sql
IMMUTABLE
SET search_path = ''
AS $$
  SELECT regexp_replace(
    regexp_replace(lower(COALESCE(name, '')), '[^a-z0-9]+', '-', 'g'),
    '^-+|-+$', '', 'g'
  );
$$;

CREATE OR REPLACE FUNCTION public.set_unique_product_slug()
RETURNS trigger
LANGUAGE plpgsql
SET search_path = ''
AS $$
DECLARE
  base_slug text;
  candidate text;
  counter integer;
BEGIN
  IF TG_OP = 'INSERT' THEN
    -- Prefer an explicitly provided slug (e.g. seed data); otherwise
    -- generate one from the product name.
    base_slug := public.generate_product_slug(NEW.slug);
    IF base_slug = '' THEN
      base_slug := public.generate_product_slug(NEW.name);
    END IF;
  ELSE -- UPDATE
    -- Regenerate from the new name when it changed; otherwise keep the
    -- existing slug untouched.
    IF NEW.name IS DISTINCT FROM OLD.name THEN
      base_slug := public.generate_product_slug(NEW.name);
    ELSE
      base_slug := public.generate_product_slug(NEW.slug);
    END IF;
  END IF;

  IF base_slug = '' THEN
    base_slug := 'product';
  END IF;

  -- Append a numeric suffix until the slug is unique.
  candidate := base_slug;
  counter := 1;
  LOOP
    IF TG_OP = 'INSERT' THEN
      EXIT WHEN NOT EXISTS (SELECT 1 FROM public.products WHERE slug = candidate);
    ELSE
      EXIT WHEN NOT EXISTS (
        SELECT 1 FROM public.products WHERE slug = candidate AND id IS DISTINCT FROM NEW.id
      );
    END IF;
    counter := counter + 1;
    candidate := base_slug || '-' || counter;
  END LOOP;

  NEW.slug := candidate;
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS trg_products_set_unique_slug ON public.products;

CREATE TRIGGER trg_products_set_unique_slug
BEFORE INSERT OR UPDATE ON public.products
FOR EACH ROW
EXECUTE FUNCTION public.set_unique_product_slug();