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
    PostgrestVersion: "13.0.5"
  }
  graphql_public: {
    Tables: {
      [_ in never]: never
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      graphql: {
        Args: {
          extensions?: Json
          operationName?: string
          query?: string
          variables?: Json
        }
        Returns: Json
      }
    }
    Enums: {
      [_ in never]: never
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
  public: {
    Tables: {
      additional_activities: {
        Row: {
          created_at: string | null
          description: string | null
          id: string
          image_url: string | null
          lesson_id: string
          title: string
          updated_at: string | null
        }
        Insert: {
          created_at?: string | null
          description?: string | null
          id?: string
          image_url?: string | null
          lesson_id: string
          title: string
          updated_at?: string | null
        }
        Update: {
          created_at?: string | null
          description?: string | null
          id?: string
          image_url?: string | null
          lesson_id?: string
          title?: string
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "additional_activities_lesson_id_fkey"
            columns: ["lesson_id"]
            isOneToOne: false
            referencedRelation: "lessons"
            referencedColumns: ["id"]
          },
        ]
      }
      lesson_materials: {
        Row: {
          content: string | null
          created_at: string | null
          description: string | null
          duration: number | null
          id: string
          lesson_id: string
          specification: string | null
          title: string
          updated_at: string | null
        }
        Insert: {
          content?: string | null
          created_at?: string | null
          description?: string | null
          duration?: number | null
          id?: string
          lesson_id: string
          specification?: string | null
          title: string
          updated_at?: string | null
        }
        Update: {
          content?: string | null
          created_at?: string | null
          description?: string | null
          duration?: number | null
          id?: string
          lesson_id?: string
          specification?: string | null
          title?: string
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "lesson_materials_lesson_id_fkey"
            columns: ["lesson_id"]
            isOneToOne: false
            referencedRelation: "lessons"
            referencedColumns: ["id"]
          },
        ]
      }
      lesson_tags: {
        Row: {
          lesson_id: string
          tag_id: string
        }
        Insert: {
          lesson_id: string
          tag_id: string
        }
        Update: {
          lesson_id?: string
          tag_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "lesson_tags_lesson_id_fkey"
            columns: ["lesson_id"]
            isOneToOne: false
            referencedRelation: "lessons"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "lesson_tags_tag_id_fkey"
            columns: ["tag_id"]
            isOneToOne: false
            referencedRelation: "tags"
            referencedColumns: ["id"]
          },
        ]
      }
      lessons: {
        Row: {
          created_at: string | null
          created_by: string | null
          description: string | null
          duration: string | null
          id: string
          lesson_type: string | null
          period: string | null
          publication_date: string | null
          published: boolean
          rvp_connection: string[] | null
          target_group: string | null
          title: string
          updated_at: string | null
          vimeo_video_url: string | null
        }
        Insert: {
          created_at?: string | null
          created_by?: string | null
          description?: string | null
          duration?: string | null
          id?: string
          lesson_type?: string | null
          period?: string | null
          publication_date?: string | null
          published?: boolean
          rvp_connection?: string[] | null
          target_group?: string | null
          title: string
          updated_at?: string | null
          vimeo_video_url?: string | null
        }
        Update: {
          created_at?: string | null
          created_by?: string | null
          description?: string | null
          duration?: string | null
          id?: string
          lesson_type?: string | null
          period?: string | null
          publication_date?: string | null
          published?: boolean
          rvp_connection?: string[] | null
          target_group?: string | null
          title?: string
          updated_at?: string | null
          vimeo_video_url?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "lessons_created_by_fkey"
            columns: ["created_by"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      profiles: {
        Row: {
          category: string | null
          created_at: string | null
          display_name: string | null
          email: string | null
          email_consent: boolean | null
          id: string
          is_admin: boolean
          registration_completed: boolean | null
          school_name: string | null
          terms_accepted: boolean
          updated_at: string | null
          user_type: string
        }
        Insert: {
          category?: string | null
          created_at?: string | null
          display_name?: string | null
          email?: string | null
          email_consent?: boolean | null
          id: string
          is_admin?: boolean
          registration_completed?: boolean | null
          school_name?: string | null
          terms_accepted?: boolean
          updated_at?: string | null
          user_type: string
        }
        Update: {
          category?: string | null
          created_at?: string | null
          display_name?: string | null
          email?: string | null
          email_consent?: boolean | null
          id?: string
          is_admin?: boolean
          registration_completed?: boolean | null
          school_name?: string | null
          terms_accepted?: boolean
          updated_at?: string | null
          user_type?: string
        }
        Relationships: []
      }
      schools: {
        Row: {
          "Č. or.": string | null
          "Č. p.": number | null
          "Část obce": string | null
          "Email 1": string | null
          IČO: number | null
          "Kód RÚIAN": number | null
          Kraj: string | null
          Místo: string | null
          "Okres/Obvod": string | null
          "ORP Název": string | null
          "Plný název": string | null
          PSČ: number | null
          RED_IZO: number | null
          schoolId: number
          Ulice: string | null
          Území: string | null
          "Zkrácený název": string | null
        }
        Insert: {
          "Č. or."?: string | null
          "Č. p."?: number | null
          "Část obce"?: string | null
          "Email 1"?: string | null
          IČO?: number | null
          "Kód RÚIAN"?: number | null
          Kraj?: string | null
          Místo?: string | null
          "Okres/Obvod"?: string | null
          "ORP Název"?: string | null
          "Plný název"?: string | null
          PSČ?: number | null
          RED_IZO?: number | null
          schoolId?: number
          Ulice?: string | null
          Území?: string | null
          "Zkrácený název"?: string | null
        }
        Update: {
          "Č. or."?: string | null
          "Č. p."?: number | null
          "Část obce"?: string | null
          "Email 1"?: string | null
          IČO?: number | null
          "Kód RÚIAN"?: number | null
          Kraj?: string | null
          Místo?: string | null
          "Okres/Obvod"?: string | null
          "ORP Název"?: string | null
          "Plný název"?: string | null
          PSČ?: number | null
          RED_IZO?: number | null
          schoolId?: number
          Ulice?: string | null
          Území?: string | null
          "Zkrácený název"?: string | null
        }
        Relationships: []
      }
      tags: {
        Row: {
          created_at: string | null
          id: string
          title: string
        }
        Insert: {
          created_at?: string | null
          id?: string
          title: string
        }
        Update: {
          created_at?: string | null
          id?: string
          title?: string
        }
        Relationships: []
      }
      user_favorites: {
        Row: {
          created_at: string | null
          lesson_id: string
          user_id: string
        }
        Insert: {
          created_at?: string | null
          lesson_id: string
          user_id: string
        }
        Update: {
          created_at?: string | null
          lesson_id?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "user_favorites_lesson_id_fkey"
            columns: ["lesson_id"]
            isOneToOne: false
            referencedRelation: "lessons"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "user_favorites_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      [_ in never]: never
    }
    Enums: {
      [_ in never]: never
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
  graphql_public: {
    Enums: {},
  },
  public: {
    Enums: {},
  },
} as const
