export type Json = string | number | boolean | null | { [key: string]: Json | undefined } | Json[];

export type Database = {
  // Allows to automatically instantiate createClient with right options
  // instead of createClient<Database, { PostgrestVersion: 'XX' }>(URL, KEY)
  __InternalSupabase: {
    PostgrestVersion: "14.5";
  };
  graphql_public: {
    Tables: {
      [_ in never]: never;
    };
    Views: {
      [_ in never]: never;
    };
    Functions: {
      graphql: {
        Args: {
          extensions?: Json;
          operationName?: string;
          query?: string;
          variables?: Json;
        };
        Returns: Json;
      };
    };
    Enums: {
      [_ in never]: never;
    };
    CompositeTypes: {
      [_ in never]: never;
    };
  };
  public: {
    Tables: {
      alerts: {
        Row: {
          alert_date: string;
          created_at: string;
          id: string;
          is_resolved: boolean;
          level: Database["public"]["Enums"]["alert_level"];
          owner_id: string;
          project_id: string;
          resolved_at: string | null;
          title: string;
          updated_at: string;
        };
        Insert: {
          alert_date?: string;
          created_at?: string;
          id?: string;
          is_resolved?: boolean;
          level?: Database["public"]["Enums"]["alert_level"];
          owner_id: string;
          project_id: string;
          resolved_at?: string | null;
          title: string;
          updated_at?: string;
        };
        Update: {
          alert_date?: string;
          created_at?: string;
          id?: string;
          is_resolved?: boolean;
          level?: Database["public"]["Enums"]["alert_level"];
          owner_id?: string;
          project_id?: string;
          resolved_at?: string | null;
          title?: string;
          updated_at?: string;
        };
        Relationships: [
          {
            foreignKeyName: "alerts_project_id_fkey";
            columns: ["project_id"];
            isOneToOne: false;
            referencedRelation: "projects";
            referencedColumns: ["id"];
          },
        ];
      };
      artisans: {
        Row: {
          created_at: string;
          email: string;
          id: string;
          name: string;
          notes: string;
          owner_id: string;
          phone: string;
          project_id: string;
          status: Database["public"]["Enums"]["artisan_status"];
          trade: string;
          trust_rating: number;
          updated_at: string;
        };
        Insert: {
          created_at?: string;
          email?: string;
          id?: string;
          name: string;
          notes?: string;
          owner_id: string;
          phone?: string;
          project_id: string;
          status?: Database["public"]["Enums"]["artisan_status"];
          trade?: string;
          trust_rating?: number;
          updated_at?: string;
        };
        Update: {
          created_at?: string;
          email?: string;
          id?: string;
          name?: string;
          notes?: string;
          owner_id?: string;
          phone?: string;
          project_id?: string;
          status?: Database["public"]["Enums"]["artisan_status"];
          trade?: string;
          trust_rating?: number;
          updated_at?: string;
        };
        Relationships: [
          {
            foreignKeyName: "artisans_project_id_fkey";
            columns: ["project_id"];
            isOneToOne: false;
            referencedRelation: "projects";
            referencedColumns: ["id"];
          },
        ];
      };
      decision_documents: {
        Row: {
          decision_id: string;
          document_id: string;
          owner_id: string;
        };
        Insert: {
          decision_id: string;
          document_id: string;
          owner_id: string;
        };
        Update: {
          decision_id?: string;
          document_id?: string;
          owner_id?: string;
        };
        Relationships: [
          {
            foreignKeyName: "decision_documents_decision_id_fkey";
            columns: ["decision_id"];
            isOneToOne: false;
            referencedRelation: "decisions";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "decision_documents_document_id_fkey";
            columns: ["document_id"];
            isOneToOne: false;
            referencedRelation: "documents";
            referencedColumns: ["id"];
          },
        ];
      };
      decisions: {
        Row: {
          budget_impact_cents: number | null;
          context: string;
          created_at: string;
          decision_date: string | null;
          id: string;
          notes: string | null;
          options: string[];
          owner_id: string;
          planning_impact_days: number | null;
          priority: Database["public"]["Enums"]["priority"];
          project_id: string;
          selected_option: string | null;
          status: Database["public"]["Enums"]["decision_status"];
          title: string;
          updated_at: string;
        };
        Insert: {
          budget_impact_cents?: number | null;
          context?: string;
          created_at?: string;
          decision_date?: string | null;
          id?: string;
          notes?: string | null;
          options?: string[];
          owner_id: string;
          planning_impact_days?: number | null;
          priority?: Database["public"]["Enums"]["priority"];
          project_id: string;
          selected_option?: string | null;
          status?: Database["public"]["Enums"]["decision_status"];
          title: string;
          updated_at?: string;
        };
        Update: {
          budget_impact_cents?: number | null;
          context?: string;
          created_at?: string;
          decision_date?: string | null;
          id?: string;
          notes?: string | null;
          options?: string[];
          owner_id?: string;
          planning_impact_days?: number | null;
          priority?: Database["public"]["Enums"]["priority"];
          project_id?: string;
          selected_option?: string | null;
          status?: Database["public"]["Enums"]["decision_status"];
          title?: string;
          updated_at?: string;
        };
        Relationships: [
          {
            foreignKeyName: "decisions_project_id_fkey";
            columns: ["project_id"];
            isOneToOne: false;
            referencedRelation: "projects";
            referencedColumns: ["id"];
          },
        ];
      };
      documents: {
        Row: {
          category: Database["public"]["Enums"]["document_category"];
          created_at: string;
          file_size_bytes: number | null;
          id: string;
          lot_id: string | null;
          mime_type: string | null;
          name: string;
          owner_id: string;
          project_id: string;
          quote_id: string | null;
          storage_bucket: string;
          storage_path: string;
          updated_at: string;
          uploaded_at: string;
        };
        Insert: {
          category: Database["public"]["Enums"]["document_category"];
          created_at?: string;
          file_size_bytes?: number | null;
          id?: string;
          lot_id?: string | null;
          mime_type?: string | null;
          name: string;
          owner_id: string;
          project_id: string;
          quote_id?: string | null;
          storage_bucket: string;
          storage_path: string;
          updated_at?: string;
          uploaded_at?: string;
        };
        Update: {
          category?: Database["public"]["Enums"]["document_category"];
          created_at?: string;
          file_size_bytes?: number | null;
          id?: string;
          lot_id?: string | null;
          mime_type?: string | null;
          name?: string;
          owner_id?: string;
          project_id?: string;
          quote_id?: string | null;
          storage_bucket?: string;
          storage_path?: string;
          updated_at?: string;
          uploaded_at?: string;
        };
        Relationships: [
          {
            foreignKeyName: "documents_lot_id_fkey";
            columns: ["lot_id"];
            isOneToOne: false;
            referencedRelation: "lots";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "documents_project_id_fkey";
            columns: ["project_id"];
            isOneToOne: false;
            referencedRelation: "projects";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "documents_quote_id_fkey";
            columns: ["quote_id"];
            isOneToOne: false;
            referencedRelation: "quotes";
            referencedColumns: ["id"];
          },
        ];
      };
      lots: {
        Row: {
          artisan_id: string | null;
          budget_comment: string | null;
          budget_optimistic_cents: number | null;
          budget_pessimistic_cents: number | null;
          budget_planned_cents: number;
          budget_retained_cents: number | null;
          budget_risk_level: Database["public"]["Enums"]["budget_risk_level"];
          created_at: string;
          id: string;
          name: string;
          notes: string;
          owner_id: string;
          priority: Database["public"]["Enums"]["priority"];
          project_id: string;
          real_cost_cents: number | null;
          sort_order: number;
          status: Database["public"]["Enums"]["lot_status"];
          updated_at: string;
        };
        Insert: {
          artisan_id?: string | null;
          budget_comment?: string | null;
          budget_optimistic_cents?: number | null;
          budget_pessimistic_cents?: number | null;
          budget_planned_cents?: number;
          budget_retained_cents?: number | null;
          budget_risk_level?: Database["public"]["Enums"]["budget_risk_level"];
          created_at?: string;
          id?: string;
          name: string;
          notes?: string;
          owner_id: string;
          priority?: Database["public"]["Enums"]["priority"];
          project_id: string;
          real_cost_cents?: number | null;
          sort_order?: number;
          status?: Database["public"]["Enums"]["lot_status"];
          updated_at?: string;
        };
        Update: {
          artisan_id?: string | null;
          budget_comment?: string | null;
          budget_optimistic_cents?: number | null;
          budget_pessimistic_cents?: number | null;
          budget_planned_cents?: number;
          budget_retained_cents?: number | null;
          budget_risk_level?: Database["public"]["Enums"]["budget_risk_level"];
          created_at?: string;
          id?: string;
          name?: string;
          notes?: string;
          owner_id?: string;
          priority?: Database["public"]["Enums"]["priority"];
          project_id?: string;
          real_cost_cents?: number | null;
          sort_order?: number;
          status?: Database["public"]["Enums"]["lot_status"];
          updated_at?: string;
        };
        Relationships: [
          {
            foreignKeyName: "lots_artisan_id_fkey";
            columns: ["artisan_id"];
            isOneToOne: false;
            referencedRelation: "artisans";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "lots_project_id_fkey";
            columns: ["project_id"];
            isOneToOne: false;
            referencedRelation: "projects";
            referencedColumns: ["id"];
          },
        ];
      };
      notes: {
        Row: {
          author_name: string;
          body: string;
          created_at: string;
          id: string;
          note_date: string;
          note_type: Database["public"]["Enums"]["note_type"];
          owner_id: string;
          project_id: string;
          title: string;
          updated_at: string;
        };
        Insert: {
          author_name?: string;
          body?: string;
          created_at?: string;
          id?: string;
          note_date?: string;
          note_type?: Database["public"]["Enums"]["note_type"];
          owner_id: string;
          project_id: string;
          title: string;
          updated_at?: string;
        };
        Update: {
          author_name?: string;
          body?: string;
          created_at?: string;
          id?: string;
          note_date?: string;
          note_type?: Database["public"]["Enums"]["note_type"];
          owner_id?: string;
          project_id?: string;
          title?: string;
          updated_at?: string;
        };
        Relationships: [
          {
            foreignKeyName: "notes_project_id_fkey";
            columns: ["project_id"];
            isOneToOne: false;
            referencedRelation: "projects";
            referencedColumns: ["id"];
          },
        ];
      };
      profiles: {
        Row: {
          avatar_url: string | null;
          created_at: string;
          email: string | null;
          full_name: string | null;
          id: string;
          updated_at: string;
        };
        Insert: {
          avatar_url?: string | null;
          created_at?: string;
          email?: string | null;
          full_name?: string | null;
          id: string;
          updated_at?: string;
        };
        Update: {
          avatar_url?: string | null;
          created_at?: string;
          email?: string | null;
          full_name?: string | null;
          id?: string;
          updated_at?: string;
        };
        Relationships: [];
      };
      project_members: {
        Row: {
          accepted_at: string | null;
          id: string;
          invited_at: string;
          project_id: string;
          role: Database["public"]["Enums"]["member_role"];
          user_id: string;
        };
        Insert: {
          accepted_at?: string | null;
          id?: string;
          invited_at?: string;
          project_id: string;
          role?: Database["public"]["Enums"]["member_role"];
          user_id: string;
        };
        Update: {
          accepted_at?: string | null;
          id?: string;
          invited_at?: string;
          project_id?: string;
          role?: Database["public"]["Enums"]["member_role"];
          user_id?: string;
        };
        Relationships: [
          {
            foreignKeyName: "project_members_project_id_fkey";
            columns: ["project_id"];
            isOneToOne: false;
            referencedRelation: "projects";
            referencedColumns: ["id"];
          },
        ];
      };
      projects: {
        Row: {
          budget_target_cents: number;
          created_at: string;
          id: string;
          name: string;
          owner_id: string;
          priorities: string[];
          project_type: string;
          start_date: string | null;
          status: Database["public"]["Enums"]["project_status"];
          surface_m2: number | null;
          updated_at: string;
        };
        Insert: {
          budget_target_cents?: number;
          created_at?: string;
          id?: string;
          name: string;
          owner_id: string;
          priorities?: string[];
          project_type?: string;
          start_date?: string | null;
          status?: Database["public"]["Enums"]["project_status"];
          surface_m2?: number | null;
          updated_at?: string;
        };
        Update: {
          budget_target_cents?: number;
          created_at?: string;
          id?: string;
          name?: string;
          owner_id?: string;
          priorities?: string[];
          project_type?: string;
          start_date?: string | null;
          status?: Database["public"]["Enums"]["project_status"];
          surface_m2?: number | null;
          updated_at?: string;
        };
        Relationships: [];
      };
      quotes: {
        Row: {
          amount_cents: number;
          artisan_id: string | null;
          artisan_name: string;
          comment: string;
          created_at: string;
          id: string;
          is_retained: boolean;
          lot_id: string;
          owner_id: string;
          project_id: string;
          quote_date: string | null;
          storage_path: string | null;
          updated_at: string;
        };
        Insert: {
          amount_cents: number;
          artisan_id?: string | null;
          artisan_name?: string;
          comment?: string;
          created_at?: string;
          id?: string;
          is_retained?: boolean;
          lot_id: string;
          owner_id: string;
          project_id: string;
          quote_date?: string | null;
          storage_path?: string | null;
          updated_at?: string;
        };
        Update: {
          amount_cents?: number;
          artisan_id?: string | null;
          artisan_name?: string;
          comment?: string;
          created_at?: string;
          id?: string;
          is_retained?: boolean;
          lot_id?: string;
          owner_id?: string;
          project_id?: string;
          quote_date?: string | null;
          storage_path?: string | null;
          updated_at?: string;
        };
        Relationships: [
          {
            foreignKeyName: "quotes_artisan_id_fkey";
            columns: ["artisan_id"];
            isOneToOne: false;
            referencedRelation: "artisans";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "quotes_lot_id_fkey";
            columns: ["lot_id"];
            isOneToOne: false;
            referencedRelation: "lots";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "quotes_project_id_fkey";
            columns: ["project_id"];
            isOneToOne: false;
            referencedRelation: "projects";
            referencedColumns: ["id"];
          },
        ];
      };
      tasks: {
        Row: {
          assignee_name: string;
          created_at: string;
          due_date: string | null;
          id: string;
          lot_id: string | null;
          notes: string;
          owner_id: string;
          priority: Database["public"]["Enums"]["priority"];
          project_id: string;
          status: Database["public"]["Enums"]["task_status"];
          title: string;
          updated_at: string;
        };
        Insert: {
          assignee_name?: string;
          created_at?: string;
          due_date?: string | null;
          id?: string;
          lot_id?: string | null;
          notes?: string;
          owner_id: string;
          priority?: Database["public"]["Enums"]["priority"];
          project_id: string;
          status?: Database["public"]["Enums"]["task_status"];
          title: string;
          updated_at?: string;
        };
        Update: {
          assignee_name?: string;
          created_at?: string;
          due_date?: string | null;
          id?: string;
          lot_id?: string | null;
          notes?: string;
          owner_id?: string;
          priority?: Database["public"]["Enums"]["priority"];
          project_id?: string;
          status?: Database["public"]["Enums"]["task_status"];
          title?: string;
          updated_at?: string;
        };
        Relationships: [
          {
            foreignKeyName: "tasks_lot_id_fkey";
            columns: ["lot_id"];
            isOneToOne: false;
            referencedRelation: "lots";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "tasks_project_id_fkey";
            columns: ["project_id"];
            isOneToOne: false;
            referencedRelation: "projects";
            referencedColumns: ["id"];
          },
        ];
      };
    };
    Views: {
      [_ in never]: never;
    };
    Functions: {
      [_ in never]: never;
    };
    Enums: {
      alert_level: "info" | "warning" | "critical";
      artisan_status: "a_contacter" | "contacte" | "devis_recu" | "retenu" | "ecarte";
      budget_risk_level: "faible" | "moyen" | "eleve" | "critique";
      decision_status: "a_trancher" | "validee" | "abandonnee";
      document_category:
        | "plans"
        | "devis"
        | "factures"
        | "photos"
        | "declaration"
        | "etude_sol"
        | "notices"
        | "garanties";
      lot_status:
        | "a_etudier"
        | "devis_demande"
        | "devis_recu"
        | "valide"
        | "en_cours"
        | "termine"
        | "bloque";
      member_role: "owner" | "editor" | "viewer";
      note_type: "decision" | "note" | "alerte";
      priority: "basse" | "moyenne" | "haute" | "critique";
      project_status: "etude" | "travaux" | "termine" | "suspendu";
      task_status: "a_faire" | "en_cours" | "termine" | "bloque";
    };
    CompositeTypes: {
      [_ in never]: never;
    };
  };
};

