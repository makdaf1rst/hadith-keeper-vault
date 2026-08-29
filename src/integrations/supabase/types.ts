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
      has_role: {
        Args: {
          _role: Database["public"]["Enums"]["app_role"]
          _user_id: string
        }
        Returns: boolean
      }
      normalize_ar_app: { Args: { input: string }; Returns: string }
      normalize_en_app: { Args: { input: string }; Returns: string }
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
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
        DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])
    : never = never,
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
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
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
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
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
  EnumName extends DefaultSchemaEnumNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"]
    : never = never,
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
  CompositeTypeName extends PublicCompositeTypeNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"]
    : never = never,
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
