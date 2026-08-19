CREATE TYPE public.app_role AS ENUM ('admin', 'user');

CREATE TABLE public.user_roles (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  role public.app_role NOT NULL,
  created_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE (user_id, role)
);
GRANT SELECT ON public.user_roles TO authenticated;
GRANT ALL ON public.user_roles TO service_role;
ALTER TABLE public.user_roles ENABLE ROW LEVEL SECURITY;

CREATE OR REPLACE FUNCTION public.has_role(_user_id uuid, _role public.app_role)
RETURNS boolean
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (SELECT 1 FROM public.user_roles WHERE user_id = _user_id AND role = _role);
$$;

CREATE POLICY "Admins can view roles" ON public.user_roles
  FOR SELECT TO authenticated USING (public.has_role(auth.uid(), 'admin'));

CREATE OR REPLACE FUNCTION public.set_updated_at()
RETURNS TRIGGER
LANGUAGE plpgsql
SET search_path = public
AS $$ BEGIN NEW.updated_at = now(); RETURN NEW; END; $$;

-- import documents
CREATE TABLE public.import_documents (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  filename text NOT NULL,
  document_number integer,
  import_order integer,
  expected_hadith_start integer,
  expected_hadith_end integer,
  expected_hadith_count integer,
  imported_hadith_count integer DEFAULT 0,
  unique_hadith_count integer DEFAULT 0,
  book_count integer DEFAULT 0,
  collection_count integer DEFAULT 0,
  chapter_count integer DEFAULT 0,
  imported_at timestamptz NOT NULL DEFAULT now(),
  validation_status text NOT NULL DEFAULT 'pending',
  validation_notes text
);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.import_documents TO authenticated;
GRANT ALL ON public.import_documents TO service_role;
ALTER TABLE public.import_documents ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Admins manage import documents" ON public.import_documents
  FOR ALL TO authenticated USING (public.has_role(auth.uid(), 'admin')) WITH CHECK (public.has_role(auth.uid(), 'admin'));

