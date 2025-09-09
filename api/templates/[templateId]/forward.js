import { createClient } from '@supabase/supabase-js';

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const { templateId } = req.query;
    
    // Initialize Supabase client
    const supabase = createClient(
      process.env.SUPABASE_URL,
      process.env.SUPABASE_KEY
    );
    
    const { error } = await supabase
      .from('content_templates')
      .update({ 
        status: 'forwarded',
        updated_at: new Date().toISOString()
      })
      .eq('template_id', templateId);
      
    if (error) throw error;
    
    res.json({ 
      message: 'Template forwarded to dashboard successfully',
      templateId 
    });
  } catch (error) {
    console.error('Forward template error:', error);
    res.status(500).json({ error: error.message });
  }
}
