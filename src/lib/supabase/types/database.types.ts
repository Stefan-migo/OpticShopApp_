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
          {
            foreignKeyName: "appointments_provider_id_fkey"
            columns: ["provider_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "appointments_tenant_id_fkey"
            columns: ["tenant_id"]
            isOneToOne: false
            referencedRelation: "tenants"
            referencedColumns: ["id"]
          }
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
          tenant_id: string | null
        }
        Insert: {
          clinic_id?: string | null
          created_at?: string
          default_slot_duration_minutes?: number
          id?: string
          updated_at?: string
          working_hours?: Json | null
          tenant_id?: string | null
        }
        Update: {
          clinic_id?: string | null
          created_at?: string
          default_slot_duration_minutes?: number
          id?: string
          updated_at?: string
          working_hours?: Json | null
          tenant_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "clinic_settings_clinic_id_fkey"
            columns: ["clinic_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "clinic_settings_tenant_id_fkey"
            columns: ["tenant_id"]
            isOneToOne: false
            referencedRelation: "tenants"
            referencedColumns: ["id"]
          }
        ]
      }
      customer_notes: {
        Row: {
          created_at: string
          customer_id: string
          id: string
          note: string
          user_id: string | null
          tenant_id: string | null
        }
        Insert: {
          created_at?: string
          customer_id: string
          id?: string
          note: string
          user_id?: string | null
          tenant_id?: string | null
        }
        Update: {
          created_at?: string
          customer_id?: string
          id?: string
          note?: string
          user_id?: string | null
          tenant_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "customer_notes_customer_id_fkey"
            columns: ["customer_id"]
            isOneToOne: false
            referencedRelation: "customers"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "customer_notes_tenant_id_fkey"
            columns: ["tenant_id"]
            isOneToOne: false
            referencedRelation: "tenants"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "customer_notes_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          }
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
          tenant_id: string | null
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
          tenant_id?: string | null
        }
        Update: {
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
          tenant_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "appointments_customer_id_fkey"
            columns: ["customer_id"]
            isOneToOne: false
            referencedRelation: "appointments"
            referencedColumns: ["customer_id"]
          },
          {
            foreignKeyName: "customers_tenant_id_fkey"
            columns: ["tenant_id"]
            isOneToOne: false
            referencedRelation: "tenants"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "customer_notes_customer_id_fkey"
            columns: ["customer_id"]
            isOneToOne: false
            referencedRelation: "customer_notes"
            referencedColumns: ["customer_id"]
          },
          {
            foreignKeyName: "medical_records_customer_id_fkey"
            columns: ["customer_id"]
            isOneToOne: false
            referencedRelation: "medical_records"
            referencedColumns: ["customer_id"]
          },
          {
            foreignKeyName: "prescriptions_customer_id_fkey"
            columns: ["customer_id"]
            isOneToOne: false
            referencedRelation: "prescriptions"
            referencedColumns: ["customer_id"]
          },
          {
            foreignKeyName: "sales_orders_customer_id_fkey"
            columns: ["customer_id"]
            isOneToOne: false
            referencedRelation: "sales_orders"
            referencedColumns: ["customer_id"]
          }
        ]
      }
      inventory_items: {
        Row: {
          cost_price: number | null
          created_at: string | null
          id: string
          location: string | null
          product_id: string
          purchase_date: string | null
          quantity: number
          serial_number: string | null
          status: Database["public"]["Enums"]["inventory_status"] | null
          updated_at: string | null
          tenant_id: string | null
        }
        Insert: {
          cost_price?: number | null
          created_at?: string | null
          id?: string
          location?: string | null
          product_id: string
          purchase_date?: string | null
          quantity?: number
          serial_number?: string | null
          status?: Database["public"]["Enums"]["inventory_status"] | null
          updated_at?: string | null
          tenant_id?: string | null
        }
        Update: {
          cost_price?: number | null
          created_at?: string | null
          id?: string
          location?: string | null
          product_id?: string
          purchase_date?: string | null
          quantity?: number
          serial_number?: string | null
          status?: Database["public"]["Enums"]["inventory_status"] | null
          updated_at?: string | null
          tenant_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "inventory_items_product_id_fkey"
            columns: ["product_id"]
            isOneToOne: false
            referencedRelation: "products"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "inventory_items_tenant_id_fkey"
            columns: ["tenant_id"]
            isOneToOne: false
            referencedRelation: "tenants"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "sales_order_items_inventory_item_id_fkey"
            columns: ["inventory_item_id"]
            isOneToOne: false
            referencedRelation: "sales_order_items"
            referencedColumns: ["inventory_item_id"]
          }
        ]
      }
      medical_records: {
        Row: {
          chief_complaint: string | null
          created_at: string | null
          customer_id: string | null
          diagnosis: string | null
          examination_findings: string | null
          id: string
          medical_history: string | null
          notes: string | null
          professional_id: string | null
          record_date: string | null
          treatment_plan: string | null
          updated_at: string | null
          tenant_id: string | null
        }
        Insert: {
          chief_complaint?: string | null
          created_at?: string | null
          customer_id?: string | null
          diagnosis?: string | null
          examination_findings?: string | null
          id?: string
          medical_history?: string | null
          notes?: string | null
          professional_id?: string | null
          record_date?: string | null
          treatment_plan?: string | null
          updated_at?: string | null
          tenant_id?: string | null
        }
        Update: {
          chief_complaint?: string | null
          created_at?: string | null
          customer_id?: string | null
          diagnosis?: string | null
          examination_findings?: string | null
          id?: string
          medical_history?: string | null
          notes?: string | null
          professional_id?: string | null
          record_date?: string | null
          treatment_plan?: string | null
          updated_at?: string | null
          tenant_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "medical_records_customer_id_fkey"
            columns: ["customer_id"]
            isOneToOne: false
            referencedRelation: "customers"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "medical_records_optometrist_id_fkey"
            columns: ["professional_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "medical_records_tenant_id_fkey"
            columns: ["tenant_id"]
            isOneToOne: false
            referencedRelation: "tenants"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "prescriptions_medical_record_id_fkey"
            columns: ["medical_record_id"]
            isOneToOne: false
            referencedRelation: "prescriptions"
            referencedColumns: ["id"]
          }
        ]
      }
      notifications: {
        Row: {
          id: string
          user_id: string | null
          type: string
          title: string
          message: string
          read: boolean
          created_at: string
          tenant_id: string | null
        }
        Insert: {
          id?: string
          user_id?: string | null
          type: string
          title: string
          message: string
          read?: boolean
          created_at?: string
          tenant_id?: string | null
        }
        Update: {
          id?: string
          user_id?: string | null
          type?: string
          title?: string
          message?: string
          read?: boolean
          created_at?: string
          tenant_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "notifications_tenant_id_fkey"
            columns: ["tenant_id"]
            isOneToOne: false
            referencedRelation: "tenants"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "notifications_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          }
        ]
      }
      payments: {
        Row: {
          amount: number
          created_at: string | null
          id: string
          method: Database["public"]["Enums"]["payment_method"]
          notes: string | null
          order_id: string
          payment_date: string | null
          transaction_ref: string | null
          updated_at: string | null
          tenant_id: string | null
        }
        Insert: {
          amount: number
          created_at?: string | null
          id?: string
          method: Database["public"]["Enums"]["payment_method"]
          notes?: string | null
          order_id: string
          payment_date?: string | null
          transaction_ref?: string | null
          updated_at?: string | null
          tenant_id?: string | null
        }
        Update: {
          amount?: number
          created_at?: string | null
          id?: string
          method?: Database["public"]["Enums"]["payment_method"]
          notes?: string | null
          order_id?: string
          payment_date?: string | null
          transaction_ref?: string | null
          updated_at?: string | null
          tenant_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "payments_order_id_fkey"
            columns: ["order_id"]
            isOneToOne: false
            referencedRelation: "sales_orders"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "payments_tenant_id_fkey"
            columns: ["tenant_id"]
            isOneToOne: false
            referencedRelation: "tenants"
            referencedColumns: ["id"]
          }
        ]
      }
      prescriptions: {
        Row: {
          created_at: string | null
          customer_id: string
          expiry_date: string | null
          id: string
          medical_record_id: string | null
          notes: string | null
          od_params: Json | null
          os_params: Json | null
          prescriber_id: string | null
          prescriber_name: string | null
          prescription_date: string
          type: Database["public"]["Enums"]["prescription_type"]
          updated_at: string | null
          tenant_id: string | null
        }
        Insert: {
          created_at?: string | null
          customer_id: string
          expiry_date?: string | null
          id?: string
          medical_record_id?: string | null
          notes?: string | null
          od_params?: Json | null
          os_params?: Json | null
          prescriber_id?: string | null
          prescriber_name?: string | null
          prescription_date: string
          type: Database["public"]["Enums"]["prescription_type"]
          updated_at?: string | null
          tenant_id?: string | null
        }
        Update: {
          created_at?: string | null
          customer_id?: string
          expiry_date?: string | null
          id?: string
          medical_record_id?: string | null
          notes?: string | null
          od_params?: Json | null
          os_params?: Json | null
          prescriber_id?: string | null
          prescriber_name?: string | null
          prescription_date?: string
          type?: Database["public"]["Enums"]["prescription_type"]
          updated_at?: string | null
          tenant_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "prescriptions_customer_id_fkey"
            columns: ["customer_id"]
            isOneToOne: false
            referencedRelation: "customers"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "prescriptions_medical_record_id_fkey"
            columns: ["medical_record_id"]
            isOneToOne: false
            referencedRelation: "medical_records"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "prescriptions_prescriber_id_fkey"
            columns: ["prescriber_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "prescriptions_tenant_id_fkey"
            columns: ["tenant_id"]
            isOneToOne: false
            referencedRelation: "tenants"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "sales_order_items_prescription_id_fkey"
            columns: ["prescription_id"]
            isOneToOne: false
            referencedRelation: "sales_order_items"
            referencedColumns: ["prescription_id"]
          }
        ]
      }
      product_categories: {
        Row: {
          created_at: string | null
          id: string
          name: string
          parent_category_id: string | null
          updated_at: string | null
          tenant_id: string | null
        }
        Insert: {
          created_at?: string | null
          id?: string
          name: string
          parent_category_id?: string | null
          updated_at?: string | null
          tenant_id?: string | null
        }
        Update: {
          created_at?: string | null
          id?: string
          name?: string
          parent_category_id?: string | null
          updated_at?: string | null
          tenant_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "product_categories_parent_category_id_fkey"
            columns: ["parent_category_id"]
            isOneToOne: false
            referencedRelation: "product_categories"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "product_categories_tenant_id_fkey"
            columns: ["tenant_id"]
            isOneToOne: false
            referencedRelation: "tenants"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "products_category_id_fkey"
            columns: ["category_id"]
            isOneToOne: false
            referencedRelation: "products"
            referencedColumns: ["category_id"]
          }
        ]
      }
      products: {
        Row: {
          attributes: Json | null
          base_price: number
          brand: string | null
          category_id: string | null
          created_at: string | null
          description: string | null
          id: string
          model: string | null
          name: string
          supplier_id: string | null
          updated_at: string | null
          reorder_level: number | null
          tenant_id: string | null
        }
        Insert: {
          attributes?: Json | null
          base_price?: number
          brand?: string | null
          category_id?: string | null
          created_at?: string | null
          description?: string | null
          id?: string
          model?: string | null
          name: string
          supplier_id?: string | null
          updated_at?: string | null
          reorder_level?: number | null
          tenant_id?: string | null
        }
        Update: {
          attributes?: Json | null
          base_price?: number
          brand?: string | null
          category_id?: string | null
          created_at?: string | null
          description?: string | null
          id?: string
          model?: string | null
          name?: string
          supplier_id?: string | null
          updated_at?: string | null
          reorder_level?: number | null
          tenant_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "inventory_items_product_id_fkey"
            columns: ["product_id"]
            isOneToOne: false
            referencedRelation: "inventory_items"
            referencedColumns: ["product_id"]
          },
          {
            foreignKeyName: "products_category_id_fkey"
            columns: ["category_id"]
            isOneToOne: false
            referencedRelation: "product_categories"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "products_supplier_id_fkey"
            columns: ["supplier_id"]
            isOneToOne: false
            referencedRelation: "suppliers"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "products_tenant_id_fkey"
            columns: ["tenant_id"]
            isOneToOne: false
            referencedRelation: "tenants"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "purchase_order_items_product_id_fkey"
            columns: ["product_id"]
            isOneToOne: false
            referencedRelation: "purchase_order_items"
            referencedColumns: ["product_id"]
          },
          {
            foreignKeyName: "sales_order_items_product_id_fkey"
            columns: ["product_id"]
            isOneToOne: false
            referencedRelation: "sales_order_items"
            referencedColumns: ["product_id"]
          }
        ]
      }
      profiles: {
        Row: {
          created_at: string | null
          full_name: string | null
          id: string
          role_id: string | null
          updated_at: string | null
          tenant_id: string | null
          is_superuser: boolean | null
          email: string | null
        }
        Insert: {
          created_at?: string | null
          full_name?: string | null
          id: string
          role_id?: string | null
          updated_at?: string | null
          tenant_id?: string | null
          is_superuser?: boolean | null
          email?: string | null
        }
        Update: {
          created_at?: string | null
          full_name?: string | null
          id?: string
          role_id?: string | null
          updated_at?: string | null
          tenant_id?: string | null
          is_superuser?: boolean | null
          email?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "appointments_provider_id_fkey"
            columns: ["provider_id"]
            isOneToOne: false
            referencedRelation: "appointments"
            referencedColumns: ["provider_id"]
          },
          {
            foreignKeyName: "clinic_settings_clinic_id_fkey"
            columns: ["clinic_id"]
            isOneToOne: false
            referencedRelation: "clinic_settings"
            referencedColumns: ["clinic_id"]
          },
          {
            foreignKeyName: "medical_records_optometrist_id_fkey"
            columns: ["professional_id"]
            isOneToOne: false
            referencedRelation: "medical_records"
            referencedColumns: ["professional_id"]
          },
          {
            foreignKeyName: "prescriptions_prescriber_id_fkey"
            columns: ["prescriber_id"]
            isOneToOne: false
            referencedRelation: "prescriptions"
            referencedColumns: ["prescriber_id"]
          },
          {
            foreignKeyName: "profiles_id_fkey"
            columns: ["id"]
            isOneToOne: true
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "profiles_role_id_fkey"
            columns: ["role_id"]
            isOneToOne: false
            referencedRelation: "roles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "profiles_tenant_id_fkey"
            columns: ["tenant_id"]
            isOneToOne: false
            referencedRelation: "tenants"
            referencedColumns: ["id"]
          }
        ]
      }
      purchase_order_items: {
        Row: {
          id: string
          purchase_order_id: string | null
          product_id: string | null
          quantity_ordered: number
          unit_price: number
          line_total: number
          created_at: string
          updated_at: string
          tenant_id: string | null
        }
        Insert: {
          id?: string
          purchase_order_id?: string | null
          product_id?: string | null
          quantity_ordered?: number
          unit_price?: number
          line_total?: number
          created_at?: string
          updated_at?: string
          tenant_id?: string | null
        }
        Update: {
          id?: string
          purchase_order_id?: string | null
          product_id?: string | null
          quantity_ordered?: number
          unit_price?: number
          line_total?: number
          created_at?: string
          updated_at?: string
          tenant_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "purchase_order_items_product_id_fkey"
            columns: ["product_id"]
            isOneToOne: false
            referencedRelation: "products"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "purchase_order_items_purchase_order_id_fkey"
            columns: ["purchase_order_id"]
            isOneToOne: false
            referencedRelation: "purchase_orders"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "purchase_order_items_tenant_id_fkey"
            columns: ["tenant_id"]
            isOneToOne: false
            referencedRelation: "tenants"
            referencedColumns: ["id"]
          }
        ]
      }
      purchase_orders: {
        Row: {
          id: string
          supplier_id: string | null
          order_date: string
          expected_delivery_date: string | null
          status: string
          total_amount: number | null
          created_at: string
          updated_at: string
          tenant_id: string | null
        }
        Insert: {
          id?: string
          supplier_id?: string | null
          order_date: string
          expected_delivery_date?: string | null
          status?: string
          total_amount?: number | null
          created_at?: string
          updated_at?: string
          tenant_id?: string | null
        }
        Update: {
          id?: string
          supplier_id?: string | null
          order_date?: string
          expected_delivery_date?: string | null
          status?: string
          total_amount?: number | null
          created_at?: string
          updated_at?: string
          tenant_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "purchase_order_items_purchase_order_id_fkey"
            columns: ["purchase_order_id"]
            isOneToOne: false
            referencedRelation: "purchase_order_items"
            referencedColumns: ["purchase_order_id"]
          },
          {
            foreignKeyName: "purchase_orders_supplier_id_fkey"
            columns: ["supplier_id"]
            isOneToOne: false
            referencedRelation: "suppliers"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "purchase_orders_tenant_id_fkey"
            columns: ["tenant_id"]
            isOneToOne: false
            referencedRelation: "tenants"
            referencedColumns: ["id"]
          }
        ]
      }
      roles: {
        Row: {
          id: string
          name: string
          permissions: Json | null
        }
        Insert: {
          id?: string
          name: string
          permissions?: Json | null
        }
        Update: {
          id?: string
          name?: string
          permissions?: Json | null
        }
        Relationships: [
          {
            foreignKeyName: "profiles_role_id_fkey"
            columns: ["role_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["role_id"]
          }
        ]
      }
      sales_order_items: {
        Row: {
          created_at: string | null
          discount_amount: number | null
          id: string
          inventory_item_id: string | null
          line_total: number
          order_id: string
          prescription_id: string | null
          product_id: string
          quantity: number
          unit_price: number
          updated_at: string | null
          tenant_id: string | null
        }
        Insert: {
          created_at?: string | null
          discount_amount?: number | null
          id?: string
          inventory_item_id?: string | null
          line_total?: number
          order_id: string
          prescription_id?: string | null
          product_id: string
          quantity?: number
          unit_price?: number
          updated_at?: string | null
          tenant_id?: string | null
        }
        Update: {
          created_at?: string | null
          discount_amount?: number | null
          id?: string
          inventory_item_id?: string | null
          line_total?: number
          order_id?: string
          prescription_id?: string | null
          product_id?: string
          quantity?: number
          unit_price?: number
          updated_at?: string | null
          tenant_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "sales_order_items_inventory_item_id_fkey"
            columns: ["inventory_item_id"]
            isOneToOne: false
            referencedRelation: "inventory_items"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "sales_order_items_order_id_fkey"
            columns: ["order_id"]
            isOneToOne: false
            referencedRelation: "sales_orders"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "sales_order_items_prescription_id_fkey"
            columns: ["prescription_id"]
            isOneToOne: false
            referencedRelation: "prescriptions"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "sales_order_items_product_id_fkey"
            columns: ["product_id"]
            isOneToOne: false
            referencedRelation: "products"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "sales_order_items_tenant_id_fkey"
            columns: ["tenant_id"]
            isOneToOne: false
            referencedRelation: "tenants"
            referencedColumns: ["id"]
          }
        ]
      }
      sales_orders: {
        Row: {
          created_at: string | null
          customer_id: string | null
          discount_amount: number | null
          final_amount: number
          id: string
          notes: string | null
          order_date: string | null
          order_number: string
          status: Database["public"]["Enums"]["sale_status"] | null
          tax_amount: number | null
          total_amount: number
          updated_at: string | null
          user_id: string | null
          tax_rate_id: string | null
          tenant_id: string | null
        }
        Insert: {
          created_at?: string | null
          customer_id?: string | null
          discount_amount?: number | null
          final_amount?: number
          id?: string
          notes?: string | null
          order_date?: string | null
          order_number?: string
          status?: Database["public"]["Enums"]["sale_status"] | null
          tax_amount?: number | null
          total_amount?: number
          updated_at?: string | null
          user_id?: string | null
          tax_rate_id?: string | null
          tenant_id?: string | null
        }
        Update: {
          created_at?: string | null
          customer_id?: string | null
          discount_amount?: number | null
          final_amount?: number
          id?: string
          notes?: string | null
          order_date?: string | null
          order_number?: string
          status?: Database["public"]["Enums"]["sale_status"] | null
          tax_amount?: number | null
          total_amount?: number
          updated_at?: string | null
          user_id?: string | null
          tax_rate_id?: string | null
          tenant_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "sales_order_items_order_id_fkey"
            columns: ["order_id"]
            isOneToOne: false
            referencedRelation: "sales_order_items"
            referencedColumns: ["order_id"]
          },
          {
            foreignKeyName: "sales_orders_customer_id_fkey"
            columns: ["customer_id"]
            isOneToOne: false
            referencedRelation: "customers"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "sales_orders_tenant_id_fkey"
            columns: ["tenant_id"]
            isOneToOne: false
            referencedRelation: "tenants"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "sales_orders_tax_rate_id_fkey"
            columns: ["tax_rate_id"]
            isOneToOne: false
            referencedRelation: "tax_rates"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "sales_orders_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "payments_order_id_fkey"
            columns: ["order_id"]
            isOneToOne: false
            referencedRelation: "payments"
            referencedColumns: ["order_id"]
          }
        ]
      }
      suppliers: {
        Row: {
          address: Json | null
          contact_person: string | null
          created_at: string | null
          email: string | null
          id: string
          name: string
          phone: string | null
          updated_at: string | null
          tenant_id: string | null
        }
        Insert: {
          address?: Json | null
          contact_person?: string | null
          created_at?: string | null
          email?: string | null
          id?: string
          name: string
          phone?: string | null
          updated_at?: string | null
          tenant_id?: string | null
        }
        Update: {
          address?: Json | null
          contact_person?: string | null
          created_at?: string | null
          email?: string | null
          id?: string
          name?: string
          phone?: string | null
          updated_at?: string | null
          tenant_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "products_supplier_id_fkey"
            columns: ["supplier_id"]
            isOneToOne: false
            referencedRelation: "products"
            referencedColumns: ["supplier_id"]
          },
          {
            foreignKeyName: "purchase_orders_supplier_id_fkey"
            columns: ["supplier_id"]
            isOneToOne: false
            referencedRelation: "purchase_orders"
            referencedColumns: ["supplier_id"]
          },
          {
            foreignKeyName: "suppliers_tenant_id_fkey"
            columns: ["tenant_id"]
            isOneToOne: false
            referencedRelation: "tenants"
            referencedColumns: ["id"]
          }
        ]
      }
      tax_rates: {
        Row: {
          created_at: string
          id: string
          is_default: boolean
          name: string
          rate: number
          updated_at: string
          tenant_id: string | null
        }
        Insert: {
          created_at?: string
          id?: string
          is_default?: boolean
          name: string
          rate: number
          updated_at?: string
          tenant_id?: string | null
        }
        Update: {
          created_at?: string
          id?: string
          is_default?: boolean
          name?: string
          rate?: number
          updated_at?: string
          tenant_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "sales_orders_tax_rate_id_fkey"
            columns: ["tax_rate_id"]
            isOneToOne: false
            referencedRelation: "sales_orders"
            referencedColumns: ["tax_rate_id"]
          },
          {
            foreignKeyName: "tax_rates_tenant_id_fkey"
            columns: ["tenant_id"]
            isOneToOne: false
            referencedRelation: "tenants"
            referencedColumns: ["id"]
          }
        ]
      }
      tenants: {
        Row: {
          id: string
          name: string
          created_at: string | null
          updated_at: string | null
        }
        Insert: {
          id?: string
          name: string
          created_at?: string | null
          updated_at?: string | null
        }
        Update: {
          id?: string
          name?: string
          created_at?: string | null
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "appointments_tenant_id_fkey"
            columns: ["tenant_id"]
            isOneToOne: false
            referencedRelation: "appointments"
            referencedColumns: ["tenant_id"]
          },
          {
            foreignKeyName: "clinic_settings_tenant_id_fkey"
            columns: ["tenant_id"]
            isOneToOne: false
            referencedRelation: "clinic_settings"
            referencedColumns: ["tenant_id"]
          },
          {
            foreignKeyName: "customer_notes_tenant_id_fkey"
            columns: ["tenant_id"]
            isOneToOne: false
            referencedRelation: "customer_notes"
            referencedColumns: ["tenant_id"]
          },
          {
            foreignKeyName: "customers_tenant_id_fkey"
            columns: ["tenant_id"]
            isOneToOne: false
            referencedRelation: "customers"
            referencedColumns: ["tenant_id"]
          },
          {
            foreignKeyName: "inventory_items_tenant_id_fkey"
            columns: ["tenant_id"]
            isOneToOne: false
            referencedRelation: "inventory_items"
            referencedColumns: ["tenant_id"]
          },
          {
            foreignKeyName: "medical_records_tenant_id_fkey"
            columns: ["tenant_id"]
            isOneToOne: false
            referencedRelation: "medical_records"
            referencedColumns: ["tenant_id"]
          },
          {
            foreignKeyName: "notifications_tenant_id_fkey"
            columns: ["tenant_id"]
            isOneToOne: false
            referencedRelation: "notifications"
            referencedColumns: ["tenant_id"]
          },
          {
            foreignKeyName: "profiles_tenant_id_fkey"
            columns: ["tenant_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["tenant_id"]
          },
          {
            foreignKeyName: "products_tenant_id_fkey"
            columns: ["tenant_id"]
            isOneToOne: false
            referencedRelation: "products"
            referencedColumns: ["tenant_id"]
          },
          {
            foreignKeyName: "purchase_order_items_tenant_id_fkey"
            columns: ["tenant_id"]
            isOneToOne: false
            referencedRelation: "purchase_order_items"
            referencedColumns: ["tenant_id"]
          },
          {
            foreignKeyName: "purchase_orders_tenant_id_fkey"
            columns: ["tenant_id"]
            isOneToOne: false
            referencedRelation: "purchase_orders"
            referencedColumns: ["tenant_id"]
          },
          {
            foreignKeyName: "sales_order_items_tenant_id_fkey"
            columns: ["tenant_id"]
            isOneToOne: false
            referencedRelation: "sales_order_items"
            referencedColumns: ["tenant_id"]
          },
          {
            foreignKeyName: "sales_orders_tenant_id_fkey"
            columns: ["tenant_id"]
            isOneToOne: false
            referencedRelation: "sales_orders"
            referencedColumns: ["tenant_id"]
          },
          {
            foreignKeyName: "suppliers_tenant_id_fkey"
            columns: ["tenant_id"]
            isOneToOne: false
            referencedRelation: "suppliers"
            referencedColumns: ["tenant_id"]
          },
          {
            foreignKeyName: "tax_rates_tenant_id_fkey"
            columns: ["tenant_id"]
            isOneToOne: false
            referencedRelation: "tax_rates"
            referencedColumns: ["tenant_id"]
          }
        ]
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      decrement_inventory: {
        Args: { item_id: string; quantity_sold: number }
        Returns: undefined
      }
      get_user_role: {
        Args: Record<PropertyKey, never>
        Returns: string
      }
    }
    Enums: {
      appointment_status:
        | "scheduled"
        | "confirmed"
        | "cancelled"
        | "completed"
        | "no_show"
      appointment_type:
        | "eye_exam"
        | "contact_lens_fitting"
        | "follow_up"
        | "frame_selection"
        | "other"
      inventory_status: "available" | "sold" | "damaged" | "returned"
      payment_method: "cash" | "card" | "transfer" | "other"
      prescription_type: "glasses" | "contact_lens"
      sale_status: "pending" | "completed" | "cancelled" | "returned"
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
}

