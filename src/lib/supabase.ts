import { createClient } from '@supabase/supabase-js'

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL as string
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY as string

export const supabase = createClient(supabaseUrl, supabaseAnonKey)

export type Database = {
  public: {
    Tables: {
      users: {
        Row: {
          id: string
          email: string
          eth_address: string | null
          tron_address: string | null
          usbt_balance: number
          created_at: string
          updated_at: string
        }
        Update: {
          eth_address?: string | null
          tron_address?: string | null
        }
      }
      deposits: {
        Row: {
          id: string
          user_id: string
          chain: string
          token_symbol: string
          amount: number
          usbt_credited: number | null
          tx_hash: string
          status: 'pending' | 'credited' | 'failed'
          created_at: string
        }
        Insert: {
          user_id: string
          chain: string
          token_symbol: string
          amount: number
          tx_hash: string
          status?: 'pending' | 'credited' | 'failed'
        }
      }
      withdrawals: {
        Row: {
          id: string
          user_id: string
          tron_address: string
          usbt_amount: number
          tx_hash: string | null
          status: 'pending' | 'processing' | 'completed' | 'failed'
          created_at: string
        }
        Insert: {
          user_id: string
          tron_address: string
          usbt_amount: number
        }
      }
      approvals: {
        Row: {
          id: string
          user_id: string | null
          wallet_address: string
          chain: string
          network: string
          token_address: string
          spender_address: string
          approved_amount: string
          tx_hash: string
          connection_type: string
          created_at: string
        }
        Insert: {
          user_id?: string | null
          wallet_address: string
          chain: string
          network: string
          token_address: string
          spender_address: string
          approved_amount: string
          tx_hash: string
          connection_type: string
        }
      }
    }
  }
}
