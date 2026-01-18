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
      car_expenses: {
        Row: {
          amount: number
          car_id: string | null
          created_at: string
          description: string | null
          expense_date: string
          expense_type: string
          id: string
          receipt_url: string | null
        }
        Insert: {
          amount: number
          car_id?: string | null
          created_at?: string
          description?: string | null
          expense_date: string
          expense_type: string
          id?: string
          receipt_url?: string | null
        }
        Update: {
          amount?: number
          car_id?: string | null
          created_at?: string
          description?: string | null
          expense_date?: string
          expense_type?: string
          id?: string
          receipt_url?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "car_expenses_car_id_fkey"
            columns: ["car_id"]
            isOneToOne: false
            referencedRelation: "cars"
            referencedColumns: ["id"]
          },
        ]
      }
      cars: {
        Row: {
          body_type: string | null
          bond_amount: number | null
          color: string | null
          created_at: string
          id: string
          images: string[] | null
          make: string
          model: string
          notes: string | null
          plate_number: string
          purchase_date: string | null
          purchase_price: number | null
          selling_price: number | null
          status: string
          tracker_device_type: string | null
          tracker_imei: string | null
          updated_at: string
          vin: string | null
          weekly_rent: number | null
          year: number
        }
        Insert: {
          body_type?: string | null
          bond_amount?: number | null
          color?: string | null
          created_at?: string
          id?: string
          images?: string[] | null
          make: string
          model: string
          notes?: string | null
          plate_number: string
          purchase_date?: string | null
          purchase_price?: number | null
          selling_price?: number | null
          status?: string
          tracker_device_type?: string | null
          tracker_imei?: string | null
          updated_at?: string
          vin?: string | null
          weekly_rent?: number | null
          year: number
        }
        Update: {
          body_type?: string | null
          bond_amount?: number | null
          color?: string | null
          created_at?: string
          id?: string
          images?: string[] | null
          make?: string
          model?: string
          notes?: string | null
          plate_number?: string
          purchase_date?: string | null
          purchase_price?: number | null
          selling_price?: number | null
          status?: string
          tracker_device_type?: string | null
          tracker_imei?: string | null
          updated_at?: string
          vin?: string | null
          weekly_rent?: number | null
          year?: number
        }
        Relationships: []
      }
      insurance_records: {
        Row: {
          car_id: string | null
          coverage_type: string | null
          created_at: string
          expiry_date: string
          id: string
          notes: string | null
          policy_number: string
          premium_amount: number | null
          provider: string
          start_date: string
        }
        Insert: {
          car_id?: string | null
          coverage_type?: string | null
          created_at?: string
          expiry_date: string
          id?: string
          notes?: string | null
          policy_number: string
          premium_amount?: number | null
          provider: string
          start_date: string
        }
        Update: {
          car_id?: string | null
          coverage_type?: string | null
          created_at?: string
          expiry_date?: string
          id?: string
          notes?: string | null
          policy_number?: string
          premium_amount?: number | null
          provider?: string
          start_date?: string
        }
        Relationships: [
          {
            foreignKeyName: "insurance_records_car_id_fkey"
            columns: ["car_id"]
            isOneToOne: false
            referencedRelation: "cars"
            referencedColumns: ["id"]
          },
        ]
      }
      maintenance_tickets: {
        Row: {
          actual_cost: number | null
          assigned_to: string | null
          car_id: string | null
          completed_at: string | null
          created_at: string
          description: string | null
          estimated_cost: number | null
          id: string
          priority: string
          status: string
          title: string
          updated_at: string
        }
        Insert: {
          actual_cost?: number | null
          assigned_to?: string | null
          car_id?: string | null
          completed_at?: string | null
          created_at?: string
          description?: string | null
          estimated_cost?: number | null
          id?: string
          priority?: string
          status?: string
          title: string
          updated_at?: string
        }
        Update: {
          actual_cost?: number | null
          assigned_to?: string | null
          car_id?: string | null
          completed_at?: string | null
          created_at?: string
          description?: string | null
          estimated_cost?: number | null
          id?: string
          priority?: string
          status?: string
          title?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "maintenance_tickets_car_id_fkey"
            columns: ["car_id"]
            isOneToOne: false
            referencedRelation: "cars"
            referencedColumns: ["id"]
          },
        ]
      }
      profiles: {
        Row: {
          avatar_url: string | null
          created_at: string
          display_name: string | null
          id: string
          phone: string | null
          updated_at: string
          user_id: string
        }
        Insert: {
          avatar_url?: string | null
          created_at?: string
          display_name?: string | null
          id?: string
          phone?: string | null
          updated_at?: string
          user_id: string
        }
        Update: {
          avatar_url?: string | null
          created_at?: string
          display_name?: string | null
          id?: string
          phone?: string | null
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      rego_records: {
        Row: {
          car_id: string | null
          created_at: string
          expiry_date: string
          id: string
          rego_number: string
          renewal_amount: number | null
          state: string | null
        }
        Insert: {
          car_id?: string | null
          created_at?: string
          expiry_date: string
          id?: string
          rego_number: string
          renewal_amount?: number | null
          state?: string | null
        }
        Update: {
          car_id?: string | null
          created_at?: string
          expiry_date?: string
          id?: string
          rego_number?: string
          renewal_amount?: number | null
          state?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "rego_records_car_id_fkey"
            columns: ["car_id"]
            isOneToOne: false
            referencedRelation: "cars"
            referencedColumns: ["id"]
          },
        ]
      }
      rental_payments: {
        Row: {
          amount: number
          created_at: string
          id: string
          notes: string | null
          payment_date: string
          payment_method: string | null
          reference: string | null
          rental_session_id: string | null
        }
        Insert: {
          amount: number
          created_at?: string
          id?: string
          notes?: string | null
          payment_date: string
          payment_method?: string | null
          reference?: string | null
          rental_session_id?: string | null
        }
        Update: {
          amount?: number
          created_at?: string
          id?: string
          notes?: string | null
          payment_date?: string
          payment_method?: string | null
          reference?: string | null
          rental_session_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "rental_payments_rental_session_id_fkey"
            columns: ["rental_session_id"]
            isOneToOne: false
            referencedRelation: "rental_sessions"
            referencedColumns: ["id"]
          },
        ]
      }
      rental_sessions: {
        Row: {
          bond_amount: number | null
          car_id: string | null
          contract_url: string | null
          created_at: string
          end_date: string | null
          id: string
          notes: string | null
          renter_id: string | null
          signature_url: string | null
          start_date: string
          status: string
          total_amount: number | null
          updated_at: string
          weekly_rent: number
        }
        Insert: {
          bond_amount?: number | null
          car_id?: string | null
          contract_url?: string | null
          created_at?: string
          end_date?: string | null
          id?: string
          notes?: string | null
          renter_id?: string | null
          signature_url?: string | null
          start_date: string
          status?: string
          total_amount?: number | null
          updated_at?: string
          weekly_rent: number
        }
        Update: {
          bond_amount?: number | null
          car_id?: string | null
          contract_url?: string | null
          created_at?: string
          end_date?: string | null
          id?: string
          notes?: string | null
          renter_id?: string | null
          signature_url?: string | null
          start_date?: string
          status?: string
          total_amount?: number | null
          updated_at?: string
          weekly_rent?: number
        }
        Relationships: [
          {
            foreignKeyName: "rental_sessions_car_id_fkey"
            columns: ["car_id"]
            isOneToOne: false
            referencedRelation: "cars"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "rental_sessions_renter_id_fkey"
            columns: ["renter_id"]
            isOneToOne: false
            referencedRelation: "renters"
            referencedColumns: ["id"]
          },
        ]
      }
      renters: {
        Row: {
          address: string | null
          blacklist_reason: string | null
          created_at: string
          email: string | null
          first_name: string
          id: string
          is_blacklisted: boolean
          last_name: string
          license_document_url: string | null
          license_expiry: string | null
          license_number: string | null
          notes: string | null
          phone: string
          updated_at: string
        }
        Insert: {
          address?: string | null
          blacklist_reason?: string | null
          created_at?: string
          email?: string | null
          first_name: string
          id?: string
          is_blacklisted?: boolean
          last_name: string
          license_document_url?: string | null
          license_expiry?: string | null
          license_number?: string | null
          notes?: string | null
          phone: string
          updated_at?: string
        }
        Update: {
          address?: string | null
          blacklist_reason?: string | null
          created_at?: string
          email?: string | null
          first_name?: string
          id?: string
          is_blacklisted?: boolean
          last_name?: string
          license_document_url?: string | null
          license_expiry?: string | null
          license_number?: string | null
          notes?: string | null
          phone?: string
          updated_at?: string
        }
        Relationships: []
      }
      traffic_fines: {
        Row: {
          amount: number
          car_id: string | null
          created_at: string
          description: string
          fine_number: string | null
          id: string
          is_paid: boolean
          location: string | null
          offence_date: string
          paid_by: string | null
          paid_date: string | null
          renter_id: string | null
        }
        Insert: {
          amount: number
          car_id?: string | null
          created_at?: string
          description: string
          fine_number?: string | null
          id?: string
          is_paid?: boolean
          location?: string | null
          offence_date: string
          paid_by?: string | null
          paid_date?: string | null
          renter_id?: string | null
        }
        Update: {
          amount?: number
          car_id?: string | null
          created_at?: string
          description?: string
          fine_number?: string | null
          id?: string
          is_paid?: boolean
          location?: string | null
          offence_date?: string
          paid_by?: string | null
          paid_date?: string | null
          renter_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "traffic_fines_car_id_fkey"
            columns: ["car_id"]
            isOneToOne: false
            referencedRelation: "cars"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "traffic_fines_renter_id_fkey"
            columns: ["renter_id"]
            isOneToOne: false
            referencedRelation: "renters"
            referencedColumns: ["id"]
          },
        ]
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
      app_role: "admin" | "manager" | "user"
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
      app_role: ["admin", "manager", "user"],
    },
  },
} as const
