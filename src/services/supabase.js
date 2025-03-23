import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

export const supabase = createClient(supabaseUrl, supabaseKey);

// Stock data functions
export const fetchStockRecoveryMetrics = async () => {
  const { data, error } = await supabase
    .from('stock_recovery_metrics')
    .select('*');
  
  if (error) {
    console.error('Error fetching recovery metrics:', error);
    throw error;
  }
  
  return data;
};

export const fetchStockData = async (symbol) => {
  const { data, error } = await supabase
    .from('stock_data')
    .select('*')
    .eq('Symbol', symbol)
    .order('Date', { ascending: true });
  
  if (error) {
    console.error(`Error fetching data for ${symbol}:`, error);
    throw error;
  }
  
  return data;
};

export const fetchStockMetadata = async () => {
  const { data, error } = await supabase
    .from('stock_metadata')
    .select('*');
  
  if (error) {
    console.error('Error fetching stock metadata:', error);
    throw error;
  }
  
  return data;
};