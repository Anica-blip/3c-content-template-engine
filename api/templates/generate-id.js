import { createClient } from '@supabase/supabase-js';

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const { selections } = req.body;
    
    // Initialize Supabase client
    const supabase = createClient(
      process.env.SUPABASE_URL,
      process.env.SUPABASE_KEY
    );
    
    const theme = selections.theme?.code || 'XX';
    const audience = selections.audience?.code || 'XX';
    const media = selections.media?.code || 'XX';
    const template = selections.template_type?.code || 'XX';
    
    const pattern = `${theme}-${audience}-${media}-${template}`;
    
    // Find highest number for this pattern
    const { data, error } = await supabase
      .from('content_templates')
      .select('template_id')
      .like('template_id', `${pattern}-%`)
      .eq('is_active', true)
      .order('template_id', { ascending: false })
      .limit(1);
      
    if (error) throw error;
    
    let nextNumber = 1;
    if (data && data.length > 0) {
      const lastId = data[0].template_id;
      const lastNumber = parseInt(lastId.split('-').pop());
      nextNumber = lastNumber + 1;
    }
    
    const templateId = `${pattern}-${String(nextNumber).padStart(3, '0')}`;
    
    res.json({ templateId });
  } catch (error) {
    console.error('Generate ID error:', error);
    res.status(500).json({ error: error.message });
  }
}
