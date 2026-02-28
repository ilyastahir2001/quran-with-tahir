import { createClient } from '@supabase/supabase-js';

const SUPABASE_URL = import.meta.env.VITE_SUPABASE_URL;
const SUPABASE_PUBLISHABLE_KEY = import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY;

// Create a function that takes the Clerk token to initialize a Supabase client
export const createSupabaseClient = (clerkToken: string | null) => {
  return createClient(SUPABASE_URL, SUPABASE_PUBLISHABLE_KEY, {
    global: {
      // Pass the Clerk JWT as the Authorization header
      headers: {
        Authorization: `Bearer ${clerkToken}`,
      },
    },
    auth: {
      // We do not need Supabase's native auth to persist sessions, Clerk handles this
      persistSession: false,
    },
  });
};
