ALTER TABLE public.books
  ADD COLUMN IF NOT EXISTS intro_ar_source text,
  ADD COLUMN IF NOT EXISTS intro_ar_display text,
  ADD COLUMN IF NOT EXISTS intro_en_source text,
  ADD COLUMN IF NOT EXISTS intro_en_display text;

ALTER TABLE public.collections
  ADD COLUMN IF NOT EXISTS intro_ar_source text,
  ADD COLUMN IF NOT EXISTS intro_ar_display text,
  ADD COLUMN IF NOT EXISTS intro_en_source text,
  ADD COLUMN IF NOT EXISTS intro_en_display text;

ALTER TABLE public.chapters
  ADD COLUMN IF NOT EXISTS intro_ar_source text,
  ADD COLUMN IF NOT EXISTS intro_ar_display text,
  ADD COLUMN IF NOT EXISTS intro_en_source text,
  ADD COLUMN IF NOT EXISTS intro_en_display text;