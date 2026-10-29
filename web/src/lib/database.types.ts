/**
 * Supabase database types, hand-written to mirror the schema in
 * `supabase/schema.sql`. Regenerate with `npm run gen:types` once the project
 * URL is configured (uses the Supabase CLI) if the schema drifts.
 */

export type Json = string | number | boolean | null | { [key: string]: Json } | Json[];

export type UserRole = 'client' | 'admin';
export type ReportStatus = 'processing' | 'ready' | 'failed';
export type ScanSource = 'nessus' | 'nmap' | 'json';
export type PlanId = 'trial' | 'starter' | 'business' | 'enterprise';
export type AuditStatus = 'draft' | 'completed';

export interface Database {
  public: {
    Tables: {
      organizations: {
        Row: {
          id: string;
          name: string;
          slug: string;
          created_at: string;
          plan: PlanId;
          plan_renews_at: string | null;
        };
        Insert: {
          id?: string;
          name: string;
          slug: string;
          created_at?: string;
          plan?: PlanId;
          plan_renews_at?: string | null;
        };
        Update: {
          id?: string;
          name?: string;
          slug?: string;
          created_at?: string;
          plan?: PlanId;
          plan_renews_at?: string | null;
        };
        Relationships: [];
      };
      profiles: {
        Row: {
          id: string;
          organization_id: string | null;
          email: string | null;
          full_name: string;
          role: UserRole;
          nid_verified: boolean;
          nid_verified_at: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id: string;
          organization_id?: string | null;
          email?: string | null;
          full_name?: string;
          role?: UserRole;
          nid_verified?: boolean;
          nid_verified_at?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          organization_id?: string | null;
          email?: string | null;
          full_name?: string;
          role?: UserRole;
          nid_verified?: boolean;
          nid_verified_at?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Relationships: [
          {
            foreignKeyName: 'profiles_organization_id_fkey';
            columns: ['organization_id'];
            isOneToOne: false;
            referencedRelation: 'organizations';
            referencedColumns: ['id'];
          },
        ];
      };
      reports: {
        Row: {
          id: string;
          organization_id: string;
          title: string;
          source: ScanSource;
          original_filename: string | null;
          status: ReportStatus;
          risk_score: number | null;
          severity_counts: Json;
          asset_count: number;
          findings: Json;
          ai_report: Json | null;
          ai_model: string | null;
          error: string | null;
          scanned_at: string | null;
          created_by: string | null;
          created_at: string;
          completed_at: string | null;
        };
        Insert: {
          id?: string;
          organization_id: string;
          title: string;
          source: ScanSource;
          original_filename?: string | null;
          status?: ReportStatus;
          risk_score?: number | null;
          severity_counts?: Json;
          asset_count?: number;
          findings?: Json;
          ai_report?: Json | null;
          ai_model?: string | null;
          error?: string | null;
          scanned_at?: string | null;
          created_by?: string | null;
          created_at?: string;
          completed_at?: string | null;
        };
        Update: {
          id?: string;
          organization_id?: string;
          title?: string;
          source?: ScanSource;
          original_filename?: string | null;
          status?: ReportStatus;
          risk_score?: number | null;
          severity_counts?: Json;
          asset_count?: number;
          findings?: Json;
          ai_report?: Json | null;
          ai_model?: string | null;
          error?: string | null;
          scanned_at?: string | null;
          created_by?: string | null;
          created_at?: string;
          completed_at?: string | null;
        };
        Relationships: [
          {
            foreignKeyName: 'reports_organization_id_fkey';
            columns: ['organization_id'];
            isOneToOne: false;
            referencedRelation: 'organizations';
            referencedColumns: ['id'];
          },
        ];
      };
      report_assets: {
        Row: {
          id: number;
          report_id: string;
          organization_id: string;
          finding_id: string;
          label: string;
          host_enc: string;
          port: string | null;
          protocol: string | null;
          created_at: string;
        };
        Insert: {
          report_id: string;
          organization_id: string;
          finding_id: string;
          label: string;
          host_enc: string;
          port?: string | null;
          protocol?: string | null;
          created_at?: string;
        };
        Update: {
          label?: string;
          host_enc?: string;
          port?: string | null;
          protocol?: string | null;
        };
        Relationships: [];
      };
      audits: {
        Row: {
          id: string;
          organization_id: string;
          framework: string;
          title: string;
          answers: Json;
          score: number | null;
          status: AuditStatus;
          created_by: string | null;
          created_at: string;
          updated_at: string;
          completed_at: string | null;
        };
        Insert: {
          id?: string;
          organization_id: string;
          framework: string;
          title: string;
          answers?: Json;
          score?: number | null;
          status?: AuditStatus;
          created_by?: string | null;
          created_at?: string;
          updated_at?: string;
          completed_at?: string | null;
        };
        Update: {
          title?: string;
          answers?: Json;
          score?: number | null;
          status?: AuditStatus;
          updated_at?: string;
          completed_at?: string | null;
        };
        Relationships: [];
      };
      nid_verification_attempts: {
        Row: {
          id: number;
          user_id: string;
          succeeded: boolean;
          reason: string | null;
          created_at: string;
        };
        Insert: {
          user_id: string;
          succeeded: boolean;
          reason?: string | null;
          created_at?: string;
        };
        Update: {
          user_id?: string;
          succeeded?: boolean;
          reason?: string | null;
          created_at?: string;
        };
        Relationships: [];
      };
    };
    Views: Record<never, never>;
    Functions: {
      current_verified_org_id: {
        Args: Record<never, never>;
        Returns: string;
      };
    };
    Enums: {
      user_role: UserRole;
      report_status: ReportStatus;
      scan_source: ScanSource;
    };
    CompositeTypes: Record<never, never>;
  };
}
