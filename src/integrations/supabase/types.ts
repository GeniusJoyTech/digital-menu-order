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
    PostgrestVersion: "14.1"
  }
  public: {
    Tables: {
      checkout_step_options: {
        Row: {
          created_at: string | null
          exclude_from_stock: boolean | null
          id: string
          is_linked_menu_item: boolean | null
          linked_menu_item_id: string | null
          name: string
          price: number | null
          sort_order: number | null
          step_id: string
          stock: number | null
          track_stock: boolean | null
          updated_at: string | null
        }
        Insert: {
          created_at?: string | null
          exclude_from_stock?: boolean | null
          id?: string
          is_linked_menu_item?: boolean | null
          linked_menu_item_id?: string | null
          name: string
          price?: number | null
          sort_order?: number | null
          step_id: string
          stock?: number | null
          track_stock?: boolean | null
          updated_at?: string | null
        }
        Update: {
          created_at?: string | null
          exclude_from_stock?: boolean | null
          id?: string
          is_linked_menu_item?: boolean | null
          linked_menu_item_id?: string | null
          name?: string
          price?: number | null
          sort_order?: number | null
          step_id?: string
          stock?: number | null
          track_stock?: boolean | null
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "checkout_step_options_linked_menu_item_id_fkey"
            columns: ["linked_menu_item_id"]
            isOneToOne: false
            referencedRelation: "menu_items"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "checkout_step_options_step_id_fkey"
            columns: ["step_id"]
            isOneToOne: false
            referencedRelation: "checkout_steps"
            referencedColumns: ["id"]
          },
        ]
      }
      checkout_steps: {
        Row: {
          created_at: string | null
          enabled: boolean | null
          id: string
          max_selections: number | null
          max_selections_enabled: boolean | null
          pricing_rule: Json | null
          required: boolean | null
          show_condition: string | null
          sort_order: number | null
          title: string
          trigger_category_ids: string[] | null
          trigger_item_ids: string[] | null
          type: string
          updated_at: string | null
        }
        Insert: {
          created_at?: string | null
          enabled?: boolean | null
          id?: string
          max_selections?: number | null
          max_selections_enabled?: boolean | null
          pricing_rule?: Json | null
          required?: boolean | null
          show_condition?: string | null
          sort_order?: number | null
          title: string
          trigger_category_ids?: string[] | null
          trigger_item_ids?: string[] | null
          type: string
          updated_at?: string | null
        }
        Update: {
          created_at?: string | null
          enabled?: boolean | null
          id?: string
          max_selections?: number | null
          max_selections_enabled?: boolean | null
          pricing_rule?: Json | null
          required?: boolean | null
          show_condition?: string | null
          sort_order?: number | null
          title?: string
          trigger_category_ids?: string[] | null
          trigger_item_ids?: string[] | null
          type?: string
          updated_at?: string | null
        }
        Relationships: []
      }
      design_config: {
        Row: {
          accent_color: string | null
          background_color: string | null
          body_font: string | null
          border_color: string | null
          button_font: string | null
          card_background: string | null
          custom_font_name: string | null
          custom_font_url: string | null
          display_font: string | null
          heading_color: string | null
          id: string
          logo_url: string | null
          muted_color: string | null
          nav_font: string | null
          price_font: string | null
          primary_color: string | null
          social_links: Json | null
          store_description: string | null
          store_name: string | null
          text_color: string | null
          updated_at: string | null
        }
        Insert: {
          accent_color?: string | null
          background_color?: string | null
          body_font?: string | null
          border_color?: string | null
          button_font?: string | null
          card_background?: string | null
          custom_font_name?: string | null
          custom_font_url?: string | null
          display_font?: string | null
          heading_color?: string | null
          id?: string
          logo_url?: string | null
          muted_color?: string | null
          nav_font?: string | null
          price_font?: string | null
          primary_color?: string | null
          social_links?: Json | null
          store_description?: string | null
          store_name?: string | null
          text_color?: string | null
          updated_at?: string | null
        }
        Update: {
          accent_color?: string | null
          background_color?: string | null
          body_font?: string | null
          border_color?: string | null
          button_font?: string | null
          card_background?: string | null
          custom_font_name?: string | null
          custom_font_url?: string | null
          display_font?: string | null
          heading_color?: string | null
          id?: string
          logo_url?: string | null
          muted_color?: string | null
          nav_font?: string | null
          price_font?: string | null
          primary_color?: string | null
          social_links?: Json | null
          store_description?: string | null
          store_name?: string | null
          text_color?: string | null
          updated_at?: string | null
        }
        Relationships: []
      }
      menu_categories: {
        Row: {
          color: string | null
          created_at: string | null
          id: string
          name: string
          sort_order: number | null
          updated_at: string | null
        }
        Insert: {
          color?: string | null
          created_at?: string | null
          id?: string
          name: string
          sort_order?: number | null
          updated_at?: string | null
        }
        Update: {
          color?: string | null
          created_at?: string | null
          id?: string
          name?: string
          sort_order?: number | null
          updated_at?: string | null
        }
        Relationships: []
      }
      menu_items: {
        Row: {
          category_id: string | null
          created_at: string | null
          description: string | null
          id: string
          image_url: string | null
          name: string
          price: number
          prices_json: Json | null
          sort_order: number | null
          stock: number | null
          updated_at: string | null
        }
        Insert: {
          category_id?: string | null
          created_at?: string | null
          description?: string | null
          id?: string
          image_url?: string | null
          name: string
          price?: number
          prices_json?: Json | null
          sort_order?: number | null
          stock?: number | null
          updated_at?: string | null
        }
        Update: {
          category_id?: string | null
          created_at?: string | null
          description?: string | null
          id?: string
          image_url?: string | null
          name?: string
          price?: number
          prices_json?: Json | null
          sort_order?: number | null
          stock?: number | null
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "menu_items_category_id_fkey"
            columns: ["category_id"]
            isOneToOne: false
            referencedRelation: "menu_categories"
            referencedColumns: ["id"]
          },
        ]
      }
      orders: {
        Row: {
          created_at: string | null
          customer_name: string
          customer_phone: string
          delivery_type: string | null
          drink: string | null
          extras: Json | null
          id: string
          items: Json
          observations: string | null
          status: Database["public"]["Enums"]["order_status"] | null
          table_number: string | null
          total: number
          updated_at: string | null
        }
        Insert: {
          created_at?: string | null
          customer_name: string
          customer_phone: string
          delivery_type?: string | null
          drink?: string | null
          extras?: Json | null
          id?: string
          items?: Json
          observations?: string | null
          status?: Database["public"]["Enums"]["order_status"] | null
          table_number?: string | null
          total?: number
          updated_at?: string | null
        }
        Update: {
          created_at?: string | null
          customer_name?: string
          customer_phone?: string
          delivery_type?: string | null
          drink?: string | null
          extras?: Json | null
          id?: string
          items?: Json
          observations?: string | null
          status?: Database["public"]["Enums"]["order_status"] | null
          table_number?: string | null
          total?: number
          updated_at?: string | null
        }
        Relationships: []
      }
      user_roles: {
        Row: {
          created_at: string | null
          id: string
          role: Database["public"]["Enums"]["app_role"]
          user_id: string
        }
        Insert: {
          created_at?: string | null
          id?: string
          role?: Database["public"]["Enums"]["app_role"]
          user_id: string
        }
        Update: {
          created_at?: string | null
          id?: string
          role?: Database["public"]["Enums"]["app_role"]
          user_id?: string
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
    }
    Enums: {
      app_role: "admin" | "user"
      order_status: "pending" | "confirmed" | "cancelled"
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
      order_status: ["pending", "confirmed", "cancelled"],
    },
  },
} as const
