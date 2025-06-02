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
      body_measurements: {
        Row: {
          arms: number | null
          body_fat: number | null
          chest: number | null
          created_at: string
          date: string
          height: number | null
          id: string
          muscle_mass: number | null
          notes: string | null
          shoulders: number | null
          thighs: number | null
          user_id: string
          waist: number | null
          weight: number | null
        }
        Insert: {
          arms?: number | null
          body_fat?: number | null
          chest?: number | null
          created_at?: string
          date: string
          height?: number | null
          id?: string
          muscle_mass?: number | null
          notes?: string | null
          shoulders?: number | null
          thighs?: number | null
          user_id: string
          waist?: number | null
          weight?: number | null
        }
        Update: {
          arms?: number | null
          body_fat?: number | null
          chest?: number | null
          created_at?: string
          date?: string
          height?: number | null
          id?: string
          muscle_mass?: number | null
          notes?: string | null
          shoulders?: number | null
          thighs?: number | null
          user_id?: string
          waist?: number | null
          weight?: number | null
        }
        Relationships: []
      }
      habit_completions: {
        Row: {
          count: number
          created_at: string
          date: string
          habit_id: string
          id: string
          user_id: string
        }
        Insert: {
          count?: number
          created_at?: string
          date: string
          habit_id: string
          id?: string
          user_id: string
        }
        Update: {
          count?: number
          created_at?: string
          date?: string
          habit_id?: string
          id?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "habit_completions_habit_id_fkey"
            columns: ["habit_id"]
            isOneToOne: false
            referencedRelation: "habits"
            referencedColumns: ["id"]
          },
        ]
      }
      habits: {
        Row: {
          created_at: string
          description: string | null
          icon: string
          id: string
          name: string
          target: number
          user_id: string
        }
        Insert: {
          created_at?: string
          description?: string | null
          icon: string
          id?: string
          name: string
          target?: number
          user_id: string
        }
        Update: {
          created_at?: string
          description?: string | null
          icon?: string
          id?: string
          name?: string
          target?: number
          user_id?: string
        }
        Relationships: []
      }
      measurements: {
        Row: {
          armumfang: number | null
          chest: number | null
          created_at: string
          date: string
          forearm: number | null
          hips: number | null
          id: string
          neck: number | null
          shoulders: number | null
          thigh: number | null
          user_id: string
          waist: number | null
        }
        Insert: {
          armumfang?: number | null
          chest?: number | null
          created_at?: string
          date: string
          forearm?: number | null
          hips?: number | null
          id?: string
          neck?: number | null
          shoulders?: number | null
          thigh?: number | null
          user_id: string
          waist?: number | null
        }
        Update: {
          armumfang?: number | null
          chest?: number | null
          created_at?: string
          date?: string
          forearm?: number | null
          hips?: number | null
          id?: string
          neck?: number | null
          shoulders?: number | null
          thigh?: number | null
          user_id?: string
          waist?: number | null
        }
        Relationships: []
      }
      nutrition_records: {
        Row: {
          calories: number | null
          created_at: string
          date: string
          id: string
          protein: number | null
          target_calories: number | null
          target_protein: number | null
          target_water: number | null
          user_id: string
          water: number | null
        }
        Insert: {
          calories?: number | null
          created_at?: string
          date: string
          id?: string
          protein?: number | null
          target_calories?: number | null
          target_protein?: number | null
          target_water?: number | null
          user_id: string
          water?: number | null
        }
        Update: {
          calories?: number | null
          created_at?: string
          date?: string
          id?: string
          protein?: number | null
          target_calories?: number | null
          target_protein?: number | null
          target_water?: number | null
          user_id?: string
          water?: number | null
        }
        Relationships: []
      }
      profiles: {
        Row: {
          age: number | null
          body_fat: number | null
          calories: number | null
          created_at: string
          height: number | null
          id: string
          name: string | null
          protein: number | null
          sleep: number | null
          training_days: number | null
          updated_at: string
          weight: number | null
        }
        Insert: {
          age?: number | null
          body_fat?: number | null
          calories?: number | null
          created_at?: string
          height?: number | null
          id: string
          name?: string | null
          protein?: number | null
          sleep?: number | null
          training_days?: number | null
          updated_at?: string
          weight?: number | null
        }
        Update: {
          age?: number | null
          body_fat?: number | null
          calories?: number | null
          created_at?: string
          height?: number | null
          id?: string
          name?: string | null
          protein?: number | null
          sleep?: number | null
          training_days?: number | null
          updated_at?: string
          weight?: number | null
        }
        Relationships: []
      }
      progress_images: {
        Row: {
          created_at: string
          date: string
          id: string
          image_url: string
          is_favorite: boolean | null
          notes: string | null
          tags: string[] | null
          time: string
          user_id: string
        }
        Insert: {
          created_at?: string
          date: string
          id?: string
          image_url: string
          is_favorite?: boolean | null
          notes?: string | null
          tags?: string[] | null
          time: string
          user_id: string
        }
        Update: {
          created_at?: string
          date?: string
          id?: string
          image_url?: string
          is_favorite?: boolean | null
          notes?: string | null
          tags?: string[] | null
          time?: string
          user_id?: string
        }
        Relationships: []
      }
      strength_records: {
        Row: {
          created_at: string
          date: string
          exercise: string
          id: string
          notes: string | null
          reps: number
          sets: number
          user_id: string
          weight: number
        }
        Insert: {
          created_at?: string
          date: string
          exercise: string
          id?: string
          notes?: string | null
          reps: number
          sets: number
          user_id: string
          weight: number
        }
        Update: {
          created_at?: string
          date?: string
          exercise?: string
          id?: string
          notes?: string | null
          reps?: number
          sets?: number
          user_id?: string
          weight?: number
        }
        Relationships: []
      }
      supplement_completions: {
        Row: {
          created_at: string
          date: string
          id: string
          supplement_id: string
          taken: boolean | null
          user_id: string
        }
        Insert: {
          created_at?: string
          date: string
          id?: string
          supplement_id: string
          taken?: boolean | null
          user_id: string
        }
        Update: {
          created_at?: string
          date?: string
          id?: string
          supplement_id?: string
          taken?: boolean | null
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "supplement_completions_supplement_id_fkey"
            columns: ["supplement_id"]
            isOneToOne: false
            referencedRelation: "supplements"
            referencedColumns: ["id"]
          },
        ]
      }
      supplements: {
        Row: {
          category: string
          color: string
          created_at: string
          dosage: string
          icon: string
          id: string
          name: string
          timing: string
          user_id: string
        }
        Insert: {
          category: string
          color: string
          created_at?: string
          dosage: string
          icon: string
          id?: string
          name: string
          timing: string
          user_id: string
        }
        Update: {
          category?: string
          color?: string
          created_at?: string
          dosage?: string
          icon?: string
          id?: string
          name?: string
          timing?: string
          user_id?: string
        }
        Relationships: []
      }
      workout_plans: {
        Row: {
          created_at: string
          days: Json
          id: string
          nutrition: Json
          split_name: string
          supplements: string[] | null
          updated_at: string
          user_id: string
        }
        Insert: {
          created_at?: string
          days: Json
          id?: string
          nutrition: Json
          split_name: string
          supplements?: string[] | null
          updated_at?: string
          user_id: string
        }
        Update: {
          created_at?: string
          days?: Json
          id?: string
          nutrition?: Json
          split_name?: string
          supplements?: string[] | null
          updated_at?: string
          user_id?: string
        }
        Relationships: []
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

type DefaultSchema = Database[Extract<keyof Database, "public">]

export type Tables<
  DefaultSchemaTableNameOrOptions extends
    | keyof (DefaultSchema["Tables"] & DefaultSchema["Views"])
    | { schema: keyof Database },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof Database
  }
    ? keyof (Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
        Database[DefaultSchemaTableNameOrOptions["schema"]]["Views"])
    : never = never,
