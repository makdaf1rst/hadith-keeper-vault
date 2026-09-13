export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type Database = {
  // Allows to automatically instantiate createClient with right options
  // instead of createClient<Database, { PostgrestVersion: 'XX' }>(URL, KEY)
  __InternalSupabase: {
    PostgrestVersion: "14.5"
  }
  public: {
    Tables: {
      _batch14788_payload_stage: {
        Row: {
          chunk_order: number
          payload: string
        }
        Insert: {
          chunk_order: number
          payload: string
        }
        Update: {
          chunk_order?: number
          payload?: string
        }
        Relationships: []
      }
      _batch42_stage: {
        Row: {
          chunk_order: number
          data: string
        }
        Insert: {
          chunk_order: number
          data: string
        }
        Update: {
          chunk_order?: number
          data?: string
        }
        Relationships: []
      }
      _batch46_payload_stage: {
        Row: {
          chunk: string
          chunk_order: number
        }
        Insert: {
          chunk: string
          chunk_order: number
        }
        Update: {
          chunk?: string
          chunk_order?: number
        }
        Relationships: []
      }
      _batch46_payload_stage2: {
        Row: {
          chunk: string
          chunk_order: number
        }
        Insert: {
          chunk: string
          chunk_order: number
        }
        Update: {
          chunk?: string
          chunk_order?: number
        }
        Relationships: []
      }
      _final_qc_expected_hashes: {
        Row: {
          ar_hash: string
          ar_len: number
          en_hash: string
          en_len: number
          hadith_number: number
        }
        Insert: {
          ar_hash: string
          ar_len: number
          en_hash: string
          en_len: number
          hadith_number: number
        }
        Update: {
          ar_hash?: string
          ar_len?: number
          en_hash?: string
          en_len?: number
          hadith_number?: number
        }
        Relationships: []
      }
      _import_payload_chunks: {
        Row: {
          payload: string | null
          seq: number
        }
        Insert: {
          payload?: string | null
          seq: number
        }
        Update: {
          payload?: string | null
          seq?: number
        }
        Relationships: []
      }
      _vol5_b376_patch: {
        Row: {
          ar_b: string
          en_b: string
          id: number
        }
        Insert: {
          ar_b?: string
          en_b?: string
          id: number
        }
        Update: {
          ar_b?: string
          en_b?: string
          id?: number
        }
        Relationships: []
      }
      _vol5_bab6_sync_stage: {
        Row: {
          ar: string
          en: string
          id: number
        }
        Insert: {
          ar?: string
          en?: string
          id: number
        }
        Update: {
          ar?: string
          en?: string
          id?: number
        }
        Relationships: []
      }
      _vol5_fresh_struct_hashes: {
        Row: {
          expected_h: string | null
          k: string
        }
        Insert: {
          expected_h?: string | null
          k: string
        }
        Update: {
          expected_h?: string | null
          k?: string
        }
        Relationships: []
      }
      _vol5_payload_stage: {
        Row: {
          chunk: string
          kind: string
          seq: number
        }
        Insert: {
          chunk: string
          kind: string
          seq: number
        }
        Update: {
          chunk?: string
          kind?: string
          seq?: number
        }
        Relationships: []
      }
      _vol5_qc_struct_expected: {
        Row: {
          expected_h: string
          k: string
        }
        Insert: {
          expected_h: string
          k: string
        }
        Update: {
          expected_h?: string
          k?: string
        }
        Relationships: []
      }
      _vol5_struct_expected: {
        Row: {
          h: string | null
          k: string
        }
        Insert: {
          h?: string | null
          k: string
        }
        Update: {
          h?: string | null
          k?: string
        }
        Relationships: []
      }
      _vol5_text_stage: {
        Row: {
          chunk: string
          kind: string
          seq: number
        }
        Insert: {
          chunk: string
          kind: string
          seq: number
        }
        Update: {
          chunk?: string
          kind?: string
          seq?: number
        }
        Relationships: []
      }
      _vol5_whole_qc_expected: {
        Row: {
          expected_h: string | null
          hadith_number: number
        }
        Insert: {
          expected_h?: string | null
          hadith_number: number
        }
        Update: {
          expected_h?: string | null
          hadith_number?: number
        }
        Relationships: []
      }
      _vol6_transfer_stage: {
        Row: {
          batch: string
          piece: string
          seq: number
        }
        Insert: {
          batch: string
          piece: string
          seq: number
        }
        Update: {
          batch?: string
          piece?: string
          seq?: number
        }
        Relationships: []
      }
      _wholepass1_struct_expected: {
        Row: {
          chapter_number: number | null
          expected_hash: string
          kind: string
          surah_no: number
        }
        Insert: {
          chapter_number?: number | null
          expected_hash: string
          kind: string
          surah_no: number
        }
        Update: {
          chapter_number?: number | null
          expected_hash?: string
          kind?: string
          surah_no?: number
        }
        Relationships: []
      }
      backup_9489_9513_pre_restore_20260902: {
        Row: {
          arabic_display: string | null
          arabic_source: string | null
          book_id: string | null
          chapter_id: string | null
          collection_id: string | null
          created_at: string | null
          english_display: string | null
          english_source: string | null
          full_display_content: string | null
          full_source_content: string | null
          hadith_number: number | null
          id: string | null
          search_ar_normalized: string | null
          search_en_normalized: string | null
          sort_order: number | null
          source_document_id: string | null
          updated_at: string | null
        }
        Insert: {
          arabic_display?: string | null
          arabic_source?: string | null
          book_id?: string | null
          chapter_id?: string | null
          collection_id?: string | null
          created_at?: string | null
          english_display?: string | null
          english_source?: string | null
          full_display_content?: string | null
          full_source_content?: string | null
          hadith_number?: number | null
          id?: string | null
          search_ar_normalized?: string | null
          search_en_normalized?: string | null
          sort_order?: number | null
          source_document_id?: string | null
          updated_at?: string | null
        }
        Update: {
          arabic_display?: string | null
          arabic_source?: string | null
          book_id?: string | null
          chapter_id?: string | null
          collection_id?: string | null
          created_at?: string | null
          english_display?: string | null
          english_source?: string | null
          full_display_content?: string | null
          full_source_content?: string | null
          hadith_number?: number | null
          id?: string | null
          search_ar_normalized?: string | null
          search_en_normalized?: string | null
          sort_order?: number | null
          source_document_id?: string | null
          updated_at?: string | null
        }
        Relationships: []
      }
      backup_9539_9563_pre_repair_20260902: {
        Row: {
          arabic_display: string | null
          arabic_source: string | null
          book_id: string | null
          chapter_id: string | null
          collection_id: string | null
          created_at: string | null
          english_display: string | null
          english_source: string | null
          full_display_content: string | null
          full_source_content: string | null
          hadith_number: number | null
          id: string | null
          search_ar_normalized: string | null
          search_en_normalized: string | null
          sort_order: number | null
          source_document_id: string | null
          updated_at: string | null
        }
        Insert: {
          arabic_display?: string | null
          arabic_source?: string | null
          book_id?: string | null
          chapter_id?: string | null
          collection_id?: string | null
          created_at?: string | null
          english_display?: string | null
          english_source?: string | null
          full_display_content?: string | null
          full_source_content?: string | null
          hadith_number?: number | null
          id?: string | null
          search_ar_normalized?: string | null
          search_en_normalized?: string | null
          sort_order?: number | null
          source_document_id?: string | null
          updated_at?: string | null
        }
        Update: {
          arabic_display?: string | null
          arabic_source?: string | null
          book_id?: string | null
          chapter_id?: string | null
          collection_id?: string | null
          created_at?: string | null
          english_display?: string | null
          english_source?: string | null
          full_display_content?: string | null
          full_source_content?: string | null
          hadith_number?: number | null
          id?: string | null
          search_ar_normalized?: string | null
          search_en_normalized?: string | null
          sort_order?: number | null
          source_document_id?: string | null
          updated_at?: string | null
        }
        Relationships: []
      }
      backup_9707_arabic_cleanup_20260902: {
        Row: {
          arabic_display: string | null
          arabic_source: string | null
          book_id: string | null
          chapter_id: string | null
          collection_id: string | null
          created_at: string | null
          english_display: string | null
          english_source: string | null
          full_display_content: string | null
          full_source_content: string | null
          hadith_number: number | null
          id: string | null
          search_ar_normalized: string | null
          search_en_normalized: string | null
          sort_order: number | null
          source_document_id: string | null
          updated_at: string | null
        }
        Insert: {
          arabic_display?: string | null
          arabic_source?: string | null
          book_id?: string | null
          chapter_id?: string | null
          collection_id?: string | null
          created_at?: string | null
          english_display?: string | null
          english_source?: string | null
          full_display_content?: string | null
          full_source_content?: string | null
          hadith_number?: number | null
          id?: string | null
          search_ar_normalized?: string | null
          search_en_normalized?: string | null
          sort_order?: number | null
          source_document_id?: string | null
          updated_at?: string | null
        }
        Update: {
          arabic_display?: string | null
          arabic_source?: string | null
          book_id?: string | null
          chapter_id?: string | null
          collection_id?: string | null
          created_at?: string | null
          english_display?: string | null
          english_source?: string | null
          full_display_content?: string | null
          full_source_content?: string | null
          hadith_number?: number | null
          id?: string | null
          search_ar_normalized?: string | null
          search_en_normalized?: string | null
          sort_order?: number | null
          source_document_id?: string | null
          updated_at?: string | null
        }
        Relationships: []
      }
      backup_9707_arabic_cleanup_20260902_v2: {
        Row: {
          arabic_display: string | null
          arabic_source: string | null
          book_id: string | null
          chapter_id: string | null
          collection_id: string | null
          created_at: string | null
          english_display: string | null
          english_source: string | null
          full_display_content: string | null
          full_source_content: string | null
          hadith_number: number | null
          id: string | null
          search_ar_normalized: string | null
          search_en_normalized: string | null
          sort_order: number | null
          source_document_id: string | null
          updated_at: string | null
        }
        Insert: {
          arabic_display?: string | null
          arabic_source?: string | null
          book_id?: string | null
          chapter_id?: string | null
          collection_id?: string | null
          created_at?: string | null
          english_display?: string | null
          english_source?: string | null
          full_display_content?: string | null
          full_source_content?: string | null
          hadith_number?: number | null
          id?: string | null
          search_ar_normalized?: string | null
          search_en_normalized?: string | null
          sort_order?: number | null
          source_document_id?: string | null
          updated_at?: string | null
        }
        Update: {
          arabic_display?: string | null
          arabic_source?: string | null
          book_id?: string | null
          chapter_id?: string | null
          collection_id?: string | null
          created_at?: string | null
          english_display?: string | null
          english_source?: string | null
          full_display_content?: string | null
          full_source_content?: string | null
          hadith_number?: number | null
          id?: string | null
          search_ar_normalized?: string | null
          search_en_normalized?: string | null
          sort_order?: number | null
          source_document_id?: string | null
          updated_at?: string | null
        }
        Relationships: []
      }
      backup_batch_9514_9538_pre_repair_20260902: {
        Row: {
          arabic_display: string | null
          arabic_source: string | null
          book_id: string | null
          chapter_id: string | null
          collection_id: string | null
          created_at: string | null
          english_display: string | null
          english_source: string | null
          full_display_content: string | null
          full_source_content: string | null
          hadith_number: number | null
          id: string | null
          search_ar_normalized: string | null
          search_en_normalized: string | null
          sort_order: number | null
          source_document_id: string | null
          updated_at: string | null
        }
        Insert: {
          arabic_display?: string | null
          arabic_source?: string | null
          book_id?: string | null
          chapter_id?: string | null
          collection_id?: string | null
          created_at?: string | null
          english_display?: string | null
          english_source?: string | null
          full_display_content?: string | null
          full_source_content?: string | null
          hadith_number?: number | null
          id?: string | null
          search_ar_normalized?: string | null
          search_en_normalized?: string | null
          sort_order?: number | null
          source_document_id?: string | null
          updated_at?: string | null
        }
        Update: {
          arabic_display?: string | null
          arabic_source?: string | null
          book_id?: string | null
          chapter_id?: string | null
          collection_id?: string | null
          created_at?: string | null
          english_display?: string | null
          english_source?: string | null
          full_display_content?: string | null
          full_source_content?: string | null
          hadith_number?: number | null
          id?: string | null
          search_ar_normalized?: string | null
          search_en_normalized?: string | null
          sort_order?: number | null
          source_document_id?: string | null
          updated_at?: string | null
        }
        Relationships: []
      }
      backup_hadith_lang_fields_20260902: {
        Row: {
          arabic_display: string | null
          arabic_source: string | null
          english_display: string | null
          english_source: string | null
          hadith_number: number | null
          id: string | null
          updated_at: string | null
        }
        Insert: {
          arabic_display?: string | null
          arabic_source?: string | null
          english_display?: string | null
          english_source?: string | null
          hadith_number?: number | null
          id?: string | null
          updated_at?: string | null
        }
        Update: {
          arabic_display?: string | null
          arabic_source?: string | null
          english_display?: string | null
          english_source?: string | null
          hadith_number?: number | null
          id?: string | null
          updated_at?: string | null
        }
        Relationships: []
      }
      backup_repair_9464_9488_20260902: {
        Row: {
          arabic_display: string | null
          arabic_source: string | null
          book_id: string | null
          chapter_id: string | null
          collection_id: string | null
          created_at: string | null
          english_display: string | null
          english_source: string | null
          full_display_content: string | null
          full_source_content: string | null
          hadith_number: number | null
          id: string | null
          search_ar_normalized: string | null
          search_en_normalized: string | null
          sort_order: number | null
          source_document_id: string | null
          updated_at: string | null
        }
        Insert: {
          arabic_display?: string | null
          arabic_source?: string | null
          book_id?: string | null
          chapter_id?: string | null
          collection_id?: string | null
          created_at?: string | null
          english_display?: string | null
          english_source?: string | null
          full_display_content?: string | null
          full_source_content?: string | null
          hadith_number?: number | null
          id?: string | null
          search_ar_normalized?: string | null
          search_en_normalized?: string | null
          sort_order?: number | null
          source_document_id?: string | null
          updated_at?: string | null
        }
        Update: {
          arabic_display?: string | null
          arabic_source?: string | null
          book_id?: string | null
          chapter_id?: string | null
          collection_id?: string | null
          created_at?: string | null
          english_display?: string | null
          english_source?: string | null
          full_display_content?: string | null
          full_source_content?: string | null
          hadith_number?: number | null
          id?: string | null
          search_ar_normalized?: string | null
          search_en_normalized?: string | null
          sort_order?: number | null
          source_document_id?: string | null
          updated_at?: string | null
        }
        Relationships: []
      }
      backup_vol1_chapters_20260824: {
        Row: {
          book_id: string | null
          chapter_number: number | null
          collection_id: string | null
          created_at: string | null
          id: string | null
          intro_ar_display: string | null
          intro_ar_source: string | null
          intro_en_display: string | null
          intro_en_source: string | null
          sort_order: number | null
          source_document_id: string | null
          title_ar: string | null
          title_ar_is_translated: boolean | null
          title_en: string | null
          title_en_is_translated: boolean | null
          updated_at: string | null
        }
        Insert: {
          book_id?: string | null
          chapter_number?: number | null
          collection_id?: string | null
          created_at?: string | null
          id?: string | null
          intro_ar_display?: string | null
          intro_ar_source?: string | null
          intro_en_display?: string | null
          intro_en_source?: string | null
          sort_order?: number | null
          source_document_id?: string | null
          title_ar?: string | null
          title_ar_is_translated?: boolean | null
          title_en?: string | null
          title_en_is_translated?: boolean | null
          updated_at?: string | null
        }
        Update: {
          book_id?: string | null
          chapter_number?: number | null
          collection_id?: string | null
          created_at?: string | null
          id?: string | null
          intro_ar_display?: string | null
          intro_ar_source?: string | null
          intro_en_display?: string | null
          intro_en_source?: string | null
          sort_order?: number | null
          source_document_id?: string | null
          title_ar?: string | null
          title_ar_is_translated?: boolean | null
          title_en?: string | null
          title_en_is_translated?: boolean | null
          updated_at?: string | null
        }
        Relationships: []
      }
      backup_vol1_collections_20260824: {
        Row: {
          book_id: string | null
          created_at: string | null
          id: string | null
          intro_ar_display: string | null
          intro_ar_source: string | null
          intro_en_display: string | null
          intro_en_source: string | null
          sort_order: number | null
          source_document_id: string | null
          title_ar: string | null
          title_ar_is_translated: boolean | null
          title_en: string | null
          title_en_is_translated: boolean | null
          updated_at: string | null
        }
        Insert: {
          book_id?: string | null
          created_at?: string | null
          id?: string | null
          intro_ar_display?: string | null
          intro_ar_source?: string | null
          intro_en_display?: string | null
          intro_en_source?: string | null
          sort_order?: number | null
          source_document_id?: string | null
          title_ar?: string | null
          title_ar_is_translated?: boolean | null
          title_en?: string | null
          title_en_is_translated?: boolean | null
          updated_at?: string | null
        }
        Update: {
          book_id?: string | null
          created_at?: string | null
          id?: string | null
          intro_ar_display?: string | null
          intro_ar_source?: string | null
          intro_en_display?: string | null
          intro_en_source?: string | null
          sort_order?: number | null
          source_document_id?: string | null
          title_ar?: string | null
          title_ar_is_translated?: boolean | null
          title_en?: string | null
          title_en_is_translated?: boolean | null
          updated_at?: string | null
        }
        Relationships: []
      }
      backup_vol1_hadiths_20260824: {
        Row: {
          arabic_display: string | null
          arabic_source: string | null
          book_id: string | null
          chapter_id: string | null
          collection_id: string | null
          created_at: string | null
          english_display: string | null
          english_source: string | null
          full_display_content: string | null
          full_source_content: string | null
          hadith_number: number | null
          id: string | null
          search_ar_normalized: string | null
          search_en_normalized: string | null
          sort_order: number | null
          source_document_id: string | null
          updated_at: string | null
        }
        Insert: {
          arabic_display?: string | null
          arabic_source?: string | null
          book_id?: string | null
          chapter_id?: string | null
          collection_id?: string | null
          created_at?: string | null
          english_display?: string | null
          english_source?: string | null
          full_display_content?: string | null
          full_source_content?: string | null
          hadith_number?: number | null
          id?: string | null
          search_ar_normalized?: string | null
          search_en_normalized?: string | null
          sort_order?: number | null
          source_document_id?: string | null
          updated_at?: string | null
        }
        Update: {
          arabic_display?: string | null
          arabic_source?: string | null
          book_id?: string | null
          chapter_id?: string | null
          collection_id?: string | null
          created_at?: string | null
          english_display?: string | null
          english_source?: string | null
          full_display_content?: string | null
          full_source_content?: string | null
          hadith_number?: number | null
          id?: string | null
          search_ar_normalized?: string | null
          search_en_normalized?: string | null
          sort_order?: number | null
          source_document_id?: string | null
          updated_at?: string | null
        }
        Relationships: []
      }
      backup_vol2_3907_3956_20260827: {
        Row: {
          arabic_display: string | null
          arabic_source: string | null
          book_id: string | null
          chapter_id: string | null
          collection_id: string | null
          created_at: string | null
          english_display: string | null
          english_source: string | null
          full_display_content: string | null
          full_source_content: string | null
          hadith_number: number | null
          id: string | null
          search_ar_normalized: string | null
          search_en_normalized: string | null
          sort_order: number | null
          source_document_id: string | null
          updated_at: string | null
        }
        Insert: {
          arabic_display?: string | null
          arabic_source?: string | null
          book_id?: string | null
          chapter_id?: string | null
          collection_id?: string | null
          created_at?: string | null
          english_display?: string | null
          english_source?: string | null
          full_display_content?: string | null
          full_source_content?: string | null
          hadith_number?: number | null
          id?: string | null
          search_ar_normalized?: string | null
          search_en_normalized?: string | null
          sort_order?: number | null
          source_document_id?: string | null
          updated_at?: string | null
        }
        Update: {
          arabic_display?: string | null
          arabic_source?: string | null
          book_id?: string | null
          chapter_id?: string | null
          collection_id?: string | null
          created_at?: string | null
          english_display?: string | null
          english_source?: string | null
          full_display_content?: string | null
          full_source_content?: string | null
          hadith_number?: number | null
          id?: string | null
          search_ar_normalized?: string | null
          search_en_normalized?: string | null
          sort_order?: number | null
          source_document_id?: string | null
          updated_at?: string | null
        }
        Relationships: []
      }
      backup_vol4_9414_9438_pre_restore_20260902: {
        Row: {
          arabic_display: string | null
          arabic_source: string | null
          book_id: string | null
          chapter_id: string | null
          collection_id: string | null
          created_at: string | null
          english_display: string | null
          english_source: string | null
          full_display_content: string | null
          full_source_content: string | null
          hadith_number: number | null
          id: string | null
          search_ar_normalized: string | null
          search_en_normalized: string | null
          sort_order: number | null
          source_document_id: string | null
          updated_at: string | null
        }
        Insert: {
          arabic_display?: string | null
          arabic_source?: string | null
          book_id?: string | null
          chapter_id?: string | null
          collection_id?: string | null
          created_at?: string | null
          english_display?: string | null
          english_source?: string | null
          full_display_content?: string | null
          full_source_content?: string | null
          hadith_number?: number | null
          id?: string | null
          search_ar_normalized?: string | null
          search_en_normalized?: string | null
          sort_order?: number | null
          source_document_id?: string | null
          updated_at?: string | null
        }
        Update: {
          arabic_display?: string | null
          arabic_source?: string | null
          book_id?: string | null
          chapter_id?: string | null
          collection_id?: string | null
          created_at?: string | null
          english_display?: string | null
          english_source?: string | null
          full_display_content?: string | null
          full_source_content?: string | null
          hadith_number?: number | null
          id?: string | null
          search_ar_normalized?: string | null
          search_en_normalized?: string | null
          sort_order?: number | null
          source_document_id?: string | null
          updated_at?: string | null
        }
        Relationships: []
      }
      backup_vol4_9564_9588_pre_final_20260902: {
        Row: {
          arabic_display: string | null
          arabic_source: string | null
          book_id: string | null
          chapter_id: string | null
          collection_id: string | null
          created_at: string | null
          english_display: string | null
          english_source: string | null
          full_display_content: string | null
          full_source_content: string | null
          hadith_number: number | null
          id: string | null
          search_ar_normalized: string | null
          search_en_normalized: string | null
          sort_order: number | null
          source_document_id: string | null
          updated_at: string | null
        }
        Insert: {
          arabic_display?: string | null
          arabic_source?: string | null
          book_id?: string | null
          chapter_id?: string | null
          collection_id?: string | null
          created_at?: string | null
          english_display?: string | null
          english_source?: string | null
          full_display_content?: string | null
          full_source_content?: string | null
          hadith_number?: number | null
          id?: string | null
          search_ar_normalized?: string | null
          search_en_normalized?: string | null
          sort_order?: number | null
          source_document_id?: string | null
          updated_at?: string | null
        }
        Update: {
          arabic_display?: string | null
          arabic_source?: string | null
          book_id?: string | null
          chapter_id?: string | null
          collection_id?: string | null
          created_at?: string | null
          english_display?: string | null
          english_source?: string | null
          full_display_content?: string | null
          full_source_content?: string | null
          hadith_number?: number | null
          id?: string | null
          search_ar_normalized?: string | null
          search_en_normalized?: string | null
          sort_order?: number | null
          source_document_id?: string | null
          updated_at?: string | null
        }
        Relationships: []
      }
      backup_vol4_9577_9660_pre_restore_20260902: {
        Row: {
          arabic_display: string | null
          arabic_source: string | null
          english_display: string | null
          english_source: string | null
          full_display_content: string | null
          full_source_content: string | null
          hadith_number: number | null
          id: string | null
          updated_at: string | null
        }
        Insert: {
          arabic_display?: string | null
          arabic_source?: string | null
          english_display?: string | null
          english_source?: string | null
          full_display_content?: string | null
          full_source_content?: string | null
          hadith_number?: number | null
          id?: string | null
          updated_at?: string | null
        }
        Update: {
          arabic_display?: string | null
          arabic_source?: string | null
          english_display?: string | null
          english_source?: string | null
          full_display_content?: string | null
          full_source_content?: string | null
          hadith_number?: number | null
          id?: string | null
          updated_at?: string | null
        }
        Relationships: []
      }
      books: {
        Row: {
          book_number: number
          created_at: string
          id: string
          intro_ar_display: string | null
          intro_ar_source: string | null
          intro_en_display: string | null
          intro_en_source: string | null
          sort_order: number
          source_document_id: string | null
          title_ar: string | null
          title_ar_is_translated: boolean
          title_en: string | null
          title_en_is_translated: boolean
          updated_at: string
        }
        Insert: {
          book_number: number
          created_at?: string
          id?: string
          intro_ar_display?: string | null
          intro_ar_source?: string | null
          intro_en_display?: string | null
          intro_en_source?: string | null
          sort_order?: number
          source_document_id?: string | null
          title_ar?: string | null
          title_ar_is_translated?: boolean
          title_en?: string | null
          title_en_is_translated?: boolean
          updated_at?: string
        }
        Update: {
          book_number?: number
          created_at?: string
          id?: string
          intro_ar_display?: string | null
          intro_ar_source?: string | null
          intro_en_display?: string | null
          intro_en_source?: string | null
          sort_order?: number
          source_document_id?: string | null
          title_ar?: string | null
          title_ar_is_translated?: boolean
          title_en?: string | null
          title_en_is_translated?: boolean
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "books_source_document_id_fkey"
            columns: ["source_document_id"]
            isOneToOne: false
            referencedRelation: "import_documents"
            referencedColumns: ["id"]
          },
        ]
      }
      chapters: {
        Row: {
          book_id: string
          chapter_number: number | null
          collection_id: string | null
          created_at: string
          id: string
          intro_ar_display: string | null
          intro_ar_source: string | null
          intro_en_display: string | null
          intro_en_source: string | null
          sort_order: number
          source_document_id: string | null
          title_ar: string | null
          title_ar_is_translated: boolean
          title_en: string | null
          title_en_is_translated: boolean
          updated_at: string
        }
        Insert: {
          book_id: string
          chapter_number?: number | null
          collection_id?: string | null
          created_at?: string
          id?: string
          intro_ar_display?: string | null
          intro_ar_source?: string | null
          intro_en_display?: string | null
          intro_en_source?: string | null
          sort_order?: number
          source_document_id?: string | null
          title_ar?: string | null
          title_ar_is_translated?: boolean
          title_en?: string | null
          title_en_is_translated?: boolean
          updated_at?: string
        }
        Update: {
          book_id?: string
          chapter_number?: number | null
          collection_id?: string | null
          created_at?: string
          id?: string
          intro_ar_display?: string | null
          intro_ar_source?: string | null
          intro_en_display?: string | null
          intro_en_source?: string | null
          sort_order?: number
          source_document_id?: string | null
          title_ar?: string | null
          title_ar_is_translated?: boolean
          title_en?: string | null
          title_en_is_translated?: boolean
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "chapters_book_id_fkey"
            columns: ["book_id"]
            isOneToOne: false
            referencedRelation: "books"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "chapters_collection_id_fkey"
            columns: ["collection_id"]
            isOneToOne: false
            referencedRelation: "collections"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "chapters_source_document_id_fkey"
            columns: ["source_document_id"]
            isOneToOne: false
            referencedRelation: "import_documents"
            referencedColumns: ["id"]
          },
        ]
      }
      collections: {
        Row: {
          book_id: string
          created_at: string
          id: string
          intro_ar_display: string | null
          intro_ar_source: string | null
          intro_en_display: string | null
          intro_en_source: string | null
          sort_order: number
          source_document_id: string | null
          title_ar: string | null
          title_ar_is_translated: boolean
          title_en: string | null
          title_en_is_translated: boolean
          updated_at: string
        }
        Insert: {
          book_id: string
          created_at?: string
          id?: string
          intro_ar_display?: string | null
          intro_ar_source?: string | null
          intro_en_display?: string | null
          intro_en_source?: string | null
          sort_order?: number
          source_document_id?: string | null
          title_ar?: string | null
          title_ar_is_translated?: boolean
          title_en?: string | null
          title_en_is_translated?: boolean
          updated_at?: string
        }
        Update: {
          book_id?: string
          created_at?: string
          id?: string
          intro_ar_display?: string | null
          intro_ar_source?: string | null
          intro_en_display?: string | null
          intro_en_source?: string | null
          sort_order?: number
          source_document_id?: string | null
          title_ar?: string | null
          title_ar_is_translated?: boolean
          title_en?: string | null
          title_en_is_translated?: boolean
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "collections_book_id_fkey"
            columns: ["book_id"]
            isOneToOne: false
            referencedRelation: "books"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "collections_source_document_id_fkey"
            columns: ["source_document_id"]
            isOneToOne: false
            referencedRelation: "import_documents"
            referencedColumns: ["id"]
          },
        ]
      }
      correction_log: {
        Row: {
          book_title: string | null
          chapter_title: string | null
          collection_title: string | null
          corrected_text: string
          correction_type: string
          created_at: string
          hadith_number: number | null
          id: string
          location: string | null
          original_text: string
          review_status: string
          source_document_id: string | null
          source_filename: string | null
        }
        Insert: {
          book_title?: string | null
          chapter_title?: string | null
          collection_title?: string | null
          corrected_text: string
          correction_type: string
          created_at?: string
          hadith_number?: number | null
          id?: string
          location?: string | null
          original_text: string
          review_status?: string
          source_document_id?: string | null
          source_filename?: string | null
        }
        Update: {
          book_title?: string | null
          chapter_title?: string | null
          collection_title?: string | null
          corrected_text?: string
          correction_type?: string
          created_at?: string
          hadith_number?: number | null
          id?: string
          location?: string | null
          original_text?: string
          review_status?: string
          source_document_id?: string | null
          source_filename?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "correction_log_source_document_id_fkey"
            columns: ["source_document_id"]
            isOneToOne: false
            referencedRelation: "import_documents"
            referencedColumns: ["id"]
          },
        ]
      }
      hadith_stage_1560_1609: {
        Row: {
          arabic_text: string | null
          book_number: number
          chapter_number: number
          english_text: string | null
          full_text: string
          hadith_number: number
          search_ar: string | null
          search_en: string | null
        }
        Insert: {
          arabic_text?: string | null
          book_number: number
          chapter_number: number
          english_text?: string | null
          full_text: string
          hadith_number: number
          search_ar?: string | null
          search_en?: string | null
        }
        Update: {
          arabic_text?: string | null
          book_number?: number
          chapter_number?: number
          english_text?: string | null
          full_text?: string
          hadith_number?: number
          search_ar?: string | null
          search_en?: string | null
        }
        Relationships: []
      }
      hadiths: {
        Row: {
          arabic_display: string | null
          arabic_source: string | null
          book_id: string | null
          chapter_id: string | null
          collection_id: string | null
          created_at: string
          english_display: string | null
          english_source: string | null
          full_display_content: string | null
          full_source_content: string | null
          hadith_number: number
          id: string
          search_ar_normalized: string | null
          search_en_normalized: string | null
          sort_order: number
          source_document_id: string | null
          updated_at: string
        }
        Insert: {
          arabic_display?: string | null
          arabic_source?: string | null
          book_id?: string | null
          chapter_id?: string | null
          collection_id?: string | null
          created_at?: string
          english_display?: string | null
          english_source?: string | null
          full_display_content?: string | null
          full_source_content?: string | null
          hadith_number: number
          id?: string
          search_ar_normalized?: string | null
          search_en_normalized?: string | null
          sort_order?: number
          source_document_id?: string | null
          updated_at?: string
        }
        Update: {
          arabic_display?: string | null
          arabic_source?: string | null
          book_id?: string | null
          chapter_id?: string | null
          collection_id?: string | null
          created_at?: string
          english_display?: string | null
          english_source?: string | null
          full_display_content?: string | null
          full_source_content?: string | null
          hadith_number?: number
          id?: string
          search_ar_normalized?: string | null
          search_en_normalized?: string | null
          sort_order?: number
          source_document_id?: string | null
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "hadiths_book_id_fkey"
            columns: ["book_id"]
            isOneToOne: false
            referencedRelation: "books"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "hadiths_chapter_id_fkey"
            columns: ["chapter_id"]
            isOneToOne: false
            referencedRelation: "chapters"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "hadiths_collection_id_fkey"
            columns: ["collection_id"]
            isOneToOne: false
            referencedRelation: "collections"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "hadiths_source_document_id_fkey"
            columns: ["source_document_id"]
            isOneToOne: false
            referencedRelation: "import_documents"
            referencedColumns: ["id"]
          },
        ]
      }
      import_agent_source_chunks: {
        Row: {
          batch_key: string
          chunk_order: number
          created_at: string
          source_text: string
        }
        Insert: {
          batch_key: string
          chunk_order: number
          created_at?: string
          source_text: string
        }
        Update: {
          batch_key?: string
          chunk_order?: number
          created_at?: string
          source_text?: string
        }
        Relationships: []
      }
      import_documents: {
        Row: {
          book_count: number | null
          chapter_count: number | null
          collection_count: number | null
          document_number: number | null
          expected_hadith_count: number | null
          expected_hadith_end: number | null
          expected_hadith_start: number | null
          filename: string
          id: string
          import_order: number | null
          imported_at: string
          imported_hadith_count: number | null
          unique_hadith_count: number | null
          validation_notes: string | null
          validation_status: string
        }
        Insert: {
          book_count?: number | null
          chapter_count?: number | null
          collection_count?: number | null
          document_number?: number | null
          expected_hadith_count?: number | null
          expected_hadith_end?: number | null
          expected_hadith_start?: number | null
          filename: string
          id?: string
          import_order?: number | null
          imported_at?: string
          imported_hadith_count?: number | null
          unique_hadith_count?: number | null
          validation_notes?: string | null
          validation_status?: string
        }
        Update: {
          book_count?: number | null
          chapter_count?: number | null
          collection_count?: number | null
          document_number?: number | null
          expected_hadith_count?: number | null
          expected_hadith_end?: number | null
          expected_hadith_start?: number | null
          filename?: string
          id?: string
          import_order?: number | null
          imported_at?: string
          imported_hadith_count?: number | null
          unique_hadith_count?: number | null
          validation_notes?: string | null
          validation_status?: string
        }
        Relationships: []
      }
      import_issues: {
        Row: {
          created_at: string
          description: string | null
          hadith_number: number | null
          id: string
          issue_type: string
          review_status: string
          severity: string
          source_document_id: string | null
        }
        Insert: {
          created_at?: string
          description?: string | null
          hadith_number?: number | null
          id?: string
          issue_type: string
          review_status?: string
          severity?: string
          source_document_id?: string | null
        }
        Update: {
          created_at?: string
          description?: string | null
          hadith_number?: number | null
          id?: string
          issue_type?: string
          review_status?: string
          severity?: string
          source_document_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "import_issues_source_document_id_fkey"
            columns: ["source_document_id"]
            isOneToOne: false
            referencedRelation: "import_documents"
            referencedColumns: ["id"]
          },
        ]
      }
      import_staging_paragraphs: {
        Row: {
          created_at: string
          id: number
          paragraph_order: number
          paragraph_style: string | null
          paragraph_text: string
          source_filename: string
        }
        Insert: {
          created_at?: string
          id?: number
          paragraph_order: number
          paragraph_style?: string | null
          paragraph_text: string
          source_filename: string
        }
        Update: {
          created_at?: string
          id?: number
          paragraph_order?: number
          paragraph_style?: string | null
          paragraph_text?: string
          source_filename?: string
        }
        Relationships: []
      }
      qc_b26_stage: {
        Row: {
          b64: string
          n: number
        }
        Insert: {
          b64: string
          n: number
        }
        Update: {
          b64?: string
          n?: number
        }
        Relationships: []
      }
      qc_batch21_stage: {
        Row: {
          data: string
          part_no: number
        }
        Insert: {
          data: string
          part_no: number
        }
        Update: {
          data?: string
          part_no?: number
        }
        Relationships: []
      }
      qc_batch28_stage2: {
        Row: {
          chunk: string
          seq: number
        }
        Insert: {
          chunk: string
          seq: number
        }
        Update: {
          chunk?: string
          seq?: number
        }
        Relationships: []
      }
      qc_hex_restore_vol4: {
        Row: {
          field: string
          hextext: string
          ord: number
        }
        Insert: {
          field: string
          hextext: string
          ord: number
        }
        Update: {
          field?: string
          hextext?: string
          ord?: number
        }
        Relationships: []
      }
      qc_long_stage: {
        Row: {
          chunk: string
          hadith_number: number
          seq: number
        }
        Insert: {
          chunk: string
          hadith_number: number
          seq: number
        }
        Update: {
          chunk?: string
          hadith_number?: number
          seq?: number
        }
        Relationships: []
      }
      qc_payload_stage: {
        Row: {
          b64: string
          id: string
        }
        Insert: {
          b64?: string
          id: string
        }
        Update: {
          b64?: string
          id?: string
        }
        Relationships: []
      }
      qc_raw_chunks_batch28: {
        Row: {
          chunk: string
          hadith_number: number
          lang: string
          seq: number
        }
        Insert: {
          chunk: string
          hadith_number: number
          lang: string
          seq: number
        }
        Update: {
          chunk?: string
          hadith_number?: number
          lang?: string
          seq?: number
        }
        Relationships: []
      }
      qc_repair_payload: {
        Row: {
          chunk: string
          expected_md5: string
          seq: number
        }
        Insert: {
          chunk: string
          expected_md5: string
          seq: number
        }
        Update: {
          chunk?: string
          expected_md5?: string
          seq?: number
        }
        Relationships: []
      }
      qc_stage_b64_28: {
        Row: {
          chunk: string
          field: string
          hadith_number: number
          seq: number
        }
        Insert: {
          chunk: string
          field: string
          hadith_number: number
          seq: number
        }
        Update: {
          chunk?: string
          field?: string
          hadith_number?: number
          seq?: number
        }
        Relationships: []
      }
      qc_stage_hex_28: {
        Row: {
          chunk: string
          field: string
          hadith_number: number
          seq: number
        }
        Insert: {
          chunk: string
          field: string
          hadith_number: number
          seq: number
        }
        Update: {
          chunk?: string
          field?: string
          hadith_number?: number
          seq?: number
        }
        Relationships: []
      }
      qc_text_chunks_batch28: {
        Row: {
          chunk: string
          hadith_number: number
          lang: string
          seq: number
        }
        Insert: {
          chunk: string
          hadith_number: number
          lang: string
          seq: number
        }
        Update: {
          chunk?: string
          hadith_number?: number
          lang?: string
          seq?: number
        }
        Relationships: []
      }
      qc_transfer_stage: {
        Row: {
          batch_key: string
          part_no: number
          payload: string
        }
        Insert: {
          batch_key: string
          part_no: number
          payload: string
        }
        Update: {
          batch_key?: string
          part_no?: number
          payload?: string
        }
        Relationships: []
      }
      restore_9364_9576_backup_20260902: {
        Row: {
          arabic_display: string | null
          arabic_source: string | null
          book_id: string | null
          chapter_id: string | null
          collection_id: string | null
          created_at: string | null
          english_display: string | null
          english_source: string | null
          full_display_content: string | null
          full_source_content: string | null
          hadith_number: number | null
          id: string | null
          search_ar_normalized: string | null
          search_en_normalized: string | null
          sort_order: number | null
          source_document_id: string | null
          updated_at: string | null
        }
        Insert: {
          arabic_display?: string | null
          arabic_source?: string | null
          book_id?: string | null
          chapter_id?: string | null
          collection_id?: string | null
          created_at?: string | null
          english_display?: string | null
          english_source?: string | null
          full_display_content?: string | null
          full_source_content?: string | null
          hadith_number?: number | null
          id?: string | null
          search_ar_normalized?: string | null
          search_en_normalized?: string | null
          sort_order?: number | null
          source_document_id?: string | null
          updated_at?: string | null
        }
        Update: {
          arabic_display?: string | null
          arabic_source?: string | null
          book_id?: string | null
          chapter_id?: string | null
          collection_id?: string | null
          created_at?: string | null
          english_display?: string | null
          english_source?: string | null
          full_display_content?: string | null
          full_source_content?: string | null
          hadith_number?: number | null
          id?: string | null
          search_ar_normalized?: string | null
          search_en_normalized?: string | null
          sort_order?: number | null
          source_document_id?: string | null
          updated_at?: string | null
        }
        Relationships: []
      }
      restore_json_chunks_9364_9576: {
        Row: {
          chunk: string
          ord: number
        }
        Insert: {
          chunk: string
          ord: number
        }
        Update: {
          chunk?: string
          ord?: number
        }
        Relationships: []
      }
      restore_payload_9364_9576: {
        Row: {
          ar: string
          en: string
          fullc: string
          hadith_number: number
        }
        Insert: {
          ar: string
          en: string
          fullc: string
          hadith_number: number
        }
        Update: {
          ar?: string
          en?: string
          fullc?: string
          hadith_number?: number
        }
        Relationships: []
      }
      tmp_b18_recover: {
        Row: {
          ar: string | null
          ch: number | null
          en: string | null
          n: number
          so: number | null
        }
        Insert: {
          ar?: string | null
          ch?: number | null
          en?: string | null
          n: number
          so?: number | null
        }
        Update: {
          ar?: string | null
          ch?: number | null
          en?: string | null
          n?: number
          so?: number | null
        }
        Relationships: []
      }
      tmp_b21_hadith_payload: {
        Row: {
          chunk: string
          seq: number
        }
        Insert: {
          chunk: string
          seq: number
        }
        Update: {
          chunk?: string
          seq?: number
        }
        Relationships: []
      }
      tmp_batch17_double: {
        Row: {
          hadith_number: number
          payload: string
        }
        Insert: {
          hadith_number: number
          payload: string
        }
        Update: {
          hadith_number?: number
          payload?: string
        }
        Relationships: []
      }
      tmp_batch17_fields: {
        Row: {
          ar2: string
          chapter_id: string
          en2: string
          hadith_number: number
          sort_order: number
        }
        Insert: {
          ar2: string
          chapter_id: string
          en2: string
          hadith_number: number
          sort_order: number
        }
        Update: {
          ar2?: string
          chapter_id?: string
          en2?: string
          hadith_number?: number
          sort_order?: number
        }
        Relationships: []
      }
      tmp_batch17_payload: {
        Row: {
          chunk: string
          seq: number
        }
        Insert: {
          chunk: string
          seq: number
        }
        Update: {
          chunk?: string
          seq?: number
        }
        Relationships: []
      }
      tmp_batch41_payload: {
        Row: {
          chunk: string
          chunk_order: number
        }
        Insert: {
          chunk: string
          chunk_order: number
        }
        Update: {
          chunk?: string
          chunk_order?: number
        }
        Relationships: []
      }
      tmp_batch43_payload: {
        Row: {
          chunk: string
          chunk_order: number
        }
        Insert: {
          chunk: string
          chunk_order: number
        }
        Update: {
          chunk?: string
          chunk_order?: number
        }
        Relationships: []
      }
      tmp_block_1924_1973_payload: {
        Row: {
          data: string
          seq: number
        }
        Insert: {
          data: string
          seq: number
        }
        Update: {
          data?: string
          seq?: number
        }
        Relationships: []
      }
      tmp_block_1974_2023_payload: {
        Row: {
          data: string
          seq: number
        }
        Insert: {
          data: string
          seq: number
        }
        Update: {
          data?: string
          seq?: number
        }
        Relationships: []
      }
      tmp_final_kitab60_13794_13826: {
        Row: {
          chapter_id: string
          collection_id: string
          hadith_number: number
          mixed_content: string
          sort_order: number
        }
        Insert: {
          chapter_id: string
          collection_id: string
          hadith_number: number
          mixed_content: string
          sort_order: number
        }
        Update: {
          chapter_id?: string
          collection_id?: string
          hadith_number?: number
          mixed_content?: string
          sort_order?: number
        }
        Relationships: []
      }
      tmp_fix_7214_7229_7233: {
        Row: {
          data: string
          id: number
        }
        Insert: {
          data?: string
          id: number
        }
        Update: {
          data?: string
          id?: number
        }
        Relationships: []
      }
      tmp_hadith_qc_1460_1509: {
        Row: {
          book_number: number
          chapter_number: number
          fullc: string
          hadith_number: number
        }
        Insert: {
          book_number: number
          chapter_number: number
          fullc: string
          hadith_number: number
        }
        Update: {
          book_number?: number
          chapter_number?: number
          fullc?: string
          hadith_number?: number
        }
        Relationships: []
      }
      tmp_import_payload_7197_7233: {
        Row: {
          data: string
          id: number
        }
        Insert: {
          data?: string
          id: number
        }
        Update: {
          data?: string
          id?: number
        }
        Relationships: []
      }
      tmp_master_qc_7587_8186: {
        Row: {
          expected_md5: string
          hadith_number: number
        }
        Insert: {
          expected_md5: string
          hadith_number: number
        }
        Update: {
          expected_md5?: string
          hadith_number?: number
        }
        Relationships: []
      }
      tmp_master_struct_7587_8186: {
        Row: {
          expected_md5: string
          k: string
        }
        Insert: {
          expected_md5: string
          k: string
        }
        Update: {
          expected_md5?: string
          k?: string
        }
        Relationships: []
      }
      tmp_qc_search_7150_7586: {
        Row: {
          ar_raw: string
          en_raw: string
          hadith_number: number
        }
        Insert: {
          ar_raw: string
          en_raw: string
          hadith_number: number
        }
        Update: {
          ar_raw?: string
          en_raw?: string
          hadith_number?: number
        }
        Relationships: []
      }
      tmp_recheck2_had: {
        Row: {
          ar_md5: string | null
          en_md5: string | null
          full_md5: string | null
          hadith_number: number
        }
        Insert: {
          ar_md5?: string | null
          en_md5?: string | null
          full_md5?: string | null
          hadith_number: number
        }
        Update: {
          ar_md5?: string | null
          en_md5?: string | null
          full_md5?: string | null
          hadith_number?: number
        }
        Relationships: []
      }
      user_roles: {
        Row: {
          created_at: string
          id: string
          role: Database["public"]["Enums"]["app_role"]
          user_id: string
        }
        Insert: {
          created_at?: string
          id?: string
          role: Database["public"]["Enums"]["app_role"]
          user_id: string
        }
        Update: {
          created_at?: string
          id?: string
          role?: Database["public"]["Enums"]["app_role"]
          user_id?: string
        }
        Relationships: []
      }
      vol1_corrected_stage_20260824: {
        Row: {
          arabic: string
          book_seq: number
          chapter_seq: number
          collection_seq: number | null
          english: string
          hadith_number: number
        }
        Insert: {
          arabic: string
          book_seq: number
          chapter_seq: number
          collection_seq?: number | null
          english: string
          hadith_number: number
        }
        Update: {
          arabic?: string
          book_seq?: number
          chapter_seq?: number
          collection_seq?: number | null
          english?: string
          hadith_number?: number
        }
        Relationships: []
      }
      vol1_hierarchy_stage_20260824: {
        Row: {
          book_seq: number
          chapter_seq: number
          collection_seq: number
          entity_id: string
          entity_number: number | null
          intro_ar: string | null
          intro_en: string | null
          kind: string
          sort_order: number | null
          title_ar: string | null
          title_en: string | null
        }
        Insert: {
          book_seq: number
          chapter_seq: number
          collection_seq: number
          entity_id: string
          entity_number?: number | null
          intro_ar?: string | null
          intro_en?: string | null
          kind: string
          sort_order?: number | null
          title_ar?: string | null
          title_en?: string | null
        }
        Update: {
          book_seq?: number
          chapter_seq?: number
          collection_seq?: number
          entity_id?: string
          entity_number?: number | null
          intro_ar?: string | null
          intro_en?: string | null
          kind?: string
          sort_order?: number | null
          title_ar?: string | null
          title_en?: string | null
        }
        Relationships: []
      }
      vol1_import_chunks_20260825: {
        Row: {
          data: string
          seq: number
        }
        Insert: {
          data: string
          seq: number
        }
        Update: {
          data?: string
          seq?: number
        }
        Relationships: []
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      _b10_people_load: { Args: { payload: Json }; Returns: number }
      _b10_people_struct: { Args: { payload: Json }; Returns: number }
      _b13_load: { Args: { payload: Json }; Returns: number }
      _b14_load: { Args: { payload: Json }; Returns: number }
      _b15_load: { Args: { payload: Json }; Returns: number }
      _b16_load: { Args: { payload: Json }; Returns: number }
      _b17_load: { Args: { payload: Json }; Returns: number }
      _b18_load: { Args: { payload: Json }; Returns: number }
      _b20_load: { Args: { payload: Json }; Returns: number }
      _b21_load: { Args: { payload: Json }; Returns: number }
      _b22_load: { Args: { payload: Json }; Returns: number }
      _batch12_upsert: { Args: { payload: Json }; Returns: number }
      _batch14_upsert: { Args: { payload: Json }; Returns: number }
      _batch40_generic_upsert: { Args: { payload: Json }; Returns: number }
      _batch40_hadith_upsert: { Args: { payload: Json }; Returns: number }
      _batch8_load: { Args: { payload: Json }; Returns: number }
      _exact_hadith_patch: { Args: { payload: Json }; Returns: number }
      _exact_structure_patch: { Args: { payload: Json }; Returns: number }
      _final_load: { Args: { payload: Json }; Returns: number }
      _import_master_batch_7587_8186: {
        Args: { payload: Json }
        Returns: number
      }
      _import_master_batch_compact: { Args: { payload: Json }; Returns: number }
      _import_master_full_payload: {
        Args: { p_book_number: number; p_filename: string; payload: Json }
        Returns: number
      }
      _import_master_hadith_payload: {
        Args: { p_book_number: number; p_filename: string; payload: Json }
        Returns: number
      }
      _load_master_expected: { Args: { payload: Json }; Returns: number }
      _load_master_struct: { Args: { payload: Json }; Returns: number }
      _master_fix: { Args: { payload: Json }; Returns: number }
      _qc_restore_vol4: {
        Args: { p_payload: Json; p_token: string }
        Returns: number
      }
      _qc_search_load_patch: { Args: { payload: Json }; Returns: number }
      _tmp_import_exact_hadith: { Args: { payload: string }; Returns: number }
      _vol5_batch_hadith_json: { Args: { payload: Json }; Returns: number }
      _vol5_batch_struct_json: { Args: { payload: Json }; Returns: number }
      _vol5_collection_upsert: {
        Args: {
          p_ar_b64: string
          p_en_b64: string
          p_iar_b64: string
          p_ien_b64: string
          p_surah: number
        }
        Returns: string
      }
      _vol5_collection_upsert_text: {
        Args: {
          p_ar: string
          p_en: string
          p_iar: string
          p_ien: string
          p_surah: number
        }
        Returns: string
      }
      _vol5_hadith_upsert: {
        Args: {
          p_ar_b64: string
          p_ch: number
          p_en_b64: string
          p_num: number
          p_sort: number
          p_surah: number
        }
        Returns: string
      }
      _vol5_hadith_upsert_stage: {
        Args: {
          p_ar_kind: string
          p_ch: number
          p_en_kind: string
          p_num: number
          p_sort: number
          p_surah: number
        }
        Returns: string
      }
      _vol5_hadith_upsert_text: {
        Args: {
          p_ar: string
          p_ch: number
          p_en: string
          p_num: number
          p_sort: number
          p_surah: number
        }
        Returns: string
      }
      _vol5_hadith_upsert_text_stage: {
        Args: {
          p_ar_kind: string
          p_ch: number
          p_en_kind: string
          p_num: number
          p_sort: number
          p_surah: number
        }
        Returns: string
      }
      _vol5_struct_upsert: {
        Args: {
          p_ar_b64: string
          p_ch: number
          p_en_b64: string
          p_iar_b64: string
          p_ien_b64: string
          p_sort: number
          p_surah: number
        }
        Returns: string
      }
      _vol5_struct_upsert_stage: {
        Args: {
          p_ar: string
          p_ch: number
          p_en: string
          p_iar_kind: string
          p_ien_kind: string
          p_sort: number
          p_surah: number
        }
        Returns: string
      }
      _vol5_struct_upsert_text: {
        Args: {
          p_ar: string
          p_ch: number
          p_en: string
          p_iar: string
          p_ien: string
          p_sort: number
          p_surah: number
        }
        Returns: string
      }
      _vol5_whole_struct_sync: { Args: { payload: Json }; Returns: number }
      _vol6_batch_hadith: { Args: { payload: Json }; Returns: number }
      _vol6_batch_hadith_json: { Args: { payload: Json }; Returns: number }
      _vol6_batch_hadith_raw: { Args: { payload: Json }; Returns: number }
      _vol6_batch_load: { Args: { payload: Json }; Returns: number }
      _vol6_batch_struct: { Args: { payload: Json }; Returns: number }
      _vol6_batch_struct_json: { Args: { payload: Json }; Returns: number }
      _vol6_batch_struct_raw: { Args: { payload: Json }; Returns: number }
      _vol6_current_load: { Args: { payload: Json }; Returns: number }
      _vol6_hadith_b64: { Args: { payload: Json }; Returns: number }
      _vol6_hadith_batch: { Args: { payload: Json }; Returns: number }
      _vol6_hadith_upsert:
        | { Args: { payload: Json }; Returns: number }
        | { Args: { p_coll_sort: number; payload: Json }; Returns: number }
      _vol6_load_batch: { Args: { payload: Json }; Returns: number }
      _vol6_people_load: { Args: { payload: Json }; Returns: number }
      _vol6_struct_b64: { Args: { payload: Json }; Returns: number }
      _vol6_struct_batch: { Args: { payload: Json }; Returns: number }
      _vol6_struct_upsert:
        | { Args: { payload: Json }; Returns: number }
        | { Args: { p_coll_sort: number; payload: Json }; Returns: number }
      _vol6_upsert_chapter_text: {
        Args: {
          p_ar: string
          p_ch: number
          p_coll_sort: number
          p_en: string
          p_iar: string
          p_ien: string
          p_sort: number
        }
        Returns: undefined
      }
      has_role: {
        Args: {
          _role: Database["public"]["Enums"]["app_role"]
          _user_id: string
        }
        Returns: boolean
      }
      import_hadith_exact_b64: {
        Args: {
          p_ar_b64: string
          p_book: string
          p_ch: number
          p_coll_sort: number
          p_en_b64: string
          p_hn: number
          p_src: string
        }
        Returns: undefined
      }
      import_hadith_exact_text: {
        Args: {
          p_ar: string
          p_book: string
          p_ch: number
          p_coll_sort: number
          p_en: string
          p_hn: number
          p_src: string
        }
        Returns: undefined
      }
      normalize_ar_app: { Args: { input: string }; Returns: string }
      normalize_en_app: { Args: { input: string }; Returns: string }
      qc_finalize_chunked_hadith: {
        Args: { p_ch: string; p_coll: string; p_num: number }
        Returns: undefined
      }
      qc_finalize_raw_chunked_hadith: {
        Args: { p_ch: string; p_coll: string; p_num: number }
        Returns: undefined
      }
      qc_fix_stage_chunk_single: {
        Args: {
          p_expected_sha: string
          p_field: string
          p_num: number
          p_seq: number
        }
        Returns: boolean
      }
      qc_import_long_stage: { Args: { p_num: number }; Returns: undefined }
      qc_raw_ar_from_full: { Args: { input: string }; Returns: string }
      qc_raw_en_from_full: { Args: { input: string }; Returns: string }
      qc_search_ar_from_full: { Args: { input: string }; Returns: string }
      qc_search_en_from_full: { Args: { input: string }; Returns: string }
      qc_update_chapter_intro_b64: {
        Args: { p_ar: string; p_ch: string; p_en: string }
        Returns: undefined
      }
      qc_update_chapter_intro_raw: {
        Args: { p_ar: string; p_ch: string; p_en: string }
        Returns: undefined
      }
      qc_upsert_hadith_b64: {
        Args: { p_ar: string; p_ch: string; p_en: string; p_num: number }
        Returns: undefined
      }
      qc_upsert_hadith_b64_generic: {
        Args: {
          p_ar_b64: string
          p_ch: string
          p_coll: string
          p_en_b64: string
          p_num: number
        }
        Returns: undefined
      }
      qc_upsert_hadith_raw: {
        Args: { p_ar: string; p_ch: string; p_en: string; p_num: number }
        Returns: undefined
      }
      qc_upsert_hadith_raw2: {
        Args: {
          p_ar: string
          p_ch: string
          p_coll: string
          p_en: string
          p_num: number
        }
        Returns: undefined
      }
      replace_hadith_ar_b64: {
        Args: { p_ar_b64: string; p_hn: number }
        Returns: undefined
      }
      replace_hadith_exact_b64: {
        Args: { p_ar_b64: string; p_en_b64: string; p_hn: number }
        Returns: undefined
      }
      replace_hadith_exact_hex: {
        Args: { p_ar_hex: string; p_en_hex: string; p_hn: number }
        Returns: undefined
      }
    }
    Enums: {
      app_role: "admin" | "user"
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
}

