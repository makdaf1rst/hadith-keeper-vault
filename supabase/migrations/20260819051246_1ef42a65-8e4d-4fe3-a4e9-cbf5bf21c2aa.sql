REVOKE EXECUTE ON FUNCTION public.has_role(uuid, public.app_role) FROM PUBLIC, anon;
GRANT EXECUTE ON FUNCTION public.has_role(uuid, public.app_role) TO authenticated, service_role;

CREATE SCHEMA IF NOT EXISTS extensions;
DROP INDEX IF EXISTS public.hadiths_search_ar_trgm;
DROP INDEX IF EXISTS public.hadiths_search_en_trgm;
ALTER EXTENSION pg_trgm SET SCHEMA extensions;
CREATE INDEX hadiths_search_ar_trgm ON public.hadiths USING gin (search_ar_normalized extensions.gin_trgm_ops);
CREATE INDEX hadiths_search_en_trgm ON public.hadiths USING gin (search_en_normalized extensions.gin_trgm_ops);