type PublicSchema = Database[Extract<keyof Database, "public">]

export type Tables<
  PublicTableNameOrOptions extends
    | keyof (PublicSchema["Tables"] & PublicSchema["Views"])
    | { schema: keyof Database },
  TableName extends PublicTableNameOrOptions extends { schema: keyof Database }
    ? keyof (Database[PublicTableNameOrOptions["schema"]]["Tables"] &
        Database[PublicTableNameOrOptions["schema"]]["Views"])
    : never = never,
> = PublicTableNameOrOptions extends { schema: keyof Database }
  ? (Database[PublicTableNameOrOptions["schema"]]["Tables"] &
      Database[PublicTableNameOrOptions["schema"]]["Views"])[TableName] extends {
      Row: infer R
    }
    ? R
    : never
  : PublicTableNameOrOptions extends keyof (PublicSchema["Tables"] &
        PublicSchema["Views"])
    ? (PublicSchema["Tables"] &
        PublicSchema["Views"])[PublicTableNameOrOptions] extends {
        Row: infer R
      }
      ? R
      : never
    : never

export type TablesInsert<
  PublicTableNameOrOptions extends
    | keyof PublicSchema["Tables"]
    | { schema: keyof Database },
  TableName extends PublicTableNameOrOptions extends { schema: keyof Database }
    ? keyof Database[PublicTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = PublicTableNameOrOptions extends { schema: keyof Database }
  ? Database[PublicTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Insert: infer I
    }
    ? I
    : never
  : PublicTableNameOrOptions extends keyof PublicSchema["Tables"]
    ? PublicSchema["Tables"][PublicTableNameOrOptions] extends {
        Insert: infer I
      }
      ? I
      : never
    : never

export type TablesUpdate<
  PublicTableNameOrOptions extends
    | keyof PublicSchema["Tables"]
    | { schema: keyof Database },
  TableName extends PublicTableNameOrOptions extends { schema: keyof Database }
    ? keyof Database[PublicTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = PublicTableNameOrOptions extends { schema: keyof Database }
  ? Database[PublicTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Update: infer U
    }
    ? U
    : never
  : PublicTableNameOrOptions extends keyof PublicSchema["Tables"]
    ? PublicSchema["Tables"][PublicTableNameOrOptions] extends {
        Update: infer U
      }
      ? U
      : never
    : never

export type Enums<
  PublicEnumNameOrOptions extends
    | keyof PublicSchema["Enums"]
    | { schema: keyof Database },
  EnumName extends PublicEnumNameOrOptions extends { schema: keyof Database }
    ? keyof Database[PublicEnumNameOrOptions["schema"]]["Enums"]
    : never = never,
> = PublicEnumNameOrOptions extends { schema: keyof Database }
  ? Database[PublicEnumNameOrOptions["schema"]]["Enums"][EnumName]
  : PublicEnumNameOrOptions extends keyof PublicSchema["Enums"]
    ? PublicSchema["Enums"][PublicEnumNameOrOptions]
    : never

export type CompositeTypes<
  PublicCompositeTypeNameOrOptions extends
    | keyof PublicSchema["CompositeTypes"]
    | { schema: keyof Database },
  CompositeTypeName extends PublicCompositeTypeNameOrOptions extends {
    schema: keyof Database
  }
    ? keyof Database[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"]
    : never = never,
> = PublicCompositeTypeNameOrOptions extends { schema: keyof Database }
  ? Database[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"][CompositeTypeName]
  : PublicCompositeTypeNameOrOptions extends keyof PublicSchema["CompositeTypes"]
    ? PublicSchema["CompositeTypes"][PublicCompositeTypeNameOrOptions]
    : never

export const Constants = {
  public: {
    Enums: {
      appointment_status: [
        "scheduled",
        "confirmed",
        "cancelled",
        "completed",
        "no_show",
      ] as const,
      appointment_type: [
        "eye_exam",
        "contact_lens_fitting",
        "follow_up",
        "frame_selection",
        "other",
      ] as const,
      inventory_status: ["available", "sold", "damaged", "returned"] as const,
      payment_method: ["cash", "card", "transfer", "other"] as const,
      prescription_type: ["glasses", "contact_lens"] as const,
      sale_status: ["pending", "completed", "cancelled", "returned"] as const,
    },
  },
} as const

export type Supplier = Database['public']['Tables']['suppliers']['Row'];
export type Category = Database['public']['Tables']['product_categories']['Row']; // Added Category type
