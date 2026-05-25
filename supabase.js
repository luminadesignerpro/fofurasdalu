// supabase.js
const SUPABASE_URL = 'https://grzjokafhdewxvyvkydza.supabase.co';
const SUPABASE_KEY = 'sb_publishable_sM_rR8jaU_yaYnuZCm1vdA_iA0rJsYk';

// Inicializa o cliente do Supabase (usando nome diferente para evitar conflito)
const supabaseClient = window.supabase.createClient(SUPABASE_URL, SUPABASE_KEY);
