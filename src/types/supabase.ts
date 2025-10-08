export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[];

export interface Database {
  public: {
    Tables: {
      profiles: {
        Row: {
          id: string;
          user_id: string;
          type: "donor" | "charity";
          created_at: string;
        };
        Insert: {
          id?: string;
          user_id: string;
          type: "donor" | "charity";
          created_at?: string;
        };
        Update: {
          id?: string;
          user_id?: string;
          type?: "donor" | "charity";
          created_at?: string;
        };
      };
      volunteer_hours: {
        Row: {
          id: string;
          volunteer_id: string;
          charity_id: string;
          hours: number;
          date_performed: string;
          description: string;
          status: "pending" | "approved" | "rejected";
          created_at: string;
          updated_at: string;
          volunteer?: {
            id: string;
            user_id: string;
          };
        };
        Insert: {
          id?: string;
          volunteer_id: string;
          charity_id: string;
          hours: number;
          date_performed: string;
          description: string;
          status?: "pending" | "approved" | "rejected";
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          volunteer_id?: string;
          charity_id?: string;
          hours?: number;
          date_performed?: string;
          description?: string;
          status?: "pending" | "approved" | "rejected";
          created_at?: string;
          updated_at?: string;
        };
      };
      volunteer_opportunities: {
        Row: {
          id: string;
          charity_id: string;
          title: string;
          description: string;
          skills: string[];
          commitment: string;
          location: string;
          type: string;
          work_language: string;
          status: "active" | "inactive" | "completed";
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          charity_id: string;
          title: string;
          description: string;
          skills: string[];
          commitment: string;
          location: string;
          type: string;
          work_language: string;
          status?: "active" | "inactive" | "completed";
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          charity_id?: string;
          title?: string;
          description?: string;
          skills?: string[];
          commitment?: string;
          location?: string;
          type?: string;
          work_language?: string;
          status?: "active" | "inactive" | "completed";
          created_at?: string;
          updated_at?: string;
        };
      };
      volunteer_applications: {
        Row: {
          id: string;
          opportunity_id: string;
          applicant_id: string;
          charity_id: string;
          full_name: string;
          email: string;
          phone?: string;
          message?: string;
          status: "pending" | "approved" | "rejected";
          applied_at: string;
          reviewed_at?: string;
          reviewed_by?: string;
          opportunity?: {
            id: string;
            title: string;
          };
        };
        Insert: {
          id?: string;
          opportunity_id: string;
          applicant_id: string;
          charity_id: string;
          full_name: string;
          email: string;
          phone?: string;
          message?: string;
          status?: "pending" | "approved" | "rejected";
          applied_at?: string;
          reviewed_at?: string;
          reviewed_by?: string;
        };
        Update: {
          id?: string;
          opportunity_id?: string;
          applicant_id?: string;
          charity_id?: string;
          full_name?: string;
          email?: string;
          phone?: string;
          message?: string;
          status?: "pending" | "approved" | "rejected";
          applied_at?: string;
          reviewed_at?: string;
          reviewed_by?: string;
        };
      };
      volunteer_verifications: {
        Row: {
          id: string;
          volunteer_id: string;
          charity_id: string;
          volunteer_hours_id: string;
          verification_method: string;
          verified_at: string;
          verified_by?: string;
          nft_token_id?: number;
          blockchain_tx_hash?: string;
        };
        Insert: {
          id?: string;
          volunteer_id: string;
          charity_id: string;
          volunteer_hours_id: string;
          verification_method: string;
          verified_at?: string;
          verified_by?: string;
          nft_token_id?: number;
          blockchain_tx_hash?: string;
        };
        Update: {
          id?: string;
          volunteer_id?: string;
          charity_id?: string;
          volunteer_hours_id?: string;
          verification_method?: string;
          verified_at?: string;
          verified_by?: string;
          nft_token_id?: number;
          blockchain_tx_hash?: string;
        };
      };
    };
  };
}
