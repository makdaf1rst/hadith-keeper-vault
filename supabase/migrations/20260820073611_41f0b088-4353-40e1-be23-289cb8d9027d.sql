CREATE EXTENSION IF NOT EXISTS unaccent WITH SCHEMA public;

UPDATE public.hadiths SET
  search_ar_normalized = btrim(regexp_replace(
    translate(
      regexp_replace(coalesce(arabic_source, ''), '[\u0610-\u061A\u064B-\u065F\u0670\u06D6-\u06ED\u0640\u0621]', '', 'g'),
      U&'\0622\0623\0625\0671\0672\0673\0649\0629\0624\0626',
      U&'\0627\0627\0627\0627\0627\0627\064A\0647\0648\064A'),
    '\s+', ' ', 'g')),
  search_en_normalized = btrim(regexp_replace(
    lower(public.unaccent(regexp_replace(coalesce(english_source, ''), '[\u2018\u2019\u02BB\u02BC''`\u00B4]', '', 'g'))),
    '[^a-z0-9]+', ' ', 'gi'))
WHERE search_ar_normalized IS NULL OR search_en_normalized IS NULL;