import { createClient } from '@supabase/supabase-js';

export default async function handler(req, res) {
  try {
    const supabase = createClient(
      process.env.SUPABASE_URL,
      process.env.SUPABASE_KEY
    );
    
    const { data, error } = await supabase
      .from('content_templates')
      .select('count')
      .limit(1);
    
    if (error) throw error;
    
    res.json({ 
      status: 'connected', 
      message: 'Supabase connection successful' 
    });
  } catch (error) {
    res.status(500).json({ 
      status: 'error', 
      message: error.message 
    });
  }
}
