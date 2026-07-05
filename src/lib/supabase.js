import { createClient } from "@supabase/supabase-js";

const supabaseUrl = import.meta.env.VITE_SUPABASE_API_URL;
const supabaseApi = import.meta.env.VITE_SUPABASE_API_KEY;
if (!supabaseUrl || !supabaseApi) {
  throw new Error(
    "Missing Supabase environment variables. Check your .env file.",
  );
}

const supabase = createClient(supabaseUrl, supabaseApi, {
  auth: {
    persistSession: true,
    autoRefreshToken: true,
  },
  realtime: {
    params: {
      eventsPerSecond: 10,
    },
  },
});

export default supabase;