> = DefaultSchemaTableNameOrOptions extends { schema: keyof Database }
  ? (Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
      Database[DefaultSchemaTableNameOrOptions["schema"]]["Views"])[TableName] extends {
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
    | { schema: keyof Database },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof Database
  }
    ? keyof Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends { schema: keyof Database }
  ? Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
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
    | { schema: keyof Database },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof Database
  }
    ? keyof Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends { schema: keyof Database }
  ? Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
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
    | { schema: keyof Database },
  EnumName extends DefaultSchemaEnumNameOrOptions extends {
    schema: keyof Database
  }
    ? keyof Database[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"]
    : never = never,
> = DefaultSchemaEnumNameOrOptions extends { schema: keyof Database }
  ? Database[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"][EnumName]
  : DefaultSchemaEnumNameOrOptions extends keyof DefaultSchema["Enums"]
    ? DefaultSchema["Enums"][DefaultSchemaEnumNameOrOptions]
    : never

export type CompositeTypes<
  PublicCompositeTypeNameOrOptions extends
    | keyof DefaultSchema["CompositeTypes"]
    | { schema: keyof Database },
  CompositeTypeName extends PublicCompositeTypeNameOrOptions extends {
    schema: keyof Database
  }
    ? keyof Database[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"]
    : never = never,
> = PublicCompositeTypeNameOrOptions extends { schema: keyof Database }
  ? Database[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"][CompositeTypeName]
  : PublicCompositeTypeNameOrOptions extends keyof DefaultSchema["CompositeTypes"]
    ? DefaultSchema["CompositeTypes"][PublicCompositeTypeNameOrOptions]
    : never

export const Constants = {
  public: {
    Enums: {},
  },
} as const