type DatabaseWithoutInternals = Omit<Database, "__InternalSupabase">;

type DefaultSchema = DatabaseWithoutInternals[Extract<keyof Database, "public">];

export type Tables<
  DefaultSchemaTableNameOrOptions extends
    | keyof (DefaultSchema["Tables"] & DefaultSchema["Views"])
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals;
  }
    ? keyof (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
        DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals;
}
  ? (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
      DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])[TableName] extends {
      Row: infer R;
    }
    ? R
    : never
  : DefaultSchemaTableNameOrOptions extends keyof (DefaultSchema["Tables"] & DefaultSchema["Views"])
    ? (DefaultSchema["Tables"] & DefaultSchema["Views"])[DefaultSchemaTableNameOrOptions] extends {
        Row: infer R;
      }
      ? R
      : never
    : never;

export type TablesInsert<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals;
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals;
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Insert: infer I;
    }
    ? I
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Insert: infer I;
      }
      ? I
      : never
    : never;

export type TablesUpdate<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals;
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals;
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Update: infer U;
    }
    ? U
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Update: infer U;
      }
      ? U
      : never
    : never;

export type Enums<
  DefaultSchemaEnumNameOrOptions extends
    | keyof DefaultSchema["Enums"]
    | { schema: keyof DatabaseWithoutInternals },
  EnumName extends DefaultSchemaEnumNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals;
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"]
    : never = never,
> = DefaultSchemaEnumNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals;
}
  ? DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"][EnumName]
  : DefaultSchemaEnumNameOrOptions extends keyof DefaultSchema["Enums"]
    ? DefaultSchema["Enums"][DefaultSchemaEnumNameOrOptions]
    : never;

export type CompositeTypes<
  PublicCompositeTypeNameOrOptions extends
    | keyof DefaultSchema["CompositeTypes"]
    | { schema: keyof DatabaseWithoutInternals },
  CompositeTypeName extends PublicCompositeTypeNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals;
  }
    ? keyof DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"]
    : never = never,
> = PublicCompositeTypeNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals;
}
  ? DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"][CompositeTypeName]
  : PublicCompositeTypeNameOrOptions extends keyof DefaultSchema["CompositeTypes"]
    ? DefaultSchema["CompositeTypes"][PublicCompositeTypeNameOrOptions]
    : never;

export const Constants = {
  graphql_public: {
    Enums: {},
  },
  public: {
    Enums: {
      alert_level: ["info", "warning", "critical"],
      artisan_status: ["a_contacter", "contacte", "devis_recu", "retenu", "ecarte"],
      budget_risk_level: ["faible", "moyen", "eleve", "critique"],
      decision_status: ["a_trancher", "validee", "abandonnee"],
      document_category: [
        "plans",
        "devis",
        "factures",
        "photos",
        "declaration",
        "etude_sol",
        "notices",
        "garanties",
      ],
      lot_status: [
        "a_etudier",
        "devis_demande",
        "devis_recu",
        "valide",
        "en_cours",
        "termine",
        "bloque",
      ],
      member_role: ["owner", "editor", "viewer"],
      note_type: ["decision", "note", "alerte"],
      priority: ["basse", "moyenne", "haute", "critique"],
      project_status: ["etude", "travaux", "termine", "suspendu"],
      task_status: ["a_faire", "en_cours", "termine", "bloque"],
    },
  },
} as const;
