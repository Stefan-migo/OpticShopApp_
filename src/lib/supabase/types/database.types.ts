export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type Database = {
  public: {
    Tables: {
      appointments: {
        Row: {
          appointment_time: string
          created_at: string | null
          customer_id: string
          duration_minutes: number
          id: string
          notes: string | null
          provider_name: string | null
          status: Database["public"]["Enums"]["appointment_status"]
          type: Database["public"]["Enums"]["appointment_type"]
          updated_at: string | null
        }
        Insert: {
          appointment_time: string
          created_at?: string | null
          customer_id: string
          duration_minutes?: number
          id?: string
          notes?: string | null
          provider_name?: string | null
          status?: Database["public"]["Enums"]["appointment_status"]
          type: Database["public"]["Enums"]["appointment_type"]
          updated_at?: string | null
        }
        Update: {
          appointment_time?: string
          created_at?: string | null
          customer_id?: string
          duration_minutes?: number
          id?: string
          notes?: string | null
          provider_name?: string | null
          status?: Database["public"]["Enums"]["appointment_status"]
          type?: Database["public"]["Enums"]["appointment_type"]
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "appointments_customer_id_fkey"
            columns: ["customer_id"]
            isOneToOne: false
            referencedRelation: "customers"
            referencedColumns: ["id"]
          },
        ]
      }
      clinic_settings: {
        Row: {
          clinic_id: string | null
          created_at: string
          default_slot_duration_minutes: number
          id: string
          updated_at: string
          working_hours: Json | null
        }
        Insert: {
          clinic_id?: string | null
          created_at?: string
          default_slot_duration_minutes?: number
          id?: string
          updated_at?: string
          working_hours?: Json | null
        }
        Update: {
          clinic_id?: string | null
          created_at?: string
          default_slot_duration_minutes?: number
          id?: string
          updated_at?: string
          working_hours?: Json | null
        }
        Relationships: [
          {
            foreignKeyName: "clinic_settings_clinic_id_fkey"
            columns: ["clinic_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      customer_notes: {
        Row: {
          created_at: string
          customer_id: string
          id: string
          note: string
          user_id: string | null
        }
        Insert: {
          created_at?: string
          customer_id: string
          id?: string
          note: string
          user_id?: string | null
        }
        Update: {
          created_at?: string
          customer_id?: string
          id?: string
          note?: string
          user_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "customer_notes_customer_id_fkey"
            columns: ["customer_id"]
            isOneToOne: false
            referencedRelation: "customers"
            referencedColumns: ["id"]
          },
        ]
      }
      customers: {
        Row: {
          address: Json | null
          address_line1: string | null
          address_line2: string | null
          city: string | null
          country: string | null
          created_at: string | null
          date_of_birth: string | null
          dob: string | null
          email: string | null
          first_name: string | null
          id: string
          insurance_policy_number: string | null
          insurance_provider: string | null
          last_name: string | null
          notes: string | null
          phone: string | null
          postal_code: string | null
          state: string | null
          updated_at: string | null
        }
        Insert: {
          address?: Json | null
          address_line1?: string | null
          address_line2?: string | null
          city?: string | null
          country?: string | null
          created_at?: string | null
          date_of_birth?: string | null
          dob?: string | null
          email?: string | null
          first_name?: string | null
          id?: string
          insurance_policy_number?: string | null
          insurance_provider?: string | null
          last_name?: string | null
          notes?: string | null
          phone?: string | null
          postal_code?: string | null
          state?: string | null
          updated_at?: string | null
        }
        Update: {\n          address?: Json | null\n          address_line1?: string | null\n          address_line2?: string | null\n          city?: string | null\n          country?: string | null\n          created_at?: string | null\n          date_of_birth?: string | null\n          dob?: string | null\n          email?: string | null\n          first_name?: string | null\n          id?: string\n          insurance_policy_number?: string | null\n          insurance_provider?: string | null\n          last_name?: string | null\n          notes?: string | null\n          phone?: string | null\n          postal_code?: string | null\n          state?: string | null\n          updated_at?: string | null\n        }\n        Relationships: []\n      }\n      inventory_items: {\n        Row: {\n          cost_price: number | null\n          created_at: string | null\n          id: string\n          location: string | null\n          product_id: string\n          purchase_date: string | null\n          quantity: number\n          serial_number: string | null\n          status: Database[\"public\"][\"Enums\"][\"inventory_status\"] | null\n          updated_at: string | null\n        }\n        Insert: {\n          cost_price?: number | null\n          created_at?: string | null\n          id?: string\n          location?: string | null\n          product_id: string\n          purchase_date?: string | null\n          quantity?: number\n          serial_number?: string | null\n          status?: Database[\"public\"][\"Enums\"][\"inventory_status\"] | null\n          updated_at?: string | null\n        }\n        Update: {\n          cost_price?: number | null\n          created_at?: string | null\n          id?: string\n          location?: string | null\n          product_id?: string\n          purchase_date?: string | null\n          quantity?: number\n          serial_number?: string | null\n          status?: Database[\"public\"][\"Enums\"][\"inventory_status\"] | null\n          updated_at?: string | null\n        }\n        Relationships: [\n          {\n            foreignKeyName: \"inventory_items_product_id_fkey\"\n            columns: [\"product_id\"]\n            isOneToOne: false\n            referencedRelation: \"products\"\n            referencedColumns: [\"id\"]\n          },\n        ]\n      }\n      medical_records: {\n        Row: {\n          chief_complaint: string | null\n          created_at: string | null\n          customer_id: string | null\n          diagnosis: string | null\n          examination_findings: string | null\n          id: string\n          medical_history: string | null\n          notes: string | null\n          professional_id: string | null\n          record_date: string | null\n          treatment_plan: string | null\n          updated_at: string | null\n        }\n        Insert: {\n          chief_complaint?: string | null\n          created_at?: string | null\n          customer_id?: string | null\n          diagnosis?: string | null\n          examination_findings?: string | null\n          id?: string\n          medical_history?: string | null\n          notes?: string | null\n          professional_id?: string | null\n          record_date?: string | null\n          treatment_plan?: string | null\n          updated_at?: string | null\n        }\n        Update: {\n          chief_complaint?: string | null\n          created_at?: string | null\n          customer_id?: string | null\n          diagnosis?: string | null\n          examination_findings?: string | null\n          id?: string\n          medical_history?: string | null\n          notes?: string | null\n          professional_id?: string | null\n          record_date?: string | null\n          treatment_plan?: string | null\n          updated_at?: string | null\n        }\n        Relationships: [\n          {\n            foreignKeyName: \"medical_records_customer_id_fkey\"\n            columns: [\"customer_id\"]\n            isOneToOne: false\n            referencedRelation: \"customers\"\n            referencedColumns: [\"id\"]\n          },\n          {\n            foreignKeyName: \"medical_records_optometrist_id_fkey\"\n            columns: [\"professional_id\"]\n            isOneToOne: false\n            referencedRelation: \"profiles\"\n            referencedColumns: [\"id\"]\n          },\n        ]\n      }\n      payments: {\n        Row: {\n          amount: number\n          created_at: string | null\n          id: string\n          method: Database[\"public\"][\"Enums\"][\"payment_method\"]\n          notes: string | null\n          order_id: string\n          payment_date: string | null\n          transaction_ref: string | null\n          updated_at: string | null\n        }\n        Insert: {\n          amount: number\n          created_at?: string | null\n          id?: string\n          method: Database[\"public\"][\"Enums\"][\"payment_method\"]\n          notes?: string | null\n          order_id: string\n          payment_date?: string | null\n          transaction_ref?: string | null\n          updated_at?: string | null\n        }\n        Update: {\n          amount?: number\n          created_at?: string | null\n          id?: string\n          method?: Database[\"public\"][\"Enums\"][\"payment_method\"]\n          notes?: string | null\n          order_id?: string\n          payment_date?: string | null\n          transaction_ref?: string | null\n          updated_at?: string | null\n        }\n        Relationships: [\n          {\n            foreignKeyName: \"payments_order_id_fkey\"\n            columns: [\"order_id\"]\n            isOneToOne: false\n            referencedRelation: \"sales_orders\"\n            referencedColumns: [\"id\"]\n          },\n        ]\n      }\n      prescriptions: {\n        Row: {\n          created_at: string | null\n          customer_id: string\n          expiry_date: string | null\n          id: string\n          medical_record_id: string | null\n          notes: string | null\n          od_params: Json | null\n          os_params: Json | null\n          prescriber_id: string | null\n          prescriber_name: string | null\n          prescription_date: string\n          type: Database[\"public\"][\"Enums\"][\"prescription_type\"]\n          updated_at: string | null\n        }\n        Insert: {\n          created_at?: string | null\n          customer_id: string\n          expiry_date?: string | null\n          id?: string\n          medical_record_id?: string | null\n          notes?: string | null\n          od_params?: Json | null\n          os_params?: Json | null\n          prescriber_id?: string | null\n          prescriber_name?: string | null\n          prescription_date: string\n          type: Database[\"public\"][\"Enums\"][\"prescription_type\"]\n          updated_at?: string | null\n        }\n        Update: {\n          created_at?: string | null\n          customer_id?: string\n          expiry_date?: string | null\n          id?: string\n          medical_record_id?: string | null\n          notes?: string | null\n          od_params?: Json | null\n          os_params?: Json | null\n          prescriber_id?: string | null\n          prescriber_name?: string | null\n          prescription_date?: string\n          type?: Database[\"public\"][\"Enums\"][\"prescription_type\"]\n          updated_at?: string | null\n        }\n        Relationships: [\n          {\n            foreignKeyName: \"prescriptions_customer_id_fkey\"\n            columns: [\"customer_id\"]\n            isOneToOne: false\n            referencedRelation: \"customers\"\n            referencedColumns: [\"id\"]\n          },\n          {\n            foreignKeyName: \"prescriptions_medical_record_id_fkey\"\n            columns: [\"medical_record_id\"]\n            isOneToOne: false\n            referencedRelation: \"medical_records\"\n            referencedColumns: [\"id\"]\n          },\n          {\n            foreignKeyName: \"prescriptions_prescriber_id_fkey\"\n            columns: [\"prescriber_id\"]\n            isOneToOne: false\n            referencedRelation: \"profiles\"\n            referencedColumns: [\"id\"]\n          },\n        ]\n      }\n      product_categories: {\n        Row: {\n          created_at: string | null\n          id: string\n          name: string\n          parent_category_id: string | null\n          updated_at: string | null\n        }\n        Insert: {\n          created_at?: string | null\n          id?: string\n          name: string\n          parent_category_id?: string | null\n          updated_at?: string | null\n        }\n        Update: {\n          created_at?: string | null\n          id?: string\n          name?: string\n          parent_category_id?: string | null\n          updated_at?: string | null\n        }\n        Relationships: [\n          {\n            foreignKeyName: \"product_categories_parent_category_id_fkey\"\n            columns: [\"parent_category_id\"]\n            isOneToOne: false\n            referencedRelation: \"product_categories\"\n            referencedColumns: [\"id\"]\n          },\n        ]\n      }\n      products: {\n        Row: {\n          attributes: Json | null\n          base_price: number\n          brand: string | null\n          category_id: string | null\n          created_at: string | null\n          description: string | null\n          id: string\n          model: string | null\n          name: string\n          supplier_id: string | null\n          updated_at: string | null\n        }\n        Insert: {\n          attributes?: Json | null\n          base_price?: number\n          brand?: string | null\n          category_id?: string | null\n          created_at?: string | null\n          description?: string | null\n          id?: string\n          model?: string | null\n          name: string\n          supplier_id?: string | null\n          updated_at?: string | null\n        }\n        Update: {\n          attributes?: Json | null\n          base_price?: number\n          brand?: string | null\n          category_id?: string | null\n          created_at?: string | null\n          description?: string | null\n          id?: string\n          model?: string | null\n          name?: string\n          supplier_id?: string | null\n          updated_at?: string | null\n        }\n        Relationships: [\n          {\n            foreignKeyName: \"products_category_id_fkey\"\n            columns: [\"category_id\"]\n            isOneToOne: false\n            referencedRelation: \"product_categories\"\n            referencedColumns: [\"id\"]\n          },\n          {\n            foreignKeyName: \"products_supplier_id_fkey\"\n            columns: [\"supplier_id\"]\n            isOneToOne: false\n            referencedRelation: \"suppliers\"\n            referencedColumns: [\"id\"]\n          },\
        ]\n      }\n      profiles: {\n        Row: {\n          created_at: string | null\n          full_name: string | null\n          id: string\n          role_id: string | null\n          updated_at: string | null\n        }\n        Insert: {\n          created_at?: string | null\n          full_name?: string | null\n          id: string\n          role_id?: string | null\n          updated_at?: string | null\n        }\n        Update: {\n          created_at?: string | null\n          full_name?: string | null\n          id?: string\n          role_id?: string | null\n          updated_at?: string | null\n        }\n        Relationships: [\n          {\n            foreignKeyName: \"profiles_role_id_fkey\"\n            columns: [\"role_id\"]\n            isOneToOne: false\n            referencedRelation: \"roles\"\n            referencedColumns: [\"id\"]\n          },\n        ]\n      }\n      roles: {\n        Row: {\n          id: string\n          name: string\n          permissions: Json | null\n        }\n        Insert: {\n          id?: string\n          name: string\n          permissions?: Json | null\n        }\n        Update: {\n          id?: string\n          name?: string\n          permissions?: Json | null\n        }\n        Relationships: []\n      }\n      sales_order_items: {\n        Row: {\n          created_at: string | null\n          discount_amount: number | null\n          id: string\n          inventory_item_id: string | null\n          line_total: number\n          order_id: string\n          prescription_id: string | null\n          product_id: string\n          quantity: number\n          unit_price: number\n          updated_at: string | null\n        }\n        Insert: {\n          created_at?: string | null\n          discount_amount?: number | null\n          id?: string\n          inventory_item_id?: string | null\n          line_total: number\n          order_id: string\n          prescription_id?: string | null\n          product_id: string\n          quantity?: number\n          unit_price: number\n          updated_at?: string | null\n        }\n        Update: {\n          created_at?: string | null\n          discount_amount?: number | null\n          id?: string\n          inventory_item_id?: string | null\n          line_total?: number\n          order_id?: string\n          prescription_id?: string | null\n          product_id?: string\n          quantity?: number\n          unit_price?: number\n          updated_at?: string | null\n        }\n        Relationships: [\n          {\n            foreignKeyName: \"sales_order_items_inventory_item_id_fkey\"\n            columns: [\"inventory_item_id\"]\n            isOneToOne: false\n            referencedRelation: \"inventory_items\"\n            referencedColumns: [\"id\"]\n          },\n          {\n            foreignKeyName: \"sales_order_items_order_id_fkey\"\n            columns: [\"order_id\"]\n            isOneToOne: false\n            referencedRelation: \"sales_orders\"\n            referencedColumns: [\"id\"]\n          },\n          {\n            foreignKeyName: \"sales_order_items_prescription_id_fkey\"\n            columns: [\"prescription_id\"]\n            isOneToOne: false\n            referencedRelation: \"prescriptions\"\n            referencedColumns: [\"id\"]\n          },\n          {\n            foreignKeyName: \"sales_order_items_product_id_fkey\"\n            columns: [\"product_id\"]\n            isOneToOne: false\n            referencedRelation: \"products\"\n            referencedColumns: [\"id\"]\n          },\
        ]\n      }\n      sales_orders: {\n        Row: {\n          created_at: string | null\n          customer_id: string | null\n          discount_amount: number | null\n          final_amount: number\n          id: string\n          notes: string | null\n          order_date: string | null\n          order_number: string\n          status: Database[\"public\"][\"Enums\"][\"sale_status\"] | null\n          tax_amount: number | null\n          total_amount: number\n          updated_at: string | null\n          user_id: string | null\n        }\n        Insert: {\n          created_at?: string | null\n          customer_id?: string | null\n          discount_amount?: number | null\n          final_amount?: number\n          id?: string\n          notes?: string | null\n          order_date?: string | null\n          order_number?: string\n          status?: Database[\"public\"][\"Enums\"][\"sale_status\"] | null\n          tax_amount?: number | null\n          total_amount?: number\n          updated_at?: string | null\n          user_id?: string | null\n        }\n        Update: {\n          created_at?: string | null\n          customer_id?: string | null\n          discount_amount?: number | null\n          final_amount?: number\n          id?: string\n          notes?: string | null\n          order_date?: string | null\n          order_number?: string\n          status?: Database[\"public\"][\"Enums\"][\"sale_status\"] | null\n          tax_amount?: number | null\n          total_amount?: number\n          updated_at?: string | null\n          user_id?: string | null\n        }\n        Relationships: [\n          {\n            foreignKeyName: \"sales_orders_customer_id_fkey\"\n            columns: [\"customer_id\"]\n            isOneToOne: false\n            referencedRelation: \"customers\"\n            referencedColumns: [\"id\"]\n          },\n        ]\n      }\n      suppliers: {\n        Row: {\n          address: Json | null\n          contact_person: string | null\n          created_at: string | null\n          email: string | null\n          id: string\n          name: string\n          phone: string | null\n          updated_at: string | null\n        }\n        Insert: {\n          address?: Json | null\n          contact_person?: string | null\n          created_at?: string | null\n          email?: string | null\n          id?: string\n          name: string\n          phone?: string | null\n          updated_at?: string | null\n        }\n        Update: {\n          address?: Json | null\n          contact_person?: string | null\n          created_at?: string | null\n          email?: string | null\n          id?: string\n          name?: string\n          phone?: string | null\n          updated_at?: string | null\n        }\n        Relationships: []\n      }\n      tax_rates: {\n        Row: {\n          created_at: string\n          id: string\n          is_default: boolean\n          name: string\n          rate: number\n          updated_at: string\n        }\n        Insert: {\n          created_at?: string\n          id?: string\n          is_default?: boolean\n          name: string\n          rate: number\n          updated_at?: string\n        }\n        Update: {\n          created_at?: string\n          id?: string\n          is_default?: boolean\n          name?: string\n          rate?: number\n          updated_at?: string\n        }\n        Relationships: []\n      }\n    }\n    Views: {\n      [_ in never]: never\n    }\n    Functions: {\n      decrement_inventory: {\n        Args: { item_id: string; quantity_sold: number }\n        Returns: undefined\n      }\n      get_user_role: {\n        Args: Record<PropertyKey, never>\n        Returns: string\n      }\n    }\n    Enums: {\n      appointment_status:\n        | \"scheduled\"\n        | \"confirmed\"\n        | \"cancelled\"\n        | \"completed\"\n        | \"no_show\"\n      appointment_type:\n        | \"eye_exam\"\n        | \"contact_lens_fitting\"\n        | \"follow_up\"\n        | \"frame_selection\"\n        | \"other\"\n      inventory_status: \"available\" | \"sold\" | \"damaged\" | \"returned\"\n      payment_method: \"cash\" | \"card\" | \"transfer\" | \"other\"\n      prescription_type: \"glasses\" | \"contact_lens\"\n      sale_status: \"pending\" | \"completed\" | \"cancelled\" | \"returned\"\n    }\n    CompositeTypes: {\n      [_ in never]: never\n    }\n  }\n}\n\ntype DefaultSchema = Database[Extract<keyof Database, \"public\">]\n\nexport type Tables<\n  DefaultSchemaTableNameOrOptions extends\n    | keyof (DefaultSchema[\"Tables\"] & DefaultSchema[\"Views\"])\n    | { schema: keyof Database },\n  TableName extends DefaultSchemaTableNameOrOptions extends {\n    schema: keyof Database\n  }\n    ? keyof (Database[DefaultSchemaTableNameOrOptions[\"schema\"]][\"Tables\"] &\n        Database[DefaultSchemaTableNameOrOptions[\"schema\"]][\"Views\"])\n    : never = never,\n> = DefaultSchemaTableNameOrOptions extends { schema: keyof Database }\n  ? (Database[DefaultSchemaTableNameOrOptions[\"schema\"]][\"Tables\"] &\n      Database[DefaultSchemaTableNameOrOptions[\"schema\"]][\"Views\"])[TableName] extends {\n      Row: infer R\n    }\n    ? R\n    : never\n  : DefaultSchemaTableNameOrOptions extends keyof (DefaultSchema[\"Tables\"] &\n        DefaultSchema[\"Views\"])\n    ? (DefaultSchema[\"Tables\"] &\n        DefaultSchema[\"Views\"])[DefaultSchemaTableNameOrOptions] extends {\n        Row: infer R\n      }\n      ? R\n      : never\n    : never\n\nexport type TablesInsert<\n  DefaultSchemaTableNameOrOptions extends\n    | keyof DefaultSchema[\"Tables\"]\n    | { schema: keyof Database },\n  TableName extends DefaultSchemaTableNameOrOptions extends {\n    schema: keyof Database\n  }\n    ? keyof Database[DefaultSchemaTableNameOrOptions[\"schema\"]][\"Tables\"]\n    : never = never,\n> = DefaultSchemaTableNameOrOptions extends { schema: keyof Database }\n  ? Database[DefaultSchemaTableNameOrOptions[\"schema\"]][\"Tables\"][TableName] extends {\n      Insert: infer I\n    }\n    ? I\n    : never\n  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema[\"Tables\"]\n    ? DefaultSchema[\"Tables\"][DefaultSchemaTableNameOrOptions] extends {\n        Insert: infer I\n      }\n      ? I\n      : never\n    : never\n\nexport type TablesUpdate<\n  DefaultSchemaTableNameOrOptions extends\n    | keyof DefaultSchema[\"Tables\"]\n    | { schema: keyof Database },\n  TableName extends DefaultSchemaTableNameOrOptions extends {\n    schema: keyof Database\n  }\n    ? keyof Database[DefaultSchemaTableNameOrOptions[\"schema\"]][\"Tables\"]\n    : never = never,\n> = DefaultSchemaTableNameOrOptions extends { schema: keyof Database }\n  ? Database[DefaultSchemaTableNameOrOptions[\"schema\"]][\"Tables\"][TableName] extends {\n      Update: infer U\n    }\n    ? U\n    : never\n  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema[\"Tables\"]\n    ? DefaultSchema[\"Tables\"][DefaultSchemaTableNameOrOptions] extends {\n        Update: infer U\n      }\n      ? U\n      : never\n    : never\n\nexport type Enums<\n  DefaultSchemaEnumNameOrOptions extends\n    | keyof DefaultSchema[\"Enums\"]\n    | { schema: keyof Database },\n  EnumName extends DefaultSchemaEnumNameOrOptions extends {\n    schema: keyof Database\n  }\n    ? keyof Database[DefaultSchemaEnumNameOrOptions[\"schema\"]][\"Enums\"]\n    : never = never,\n> = DefaultSchemaEnumNameOrOptions extends { schema: keyof Database }\n  ? Database[DefaultSchemaEnumNameOrOptions[\"schema\"]][\"Enums\"][EnumName]\n  : DefaultSchemaEnumNameOrOptions extends keyof DefaultSchema[\"Enums\"]\n    ? DefaultSchema[\"Enums\"][DefaultSchemaEnumNameOrOptions]\n    : never\n\nexport type CompositeTypes<\n  PublicCompositeTypeNameOrOptions extends\n    | keyof DefaultSchema[\"CompositeTypes\"]\n    | { schema: keyof Database },\n  CompositeTypeName extends PublicCompositeTypeNameOrOptions extends {\n    schema: keyof Database\n  }\n    ? keyof Database[PublicCompositeTypeNameOrOptions[\"schema\"]][\"CompositeTypes\"]\n    : never = never,\n> = PublicCompositeTypeNameOrOptions extends { schema: keyof Database }\n  ? Database[PublicCompositeTypeNameOrOptions[\"schema\"]][\"CompositeTypes\"][CompositeTypeName]\n  : PublicCompositeTypeNameOrOptions extends keyof DefaultSchema[\"CompositeTypes\"]\n    ? DefaultSchema[\"CompositeTypes\"][PublicCompositeTypeNameOrOptions]\n    : never\n\nexport const Constants = {\n  public: {\n    Enums: {\n      appointment_status: [\n        \"scheduled\",\n        \"confirmed\",\n        \"cancelled\",\n        \"completed\",\n        \"no_show\",\n      ],\n      appointment_type: [\n        \"eye_exam\",\n        \"contact_lens_fitting\",\n        \"follow_up\",\n        \"frame_selection\",\n        \"other\",\n      ],\n      inventory_status: [\"available\", \"sold\", \"damaged\", \"returned\"],\n      payment_method: [\"cash\", \"card\", \"transfer\", \"other\"],\n      prescription_type: [\"glasses\", \"contact_lens\"],\n      sale_status: [\"pending\", \"completed\", \"cancelled\", \"returned\"],\n    },\n  },\n} as const\n"
