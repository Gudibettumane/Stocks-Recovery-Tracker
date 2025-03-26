import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

export const supabase = createClient(supabaseUrl, supabaseKey);

// Stock data functions
export const fetchStockRecoveryMetrics = async () => {
  // Implement pagination within this existing function
  let allData = [];
  let page = 0;
  const pageSize = 1000;
  let totalCount = 0;
  
  try {
    // First request to get total count and first page
    const firstPageResult = await supabase
      .from('stock_recovery_metrics')
      .select('*', { count: 'exact' })
      .range(0, pageSize - 1);
    
    if (firstPageResult.error) {
      throw firstPageResult.error;
    }
    
    totalCount = firstPageResult.count || 0;
    allData = firstPageResult.data || [];

    
    // Fetch additional pages if needed
    page = 1;
    while (allData.length < totalCount && page < 10) { // Limit to 10 pages as a safety measure
      const nextPageResult = await supabase
        .from('stock_recovery_metrics')
        .select('*')
        .range(page * pageSize, (page + 1) * pageSize - 1);
      
      if (nextPageResult.error) {
        throw nextPageResult.error;
      }
      
      if (nextPageResult.data && nextPageResult.data.length > 0) {
        console.log(`Page ${page}: Retrieved ${nextPageResult.data.length} records`);
        allData = [...allData, ...nextPageResult.data];
      } else {
        // No more data
        break;
      }
      
      page++;
    }
    
    console.log('Total records fetched:', allData.length);
    return allData;
  } catch (error) {
    console.error('Error fetching recovery metrics:', error);
    throw error;
  }
};

// Keep other functions unchanged
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