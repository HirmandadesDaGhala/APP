
import { createClient } from '@supabase/supabase-js';

// Safe access to environment variables to prevent crashes in environments
// where import.meta.env might be undefined.
const getEnvVar = (key: string) => {
  try {
    return import.meta?.env?.[key] || '';
  } catch (e) {
    return '';
  }
};

const supabaseUrl = getEnvVar('VITE_SUPABASE_URL');
const supabaseKey = getEnvVar('VITE_SUPABASE_KEY');

// Only create the client if credentials exist. Otherwise export null.
// The App component handles the null state by switching to Demo Mode.
export const supabase = (supabaseUrl && supabaseKey) 
  ? createClient(supabaseUrl, supabaseKey)
  : null;
