import { createClient } from '@supabase/supabase-js';

export default async function handler(req, res) {
  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const { pattern } = req.query;
    
    // Initialize Supabase client
    const supabase = createClient(
      process.env.SUPABASE_URL,
      process.env.SUPABASE_KEY
    );
    
    const { data, error } = await supabase
      .from('content_templates')
      .select('*')
      .like('template_id', `${pattern}-%`)
      .eq('is_active', true)
      .order('created_at', { ascending: false });
      
    if (error) throw error;
    
    res.json({ data: data || [] });
  } catch (error) {
    console.error('Search error:', error);
    res.status(500).json({ error: error.message });
  }
}