type DatabaseWithoutInternals = Omit<Database, "__InternalSupabase">

type DefaultSchema = DatabaseWithoutInternals[Extract<keyof Database, "public">]

export type Tables<
  DefaultSchemaTableNameOrOptions extends
    | keyof (DefaultSchema["Tables"] & DefaultSchema["Views"])
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends (DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
        DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])
    : never) = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
      DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])[TableName] extends {
      Row: infer R
    }
    ? R
    : never
  : DefaultSchemaTableNameOrOptions extends keyof (DefaultSchema["Tables"] &
        DefaultSchema["Views"])
    ? (DefaultSchema["Tables"] &
        DefaultSchema["Views"])[DefaultSchemaTableNameOrOptions] extends {
        Row: infer R
      }
      ? R
      : never
    : never

export type TablesInsert<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends (DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never) = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Insert: infer I
    }
    ? I
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Insert: infer I
      }
      ? I
      : never
    : never

export type TablesUpdate<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends (DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never) = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Update: infer U
    }
    ? U
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Update: infer U
      }
      ? U
      : never
    : never

export type Enums<
  DefaultSchemaEnumNameOrOptions extends
    | keyof DefaultSchema["Enums"]
    | { schema: keyof DatabaseWithoutInternals },
  EnumName extends (DefaultSchemaEnumNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"]
    : never) = never,
> = DefaultSchemaEnumNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"][EnumName]
  : DefaultSchemaEnumNameOrOptions extends keyof DefaultSchema["Enums"]
    ? DefaultSchema["Enums"][DefaultSchemaEnumNameOrOptions]
    : never

export type CompositeTypes<
  PublicCompositeTypeNameOrOptions extends
    | keyof DefaultSchema["CompositeTypes"]
    | { schema: keyof DatabaseWithoutInternals },
  CompositeTypeName extends (PublicCompositeTypeNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"]
    : never) = never,
> = PublicCompositeTypeNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"][CompositeTypeName]
  : PublicCompositeTypeNameOrOptions extends keyof DefaultSchema["CompositeTypes"]
    ? DefaultSchema["CompositeTypes"][PublicCompositeTypeNameOrOptions]
    : never

export const Constants = {
  public: {
    Enums: {
      app_role: ["admin", "user"],
    },
  },
} as const