-- books
CREATE TABLE public.books (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  book_number integer NOT NULL UNIQUE,
  title_ar text,
  title_en text,
  title_en_is_translated boolean NOT NULL DEFAULT false,
  title_ar_is_translated boolean NOT NULL DEFAULT false,
  sort_order integer NOT NULL DEFAULT 0,
  source_document_id uuid REFERENCES public.import_documents(id) ON DELETE SET NULL,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT ON public.books TO anon;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.books TO authenticated;
GRANT ALL ON public.books TO service_role;
ALTER TABLE public.books ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Books are publicly readable" ON public.books FOR SELECT USING (true);
CREATE POLICY "Admins manage books" ON public.books FOR ALL TO authenticated
  USING (public.has_role(auth.uid(), 'admin')) WITH CHECK (public.has_role(auth.uid(), 'admin'));
CREATE TRIGGER books_updated_at BEFORE UPDATE ON public.books FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

-- collections
CREATE TABLE public.collections (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  book_id uuid NOT NULL REFERENCES public.books(id) ON DELETE CASCADE,
  title_ar text,
  title_en text,
  title_en_is_translated boolean NOT NULL DEFAULT false,
  title_ar_is_translated boolean NOT NULL DEFAULT false,
  sort_order integer NOT NULL DEFAULT 0,
  source_document_id uuid REFERENCES public.import_documents(id) ON DELETE SET NULL,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT ON public.collections TO anon;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.collections TO authenticated;
GRANT ALL ON public.collections TO service_role;
ALTER TABLE public.collections ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Collections are publicly readable" ON public.collections FOR SELECT USING (true);
CREATE POLICY "Admins manage collections" ON public.collections FOR ALL TO authenticated
  USING (public.has_role(auth.uid(), 'admin')) WITH CHECK (public.has_role(auth.uid(), 'admin'));
CREATE TRIGGER collections_updated_at BEFORE UPDATE ON public.collections FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

-- chapters
CREATE TABLE public.chapters (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  book_id uuid NOT NULL REFERENCES public.books(id) ON DELETE CASCADE,
  collection_id uuid REFERENCES public.collections(id) ON DELETE SET NULL,
  chapter_number integer,
  title_ar text,
  title_en text,
  title_en_is_translated boolean NOT NULL DEFAULT false,
  title_ar_is_translated boolean NOT NULL DEFAULT false,
  sort_order integer NOT NULL DEFAULT 0,
  source_document_id uuid REFERENCES public.import_documents(id) ON DELETE SET NULL,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT ON public.chapters TO anon;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.chapters TO authenticated;
GRANT ALL ON public.chapters TO service_role;
ALTER TABLE public.chapters ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Chapters are publicly readable" ON public.chapters FOR SELECT USING (true);
CREATE POLICY "Admins manage chapters" ON public.chapters FOR ALL TO authenticated
  USING (public.has_role(auth.uid(), 'admin')) WITH CHECK (public.has_role(auth.uid(), 'admin'));
CREATE TRIGGER chapters_updated_at BEFORE UPDATE ON public.chapters FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

-- hadiths
CREATE TABLE public.hadiths (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  hadith_number integer NOT NULL UNIQUE,
  book_id uuid REFERENCES public.books(id) ON DELETE SET NULL,
  collection_id uuid REFERENCES public.collections(id) ON DELETE SET NULL,
  chapter_id uuid REFERENCES public.chapters(id) ON DELETE SET NULL,
  arabic_source text,
  arabic_display text,
  english_source text,
  english_display text,
  full_source_content text,
  full_display_content text,
  search_ar_normalized text,
  search_en_normalized text,
  sort_order integer NOT NULL DEFAULT 0,
  source_document_id uuid REFERENCES public.import_documents(id) ON DELETE SET NULL,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT ON public.hadiths TO anon;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.hadiths TO authenticated;
GRANT ALL ON public.hadiths TO service_role;
ALTER TABLE public.hadiths ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Hadiths are publicly readable" ON public.hadiths FOR SELECT USING (true);
CREATE POLICY "Admins manage hadiths" ON public.hadiths FOR ALL TO authenticated
  USING (public.has_role(auth.uid(), 'admin')) WITH CHECK (public.has_role(auth.uid(), 'admin'));
CREATE TRIGGER hadiths_updated_at BEFORE UPDATE ON public.hadiths FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

CREATE INDEX hadiths_number_idx ON public.hadiths (hadith_number);
CREATE INDEX hadiths_chapter_idx ON public.hadiths (chapter_id, sort_order);
CREATE INDEX hadiths_book_idx ON public.hadiths (book_id, sort_order);

CREATE EXTENSION IF NOT EXISTS pg_trgm;
CREATE INDEX hadiths_search_ar_trgm ON public.hadiths USING gin (search_ar_normalized gin_trgm_ops);
CREATE INDEX hadiths_search_en_trgm ON public.hadiths USING gin (search_en_normalized gin_trgm_ops);

-- correction log
CREATE TABLE public.correction_log (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  source_document_id uuid REFERENCES public.import_documents(id) ON DELETE SET NULL,
  source_filename text,
  hadith_number integer,
  book_title text,
  collection_title text,
  chapter_title text,
  location text,
  original_text text NOT NULL,
  corrected_text text NOT NULL,
  correction_type text NOT NULL,
  review_status text NOT NULL DEFAULT 'unreviewed',
  created_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.correction_log TO authenticated;
GRANT ALL ON public.correction_log TO service_role;
ALTER TABLE public.correction_log ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Admins manage correction log" ON public.correction_log FOR ALL TO authenticated
  USING (public.has_role(auth.uid(), 'admin')) WITH CHECK (public.has_role(auth.uid(), 'admin'));

-- import issues
CREATE TABLE public.import_issues (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  source_document_id uuid REFERENCES public.import_documents(id) ON DELETE SET NULL,
  hadith_number integer,
  issue_type text NOT NULL,
  description text,
  severity text NOT NULL DEFAULT 'warning',
  review_status text NOT NULL DEFAULT 'open',
  created_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.import_issues TO authenticated;
GRANT ALL ON public.import_issues TO service_role;
ALTER TABLE public.import_issues ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Admins manage import issues" ON public.import_issues FOR ALL TO authenticated
  USING (public.has_role(auth.uid(), 'admin')) WITH CHECK (public.has_role(auth.uid(), 'admin'));